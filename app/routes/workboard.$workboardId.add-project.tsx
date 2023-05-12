import { Dialog } from "@headlessui/react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { z } from "zod";
import { getUUID } from "~/server/database/db.server";
import type { CardDetails } from "~/server/database/workboard.server";
import { addSubmissionToWorkboard } from "~/server/database/workboard.server";
import { baseLoader } from "~/server/user.server";

export async function action({ params, request }: ActionArgs) {
  const { profileId, userRecord} = await baseLoader(request);
  if(!userRecord){
    return redirect("/logout")
  }
  if(!profileId){
    return redirect("/setup-profile")
  }

  const { _action, ...values} = Object.fromEntries(await request.formData())

  if(_action === "createProject"){
    const addProjectSchema =  z.object({
      title: z.string(),
      text: z.string(),
    });

    const checkSchema = addProjectSchema.safeParse(values);

    if(!checkSchema.success){
      return json({ error: "Schema Error", issues: checkSchema.error.issues})
    }

    const cardId = getUUID();

    const cardDetails: CardDetails ={
      cardTitle: checkSchema.data.title,
      cardType: "userCreated",
      workboardId: profileId,
      userTitle: checkSchema.data.title,
      userNotes: checkSchema.data.text,
      archived: false,
    }

    await addSubmissionToWorkboard({
      profileId,
      cardId,
      cardDetails,
      workboardId: profileId
    })

    return redirect(`/workboard/${profileId}/${cardId}`);
  };

  return json({success: false});
}

export async function loader({ params, request }: LoaderArgs) {
  const {  userRecord} = await baseLoader(request);
  if(!userRecord){
    redirect("/logout")
  }


  return json({});
}



export default function AddProjectToWorkboard() {
  const navigate = useNavigate();


  return (
    <Dialog
      open={true}
      as="div"
      onClose={() => { navigate("/workboard/") }}
      className="relative z-50 "
    // className="max-w-2xl  pt-10 inset-0 z-10 overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black opacity-30" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel
            className="w-full max-w-5xl rounded bg-white shadow-lg"
          >
            <Dialog.Title className="px-4 pt-4 text-3xl font-medium text-gray-900"
            >
              <button
                onClick={() => { navigate(-1) }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ChevronLeftIcon className="w-6 h-6" />
                Back
              </button>
            </Dialog.Title>
            <>
              <Form method="post"  className="overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <TitleNotesForm
                    title="New Project"
                    text=""
                    textLabel="Description"
                    _action="createProject"
                  />
                  <div
                    className="py-3" 
                  >
                    <button
                      className="bg-indigo-600 text-white px-2 py-1 rounded-md"
                      type="submit"
                    >
                      Create Project
                    </button>

                  </div>
                </div>
              </Form>
            </>
            <div className="divide-y-2 divide-slate-600">

            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};


function TitleNotesForm({ title, text, textLabel, _action }: { title: string, text: string, textLabel: string, _action: string }) {

  return (
    <div
      className="flex flex-col gap-y-2"
    >
      <div
        className="max-w-lg "
      >
        <input
          name="title"
          className="block w-full text-xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Title"
          defaultValue={title}
        />
        <input hidden readOnly name="_action" value={_action} />
      </div>
      <div
        className="max-w-lg"
      >
        <label className="text-sm">
          {textLabel}
        </label>
        <textarea
          name="text"
          rows={4}
          defaultValue={text}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>
    </div>
  )
}