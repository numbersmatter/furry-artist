import { PencilSquareIcon } from "@heroicons/react/20/solid";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";


export default function EditOrDisplayTitle(
  { title, text, textLabel, _action }
  : {title: string, text: string, textLabel: string, _action: string }
) {
  const [isEditing, setIsEditing] = useState(false);
  const changeEdit = () => setIsEditing(!isEditing)
  const fetcher = useFetcher();

  let userState: "idle" | "success" | "error" | "submitting" = fetcher
    .state === "submitting"
    ? "submitting"
    : fetcher.data?.success
      ? "success"
      : fetcher.data?.error
        ? "error"
        : "idle"

  const displayTitle = fetcher.formData?.get("userTitle")
    ? fetcher.formData.get("userTitle") as string
    : title;

  const displayText = fetcher.formData?.get("userNotes")
    ? fetcher.formData.get("userNotes") as string
    : text;


  useEffect(() => {
    if (userState === "success") {
      setIsEditing(false)
    }
  }, [userState])



  return (
    <>
      <fetcher.Form
        method="post"
        hidden={!isEditing}
      >
        <TitleNotesForm _action={_action} title={title} text={text} textLabel={textLabel} />
        <p>{userState === "error" ? fetcher.data.error : <>&nbsp;</>}</p>
        <div>
          <button
            className="bg-indigo-600 text-white px-2 py-1 rounded-md"
            type="submit"
          >
            Save
          </button>
        </div>
      </fetcher.Form>
      <div
        hidden={isEditing}
      >
        <TitleNotesDisplay changeEdit={changeEdit} title={displayTitle} text={displayText} />
      </div>
    </>
  )
}


function TitleNotesDisplay({ title, text, changeEdit }
  : { title: string, text: string, changeEdit: () => void }) {

  return (
    <div className="py-2 flex flex-col gap-y-2">
      <button
        onClick={() => changeEdit()}
        className="flex items-center space-x-2"
      >

        <h2
          className="text-2xl font-semibold leading-6 text-gray-900 capitalize"
        >{title}</h2> <PencilSquareIcon className="w-6 h-6 text-gray-500" />
      </button>
      <p
        className="pb-3 text-xl text-gray-500"
      >{text}</p>
    </div>
  )

}

function TitleNotesForm({ title, text, textLabel, _action }: { title: string, text: string, textLabel: string, _action: string }) {

  return (
    <div
      className="flex flex-col gap-y-2"
    >
      <div
        className="max-w-lg "
      >
        <input
          name="title"
          className="block w-full text-xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Title"
          defaultValue={title}
        />
        <input hidden readOnly name="_action" value={_action} />
      </div>
      <div
        className="max-w-lg"
      >
        <label className="text-sm">
          {textLabel}
        </label>
        <textarea
          name="text"
          rows={4}
          defaultValue={text}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>

    </div>
  )
}