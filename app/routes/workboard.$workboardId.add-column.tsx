import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ReactNode } from "react";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { createFormSection, FormSection } from "~/server/database/forms.server";
import StackedField, { Field } from "~/ui/StackedFields/StackFields";
import * as z from "zod";
import { ZodIssue } from "zod";
import SectionPanel from "~/ui/Layout/SectionPanel";
import { addColumnToWorkboard, ColumnDetails } from "~/server/database/workboard.server";

export async function action({ params, request }: ActionArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);
  const profileId = userDoc?.defaultProfile ?? "no-profile";

  let formData = await request.formData();
  let values = Object.fromEntries(formData);

  const SectionSchema = z.object({
    name: z.string().min(2, "Column Title must be atleast  2 characters"),
    text: z.string(),
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
    const columnData: ColumnDetails = {
      columnTitle: inputCheck.data.name,
      columnDescription: inputCheck.data.text,
      cardOrder: [],
    }
    const writeToDb = await addColumnToWorkboard({
      profileId,
      workboardId: params.workboardId ?? "no-workboard",
      columnData
    })


    return redirect(`/workboard/${params.workboardId}`)

  }
}

export async function loader({ params, request }: LoaderArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);

  const sectionData: { name: string, text: string, fields: Field[], type: "fields" | "imageUpload" } = {
    name: "Add column to workboard",
    text: "Enter Column name and descriptive text.",
    fields: [
      {
        fieldId: "name",
        label: "column name",
        type: "shortText"
      },
      {
        fieldId: "text",
        label: "Column Description",
        type: "longText"
      },
    ],
    type: "fields"
  }

  return json({ sectionData });
}



export default function AddColumnPage() {
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

