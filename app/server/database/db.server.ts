import { BriefcaseIcon, ClipboardDocumentIcon, HomeIcon, InboxIcon, MegaphoneIcon, UserIcon } from "@heroicons/react/20/solid";
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


export interface ProjectTypes {
  typeOrder: string[],
  types: { [key:string]: {initials: string, label: string}}
}

export interface UserDoc {
  defaultProfile: string,
  profileArray: string[],
}

export const dbBase = "database/version2";

export const mainDb = {
  profiles: () =>dataPoint(`${dbBase}/profiles/`),
  users: () =>dataPoint<UserDoc>(`${dbBase}/users/`),
  assets: (profileId:string)=> dataPoint(`${dbBase}/profiles/${profileId}/profile_assets`)
};

export const getUUID = ()=> mainDb.profiles().doc().id 

export const getProjectTypeDoc = async ( profileId: string)=>{
  const docRef = mainDb.assets(profileId).doc("projectTypes")
  const docSnap = await docRef.get();
  const docData = docSnap.data();

  if(!docData){
    return undefined
  }
  // @ts-ignore
  return docData as ProjectTypes
}

export const getProfileDoc = async (profileId: string) => {
  const docRef = mainDb.profiles().doc(profileId);
  const docSnap = await docRef.get();
  const docData = docSnap.data();
  return docData;
};

export const createProfileDoc = async (profileId: string) => {
  const docRef = mainDb.profiles().doc(profileId);

  const writeToDb = await docRef.create({
      createdAt: FieldValue.serverTimestamp(),
    });

  return writeToDb;
};

export const updateUserDoc = async (userId: string, profileId: string) => {
  const userDocRef = mainDb.users().doc(userId);
  const updateData = {
    defaultProfile: profileId, 
    profileArray: FieldValue.arrayUnion(profileId)
  }
  const updateToDb = await userDocRef.set(updateData, {merge: true});
  return updateToDb;
};


export const getUserDoc =async (userId:string) => {
  const userDocRef = mainDb.users().doc(userId)
  const userDocSnap = await userDocRef.get();
  const userDocData = userDocSnap.data();

  return userDocData;
  
}

export const navigation = [
  { name: 'Home', to: '/', icon: HomeIcon },
  { name: 'Make Forms', to: '/forms', icon: ClipboardDocumentIcon },
  { name: 'Open Forms', to: '/forms/open-forms', icon: MegaphoneIcon },
  { name: 'Responses', to: '/opportunities', icon: InboxIcon },
  { name: 'Workboard', to: '/Workboard', icon: BriefcaseIcon },
  { name: 'Profile', to: '/site/profile', icon: UserIcon },
]

