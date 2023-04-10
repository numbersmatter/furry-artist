import type {
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";

// helper function to convert firestore data to typescript
const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
});

// helper to apply converter to multiple collections
export const dataPoint = <T extends FirebaseFirestore.DocumentData>(
  collectionPath: string
) => getFirestore().collection(collectionPath).withConverter(converter<T>());


interface UserDoc {
  defaultProfile: string,
  profileArray: string[],
}

export const dbBase = "database/version2";

export const mainDb = {
  profiles: () =>dataPoint(`${dbBase}/profiles/`),
  users: () =>dataPoint<UserDoc>(`${dbBase}/users/`),
};


export const getUserDoc =async (userId:string) => {
  const userDocRef = mainDb.users().doc(userId)
  const userDocSnap = await userDocRef.get();
  const userDocData = userDocSnap.data();

  return userDocData;
  
}
