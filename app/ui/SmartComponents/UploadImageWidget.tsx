import { useFetcher } from "@remix-run/react";
import { useRef } from "react";




export default function UploadImageWidget(props:{
  children: React.ReactNode,
  action: string,
}) {
  let fetcher = useFetcher();
  const imageInputRef = useRef(null);
  const imageFormRef = useRef();
  const openFileInput = () => {
    // @ts-ignore
    imageInputRef.current.click();
  };
  let submit = fetcher.submit;

  let isBusy = fetcher.state !== "idle"

  const onFileChange=(e: React.ChangeEvent<HTMLInputElement>)=>{
    e.preventDefault();
    const filesArray = e.currentTarget.files ?? [];
    const filesPresent = filesArray.length > 0;

    if(filesPresent && imageFormRef.current){
      submit(imageFormRef.current,{});
    }
  }

  return (
    <div>
      <button 
        onClick={openFileInput} 
        disabled={isBusy}
        className="rounded-md bg-indigo-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-600 disabled:bg-slate-300"
      >
        { isBusy ? "Uploading..." : "Image Upload" }
      </button>

      <fetcher.Form
        // @ts-ignore 
        ref={imageFormRef} 
        method="post" 
        action={props.action} 
        className="px-4 py-5 sm:p-6"
        encType="multipart/form-data"
      >
        <input
          type={"file"}
          name="img"
          ref={imageInputRef}
          accept={"image/*"}
          onChange={(e)=>onFileChange(e)}
          hidden
        />
        {props.children}
      </fetcher.Form>
    </div>

  )

}