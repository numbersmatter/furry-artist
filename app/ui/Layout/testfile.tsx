



export default function componentName() {
  
  return (
    <article className="prose prose-xl">
        <div key={"Needs Review"} className="relative">
              <div className="sticky top-0 z-10 border-t border-b border-gray-200 bg-orange-400 px-6 py-1 text-sm font-medium text-gray-500">
                <h3 className="text-xl" >Needs Review ( {needsReviewStatuses.length} )</h3>
              </div>
              <ul className="relative z-0 divide-y divide-gray-200">
                {needsReviewStatuses.map((intentDoc) => (
                  <li key={intentDoc.intentId} className="bg-white">
                    <NavLink to={intentDoc.intentId ?? "error"}
                      className={({ isActive }) => isActive ? "relative flex items-center space-x-3 px-6 py-5 bg-slate-400" : "relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:bg-gray-50"}
                    >

                      <div className="min-w-0 flex-1">

                        {/* Extend touch target to entire panel */}
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">{intentDoc.humanReadableId}</p>
                        <p className="truncate text-sm text-gray-500">hold role</p>
                      </div>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div key={"Hold"} className="relative">
              <div className="sticky top-0 z-10 border-t border-b border-gray-200 bg-yellow-300 px-6 py-1 text-sm font-medium text-gray-500">
                <h3 className="text-xl">Hold ( {holdStatuses.length} ) </h3>
              </div>
              <ul className="relative z-0 divide-y divide-gray-200">
                {holdStatuses.map((intentDoc) => (
                  <li key={intentDoc.intentId} className="bg-white">
                    <NavLink to={intentDoc.intentId ?? "error"}
                      className={({ isActive }) => isActive ? "relative flex items-center space-x-3 px-6 py-5 bg-slate-400" : "relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:bg-gray-50"}
                    >
                      <div className="flex-shrink-0">
                        {/* <img className="h-10 w-10 rounded-full" src={intentDoc.imageUrl} alt="" /> */}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                        //  to={intentDoc.intentId ?? "error"} 
                        //   className={ ({isActive})=> isActive ?  "bg-slate-400" :  "focus:outline-none" }
                        >
                          {/* Extend touch target to entire panel */}
                          <span className="absolute inset-0" aria-hidden="true" />
                          <p className="text-sm font-medium text-gray-900">{intentDoc.humanReadableId}</p>
                          <p className="truncate text-sm text-gray-500">hold role</p>
                        </div>
                      </div>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div key={"Accepted"} className="relative">
              <div className="sticky top-0 z-10 border-t border-b border-gray-200 bg-green-400 px-6 py-1 text-sm font-medium text-gray-500">
                <h3 className="text-xl">Accepted ( {acceptedStatuses.length} )</h3>
              </div>
              <ul className="relative z-0 divide-y divide-gray-200">
                {acceptedStatuses.map((intentDoc) => (
                  <li key={intentDoc.intentId} className="bg-white">
                    <NavLink to={intentDoc.intentId ?? "error"}
                      className={({ isActive }) => isActive ? "relative flex items-center space-x-3 px-6 py-5 bg-slate-400" : "relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:bg-gray-50"}
                    >
                      <div className="flex-shrink-0">
                        {/* <img className="h-10 w-10 rounded-full" src={intentDoc.imageUrl} alt="" /> */}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                        >
                          {/* Extend touch target to entire panel */}
                          <span className="absolute inset-0" aria-hidden="true" />
                          <p className="text-sm font-medium text-gray-900">{intentDoc.humanReadableId}</p>
                          <p className="truncate text-sm text-gray-500">hold role</p>
                        </div>
                      </div>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div key={"Declined"} className="relative">
              <div className="sticky top-0 z-10 border-t border-b border-gray-200 bg-red-300 px-6 py-1 text-sm font-medium text-gray-500">
                <h3 className="text-xl">Declined ( {declinedStatuses.length} )</h3>
              </div>
              <ul className="relative z-0 divide-y divide-gray-200">
                {declinedStatuses.map((intentDoc) => (
                  <li key={intentDoc.intentId} className="bg-white">
                    <NavLink to={intentDoc.intentId ?? "error"}
                      className={({ isActive }) => isActive ? "relative flex items-center space-x-3 px-6 py-5 bg-slate-400" : "relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:bg-gray-50"}
                    >
                      <div className="flex-shrink-0">
                        {/* <img className="h-10 w-10 rounded-full" src={intentDoc.imageUrl} alt="" /> */}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div >
                          {/* Extend touch target to entire panel */}
                          <span className="absolute inset-0" aria-hidden="true" />
                          <p className="text-sm font-medium text-gray-900">{intentDoc.humanReadableId}</p>
                          <p className="truncate text-sm text-gray-500">hold role</p>
                        </div>
                      </div>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

      <h1>Welcome to componentName</h1>
      <p>This is the  componentName</p>
    </article>
  );
}