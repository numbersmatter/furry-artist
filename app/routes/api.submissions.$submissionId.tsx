import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getReviewStatusByIntentId, getSubmissionbyId } from "~/server/database/submission.server";
import { baseLoader } from "~/server/user.server";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) return redirect('/login');
  if (!profileId) return redirect('/setup-profile');
  const { submissionId } = params;

  const reviewStatus = await getReviewStatusByIntentId({ profileId, intentId: submissionId });

  const submissionDoc = await getSubmissionbyId({ profileId, submissionId: submissionId });
  if (!submissionDoc) {
    return json({ error:"No submission", submissionId })
  }

  return json({ submissionDoc, reviewStatus });


}



