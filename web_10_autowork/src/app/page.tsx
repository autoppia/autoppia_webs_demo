"use client";
import Image from "next/image";
import { SeedLink } from "@/components/ui/SeedLink";
import { useEffect, useRef, useState } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { title } from "process";
import { ToastContainer, toast } from "react-toastify";
import { jobs,hires, experts  } from "@/library/dataset";
import { useSeedLayout } from "@/library/useSeedLayout";

function PostJobWizard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { layout, getElementAttributes } = useSeedLayout();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    skills: [] as string[],
    customSkill: "",
    scope: "",
    duration: "",
    budgetType: "hourly",
    rateFrom: "",
    rateTo: "",
    description: "",
    attachments: [] as File[],
  });
  const totalSteps = 5;

  function setValue<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function next() {
    setStep((s) => Math.min(totalSteps, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }
  function close() {
    setStep(1);
    onClose();
  }

  // Popular skills step 2
  const popularSkills = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C#",
    "C++",
    "Ruby",
    "Go",
    "Swift",
    "Kotlin",
    "Objective-C",
    "PHP",
    "HTML",
    "CSS",
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Django",
    "Flask",
  ];

  // Stepper progress text
  const progress = `${step}/${totalSteps}`;
  
  // Fixed step sequence for post job wizard (consistent across all seeds)
  const fixedStepSequence = ['skills', 'scope', 'title', 'budget', 'description'];
  
  // Create step title map for the fixed sequence
  const stepTitleMap = {
    skills: "What are the main skills required for your work?",
    scope: "Next, estimate the scope of your work.",
    title: "Let's start with a strong title.",
    budget: "Tell us about your budget.",
    description: "Start the conversation.",
  };
  
  // Get current step key based on fixed sequence
  const currentStepKey = fixedStepSequence[step - 1];
  const stepTitle = stepTitleMap[currentStepKey as keyof typeof stepTitleMap] || stepTitleMap.skills;

  const getButtonTitle = (step: number): string => {
    if (step === totalSteps) return "Submit Job Post";
    
    const currentStepKey = fixedStepSequence[step - 1];
    const nextStepKey = fixedStepSequence[step];
    
    if (nextStepKey) {
      return `Next: ${nextStepKey.charAt(0).toUpperCase() + nextStepKey.slice(1)}`;
    }
    return "Next";
  };

  const buttonTitle = getButtonTitle(step);
  // Define the EventData interface
  interface EventData {
    step: number;
    buttonText?: string;
    title?: string;
    skills?: string[];
    scope?: string;
    duration?: string;
    budgetType?: string;
    rateFrom?: string;
    rateTo?: string;
    description?: string;
    query?: string;
    skill?: string;
    method?: string;
    timestamp?: number;
    filename?: string;
    size?: number;
    type?: string;
  }

  const handleStepNext = () => {
    const eventData: EventData = {
      step,
      buttonText: buttonTitle,
    };

    // Add relevant data based on step
    if (step === 1) {
      eventData.title = form.title;
    } else if (step === 2) {
      eventData.skills = form.skills;
    } else if (step === 3) {
      eventData.scope = form.scope;
      eventData.duration = form.duration;
    } else if (step === 4) {
      eventData.budgetType = form.budgetType;
      eventData.rateFrom = form.rateFrom;
      eventData.rateTo = form.rateTo;
    }

    // Log the event with double cast
    logEvent(
      EVENT_TYPES[`NEXT_STEP_${step}` as `NEXT_STEP_${number}`] ||
        EVENT_TYPES.NEXT_SKILLS,
      eventData as unknown as Record<string, unknown>
    );

    // Advance step
    next();
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setValue("attachments", [...(form.attachments || []), file]);

      logEvent(EVENT_TYPES.ATTACH_FILE_CLICKED, {
        step,
        filename: file.name,
        size: file.size,
        type: file.type,
      });
    }
  }
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return open ? (
    <>
      <ToastContainer />
      <div className="fixed inset-0 z-50 bg-white flex flex-col min-h-screen">
        <header className="h-16 flex items-center px-8 border-b border-gray-200 bg-white shadow-sm">
          <span className="font-bold text-lg tracking-wide text-[#253037]">
            topwork
          </span>
        </header>
        <form
          className="flex-1 flex flex-col xl:flex-row xl:items-center xl:justify-center px-6 py-14 xl:py-0"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < totalSteps) next();
          }}
        >
          {/* Left: Step title & description */}
          <div className="flex-1 mb-12 xl:mb-0 xl:max-w-xl xl:pr-7">
            <div className="flex items-center gap-4 mb-4 text-[#7b858b] font-medium text-base">
              <span>{progress}</span>
              <span className="text-xs font-normal">Job post</span>
            </div>
            <h2 className="text-4xl font-bold mb-5 leading-tight text-[#253037]">
              {stepTitle}
            </h2>
            {currentStepKey === 'title' && (
              <p className="text-base text-[#4a545b] mb-10">
                This helps your job post stand out to the right candidates. It's
                the first thing they'll see, so make it count!
              </p>
            )}
            {currentStepKey === 'skills' && (
              <>
                <p className="text-base text-[#4a545b] mb-10">
                  For the best results, add 3-5 skills.
                </p>
              </>
            )}
            {currentStepKey === 'scope' && (
              <p className="text-base text-[#4a545b] mb-10">
                Consider the size of your project and the time it will take.
              </p>
            )}
            {currentStepKey === 'budget' && (
              <p className="text-base text-[#4a545b] mb-10">
                This will help us match you to talent within your range.
              </p>
            )}
            {currentStepKey === 'description' && (
              <>
                <div className="mb-4 font-medium text-[#253037]">
                  Talent are looking for:
                </div>
                <ul className="text-[#4a545b] mb-6 space-y-1">
                  <li>▪ Clear expectations about your task or deliverables</li>
                  <li>▪ The skills required for your work</li>
                  <li>▪ Good communication</li>
                  <li>▪ Details about how you or your team like to work</li>
                </ul>
              </>
            )}
          </div>
          {/* Right: Step content */}
          <div className="flex-1 xl:border-l border-gray-200 xl:pl-8 flex flex-col gap-7">
            {currentStepKey === 'title' && (
              <>
                <label
                  htmlFor="job-title"
                  className="font-semibold mb-2 text-[#253037]"
                >
                  Write a title for your job post
                </label>
                <input
                  id="job-title"
                  {...getElementAttributes('job-title-input', 0)}
                  className="rounded border border-gray-300 px-4 py-2 w-full max-w-lg text-lg focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none mt-1"
                  placeholder=""
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    setValue("title", value);
                    logEvent(EVENT_TYPES.WRITE_JOB_TITLE, {
                      query: value,
                      step: step,
                    });
                  }}
                  required
                />
                <div className="mt-6">
                  <span className="block mb-1 font-medium text-[#253037]">
                    Example titles
                  </span>
                  <ul className="text-[#4a545b] space-y-1 text-base">
                    <li>
                      • Build responsive WordPress site with booking/payment
                      functionality
                    </li>
                    <li>
                      • Graphic designer needed to design ad creative for
                      multiple campaigns
                    </li>
                    <li>• Facebook ad specialist needed for product launch</li>
                  </ul>
                </div>
              </>
            )}
            {currentStepKey === 'skills' && (
              <>
                <label className="font-semibold mb-2 text-[#253037]">
                  Search skills or add your own
                </label>
                <div className="flex gap-2 items-start mb-2" ref={dropdownRef}>
                  <input
                    {...getElementAttributes('skill-search-input', 0)}
                    className="rounded border border-gray-300 px-4 py-2 w-full max-w-lg text-base focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none"
                    placeholder="Type a skill and press Enter or Add button"
                    type="text"
                    value={form.customSkill}
                    onChange={(e) => {
                      const query = e.target.value;
                      setValue("customSkill", query);
                      if (query.length > 0) {
                        const matches = popularSkills.filter((s) =>
                          s.toLowerCase().includes(query.toLowerCase())
                        );
                        setFilteredSkills(matches);
                        setShowDropdown(true);
                        logEvent(EVENT_TYPES.SEARCH_SKILL, {
                          query,
                          timestamp: Date.now(),
                        });
                      } else {
                        setShowDropdown(false);
                        setFilteredSkills([]);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && form.customSkill.trim()) {
                        setValue("skills", [
                          ...form.skills,
                          form.customSkill.trim(),
                        ]);
                        setValue("customSkill", "");
                        e.preventDefault();
                      }
                    }}
                  />
                  {showDropdown && filteredSkills.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 w-40 mt-10 rounded shadow-sm max-h-52 overflow-y-auto">
                      {filteredSkills.map((skill) => (
                        <li
                          key={skill}
                          onClick={() => {
                            if (!form.skills.includes(skill)) {
                              setValue("skills", [...form.skills, skill]);
                            }
                            setValue("customSkill", "");
                            setFilteredSkills([]);
                            setShowDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-[#e6f9fb] cursor-pointer text-sm"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    {...getElementAttributes('add-skill-button', 0)}
                    className="rounded bg-[#08b4ce] text-white px-4 py-2 h-11 ml-2 font-bold hover:bg-[#0999ac]"
                    type="button"
                    onClick={() => {
                      const skill = form.customSkill.trim();
                      if (skill) {
                        if (!form.skills.includes(skill)) {
                          setValue("skills", [...form.skills, skill]);
                          logEvent(EVENT_TYPES.ADD_SKILL, {
                            skill,
                            method: "custom_input",
                            timestamp: Date.now(),
                          });
                        }
                        setValue("customSkill", "");
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
                <div className="mb-2 text-xs text-[#4a545b]">
                  For the best results, add 3-5 skills
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {form.skills.map((skill, i) => (
                    <span
                      key={skill + i}
                      className="px-3 py-1 bg-[#e6f9fb] border border-[#08b4ce88] rounded-full text-[#08b4ce] font-medium text-sm flex items-center gap-1"
                    >
                      {skill}
                      <button
                        {...getElementAttributes('remove-skill-button', i)}
                        type="button"
                        className="ml-1 text-xs font-bold"
                        onClick={() => {
                          const updatedSkills = form.skills.filter(
                            (s) => s !== skill
                          );
                          setValue("skills", updatedSkills);
                          logEvent(EVENT_TYPES.REMOVE_SKILL, {
                            skill,
                            timestamp: Date.now(),
                          });
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div>
                  <span className="font-medium">
                    Popular skills for Software Development
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {popularSkills.map((skill) => (
                      <button
                        key={skill}
                        {...getElementAttributes('popular-skill-button', popularSkills.indexOf(skill))}
                        type="button"
                        className="px-3 py-1 bg-gray-100 hover:bg-[#e6f9fb] border border-[#cad2d0] rounded-full text-[#253037] text-sm"
                        onClick={() => {
                          if (!form.skills.includes(skill)) {
                            setValue("skills", [...form.skills, skill]);
                            logEvent(EVENT_TYPES.ADD_SKILL, {
                              skill,
                              method: "popular_skill",
                            });
                          }
                        }}
                      >
                        {skill} +
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {currentStepKey === 'scope' && (
              <>
                <label className="font-semibold mb-2 text-[#253037]">
                  Estimate the size of your project
                </label>
                <div className="space-y-4 mb-8">
                  {["Large", "Medium", "Small"].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-start gap-3 cursor-pointer select-none"
                    >
                      <input
                        type="radio"
                        name="scope"
                        value={opt}
                        checked={form.scope === opt}
                        onChange={() => setValue("scope", opt)}
                        required
                        className="mt-1 accent-[#08b4ce]"
                      />
                      <span className="font-bold mr-1">{opt}</span>
                      <span className="text-sm text-[#4a545b]">
                        {opt === "Large"
                          ? "Longer term or complex initiatives (ex. design and build a full website)"
                          : opt === "Medium"
                          ? "Well-defined projects (ex. a landing page)"
                          : "Quick and straightforward tasks (ex. update text and images on a webpage)"}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-8">
                  <span className="font-semibold mb-2 text-[#253037]">
                    How long will your work take?
                  </span>
                  <div className="space-y-2 mt-4">
                    {["More than 6 months", "3 to 6 months"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <input
                          type="radio"
                          name="duration"
                          value={opt}
                          checked={form.duration === opt}
                          onChange={() => setValue("duration", opt)}
                          required
                          className="accent-[#08b4ce]"
                        />
                        <span className="text-base text-[#4a545b]">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
            {currentStepKey === 'budget' && (
              <>
                <span className="font-semibold mb-2 text-[#253037]">
                  Choose a budget type
                </span>
                <div className="flex gap-6 mb-7 mt-2">
                  <button
                    type="button"
                    onClick={() => setValue("budgetType", "hourly")}
                    className={`flex-1 px-6 py-5 rounded-xl border text-left ${
                      form.budgetType === "hourly"
                        ? "border-green-600 bg-[#f8fff8]"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="block mb-1 font-bold text-lg flex items-center gap-2">
                      <span
                        className={`inline-block w-5 h-5 mr-1 rounded-full border-2 ${
                          form.budgetType === "hourly"
                            ? "border-green-600 bg-[#1fc12c]"
                            : "border-gray-200 bg-white"
                        }`}
                      ></span>
                      Hourly rate
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("budgetType", "fixed")}
                    className={`flex-1 px-6 py-5 rounded-xl border text-left ${
                      form.budgetType === "fixed"
                        ? "border-green-600 bg-[#f8fff8]"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="block mb-1 font-bold text-lg flex items-center gap-2">
                      <span
                        className={`inline-block w-5 h-5 mr-1 rounded-full border-2 ${
                          form.budgetType === "fixed"
                            ? "border-green-600 bg-[#1fc12c]"
                            : "border-gray-200 bg-white"
                        }`}
                      ></span>
                      Fixed price
                    </span>
                  </button>
                </div>
                <div className="flex gap-4 items-end mb-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="From"
                    className="rounded border border-gray-300 px-4 py-2 w-28 text-base focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none"
                    value={form.rateFrom}
                    onChange={(e) => setValue("rateFrom", e.target.value)}
                  />
                  <span className="text-gray-500 font-medium mb-2">/hr</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="To"
                    className="rounded border border-gray-300 px-4 py-2 w-28 text-base focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none"
                    value={form.rateTo}
                    onChange={(e) => setValue("rateTo", e.target.value)}
                  />
                  <span className="text-gray-500 font-medium mb-2">/hr</span>
                </div>
                <div className="text-xs text-[#4a545b] mb-2">
                  This is the average rate for similar projects.
                </div>
              </>
            )}
            {currentStepKey === 'description' && (
              <>
                <label
                  htmlFor="desc"
                  className="font-semibold mb-2 text-[#253037]"
                >
                  Describe what you need
                </label>
                <textarea
                  id="desc"
                  {...getElementAttributes('job-description-textarea', 0)}
                  className="rounded border border-gray-300 px-4 py-2 w-full max-w-lg text-base focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none h-28 resize-vertical"
                  value={form.description}
                  onChange={(e) => setValue("description", e.target.value)}
                  placeholder="Already have a description? Paste it here!"
                  maxLength={50000}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {form.description.length}/50000 characters
                </div>
                <div className="mt-6">
                  <span className="font-semibold text-[#199225]">
                    Need help?
                  </span>{" "}
                  <a
                    href="#"
                    className="ml-2 text-[#1fc12c] underline font-semibold"
                  >
                    See examples of effective descriptions
                  </a>
                </div>
                <div className="mt-6">
                  <button
                    {...getElementAttributes('attach-file-button', 0)}
                    type="button"
                    // style={{ display: "none" }}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded border px-5 py-2 text-[#199225] border-[#1fc12c] bg-white hover:bg-[#e6f9fb] font-semibold flex items-center gap-2"
                  >
                    <span className="text-lg">📎</span> Attach file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                </div>
                {/* File List */}
                {form.attachments.length > 0 && (
                  <div className="mt-2 text-sm text-[#4a545b] space-y-1">
                    {form.attachments.map((file, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <span>{file.name}</span>
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </form>
        {/* Navigation bottom */}
        <div className={`flex px-5 py-4 border-t border-gray-200 items-center bg-white ${
          layout.buttonPositions.back === 'left' && layout.buttonPositions.submit === 'right' ? 'justify-between' :
          layout.buttonPositions.back === 'center' && layout.buttonPositions.submit === 'center' ? 'justify-center gap-4' :
          layout.buttonPositions.back === 'right' && layout.buttonPositions.submit === 'left' ? 'justify-between flex-row-reverse' :
          'justify-between'
        }`}>
          <button
            {...getElementAttributes('back-button', 0)}
            type="button"
            onClick={() => {
              logEvent(EVENT_TYPES.BACK_BUTTON, {
                step,
                ...(currentStepKey === 'skills' && { skills: form.skills }),
                ...(currentStepKey === 'scope' && {
                  scope: form.scope,
                  duration: form.duration,
                }),
                ...(currentStepKey === 'budget' && {
                  budgetType: form.budgetType,
                  rateFrom: form.rateFrom,
                  rateTo: form.rateTo,
                }),
                ...(currentStepKey === 'description' && { description: form.description }),
                ...(currentStepKey === 'title' && { title: form.title }),
              });
              back();
            }}
            className={`px-7 py-2 rounded-lg border text-[#253037] bg-white hover:bg-gray-50 shadow-sm ${
              layout.buttonPositions.back === 'center' ? 'order-2' : ''
            }`}
            disabled={step === 1}
          >
            Back
          </button>

          {step < totalSteps ? (
            <button
              {...getElementAttributes('next-button', step)}
              type="button"
              className={`px-7 py-2 rounded-lg bg-[#1fc12c] text-white text-base font-semibold shadow-sm hover:bg-green-700 ${
                layout.buttonPositions.submit === 'center' ? 'order-1' : ''
              }`}
              onClick={handleStepNext}
            >
              {buttonTitle}
            </button>
          ) : (
            <button
              {...getElementAttributes('submit-job-button', 0)}
              type="submit"
              onClick={() => {
                logEvent(EVENT_TYPES.SUBMIT_JOB, {
                  step,
                  title: form.title,
                  skills: form.skills,
                  scope: form.scope,
                  duration: form.duration,
                  budgetType: form.budgetType,
                  rateFrom: form.rateFrom,
                  rateTo: form.rateTo,
                  description: form.description,
                });
                toast.success("Job Submitted successfully!");
              }}
              className={`px-7 py-2 rounded-lg bg-[#1fc12c] text-white text-base font-semibold shadow-sm hover:bg-green-700 ${
                layout.buttonPositions.submit === 'center' ? 'order-1' : 'ml-2'
              }`}
            >
              Submit Job Post
            </button>
          )}
        </div>
        {/* Close icon */}
        <button
          {...getElementAttributes('close-post-job-button', 0)}
          onClick={() => {
            logEvent(EVENT_TYPES.CLOSE_POST_A_JOB_WINDOW, {
              step,
              title: form.title,
              skills: form.skills,
              scope: form.scope,
              duration: form.duration,
              budgetType: form.budgetType,
              rateFrom: form.rateFrom,
              rateTo: form.rateTo,
              description: form.description,
            });
            close();
          }}
          className={`absolute text-xl text-[#253037] font-bold ${
            layout.buttonPositions.close === 'top-left' ? 'top-4 left-4' :
            layout.buttonPositions.close === 'top-right' ? 'top-4 right-4' :
            layout.buttonPositions.close === 'bottom-left' ? 
              // Smart positioning to avoid overlap with navigation buttons
              (() => {
                const backPos = layout.buttonPositions.back as string;
                const submitPos = layout.buttonPositions.submit as string;
                
                // If back is left and submit is right (justify-between), move close to top-right to avoid both
                if (backPos === 'left' && submitPos === 'right') return 'top-4 right-4';
                // If back button is on left and submit is centered, move close to right
                if (backPos === 'left' && submitPos === 'center') return 'bottom-4 right-4';
                // If both back and submit are centered, move close to top-right to avoid navigation area
                if (backPos === 'center' && submitPos === 'center') return 'top-4 right-4';
                // If back is centered and submit is right, move close to left
                if (backPos === 'center' && submitPos === 'right') return 'bottom-4 left-4';
                // Default to bottom-left if no conflicts
                return 'bottom-4 left-4';
              })() :
            layout.buttonPositions.close === 'bottom-right' ? 
              // Smart positioning to avoid overlap with navigation buttons
              (() => {
                const backPos = layout.buttonPositions.back as string;
                const submitPos = layout.buttonPositions.submit as string;
                
                // If back is left and submit is right (justify-between), move close to top-left to avoid both
                if (backPos === 'left' && submitPos === 'right') return 'top-4 left-4';
                // If back is right and submit is left (justify-between), move close to top-right to avoid both
                if (backPos === 'right' && submitPos === 'left') return 'top-4 right-4';
                // If submit button is on right, move close to left
                if (submitPos === 'right') return 'bottom-4 left-4';
                // If back button is on right, move close to left
                if (backPos === 'right') return 'bottom-4 left-4';
                // If both back and submit are centered, move close to top-left to avoid navigation area
                if (backPos === 'center' && submitPos === 'center') return 'top-4 left-4';
                // Default to bottom-right if no conflicts
                return 'bottom-4 right-4';
              })() :
            'top-4 right-4'
          }`}
        >
          ×
        </button>
      </div>
    </>
  ) : null;
}

export default function Home() {
  const [showPostJob, setShowPostJob] = useState(false);
  const { layout, getElementAttributes, getText } = useSeedLayout();

  // Create section components
  const JobsSection = () => (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-2xl font-semibold"
          {...getElementAttributes('jobs-heading', 0)}
        >
          {getText('jobs-heading', 'Your jobs')}
        </h2>
        <button
          {...getElementAttributes('post-job-button', 0)}
          type="button"
          className={`inline-flex items-center px-5 py-2 rounded-full bg-[#1fc12c] hover:bg-[#199225] text-white font-semibold shadow-sm text-base transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#199225] ${
            layout.buttonPositions.postJob === 'left' ? 'ml-auto' :
            layout.buttonPositions.postJob === 'center' ? 'mx-auto' : ''
          }`}
          onClick={() => {
            setShowPostJob(true);
            logEvent(EVENT_TYPES.POST_A_JOB, {
              source: "button",
              page: "home",
            });
          }}
        >
          {getText('post-job-button-label', '+ Post a job')}
        </button>
      </div>
      <div className="grid gap-7 grid-cols-1 md:grid-cols-2">
        {jobs.map((job, i) => (
          <div
            key={i}
            {...getElementAttributes('job-item', i)}
            className="bg-white shadow rounded-xl px-7 py-6 flex flex-col gap-2 border border-gray-100"
          >
            <div className="flex flex-wrap justify-between items-center gap-4">
              <span className="text-lg font-medium text-[#253037]">
                {job.title}
              </span>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background:
                    job.status === "Completed"
                      ? "#ebcf95"
                      : job.status === "In progress"
                      ? "#08b4ce10"
                      : job.status === "Pending"
                      ? "#b0627510"
                      : job.status === "In review"
                      ? "#cea2ab50"
                      : "#cad2d0",
                  color:
                    job.status === "Completed"
                      ? "#253037"
                      : job.status === "In progress"
                      ? "#08b4ce"
                      : job.status === "Pending"
                      ? "#b06275"
                      : job.status === "In review"
                      ? "#b06275"
                      : "#253037",
                }}
              >
                {job.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Date started {job.start}
            </div>
            <div className="flex flex-wrap justify-between items-end">
              <div>
                <span className="block text-sm font-medium text-gray-600">
                  {job.timestr}{" "}
                  <span className="font-bold text-black">{job.time}</span>
                </span>
                <span className="block text-xs text-gray-400 mt-1">
                  {job.activity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const HiresSection = () => (
    <section className="px-10 mt-14 px-4">
      <div className="flex items-center justify-between mb-7">
        <h2
          className="text-2xl font-semibold"
          {...getElementAttributes('hires-heading', 0)}
        >
          {getText('hires-heading', 'Your hires')}
        </h2>
        <a
          href="#"
          className="text-[#08b4ce] text-sm font-medium hover:underline"
        >
          View all your hires
        </a>
      </div>
      <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {hires.map((hire) => (
          <div
            key={hire.name}
            className="bg-white rounded-xl shadow px-6 py-5 flex flex-col gap-2 border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-1">
              <img
                src={hire.avatar}
                alt={hire.name}
                className="w-12 h-12 rounded-full object-cover border border-[#cad2d0] shadow"
              />
              <div>
                <div className="font-semibold text-lg text-[#253037]">
                  {hire.name}
                </div>
                <div className="text-xs text-gray-500">{hire.country}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#08b4ce] font-semibold mb-1">
              {hire.rate}
              <span className="text-gray-400 font-normal ml-2">
                • {hire.role}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs mt-1 text-gray-500">
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-[#ebcf95]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.234c.969 0 1.371 1.24.588 1.81l-3.424 2.49a1 1 0 00-.364 1.118l1.286 3.965c.3.921-.755 1.688-1.539 1.118l-3.424-2.49a1 1 0 00-1.176 0l-3.424 2.49c-.783.57-1.838-.197-1.539-1.118l1.286-3.965a1 1 0 00-.364-1.118L2.22 9.392c-.783-.57-.38-1.81.588-1.81h4.234a1 1 0 00.95-.69l1.286-3.965z" />
                </svg>{" "}
                {hire.rating}
              </span>
              <span> {hire.jobs} jobs</span>
            </div>
            {hire.rehire && (
              <span className="mt-2 w-32 inline-block text-xs bg-[#e6f9fb] text-[#08b4ce] font-medium px-2 py-1 rounded">
                Available for rehire
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  const ExpertsSection = () => (
    <section className="px-10 mt-16 px-4">
      <h2
        className="text-2xl font-semibold mb-7"
        {...getElementAttributes('experts-heading', 0)}
      >
        {getText('experts-heading', "Review your project's goals with an expert, one-on-one")}
      </h2>
      <div className="grid gap-7 md:grid-cols-2">
        {experts.map((expert, i) => (
          <div
            key={expert.name}
            className="bg-white rounded-2xl shadow px-6 py-5 flex flex-col gap-2 border border-gray-100 relative"
          >
            <div className="flex items-center gap-3 mb-3 mt-2">
              <img
                src={expert.avatar}
                alt={expert.name}
                className="w-12 h-12 rounded-full object-cover border border-[#cad2d0] shadow"
              />
              <div>
                <div className="font-semibold text-lg text-[#253037] leading-tight">
                  {expert.name}
                </div>
                <div className="text-xs text-gray-500">{expert.country}</div>
              </div>
            </div>
            <div className="text-sm font-semibold text-[#253037] mb-1">
              {expert.role}
            </div>
            <div className="flex items-center gap-4 text-[#6c7280] text-xs mb-1">
              <span>
                <span className="font-bold text-base text-[#253037]">
                  {expert.rate}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-[#ebcf95]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.234c.969 0 1.371 1.24.588 1.81l-3.424 2.49a1 1 0 00-.364 1.118l1.286 3.965c.3.921-.755 1.688-1.539 1.118l-3.424-2.49a1 1 0 00-1.176 0l-3.424 2.49c-.783.57-1.838-.197-1.539-1.118l1.286-3.965a1 1 0 00-.364-1.118L2.22 9.392c-.783-.57-.38-1.81.588-1.81h4.234a1 1 0 00.95-.69l1.286-3.965z" />
                </svg>{" "}
                {expert.rating}
              </span>
              <span className="ml-1">{expert.jobs}</span>
            </div>
            <div className="text-[15px] text-gray-700 mb-2 leading-tight">
              {expert.desc}
            </div>
            <div className="flex items-center gap-2 text-[#1964e2] text-base font-semibold py-2 mb-2">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="#1964e2"
                  strokeWidth="1.4"
                  d="M7.75 8.5h8.5M7.75 11.75h5.5M17.25 6.25V5A2.25 2.25 0 0 0 15 2.75H5A2.25 2.25 0 0 0 2.75 5v8A2.25 2.25 0 0 0 5 15.25h1.25m1 4.5h10A2.25 2.25 0 0 0 19.5 17.5v-6.25m-6.75 7.75-2.25-2.25m0 0 .446-.447c.267-.268.661-.306.93-.05l.424.406c.27.257.662.241.919-.03a.656.656 0 0 0-.018-.908l-.36-.356c-.26-.257-.239-.668.033-.917l.349-.327a.873.873 0 0 1 1.17.003l1.222 1.125c.32.294.843.217 1.064-.167l.022-.037M19.5 13V5A2.25 2.25 0 0 0 17.25 2.75H7a2.25 2.25 0 0 0-2.25 2.25v8c0 .414.336.75.75.75h12.5a.75.75 0 0 0 .75-.75Z"
                />
              </svg>
              <span>{expert.consultation}</span>
            </div>
            <SeedLink
              href={`/expert/${expert.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/\./g, "")}`}
              passHref
              {...getElementAttributes('book-consultation-button', i)}
              className="w-full mt-1 py-2 border border-gray-300 rounded-xl bg-white font-semibold text-lg text-[#253037] shadow hover:bg-[#f4f7fa] transition text-center flex items-center justify-center"
            >
              {getText('book-consultation-button-label', 'Book a consultation')}
            </SeedLink>
          </div>
        ))}
      </div>
    </section>
  );

  // Create section map for dynamic ordering
  const sectionMap = {
    jobs: <JobsSection key="jobs" />,
    hires: <HiresSection key="hires" />,
    experts: <ExpertsSection key="experts" />,
  };

  // Render sections in the order specified by layout
  const renderSections = () => {
    return layout.mainSections.map((sectionKey) => {
      return sectionMap[sectionKey as keyof typeof sectionMap];
    });
  };

  return (
    <main className="px-10 mt-12 pb-16 text-[#253037]">
      {renderSections()}
      <PostJobWizard open={showPostJob} onClose={() => setShowPostJob(false)} />
    </main>
  );
}
