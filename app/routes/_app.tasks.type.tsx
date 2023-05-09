import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { SortVerticalItem } from "~/ui/SmartComponents/SortVerticalItem";
import StackedField, { Field } from "~/ui/StackedFields/StackFields";

export async function action({ params, request }: ActionArgs) {


  return redirect('/');
}

export async function loader({ params, request }: LoaderArgs) {

  const taskTypes = [
    { typeId: "adsae1", typeName: "Intial Sketch", intials: "IS" },
    { typeId: "adsae2", typeName: "Detailed Sketch", intials: "DS" },
    { typeId: "adsae3", typeName: "Linework", intials: "LW" },
    { typeId: "adsae4", typeName: "Coloring", intials: "CO" },
    { typeId: "adsae5", typeName: "Lighting & Effects", intials: "LE" },
  ];

  const addTypeFields: Field[]= [
    {label: "Name", fieldId:"typeName", type:"shortText"},
    {label: "Intials", fieldId:"Intials", type:"shortText"},
  ]

  return json({ taskTypes, addTypeFields });
}



export default function TaskTypeSystem() {
  const { taskTypes, addTypeFields } = useLoaderData<typeof loader>();
  return (
    <div className="overflow-hidden bg-white shadow">
      <div className=" px-4 py-5 sm:p-6">
        <div className=" prose">
          <h3 className="">Task types</h3>
          <p>Use your task type system to organize similar catogeries of work.</p>
        </div>
        <ul className=" list-none">
          {
            taskTypes.map((type) => {

              return (
                <li key={type.typeId}
                  className="py-1"
                >
                  <SortVerticalItem id={type.typeId} displayHandle >
                    <p className=" col-span-10">

                      {type.typeName}
                    </p>
                    <p>
                      {type.intials}
                    </p>
                  </SortVerticalItem>
                </li>
              )
            })
          }
        </ul>
        <div className="mt-2 px-2 py-2 max-w-lg overflow-hidden border-2  bg-white shadow sm:rounded-md">
          <h4 className="text-base font-semibold leading-6 text-gray-900"
          > Add task type</h4>
          <Form method="post" >

          {
            addTypeFields.map((field)=>{

             return  <StackedField defaultValue="" key={field.fieldId} field={field} />
            })
          }
          <button
            name="_action"
            value="addTaskType"
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
          >
            Add Task Type
          </button>
          </Form>

        </div>

      </div>
    </div>
  );
}