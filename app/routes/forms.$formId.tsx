import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);


  return json({});
}



export default function FormIdPAge() {
  const { } = useLoaderData<typeof loader>();
  return (
    <div className="">
      
    </div>
  );
}