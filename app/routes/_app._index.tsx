import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "react-router";
import { getUserIfSignedIn } from "~/server/auth.server";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { CursorArrowRaysIcon, EnvelopeOpenIcon, UsersIcon } from '@heroicons/react/24/outline'
import { Link } from "@remix-run/react";
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'


export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const userRecord = await getUserIfSignedIn(request);

  const isSignedIn = userRecord ? true : false;

  if (!isSignedIn) {
    return redirect('/login')
  }
  return json({})
};



export default function DashboardHomepage() {
  return (
    <div className="flex-1">
      <header className="bg-gray-50 py-2">
        <h1 className="mt-2 ml-4 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard
        </h1>
      </header>
      <EpicBlock />
      <SprintBlock />
    </div>
  );
};

function EpicBlock() {
  return (
    <div className="overflow-hidden bg-gray-50 ">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MainStatCard
            cardLabel="Revenue"
            mainValue="$500"
            mainValueLabel="EARNED"
            secondaryValue="$1000"
            secondaryValueLabel="Potential"
          />
          <MainStatCard
            cardLabel="Task Points"
            mainValue="120"
            mainValueLabel="Points Completed"
            secondaryValue="240"
            secondaryValueLabel="Total Task Points"
          />
        </div>
        <ProjectOverView />
      </div>
    </div>
  )
};


function ProjectOverView() {
  return (
    <div className="pt-3">
      <h3 className="text-base font-semibold leading-6 text-gray-900">
        Project Overview
      </h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="relative overflow-hidden bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Projects Not Started
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            8
          </dd>
        </div>
        <div className="relative overflow-hidden bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Projects In Progress
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            8
          </dd>
        </div>
        <div className="relative overflow-hidden bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Projects Completed
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            8
          </dd>
        </div>
      </dl>
    </div>
  )
}

function MainStatCard(
  { cardLabel, mainValue, mainValueLabel, secondaryValue, secondaryValueLabel, }: {
    cardLabel: string,
    mainValue: string,
    mainValueLabel: string,
    secondaryValue: string,
    secondaryValueLabel: string,
  }
) {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-2 sm:px-6">
        {/* Content goes here */}
        {cardLabel}
        {/* We use less vertical padding on card headers on desktop than on body sections */}
      </div>
      <div className="px-4 py-5 sm:p-6">
        {/* Content goes here */}
        <div>
          <p className="mt-2 flex items-baseline gap-x-2">
            <span className="text-4xl font-semibold tracking-tight text-slate-700">
              {mainValue}
            </span>
            <span className="text-sm text-gray-400">{mainValueLabel}</span>
          </p>
        </div>
        <div>
          <p className="mt-2 flex items-baseline gap-x-2">
            <span className="text-base font-semibold tracking-tight text-slate-600">
              {secondaryValue}
            </span>
            <span className="text-sm text-gray-400">{secondaryValueLabel}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
function SprintBlock() {
  return (
    <div className="overflow-hidden bg-gray-50 ">
      <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex-auto">
            <h3 className="text-xl font-semibold leading-6 text-gray-900">
              Project Spotlight!
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              You are almost done with this project. Keep up the good work!
            </p>
          </div>
        <div
          className="mx-auto mt-1 max-w-md"
        >


          <FocusedProjectCard />

        </div>
        <ProjectListed />
      </div>
    </div>
  )
}

function FocusedProjectCard() {
  return (
    <div className="overflow-hidden  bg-white shadow sm:rounded-lg">
      <div className="py-2 px-1 flex flex-row justify-between ">
        <p>Indoor Bird Watching</p>
        <p>[80% completed]</p>
      </div>
      <div className="mt-2 max-w-xl px-3 py-2  text-sm text-gray-500">
        <p>Next task</p>
        <ul>
          <li className=" flex rounded-md shadow-sm bg-green-500" >

            <div
              className={'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white'
              }
            >
              <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />

            </div>
            <div className="flex flex-1 items-center justify-between truncate">
              <div className="flex-1 truncate px-4 py-2 text-sm">
                <p className="font-medium text-gray-900 hover:text-gray-600">
                  Linework
                </p>

              </div>
              <div className="flex-shrink-0 pr-2">
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div className="py-1">
        <button
          type="button"
          className="block mx-auto rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go to Project
        </button>      </div>
    </div>
  )
}


const projectsTableList = [
  { name: 'Lindsay Walton', type: 'Front-end Developer', Progress: 'lindsay.walton@example.com', role: 'Member' },
  // More people...
]

function ProjectListed() {
  return (
    <div className="px-4 py-6  sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Project Table
          </h3>
          <p className="mt-2 text-sm text-gray-700">
            A list of all your projects in this Epic.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">

        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className=" overflow-x-auto hidden md:block">
          <ProjectTable />
        </div>
        <div className="block md:hidden" >

          <ProjectStackList />
        </div>
      </div>
    </div>
  )
}

function ProjectTable() {
  return (
    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
              <button className="group inline-flex">
                Name
                <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                  <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </button>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              <button className="group inline-flex">
                Type
                <span className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200">
                  <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </button>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              <button className="group inline-flex">
                Percent Complete
                <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                  <ChevronDownIcon
                    className="invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-0">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {projectsTableList.map((person) => (
            <tr key={person.Progress}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                {person.name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                  Commission
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="relative pt-1">
                  <div className="w-full h-2 bg-blue-200 rounded-full">
                    <div className="w-2/3 h-full text-center text-xs text-white bg-blue-600 rounded-full">
                    </div>
                  </div>
                </div></td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
                <Link
                  to="/"
                  className="text-indigo-600 hover:text-indigo-900">
                  Edit<span className="sr-only">, {person.name}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


const statuses = {
  Complete: 'text-green-700 bg-green-50 ring-green-600/20',
  'In progress': 'text-gray-600 bg-gray-50 ring-gray-500/10',
  Archived: 'text-yellow-800 bg-yellow-50 ring-yellow-600/20',
}
const projects = [
  {
    id: 1,
    name: 'GraphQL API',
    href: '#',
    status: 'Complete',
    createdBy: 'Leslie Alexander',
    dueDate: 'March 17, 2023',
    dueDateTime: '2023-03-17T00:00Z',
  },
  {
    id: 2,
    name: 'New benefits plan',
    href: '#',
    status: 'In progress',
    createdBy: 'Leslie Alexander',
    dueDate: 'May 5, 2023',
    dueDateTime: '2023-05-05T00:00Z',
  },
  {
    id: 3,
    name: 'Onboarding emails',
    href: '#',
    status: 'In progress',
    createdBy: 'Courtney Henry',
    dueDate: 'May 25, 2023',
    dueDateTime: '2023-05-25T00:00Z',
  },
  {
    id: 4,
    name: 'iOS app',
    href: '#',
    status: 'In progress',
    createdBy: 'Leonard Krasner',
    dueDate: 'June 7, 2023',
    dueDateTime: '2023-06-07T00:00Z',
  },
  {
    id: 5,
    name: 'Marketing site redesign',
    href: '#',
    status: 'Archived',
    createdBy: 'Courtney Henry',
    dueDate: 'June 10, 2023',
    dueDateTime: '2023-06-10T00:00Z',
  },
]


function ProjectStackList() {
  return (
    <ul role="list" className="divide-y divide-gray-100">
      {projects.map((project) => (
        <li key={project.id} className="flex items-center justify-between gap-x-6 py-5">
          <div className="min-w-0">
            <div className="flex items-start gap-x-3">
              <p className="text-sm font-semibold leading-6 text-gray-900">{project.name}</p>
              <p
                className={classNames(
                  // @ts-ignore
                  statuses[project.status],
                  'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset'
                )}
              >
                {project.status}
              </p>
            </div>
            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
              <p className="whitespace-nowrap">
                Due on <time dateTime={project.dueDateTime}>{project.dueDate}</time>
              </p>
              <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                <circle cx={1} cy={1} r={1} />
              </svg>
              <p className="truncate">Created by {project.createdBy}</p>
            </div>
          </div>
          <div className="flex flex-none items-center gap-x-4">
            <a
              href={project.href}
              className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
            >
              View project<span className="sr-only">, {project.name}</span>
            </a>
            <Menu as="div" className="relative flex-none">
              <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                <span className="sr-only">Open options</span>
                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-50' : '',
                          'block px-3 py-1 text-sm leading-6 text-gray-900'
                        )}
                      >
                        Edit<span className="sr-only">, {project.name}</span>
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-50' : '',
                          'block px-3 py-1 text-sm leading-6 text-gray-900'
                        )}
                      >
                        Move<span className="sr-only">, {project.name}</span>
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-50' : '',
                          'block px-3 py-1 text-sm leading-6 text-gray-900'
                        )}
                      >
                        Delete<span className="sr-only">, {project.name}</span>
                      </a>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </li>
      ))}
    </ul>
  )
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

