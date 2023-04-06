import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import type { ReactNode } from "react";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { addField, getFormSectionById, moveArrayElement, updateSectionDoc } from "~/server/database/forms.server";
import type { Field } from "~/ui/StackedFields/StackFields";
import * as z from "zod";

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
        type: schemaCheck.data.label,
      }
      await addField({
        profileId: userDoc?.defaultProfile,
        sectionId: params.sectionId,
        field: fieldData
      })
    }
  }

  if (_action === "moveUp") {
    const fieldId = values.fieldId
    const schemaCheck = MoveSchema.safeParse(fieldId);
    if (!schemaCheck.success) {
      return { error: true, issues: schemaCheck.error.issues }
    } else {
      const currentFields = [...sectionDoc.fields];
      const currentIndex = currentFields
        .findIndex(field => field.fieldId === schemaCheck.data);

      if (currentIndex < 1) { return; }
      const newIndex = currentIndex - 1;

      const newArray = moveArrayElement(sectionDoc.fields, currentIndex, newIndex)

      await updateSectionDoc({
        profileId: userDoc?.defaultProfile,
        sectionId: params.sectionId,
        updateData: {fields: newArray}
      })
    }
  }
  if (_action === "moveDown") {
    const fieldId = values.fieldId
    const schemaCheck = MoveSchema.safeParse(fieldId);
    if (!schemaCheck.success) {
      return { error: true, issues: schemaCheck.error.issues }
    } else {
      const currentFields = [...sectionDoc.fields];
      const currentIndex = currentFields
        .findIndex(field => field.fieldId === schemaCheck.data);

      if (currentIndex < 0) { return json({success: false}); }
      const newIndex = currentIndex + 1;

      const newArray = moveArrayElement(sectionDoc.fields, currentIndex, newIndex)

      await updateSectionDoc({
        profileId: userDoc?.defaultProfile,
        sectionId: params.sectionId,
        updateData: {fields: newArray}
      })
      return json({success: true})
    }
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


  return json({ formSectionDoc });
}



export default function EditFormSection() {
  const { formSectionDoc } = useLoaderData<typeof loader>();
  const actionData = useActionData();

  return (
    <div className="px-0 py-0 sm:py-2 sm:px-4">
      {actionData ? <p>{JSON.stringify(actionData)}</p> : <p></p>}
      <SectionPanel name={formSectionDoc.name} text={formSectionDoc.text} >
        <ul className=" col-span-1 sm:col-span-6">
          {
            formSectionDoc.fields.map((field) =>
              <li key={field.fieldId}>
                <FieldCard field={field} />
              </li>
            )
          }
          <li>
            <AddField />
          </li>
        </ul>

      </SectionPanel>
    </div>
  );
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
