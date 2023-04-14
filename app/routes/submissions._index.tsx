import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { NavCardList } from "./submissions";

export async function action({ params, request }: ActionArgs) {


  return redirect('/');
}

export async function loader({ params, request }: LoaderArgs) {


  return json({});
}



export default function SubmissionIndexPage() {
  const { } = useLoaderData<typeof loader>();
  // @ts-ignore
  const {  statusDocs } = useRouteLoaderData("routes/submissions");
  return (
    <div className="h-full w-full">
      <div className="bg-slate-400 h-full w-96 overflow-y-auto border-r border-gray-200 lg:hidden  ">
        {/* Secondary column (hidden on smaller screens) */}
        <nav className="h-full overflow-y-auto bg-white" aria-label="Directory">
          {
            statusDocs.map((category: any) =>
              <NavCardList
                key={category.category}
                title={category.title}
                //@ts-ignore 
                category={category.category}
                // @ts-ignore 
                cardList={category.cardList} />
            )
          }
        </nav>

      </div>

    </div>
  );
}