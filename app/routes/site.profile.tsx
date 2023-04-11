import { Bars3Icon, PhotoIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import { ActionArgs, LoaderArgs, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData, UploadHandler } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit, useTransition } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { uploadImage } from "~/server/cloudinary.server";
import { getProfilePageHeaderDoc, setProfilePageHeaderDoc } from "~/server/database/profile.server";
import { baseLoader } from "~/server/user.server";
import SectionPanel from "~/ui/Layout/SectionPanel";
import StackedField from "~/ui/StackedFields/StackFields";

export async function action({ params, request }: ActionArgs) {
  const {profileId, userRecord} = await baseLoader(request);
  if(!userRecord){
    return redirect('/login');
  };
  if(!profileId){
    return redirect('/profile-setup');
  }

  const intentId = params.intentId ?? "no-intent"
  const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
    async ({ name, data }) => {
      if (name !== "img") {
        return undefined;
      }
      if (!data) {
        return undefined
      }

      const uploadedImage = await uploadImage(intentId, data);
      return uploadedImage.secure_url;
    },
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);

  const imgSrc = formData.get("img") as string;
  const imgDesc = formData.get("desc") as string;
  const fieldName = formData.get("fieldName") as string;
  if (!imgSrc) {
    return json({ error: "something wrong" });
  }
  // random id
  const imageId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  await setProfilePageHeaderDoc({
    profileId,
    data:{
      [fieldName]: imgSrc,
    }
  })

  // await saveImageUpload(
  //   params.profileId ?? "no-profile",
  //   params.intentId ?? "no-intent",
  //   params.sectionId ?? "no-section",
  //   { url: imgSrc, description: imgDesc, imageId }
  // )
  const imageUploadedText = `${imgDesc} uploaded`
  return json({ imageUploadedText });




}

export async function loader({ params, request }: LoaderArgs) {
  const {profileId, userRecord} = await baseLoader(request);
  if(!userRecord){
    return redirect('/login');
  };
  if(!profileId){
    return redirect('/profile-setup');
  }
  const pageHeaderData = await getProfilePageHeaderDoc(profileId);

  return json({pageHeaderData});
}



export default function ProfileData() {
  const [filesPresent, setFilesPresent] = useState<boolean>(false);

  const {pageHeaderData } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  let transition = useNavigation();
  let submit = useSubmit();
  let isUploading =
    transition.state === "submitting" &&
    transition.formData.get("_action") === "uploadImage"

  // transition.submission?.formData.get("_action") === "uploadImage"

  let formRef = useRef();
  let fileInputRef = useRef(null);

  useEffect(() => {
    if (filesPresent && formRef.current) {
      submit(formRef.current, {})
    }
  }, [filesPresent, submit])

  useEffect(() => {
    if (!isUploading) {
      // @ts-ignore
      formRef.current?.reset()
      setFilesPresent(false)
    }
  }, [isUploading])
  const checkFilesPresent = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const filesArray = e.currentTarget.files ?? []
    const areFiles = filesArray.length > 0

    if (areFiles) {
      return setFilesPresent(true)
    }
    return setFilesPresent(false)
  };
  const openFileInput = () => {
    // @ts-ignore
    fileInputRef.current.click()
  }


  return (
    <div className="px-0 py-0 bg-slate-200 sm:py-2 sm:px-4">
      <div className="space-y-10 divide-y bg-slate-200 rounded-lg divide-gray-900/10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Profile</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you share.
            </p>
          </div>
          <Form
            replace
            method="POST"
            // @ts-ignore
            ref={formRef}
            encType="multipart/form-data"
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
                    Photo
                  </label>
                  <div className="mt-2 flex items-center gap-x-3">
                    {
                      pageHeaderData?.avatar ? (
                        <img
                          className="h-12 w-12 rounded-full"
                          src={pageHeaderData?.avatar}
                          alt=""
                        />
                      ) : (
                        <UserCircleIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
                      )
                    }
                    <input
                      ref={fileInputRef}
                      hidden
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onChange={(e) => checkFilesPresent(e)}
                      id="img-field"
                      type="file"
                      name="img"
                      accept="image/*"
                    />
                    <input hidden name="fieldName" value="avatar" readOnly />
                    <button
                    type="button"
                      // className={isUploading ? disabledClass : regularClass}
                      onClick={openFileInput}
                      disabled={isUploading}
                      >
                      
                      {isUploading ? "Uploading..." : "Upload Image"}
                    </button>

                    <input
                      className="hidden"
                      name="_action"
                      value="uploadImage"
                      readOnly
                      />

                    <button
                      onClick={openFileInput}
                      disabled={isUploading}
                      type="button"
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Change
                    </button>
                  </div>
                </div>


              </div>
            </div>
            {/* <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
              </button>
            </div> */}
          </Form>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Banner Image</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This will be the image used for your profile banner
            </p>
          </div>
          <Form
            replace
            method="POST"
            // @ts-ignore
            ref={formRef}
            encType="multipart/form-data"
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
                    Photo
                  </label>
                  <div className="mt-2 flex items-center gap-x-3">
                    {
                      pageHeaderData?.bannerImage ? (
                        <img
                          className="h-12 w-12 rounded-full"
                          src={pageHeaderData?.bannerImage}
                          alt=""
                        />
                      ) : (
                        <Bars3Icon className="h-12 w-12 text-gray-300" aria-hidden="true" />
                      )
                    }
                    <input
                      ref={fileInputRef}
                      hidden
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onChange={(e) => checkFilesPresent(e)}
                      id="img-field"
                      type="file"
                      name="img"
                      accept="image/*"
                    />
                    <input hidden name="fieldName" value="bannerImage" readOnly />
                    <button
                    type="button"
                      // className={isUploading ? disabledClass : regularClass}
                      onClick={openFileInput}
                      disabled={isUploading}
                      >
                      
                      {isUploading ? "Uploading..." : "Upload Image"}
                    </button>

                    <input
                      className="hidden"
                      name="_action"
                      value="uploadImage"
                      readOnly
                      />

                    <button
                      onClick={openFileInput}
                      disabled={isUploading}
                      type="button"
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Change
                    </button>
                  </div>
                </div>


              </div>
            </div>
            {/* <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
              </button>
            </div> */}
          </Form>
        </div>




      </div>
    </div>
  );
}


