import { Dialog } from "@headlessui/react";
import { ActionArgs, LoaderArgs, Response } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { getOpeningById, SectionData } from "~/server/database/openings.server";
import { archiveSubmission, changeReviewStatus, getReviewStatusByIntentId, getSectionResponses, getSubmissionbyId, getSubmissionStatusByIntentId, SubmittedSection } from "~/server/database/submission.server";
import { addSubmissionToWorkboard } from "~/server/database/workboard.server";
import { baseLoader } from "~/server/user.server";
import { Field } from "~/ui/StackedFields/StackFields";

export async function action({ params, request }: ActionArgs) {
  // const { profileId, userRecord } = await baseLoader(request);
  // if (!userRecord) return redirect('/login');
  // if (!profileId) return redirect('/setup-profile');

  // const reviewStatus = await getReviewStatusByIntentId({ profileId, intentId: params.submissionsId as string });

  // const intialFormData = Object.fromEntries(await request.formData());


  // let { _action, ...values } = intialFormData;

  // if (_action === "archive"){
  //   if(reviewStatus?.reviewStatus === "accepted"){
  //     const cardDetails ={
  //       cardTitle: reviewStatus.humanReadableId,
  //       cardType: "submission",
  //       workboardId: profileId,
  //       archived: false,
  //     }
  //     await addSubmissionToWorkboard({ 
  //       profileId, 
  //       cardId: params.submissionsId as string,
  //       workboardId: profileId,
  //       cardDetails,
  //     })
  //   }
  //   await archiveSubmission({ profileId, submissionId: params.submissionsId as string })

  //   return redirect('/submissions');
  // }

  // const intentId = params.submissionsId as string;
  // const newStatus = _action as "hold" | "accepted" | "declined";

  // const writeToDb = await changeReviewStatus({
  //   profileId, intentId,
  //   status: newStatus
  // })

  return json( { status: 200 })

}

export async function loader({ params, request }: LoaderArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) return redirect('/login');
  if (!profileId) return redirect('/setup-profile');
  const {  cardId } = params;

  const reviewStatus = await getReviewStatusByIntentId({ profileId, intentId: cardId });

  const submissionDoc = await getSubmissionbyId({ profileId, submissionId: cardId });
  if (!submissionDoc) {
    throw new Response("Submission not found", { status: 404 })
  }

  return json({ submissionDoc, reviewStatus });
}



export default function SubmissionDetailsPage() {
  const { submissionDoc, reviewStatus } = useLoaderData<typeof loader>();

  return (
    <Dialog
      open={true}
      onClose={() => { }}
      className="max-w-2xl fixed pt-10 inset-0 z-10 overflow-y-auto" 
    >

    <article className="px-2 py-2">
      <div className=" rounded-xl  border-4 px-4 py-3 max-w-3xl">
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
          <StatusForm 
            submitId={submissionDoc.submissionId} 
            reviewStatus={reviewStatus?.reviewStatus} 
            />
        </div>
      </div>
    </article>
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
