import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { createNewForm } from "~/server/database/forms.server";
import SectionPanel from "~/ui/Layout/SectionPanel";
import StackedField, { Field } from "~/ui/StackedFields/StackFields";

export async function action({ params, request }: ActionArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);

  let formData = await request.formData();
  let values  = Object.fromEntries(formData);

  const FormScheme = z.object({
    name: z.string().min(2, "Form Title must be at least 2 characters"),
    text: z.string(),
  })

  const schemaCheck = FormScheme.safeParse(values);

  if (!schemaCheck.success) {
    return { error: true, errorData: schemaCheck.error.issues }
  } else {
    const data = {
      name: schemaCheck.data.name,
      text: schemaCheck.data.text,
      sectionOrder: []
    };
    const writeToDb = await createNewForm({
      profileId: userDoc?.defaultProfile,
      data: data
    })
    if(!writeToDb) return { error: true, errorData: [{message: "Error writing to database"}] }
    return redirect(`/forms/${writeToDb.formId}`);
  }





}

export async function loader({ params, request }: LoaderArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);

  const sectionData: { name: string, text: string, fields: Field[], type: "fields" | "imageUpload" } = {
    name: "Create New Form",
    text: "Enter Form's Name and Description.",
    fields: [
      {
        fieldId: "name",
        label: "Form Title",
        type: "shortText"
      },
      {
        fieldId: "text",
        label: "Form Description",
        type: "longText"
      },
    ],
    type: "fields"
  }

  return json({ sectionData });
}



export default function FormSections() {
  const { sectionData } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  return (
    <div className="px-0 py-0 sm:py-2 sm:px-4">
      {actionData ? <p> {JSON.stringify(actionData)} </p> : <p></p>}
      <Form replace method="POST">
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
