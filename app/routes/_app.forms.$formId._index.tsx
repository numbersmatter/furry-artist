import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, PencilSquareIcon, Squares2X2Icon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import type { ReactNode } from "react";
import { z } from "zod";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { FormSection, removeSectionFromForm, updateFormDoc } from "~/server/database/forms.server";
import { addSectionToForm } from "~/server/database/forms.server";
import { moveArrayElement, updateFormDocSectionOrder } from "~/server/database/forms.server";
import { getFormById, getFormSections } from "~/server/database/forms.server";
import EditOrDisplayTitle from "~/ui/SmartComponents/EditOrDisplayBasicInfo";
import type { Field } from "~/ui/StackedFields/StackFields";
import StackedField from "~/ui/StackedFields/StackFields";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "~/ui/Workboard/SortItem";
import { SortVerticalItem } from "~/ui/SmartComponents/SortVerticalItem";

export async function action({ params, request }: ActionArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);
  const formDoc = await getFormById({
    profileId: userDoc?.defaultProfile,
    formId: params.formId
  })
  if (!formDoc) {
    return json({ error: true, errorData: "Form not found" })
  }

  const sectionOrder = [...formDoc.sectionOrder];

  let formData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);
  console.log(formData)

  const indexOfSectionId = sectionOrder.findIndex(sectionId => sectionId === values.sectionId)


  if(_action === "editBasic") {
    const EditSchema = z.object({
      title: z.string().min(2, "Title must be at least 2 characters"),
      text: z.string().min(2, "Notes must be at least 2 characters"),
    })
    const schemaCheck = EditSchema.safeParse(values);
    if (!schemaCheck.success) {
      return { error: true, errorData: schemaCheck.error.issues }
    }
    await updateFormDoc({
      profileId: userDoc?.defaultProfile,
      formId: params.formId,
      updateData: {
      name: schemaCheck.data.title,
      text: schemaCheck.data.text,
      }
    })
    return json({ success: "true", status: 200 })
  }

  // if (indexOfSectionId < 0) {
  //   return json({})
  // }

  const AddSchema = z.object({
    sectionId: z.string().min(2, "Section ID must be at least 2 characters"),
  })

  if (_action === "removeSection") {
    const schemaCheck = AddSchema.safeParse(values);
    if (!schemaCheck.success) {
      return { error: true, errorData: schemaCheck.error.issues }
    }
    await removeSectionFromForm({
      profileId: userDoc?.defaultProfile,
      formId: params.formId,
      sectionId: schemaCheck.data.sectionId,
    })
    return { error: false, errorData: null }
  }

  if (_action === "addSection") {
    const schemaCheck = AddSchema.safeParse(values);
    if (!schemaCheck.success) {
      return { error: true, errorData: schemaCheck.error.issues }
    } else {
      if (schemaCheck.data.sectionId === "create-new") {
        return redirect(`new-section`)
      }
      await addSectionToForm({
        profileId: userDoc?.defaultProfile,
        formId: params.formId,
        sectionId: schemaCheck.data.sectionId,
      })
      return { error: false, errorData: null }
    }
  }

 

  if (_action === "sortList") {
    const SortListSchema = z.object({
      oldIndex: z.coerce.number(),
      newIndex: z.coerce.number(),
    })
    const schemaCheck = SortListSchema.safeParse(values);
    if (!schemaCheck.success) {
      return { error: true, errorData: schemaCheck.error.issues }
    }

    const newSectionOrder = moveArrayElement(
      sectionOrder,
      schemaCheck.data.oldIndex,
      schemaCheck.data.newIndex
    );
    const writeToDb = await updateFormDocSectionOrder({
      profileId: userDoc?.defaultProfile,
      formId: params.formId,
      newSectionOrder
    });
    return writeToDb;
  }


}

export async function loader({ params, request }: LoaderArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);

  const formDoc = await getFormById({
    profileId: userDoc?.defaultProfile,
    formId: params.formId
  })

  if (!formDoc) {
    return redirect("/forms")
  }

  const sections = await getFormSections(userDoc?.defaultProfile) ?? [];

  const unusedSections = sections.filter(section => !formDoc?.sectionOrder.includes(section.sectionId))

  const createNewOption = { label: "Create New Section", value: "create-new" }

  const sectionOptions = unusedSections.map(section => ({ label: section.name, value: section.sectionId }));

  const allSectionOptions = [...sectionOptions, createNewOption]

  const selectSectionField: Field = {
    fieldId: "sectionId",
    label: "Section To add",
    type: "select",
    options: allSectionOptions
  }

  const saveUrl = `/forms/`

  return json({ formDoc, sections, selectSectionField, saveUrl });
}



export default function FormIdPage() {
  const {
    formDoc,
    sections,
    selectSectionField,
    saveUrl
  } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  let submit = useSubmit();




  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    console.log(active, over)
    const oldIndex = formDoc.sectionOrder.findIndex(sectionId => sectionId === active.id)
    const newIndex = formDoc.sectionOrder.findIndex(sectionId => sectionId === over.id)

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

    submit(formData, { method: "post" });
  };



  return (
    <DndContext
      id="sections-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Content goes here */}
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
          <EditOrDisplayTitle
            _action="editBasic"
            title={formDoc.name ?? ""}
            text={formDoc.text ?? ""}
            textLabel="Form Description"
          />
          <div
            className="max-w-lg mb-4"
          >
            <SortableContext
              items={formDoc.sectionOrder}
              strategy={verticalListSortingStrategy}
            >
              <ul
                className="grid grid-cols-1 gap-3"
              >
                {
                  formDoc.sectionOrder.map(sectionId => {
                    const section = sections.find(section => section.sectionId === sectionId)
                    if (!section) {
                      return <div key={sectionId} >Error</div>;
                    }

                    return <SortVerticalItem key={sectionId} id={sectionId} displayHandle={true}>
                      <div className="col-span-4">
                        <Link
                          to={`/forms/sections/${section.sectionId}`}
                          className="flex justify-start"
                        >
                          {section.name} <PencilSquareIcon className="inline-block ml-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                        </Link>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          className="inline-flex items-center justify-center p-1 border border-transparent rounded-full shadow-sm text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          X
                        </button>
                      </div>

                    </SortVerticalItem>
                  })
                }

              </ul>
            </SortableContext>
          </div>
          <ActionPanel field={selectSectionField} />

        </div>
      </div>
    </DndContext>
  );
}

function SectionDragComponent({ section, sectionId }: { section: FormSection, sectionId: string }) {


  return (

    <li
      className="border-2 grid grid-cols-6  rounded-md items-center justify-between px-4 py-2 bg-slate-300 sm:px-6"
    >
      <Squares2X2Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      <div
        className="col-span-4"
      >

        <Link
          to={`/forms/sections/${sectionId}`}
          className="flex justify-start"
        >
          {section.name} <PencilSquareIcon className="inline-block ml-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Link>
      </div>

      <div
        className="col-span-1 flex justify-end"
      >

        <button
          className="inline-flex items-center justify-center p-1 border border-transparent rounded-full shadow-sm text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          X
        </button>
      </div>
    </li>
  )
}





// <div className="px-0 py-0 sm:py-2 sm:px-4">
//   {actionData ? <p>{JSON.stringify(actionData)}</p> : <p></p>}
//   <SectionPanel name={formDoc?.name ?? ""} text={formDoc?.text ?? ""} >
//     <StackedList>
//       {
//         formDoc?.sectionOrder.map(sectionId => {
//           const formSection = sections
//             .find(section => section.sectionId === sectionId);


//           return <SectionCard
//             key={sectionId}
//             sectionId={sectionId}
//             section={formSection} />
//         })
//       }
//     </StackedList>

//     <ActionPanel field={selectSectionField} />
//   </SectionPanel>
//   <div className=" py-4 flex justify-end">
//     <Link to={saveUrl}
//       className="bg-gray-50 text-gray-900 px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
//       Save
//     </Link>

//   </div>

// </div>

function SectionPanel(props: { name: string, text: string, children: ReactNode }) {

  return (
    <div className="bg-white  px-4 py-5 shadow sm:rounded-lg sm:p-6">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-2xl font-semibold leading-6 text-gray-900">{props.name}</h3>
            <p className="mt-1 text-base text-gray-500">
              {props.text}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};


function StackedList(props: {
  children: React.ReactNode,
}) {
  return (
    <div className=" sm:col-span-6 overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {props.children}
      </ul>
    </div>
  )
}


function SectionCard(props: {
  section: FormSection | undefined,
  sectionId: string
}) {
  let fetcher = useFetcher();
  let removeSectionFetcher = useFetcher();
  const section = props.section;
  const sectionId = props.sectionId;

  if (!section) {
    return (
      <li >
        <Link to={props.sectionId} className="block hover:bg-gray-50">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-medium text-indigo-600">
                Error No Data for this section found.
              </p>
              <div className="ml-2 flex flex-shrink-0">
                <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                  type
                </p>
                <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                  type 2
                </p>

              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  No section data found
                </p>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">

                <p>
                  Closing on
                </p>
              </div>
            </div>
          </div>
        </Link>
      </li>

    )
  }

  return (
    <li >
      <div className="block h-20 px-4  bg-slate-300 items-center">
        {/* <div className="px-4 py-4 sm:px-6"> */}
        <div className="flex h-full items-center justify-between">
          <Link to={`/forms/sections/${sectionId}`}
            className="truncate text-sm font-medium text-indigo-600">
            {section.name}
          </Link>
          <div className="w-2/4 flex items-center justify-between">
            <div>
              <removeSectionFetcher.Form
                method="POST"
                name="_action"
              >
                <input
                  hidden
                  name="sectionId"
                  value={props.sectionId}
                  readOnly
                />
                <button
                  type="submit"
                  name="_action"
                  value="removeSection"
                >
                  Remove Section

                </button>

              </removeSectionFetcher.Form>
            </div>
            <fetcher.Form method="POST" className="ml-2 grid grid-cols-2 gap-4">
              <input
                hidden
                name="sectionId"
                value={props.sectionId}
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
            </fetcher.Form>
          </div>
        </div>
      </div>
      {/* </div> */}
    </li>

  )
}

function ActionPanel(props: { field: Field }) {
  return (
    <div className=" max-w-lg sm:col-span-6 overflow-hidden border-2  bg-white shadow sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Add a Form Section
        </h3>
        {/* <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Select a Section To Add</p>
        </div> */}
        <Form replace method="POST" className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <StackedField defaultValue="" field={props.field} />
          </div>
          <button
            name="_action"
            value="addSection"
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
          >
            Add Section
          </button>
        </Form>
      </div>
    </div>
  )
}
