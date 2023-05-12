import { ActionArgs, LoaderArgs, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData, UploadHandler } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import React, { useRef } from "react";
import { uploadImage } from "~/server/cloudinary.server";
import { getUUID } from "~/server/database/db.server";
import { getImageDoc, ImageItem, setImageDoc, updateImageDoc } from "~/server/database/image.server";
import { baseLoader } from "~/server/user.server";

export async function action({ params, request }: ActionArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    return redirect('/login');
  };
  if (!profileId) {
    return redirect('/profile-setup');
  }


  const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
    async ({ name, data }) => {
      if (name !== "img") {
        return undefined;
      }
      if (!data) {
        return undefined
      }

      const uploadedImage = await uploadImage(profileId, data);
      return uploadedImage.secure_url;
    },
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);

  const imgSrc = formData.get("img") as string;
  const fieldName = formData.get("fieldName") as string;
  if (!imgSrc) {
    return json({ error: "something wrong" });
  }
  // random id

  const imageId = getUUID()

  const newImageItem: ImageItem = {
    url: imgSrc,
    imageId,
    description: fieldName

  }

  await updateImageDoc({
    profileId,
    imageDocId: "test",
    data: newImageItem
  })


  return json({ message: "success" });



}

export async function loader({ params, request }: LoaderArgs) {
  const { profileId } = await baseLoader(request);
  if (!profileId) { return redirect("/setup-profile") };

  const imageDoc = await getImageDoc({
    profileId,
    imageDocId: "test",
  })

  if (!imageDoc) {
    throw new Error("no image doc")
  }

  return json({ imageDoc });
}



export default function ImageUpload() {
  const { imageDoc } = useLoaderData<typeof loader>();
  console.log(imageDoc)
  return (
    <div className="overflow-hidden bg-white shadow">
      <div className="px-4 py-5">
        <h3>Uploaded images</h3>
        {
          imageDoc.imageArray.map((imageItem) =>
            <div key={imageItem.imageId} className=" max-w-xs">
              <img src={imageItem.url} alt="testimage" />
            </div>
          )
        }

      </div>
      <UploadImageWidget action={"/api/image/upload"} >

      </UploadImageWidget>
    </div>
  );
}

function UploadImageWidget(props:{
  children: React.ReactNode,
  action: string,
}) {
  let fetcher = useFetcher();
  const imageInputRef = useRef(null);
  const imageFormRef = useRef();
  const openFileInput = () => {
    // @ts-ignore
    imageInputRef.current.click();
  };
  let submit = fetcher.submit;

  let isBusy = fetcher.state !== "idle"

  const onFileChange=(e: React.ChangeEvent<HTMLInputElement>)=>{
    e.preventDefault();
    const filesArray = e.currentTarget.files ?? [];
    const filesPresent = filesArray.length > 0;

    if(filesPresent && imageFormRef.current){
      submit(imageFormRef.current,{});
    }
  }

  return (
    <div>
      <button 
        onClick={openFileInput} 
        disabled={isBusy}
        className="rounded-md bg-indigo-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-600 disabled:bg-slate-300"
      >
        { isBusy ? "Uploading..." : "Image Upload" }
      </button>

      <fetcher.Form
        // @ts-ignore 
        ref={imageFormRef} 
        method="post" 
        action={props.action} 
        className="px-4 py-5 sm:p-6"
        encType="multipart/form-data"
      >
        <input
          type={"file"}
          name="img"
          ref={imageInputRef}
          accept={"image/*"}
          onChange={(e)=>onFileChange(e)}
          hidden
        />
        {props.children}
      </fetcher.Form>
    </div>

  )

}