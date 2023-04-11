import { mainDb } from "./db.server";

export interface FormDoc {
  name: string;
  text: string;
  sectionOrder: string[];
}

export const getProfilePageHeaderDoc = async (profileId: string) => {
  const docRef = mainDb
    .profiles()
    .doc(`${profileId}/profile_assets/pageheader`);

  const docSnap = await docRef.get();
  const docData = docSnap.data();

  return docData;
};
export const setProfilePageHeaderDoc = async ({
  profileId,
  data,
}: {
  profileId: string;
  data: any;
}) => {
  const docRef = mainDb
    .profiles()
    .doc(`${profileId}/profile_assets/pageheader`);

  return await docRef.set(data, { merge: true });
};

export const getDefaultProfile = async (uid: string) => {};

// export const getProfileForms  = async (profileId: string) => {
//   const colRef = mainDb
//     .profiles()
//     .doc(`${profileId}`)
//     .collection("forms");

//   const colSnap = await colRef.get();
//   const formsDocs = colSnap.docs.map((snap )=>({...snap.data(), formId: snap.id}))
//   return formsDocs;
// };
