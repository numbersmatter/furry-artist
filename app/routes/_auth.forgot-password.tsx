import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { useCallback, useState } from "react";
import { checkSessionCookie, signIn, signInWithToken } from "~/server/auth.server";
import { getRestConfig } from "~/server/firebase.server";
import { commitSession, getSession } from "~/server/sessions";
import * as firebaseRest from "~/server/firebase-rest";
import { LockClosedIcon } from "@heroicons/react/20/solid";




export async function loader({ params, request }: LoaderArgs) {
  const session = await getSession(request.headers.get("cookie"));
  const { uid } = await checkSessionCookie(session);
  const headers = {
    "Set-Cookie": await commitSession(session),
  };
  if (uid) {
    return redirect("/", { headers });
  }
  const { apiKey, domain } = getRestConfig();

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pageDetails = {
    logo: "https://firebasestorage.googleapis.com/v0/b/component-sites.appspot.com/o/furrymarketplace%2FFM%20logo%201.png?alt=media&token=c5e02204-27f3-4996-ac93-738f589826fb"
  }


  return json({ apiKey, domain }, { headers },);


}

type ActionData = {
  error?: string;
  success?: boolean;
  message?: string;
};


export default function ForgotPasswordPage() {
  const [clientAction, setClientAction] = useState<ActionData>();
  const restConfig = useLoaderData<typeof loader>();
  const submit = useSubmit();



  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // To avoid rate limiting, we sign in client side if we can.
      const sendPasswordRest = await firebaseRest.requestResetPassword(
        {
          email: event.currentTarget.email.value,
          requestType: "PASSWORD_RESET"
        },
        restConfig
      );
      if (firebaseRest.isError(sendPasswordRest)) {
        setClientAction({ error: sendPasswordRest.error.message });
        return;
      }
      setClientAction({ success: true, message: "Password reset email sent to " });
    },
    [submit, restConfig]
  );
  return (
    <form method="post" onSubmit={handleSubmit}>

      <ForgotPassword clientAction={clientAction} />
    </form>
  );
}


function ForgotPassword(props: { clientAction: any, }) {
  const { clientAction, } = props;
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
              Forgot Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Return to Login Screen
              </Link>
            </p>
            {(clientAction?.error) && (
              <p>{clientAction?.error}</p>
            )}
            {(clientAction?.success) && (
              <p>{clientAction?.message}</p>
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

          </div>


          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
              </span>
              Send Password Reset Email
            </button>
          </div>
        </div>
      </div>
    </>
  )
}


