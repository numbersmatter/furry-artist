



export default function TextAreaField(
  props:{
    errorText? :string,
    fieldId: string,
    defaultValue: string,
    label: string,
  }
) {

  return (
    <div className="sm:col-span-6">
      <label htmlFor={props.fieldId} className="block text-sm font-medium leading-6 text-gray-900">
        {props.label}
      </label>
      <div className="mt-2">
        <textarea
          id={props.fieldId}
          name={props.fieldId}
          rows={3}
          className=" block w-full rounded-md border-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
          defaultValue={props.defaultValue}
        />
      </div>
      {
        props.errorText ?
        <p className="mt-2 text-sm text-red-600"> {props.errorText}</p>
        :<p> &nbsp;</p>
      }

    </div>);
}