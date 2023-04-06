import type {
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { Field } from "~/ui/StackedFields/StackFields";
import { dbBase } from "./db.server";

// helper function to convert firestore data to typescript
const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
});

// helper to apply converter to multiple collections
const dataPoint = <T extends FirebaseFirestore.DocumentData>(
  collectionPath: string
) => getFirestore().collection(collectionPath).withConverter(converter<T>());

export interface FormDoc {
  name: string;
  text: string;
  sectionOrder: string[];
}
export interface FormSection {
  fields: Field[];
  name: string;
  text: string;
  type?: "imageUpload" | "fields";
}

const formsDb = {
  forms: (profileId: string) =>
    dataPoint<FormDoc>(`${dbBase}/profiles/${profileId}/forms`),
  sections: (profileId: string) =>
    dataPoint<FormSection>(`${dbBase}/profiles/${profileId}/sections`),
};

export const addOptionToField =async ({ profileId, sectionId}:{}) => {
  
}

export const addField = async ({
  profileId,
  sectionId,
  field,
}: {
  profileId: string | undefined;
  sectionId: string | undefined;
  field: { label: string; type: string };
}) => {
  if (!profileId || !sectionId) {
    return;
  }
  const fieldId = formsDb.sections(profileId).doc().id;
  const sectionRef = formsDb.sections(profileId).doc(sectionId);
  const updateData = {
    fields: FieldValue.arrayUnion({ ...field, fieldId }),
  };
  await sectionRef.update(updateData);
};

export const updateSectionDoc = async ({
  profileId,
  sectionId,
  updateData,
}: {
  profileId: string | undefined;
  sectionId: string | undefined;
  updateData: Partial<FormSection>
}) => {
  if (!profileId || !sectionId) {
    return;
  }
  const sectionRef = formsDb.sections(profileId).doc(sectionId);

  await sectionRef.update(updateData);
};

export const updateFormDocSectionOrder = async ({
  profileId,
  formId,
  newSectionOrder,
}: {
  profileId: string | undefined;
  formId: string | undefined;
  newSectionOrder: string[];
}) => {
  if (!profileId || !formId) {
    return;
  }
  const formDocRef = formsDb.forms(profileId).doc(formId);
  const writeToDb = await formDocRef.update({ sectionOrder: newSectionOrder });
  return writeToDb;
};

export const createFormSection = async ({
  profileId,
  sectionData,
}: {
  profileId: string | undefined;
  sectionData: FormSection;
}) => {
  if (!profileId) {
    return undefined;
  }
  const formSectionRef = formsDb.sections(profileId).doc();

  const writeToDb = await formSectionRef.create(sectionData);

  return { writeToDb, sectionId: formSectionRef.id };
};
export const getFormSections = async (profileId: string | undefined) => {
  if (!profileId) {
    return [];
  }
  const sectionsRef = formsDb.sections(profileId);
  const sectionsSnap = await sectionsRef.get();

  const sections = sectionsSnap.docs.map((snap) => ({
    ...snap.data(),
    sectionId: snap.id,
  }));

  return sections;
};

export const getFormSectionById = async ({
  profileId,
  sectionId,
}: {
  profileId: string | undefined;
  sectionId: string | undefined;
}) => {
  if (!profileId || !sectionId) {
    return undefined;
  }

  const formSectionRef = formsDb.sections(profileId).doc(sectionId);
  const sectionSnap = await formSectionRef.get();
  const sectionData = sectionSnap.data();

  return sectionData ? { ...sectionData, sectionId } : undefined;
};

export const getFormById = async ({
  profileId,
  formId,
}: {
  profileId: string | undefined;
  formId: string | undefined;
}) => {
  if (!profileId || !formId) {
    return undefined;
  }

  const formDocRef = formsDb.forms(profileId).doc(formId);
  const formSnap = await formDocRef.get();
  const formData = formSnap.data();

  return formData ? { ...formData, formId } : undefined;
};

export const moveArrayElement = (
  arr: Array<any>,
  start: number,
  end: number
) => {
  const endLessThanLength = end < arr.length;
  if (!endLessThanLength) {
    return arr;
  }
  if (end < 0) {
    return arr;
  }

  const modArray = [...arr];

  modArray.splice(start, 1);
  modArray.splice(end, 0, arr[start]);

  return modArray;
};
