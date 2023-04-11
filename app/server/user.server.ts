import { redirect } from "@remix-run/node";
import { getUserIfSignedIn } from "./auth.server";
import { getUserDoc } from "./database/db.server";



export const baseLoader = async (request: Request) => {
  const userRecord = await getUserIfSignedIn(request);
  if (!userRecord) {
    return redirect('/login')
  }
  const userDoc = await getUserDoc(userRecord.uid)
  if (!userDoc) {
    return redirect('/setup-profile')
  }
  return { userDoc, userRecord };
}

