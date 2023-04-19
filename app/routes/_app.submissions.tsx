import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { getProfilePageHeaderDoc } from "~/server/database/profile.server";
import { ArtistIntentReview, getArtistStatuses, getReviewStatusByIntentId, getSubmissionStatusByIntentId, getSubmittedIntents } from "~/server/database/submission.server";
import { baseLoader } from "~/server/user.server";
import SideColumnLayout from "~/ui/Layout/SideColumnLayout";

export async function action({ params, request }: ActionArgs) {


  return redirect('/');
}

export async function loader({ params, request }: LoaderArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    return redirect('/login');
  };
  if (!profileId) {
    return redirect('/profile-setup');
  }

  const pageHeaderData = await getProfilePageHeaderDoc(profileId)

  const statuses = await getArtistStatuses(profileId);


  // const intents = await getSubmittedIntents(profileId);
  // const submissionStatuses = intents.map((intent) => getReviewStatusByIntentId({ profileId, intentId: intent.intentId }));
  // const submissionStatusesResolved = await Promise.all(submissionStatuses);
  // const intentsWithStatus = intents.map((intent, index) => {
  //   const statusDoc = submissionStatusesResolved.find((status) => status?.submissionId === intent.intentId);

  //   if (!statusDoc) {
  //     return {
  //       ...intent,
  //       status: "review"
  //     }
  //   }
  //   return {
  //     ...intent,
  //     status: statusDoc.reviewStatus
  //   }
  // })

  const validStatuses = ["hold", "accepted", "declined"];

  const statusDocs = [
    {
      title: "Needs Review",
      category: "review",
      cardList: statuses.filter((statusDoc) => !validStatuses.includes(statusDoc.reviewStatus)),
    },
    {
      title: "Hold",
      category: "hold",
      cardList: statuses.filter((statusDoc) => statusDoc.reviewStatus === "hold"),
    },
    {
      title: "Accepted",
      category: "accepted",
      cardList: statuses.filter((statusDoc) => statusDoc.reviewStatus === "accepted")
      ,
    },
    {
      title: "Declined",
      category: "declined",
      cardList: statuses.filter((statusDoc) => statusDoc.reviewStatus === "declined"),
    },
  ]




  const avatarUrl = pageHeaderData?.avatar ?? ""

  return json({ avatarUrl, statusDocs });
};



export default function FormSubmissionsLayout() {
  const { avatarUrl, statusDocs } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="h-full w-full flex lg:pl-72 ">
        <div className="bg-slate-400 h-full inset-y-0 left-20 hidden w-96 overflow-y-auto border-r border-gray-200  lg:block">
          {/* Secondary column (hidden on smaller screens) */}
          <nav className="h-full overflow-y-auto bg-white" aria-label="Directory">
            {
              statusDocs.map((statusDoc) =>
                <NavCardList
                  key={statusDoc.category}
                  title={statusDoc.title}
                  //@ts-ignore 
                  category={statusDoc.category}
                  // @ts-ignore 
                  cardList={statusDoc.cardList} />
              )
            }
          </nav>

        </div>
        <Outlet />
      </div>
    </>
  );
}

interface StatusCard extends ArtistIntentReview {
  statusId: string;
}

export function NavCardList(
  { title, cardList, category }: {
    title: string,
    category: "review" | "hold" | "accepted" | "declined",
    cardList: StatusCard[]
  }
) {

  const categoryColor = {
    review: "bg-orange-300",
    hold: "bg-yellow-300",
    accepted: "bg-green-300",
    declined: "bg-red-300"
  }

  return (
    <div key={category} className="relative">
      <div className={
        `sticky top-0 z-10 border-t border-b border-gray-200 ${categoryColor[category]} px-6 py-1 text-sm font-medium text-gray-500`
      }
      >
        <h3 className="text-xl" >{title} ( {cardList.length} )</h3>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200">
        {cardList.map((statusCard) => (
          <li key={statusCard.humanReadableId} className="bg-white">
            <NavLink to={statusCard.statusId ?? "error"}
              className={({ isActive }) => isActive ? "relative flex items-center space-x-3 px-6 py-5 bg-slate-400" : "relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:bg-gray-50"}
            >

              <div className="min-w-0 flex-1">

                {/* Extend touch target to entire panel */}
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{statusCard.humanReadableId}</p>
                <p className="truncate text-sm text-gray-500">{statusCard.formName}</p>
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
