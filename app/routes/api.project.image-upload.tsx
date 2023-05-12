import { ActionArgs, LoaderArgs, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData, UploadHandler } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { uploadImage } from "~/server/cloudinary.server";
import { getUUID } from "~/server/database/db.server";
import { getImageDoc, ImageItem, setImageDoc, updateImageDoc } from "~/server/database/image.server";
import { updateProjectImage } from "~/server/database/workboard.server";
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
  const cardId = formData.get("cardId") as string;
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

  await updateProjectImage({
    profileId,
    cardId,
    imageItem: newImageItem
  })


  return redirect(`/workboard/${profileId}/${cardId}`);
};







