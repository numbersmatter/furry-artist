import { NavLink } from "@remix-run/react";
import { SubmittedIntentDoc } from "~/server/db.server";

interface IntentListItem extends SubmittedIntentDoc {
  intentId: string,
  displayCreated:string
}


export default function NavCardList(
  { title, cardList, category }: {
    title: string,
    category: "review" | "hold" | "accepted" | "declined",
    cardList: IntentListItem[]
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
        {cardList.map((intentDoc) => (
          <li key={intentDoc.intentId} className="bg-white">
            <NavLink to={intentDoc.intentId ?? "error"}
              className={({ isActive }) => isActive ? "relative flex items-center space-x-3 px-6 py-5 bg-slate-400" : "relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:bg-gray-50"}
            >

              <div className="min-w-0 flex-1">

                {/* Extend touch target to entire panel */}
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{intentDoc.humanReadableId}</p>
                <p className="truncate text-sm text-gray-500">{intentDoc.displayCreated}</p>
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}




