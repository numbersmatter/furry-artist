import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json, } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { z } from "zod";
import { getCardById, updateCard } from "~/server/database/workboard.server";
import { baseLoader } from "~/server/user.server";
import type { Field } from "~/ui/StackedFields/StackFields";
import StackedField from "~/ui/StackedFields/StackFields";
import type { Task } from "~/server/database/workboard.server";

export async function action({ params, request }: ActionArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    redirect("/logout")
  }

  const project = await getCardById({ profileId, cardId: params.projectId })

  if (!profileId) {
    return json({ success: false, error: "no profile id" })
  }
  if (!project) {
    return json({ success: false, error: "No project by that id found" })
  }

  const { _action, ...values } = Object.fromEntries(await request.formData())

  if (_action === "deleteTask") {
    const deleteSchema = z.object({
      taskId: z.string(),
    })
    const checkSchema = deleteSchema.safeParse(values)

    if (!checkSchema.success) {
      return json({ error: "schema failed", issues: checkSchema.error.issues })
    }

    const taskOrder = project.progressTracker?.taskOrder ?? [];
    const tasks = project.progressTracker?.tasks ?? {};

    const newTaskOrder = taskOrder.filter((taskId) => taskId != checkSchema.data.taskId)

    // create new tasks
    const newProgressTracker = {
      taskOrder: newTaskOrder,
      tasks
    };

    await updateCard({
      profileId,
      cardId: project.cardId,
      cardDetails: {
        progressTracker: newProgressTracker
      }
    })
    return redirect(`/workboard/${profileId}/${project.cardId}`)
  }
  if (_action === "saveBack") {
    const saveSchema = z.object({
      taskId: z.string(),
      taskTitle: z.string(),
      taskPoints: z.coerce.number(),
      taskType: z.string(),
    })
    const checkSchema = saveSchema.safeParse(values)

    if (!checkSchema.success) {
      return json({ error: "schema failed", issues: checkSchema.error.issues })
    }

    const taskOrder = project.progressTracker?.taskOrder ?? [];
    const tasks = project.progressTracker?.tasks ?? {};

    const newTaskDetails: Task = {
      ...tasks[checkSchema.data.taskId],
      name:checkSchema.data.taskTitle,
      progress: checkSchema.data.taskPoints,
      typeId: checkSchema.data.taskType,
    }

    const newTasks ={ ...tasks, [checkSchema.data.taskId]: newTaskDetails }

    // create new tasks
    const newProgressTracker = {
      taskOrder,
      tasks: newTasks,
    };

    await updateCard({
      profileId,
      cardId: project.cardId,
      cardDetails: {
        progressTracker: newProgressTracker
      }
    })
    return redirect(`/workboard/${profileId}/${project.cardId}`)
  }




  return json({ success: true });
}

export async function loader({ params, request }: LoaderArgs) {
  const { profileId, } = await baseLoader(request);


  const project = await getCardById({ profileId, cardId: params.projectId })

  if (!project) {
    throw Error(`no project found ${params.projectId} `)
  }

  const tracker = project.progressTracker ?? {
    taskOrder: [],
    tasks: {}
  };

  const taskId = params.taskId ?? "no-id";

  const validId = tracker.tasks.hasOwnProperty(taskId);

  if (!validId) {
    throw Error("No vaild Task ID")
  }

  const task = { ...tracker.tasks[taskId], taskId };


  const taskPointOptions = [
    { label: "10 Points", value: "10" },
    { label: "20 Points", value: "20" },
    { label: "30 Points", value: "30" },
    { label: "50 Points", value: "50" },
    { label: "80 Points", value: "80" },
    { label: "130 Points", value: "130" },
  ];
  const taskTypeOptions = [
    { label: "Intial Sketch", value: "IS" },
    { label: "Detailed Sketch", value: "DS" },
    { label: "Linework", value: "LW" },
    { label: "Coloring", value: "CR" },
    { label: "Lighting & Effects", value: "LE" },
  ];

  const editTaskFields: Field[] = [
    { fieldId: "taskTitle", type: "shortText", label: "Task Title" },
    { fieldId: "taskType", type: "select", label: "Task Type", options: taskTypeOptions },
    { fieldId: "taskPoints", type: "select", label: "Task Points", options: taskPointOptions },
    { fieldId: "taskNotes", type: "longText", label: "Task Points", options: taskPointOptions },
  ]


  return json({ editTaskFields, task });
}



export default function TaskIdPage() {
  const { editTaskFields, task } = useLoaderData<typeof loader>();
  const navigate = useNavigate()
  return (
    <div className="overflow-hidden bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <Form method="post" >
          <div className="px-2 py-2  flex flex-row justify-between">
            <button
              className="inline-flex items-center px-4 py-3 text-sm font-medium text-white bg-indigo-500 border border-gray-300 rounded-md hover:bg-gray-50"
              name="_action"
              value="saveBack"
            >
              <ArrowLeftIcon className=" h-5 w-5" />
              Save & Back
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
          <h2>
            {task.name}
          </h2>
          <div className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <StackedField
                defaultValue={task.name}
                field={editTaskFields[0]}
              />
              <StackedField
                defaultValue={task.typeId ?? "na"}
                field={editTaskFields[1]}
              />
              <StackedField
                defaultValue={task.progress.toString()}
                field={editTaskFields[2]}
              />
              <input
                hidden
                readOnly
                name="taskId"
                id="taskId"
                value={task.taskId}
              />
            </div>
          </div>
        </Form>
        <Form method="post">
          <input
            hidden
            readOnly
            name="taskId"
            id="taskId"
            value={task.taskId}
          />
          <button
            name="_action"
            value="deleteTask"
            type="submit"
            className="mt-3 inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
          >
            Delete
          </button>
        </Form>
      </div>
    </div>
  );
}