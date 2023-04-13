import { dataPoint, dbBase } from "./db.server";



export const submissionDb ={
  submissions: (profileId: string) =>
    dataPoint(`${dbBase}/profiles/${profileId}/intents`),

};

export const getSubmittedIntents = async (profileId: string) => {
  const colRef = submissionDb.submissions(profileId).where("intentStatus", "==", "submitted");
  const colSnap = await colRef.get();
  const submissionsDocs = colSnap.docs.map((snap )=>({...snap.data(), intentId: snap.id}))
  return submissionsDocs;
}