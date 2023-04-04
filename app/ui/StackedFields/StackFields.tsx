
import { FieldPath } from "firebase-admin/firestore"
import EmailField from "./EmailField";
import SelectField from "./SelectField";
import TextAreaField from "./TextArea";
import TextField from "./TextField";

export type FieldTypes =
  | "select"
  | "date"
  | "currency"
  | "longText"
  | "email"
  | "shortText"
  | "imageUpload";

export type Field = {
  type: FieldTypes;
  label: string;
  fieldId: string;
  options?: { value: string; label: string }[];
  // schema? : {
  //   optional: boolean,
  //   minLength:number,
  //   maxLenght: number,
  //  }
};





export default function StackedField(
  props:{
    field: Field,
    defaultValue: string,
    errorText? :string,
  }
) {
  const { defaultValue, errorText, field} = props;

  switch(props.field.type){
    case "shortText":
      return <TextField 
       errorText={errorText} 
       defaultValue={defaultValue}
       fieldId={field.fieldId}
       label={field.label}
       />;
    case "longText":
      return <TextAreaField
      errorText={errorText} 
      defaultValue={defaultValue}
      fieldId={field.fieldId}
      label={field.label}
      />;

    case "select":
      const options = field.options ?? []
      return <SelectField
      errorText={errorText} 
      defaultValue={defaultValue}
      fieldId={field.fieldId}
      label={field.label}
      options={options}
      />
    case "email":
      return <EmailField 
      errorText={errorText} 
      defaultValue={defaultValue}
      fieldId={field.fieldId}
      label={field.label}
      />;
     
    default:
      return <div><p>Something went wrong</p></div>

  }

}