import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { isRouteErrorResponse, NavLink, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { getUserDoc } from "~/server/database/db.server";
import { getProfilePageHeaderDoc } from "~/server/database/profile.server";
import { baseLoader } from "~/server/user.server";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({ params, request }: LoaderArgs) {
  const { userRecord, profileId} = await baseLoader(request);
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
    <div className="flex-1 ">
      <FormsHeader displayName={userData.name} />
      <Outlet />
    </div>
  );
}

function FormsHeader(props: { displayName: string }) {
  return (
    <header className="bg-gray-50 py-8">
      <h1 className="mt-2 ml-4 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        {`${props.displayName}'s Projects`}
      </h1>
      <NavBar tabs={tabs} />
    </header>
  )
}


const tabs = [
  { name: 'Project List', to: '/projects', },
  { name: 'Image Upload', to: '/projects/image-upload', },
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


export function ErrorBoundary(){
  const error = useRouteError();
  if(isRouteErrorResponse(error)){
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    )
  } else if ( error instanceof Error ){
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The Stack Trace is:</p>
        <p>{error.stack}</p>
      </div>
    );
  }else {
    return <h1>Unknown Error</h1>;
  }

}
