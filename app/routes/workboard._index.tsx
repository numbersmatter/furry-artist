import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getWorkboardbyId } from "~/server/database/workboard.server";
import { baseLoader } from "~/server/user.server";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  let { profileId, userRecord } = await baseLoader(request);
  const workboardDoc = await getWorkboardbyId({
    profileId,
    workboardId: profileId
  });

  return redirect(`/workboard/${profileId}`);
}



export default function FormSections() {
  const { } = useLoaderData<typeof loader>();
  return (
    <div className="">
      
    </div>
  );
}