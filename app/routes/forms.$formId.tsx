import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import type { ReactNode } from "react";
import { requireAuth } from "~/server/auth.server";
import { getUserDoc } from "~/server/database/db.server";
import type { FormSection} from "~/server/database/forms.server";
import { getFormById, getFormSections } from "~/server/database/forms.server";

export async function action({ params, request }: ActionArgs) {
  let formData = await request.formData();
  let { _action, ...values} =  Object.fromEntries(formData);
  
  if(_action ==="moveUp"){
    
  }
  if(_action ==="moveDown"){

  }

  return json({});
}

export async function loader({ params, request }: LoaderArgs) {
  const userRecord = await requireAuth(request);
  const userDoc = await getUserDoc(userRecord.uid);

  const formData = await getFormById({
    profileId: userDoc?.defaultProfile,
    formId: params.formId
  })
  const sections = await getFormSections(userDoc?.defaultProfile);


  return json({ formData, sections });
}



export default function FormIdPAge() {
  const { formData, sections } = useLoaderData<typeof loader>();
  return (
    <div className="px-0 py-0 sm:py-2 sm:px-4">
      <SectionPanel name={formData?.name ?? ""} text={formData?.text ?? ""} >
        <StackedList>
          {
            formData?.sectionOrder.map(sectionId => {
              const formSection = sections
                .find(section => section.sectionId === sectionId);


              return <SectionCard
                key={sectionId}
                sectionId={sectionId}
                section={formSection} />
            })
          }
        </StackedList>
      </SectionPanel>
    </div>
  );
}

function SectionPanel(props: { name: string, text: string, children: ReactNode }) {

  return (
    <div className="bg-white  px-4 py-5 shadow sm:rounded-lg sm:p-6">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-2xl font-semibold leading-6 text-gray-900">{props.name}</h3>
            <p className="mt-1 text-base text-gray-500">
              {props.text}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};


function StackedList(props: {
  children: React.ReactNode,
}) {
  return (
    <div className=" sm:col-span-6 overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {props.children}
      </ul>
    </div>
  )
}


function SectionCard( props: {
    section: FormSection | undefined, 
    sectionId: string
  }) 
{
  let fetcher = useFetcher();
  const section = props.section

  if (!section) {
    return (
      <li >
        <Link to={props.sectionId} className="block hover:bg-gray-50">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-medium text-indigo-600">
                Error No Data for this section found.
              </p>
              <div className="ml-2 flex flex-shrink-0">
                <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                  type
                </p>
                <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                  type 2
                </p>

              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  No section data found
                </p>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">

                <p>
                  Closing on
                </p>
              </div>
            </div>
          </div>
        </Link>
      </li>

    )
  }

  return (
    <li >
      <div className="block h-20 px-4  bg-slate-300 items-center">
        {/* <div className="px-4 py-4 sm:px-6"> */}
        <div className="flex h-full items-center justify-between">
          <p className="truncate text-sm font-medium text-indigo-600">
            {section.name}
          </p>
          <div className="w-2/4 flex items-center justify-between">
            <div>
              <Link to={section.sectionId}>
                go to section
              </Link>
            </div>
            <fetcher.Form className="ml-2 grid grid-cols-2 gap-4">
              <input 
                hidden 
                name="sectionId" 
                value={props.sectionId} 
              />
              <button
                type="submit"
                name="_action"
                value={"moveUp"}
                >
                <ArrowUpIcon
                  className="mr-3 text-green-500 h-12 w-12 flex-shrink-0" aria-hidden="true"
                  />
              </button>
              <button
                type="submit"
                name="_action"
                value="moveDown"
              >
                <ArrowDownIcon
                  className="mr-1.5 text-red-500 h-12 w-12 flex-shrink-0" aria-hidden="true"
                />
              </button>
            </fetcher.Form>
          </div>
        </div>
      </div>
      {/* </div> */}
    </li>

  )
}