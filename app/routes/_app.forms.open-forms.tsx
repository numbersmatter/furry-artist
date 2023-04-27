import { Switch } from "@headlessui/react";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import type { FormWithStatus } from "~/server/database/forms.server";
import { getAllForms } from "~/server/database/forms.server";
import { createNewOpening, getOpenForms, updateOpenDocStatus } from "~/server/database/openings.server";


export async function action({ params, request }: ActionArgs) {
  let formData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);

  const OpenFormSchema = z.object({
    profileId: z.string(),
    formId: z.string(),
    openId: z.string(),
  })


  const checkValues = OpenFormSchema.safeParse(values)

  if (_action === "close") {
    if (checkValues.success) {
      await updateOpenDocStatus({
        profileId: checkValues.data.profileId,
        openId: checkValues.data.openId,
        status: "closed",
      })
      return redirect("/forms/open-forms");
    } else {
      return checkValues.error;
    }
  }

  if (_action === "open") {
    if (!checkValues.success) {
      return json({ error: checkValues.error.issues })
    } else {
      const writeOpen = await createNewOpening({
        profileId: checkValues.data.profileId,
        formId: checkValues.data.formId,
      })
      return json({ success: true, writeOpen: writeOpen ?? "none" });
    }
  }


}

export async function loader({ params, request }: LoaderArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);
  if (!userDoc) return redirect("/profile-setup");


  const formDocs = await getAllForms({
    profileId: userDoc.defaultProfile,
  });
  const openDocsStatusOpen = await getOpenForms({ profileId: userDoc.defaultProfile });



  const forms = formDocs.map(form => {
    const openDoc = openDocsStatusOpen.find(doc => doc.formId === form.formId);

    if (!openDoc) {
      return {
        ...form,
        status: "closed",
        openId: "none",
        profileId: userDoc.defaultProfile,
        neverOpened: true,
        lastUpdate: Date.now()
      }
    }

    return {
      ...form,
      status: openDoc.status,
      openId: openDoc.openId,
      profileId: openDoc.profileId,
      lastUpdated: openDoc.lastUpdated,
      neverOpened: false
    }
  })


  return json({ forms });
}



export default function OpenForms() {
  const { forms, } = useLoaderData<typeof loader>();
  const actionData = useActionData();

  console.log(forms)

  return (
    <main className="">
      <div className="px-2 py-2">
        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Forms</h3>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Your forms available to open.
          </p>
          {actionData ? <p> {JSON.stringify(actionData)}</p>
            : <p></p>}
        </div>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            //@ts-ignore
            <FormCard2 key={form.formId} form={form} />
          ))}
        </ul>
      </div>
    </main>
  );
}


function FormCard({ form }: { form: FormWithStatus }) {

  return (
    <li key={form.formId} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
      <div className="flex w-full items-center justify-between space-x-6 p-6">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className="truncate text-sm font-medium text-gray-900">{form.name}</h3>
            {
              form.status === "open"
                ?
                <span className="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  open
                </span>
                :
                <span className="inline-block flex-shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  closed
                </span>
            }
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">{form.text}</p>
          {/* <p className="mt-1 truncate text-sm text-gray-500">{form.lastUpdated.toLocaleString()}</p> */}
        </div>
      </div>
      <div>
        <Form replace method="POST" className="-mt-px flex divide-x divide-gray-200">
          <div className="flex w-0 flex-1">
            <button
              name="_action"
              value="open"
              className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
            >
              <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              Open
            </button>
          </div>
          <div className="-ml-px flex w-0 flex-1">
            <input
              hidden
              name="openId"
              value={form.openId}
              readOnly
            />
            <input
              hidden
              readOnly
              name="formId"
              value={form.formId}
            />
            <input
              readOnly
              hidden
              name="profileId"
              value={form.profileId}
            />
            <button
              name="_action"
              value="close"
              className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
            >
              <PhoneIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              Close
            </button>
          </div>
        </Form>
      </div>
    </li>

  )
}

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


function FormCard2({ form }: { form: FormWithStatus }) {
  let fetcher = useFetcher();
  let submit = fetcher.submit;
  let formData = new FormData();
  const open= form.status === "open" ? true : false;

  const _action = open ? "close" : "open";

  formData.append("openId", form.openId);
  formData.append("_action", _action);
  formData.append("formId", form.formId);
  formData.append("profileId", form.profileId);


  const isToggling = fetcher.state !== "idle";

  const displayState = isToggling ? !open : open;

  const handletoggleOpen = async () => {
    await submit(formData, { method: "post" });

  }


  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap">
          <p>{form.name}</p>
          <button>Delete </button>
        </div>
        <div
          className="py-2"
        >
          <p>{form.text}</p>
        </div>
        <div
          className="flex justify-between items-center"
        >
          <button> edit</button>
          <div
            className="flex items-center space-x-2"
          >
            <p>
              {
                displayState ? "Open" : "Closed"
              }
            </p>
            <Switch
              checked={open}
              onChange={()=>handletoggleOpen()}
              className={classNames(
                displayState ? 'bg-indigo-600' : 'bg-gray-200',
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
              )}
            >
              <span className="sr-only">Toggle Form Open State</span>
              <span
                aria-hidden="true"
                className={classNames(
                  displayState ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                )}
              />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  )
}

