import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import BoardSectionList from "~/ui/Workboard/BoardSectionList";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  

  return json({});
}



export default function FormSections() {
  const { } = useLoaderData<typeof loader>();
  return (
    <BoardSectionList />
  );
}