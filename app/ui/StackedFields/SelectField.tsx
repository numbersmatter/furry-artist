




export default function SelectField(
  props: {
    errorText?: string,
    fieldId: string,
    defaultValue: string,
    label: string,
    options: {label:string, value:string}[]
  }
) {

  return (
    <div className="sm:col-span-6">
      <label htmlFor={props.fieldId} className="block text-sm font-medium leading-6 text-gray-900">
        {props.label}
      </label>
      <div className="mt-2">
        <select
          id={props.fieldId}
          name={props.fieldId}
          defaultValue={props.defaultValue}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {
            props.options.map((option)=>
            <option key={option.value} value={option.value}>{option.label}</option>
            
            )
          }
        </select>
      </div>
      {
        props.errorText ?
          <p className="mt-2 text-sm text-gray-500">{props.errorText}</p>
          : <p> &nbsp;</p>
      }
    </div>);
}



<div className="sm:col-span-3">
  <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
    Country
  </label>
  <div className="mt-2">
    <select
      id="country"
      name="country"
      autoComplete="country-name"
      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
    >
      <option>United States</option>
      <option>Canada</option>
      <option>Mexico</option>
    </select>
  </div>
</div>