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
  archived: boolean;
}

export interface FormWithStatus extends FormDoc {
  status: "open" | "closed";
  openId: string;
  lastUpdated: Date;
  formId: string;
  profileId: string;
}
export interface FormSection {
  fieldOrder: string[];
  fieldData:{ [fieldId:string]: Field};
  name: string;
  text: string;
  type?: "imageUpload" | "fields";
}

export interface FormSectionDisplay {
  name: string;
  text: string;
  type?: "imageUpload" | "fields";
  fields: Field[];
};

const formsDb = {
  forms: (profileId: string) =>
    dataPoint<FormDoc>(`${dbBase}/profiles/${profileId}/forms`),
  sections: (profileId: string) =>
    dataPoint<FormSection>(`${dbBase}/profiles/${profileId}/sections`),
};

export const getAllForms = async ({
  profileId
}:{ profileId: string | undefined;
}) => {
  if (!profileId) { return []; }
  const colRef = formsDb.forms(profileId).where("archived", "==", false);
  const colSnap = await colRef.get();
  const formsDocs = colSnap.docs.map((snap )=>({...snap.data(), formId: snap.id}))
  return formsDocs;
};

export const updateFormDoc = async ({
  profileId,
  formId,
  updateData,
}: {
  profileId: string | undefined;
  formId: string | undefined;
  updateData: Partial<FormDoc>;
}) => {
  if (!profileId || !formId) { return; }
  const docRef = formsDb.forms(profileId).doc(formId);
  const updateToDb = await docRef.set(updateData, { merge: true });
  return updateToDb;
};

export const deleteSelectOption = async ({
  profileId,
  sectionId,
  fieldId,
  optionValue,
}: {
  profileId: string | undefined;
  sectionId: string | undefined;
  fieldId: string | undefined;
  optionValue: string | undefined;
}) => {
  if (!profileId || !sectionId || !fieldId || !optionValue) {
    return;
  }
  const sectionRef = formsDb.sections(profileId).doc(sectionId);
  const sectionSnap = await sectionRef.get();
  const sectionData = sectionSnap.data();
  if (!sectionData) {
    return;
  }
  const selectField = sectionData.fieldData[fieldId];
  if (!selectField) {
    return;
  }
  const options = selectField.options || [];
  const newOptions = options.filter((option) => option.value !== optionValue);
  const updateData = {
    [`fieldData.${fieldId}.options`]: newOptions,
  };
  // @ts-ignore
  await sectionRef.update(updateData);
};

export const deleteField = async ({
  profileId,
  sectionId,
  fieldId,
}: {
  profileId: string | undefined;
  sectionId: string | undefined;
  fieldId: string | undefined;
}) => {
  if (!profileId || !sectionId || !fieldId) { return; }
  const sectionRef = formsDb.sections(profileId).doc(sectionId);

  const updateData = {
    fieldOrder: FieldValue.arrayRemove(fieldId),
    [`fieldData.${fieldId}`]: FieldValue.delete(),
  };

  await sectionRef.update(updateData);
};

export const createNewForm = async ({
  profileId,
  data
}: {
  profileId: string | undefined;
  data: FormDoc;
}) => {
  if (!profileId) { return; }
  const formDocRef = formsDb.forms(profileId).doc();
  const writeToDb = await formDocRef.create(data);
  return { writeToDb, formId: formDocRef.id };
};

export const addOptionToField = async ({
  profileId,
  sectionId,
  fieldId,
  optionLabel,
}: {
  profileId: string | undefined;
  sectionId: string | undefined;
  fieldId: string | undefined;
  optionLabel: string;
}) => {
  if (!profileId || !sectionId || !fieldId) {
    return;
  }
  const fieldValue = formsDb.sections(profileId).doc().id;
  const sectionRef = formsDb.sections(profileId).doc(sectionId);
  const sectionSnap = await sectionRef.get();
  const sectionData = sectionSnap.data();
  if (!sectionData) {
    return;
  }

  const updateData = {
    [`fieldData.${fieldId}.options`]: FieldValue.arrayUnion({label: optionLabel, value: fieldValue})
  };

  // const fields = sectionData.fieldOrder.map((fieldId) => sectionData.fieldData[fieldId]);
  // const fieldIndex = fields.findIndex((field) => field.fieldId === fieldId);
  // if (fieldIndex < 0) {
  //   return;
  // }
  // const field = fields[fieldIndex];
  // const options = field.options || [];
  // const newOptions = [...options, { label: optionLabel, value: fieldValue }];

  // const modFields = [...fields];
  // modFields[fieldIndex] = { ...field, options: newOptions };
  // const updateData = {
  //   fields: modFields,
  // };

  await sectionRef.update(updateData);

};

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
    fieldOrder: FieldValue.arrayUnion( fieldId ),
    [`fieldData.${fieldId}`]: { ...field, fieldId },
  };
  // @ts-ignore
  await sectionRef.update(updateData);

  return { fieldId };
};

export const updateSectionDoc = async ({
  profileId,
  sectionId,
  updateData,
}: {
  profileId: string | undefined;
  sectionId: string | undefined;
  updateData: Partial<FormSection>;
}) => {
  if (!profileId || !sectionId) {
    return;
  }
  const sectionRef = formsDb.sections(profileId).doc(sectionId);

  // @ts-ignore
  const writeToDb = await sectionRef.update(updateData);

  return writeToDb;
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

export const removeSectionFromForm = async ({
  profileId,
  formId,
  sectionId,
}: {
  profileId: string | undefined;
  formId: string | undefined;
  sectionId: string | undefined;
}) => {
  if (!profileId || !formId || !sectionId) {
    return;
  }
  const formDocRef = formsDb.forms(profileId).doc(formId);
  const updateData = {
    sectionOrder: FieldValue.arrayRemove(sectionId),
  };
  await formDocRef.update(updateData);
};

export const addSectionToForm = async ({
  profileId,
  formId,
  sectionId,
}: {
  profileId: string | undefined;
  formId: string | undefined;
  sectionId: string | undefined;
}) => {
  if (!profileId || !formId || !sectionId) {
    return{error: true, message: 'Missing required data'};
  }
  const formDocRef = formsDb.forms(profileId).doc(formId);

  const updateData = {
    sectionOrder: FieldValue.arrayUnion(sectionId),
  };
  await formDocRef.update(updateData);
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
