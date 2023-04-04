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
export interface  FormSection{
  sectionId: string;
  fields: Field[];
  name: string;
  text: string;
  type?: "imageUpload" | "fields"
}[];


const formsDb = {
  forms: (profileId: string) =>
    dataPoint<FormDoc>(`${dbBase}/profiles/${profileId}/forms`),
};

export const getFormById = async ({
  profileId,
  formId,
}: {
  profileId: string | undefined;
  formId: string | undefined;
}) => {
  if( !profileId || !formId){
    return undefined
  }

  const formDocRef = formsDb.forms(profileId).doc(formId);
  const formSnap = await formDocRef.get();
  const formData = formSnap.data();

  return formData ? {...formData, formId} : undefined
};
