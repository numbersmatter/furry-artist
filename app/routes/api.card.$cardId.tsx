import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getReviewStatusByIntentId, getSubmissionbyId } from "~/server/database/submission.server";
import { getCardById } from "~/server/database/workboard.server";
import { baseLoader } from "~/server/user.server";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) return redirect('/login');
  if (!profileId) return redirect('/setup-profile');
  const { cardId } = params;

  const cardDoc = await getCardById({
    profileId,
    cardId,
  });

  if (!cardDoc) return json({ error: 'Card not found', status: 404});

  return json({ cardDoc });
}



