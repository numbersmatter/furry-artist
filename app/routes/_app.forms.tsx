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
    <div className="h-full w-full lg:pl-72 ">
      <FormsHeader displayName={userData.name} />
      <Outlet />
    </div>
  );
}

function FormsHeader(props: { displayName: string }) {
  return (
    <header className="bg-gray-50 py-8">
      <h1 className="mt-2 ml-4 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        {`${props.displayName}'s Forms`}
      </h1>
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
  { name: 'Forms List', to: '/forms', },
  { name: 'Sections', to: '/forms/sections', },
  { name: 'Form', to: '/forms/open-forms', },
]
// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function NavBar({ tabs }: { tabs: { name: string, to: string }[] }) {
  return (
    <div>
      
      <div className="">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 lg:ml-2" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <NavLink
                key={tab.name}
                to={tab.to}
                end={index === 0}
                className={({ isActive, isPending }) => classNames(
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



