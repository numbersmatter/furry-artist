import { dataPoint, dbBase } from "./db.server";
import type { Timestamp } from "@google-cloud/firestore";
import { Field } from "~/ui/StackedFields/StackFields";
import { FieldValue } from "firebase-admin/firestore";

export interface ArtistIntentReview {
  reviewStatus: "accepted" | "declined" | "hold";
  reviewLastUpdated: Timestamp;
}

export interface IntentDoc {
  intentStatus: "in-progress" | "submitted";
  createdAt: Timestamp;
  submittedAt?: Timestamp;
  updatedAt: Timestamp;
  profileId: string;
  openingId: string;
  formId: string;
  sectionOrder: string[];
  sectionStatus: { [key: string]: boolean };
}
export interface SubmissionDoc extends IntentDoc {
  archived?: boolean;
}

export interface SubmittedIntentDoc {
  createdAt:Timestamp,
  formId: string,
  openingId: string,
  profileId: string,
  intentStatus: "in-progress" | "submitted",
  sectionOrder: string[],
  sectionStatus: { [key: string]: boolean },
};

export interface SectionResponses {
  fields?: Field[];
  formValues?: { [key: string]: string };
  imageArray?: {imageId: string, url: string, description:string}[];
}


export const submissionDb = {
  intents: (profileId: string) =>
    dataPoint<SubmittedIntentDoc>(`${dbBase}/profiles/${profileId}/intents`),
  status: (profileId: string) =>
    dataPoint<ArtistIntentReview>(`${dbBase}/profiles/${profileId}/status`),
  sectionResponses: (profileId: string, intentId: string) =>
    dataPoint<SectionResponses>(`${dbBase}/profiles/${profileId}/intents/${intentId}/sectionResponse`),
  
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
