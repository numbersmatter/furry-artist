import { CalendarIcon, ChevronRightIcon, CurrencyDollarIcon, LinkIcon, MapPinIcon, PencilIcon } from "@heroicons/react/20/solid";
import { BriefcaseIcon, ClipboardDocumentIcon, HomeIcon, InboxIcon, MegaphoneIcon, UserIcon } from "@heroicons/react/24/outline";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getUserIfSignedIn } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { getProfilePageHeaderDoc } from "~/server/database/profile.server";
import SideColumnLayout from "~/ui/Layout/SideColumnLayout";


const navigation = [
  { name: 'Home', to: '/', icon: HomeIcon },
  { name: 'Make Forms', to: '/forms', icon: ClipboardDocumentIcon },
  { name: 'Open Forms', to: '/forms/open-forms', icon: MegaphoneIcon },
  { name: 'Responses', to: '/opportunities', icon: InboxIcon },
  { name: 'Workboard', to: '/Workboard', icon: BriefcaseIcon },
  { name: 'Profile', to: '/site/profile', icon: UserIcon },
]


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

  const profileHeader = {
    bannerImage: pageHeaderData?.bannerImage ?? "",
    avatar: pageHeaderData?.avatar ?? "",
    displayName: pageHeaderData?.displayName ?? "",
  }

  const userData = {
    name: pageHeaderData?.displayName ?? "",
    email: userRecord.email ?? "no-email",
    imageUrl: pageHeaderData?.avatar ?? "",
    settingsUrl: "/site/profile"
  }

  return json({ userData, profileHeader });
}



export default function SiteLayout() {
  const { userData, profileHeader } = useLoaderData<typeof loader>();
  return (
    // @ts-ignore
    <SideColumnLayout nav={navigation} navBarUser={userData}>
      <div className="overflow-scroll">
        {/* @ts-ignore */}
        <ProfileHeader data={profileHeader}  />
        <div className=" mx-auto max-w-7xl bg-[#2a9bb5] sm:px-6 lg:px-8">
        <Outlet />
        </div>

      </div>
    </SideColumnLayout>
  );

}

export interface ProfileHeaderProps {
  data:{
    bannerImage: string,
    avatar:string,
    displayName: string,
  }
}

function ProfileHeader(props: ProfileHeaderProps) {
  const { bannerImage, avatar, displayName } = props.data;

  return (
    <div>
      <div
        className="h-32 w-full bg-center place-i bg-cover pt-4 lg:h-48 lg:pt-6"
        style={{
          backgroundImage: `url('${bannerImage}')`,
        }}
      >
        {/* <h1 className=" font-DynaPuff text-center text-3xl text-white  text-shadow md:text-5xl  lg:text-7xl ">
          {headerText}
        </h1> */}
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="flex">
            <img
              className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
              src={ avatar }
              alt=""
            />
          </div>
          <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-white truncate">
                {displayName}
              </h1>
            </div>
            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
            </div>
          </div>
        </div>
        <div className="hidden sm:block md:hidden mt-6 min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-white truncate">
            {displayName}
          </h1>
        </div>
      </div>
    </div>
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
    </header>
  )
}


