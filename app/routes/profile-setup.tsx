import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { requireAuth } from "~/server/auth.server";
import { createProfileDoc, getProfileDoc, getUserDoc, updateUserDoc } from "~/server/database/db.server";
import { Form } from "@remix-run/react"
import StackedField from "~/ui/StackedFields/StackFields";
import { FormSection, FormSectionDisplay } from "~/server/database/forms.server";
import * as z from "zod"
import { UserRecord } from "firebase-admin/auth";

export async function action({ params, request }: ActionArgs) {
  const userRecord = await requireAuth(request);
  const formData = await request.formData();
  const profileId = formData.get("profileId");

  const ProfileSchema = z.string().min(5, "Must be atleast 5 characters").regex(new RegExp("^[a-zA-Z0-9]*"), " Must be alphanumeric. No spaces no special characters")

  const inputCheck = ProfileSchema.safeParse(profileId);

  if (!inputCheck.success) {
    const data = {
      error: true,
      errorData: inputCheck.error.issues
    }
    return data;
  } else {
    const data = {
      error: false,
      errorData: []
    };
    const profileNameRaw = inputCheck.data;
    const profileName = profileNameRaw.toLowerCase();
    const profileDoc = await getProfileDoc(profileName);
    if (profileDoc) {
      const data = {
        error: true,
        errorData: ["Profile name already exists"]
      }
      return data;
    } else {
      const writeProfileDoc = await createProfileDoc(profileName);
      const writeUpdateUserDoc = await updateUserDoc(userRecord.uid,  profileName);
      return redirect("/site/profile");
    }


  }
}

export async function loader({ params, request }: LoaderArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);

  // if(userDoc){
  //   return redirect("/")
  // }

  const sectionData: FormSectionDisplay = {
    name: "Profile Setup",
    text: "First choose your profile name. It must be unique.",
    fields: [{
      fieldId: "profileId",
      label: "Choose your profile name",
      type: "shortText"
    }],
    type: "fields"
  }

  return json({ sectionData });
}



export default function ProfileSetup() {
  const { sectionData } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  return (
    <div className="min-h-screen bg-[#2a9bb5] flex flex-col ">
      <div className="mx-auto">

        <div className=" max-w-2xl pt-6 pb-5">
          {actionData ? <p> {JSON.stringify(actionData)} </p> : <p></p>}
          <Form method="post">
            <SectionPanel name={sectionData.name} text={sectionData.text}>
              {
                sectionData.fields.map((field) => {
                  const errorObj = actionData ?? { errorData: [] }
                  const errorText = errorObj.errorData[0] ? errorObj.errorData[0].message : ""
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
