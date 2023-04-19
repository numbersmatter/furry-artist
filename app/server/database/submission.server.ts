import { dataPoint, dbBase } from "./db.server";
import type { Timestamp } from "@google-cloud/firestore";
import { Field, FieldTypes } from "~/ui/StackedFields/StackFields";
import { FieldValue } from "firebase-admin/firestore";
import { SectionData } from "./openings.server";

export interface ArtistIntentReview {
  reviewStatus: "accepted" | "declined" | "hold" | "review";
  reviewLastUpdated: Timestamp;
  archived: boolean;
  humanReadableId: string;
  formId: string;
  formName: string;
}

export interface IntentDoc {
  createdAt: Timestamp;
  formId: string;
  intentStatus: "in-progress" | "submitted";
  openingId: string;
  profileId: string;
  sectionOrder: string[];
  sectionStatus: { [key: string]: boolean };
  updatedAt: Timestamp;
}
export interface SubmissionDoc extends IntentDoc {
  archived?: boolean;
}

// export interface SubmittedIntentDoc {
//   createdAt:Timestamp,
//   formId: string,
//   intentStatus: "in-progress" | "submitted",
//   openingId: string,
//   profileId: string,
//   sectionOrder: string[],
//   sectionStatus: { [key: string]: boolean },
// };

export interface SectionResponse {
  fields?: Field[];
  formValues?: { [key: string]: string };
  imageArray?: {imageId: string, url: string, description:string}[];
}

export interface DisplayField {
  label: string;
  userInput: string;
  fieldType: FieldTypes;
  fieldId: string;
}

export interface SubmittedSection{
  title: string;
  text: string;
  type: "fields" | "imageArray";
  imageArray: {imageId: string, url: string, description:string}[];
  displayFields: DisplayField[];
  formValues: { [key: string]: string };
}

export interface SubmittedDoc extends IntentDoc{
  createdAt: Timestamp;
  humanReadableId: string;
  submittedSections: SubmittedSection[];
  submittedAt: Timestamp;
}


export const submissionDb = {
  intents: (profileId: string) =>
    dataPoint<IntentDoc>(`${dbBase}/profiles/${profileId}/intents`),
  status: (profileId: string) =>
    dataPoint<ArtistIntentReview>(`${dbBase}/profiles/${profileId}/status`),
  sectionResponses: (profileId: string, intentId: string) =>
    dataPoint<SectionResponse>(`${dbBase}/profiles/${profileId}/intents/${intentId}/sectionResponse`),
  submissions: (profileId: string) =>
    dataPoint<SubmittedDoc>(`${dbBase}/profiles/${profileId}/submissions`),
  
};

export const archiveSubmission = async ({
  profileId,
  submissionId,
}: {
  profileId: string | undefined;
  submissionId: string | undefined;
}) => {
  if (!profileId || !submissionId) {
    return;
  }
  const docRef = submissionDb.status(profileId).doc(submissionId);

  const updateData ={
    archived: true,
  };
  await docRef.update(updateData);
};


export const getArtistStatuses = async (profileId: string) => {
  const colRef = submissionDb.status(profileId).where("archived", "==", false);
  const colSnap = await colRef.get();
  const docs = colSnap.docs.map((snap => ({...snap.data(), statusId: snap.id})));
  return docs;
}


export const getSubmissionbyId = async ({
  profileId,
  submissionId,
}: {
  profileId: string | undefined;
  submissionId: string | undefined;
}) => {
  if (!profileId || !submissionId) {
    return undefined;
  }
  const docRef = submissionDb.submissions(profileId).doc(submissionId);
  const docSnap = await docRef.get();
  const docData = docSnap.data();
  if (!docData) {
    return undefined;
  }
  return { ...docData, submissionId };
};

const createSubmittedSection = (sectionData: SectionData, sectionResponse: SectionResponse, ) => {
  const fields = sectionResponse.fields ?? [];
  const formValues = sectionResponse.formValues ?? {};
  const imageArray = sectionResponse.imageArray ?? [];

  // check that every field has a value in formValues
  const fieldIds = fields.map((field) => field.fieldId);
  const formValueIds = Object.keys(formValues);
  const missingFields = fieldIds.filter((fieldId) => !formValueIds.includes(fieldId));

  if (missingFields.length > 0) { 
    throw new Error(`Missing fields: ${missingFields.join(", ")}`);
  }

  const displayFields = fields.map((field) => {
    const fieldOptions = field.options ?? []
    const rawInput = formValues[field.fieldId];

    const selectValue = fieldOptions.find((option) => option.value === rawInput)?.label ?? "error";

    const userInput = field.type === "select" 
    ? selectValue
    :rawInput ?? "error";

    return {
      label: field.label,
      userInput,
      fieldType: field.type,
      fieldId: field.fieldId,
    }
  });

  const submittedSection = {
    title: sectionData.name,
    text: sectionData.text,
    type: sectionData.type,
    imageArray,
    formValues,
    displyFields: displayFields,
  }

  return submittedSection;
}

export const createSubmittedDoc = async ({
  profileId,
  intentId,
}: {
  profileId: string;
  intentId: string;
}) => {
  const intentDocRef = submissionDb.intents(profileId).doc(intentId);
  const intentDocSnap = await intentDocRef.get();
  const intentDocData = intentDocSnap.data();
  if (!intentDocData) {
    return undefined;
  }
  const submissionDoc = {}

};

export const changeReviewStatus = async ({
  profileId,
  intentId,
  status,
}: {
  profileId: string;
  intentId: string;
  status: "accepted" | "declined" | "hold";
}) => {
  const docRef = submissionDb.status(profileId).doc(intentId);

  const updateData = {
    reviewStatus: status,
    reviewLastUpdated: FieldValue.serverTimestamp(),
  }

  return await docRef.set(updateData, { merge: true });
};

export const getReviewStatusByIntentId = async ({
  profileId,
  intentId,
}: {
  profileId: string;
  intentId: string | undefined;
}) => {
  if (!intentId) {
    return undefined;
  };
  const docRef = submissionDb.status(profileId).doc(intentId);
  const docSnap = await docRef.get();
  const submissionData = docSnap.data();
  if (!submissionData) {
    return undefined;
  }
  return { ...submissionData, submissionId: docSnap.id };
};


export const getSubmissionStatusByIntentId = async ({
  profileId,
  intentId,
}: {
  profileId: string;
  intentId: string | undefined;
}) => {
  if (!intentId) {
    return undefined;
  };
  const docRef = submissionDb.intents(profileId).doc(intentId);
  const docSnap = await docRef.get();
  const submissionData = docSnap.data();
  if (!submissionData) {
    return undefined;
  }
  return { ...submissionData, submissionId: docSnap.id };
};

export const getSubmittedIntents = async (profileId: string) => {
  const colRef = submissionDb
    .intents(profileId)
    .where("intentStatus", "==", "submitted");
  const colSnap = await colRef.get();
  const submissionsDocs = colSnap.docs.map((snap) => ({
    ...snap.data(),
    intentId: snap.id,
  }));
  return submissionsDocs;
};

export const getSectionResponses = async ({
  profileId,
  intentId,
}: {
  profileId: string | undefined;
  intentId: string | undefined;
}) => {
  if (!intentId || !profileId) {
    return [];
  };
  const colRef = submissionDb.sectionResponses(profileId, intentId);
  const colSnap = await colRef.get();
  const submissionData = colSnap.docs.map((snap) => ({
    ...snap.data(),
    sectionId: snap.id,
  }));
  return submissionData;
};
