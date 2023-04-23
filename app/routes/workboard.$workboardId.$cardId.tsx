import { Dialog } from "@headlessui/react";
import { ActionArgs, LoaderArgs, Response } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigate } from "@remix-run/react";
import { z } from "zod";
import { getOpeningById, SectionData } from "~/server/database/openings.server";
import { archiveSubmission, changeReviewStatus, getReviewStatusByIntentId, getSectionResponses, getSubmissionbyId, getSubmissionStatusByIntentId, SubmittedSection } from "~/server/database/submission.server";
import { addSubmissionToWorkboard, getCardById, updateCard } from "~/server/database/workboard.server";
import { baseLoader } from "~/server/user.server";
import { Field } from "~/ui/StackedFields/StackFields";
import TextAreaField from "~/ui/StackedFields/TextArea";
import TextField from "~/ui/StackedFields/TextField";

export async function action({ params, request }: ActionArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) return redirect('/login');
  if (!profileId) return redirect('/setup-profile');

  const intialFormData = Object.fromEntries(await request.formData());


  let { _action, ...values } = intialFormData;

  const NotesSchema = z.object({
    userNotes: z.string().optional(),
    userTitle: z.string().optional()
  });

  if (_action === "saveUserNote"){
    const checkInput = NotesSchema.safeParse(values);
    if(!checkInput.success){
      return json({ error: "Failed Parse", issues: checkInput.error.issues });

    }
    await updateCard({
      profileId,
      cardId: params.cardId as string,
      cardDetails:{
      userNotes: checkInput.data.userNotes,
      userTitle: checkInput.data.userTitle
    }
    })
    return json({ status: 200 })
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

  const cardDetails = await getCardById({ profileId, cardId });


  return json({ submissionDoc, reviewStatus, cardDetails });
}



export default function CardDetailsPage() {
  const { submissionDoc, reviewStatus, cardDetails } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

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
              {cardDetails?.userTitle ?? cardDetails?.cardTitle}
            </Dialog.Title>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
             
              <h3 className="mt-1 max-w-2xl text-xl text-gray-500">
                Request Details
              </h3>
              <p>
              </p>
            </div>
            <Form
              method="POST"
              replace
              className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-md border-2 border-gray-200"
            >
              <TextField 
                fieldId="userTitle"
                label="Title"
                defaultValue={cardDetails?.userTitle ?? ""}
              />
              <TextAreaField
                fieldId="userNotes"
                label="notes"
                defaultValue={cardDetails?.userNotes ?? ""}
              />
              <div
                className="flex justify-end space-x-3"

              >

              <button
                type="submit"
                name="_action"
                value="saveUserNote"
                >
                save
              </button>
              <Link
                to="/workboard"
                className="border-2 py-1 px-2 text-gray-500"
              >
                close
              </Link>
                </div>

            </Form>
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
