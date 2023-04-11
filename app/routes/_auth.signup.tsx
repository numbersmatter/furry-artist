import { LockClosedIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";

import { checkSessionCookie, signUp } from "~/server/auth.server";
import { commitSession, getSession } from "~/server/sessions";

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get("cookie"));
  const { uid } = await checkSessionCookie(session);
  const headers = {
    "Set-Cookie": await commitSession(session),
  };
  if (uid) {
    return redirect("/", { headers });
  }
  return json(null, { headers });
};

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const formError = json({ error: "Please fill all fields!" }, { status: 400 });
  if (typeof email !== "string") return formError;
  if (typeof password !== "string") return formError;
  try {
    const sessionCookie = await signUp( email, password);
    const session = await getSession(request.headers.get("cookie"));
    session.set("session", sessionCookie);
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error(error);
    return json({ error: String(error) }, { status: 401 });
  }
};

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  return (
    <Form method="POST">
    <SignUpScreen actionData={actionData} clientAction={undefined}/>
    </Form>
    // <div>
    //   <h1>Join</h1>
    //   {actionData?.error ? <p>{actionData.error}</p> : null}
    //   <Form method="post">
    //     <input
    //       style={{ display: "block" }}
    //       name="name"
    //       placeholder="Peter"
    //       type="text"
    //     />
    //     <input
    //       style={{ display: "block" }}
    //       name="email"
    //       placeholder="you@example.com"
    //       type="email"
    //     />
    //     <input
    //       style={{ display: "block" }}
    //       name="password"
    //       placeholder="password"
    //       type="password"
    //     />
    //     <button style={{ display: "block" }} type="submit">
    //       Join
    //     </button>
    //   </Form>
    //   <p>
    //     Do you want to <Link to="/login">login</Link>?
    //   </p>
    // </div>
  );
}


function SignUpScreen(props: { clientAction:any, actionData:any}) {
  const {clientAction, actionData} = props;
  return (
    <>
    
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="https://firebasestorage.googleapis.com/v0/b/component-sites.appspot.com/o/furrymarketplace%2FFM%20logo%201.png?alt=media&token=c5e02204-27f3-4996-ac93-738f589826fb"
              alt="Your Company"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Create a NEW Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Login in to an existing account
              </Link>
            </p>
            {(clientAction?.error || actionData?.error) && (
        <p>{clientAction?.error || actionData?.error}</p>
      )}
          </div>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                </span>
                Sign in
              </button>
            </div>
        </div>
      </div>
    </>
  )
}
