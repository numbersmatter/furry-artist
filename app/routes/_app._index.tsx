import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { getUserIfSignedIn } from "~/server/auth.server";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { CursorArrowRaysIcon, EnvelopeOpenIcon, UsersIcon } from '@heroicons/react/24/outline'
import { Link, useLoaderData } from "@remix-run/react";
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { defaultProgressTracker, getEpicProjects, StandardProject } from "~/server/database/workboard.server";
import { baseLoader } from "~/server/user.server";


export const meta: V2_MetaFunction = () => {
  return [{ title: "Furbrush" }];
};

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

// convert category to css class
const returnCssClass = (category: number) => {
  if (category == 0) {
    return "w-0"
  }
  if (category > 12) {
    return "w-full"
  }
  if (category === 1) {
    return "w-1/12"
  }
  if (category === 2) {
    return "w-2/12"
  }
  if (category === 3) {
    return "w-3/12"
  }
  if (category === 4) {
    return "w-4/12"
  }
  if (category === 5) {
    return "w-5/12"
  }
  if (category === 6) {
    return "w-6/12"
  }
  if (category === 7) {
    return "w-7/12"
  }
  if (category === 8) {
    return "w-8/12"
  }
  if (category === 9) {
    return "w-9/12"
  }
  if (category === 10) {
    return "w-10/12"
  }
  if (category === 11) {
    return "w-11/12"
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    return redirect('/login');
  };
  if (!profileId) {
    return redirect('/profile-setup');
  }

  //  get all non-archived projects
  const projects = await getEpicProjects({ profileId })

  // standardize the projects
  const projectsStandardized = projects.map(project => {
    const progressTracker = project.progressTracker ?? defaultProgressTracker;
    const userTitle = project.userTitle ?? project.cardTitle;
    const userNotes = project.userNotes ?? "";
    const invoiced = project.invoiced ?? 0;

    return { ...project, progressTracker, userTitle, userNotes, invoiced }
  });

  const projectsWithTaskPoints = projectsStandardized.map(project => {
    const taskPoints = project.progressTracker.taskOrder
      .reduce((acc, taskId) => {
        const task = project.progressTracker.tasks[taskId];
        return acc + task.progress;
      }, 0);

    const completedTaskIds = project.progressTracker.taskOrder
      .filter(taskId => {
        const task = project.progressTracker.tasks[taskId];
        return task.complete === true;
      });
    const completedTaskPoints = completedTaskIds.reduce((acc, taskId) => {
      const task = project.progressTracker.tasks[taskId];
      return acc + task.progress;
    }, 0);

    return { ...project, taskPoints, completedTaskPoints }
  });





  return json({ projectsWithTaskPoints, profileId })
};



export default function DashboardHomepage() {
  const { projectsWithTaskPoints } = useLoaderData<typeof loader>();

  const nonCompletedProjects = projectsWithTaskPoints.filter(project => project.completedTaskPoints < project.taskPoints);

  return (
    <div className="flex-1">
      <header className="bg-gray-50 py-2">
        <h1 className="mt-2 ml-4 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard
        </h1>
      </header>
      <EpicBlock epicProjects={projectsWithTaskPoints} />
      <SprintBlock sprintProjects={nonCompletedProjects} />
    </div>
  );
};


// 
// Start Epic Block
// 
// 
function EpicBlock({ epicProjects }: { epicProjects: StandardProject[] }) {
  const epicTaskPoints = epicProjects.reduce((acc, project) => {
    return acc + project.taskPoints;
  }, 0);

  const completedEpicTaskPoints = epicProjects.reduce((acc, project) => {
    return acc + project.completedTaskPoints;
  }, 0);

  const projectsNotStarted = epicProjects.filter(project => project.completedTaskPoints === 0);
  const projectsInProgress = epicProjects.filter(project => project.completedTaskPoints > 0 && project.completedTaskPoints < project.taskPoints);
  const projectsCompleted = epicProjects.filter(project => project.completedTaskPoints === project.taskPoints);

  const projectsOverView = {
    projectsNotStarted,
    projectsInProgress,
    projectsCompleted
  }

  // description of earnings
  const totalInvoiced = epicProjects.reduce((acc, project) => {
    return acc + project.invoiced;
  }, 0);

  const totalEarned = totalInvoiced * completedEpicTaskPoints / epicTaskPoints;





  return (
    <div className="overflow-hidden bg-gray-50 ">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MainStatCard
            cardLabel="Revenue"
            mainValue={`$ ${totalEarned.toString()} `}
            mainValueLabel="EARNED"
            secondaryValue={`$ ${totalInvoiced.toString()}`}
            secondaryValueLabel="Potential"
          />
          <MainStatCard
            cardLabel="Task Points"
            mainValue={completedEpicTaskPoints.toString()}
            mainValueLabel="Points Completed"
            secondaryValue={epicTaskPoints.toString()}
            secondaryValueLabel="Total Task Points"
          />
        </div>
        <ProjectOverView projectsOverView={projectsOverView} />
      </div>
    </div>
  )
};

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

function ProjectOverView({ projectsOverView }: { projectsOverView: { projectsNotStarted: StandardProject[], projectsInProgress: StandardProject[], projectsCompleted: StandardProject[] } }) {
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
            {projectsOverView.projectsNotStarted.length}
          </dd>
        </div>
        <div className="relative overflow-hidden bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Projects In Progress
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {projectsOverView.projectsInProgress.length}
          </dd>
        </div>
        <div className="relative overflow-hidden bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Projects Completed
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {projectsOverView.projectsCompleted.length}
          </dd>
        </div>
      </dl>
    </div>
  )
}



// 
// Start of Sprint Block
// 
// 
function SprintBlock({ sprintProjects }: { sprintProjects: StandardProject[] }) {
  const projectWithCompletionPercent = sprintProjects.map(project => {
    return {
      ...project,
      completionPercent: Math.round((project.completedTaskPoints / project.taskPoints) * 100)
    }
  });

  const projectsSortedByCompletionPercent = projectWithCompletionPercent.sort((a, b) => { return b.completionPercent - a.completionPercent });

  const featuredProject = projectsSortedByCompletionPercent[0];



  return (
    <div className="overflow-hidden bg-gray-50 ">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex-auto">
          <h3 className="text-xl font-semibold leading-6 text-gray-900">
            Task Spotlight!
          </h3>
          <p className="mt-2 text-sm text-gray-700">
            You are almost done with this project. Keep up the good work!
          </p>
        </div>
        <div
          className="mx-auto mt-1 max-w-md"
        >


          <FocusedProjectCard project={featuredProject} />

        </div>
        <ProjectListed projects={sprintProjects} />
      </div>
    </div>
  )
}

function FocusedProjectCard({ project }: { project: StandardProject }) {
  const completionPercent = Math.round((project.completedTaskPoints / project.taskPoints) * 100);

  const tasks = project.progressTracker.taskOrder.map(taskId => {
    const task = project.progressTracker.tasks[taskId];
    return {
      ...task,
      taskId
    }
  });

  const nextTask = tasks.find(task => task.complete === false);

  return (
    <div className="overflow-hidden  bg-white shadow sm:rounded-lg">
      <div className="py-2 px-2 flex flex-row justify-between bg-orange-200">
        <p className="text-lg font-semibold text-slate-900">{project.userTitle}</p>
        <p
          className="text-lg font-semibold text-slate-900"
        >[ {completionPercent}% completed]</p>
      </div>
      <div className="mt-2 max-w-xl px-3 py-2  text-sm text-gray-600">
        <p className="text-base" >Next task</p>
        <ul>
          <li className=" flex rounded-md shadow-sm bg-green-500" >

            <div
              className={'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white'
              }
            >
              <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />

            </div>
            <div className="flex flex-1 items-center justify-between truncate">
              <div className="flex flex-row content-end truncate px-4 py-1 text-sm">
                <p className="font-semibold text-base text-slate-50 hover:text-gray-600">
                  {nextTask?.name}
                </p>
                <p className="pl-2 pt-1 text-slate-100">
                 Adds {nextTask?.progress} points! 
                </p>

              </div>
              {/* <div className="flex-shrink-0 pr-2">
              </div> */}
            </div>
          </li>
        </ul>
      </div>

      <div className="py-1 flex justify-center ">
        <Link
          to={`/workboard/${project.workboardId}/${project.cardId}`}
          className=" mx-auto rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go to Project
        </Link>      </div>
    </div>
  )
}

function ProjectListed({ projects }: { projects: StandardProject[] }) {
  const projectWithCompletionPercent = projects.map(project => {
    return {
      ...project,
      completionPercent: Math.round((project.completedTaskPoints / project.taskPoints) * 100)
    }
  });

  const projectsSortedByCompletionPercent = projectWithCompletionPercent.sort((a, b) => { return b.completionPercent - a.completionPercent });

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
          <ProjectTable projects={projects} />
        </div>
        <div className="block md:hidden" >

          <ProjectStackList projects={projects} />
        </div>
      </div>
    </div>
  )
}

function ProjectTable({ projects }: { projects: StandardProject[] }) {
  const projectWithCompletionPercent = projects.map(project => {
    return {
      ...project,
      completionPercent: Math.round((project.completedTaskPoints / project.taskPoints) * 100)
    }
  });

  const projectsDividedInto12ths = projectWithCompletionPercent.map(project => {
    return {
      ...project,
      category: Math.floor(project.completionPercent / 8.3)
    }
  });

  const projectsSortedByCompletionPercent = projectsDividedInto12ths.sort((a, b) => { return b.completionPercent - a.completionPercent });




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
                <span className=" invisible ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200">
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
          {projectsSortedByCompletionPercent.map((project) => {
            const cssClass = returnCssClass(project.category);
            return (
              <tr key={project.cardId} className="">
                <td className="whitespace-nowrap px-2 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 ">
                  {project.userTitle}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/10">
                    Commission
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="relative pt-1">
                    <div className="w-full h-2 bg-blue-200 rounded-full">
                      <div className={classNames(
                        cssClass,
                        "h-full text-center text-xs text-white bg-blue-600 rounded-full"
                      )}>
                      </div>
                    </div>
                  </div></td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm ">
                  <Link
                    to={`/workboard/${project.workboardId}/${project.cardId}`}
                    className="text-indigo-600 hover:text-indigo-900">
                    Edit<span className="sr-only">, {project.userTitle}</span>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ProjectStackList({ projects }: { projects: StandardProject[] }) {
  const projectWithCompletionPercent = projects.map(project => {
    return {
      ...project,
      completionPercent: Math.round((project.completedTaskPoints / project.taskPoints) * 100)
    }
  });

  const projectsSortedByCompletionPercent = projectWithCompletionPercent.sort((a, b) => { return b.completionPercent - a.completionPercent });



  return (
    <ul className="divide-y divide-gray-100">
      {projectsSortedByCompletionPercent.map((project) => (
        <li key={project.cardId} className="flex items-center justify-between gap-x-6 py-5">
          <div className="min-w-0">
            <div className="flex items-start gap-x-3">
              <p className="text-sm font-semibold leading-6 text-gray-900">{project.userTitle}</p>
              <p
                className={classNames(
                  // @ts-ignore
                  // statuses[project.status],
                  'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset'
                )}
              >
                Sample Status
              </p>
            </div>
            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
              <p className="whitespace-nowrap">
                Completion Percent {project.completionPercent}%
              </p>
              <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                <circle cx={1} cy={1} r={1} />
              </svg>
              <p className="truncate">placeholder</p>
            </div>
          </div>
          <div className="flex flex-none items-center gap-x-4">
            <Link
              to={`/workboard/${project.workboardId}/${project.cardId}`}
              className=" rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
            >
              View project<span className="sr-only">, {project.userTitle}</span>
            </Link>
            {/* <Menu as="div" className="relative flex-none">
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
            </Menu> */}
          </div>
        </li>
      ))}
    </ul>
  )
};

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







const stats = [
  { id: 1, name: 'Open Forms', stat: '2', icon: UsersIcon, change: '122', changeType: 'increase' },
  { id: 2, name: 'Requests to Review', stat: '5', icon: EnvelopeOpenIcon, change: '5.4%', changeType: 'increase' },
  { id: 3, name: 'Active in Workboard', stat: '8', icon: CursorArrowRaysIcon, change: '3.2%', changeType: 'decrease' },
]



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

