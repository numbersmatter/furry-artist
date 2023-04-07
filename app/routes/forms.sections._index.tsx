import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import { getFormSections } from "~/server/database/forms.server";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);

  const sections = await getFormSections( userDoc?.defaultProfile);



  

  return json({sections});
}



export default function FormSections() {
  const { sections } = useLoaderData<typeof loader>();
  return (
    <div className="my-4 divide-y divide-gray-200 overflow-hidden sm:rounded-lg bg-white shadow">
    <div className="px-4 py-5 sm:px-6">
      <h3 className="text-2xl">
        Form Sections
        </h3>
    </div>
    <div className="px-4 py-5 sm:p-6">
      <ul className=" grid grid-cols-1 gap-2 divide-y divide-gray-300">
        {sections.map((section) => (
          <li key={section.sectionId} className="py-5">
            <Link className="relative focus-within:ring-2 focus-within:ring-indigo-500" to={`/forms/sections/${section.sectionId}`}>
                <h3 className="text-sm font-semibold text-gray-800">
                    {section.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{section.text}</p>
              </Link>
          
          </li>
        ))}
          <li className="py-5">
            <Link className="relative focus-within:ring-2 focus-within:ring-indigo-500" to={`/forms/sections/create-new`}>
                <h3 className="text-sm font-semibold text-gray-800">
                    Create New Section
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  Create a new section to add to your forms.
                </p>
              </Link>
          
          </li>
      </ul>
    </div>
  </div>  );
}