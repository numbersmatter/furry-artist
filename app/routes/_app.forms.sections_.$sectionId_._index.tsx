import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { ReactNode, useState } from "react";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { addField, getFormSectionById, moveArrayElement, updateSectionDoc } from "~/server/database/forms.server";
import type { Field } from "~/ui/StackedFields/StackFields";
import * as z from "zod";
import { ChevronLeftIcon, PencilIcon, Squares2X2Icon } from "@heroicons/react/20/solid";
import EditOrDisplayTitle from "~/ui/SmartComponents/EditOrDisplayBasicInfo";
import { SortVerticalItem } from "~/ui/SmartComponents/SortVerticalItem";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export async function action({ params, request }: ActionArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);
  const sectionDoc = await getFormSectionById({
    profileId: userDoc?.defaultProfile,
    sectionId: params.sectionId,
  })


  if (!sectionDoc) {
    return;
  }
  const fieldOrder = sectionDoc.fieldOrder


  let formData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);

  const FieldSchema = z.object({
    label: z.string().min(3, "Label must be atleast 3 character"),
    fieldType: z.enum(["select", "longText", "shortText", "email"])
  })

  const MoveSchema = z.string().min(1)

  if (_action === "addField") {
    const schemaCheck = FieldSchema.safeParse(values);
    if (!schemaCheck.success) {
      return { error: true, issues: schemaCheck.error.issues }
    } else {

      const fieldData = {
        label: schemaCheck.data.label,
        type: schemaCheck.data.fieldType,
      }
      const modFields = await addField({
        profileId: userDoc?.defaultProfile,
        sectionId: params.sectionId,
        field: fieldData
      })
      if (modFields && fieldData.type === "select") {
        return redirect(`fields/${modFields.fieldId}`)
      }

      return { error: false, fields: modFields }
    }
  }

  if (_action === "moveUp") {
    const fieldId = values.fieldId
    const schemaCheck = MoveSchema.safeParse(fieldId);
    if (!schemaCheck.success) {
      return { error: true, issues: schemaCheck.error.issues }
    } else {
      const currentFieldOrder = [...sectionDoc.fieldOrder];
      const currentIndex = currentFieldOrder
        .findIndex((fieldId) => fieldId === schemaCheck.data);

      const newIndex = currentIndex - 1;
      const newArray = moveArrayElement(sectionDoc.fieldOrder, currentIndex, newIndex)

      await updateSectionDoc({
        profileId: userDoc?.defaultProfile,
        sectionId: params.sectionId,
        updateData: { fieldOrder: newArray }
      })
      return json({ success: true })
    }
  }
  if (_action === "moveDown") {
    const fieldId = values.fieldId
    const schemaCheck = MoveSchema.safeParse(fieldId);
    if (!schemaCheck.success) {
      return { error: true, issues: schemaCheck.error.issues }
    } else {

      const currentFieldOrder = [...sectionDoc.fieldOrder];
      const currentIndex = currentFieldOrder
        .findIndex((fieldId) => fieldId === schemaCheck.data);

      const newIndex = currentIndex + 1;
      const newArray = moveArrayElement(sectionDoc.fieldOrder, currentIndex, newIndex)

      await updateSectionDoc({
        profileId: userDoc?.defaultProfile,
        sectionId: params.sectionId,
        updateData: { fieldOrder: newArray }
      })
      return json({ success: true })
    }
  }
  const currentFieldOrder = [...fieldOrder];

  if (_action === "sortList") {
    const SortListSchema = z.object({
      oldIndex: z.coerce.number(),
      newIndex: z.coerce.number(),
    })
    const schemaCheck = SortListSchema.safeParse(values);
    if (!schemaCheck.success) {
      return { error: true, errorData: schemaCheck.error.issues }
    }

    const newFieldOrder = moveArrayElement(
      currentFieldOrder,
      schemaCheck.data.oldIndex,
      schemaCheck.data.newIndex
    );

    await updateSectionDoc({
      profileId: userDoc?.defaultProfile,
      sectionId: params.sectionId,
      updateData: { fieldOrder: newFieldOrder }
    })
    return json({ success: true })
  }
  return json({});

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

  const sectionFields = formSectionDoc.fieldOrder.map((fieldId) => {
    const field = formSectionDoc.fieldData[fieldId];
    return field;
  });

  const saveUrl = `/forms/sections/`


  return json({ formSectionDoc, sectionFields, saveUrl });
}



export default function EditFormSection() {
  const { formSectionDoc, sectionFields, saveUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const [activeFieldId, setActiveFieldId] = useState<string>("");
  let submit = useSubmit();

  const activeField = formSectionDoc.fieldData[activeFieldId] ??
  {
    fieldId: "error",
    label: "error",
    type: "shortText"
  }

  const fields = formSectionDoc.fieldOrder.map((fieldId) => {
    return formSectionDoc.fieldData[fieldId]
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    console.log(active, over)
    const oldIndex = formSectionDoc.fieldOrder.findIndex(fieldId => fieldId === active.id)
    const newIndex = formSectionDoc.fieldOrder.findIndex(fieldId => fieldId === over.id)

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    if (oldIndex === newIndex) {
      return;
    }
    let formData = new FormData();
    formData.append("_action", "sortList");
    formData.append("oldIndex", oldIndex.toString());
    formData.append("newIndex", newIndex.toString());

    setActiveFieldId("")
    submit(formData, { method: "post", });
  };

  const handleDragStart = (event: any) => {
    const { active, over } = event;

    setActiveFieldId(active.id)
  }




  return (
    <DndContext
      id="fieldsDropZone"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >

      <div className="overflow-hidden bg-white shadow">
        <div className="px-4 py-5 sm:p-6">

          {/* Nav Back button */}
          <div
            className="mb-4"
          >
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ChevronLeftIcon className="w-6 h-6" />
              Back
            </button>
          </div>

          {/* Edit or display Title */}
          <EditOrDisplayTitle
            title={formSectionDoc.name}
            text={formSectionDoc.text}
            textLabel={"Section Description"}
            _action="editTitleText"
          />
          {/* list of fields */}
          <div className="max-w-lg mb-4">
            <SortableContext
              items={formSectionDoc.fieldOrder}
              strategy={verticalListSortingStrategy}
            >

              <ul className=" gap-y-2">
                {
                  formSectionDoc.fieldOrder.map(fieldId => {
                    const defaultField = {
                      fieldId: fieldId,
                      label: "Error",
                      type: "shortText"
                    }

                    const field = formSectionDoc.fieldData[fieldId] ??
                      defaultField

                    return (
                      <li
                        key={fieldId}
                        className="py-1"
                      >
                        <SortVerticalItem
                          id={fieldId}
                          displayHandle
                        >
                          <FieldDndBox field={field} />
                        </SortVerticalItem>
                      </li>
                    )
                  })
                }
              </ul>
            </SortableContext>
          </div>
          {/* Add new field to section */}
          <AddField />
        </div>
        <DragOverlay >
          {
            activeFieldId ? (
              <OverlayStyle >

                <FieldDndBox field={activeField} />
              </OverlayStyle>

            )
              : null
          }
        </DragOverlay>
      </div>
    </DndContext>
  );
}

function OverlayStyle(props: {
  
  children: React.ReactNode,}){
  return (
      <div
        className="border-2 grid grid-cols-12  rounded-md items-center justify-between py-2 bg-slate-300"
      >
        <div
         className=" px-1 col-span-1 flex flex-row justify-start"
        >
          <Squares2X2Icon
            className='h-5 w-5 text-gray-400'
          />
        </div>
        { props.children}
      </div>
);
}

function FieldDndBox({ field }: { field: Field }) {

  const options = field.options ?? [];
  return (
    <>
      <div className="col-span-11 flex flex-row justify-between">
        <p className=" font-semibold text-lg">{field.label}</p>
        <p className=" font-bold">{field.type}</p>
        <p className="pr-2">Edit</p>
      </div>
      {
        field.type === "select"
          ?
          <>
            <div className="col-span-4 pt-1 flex flex-row justify-center align-top">
              <p className="font-medium underline decoration-2" >Options</p>
            </div>
            <div className="col-span-8 pt-2">
              <ul className="list-disc">
                {
                  options.map((option) =>
                    <li key={option.value}>
                      {option.label}
                    </li>
                  )
                }
              </ul>
            </div>
          </>
          : null
      }

    </>
  )
}

function AddField() {
  return (
    <div className="bg-white shadow border sm:rounded-lg">
      <div className="px-4 py-2 ">
        {/* <h3 className="text-base font-semibold leading-6 text-gray-900">
          New Field
        </h3> */}
        {/* <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Change the email address you want associated with your account.</p>
        </div> */}
        <Form method="POST" className="mt-5  grid grid-cols-1 sm:grid-cols-12 sm:items-center sm: gap-x-3">
          <div className="col-span-1 sm:col-span-3 ">
            <label
              htmlFor="fieldType"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Field Type
            </label>
            <select
              name="fieldType"
              id="fieldType"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="you@example.com"
            >
              <option value="shortText">Text Field</option>
              <option value="longText" >Text Area</option>
              <option value="select">Select</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div className="col-span-1 sm:col-span-6">
            <label
              htmlFor="label"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Label
            </label>
            <input
              type="text"
              name="label"
              id="label"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Field Label"
            />
          </div>
          <div
            className="col-span-1 sm:col-span-3 sm:pt-5  sm:flex sm:justify-end "
          >

            <button
              type="submit"
              name="_action"
              value="addField"
              className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-1 sm:mt-0 sm:w-auto"
            >
              Add Field
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}

function SectionBasicInfo({ name, text, edit }: { name: string, text: string, edit: (edit: boolean) => void }) {
  return (
    <div className="space-y-8 divide-y divide-gray-200">
      <div>
        <div>
          <h3 className="text-2xl font-semibold leading-6 text-gray-900">{name}</h3>
          <p className="mt-1 text-base text-gray-500">
            {text}
          </p>
        </div>
        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => edit(true)}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionEditTitleForm(props: { name: string, text: string, edit: (edit: boolean) => void }) {

  return (
    <div className="space-y-8 divide-y divide-gray-200">
      <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
            Section Title
          </label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
              <input
                type="text"
                name="username"
                id="username"
                autoComplete="username"
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="janesmith"
                defaultValue={props.name}
              />
            </div>
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
            Section Description
          </label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <textarea
              id="sectionDescription"
              name="sectionDescription"
              rows={3}
              className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={props.text}
            />
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Brief description for your section. This is shown to users on the form.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
          onClick={() => props.edit(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>

    </div>
  );
};

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/


function ExampleTextArea() {

  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <img
          className="inline-block h-10 w-10 rounded-full"
          src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt=""
        />
      </div>
      <div className="min-w-0 flex-1">
        <form action="#">
          <div className="border-b border-gray-200 focus-within:border-indigo-600">
            <label htmlFor="comment" className="sr-only">
              Add your comment
            </label>
            <textarea
              rows={3}
              name="comment"
              id="comment"
              className="block w-full resize-none border-0 border-b border-transparent p-0 pb-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Add your comment..."
              defaultValue={''}
            />
          </div>
          <div className="flex justify-between pt-2">

            <div className="flex-shrink-0">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Post
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}



function FieldCard(props: {
  field: Field,
}) {
  // let fetcher = useFetcher();


  return (
    <li >
      <div className="block h-20 px-4  bg-slate-300 items-center">
        {/* <div className="px-4 py-4 sm:px-6"> */}
        <div className="flex h-full items-center justify-between">
          <Link to={`fields/${props.field.fieldId}`} className="truncate text-sm font-medium text-indigo-600">
            {props.field.label}
          </Link>
          <div className="w-2/4 flex items-center justify-between">
            <div>
              <p>
                {props.field.type}
              </p>
            </div>
            <Form method="POST" className="ml-2 grid grid-cols-2 gap-4">
              <input
                hidden
                name="fieldId"
                value={props.field.fieldId}
                readOnly
              />
              <button
                type="submit"
                name="_action"
                value={"moveUp"}
              >
                <ArrowUpIcon
                  className="mr-3 text-green-500 h-12 w-12 flex-shrink-0" aria-hidden="true"
                />
              </button>
              <button
                type="submit"
                name="_action"
                value="moveDown"
              >
                <ArrowDownIcon
                  className="mr-1.5 text-red-500 h-12 w-12 flex-shrink-0" aria-hidden="true"
                />
              </button>
            </Form>
          </div>
        </div>
      </div>
      {/* </div> */}
    </li>

  )
}


{/* <div className="px-0 py-0 sm:py-2 sm:px-4">
      {actionData ? <p>{JSON.stringify(actionData)}</p> : <p></p>}
      <div className="bg-white  px-4 py-5 shadow sm:rounded-lg sm:p-6">
      {
        editMode
          ? <SectionEditTitleForm edit={setEditMode} name={formSectionDoc.name} text={formSectionDoc.text} />
          : <SectionBasicInfo edit={setEditMode} name={formSectionDoc.name} text={formSectionDoc.text} />
      }        {
          formSectionDoc.type === "imageUpload"
            ? <p
              className="col-span-1 sm:col-span-6"
            >Image Upload Form sections can have no fields</p>
            :
            <ul className=" col-span-1 sm:col-span-6">
              {
                fields.map((field) =>
                  <li key={field.fieldId}>
                    <FieldCard field={field} />
                  </li>
                )
              }
              <li>
                <AddField />
              </li>
            </ul>
        }

      </div>
      <div className=" py-4 flex justify-end">
        <Link to={saveUrl}
          className="bg-gray-50 text-gray-900 px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Save
        </Link>

      </div>

    </div> */}