import { Switch } from "@headlessui/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getTaskList, updateDoc, updateTask, updateTaskComplete } from "~/server/database/test.server";

export async function action({ params, request }: ActionArgs) {
  const { _action, ...values } = Object.fromEntries(await request.formData());
  const taskListDoc = await getTaskList();
  if (!taskListDoc) {
    throw new Error("No tasklist found");
  }




  console.log({ values });
  if (_action === "toggleTask") {
    const { taskId, complete } = values;
    const task = { ...taskListDoc.tasks[taskId as string] };
    const currentComplete = task.complete;
    task.complete = !currentComplete;
    const tasks = { ...taskListDoc.tasks, [taskId as string]: task };
    await updateTask(taskId as string, tasks);

    return json({ status: 200 });
  }
  
  if(_action === "toggleOpen") {
    await updateDoc({ open: !taskListDoc.open})
    return json({ status: 200 });
  }

  return json({ status: 200 });
}

interface Task {
  id: string;
  name: string;
  progress: number;
  complete: boolean;
};

export async function loader({ params, request }: LoaderArgs) {
  const tasklistDoc = await getTaskList();
  if (!tasklistDoc) {
    throw new Error("No tasklist found");
  }
  const tasklist = tasklistDoc.taskOrder
    .map((taskId) => ({ ...tasklistDoc.tasks[taskId], id: taskId }));

  const open = tasklistDoc.open;



  // const tasklist2: Task[]  = [
  //   { id:"1", name: "Intial Sketch", progress: 110, complete: true },
  //   { id:"2", name: "Detailed Sketch", progress: 30, complete: true },
  //   { id:"3", name: "Linework", progress: 30, complete: false },
  //   { id:"4", name: "Color", progress: 20, complete: false },
  //   { id:"5", name: "Lighting & Effects", progress: 10, complete: false },
  // ];

  return json({ tasklist, open });
}



export default function WorkboardArtistCard() {
  const { tasklist, open } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return (
    <>
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {actionData ?
            <p>{JSON.stringify(actionData)}</p>
            : <p>{" "}</p>
          }
          <TitleNotesForm />
          <ProgressTaskList tasklist={tasklist} />
        </div>
      </div>
      <div className="py-2 px-3">
        <FormCard2 open={open} />
      </div>
    </>
  );
}

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


function FormCard2({ open }: { open: boolean }) {
  let fetcher = useFetcher();
  let submit = fetcher.submit;
  let formData = new FormData();
  formData.append("formId", "123");
  formData.append("_action", "toggleOpen");

  const isToggling = fetcher.state !== "idle";

  const displayState = isToggling ? !open : open;

  const handletoggleOpen = async () => {
    await submit(formData, { method: "post" });

  }


  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap">
          <p>Milachu Standard Commission</p>
          <button>Delete </button>
        </div>
        <div
          className="py-2"
        >
          <p>This is my standard commission form</p>
        </div>
        <div
          className="flex justify-between items-center"
        >
          <button> edit</button>
          <div
            className="flex items-center space-x-2"
          >
            <p>
              {
                displayState ? "Open" : "Closed"
              }
            </p>
            <Switch
              checked={open}
              onChange={()=>handletoggleOpen()}
              className={classNames(
                displayState ? 'bg-indigo-600' : 'bg-gray-200',
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
              )}
            >
              <span className="sr-only">Toggle Form Open State</span>
              <span
                aria-hidden="true"
                className={classNames(
                  displayState ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                )}
              />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  )

}


function TitleNotesForm() {
  return (
    <div
      className="flex flex-col gap-y-2 min-w-"
    >
      <div
        className="max-w-lg "
      >
        <input
          className="block w-full text-xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Title"
          defaultValue={"Card Title"}
        />
      </div>
      <div
        className="max-w-lg"
      >
        <label className="text-sm">
          Personal Notes
        </label>
        <textarea
          rows={4}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>
      <div>
        <button>
          Save
        </button>
      </div>
    </div>
  )
}

function ProgressTaskList({ tasklist }: { tasklist: Task[] }) {
  const completedProgress = tasklist.reduce((acc, task) => acc + (task.complete ? task.progress : 0), 0);

  const totalSize = tasklist.reduce((acc, task) => acc + task.progress, 0);

  return (
    <fieldset
      className="py-2"
    >
      <h4 className="">Progress {100 * completedProgress / totalSize}%</h4>
      <div className="space-y-2">
        {tasklist.map((task) => (
          <TaskItem key={task.id} task={task} totalSize={totalSize} />
        ))}
      </div>
    </fieldset>
  )
}

function TaskItem({ task, totalSize }: { task: Task, totalSize: number }) {

  const fetcher = useFetcher();
  let submit = fetcher.submit;
  let formData = new FormData();
  formData.append("taskId", task.id);
  formData.append("_action", "toggleTask")
  formData.append("complete", task.complete ? "false" : "true");

  if (fetcher.submission) {
    console.log(fetcher.submission);
  }

  const handleClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.currentTarget.checked;
    submit(formData, { method: "post" })
  }

  const isUpdating = fetcher.state !== "idle";

  return (
    <fetcher.Form className="relative flex items-start">
      <div className="flex h-6 items-center">
        <input
          id={task.id}
          aria-describedby={`${task.id}-description`}
          name={task.id}
          type="checkbox"
          checked={isUpdating ? !task.complete : task.complete}
          onChange={(e) => handleClick(e)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
        />
      </div>
      <div className="ml-3 text-sm leading-6">
        <label htmlFor={task.id} className="font-medium text-gray-900">
          {task.name}
        </label>{' '}
        <span id={`${task.id}-description`} className="text-gray-500">
          <span className="sr-only">{task.name} </span>({task.progress / totalSize * 100}%)
        </span>
      </div>
    </fetcher.Form>
  )
}

