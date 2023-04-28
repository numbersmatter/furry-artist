import { Timestamp } from "firebase-admin/firestore";
import { Field } from "~/ui/StackedFields/StackFields";
import { dataPoint } from "./db.server";
import { getFormById, getFormSectionById } from "./forms.server";

export const dbBase = "database/version2";

export interface SectionData {
  sectionId: string;
  fields:Field[];
  name: string;
  text: string;
  type: "imageUpload" | "fields";

}
export interface OpeningDoc {
  formId: string;
  profileId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: "open" | "closed";
  sectionOrder: string[];
  sections:SectionData[];
}
export interface OpeningDocWId extends OpeningDoc {
  openId: string;
}

export const openingsDb = {
  openings: (profileId: string) =>
    dataPoint<OpeningDoc>(`${dbBase}/profiles/${profileId}/openings`),
};

export const getOpeningById = async ({
  profileId,
  openId,
}: {
  profileId: string | undefined;
  openId: string | undefined;
}) => {
  if (!profileId || !openId) {
    return undefined;
  }
  const docRef = openingsDb.openings(profileId).doc(openId);
  const docSnap = await docRef.get();
  const docData = docSnap.data();
  if (!docData) {
    return undefined;
  }
  return { ...docData, openId };
};

export const updateOpenDocStatus = async ({
  profileId,
  openId,
  status,
}: {
  profileId: string | undefined;
  openId: string | undefined;
  status: "open" | "closed";
}) => {
  if (!profileId || !openId) {
    return;
  }
  const docRef = openingsDb.openings(profileId).doc(openId);
  await docRef.update({ status });
};

export const createNewOpening = async ({
  profileId,
  formId,
}: {
  profileId: string | undefined;
  formId: string | undefined;
}) => {
  if (!profileId || !formId) {
    return{error: "profileId or formId not found"};
  }

  const formDoc = await getFormById({ profileId, formId });
  if (!formDoc) {
    return {error: "form not found"};
  }

  const sectionPromises = formDoc.sectionOrder.map((sectionId) =>
    getFormSectionById({ profileId, sectionId })
  );

  const sectionsRaw = await Promise.all(sectionPromises);

  const sections = sectionsRaw.map((section) => {
    if (!section) {
      return {
        sectionId:"none",
        name: "Error",
        text: "Form section was not found",
        fields:[],
        type: "fields",
      };
    }
    return {
      sectionId: section.sectionId,
      name: section.name,
      text: section.text,
      fields: section.fieldOrder.map((fieldId) => section.fieldData[fieldId]),
      type: section.type ?? "fields",
    };

  })

  const docRef = openingsDb.openings(profileId).doc();

  const docData: OpeningDoc = {
    formId,
    profileId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    status: "open",
    formName: formDoc.name,
    sectionOrder: formDoc.sectionOrder,
    // @ts-ignore
    sections,
  };

  await docRef.set(docData);
};

export const getOpenForms = async ({
  profileId,
}: {
  profileId: string | undefined;
}) => {
  if (!profileId) {
    return [];
  }
  const colRef = openingsDb.openings(profileId).where("status", "==", "open");
  const colSnap = await colRef.get();
  const openingsDocs = colSnap.docs.map((snap) => ({
    ...snap.data(),
    lastUpdated: snap.updateTime.toDate(),
    openId: snap.id,
  }));
  return openingsDocs;
};

export const getMostRecentOpeningforForm = async ({
  profileId,
  formId,
}: {
  profileId: string | undefined;
  formId: string;
}) => {
  if (!profileId) {
    return undefined;
  }
  const colOpeningRef = openingsDb
    .openings(profileId)
    .where("formId", "==", formId)
    .orderBy("createdAt", "desc")
    .limit(1);
  const colOpeningSnap = await colOpeningRef.get();
  if (colOpeningSnap.empty) {
    return {
      formId,
      profileId,
      openId: "none",
    };
  }
  const openingDocs = colOpeningSnap.docs.map((snap) => ({
    ...snap.data(),
    openId: snap.id,
  }));
  return openingDocs[0];
};

export const getOpenings = async ({
  profileId,
}: {
  profileId: string | undefined;
}) => {
  if (!profileId) {
    return [];
  }
  const colRef = openingsDb.openings(profileId);
  const colSnap = await colRef.get();
  const openingsDocs = colSnap.docs.map((snap) => ({
    ...snap.data(),
    lastUpdated: snap.updateTime.toDate(),
    openId: snap.id,
  }));
  return openingsDocs;
};
