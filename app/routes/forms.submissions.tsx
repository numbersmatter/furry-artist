import { Dialog, Transition } from "@headlessui/react";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { Fragment, useState } from "react";
import { getSubmittedIntents } from "~/server/database/submission.server";
import { baseLoader } from "~/server/user.server";

export async function action({params, request}:ActionArgs) {
  

  return redirect('/');
}

export async function loader({params, request}:LoaderArgs) {
  const { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    return redirect('/login');
  };
  if (!profileId) {
    return redirect('/profile-setup');
  }

  
  const intents = await getSubmittedIntents(profileId);

  const navIntents = [
    {
      title: "Needs Review",
      category: "review",
      cardList: intents
    },
    {
      title: "Hold",
      category: "hold",
      cardList: intents,
    },
    {
      title: "Accepted",
      category: "accepted",
      cardList: intents,
    },
    {
      title: "Declined",
      category: "declined",
      cardList: intents,
    },
  ]

  return json({ navIntents })
}



export default function FormSubmissions() {
  const { navIntents } = useLoaderData<typeof loader>();
  const [open, setOpen] = useState<boolean>(false)

  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Primary column */}
      <section
        aria-labelledby="primary-heading"
        className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto lg:order-last"
      >
        <div className="block py-2 px-2 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-[#9BB52A] py-1.5 px-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <ArrowLeftIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Choose Another Response
          </button>
          <SlideOut open={open} setOpen={setOpen}>
            <nav className="h-full overflow-y-auto" aria-label="Directory">
              {
                navIntents.map((category) =>
                  <NavCardList
                    key={category.title}
                    title={category.title}
                    //@ts-ignore 
                    category={category.category}
                    // @ts-ignore 
                    cardList={category.cardList} />
                )
              }
            </nav>
          </SlideOut>
        </div>
        <h1 id="primary-heading" className="sr-only">
          Request details
        </h1>

        {/* Your content */}
        <Outlet />
      </section>

      {/* Secondary column (hidden on smaller screens) */}
      <aside className="hidden lg:order-first lg:block lg:flex-shrink-0">
        <div className="relative flex h-full w-96 flex-col overflow-y-auto border-r border-gray-200 bg-white">
          {/* Your content */}
          <nav className="h-full overflow-y-auto" aria-label="Directory">
            {
              navIntents.map((category) =>
                <NavCardList
                  key={category.title}
                  title={category.title}
                  //@ts-ignore 
                  category={category.category}
                  // @ts-ignore 
                  cardList={category.cardList} />
              )
            }
          </nav>
        </div>
      </aside>
    </main>
  );
}
 
function SlideOut(
  {
    open,
    setOpen,
    children,
  }:
  {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    children: React.ReactNode
  }
) {

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          Panel title
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {/* Your content */ children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}


function NavCardList(
  { title, cardList, category }: {
    title: string,
    category: "review" | "hold" | "accepted" | "declined",
    cardList: any[]
  }
) {

  const categoryColor = {
    review: "bg-orange-300",
    hold: "bg-yellow-300",
    accepted: "bg-green-300",
    declined: "bg-red-300"
  }

  return (
    <div key={category} className="relative">
      <div className={
        `sticky top-0 z-10 border-t border-b border-gray-200 ${categoryColor[category]} px-6 py-1 text-sm font-medium text-gray-500`

      }
      >
        <h3 className="text-xl" >{title} ( {cardList.length} )</h3>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200">
        {cardList.map((intentDoc) => (
          <li key={intentDoc.intentId} className="bg-white">
            <NavLink to={intentDoc.intentId ?? "error"}
              className={({ isActive }) => isActive ? "relative flex items-center space-x-3 px-6 py-5 bg-slate-400" : "relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:bg-gray-50"}
            >

              <div className="min-w-0 flex-1">

                {/* Extend touch target to entire panel */}
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{intentDoc.intentId}</p>
                <p className="truncate text-sm text-gray-500">{intentDoc.intentId}</p>
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

