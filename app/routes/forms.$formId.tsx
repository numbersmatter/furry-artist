import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import type { ReactNode } from "react";
import { z } from "zod";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import type { FormSection } from "~/server/database/forms.server";
import { addSectionToForm } from "~/server/database/forms.server";
import { moveArrayElement, updateFormDocSectionOrder } from "~/server/database/forms.server";
import { getFormById, getFormSections } from "~/server/database/forms.server";
import type { Field } from "~/ui/StackedFields/StackFields";
import StackedField from "~/ui/StackedFields/StackFields";

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

  // if (indexOfSectionId < 0) {
  //   return json({})
  // }

  const AddSchema = z.object({
    sectionId: z.string().min(2, "Section ID must be at least 2 characters"),
  })

  if (_action === "addSection") {
    const schemaCheck = AddSchema.safeParse(values);
    if (!schemaCheck.success) {
      return { error: true, errorData: schemaCheck.error.issues }
    } else {
      if (schemaCheck.data.sectionId === "create-new") {
        return redirect(`/forms/sections/create-new`)
      }
      await addSectionToForm({
        profileId: userDoc?.defaultProfile,
        formId: params.formId,
        sectionId: schemaCheck.data.sectionId,
      })
      return { error: false, errorData: null }
    }
  }

  if (_action === "moveUp") {
    const newIndexRaw = indexOfSectionId - 1;
    const newIndex = newIndexRaw < 0 ? 0 : newIndexRaw;

    const newSectionOrder = moveArrayElement(sectionOrder, indexOfSectionId, newIndex)

    const writeToDb = await updateFormDocSectionOrder({
      profileId: userDoc?.defaultProfile,
      formId: params.formId,
      newSectionOrder
    });
    return writeToDb;
  }
  if (_action === "moveDown") {
    const newIndexRaw = indexOfSectionId + 1;

    const newSectionOrder = moveArrayElement(
      sectionOrder,
      indexOfSectionId,
      newIndexRaw
    )

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
  const { formDoc, sections, selectSectionField, saveUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  return (
    <div className="px-0 py-0 sm:py-2 sm:px-4">
      {actionData ? <p>{JSON.stringify(actionData)}</p> : <p></p>}
      <SectionPanel name={formDoc?.name ?? ""} text={formDoc?.text ?? ""} >
        <StackedList>
          {
            formDoc?.sectionOrder.map(sectionId => {
              const formSection = sections
                .find(section => section.sectionId === sectionId);


              return <SectionCard
                key={sectionId}
                sectionId={sectionId}
                section={formSection} />
            })
          }
        </StackedList>

        <ActionPanel field={selectSectionField} />
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
  const section = props.section

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
          <p className="truncate text-sm font-medium text-indigo-600">
            {section.name}
          </p>
          <div className="w-2/4 flex items-center justify-between">
            <div>
              <Link to={props.sectionId}>
                go to section
              </Link>
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
    <div className=" sm:col-span-6 overflow-hidden bg-white shadow sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Add a Form Section
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Select a Section To Add</p>
        </div>
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
            Save
          </button>
        </Form>
      </div>
    </div>
  )
}
