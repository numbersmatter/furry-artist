import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { getAllForms, getFormById } from "~/server/database/forms.server";
import { createArtistOpening, createNewOpening } from "~/server/database/openings.server";
import { baseLoader } from "~/server/user.server";
import StackedField, { Field } from "~/ui/StackedFields/StackFields";

export async function action({ params, request }: ActionArgs) {

  // check user logged in and valid profileId
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    redirect("/logout");
  }
  if (!profileId) {
    redirect("/profile-setup")
  }

  const { _action, ...values } = Object.fromEntries(await request.formData());
  const createProjectSchema = z.object({
    formId: z.string(),
  });

  const checkSchema = createProjectSchema.safeParse(values);

  if (!checkSchema.success) {
    return json({ error: "schema failed", issues: checkSchema.error.issues })
  }
  const formId = checkSchema.data.formId

  // check to see if formId is valid
  const formDoc = await getFormById({
    profileId,
    formId
  });

  if (!formDoc) {
    return json({ error: " no form doc found" })
  }


  const artistOpen = await createArtistOpening({
    profileId,
    formId
  })

  console.log(artistOpen)

  if (artistOpen.openId) {
   return redirect(`${artistOpen.openId}`)
  }

  


  return json({
    error: "creating form opening",
    message: artistOpen.error as string
  });
}

export async function loader({ params, request }: LoaderArgs) {
  // check user logged in and valid profileId
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    redirect("/logout");
  }
  if (!profileId) {
    redirect("/profile-setup")
  }

  // check to see if formId is valid
  const forms = await getAllForms({ profileId })

  const formSelectOptions = forms.map((formDoc) =>
    ({ label: formDoc.name, value: formDoc.formId })
  );

  const selectFormField: Field = {
    fieldId: "formId",
    label: "Select Form to Complete",
    type: "select",
    options: formSelectOptions,
  };





  return json({ selectFormField });
}



export default function CreateNewProject() {
  const { selectFormField } = useLoaderData<typeof loader>();
  return (
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
        <h3 className="py-2 text-base font-semibold leading-6 text-gray-900">
          Choose a form to create a project from.
        </h3>
        <Form method="post"
          className="mx-auto"
        >
          <div
            className=" max-w-md"
          >

            <StackedField defaultValue="" field={selectFormField} />
          </div>
          <div>
          <button
            name="_action"
            value="createProjectForm"
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
          >
            Create Project From Form
          </button>
          </div>
        </Form>
      </div>
    </div>
  );
} 