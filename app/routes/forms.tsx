import { BriefcaseIcon, ClipboardDocumentIcon, HomeIcon, InboxIcon, MegaphoneIcon, UserIcon } from "@heroicons/react/24/outline";
import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getUserIfSignedIn } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { getProfilePageHeaderDoc } from "~/server/database/profile.server";
import SideColumnLayout from "~/ui/Layout/SideColumnLayout";


const navigation = [
  { name: 'Home', to: '/', icon: HomeIcon },
  { name: 'Make Forms', to: '/forms', icon: ClipboardDocumentIcon },
  { name: 'Open Forms', to: '/open-forms', icon: MegaphoneIcon },
  { name: 'Responses', to: '/opportunities', icon: InboxIcon },
  { name: 'Workboard', to: '/Workboard', icon: BriefcaseIcon },
  { name: 'Profile', to: '#', icon: UserIcon },
]


export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  const userRecord = await getUserIfSignedIn(request);
  if(!userRecord){
    return redirect('/login')
  }
  const userDoc = await getUserDoc(userRecord.uid)
  if(!userDoc){
    throw new Response("no user doc", {status:401})
  }
  const pageHeaderData = await getProfilePageHeaderDoc("milachu92")

  const userData = {
    name: pageHeaderData?.displayName ?? "",
    email: userRecord.email ?? "no-email",
    imageUrl: pageHeaderData?.avatar ?? "",
    settingsUrl:"/site/profile"
  }

  console.log(pageHeaderData)


  return json({userData});
}



export default function FormSections() {
  const {userData } = useLoaderData<typeof loader>();
  return (
    // @ts-ignore
    <SideColumnLayout nav={navigation} navBarUser={userData}>
      <Outlet />
    </SideColumnLayout>
  );
}