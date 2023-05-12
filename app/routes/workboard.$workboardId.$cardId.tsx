import { Dialog, Switch } from "@headlessui/react";
import { ChevronLeftIcon, PencilSquareIcon, Squares2X2Icon } from "@heroicons/react/20/solid";
import { ActionArgs, LoaderArgs, Response } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useId, useState } from "react";
import { z } from "zod";
import { getProjectTypeDoc, getUUID } from "~/server/database/db.server";
import { moveArrayElement } from "~/server/database/forms.server";
import { getOpeningById, SectionData } from "~/server/database/openings.server";
import { archiveSubmission, changeReviewStatus, getReviewStatusByIntentId, getSectionResponses, getSubmissionbyId, getSubmissionStatusByIntentId, SubmittedSection } from "~/server/database/submission.server";
import { addSubmissionToWorkboard, getCardById, ProgressTracker, Task, TaskWID, updateCard } from "~/server/database/workboard.server";
import { baseLoader } from "~/server/user.server";
import TaskCheckboxDnd from "~/ui/SmartComponents/TaskCheckboxDnd";
import EditTaskOrder from "~/ui/SmartComponents/TaskEditDND";
import UploadImageWidget from "~/ui/SmartComponents/UploadImageWidget";
import SelectField from "~/ui/StackedFields/SelectField";
import StackedField, { Field } from "~/ui/StackedFields/StackFields";
import TextAreaField from "~/ui/StackedFields/TextArea";
import TextField from "~/ui/StackedFields/TextField";

export async function action({ params, request }: ActionArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) return redirect('/login');
  if (!profileId) return redirect('/setup-profile');

  const cardDetails = await getCardById({ profileId, cardId: params.cardId as string });
  if (!cardDetails) {
    return json({ error: "No card found" }, { status: 404 });
  }

  const intialFormData = Object.fromEntries(await request.formData());


  let { _action, ...values } = intialFormData;

  const NotesSchema = z.object({
    userNotes: z.string().optional(),
    userTitle: z.string().optional()
  });

  if (_action === "saveUserNote") {
    const checkInput = NotesSchema.safeParse(values);
    if (!checkInput.success) {
      return json({ error: "Failed Parse", issues: checkInput.error.issues });

    }
    await updateCard({
      profileId,
      cardId: params.cardId as string,
      cardDetails: {
        userNotes: checkInput.data.userNotes,
        userTitle: checkInput.data.userTitle
      }
    })
    return json({ success: "true", status: 200 })
  }

  if (_action === "addDefaultProgressList") {

    const tasklist2: TaskWID[] = [
      { taskId: "1", name: "Intial Sketch", progress: 10, complete: true },
      { taskId: "2", name: "Detailed Sketch", progress: 30, complete: true },
      { taskId: "3", name: "Linework", progress: 30, complete: false },
      { taskId: "4", name: "Color", progress: 20, complete: false },
      { taskId: "5", name: "Lighting & Effects", progress: 10, complete: false },
    ];


    const defaultProgressTracker: ProgressTracker = {
      tasks: {
        "1": { name: "Intial Sketch", progress: 10, complete: false },
        "2": { name: "Detailed Sketch", progress: 30, complete: false },
        "3": { name: "Linework", progress: 30, complete: false },
        "4": { name: "Color", progress: 20, complete: false },
        "5": { name: "Lighting & Effects", progress: 10, complete: false },
      },
      taskOrder: ["1", "2", "3", "4", "5"]
    }

    await updateCard({
      profileId,
      cardId: params.cardId as string,
      cardDetails: {
        progressTracker: defaultProgressTracker
      }

    })
    return json({ status: 200 })
  }

  if (_action === "toggleTask") {
    const { taskId, complete } = values;
    const currentTasks = cardDetails?.progressTracker?.tasks ?? {};
    const currentTaskOrder = cardDetails?.progressTracker?.taskOrder ?? [];
    const task = { ...currentTasks[taskId as string] };
    const currentComplete = task.complete;
    task.complete = !currentComplete;
    const tasks = { ...currentTasks, [taskId as string]: task };
    await updateCard({
      profileId,
      cardId: params.cardId as string,
      cardDetails: {
        progressTracker: {
          taskOrder: currentTaskOrder,
          tasks
        }
      }
    });

    return json({ status: 200 });
  }

  if (_action === "sortList") {
    const SortListSchema = z.object({
      oldIndex: z.coerce.number(),
      newIndex: z.coerce.number(),
    })
    const schemaCheck = SortListSchema.safeParse(values);
    if (!schemaCheck.success) {
      return { error: true, errorData: schemaCheck.error.issues }
    }
    const progressTracker = {
      taskOrder: cardDetails.progressTracker?.taskOrder ?? [],
      tasks: cardDetails.progressTracker?.tasks ?? {},
    }

    const currentTaskOrder = cardDetails.progressTracker?.taskOrder ?? [];

    if (currentTaskOrder.length < 2) {
      return json({ status: 404 })
    }

    const newTaskOrder = moveArrayElement(
      currentTaskOrder,
      schemaCheck.data.oldIndex,
      schemaCheck.data.newIndex
    );

    const newProgressTracker = { ...progressTracker, taskOrder: newTaskOrder }

    await updateCard({
      profileId,
      cardId: params.cardId as string,
      cardDetails: { progressTracker: newProgressTracker }
    })
    return json({ success: true })
  }

  if (_action === "addTask") {
    const addTaskScheme = z.object({
      taskTitle: z.string(),
      taskType: z.string(),
      taskPoints: z.coerce.number(),
    })

    const schemaCheck = addTaskScheme.safeParse(values);

    if (!schemaCheck.success) {
      return json({ error: true, issues: schemaCheck.error.issues })
    }


    const newTaskId = getUUID()

    const taskOrder = cardDetails.progressTracker?.taskOrder ?? [];
    const tasks = cardDetails.progressTracker?.tasks ?? {};

    const newTaskOrder = [...taskOrder, newTaskId];
    const newTasks = {
      ...tasks,
      [newTaskId]: {
        complete: false,
        name: schemaCheck.data.taskTitle,
        progress: schemaCheck.data.taskPoints
      }
    }

    const newProgressTracker = {
      taskOrder: newTaskOrder,
      tasks: newTasks,
    };

    await updateCard({
      profileId,
      cardId: params.cardId as string,
      cardDetails: { progressTracker: newProgressTracker }
    })

    return json({ success: true })
  }




  // const intentId = params.submissionsId as string;
  // const newStatus = _action as "hold" | "accepted" | "declined";

  // const writeToDb = await changeReviewStatus({
  //   profileId, intentId,
  //   status: newStatus
  // })

  return json({ status: 200 })

}

export async function loader({ params, request }: LoaderArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) return redirect('/login');
  if (!profileId) return redirect('/setup-profile');
  const { cardId } = params;

  const reviewStatus = await getReviewStatusByIntentId({ profileId, intentId: cardId });

  const submissionDoc = await getSubmissionbyId({ profileId, submissionId: cardId });

  const projectTypeDoc = await getProjectTypeDoc(profileId)
  

  const cardDetails = await getCardById({ profileId, cardId });
  if (!cardDetails) {
    return redirect(`/workboard/${profileId}`)
  }

  const defaultProgressTracker: ProgressTracker = {
    tasks: {},
    taskOrder: []
  }

  const progressTracker = cardDetails.progressTracker ?? defaultProgressTracker;

  const tasklist = progressTracker.taskOrder.map((taskId) => ({ ...progressTracker.tasks[taskId], taskId: taskId }));

  const taskPointOptions = [
    { label: "10 Points", value: "10" },
    { label: "20 Points", value: "20" },
    { label: "30 Points", value: "30" },
    { label: "50 Points", value: "50" },
    { label: "80 Points", value: "80" },
    { label: "130 Points", value: "130" },
  ];
  const defaulteTaskTypeOptions = [
    { label: "Intial Sketch", value: "IS" },
    { label: "Detailed Sketch", value: "DS" },
    { label: "Linework", value: "LW" },
    { label: "Coloring", value: "CR" },
    { label: "Lighting & Effects", value: "LE" },
  ];

  const taskTypesOptions = projectTypeDoc 
  ? projectTypeDoc.typeOrder.map((typeId)=>{
    const type = projectTypeDoc.types[typeId] ?? { label: "error", initials: "ER"}

    return { label: type.label, value: typeId}
  })
  :defaulteTaskTypeOptions


  const addTaskFields: Field[] = [
    { fieldId: "taskTitle", type: "shortText", label: "Task Title" },
    { fieldId: "taskType", type: "select", label: "Task Type", options: taskTypesOptions },
    { fieldId: "taskPoints", type: "select", label: "Task Points", options: taskPointOptions },
  ]

  const projectId = params.cardId ?? "no-id";

  return json({ submissionDoc, reviewStatus, cardDetails, tasklist, addTaskFields, projectId });
}

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}




export default function CardDetailsPage() {
  const {
    submissionDoc,
    reviewStatus,
    cardDetails,
    tasklist,
    addTaskFields,
    projectId,
  } = useLoaderData<typeof loader>();
  const actionData = useLoaderData<typeof action>();
  const navigate = useNavigate();
  const imageArray = cardDetails.imageArray ?? [];
  const defaultImage="https://res.cloudinary.com/db1vvwzaa/image/upload/v1683839201/milachu92/dtrgv9x20tyn34xiijwz.png"

  const firstImage = imageArray.length > 0 
    ? imageArray[0]
    : {
      url: defaultImage,
      imageId: "default",
      description: "default image"
    }

  const [imageUrl, setImageUrl] = useState(firstImage.url)

  return (
    <Dialog
      open={true}
      as="div"
      onClose={() => { navigate("/workboard/") }}
      className="relative z-50 "
    // className="max-w-2xl  pt-10 inset-0 z-10 overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black opacity-30" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel
            className="w-full max-w-5xl rounded bg-white shadow-lg"
          >
            <Dialog.Title className="px-4 pt-4 text-3xl font-medium text-gray-900"
            >
              <button
                onClick={() => { navigate(-1) }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ChevronLeftIcon className="w-6 h-6" />
                Back
              </button>
            </Dialog.Title>
            <>
              <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <EditOrDisplayTitle
                    title={cardDetails.userTitle ?? cardDetails.cardTitle}
                    text={cardDetails.userNotes ?? ""}
                  />
                  <div>
                    <h5>{imageArray.length} Images</h5>
                    {
                      imageArray.length < 1 
                      ? null
                      :
                    <div key={"1"} className=" max-w-md">
                      <img src={imageArray[0].url} alt="testimage" />
                    </div>
                    }

                    <UploadImageWidget action="/api/project/image-upload">
                      <input hidden readOnly name="cardId" value={projectId} />
                    </UploadImageWidget>

                  </div>

                  {
                    tasklist.length > 0
                      ? <>
                        <TaskCheckboxDnd projectId={projectId} tasklist={tasklist} />  </>
                      : <AddDefaultProgressList cardId={cardDetails.cardId} />
                  }
                  {/* <div>
                    <h3> Progress 70%</h3>
                    <ul>
                      {
                        tasklist.map((task) =>
                          <li key={task.taskId} className="py-2">
                            <TaskItemCheckbox task={task} />
                          </li>
                        )
                      }
                    </ul>
                  </div> */}
                  <ActionPanel fields={addTaskFields} />
                </div>
              </div>
            </>



            {
              submissionDoc
                ?
                <article className="px-2 py-2">
                  <div className=" rounded-xl  border-4 px-4 py-3 ">
                    <div>
                      <h2
                        className="text-2xl font-semibold leading-6 text-gray-900 capitalize"
                      >
                        {submissionDoc.humanReadableId}
                      </h2>
                      <h3 className="mt-1 max-w-2xl text-xl text-gray-500">
                        Request Details
                      </h3>
                      <p>
                        {reviewStatus?.reviewStatus}
                      </p>
                    </div>
                    <div className="divide-y-2 divide-slate-600">
                      {
                        submissionDoc.submittedSections.map((section: SubmittedSection, index) => {
                          return <SectionDisplay key={index} submittedSection={section} />
                        })
                      }

                    </div>
                  </div>
                </article>
                : null
            }
            <div className="divide-y-2 divide-slate-600">

            </div>
          </Dialog.Panel>
        </div>
      </div>

    </Dialog>
  );
}

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
        <Form replace method="POST" className="mt-5 sm:flex sm:items-center">
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
        </Form>
      </div>
    </div>
  )
}



function EditTaskList({ tasklist }: { tasklist: TaskWID[] }) {


  return (
    <div>
      <h5>Edit Task List</h5>
      <ul>
        {
          tasklist.map((task) =>

            <li key={task.taskId}>
              <OverlayStyle>
                <TaskListItem task={task} />
              </OverlayStyle>
            </li>
          )
        }
      </ul>
      <EditTask />
    </div>
  )
}

function EditTask() {
  const taskType: Field = {
    fieldId: "taskType",
    label: "Type",
    type: "select",
    options: [
      { label: "Sketch Intial", value: "SketchIntial" },
      { label: "Sketch Detailed", value: "SketchDetailed" },
    ],

  }
  const taskPoints: Field = {
    fieldId: "taskPoints",
    label: "Task Points",
    type: "select",
    options: [
      { label: "10 Points", value: "10" },
      { label: "20 Points", value: "20" },
      { label: "30 Points", value: "30" },
      { label: "50 Points", value: "50" },
      { label: "80 Points", value: "80" },
    ],
  }

  const typeOptions = taskType.options ?? [];
  const pointOptions = taskPoints.options ?? [];

  // @ts-ignore
  const taskDefault = "SketchIntial";

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Update Task
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Change task type, point value, or label. </p>
        </div>
        <form className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="taskType" className="sr-only">
              Task Type
            </label>
            <select
              name="taskType"
              id="taskType"
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              {
                typeOptions.map((option) =>
                  <option key={option.value} value={option.value}>{option.label}</option>
                )
              }

            </select>
          </div>
          <div className="w-full sm:max-w-xs">
            <label htmlFor="taskPoints" className="sr-only">
              Task Points
            </label>
            <select
              name="taskPoints"
              id="taskPoints"
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              {
                pointOptions.map((option) =>
                  <option key={option.value} value={option.value}>{option.label}</option>
                )
              }

            </select>
          </div>
          <div className="w-full sm:max-w-xs">
            <label htmlFor="taskTitle" className="sr-only">
              Title
            </label>
            <input
              name="taskTitle"
              id="taskTitle"
              type="text"
              placeholder="Optional Title"
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <button
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  )
}

function TaskItemCheckbox({ task }: { task: TaskWID }) {

  const projectColor = " bg-green-500"
  return (
    <div className=" h-12 flex flex-row  border-2 border-slate-400 rounded-lg">
      <div
        className={classNames(
          projectColor,
          'flex w-16 flex-shrink-0 items-center justify-evenly text-sm font-medium text-white  '
        )}
      >
        <Squares2X2Icon className=" h-5 w-5" />
        VC
      </div>
      <TaskCheckBox task={task} />
    </div>
  )
}

function TaskCheckBox({ task }: { task: TaskWID }) {
  let fetcher = useFetcher();
  let submit = fetcher.submit;

  const handleOnChange = () => {
    let formData = new FormData()
    formData.append("_action", "toggleTask");
    formData.append("taskId", task.taskId);
    submit(formData, { method: "post" })
  }


  return (
    <fetcher.Form method="post" className=" flex-1 grid grid-cols-10 content-center justify-between">
      <p className="px-2 col-span-2 font-semibold">{task.progress}</p>
      <p className="font-bold truncate col-span-5">{task.name}</p>
      <div className="px-1 col-span-2   ">
        <button className=" inline-flex items-center px-4 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"> Edit</button>
      </div>
      <div className="px-1 py-1 flex flex-row justify-center content-center">
        <input
          id={"taskComplete"}
          name={"taskComplete"}
          defaultChecked={task.complete}
          onChange={handleOnChange}
          type="checkbox"
        />
      </div>
    </fetcher.Form>
  );
}

function TaskListItem({ task }: { task: TaskWID }) {

  return (
    <>
      <div className="col-span-11 flex flex-row justify-between">
        <p className="pr-1 font-semibold text-lg ">{task.name}</p>
        <p className="text-base truncate"> TaskTitle but this is a really long title</p>
        <p>{task.progress} points </p>
        <p className="pr-2">Edit</p>
      </div>
      {/* {
        field.type === "select"
          ?
          <>
            <div className="col-span-2 pt-1 flex flex-row justify-center align-top">
              <p className="font-medium underline decoration-2" >Options</p>
            </div>
            <div className="col-span-4 pt-2">
              <ul className="list-disc">
                {
                  options.map((option) =>
                    <li key={option.value}>
                      {option.label}
                    </li>
                  )
                }
              </ul>
            </div>
          </>
          : null
      } */}

    </>
  )
}

function OverlayStyle(props: {

  children: React.ReactNode,
}) {
  return (
    <div
      className="border-2 grid grid-cols-12  rounded-md items-center justify-between py-2 bg-slate-300"
    >
      <div
        className=" px-1 col-span-1 flex flex-row justify-start"
      >
        <Squares2X2Icon
          className='h-5 w-5 text-gray-400'
        />
      </div>
      {props.children}
    </div>
  );
}

function EditOrDisplayTaskList() {
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



}




function EditOrDisplayTitle(
  { title, text, }: { title: string, text: string, }) {
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
        <TitleNotesForm changeEdit={changeEdit} title={title} text={text} />
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



function FormCard2({ open }: { open: boolean }) {
  let fetcher = useFetcher();
  let submit = fetcher.submit;
  let formData = new FormData();
  formData.append("formId", "123");
  formData.append("_action", "toggleOpen");

  const isToggling = fetcher.state !== "idle";

  const displayState = isToggling ? !open : open;

  const handletoggleOpen = async () => {
    await submit(formData, { method: "post" });

  }


  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap">
          <p>Milachu Standard Commission</p>
          <button>Delete </button>
        </div>
        <div
          className="py-2"
        >
          <p>This is my standard commission form</p>
        </div>
        <div
          className="flex justify-between items-center"
        >
          <button> edit</button>
          <div
            className="flex items-center space-x-2"
          >
            <p>
              {
                displayState ? "Open" : "Closed"
              }
            </p>
            <Switch
              checked={open}
              onChange={() => handletoggleOpen()}
              className={classNames(
                displayState ? 'bg-indigo-600' : 'bg-gray-200',
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
              )}
            >
              <span className="sr-only">Toggle Form Open State</span>
              <span
                aria-hidden="true"
                className={classNames(
                  displayState ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                )}
              />
            </Switch>
          </div>
        </div>
      </div>
    </div>
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

function TitleNotesForm({ title, text, changeEdit }: { title: string, text: string, changeEdit: () => void }) {

  return (
    <div
      className="flex flex-col gap-y-2"
    >
      <div
        className="max-w-lg "
      >
        <input
          name="userTitle"
          className="block w-full text-xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Title"
          defaultValue={title}
        />
        <input hidden readOnly name="_action" value="saveUserNote" />
      </div>
      <div
        className="max-w-lg"
      >
        <label className="text-sm">
          Personal Notes
        </label>
        <textarea
          name="userNotes"
          rows={4}
          defaultValue={text}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>

    </div>
  )
}

function AddDefaultProgressList({ cardId }: { cardId: string }) {
  const fetcher = useFetcher();
  let submit = fetcher.submit;
  let formData = new FormData();
  formData.append("cardId", cardId);
  formData.append("_action", "addDefaultProgressList");
  return (
    <div
      className="py-2 "
    >

      <button
        className="bg-indigo-600 text-white px-2 py-1 rounded-md"
        onClick={() => submit(formData, { method: "post" })}
      >
        Add Default Progress List
      </button>
    </div>
  )
}

function ProgressTaskList({ tasklist }: { tasklist: TaskWID[] }) {
  const completedProgress = tasklist.reduce((acc, task) => acc + (task.complete ? task.progress : 0), 0);

  const totalSize = tasklist.reduce((acc, task) => acc + task.progress, 0);

  return (
    <fieldset
      className="py-2"
    >
      <h4 className="">Progress {100 * completedProgress / totalSize}%</h4>
      <div className="space-y-2">
        {tasklist.map((task) => (
          <TaskItem key={task.taskId} task={task} totalSize={totalSize} />
        ))}
      </div>
    </fieldset>
  )
}

function TaskItem({ task, totalSize }: { task: TaskWID, totalSize: number }) {

  const fetcher = useFetcher();
  let submit = fetcher.submit;
  let formData = new FormData();
  formData.append("taskId", task.taskId);
  formData.append("_action", "toggleTask")
  formData.append("complete", task.complete ? "false" : "true");



  const handleClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.currentTarget.checked;
    submit(formData, { method: "post" })
  }

  const isUpdating = fetcher.state !== "idle";

  return (
    <fetcher.Form className="relative flex items-start">
      <div className="flex h-6 items-center">
        <input
          id={task.taskId}
          aria-describedby={`${task.taskId}-description`}
          name={task.taskId}
          type="checkbox"
          checked={isUpdating ? !task.complete : task.complete}
          onChange={(e) => handleClick(e)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
        />
      </div>
      <div className="ml-3 text-sm leading-6">
        <label htmlFor={task.taskId} className="font-medium text-gray-900">
          {task.name}
        </label>{' '}
        <span id={`${task.taskId}-description`} className="text-gray-500">
          <span className="sr-only">{task.name} </span>({task.progress / totalSize * 100}%)
        </span>
      </div>
    </fetcher.Form>
  )
}




function StatusForm(
  { submitId, reviewStatus }:
    { submitId: string, reviewStatus?: string }
) {

  return (

    <Form replace method="post">
      <div className=" py-4 block">
        <input readOnly name='intentId' hidden value={submitId} />
        <div className=" py-3 flex gap-4 justify-end">
          <Link
            to="/workboard"
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Back
          </Link>
        </div>
      </div>
    </Form>
  )
}

function SectionDisplay({ submittedSection }: { submittedSection: SubmittedSection }) {

  return (
    <div className="py-2">
      <h4 className="text-lg font-medium text-gray-500">{submittedSection.title}</h4>
      <dl className="sm:divide-y sm:divide-gray-200">
        {
          submittedSection.displayFields.map((field) => (
            <div key={field.fieldId} className="py-4 border-t sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {field.userInput}
              </dd>
            </div>
          ))
        }
      </dl>
      <ul
        className=" pt-2 grid grid-cols-2 gap-x-4 gap-y-8  "
      >
        {

          submittedSection.imageArray.map((imageData
          ) => (
            <li key={imageData.url} className="relative">
              <a href={imageData.url} target="_blank" rel="noreferrer" className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                <img src={imageData.url} alt="" className="pointer-events-none object-cover group-hover:opacity-75" />
              </a>
              <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">{imageData.description}</p>
            </li>
          ))
        }
      </ul>

    </div>
  )
}



function SectionResponseFields(
  { responsesObj, sectionName, sectionData, sectionResponse }
    : {
      responsesObj: { [key: string]: string },
      sectionName: string,
      sectionData: SectionData
      sectionResponse: {
        fields?: Field[],
        formValues?: { [key: string]: string },
        imageArray?: { imageId: string, url: string, description: string }[],
      }
    }
) {

  const imageArray = sectionResponse.imageArray ?? [];

  return (
    <div className="py-2">
      <h4 className="text-lg font-medium text-gray-500">{sectionName}</h4>
      <dl className="sm:divide-y sm:divide-gray-200">
        {
          sectionData.fields.map((field) => {
            const response = responsesObj[field.fieldId];
            const fieldType = field.type;
            const fieldOptions = field.options ?? []

            const userInput = fieldType == "select"
              ? fieldOptions.find((option) => option.value === response)?.label ?? "error"
              : response;

            return (

              <div key={field.fieldId} className="py-4 border-t sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {userInput}
                </dd>
              </div>
            )
          })
        }
      </dl>
      <ul
        className=" pt-2 grid grid-cols-2 gap-x-4 gap-y-8  "
      >
        {
          sectionData.type === "imageUpload"
            ?
            imageArray.map((imageData
            ) => (
              <li key={imageData.url} className="relative">
                <a href={imageData.url} target="_blank" rel="noreferrer" className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                  <img src={imageData.url} alt="" className="pointer-events-none object-cover group-hover:opacity-75" />
                </a>
                <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">{imageData.description}</p>
              </li>
            ))
            : <div className="mx-auto ">
            </div>
        }
      </ul>

    </div>
  )

}  
