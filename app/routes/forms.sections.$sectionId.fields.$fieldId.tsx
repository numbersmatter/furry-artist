import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { getFormSectionById } from "~/server/database/forms.server";
import SectionPanel from "~/ui/Layout/SectionPanel";
import * as z from "zod"

export async function action({ params, request }: ActionArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);
  const sectionDoc = await getFormSectionById({
    profileId: userDoc?.defaultProfile,
    sectionId: params.sectionId,
  })

  if (!sectionDoc) {
    return {error:true};
  }


  let formData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);

  const OptionSchema = z.object({
    label: z.string().min(2, "Label must be at least 2 characters"),
  })

  if(_action === "add"){
    const schemaCheck = OptionSchema.safeParse(values);

    if(!schemaCheck.success){
      return { error: true, issues: schemaCheck.error.issues}
    }else {

      await addOptionToField({
        profileId: params.profileId, 
        sectionId: params.sectionId,
        optionLabel: schemaCheck.data.label,
      })
    }
  }
  



  return redirect('/');
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

  const sectionFields = formSectionDoc.fields;
  const currentField = sectionFields
    .find(field => field.fieldId === params.fieldId);

  if (!currentField) {
    throw new Response("error no field by that id", { status: 404 })
  }


  return json({ currentField });
}



export default function FormSections() {
  const { currentField } = useLoaderData<typeof loader>();
  const actionData = useActionData();

  const options = currentField.options ?? []

  return (
    <div className="px-0 py-0 sm:py-2 sm:px-4">
      {actionData ? <p>{JSON.stringify(actionData)}</p> : <p></p>}
      <SectionPanel name={currentField.label} text={"Add the select options you would like"} >
        <ul className=" col-span-1 sm:col-span-6">
          {
            options.length > 0 ?
              options.map((option) =>
                <OptionItem key={option.value} option={option} />
              )
              : <li><p>No options </p>    </li>
          }
          <li>
            <AddOption />
          </li>
        </ul>
      </SectionPanel>
    </div>
  );
}
function AddOption() {
  return <li className="mt-5">
    <Form replace method="POST" className="flex">
      <input 
        className="inline  mr-4 py-1.5  bg-gray-50 w-2/3 rounded-md px-3 border-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6" name="label" 
      />
      
      <div className="justify-end">
        <button 
          type="submit"
          name="_action"
          value="add"
        >
          Add Option
        </button>
      </div>
    </Form>

  </li>
}

function OptionItem({ option }: { option: { label: string, value: string } }) {

  return <li>
    {option.label}
  </li>
}
