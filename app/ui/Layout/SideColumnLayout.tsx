import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Link, } from '@remix-run/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid'
import { ArrowLeftCircleIcon } from '@heroicons/react/24/outline'


export interface NavBarUser {
  name: string,
  email: string,
  imageUrl: string,
  settingsUrl: string,
}

export interface NavBarItem {
  name: string,
  to: string,
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>,
}




export default function SideColumnLayout(
  props: {
    children: React.ReactNode,
    nav: NavBarItem[],
    navBarUser: NavBarUser
  }
) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)





  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-50">
        <body class="h-full overflow-hidden">
        ```
      */}
      <div className="flex h-full">
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileMenuOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white focus:outline-none">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-4">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="pt-5 pb-4">
                    <div className="flex flex-shrink-0 items-center px-4">
                      <img
                        className="h-8 w-auto"
                        src="https://firebasestorage.googleapis.com/v0/b/component-sites.appspot.com/o/furrymarketplace%2FFM%20logo%201.png?alt=media&token=c5e02204-27f3-4996-ac93-738f589826fb"
                        alt="FurBrush"
                      />
                    </div>
                    <nav aria-label="Sidebar" className="mt-5">
                      <div className="space-y-1 px-2">
                        {props.nav.map((item) => (
                          <Link
                            key={item.name}
                            to={item.to}
                            className="group flex items-center rounded-md p-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          >
                            <item.icon
                              className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        ))}
                        <Link
                          to="/logout"
                          className="group flex items-center rounded-md p-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <ArrowLeftCircleIcon className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                          <span >Logout</span>
                        </Link>
                      </div>
                    </nav>
                  </div>
                  <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                    <Link to={props.navBarUser.settingsUrl} className="group block flex-shrink-0">
                      <div className="flex items-center">
                        <div>
                          <img className="inline-block h-10 w-10 rounded-full" src={props.navBarUser.imageUrl} alt="" />
                        </div>
                        <div className="ml-3">
                          <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">{props.navBarUser.name}</p>
                          <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                            Account Settings
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex w-20 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#2A9BB5]">
              <div className="flex-1">
                <div className="flex items-center justify-center bg-[#2a9bb5] py-4">
                  <img
                    className="h-8 w-auto"
                    src="https://firebasestorage.googleapis.com/v0/b/component-sites.appspot.com/o/furrymarketplace%2FFM%20logo%201.png?alt=media&token=c5e02204-27f3-4996-ac93-738f589826fb"
                    alt="FurBrush"
                  />
                </div>
                <nav aria-label="Sidebar" className="flex flex-col items-center space-y-3 py-6">
                  {props.nav.map((item) => (
                    <Link
                      key={item.name}
                      to={item.to}
                      className="flex items-center rounded-lg p-4 text-indigo-200 hover:bg-[#2A55B5]"
                    >
                      <item.icon className="h-6 w-6" aria-hidden="true" />
                      <span className="sr-only">{item.name}</span>
                    </Link>
                  ))}
                  <Link
                    to="/logout"
                    className="flex items-center rounded-lg p-4 text-indigo-200 hover:bg-[#2A55B5]"
                  >
                    <ArrowLeftCircleIcon className="h-6 w-6" aria-hidden="true" />
                    <span className="sr-only">Logout</span>
                  </Link>


                </nav>
              </div>
              <div className="flex flex-shrink-0 pb-5">
                <Link to={props.navBarUser.settingsUrl} className="w-full flex-shrink-0">
                  <img className="mx-auto block h-10 w-10 rounded-full" src={props.navBarUser.imageUrl} alt="" />
                  <div className="sr-only">
                    <p>{props.navBarUser.name}</p>
                    <p>Account settings</p>
                  </div>
                </Link>

                <Link to={props.navBarUser.settingsUrl} className="w-full flex-shrink-0">
                  <img className="mx-auto block h-10 w-10 rounded-full" src={props.navBarUser.imageUrl} alt="" />
                  <div className="sr-only">
                    <p>{props.navBarUser.name}</p>
                    <p>Account settings</p>
                  </div>
                </Link>
                <Link
                  to="/logout"
                  className="flex items-center rounded-lg p-4 text-indigo-200 hover:bg-[#2A55B5]"
                >
                  <ArrowLeftCircleIcon className="h-6 w-6" aria-hidden="true" />
                  <span className="sr-only">Logout</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Mobile top navigation */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between bg-[#2a9bb5] py-2 px-4 sm:px-6 lg:px-8">
              <div>
                <img
                  className="h-8 w-auto"
                  src="https://firebasestorage.googleapis.com/v0/b/component-sites.appspot.com/o/furrymarketplace%2FFM%20logo%201.png?alt=media&token=c5e02204-27f3-4996-ac93-738f589826fb"
                  alt="FurBrush"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#2A9BB5] text-white hover:bg-[#2AB58A] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          {props.children}
        </div>
      </div>
    </>
  )
}
