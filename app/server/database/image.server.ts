import { dataPoint, dbBase } from "./db.server";

export interface ImageItem {
  imageId: string;
  url: string;
  description: string;
}

export interface ImageDoc {
  imageArray: ImageItem[];
}

export const imageDb = {
  image: (profileId: string) =>
    dataPoint<ImageDoc>(`${dbBase}/profiles/${profileId}/images`),
};

export const getImageDoc = async ({
  profileId,
  imageDocId,
}: {
  profileId: string | undefined;
  imageDocId: string | undefined;
}) => {
  if(!profileId || !imageDocId) return undefined
  const docRef = imageDb.image(profileId).doc(imageDocId);
  const docSnap = await docRef.get();
  const docData = docSnap.data();
  if(!docData){ return undefined};

  return { ...docData, imageDocId};
}

export const setImageDoc = async ({
  profileId,
  imageDocId,
  data,
}: {
  profileId: string | undefined;
  imageDocId: string | undefined;
  data: ImageDoc;
}) => {
  if (!profileId || !imageDocId) {
    return undefined;
  }
  const docRef = imageDb.image(profileId).doc(imageDocId);

  return await docRef.set(data);
};
