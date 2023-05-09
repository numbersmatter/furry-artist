import { ArrowDownLeftIcon, ArrowLeftIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import StackedField, { Field } from "~/ui/StackedFields/StackFields";

export async function action({ params, request }: ActionArgs) {


  return redirect('/');
}

export async function loader({ params, request }: LoaderArgs) {

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


  return json({ editTaskFields });
}



export default function TaskIdPage() {
  const { editTaskFields } = useLoaderData<typeof loader>();
  return (
    <div className="overflow-hidden bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="px-2 py-2  flex flex-row justify-between">
          <button
            className="inline-flex items-center px-4 py-3 text-sm font-medium text-white bg-indigo-500 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowLeftIcon className=" h-5 w-5"  />
            Save & Back
          </button>
          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"

          >
            Cancel
          </button>
        </div>
        <h2>
          Task Title
        </h2>
        <Form replace method="POST" className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            {
              editTaskFields.map((field) => {

                return (

                  <StackedField key={field.fieldId} defaultValue="" field={field} />
                )
              })
            }
          </div>
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