import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export default function App() {
  return (
    <html className="min-h-screen bg-gray-100" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-200 min-h-screen flex">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
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

