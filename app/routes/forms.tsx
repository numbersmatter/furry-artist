import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { getUserIfSignedIn } from "~/server/auth.server";
import { getUserDoc, navigation } from "~/server/database/db.server";
import { getProfilePageHeaderDoc } from "~/server/database/profile.server";
import SideColumnLayout from "~/ui/Layout/SideColumnLayout";




export async function action({ params, request }: ActionArgs) {


  return redirect('/');
}

export async function loader({ params, request }: LoaderArgs) {
  const userRecord = await getUserIfSignedIn(request);
  if (!userRecord) {
    return redirect('/login')
  }
  const userDoc = await getUserDoc(userRecord.uid)
  if (!userDoc) {
    throw new Response("no user doc", { status: 401 })
  }
  const pageHeaderData = await getProfilePageHeaderDoc(userDoc.defaultProfile ?? "no-profile")

  const userData = {
    name: pageHeaderData?.displayName ?? "",
    email: userRecord.email ?? "no-email",
    imageUrl: pageHeaderData?.avatar ?? "",
    settingsUrl: "/site/profile"
  }

  const avatarUrl = pageHeaderData?.avatar ?? ""

  return json({ userData, avatarUrl });
}



export default function FormsLayOut() {
  const { userData, avatarUrl } = useLoaderData<typeof loader>();
  return (
    <SideColumnLayout avatarUrl={avatarUrl}>
      <div className="overflow-scroll">
        <FormsHeader displayName={userData.name} />
        <div className=" mx-auto max-w-7xl bg-[#2a9bb5] sm:px-6 lg:px-8">
        <Outlet />
        </div>

      </div>
    </SideColumnLayout>
  );
}

function FormsHeader(props: { displayName: string }) {
  return (
    <header className="bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {`${props.displayName}'s Forms`}
          </h1>
          {/* <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-8">
            <div className="mt-2 flex items-center text-sm text-gray-500">
            <BriefcaseIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            Full-time
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPinIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            Remote
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
            <CurrencyDollarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            $120k &ndash; $140k
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
            <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            Closing on January 9, 2020
            </div>
          </div> */}
        </div>
        {/* <div className="mt-5 flex xl:ml-4 xl:mt-0">
          <span className="hidden sm:block">
          <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
          <PencilIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          Edit
          </button>
          </span>
          
          <span className="ml-3 hidden sm:block">
          <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
          <LinkIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          View
          </button>
          </span>
          
        </div> */}
      </div>
      <NavBar tabs={tabs} />
    </header>
  )
}

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
const tabs = [
  { name: 'Forms List', to: '/forms',  },
  { name: 'Sections', to: '/forms/sections', },
  { name: 'Form Status', to: '/forms/open-forms', },
]
// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function NavBar({tabs}: {tabs: {name: string, to: string}[]}) {
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          // defaultValue={tabs.find((tab) => tab.current).name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <NavLink
                key={tab.name}
                to={tab.to}
                end={index === 0}
                className={({ isActive, isPending })=>classNames(
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                )}
                // aria-current={tab.current ? 'page' : undefined}
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}



