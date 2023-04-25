import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useSubmit } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { destroySession, getSession } from "~/server/sessions";

export const action = async ({ request }: ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
};


export const loader = async ({ request }: LoaderArgs) => {
  return {}
};

export default function Logout() {
  let submit= useSubmit();
  let formRef = useRef(null);

  useEffect(() => {

  submit(formRef.current, {method: 'post'})
  }, []);


  return (
    <div>
      <h1>Logout</h1>
      <p>Press the button below to log out.</p>
      <Form ref={formRef} method="post">
        <button name="logout" type="submit">Logout</button>
      </Form>
    </div>
  );
}