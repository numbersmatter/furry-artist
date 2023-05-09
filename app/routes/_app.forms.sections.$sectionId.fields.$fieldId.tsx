import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { addOptionToField, deleteField, deleteSelectOption, getFormSectionById, moveArrayElement, updateSectionDoc } from "~/server/database/forms.server";
import SectionPanel from "~/ui/Layout/SectionPanel";
import * as z from "zod"
import { useEffect, useRef, useState, } from "react";
import type { ZodIssue } from "zod";
import type {
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from "~/ui/Workboard/SortItem";

export async function action({ params, request }: ActionArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);
  const sectionDoc = await getFormSectionById({
    profileId: userDoc?.defaultProfile,
    sectionId: params.sectionId,
  })

  const fieldId = params.fieldId ?? "no-field-id";

  if (!sectionDoc) {
    return { error: true };
  }


  let formData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);

  const OptionSchema = z.object({
    label: z.string().min(2, "Label must be at least 2 characters"),
  })

  if (_action === "sort") {
    const { activeId, overId } = values;
    const options = sectionDoc.fieldData[fieldId].options ?? [];
    console.log(options)
    const startIndex = options.findIndex((option) => option.value === activeId);
    const endIndex = options.findIndex((option) => option.value === overId);
    console.log(startIndex, endIndex)
    const newOrder = moveArrayElement(options, startIndex, endIndex
      )
      console.log(newOrder)
    await updateSectionDoc({
      profileId: userDoc?.defaultProfile,
      sectionId: params.sectionId,
      updateData: {
        [`fieldData.${params.fieldId}.options`]: newOrder,
      }
    })
    return redirect(`/forms/sections/${params.sectionId}/fields/${params.fieldId}`)
  }


  if (_action === "delete") {
    await deleteField({
      profileId: userDoc?.defaultProfile,
      sectionId: params.sectionId,
      fieldId: params.fieldId,
    })
    return redirect(`/forms/sections/${params.sectionId}`)
  }
  if (_action === "deleteOption") {
    await deleteSelectOption({
      profileId: userDoc?.defaultProfile,
      sectionId: params.sectionId,
      fieldId: params.fieldId,
      // @ts-ignore
      optionValue: values.value,
    })
    return redirect(`/forms/sections/${params.sectionId}/fields/${params.fieldId}`)
  }

  if (_action === "add") {
    const schemaCheck = OptionSchema.safeParse(values);

    if (!schemaCheck.success) {
      return { error: true, issues: schemaCheck.error.issues }
    } else {

      await addOptionToField({
        profileId: userDoc?.defaultProfile,
        sectionId: params.sectionId,
        fieldId: params.fieldId,
        optionLabel: schemaCheck.data.label,
      })
      return { error: false }
    }
  }
  return { error: true };
}

export async function loader({ params, request }: LoaderArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);
  const formSectionDoc = await getFormSectionById({
    profileId: userDoc?.defaultProfile,
    sectionId: params.sectionId,
  })

  if (!formSectionDoc) {
    throw new Response("No section by that Id", { status: 404 })
  }

  const currentField = formSectionDoc.fieldData[params.fieldId as string]

  if (!currentField) {
    throw new Response("error no field by that id", { status: 404 })
  }

  const saveUrl = `/forms/sections/${params.sectionId}`


  return json({ currentField, saveUrl });
}



export default function SectionField() {
  const { currentField, saveUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(0);
  let submit = useSubmit();

  const options = currentField.options ?? []
  const text = currentField.type === "select" ? "Add the select options you would like" : ""

  let navigation = useNavigation();


  let isAdding =
    navigation.formData?.get("_action") === "add" &&
    navigation.state === "submitting"
  let formOptionRef = useRef();
  let optionLabelRef = useRef();
  let optionOrderRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isAdding) {
      // @ts-ignore
      formOptionRef.current?.reset()
      // @ts-ignore
      optionLabelRef.current?.focus()
    }
  }, [isAdding])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  const labelError = actionData
    // @ts-ignore
    ?.issues
    ?.find((issue: ZodIssue) => issue.path[0] === "label").message



  function handleDragStart(event: DragStartEvent) {
    // @ts-ignore
    setActiveId(event?.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over?.id || !active.id) return;
    const itemId = active.id as string;
    const overId = over.id as string;
    console.log(itemId, overId)
    let formData = new FormData();
    formData.append("_action", "sort")
    formData.append("activeId", itemId)
    formData.set("overId", overId)
    console.log(formData)

    setActiveId(null);
    // @ts-ignore
    if (active.id !== over.id) {

      submit(formData, { method: "POST", })

      // setlItems((items) => {
      //   const oldIndex = items.indexOf(active.id);
      //   const newIndex = items.indexOf(over.id);

      //   return arrayMove(items, oldIndex, newIndex);
      // });
    }
  }


  return (
    <div className="px-0 py-0 sm:py-2 sm:px-4">
     
      {/* {actionData ? <p>{JSON.stringify(actionData)}</p> : <p></p>} */}
      <SectionPanel name={currentField.label} text={text} >
        {
          currentField.type === "select" ?
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <SortableContext
                items={options.map(option => option.value)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid col-span-full space-y-2 ">

                  {options.map(option => <SortableItem displayHandle key={option.value} id={option.value}>
                    <div className="border-2 py-2 px-3">
                      <p>
                        {option.label}
                      </p>
                    </div>
                  </SortableItem>)}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <div className="border-2 py-2 px-3">
                    <p>
                      option
                    </p>
                  </div>
                ) : null}

              </DragOverlay>
              <div className="grid col-span-full">
                <Form
                  // @ts-ignore
                  ref={formOptionRef}
                  replace
                  method="POST"
                >
                  <div
                    className="flex"
                  >

                    <input
                      // @ts-ignore 
                      ref={optionLabelRef}
                      className="inline  mr-4 py-1.5  bg-gray-50 max-w-lg rounded-md px-3 border-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
                      name="label"
                    />
                    <div className="justify-end">
                      <button
                        type="submit"
                        name="_action"
                        value="add"
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {
                          isAdding ?
                            "Adding..."
                            : "Add Option"
                        }
                      </button>
                    </div>
                  </div>
                  {
                    labelError ?
                      <p
                        className="text-red-500"
                      >
                        {labelError}
                      </p>
                      : null
                  }
                </Form>

              </div>

            </DndContext>

            : <></>

        }
        <Form replace method="post" className="col-span-1   py-4 sm:col-span-6  flex justify-end">
          <button
            name="_action"
            value="delete"
            className="bg-red-400 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >

            Delete This Field
          </button>
        </Form>

      </SectionPanel>
      <div className=" py-4 flex justify-end">
        <Link to={saveUrl}
          className="bg-gray-50 text-gray-900 px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Save
        </Link>

      </div>
    </div>
  );
}
function AddOption() {
  return <>


    <div className="justify-end">
      <button
        type="submit"
        name="_action"
        value="add"
      >
        Add Option
      </button>
    </div>

  </>
}

function OptionItem({ option }: { option: { label: string, value: string } }) {

  return (
    <li
      className=" border-2 max-w-md pl-2 mb-2 bg-slate-50"
    >
      <Form replace method="post" className="flex justify-between max-w-xs py-3">
        <p>
          {option.label}
        </p>
        <input
          hidden
          name="value"
          value={option.value}
        />
        <button
          name="_action"
          value="deleteOption"
          className=" underline text-red-500"
        >
          Delete
        </button>
      </Form>
    </li>
  )
}


function ListOptionsWithForm() {
  const options: { label: string, value: string }[] = [];
  const labelError = "block text-sm font-medium text-gray-700"
  const isAdding = true
  return <>
    <ul className=" col-span-1 sm:col-span-6 ">
      {
        options.length > 0 ?
          options.map((option) =>
            <OptionItem key={option.value} option={option} />
          )
          : <li><p>No options </p>    </li>
      }
      <li>
        <Form
          // @ts-ignore
          ref={formOptionRef}
          replace
          method="POST"
        >
          <div
            className="flex"
          >

            <input
              // @ts-ignore 
              ref={optionLabelRef}
              className="inline  mr-4 py-1.5  bg-gray-50 max-w-lg rounded-md px-3 border-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
              name="label"
            />
            <div className="justify-end">
              <button
                type="submit"
                name="_action"
                value="add"
                className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {
                  isAdding ?
                    "Adding..."
                    : "Add Option"
                }
              </button>
            </div>
          </div>
          {
            labelError ?
              <p
                className="text-red-500"
              >
                {labelError}
              </p>
              : null
          }
        </Form>
      </li>
    </ul>


  </>
}
