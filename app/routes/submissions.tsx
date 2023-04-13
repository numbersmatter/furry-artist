import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getProfilePageHeaderDoc } from "~/server/database/profile.server";
import { baseLoader } from "~/server/user.server";
import SideColumnLayout from "~/ui/Layout/SideColumnLayout";

export async function action({ params, request }: ActionArgs) {


  return redirect('/');
}

export async function loader({ params, request }: LoaderArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    return redirect('/login');
  };
  if (!profileId) {
    return redirect('/profile-setup');
  }

  const pageHeaderData = await getProfilePageHeaderDoc(profileId)


  const avatarUrl = pageHeaderData?.avatar ?? ""

  return json({ avatarUrl });
};



export default function FormSubmissionsLayout() {
  const { avatarUrl } = useLoaderData<typeof loader>();
  return (
    <SideColumnLayout avatarUrl={avatarUrl}>
       <main className="bg-slate-200 lg:pl-20">
          <div className="xl:pl-96">
            <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">{/* Main area */}</div>
          </div>
        </main>

        <aside className="bg-slate-400 fixed inset-y-0 left-20 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
          {/* Secondary column (hidden on smaller screens) */}
        </aside>
    </SideColumnLayout>
  );
}
