import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getOpeningById } from "~/server/database/openings.server";
import { baseLoader } from "~/server/user.server";
import StackedField from "~/ui/StackedFields/StackFields";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  const { userRecord, profileId} = await baseLoader(request);
  if (!userRecord) {
    return redirect('/login')
  }
  if(!profileId){
    return redirect("/setup-profile")
  }

  const openDoc = await getOpeningById({
    profileId,
    openId: params.projectId,
  })

  if(!openDoc){
    throw new Error("no open doc" );
  }



  return json({ openDoc });
}



export default function FormSections() {
  const { openDoc } = useLoaderData<typeof loader>();
  return (
    <div className="">
      <h3>Form below</h3>
      <div>
        {
          openDoc.sections.map((section)=>{

            return <div key={section.sectionId}> 
              {section.sectionId} 
              {
                section.fields.map((field)=>{

                  return <StackedField key={field.fieldId} defaultValue=""  field={field} />
                })
              }
            </div>
          })
        }


      </div>     
    </div>
  );
}