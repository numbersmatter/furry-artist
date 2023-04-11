import { redirect } from "@remix-run/node";
import type { UserRecord } from "firebase-admin/auth";
import { getUserIfSignedIn } from "./auth.server";
import { getUserDoc, UserDoc } from "./database/db.server";

interface UserDetails {
  userRecord: UserRecord | undefined;
  profileId: string | undefined;
}

// This is the base loader for all pages that require a user to be signed in
// and have a profile setup.
// @ts-ignore
export const baseLoader = async (request: Request): Promise<UserDetails> => {
  const userRecord = await getUserIfSignedIn(request);
  if (!userRecord) {
    return {
      profileId: undefined,
      userRecord: undefined,
    };
  }
  const userDoc = await getUserDoc(userRecord.uid);
  if (!userDoc) {
    return {
      profileId: undefined,
      userRecord,
    };
  }
  const profileId = userDoc.defaultProfile;
  return { profileId, userRecord };
};

export const redirectOnNoUserOrNoProfile = ({
  userDoc,
  userRecord,
}: {
  userDoc: UserDoc | undefined;
  userRecord: UserRecord | undefined;
}) => {
  if (!userRecord) {
    return redirect("/login");
  }
  if (!userDoc) {
    return redirect("/setup-profile");
  }
};
