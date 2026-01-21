    // <section className="h-screen bg-gray-200">
    //   <div className="mx-auto max-w-2xl flex-col px-8 py-8">
    //     {/* TOP */}
    //     <div>
    //       <SelectField
    //         value={dt}
    //         onChange={setDt}
    //         options={options}
    //         placeholder="Date/Time"
    //       />
    //     </div>

    //     {/* MIDDLE */}
    //     <div className="flex flex-col items-center justify-center text-center pt-16">
    //       <div className="text-sm text-gray-500">{slide?.region ?? "-"}</div>

    //       <div className="mt-1 text-7xl font-semibold tracking-tight text-gray-600">
    //         {slide?.mainTemp ?? "-"}
    //       </div>

    //       {/* ✅ icon สภาพอากาศใต้ Temp */}
    //       {MainWeatherIcon ? (
    //         <div className="mt-3">
    //           <MainWeatherIcon className="h-10 w-10 text-gray-600" />
    //         </div>
    //       ) : null}

    //       <div className="mt-3 text-sm text-gray-500">{slide?.desc ?? "-"}</div>
    //     </div>

    //     {/* BOTTOM (ยกขึ้น ไม่ให้จม) */}
    //     <div className="absolute inset-x-0 bottom-22 sm:bottom-27">
    //       <div className="mx-auto w-full max-w-2xl">
    //         <div
    //           className="
    //             mx-auto w-full max-w-[460px]
    //             flex items-start justify-between
    //             max-[520px]:grid max-[520px]:grid-cols-3
    //             max-[520px]:justify-items-center max-[520px]:gap-y-4
    //           "
    //         >
    //           {bottomItems.map((it, idx) => {
    //             const Icon = ICON_BY_FIELD[it.key];

    //             return (
    //               <div
    //                 key={idx}
    //                 className="flex flex-col items-center gap-1 text-gray-600"
    //               >
    //                 <Icon className="h-6 w-6" />

    //                 <div
    //                   className="
    //                     text-xs text-center leading-tight
    //                     whitespace-pre-line break-words
    //                     max-w-[150px]
    //                   "
    //                 >
    //                   {it.key === "nearbyAreas"
    //                     ? formatNearbyValue(it.value)
    //                     : it.value}
    //                 </div>
    //               </div>
    //             );
    //           })}
    //         </div>

    //         {/* DOTS */}
    //         <div className="mt-5 flex items-center justify-center gap-2">
    //           {slides.map((s, i) => (
    //             <button
    //               key={s.id ?? i}
    //               type="button"
    //               aria-label={s.label ?? `dot-${i + 1}`}
    //               onClick={() => setActive(i)}
    //               className={`h-2 w-2 rounded-full cursor-pointer ${
    //                 i === active ? "bg-gray-700" : "bg-gray-400/50"
    //               }`}
    //             />
    //           ))}
    //         </div>
    //       </div>
    //     </div>

    //     <div/>
    //   </div>
    // </section>