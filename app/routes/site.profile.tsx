import { Bars3Icon, UserCircleIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs, UploadHandler } from "@remix-run/node";
import { unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit, } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { uploadImage } from "~/server/cloudinary.server";
import { getProfilePageHeaderDoc, setProfilePageHeaderDoc } from "~/server/database/profile.server";
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

  await setProfilePageHeaderDoc({
    profileId,
    data: {
      [fieldName]: imgSrc,
    }
  })


  return json({ message: "success" });




}

export async function loader({ params, request }: LoaderArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    return redirect('/login');
  };
  if (!profileId) {
    return redirect('/profile-setup');
  }
  const pageHeaderData = await getProfilePageHeaderDoc(profileId);
  console.log(profileId)

  return json({ pageHeaderData, profileId });
}



export default function ProfileData() {
  const [filesPresent, setFilesPresent] = useState<boolean>(false);
  const [fieldName, setFieldName] = useState<string>("not-set");

  const { pageHeaderData } = useLoaderData<typeof loader>();
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
  const openFileInput = (fieldName: string) => {
    setFieldName(fieldName)
    // @ts-ignore
    fileInputRef.current.click()
  }

  const imageUploadPanelData = [
    {
      imageFieldLabel: "avatar",
      imageSrc: pageHeaderData?.avatar ?? "https://via.placeholder.com/150",
      panelTitle: "Avatar",
      panelDescription: "Upload your avatar image",
    },
    {
      imageFieldLabel: "bannerImage",
      imageSrc: pageHeaderData?.bannerImage ?? "https://via.placeholder.com/150",
      panelTitle: "Banner Image",
      panelDescription: "Upload your banner image",
    },
    {
      imageFieldLabel: "heroImage",
      imageSrc: pageHeaderData?.heroImage ?? "https://via.placeholder.com/150",
      panelTitle: "Profile Hero Image",
      panelDescription: "Upload your profile hero image",
    },

  ]



  return (
    <div className="px-0 py-0 bg-slate-200 sm:py-2 sm:px-4">
      <div className="space-y-10 divide-y bg-slate-200 rounded-lg divide-gray-900/10">
        {
          imageUploadPanelData.map((panelData, index) => {

            return <ImageUploadPanel
              key={index}
              panelData={panelData}
              openFileInput={openFileInput}
            />
          })
        }
        <Form
          // @ts-ignore
          ref={formRef}
          method="post"
          className=""
          encType="multipart/form-data"
        >
          <input
            type="hidden"
            name="_action"
            value="uploadImage"
          />
          <input
            type="hidden"
            name="fieldName"
            value={fieldName}
          />
          <input
            type="file"
            name="img"
            ref={fileInputRef}
            onChange={checkFilesPresent}
            className="hidden"
          />

        </Form>
      </div>
    </div>
  );
}



function ImageUploadPanel(
  props: {
    panelData: {
      imageFieldLabel: string,
      imageSrc: string,
      panelTitle: string,
      panelDescription: string,
    },
    openFileInput: (fieldName: string) => void,
  }
) {

  const { panelData } = props;
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
      <div className="px-4 sm:px-0">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          {panelData.panelTitle}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          {panelData.panelDescription}
        </p>
      </div>
      <div
        className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
      >
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
                Photo
              </label>
              <div className="mt-2 flex items-center gap-x-3">
                <img
                  className="h-12 w-12"
                  src={panelData.imageSrc}
                  alt=""
                />

                <button
                  onClick={() => props.openFileInput(panelData.imageFieldLabel)}
                  // disabled={isUploading}
                  type="button"
                  className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

