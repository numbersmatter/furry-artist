



export default function EmailField(
  props:{
    errorText? :string,
    fieldId: string,
    defaultValue: string,
    label: string,
    placeholder?:string,
  }
) {

  const inputErrorCss = 
  "block w-full rounded-md border-0 py-1.5 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"



  const inputCss ="block w-full rounded-md px-3 border-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
  const labelCss = "block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2";
  const labelErrorCss = "block text-sm font-medium text-red-500 sm:mt-px sm:pt-2"

  const boxCss = props.errorText ? inputErrorCss : inputCss


  return (
    <div className="sm:col-span-6">
      <label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900">
        {props.label}
      </label>
      <div className="mt-2">
        <input
          id={props.fieldId}
          name={props.fieldId}
          className={boxCss}
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