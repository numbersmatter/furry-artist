import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getImageDoc } from "~/server/database/image.server";
import { baseLoader } from "~/server/user.server";

export async function action({ params, request }: ActionArgs) {


  return redirect('/');
}

export async function loader({ params, request }: LoaderArgs) {
  const { profileId} = await baseLoader(request);
  if(!profileId){ return redirect("/setup-profile")};

  const imageDoc = await getImageDoc({
    profileId,
    imageDocId:"test",
  })

  if(!imageDoc){
    throw new Error("no image doc")
  }

  return json({imageDoc});
}



export default function ImageUpload() {
  const {imageDoc } = useLoaderData<typeof loader>();
  console.log(imageDoc)
  return (
    <div className="overflow-hidden bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <input type={"file"} />
        <button>
          Upload
        </button>
      </div>
    </div>
  );
}