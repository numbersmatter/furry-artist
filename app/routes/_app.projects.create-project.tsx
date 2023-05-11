import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { isRouteErrorResponse, Outlet, useLoaderData, useRouteError } from "@remix-run/react";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  

  return json({});
}



export default function CreateProjectLayout() {
  const { } = useLoaderData<typeof loader>();
  return (
    <Outlet />
  );
}

export function ErrorBoundary(){
  const error = useRouteError();
  if(isRouteErrorResponse(error)){
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    )
  } else if ( error instanceof Error ){
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The Stack Trace is:</p>
        <p>{error.stack}</p>
      </div>
    );
  }else {
    return <h1>Unknown Error</h1>;
  }

}
