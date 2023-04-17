import { ActionArgs, LoaderArgs, Response } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { getOpeningById, SectionData } from "~/server/database/openings.server";
import { changeReviewStatus, getSectionResponses, getSubmissionbyId, getSubmissionStatusByIntentId, SubmittedSection } from "~/server/database/submission.server";
import { baseLoader } from "~/server/user.server";
import { Field } from "~/ui/StackedFields/StackFields";

export async function action({ params, request }: ActionArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) return redirect('/login');
  if (!profileId) return redirect('/setup-profile');

  const intialFormData = Object.fromEntries(await request.formData());


  let { _action, ...values } = intialFormData;

  const intentId = params.submissionsId as string;
  const newStatus = _action as "hold" | "accepted" | "declined";

  const writeToDb = await changeReviewStatus({
    profileId, intentId,
    status: newStatus
  })

  return json({ writeToDb }, { status: 200 })

}

export async function loader({ params, request }: LoaderArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) return redirect('/login');
  if (!profileId) return redirect('/setup-profile');
  const { submissionsId } = params;

  const submissionDoc = await getSubmissionbyId({ profileId, submissionId: submissionsId });
  if (!submissionDoc) {
    throw new Response("Submission not found", { status: 404 })
  }

  // const submission = await getSubmissionStatusByIntentId({ profileId, intentId: submissionsId });
  // if (!submission) return redirect('/submissions');


  // const openingDoc = await getOpeningById({ profileId, openId: submission.openingId });
  // if (!openingDoc) return redirect('/submissions');

  // const sectionResponses = await getSectionResponses({ profileId, intentId: submission.submissionId });
  // console.log({ sectionResponses })


  // return json({ submission, openingDoc, sectionResponses });
  return json({ submissionDoc });
}



export default function SubmissionDetailsPage() {
  // const { submission, openingDoc, sectionResponses } = useLoaderData<typeof loader>();
  const { submissionDoc } = useLoaderData<typeof loader>();
  return (
    <article className="px-2 py-2">
      <div className=" rounded-xl  border-4 px-4 py-3 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold leading-6 text-gray-900 capitalize">{submissionDoc.humanReadableId}</h2>
          <h3 className="mt-1 max-w-2xl text-xl text-gray-500">Request Details</h3>
        </div>
        <div className="divide-y-2 divide-slate-600">
          {
            submissionDoc.submittedSections.map((section: SubmittedSection, index) => {
              return <SectionDisplay key={index} submittedSection={section} />
            })
          }
          {/* {
            submission.sectionOrder.map((sectionId: string) => {
              const sectionData = openingDoc.sections.find((section: any) => section.sectionId === sectionId);
              const sectionResponse = sectionResponses.find((section: any) => section.sectionId === sectionId);

              const formValues = sectionResponse?.formValues || {};

              if (!sectionData || !sectionResponse) {
                const errorSectionData = {
                  name: "Error not defined",
                  text: "Error not defined",
                  sectionId: sectionId,
                  fields: [],
                  type: "fields"

                }
                return <SectionResponseFields
                  key={sectionId}
                  responsesObj={{}}
                  sectionName="Error not defined"
                  // @ts-ignore
                  sectionData={errorSectionData}
                  sectionResponse={{}}
                />
              }

              return <SectionResponseFields
                key={sectionId}
                responsesObj={formValues}
                sectionResponse={sectionResponse}
                sectionName={sectionData.name}
                sectionData={sectionData}
              />

            })
          } */}
          <StatusForm submitId={submissionDoc.submissionId} />
        </div>
      </div>
    </article>
  );
}

function StatusForm(
  { submitId }:
    { submitId: string }
) {

  return (

    <Form replace method="post">
      <div className=" py-4 block">
        <input readOnly name='intentId' hidden value={submitId} />
        <div className=" py-3 flex gap-4 justify-end">
          <Link
            to="/submissions"
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Back
          </Link>
          <button
            name="_action"
            value={"accepted"}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Accept
          </button>
          <button
            name="_action"
            value={"hold"}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"

          >
            Hold
          </button>
          <button
            name="_action"
            value={"declined"}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Decline
          </button>
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
