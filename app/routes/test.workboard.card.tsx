import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  

  return json({});
}



export default function WorkboardArtistCard() {
  const { } = useLoaderData<typeof loader>();
  return (
    <div className="border-2 border-slate-600">
      <h1>WorkboardArtistCard</h1>
      <div>
        <input />
        <textarea />
      </div>
      <div>
        <h4>Progress 40%</h4>
        <ul>
          <li> intial sketch</li>
          <li> detailed sketch</li>
          <li> linework</li>
        </ul>
       
      </div>
    </div>
  );
}

function ProgressTaskList(){

}