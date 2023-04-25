import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "react-router";
import { getUserIfSignedIn } from "~/server/auth.server";
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import { CursorArrowRaysIcon, EnvelopeOpenIcon, UsersIcon } from '@heroicons/react/24/outline'

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const userRecord = await getUserIfSignedIn(request);

  const isSignedIn = userRecord ? true : false;

  if(!isSignedIn){
    return redirect('/login')
  }
  return json({})
};



export default function DashboardHomepage() {
  return (
    <div className="h-full w-full lg:pl-72 ">
    <header className="bg-gray-50 py-8">
      <h1 className="mt-2 ml-4 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Dashboard 
      </h1>
    </header>
    <div className="px-4 py-3">

    <StatsList />
    </div>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}



const stats = [
  { id: 1, name: 'Open Forms', stat: '2', icon: UsersIcon, change: '122', changeType: 'increase' },
  { id: 2, name: 'Requests to Review', stat: '5', icon: EnvelopeOpenIcon, change: '5.4%', changeType: 'increase' },
  { id: 3, name: 'Active in Workboard', stat: '8', icon: CursorArrowRaysIcon, change: '3.2%', changeType: 'decrease' },
]

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function StatsList() {
  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900">Last 30 days</h3>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
            
              <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    {' '}
                    View all<span className="sr-only"> {item.name} stats</span>
                  </a>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

