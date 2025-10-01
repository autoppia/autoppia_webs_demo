"use client";

import { EVENT_TYPES, logEvent } from "@/library/events";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useSeedLayout } from "@/library/useSeedLayout";

interface Expert {
  slug: string;
  name: string;
  country: string;
  role: string;
  avatar: string;
}

export default function HireFormClient({ expert }: { expert: Expert }) {
  const { layout } = useSeedLayout();
  const [paymentType, setPaymentType] = useState("hourly");
  const [rate, setRate] = useState("50"); // demo value
  const [increaseWhen, setIncreaseWhen] = useState("Never");
  const [increaseHowMuch, setIncreaseHowMuch] = useState("5%");

  const route = useRouter();
  const handleCancel = () => {
    logEvent(EVENT_TYPES.CANCEL_HIRE, {
      Button: "Cancel",
      expert
    });
    route.push("/");
  };
  return (
    <>
      <ToastContainer />
      <main className="px-40 py-12">
        <h1 className="text-5xl font-extrabold text-[#253037] mb-8">
          Send an offer
        </h1>
        <div className="bg-[#fafbfc] p-4 rounded-lg border mb-10 flex items-center w-[50%]">
          <svg
            className="inline-block mr-3 w-7 h-7 text-[#08b4ce]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="#08b4ce" strokeWidth="2" />
            <path stroke="#08b4ce" strokeWidth="2" d="M12 8v4l3 2" />
          </svg>
          <span className="text-lg text-[#111]">
            Did you know?{" "}
            <span className="font-bold text-[#253037]">
              You can send up to 10 offers a day.
            </span>
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-12 mt-6">
          {/* Left: Form */}
          <form
            className="flex-1 max-w-2xl space-y-10"
            onSubmit={(e) => {
              e.preventDefault();
              logEvent("HIRE_CONSULTANT", {
                expertName: expert.name,
                expertSlug: expert.slug,
                role: expert.role,
                country: expert.country,
                paymentType,
                rate,
                increaseWhen,
                increaseHowMuch,
              });
              toast.success("Hired successfully!");
            }}
          >
            <div>
              <h2 className="text-2xl font-semibold mb-4">Job details</h2>
              <label className="block mb-2 font-medium text-base text-[#253037]">
                Hiring team
              </label>
              <select
                className="border rounded-lg px-4 py-2 w-full mb-5"
                id="select-team"
                onChange={(e) => {
                  const team = e.target.value;
                  // Fire event
                  logEvent(EVENT_TYPES.SELECT_HIRING_TEAM, {
                    team,
                    expertName: expert.name,
                    expertSlug: expert.slug,
                  });
                }}
              >
                <option value="Microsoft">Microsoft</option>
                <option value="Apple">Apple</option>
                <option value="Google">Google</option>
              </select>
              <label className="block mb-2 font-medium text-base text-[#253037]">
                Contract title
              </label>
              <input
                className="border rounded-lg px-4 py-2 w-full text-base mb-1"
                placeholder="Enter the contract title"
              />
            </div>
            <hr className="my-9" />
            <div>
              <h2 className="text-2xl font-semibold mb-4">Contract terms</h2>
              <p className="mb-5 text-[#199225] font-semibold">
                Topwork payment protection
                <span className="text-[#353b3f] font-normal ml-3">
                  Only pay for the work you authorize.
                </span>
              </p>
              <div>
                <div className="flex items-center mb-2">
                  <label className="block font-medium text-base text-[#253037] mr-2">
                    Payment option
                  </label>
                  <span className="inline-block align-middle text-xs text-gray-400 ml-1">
                    ?
                  </span>
                </div>
                <div className="flex gap-6 mb-7 w-full max-w-2xl">
                  {/* Hourly card */}
                  <button
                    type="button"
                    onClick={() => setPaymentType("hourly")}
                    className={`flex-1 min-w-[280px] rounded-2xl border px-6 py-6 text-left relative transition font-sans ${
                      paymentType === "hourly"
                        ? "border-green-600 bg-[#fafdfa] shadow-[0_0_0_2px_#1fc12c33]"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="absolute top-5 right-5 flex items-center gap-2">
                      <span
                        className={`inline-block w-6 h-6 rounded-full border-2 ${
                          paymentType === "hourly"
                            ? "border-green-700 bg-white"
                            : "border-gray-400 bg-white"
                        }`}
                      >
                        {" "}
                        {paymentType === "hourly" && (
                          <span className="block m-1 rounded-full w-3 h-3 bg-green-600" />
                        )}{" "}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-[22px] font-bold text-[#253037]">
                      <svg
                        className="inline-block"
                        width={22}
                        height={22}
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="#08b4ce"
                          strokeWidth="2"
                        />
                        <path
                          stroke="#08b4ce"
                          strokeWidth="2"
                          d="M12 8v4l3 2"
                        />
                      </svg>
                      Pay by the hour
                    </div>
                    <div className="text-gray-500 text-[15px] font-normal">
                      Pay for the number of hours worked on a project.
                    </div>
                  </button>
                  {/* Fixed price card */}
                  <button
                    type="button"
                    onClick={() => setPaymentType("fixed")}
                    className={`flex-1 min-w-[280px] rounded-2xl border px-6 py-6 text-left relative transition font-sans ${
                      paymentType === "fixed"
                        ? "border-green-600 bg-[#fafdfa] shadow-[0_0_0_2px_#1fc12c33]"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="absolute top-5 right-5 flex items-center gap-2">
                      <span
                        className={`inline-block w-6 h-6 rounded-full border-2 ${
                          paymentType === "fixed"
                            ? "border-green-700 bg-white"
                            : "border-gray-400 bg-white"
                        }`}
                      >
                        {" "}
                        {paymentType === "fixed" && (
                          <span className="block m-1 rounded-full w-3 h-3 bg-green-600" />
                        )}{" "}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-[22px] font-bold text-[#253037]">
                      <svg
                        className="inline-block"
                        width={22}
                        height={22}
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="4"
                          y="7"
                          width="16"
                          height="10"
                          rx="2"
                          stroke="#0999ac"
                          strokeWidth="2"
                        />
                        <path
                          d="M8 11h8M8 15h4"
                          stroke="#0999ac"
                          strokeWidth="2"
                        />
                      </svg>
                      Pay a fixed price
                    </div>
                    <div className="text-gray-500 text-[15px] font-normal">
                      Pay as project milestones are completed
                    </div>
                  </button>
                </div>
              </div>
              {paymentType === "hourly" && (
                <div className="mt-6 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold text-[#253037]">
                      ${rate}{" "}
                      <span className="text-base font-normal">/ hr</span>
                    </div>
                    <button
                      type="button"
                      className="text-[#08b4ce] ml-2 p-1 rounded hover:bg-[#08b4ce11]"
                    >
                      ✎
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {expert.name}'s profile rate is ${rate} / hr
                  </div>
                </div>
              )}
              {/* Rate increase section */}
              <div className="mt-8">
                <div className="text-lg font-semibold mb-2 text-[#253037]">
                  Schedule a rate increase
                </div>
                <div className="mb-1 text-[13px] text-gray-500">
                  Set an optional rate increase for {expert.name} in your
                  contract’s terms. Their rate will increase automatically and
                  can’t be changed if they accept your offer.
                </div>
                <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                  <select
                    value={increaseWhen}
                    onChange={(e) => setIncreaseWhen(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-base"
                    id="rate-increase-when"
                  >
                    <option>Never</option>
                    <option>After 3 months</option>
                    <option>After 6 months</option>
                    <option>After 12 months</option>
                  </select>
                  <select
                    value={increaseHowMuch}
                    onChange={(e) => setIncreaseHowMuch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-base"
                    id="rate-increase"
                  >
                    <option>5%</option>
                    <option>10%</option>
                    <option>15%</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={`flex gap-4 mt-10 ${
              layout.buttonPositions.cancel === 'left' && layout.buttonPositions.hire === 'right' ? 'justify-between' :
              layout.buttonPositions.cancel === 'center' && layout.buttonPositions.hire === 'center' ? 'justify-center' :
              layout.buttonPositions.cancel === 'right' && layout.buttonPositions.hire === 'left' ? 'justify-between flex-row-reverse' :
              'justify-end'
            }`}>
              <button
                type="button"
                className={`border border-green-600 text-green-700 hover:bg-green-50 px-6 py-2 rounded-lg font-semibold transition ${
                  layout.buttonPositions.cancel === 'center' ? 'order-2' : ''
                }`}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition ${
                  layout.buttonPositions.hire === 'center' ? 'order-1' : ''
                }`}
              >
                Hire
              </button>
            </div>
          </form>
          {/* Right: Expert summary */}
          <div className="md:w-96 shrink-0 border rounded-2xl bg-white flex flex-col items-center py-9 px-7 mt-10 md:mt-0 h-96">
            <div className="relative mb-4">
              <img
                src={expert.avatar}
                alt={expert.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-xl"
              />
              <span className="absolute bottom-1 right-4 w-4 h-4 bg-[#1fc12c] border-2 border-white rounded-full" />
            </div>
            <div className="font-bold text-2xl text-[#199225] leading-tight mb-1">
              {expert.name}
            </div>
            <div className="text-[#4a545b] text-lg mb-1">{expert.role}</div>
            <div className="mb-1 text-gray-600 flex items-center">
              <svg
                className="inline-block mr-1"
                width={20}
                height={20}
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#08b4ce"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="3"
                  stroke="#08b4ce"
                  strokeWidth="2"
                />
                <path
                  d="M12 13c-3.314 0-6 1.567-6 3v.5A2.5 2.5 0 0 0 8.5 19h7a2.5 2.5 0 0 0 2.5-2.5V16c0-1.433-2.686-3-6-3Z"
                  stroke="#08b4ce"
                  strokeWidth="2"
                />
              </svg>{" "}
              {expert.country}
            </div>
            <div className="text-xs text-gray-400">12:00 PM Local time</div>
          </div>
        </div>
      </main>
    </>
  );
}
