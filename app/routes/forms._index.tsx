import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/20/solid'
import { baseLoader, redirectOnNoUserOrNoProfile } from "~/server/user.server";
import { getAllForms } from "~/server/database/forms.server";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  const {profileId, userRecord} = await baseLoader(request);
  if(!userRecord){
    return redirect('/login');
  };
  if(!profileId){
    return redirect('/profile-setup');
  }

  const profileForms = await getAllForms({profileId});

  const formsList = profileForms.map( doc=>({
    formId:doc.formId,
    name: doc?.name ?? "no name",
    text: doc.text ?? ""
  }))
  
  return json({formsList});
}



export default function FormsIndex() {
  const { formsList} = useLoaderData<typeof loader>();
  
  return (
    <div className="mx-0 sm:mx-4 sm:my-4">
      <ul className="grid grid-cols-1 gap-4"  >
        {
          formsList.map((form)=>
          // @ts-ignore
          <FormsCard key={form.formId} form={form}/>
          )
          
        }
        <li>
          <Link to="/forms/new" className="block bg-white sm:rounded-lg hover:bg-gray-50">
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium text-indigo-600">
                  Create new form
                </p>
              </div>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
}


const positions = [
  {
    id: 1,
    title: 'Back End Developer',
    type: 'Full-time',
    location: 'Remote',
    department: 'Engineering',
    closeDate: '2020-01-07',
    closeDateFull: 'January 7, 2020',
  },
  {
    id: 2,
    title: 'Front End Developer',
    type: 'Full-time',
    location: 'Remote',
    department: 'Engineering',
    closeDate: '2020-01-07',
    closeDateFull: 'January 7, 2020',
  },
  {
    id: 3,
    title: 'User Interface Designer',
    type: 'Full-time',
    location: 'Remote',
    department: 'Design',
    closeDate: '2020-01-14',
    closeDateFull: 'January 14, 2020',
  },
]

function StackedList(props: {
  children: React.ReactNode,
}) {
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul  className="divide-y divide-gray-200">
          {props.children}
      </ul>
    </div>
  )
}



function FormsCard( props: {form: {formId:string, name: string, text:string}}){
  const form = props.form

  return (
      <li >
        <Link to={form.formId} className="block bg-white sm:rounded-lg hover:bg-gray-50">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-medium text-indigo-600"> 
                {form.name}
              </p>
              <div className="ml-2 flex flex-shrink-0">
                <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                  type
                </p>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  {form.text}
                  </p>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
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