import { mainDb } from "./db.server";

export const getProfilePageHeaderDoc = async (profileId: string) => {
  const docRef = mainDb
    .profiles()
    .doc(`${profileId}/profile_assets/pageheader`);

  const docSnap = await docRef.get();
  const docData = docSnap.data();

  return docData;
};
