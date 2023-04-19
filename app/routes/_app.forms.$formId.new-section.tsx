import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ReactNode } from "react";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { addSectionToForm, createFormSection, FormSection } from "~/server/database/forms.server";
import type { Field } from "~/ui/StackedFields/StackFields";
import StackedField from "~/ui/StackedFields/StackFields";
import * as z from "zod";


export async function action({ params, request }: ActionArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);
  const profileId = userDoc?.defaultProfile ?? "no-profile";

  let formData = await request.formData();
  let values = Object.fromEntries(formData);

  const SectionSchema = z.object({
    name: z.string().min(5, "Section Title must be atleast  5 characters"),
    text: z.string(),
    type: z.enum(["fields", "imageUpload"])
  })

  const inputCheck = SectionSchema.safeParse(values);

  if (!inputCheck.success) {
    const data = {
      error: true,
      errorData: inputCheck.error.issues,
      errorType: "schema",
    }
    return data;
  } else {
    const sectionData = {
      ...inputCheck.data,
      fieldOrder: [],
      fieldData: {}
    }
    const writeToDb = await createFormSection({
      profileId,
      sectionData
    })

    if (!writeToDb) {
      return { error: true, errorData: [], errorType: "database" }
    }

    await addSectionToForm({
      profileId: userDoc?.defaultProfile,
      formId: params.formId,
      sectionId: writeToDb.sectionId,
    })

    return redirect(`/forms/${params.formId}`)

  }
}

export async function loader({ params, request }: LoaderArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);

  const sectionData: { name: string, text: string, fields: Field[], type: "fields" | "imageUpload" } = {
    name: "Create New Section",
    text: "Enter sections name and descriptive text.",
    fields: [
      {
        fieldId: "name",
        label: "Section Title",
        type: "shortText"
      },
      {
        fieldId: "text",
        label: "Section Description",
        type: "longText"
      },
      {
        fieldId: "type",
        label: "Section Type",
        type: "select",
        options: [
          { label: "Regular", value: "fields" },
          { label: "Image Upload", value: "imageUpload" },
        ]
      },
    ],
    type: "fields"
  }

  return json({ sectionData });
}



export default function FormAddNewSection() {
  const { sectionData } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  return (
    <div className="px-0 py-0 sm:py-4 sm:px-4">
      {actionData ? <p> {JSON.stringify(actionData)} </p> : <p></p>}
      <Form method="POST">
        <SectionPanel name={sectionData.name} text={sectionData.text}>
          {
            sectionData.fields.map((field) => {
              const errorObj = actionData ?? { errorData: [] }
              const fieldError = errorObj.errorData
                // @ts-ignore
                .filter((issue) => issue.path[0] === field.fieldId)
              const errorIssue = fieldError[0] ?? undefined
              const errorText = errorIssue ? errorIssue.message : ""
              const defaultValue = "";

              return <StackedField
                key={field.fieldId}
                field={field}
                errorText={errorText}
                defaultValue={defaultValue}
              />
            }
            )
          }
        </SectionPanel>
        <div className="py-3 flex justify-end">
          <button
            type="submit"
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </Form>
    </div>
  );
}


function SectionPanel(
  props: { name: string, text: string, children: ReactNode }
) {

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
