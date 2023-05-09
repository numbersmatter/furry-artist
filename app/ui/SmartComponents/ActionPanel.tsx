import { Field } from "../StackedFields/StackFields"


function ActionPanel(props: { fields: Field[] }) {
  return (
    <div className=" max-w-lg sm:col-span-6 overflow-hidden border-2  bg-white shadow sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Add Task
        </h3>
        {/* <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Select a Section To Add</p>
        </div> */}
        {/* <Form replace method="POST" className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            {
              props.fields.map((field) => {

                return (

                  <StackedField key={field.fieldId} defaultValue="" field={field} />
                )
              })
            }
          </div>
          <button
            name="_action"
            value="addTask"
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
          >
            Add Task
          </button>
        </Form> */}
      </div>
    </div>
  )
}
