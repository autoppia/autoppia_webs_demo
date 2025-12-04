"use client";
import Image from "next/image";
import { SeedLink } from "@/components/ui/SeedLink";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { title } from "process";
import { ToastContainer, toast } from "react-toastify";
// import { jobs,hires, experts  } from "@/library/dataset";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import { useAutoworkData } from "@/hooks/useAutoworkData";
import { writeJson } from "@/shared/storage";
import { useSeedRouter } from "@/hooks/useSeedRouter";

const POPULAR_SKILLS = [
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
] as const;

const SCOPE_SIZE_OPTIONS = ["Large", "Medium", "Small"] as const;
const SCOPE_DURATION_OPTIONS = ["More than 6 months", "3 to 6 months"] as const;

const BUDGET_TYPE_OPTIONS = [
  { key: "hourly", label: "Hourly rate" },
  { key: "fixed", label: "Fixed price" },
] as const;

function PostJobWizard({
  open,
  onClose,
  onJobCreated,
}: {
  open: boolean;
  onClose: () => void;
  onJobCreated?: (job: any) => void;
}) {
  const { layout, getElementAttributes, getText, shuffleList } = useSeedLayout();
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

  const popularSkillOptions = useMemo(
    () => shuffleList([...POPULAR_SKILLS], "postjob_popular_skills"),
    [shuffleList]
  );
  const scopeSizeOptions = useMemo(
    () => shuffleList([...SCOPE_SIZE_OPTIONS], "postjob_scope_size"),
    [shuffleList]
  );
  const scopeDurationOptions = useMemo(
    () => shuffleList([...SCOPE_DURATION_OPTIONS], "postjob_scope_duration"),
    [shuffleList]
  );
  const budgetTypeOptions = useMemo(
    () => shuffleList(BUDGET_TYPE_OPTIONS.map((option) => ({ ...option })), "postjob_budget_type"),
    [shuffleList]
  );

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

  // Stepper progress text
  const progress = `${step}/${totalSteps}`;
  
  // Fixed step sequence for post job wizard (consistent across all seeds)
  const fixedStepSequence = ['skills', 'scope', 'title', 'budget', 'description'];
  
  // Get current step key based on fixed sequence
  const currentStepKey = fixedStepSequence[step - 1];
  const stepTitle = (() => {
    switch (currentStepKey) {
      case "skills":
        return "What are the main skills required for your work?";
      case "scope":
        return "Next, estimate the scope of your work.";
      case "title":
        return "Let's start with a strong title.";
      case "budget":
        return "Tell us about your budget.";
      case "description":
        return "Start the conversation.";
      default:
        return "What are the main skills required for your work?";
    }
  })();

  const backButtonLabel = "Back";

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
  const nextButtonLabel = step === totalSteps ? "Submit Job Post" : buttonTitle;
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
      buttonText: nextButtonLabel,
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
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={close}>
        <div 
          className="bg-white rounded-2xl shadow-2xl w-[900px] h-[700px] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white shrink-0">
            <span className="font-bold text-lg tracking-wide text-[#253037]">
              Create Job
            </span>
            <button
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
              className="text-2xl text-[#253037] font-bold hover:text-gray-600 transition w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </header>
          <form
            className="flex-1 flex flex-col xl:flex-row xl:items-start overflow-y-auto px-10 py-10"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < totalSteps) next();
          }}
        >
          {/* Left: Step title & description */}
          <div className="flex-1 mb-12 xl:mb-0 xl:max-w-xl xl:pr-12">
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
          <div className="flex-1 xl:border-l border-gray-200 xl:pl-12 flex flex-col gap-7 max-w-2xl">
            {currentStepKey === 'title' && (
              <>
                <label
                  htmlFor="job-title"
                  className="font-semibold mb-2 text-[#253037]"
                >
                  {getText(
                    "job-title-heading",
                    "Write a title for your job post"
                  )}
                </label>
                <input
                  id="job-title"
                  {...getElementAttributes('job-title-input', 0)}
                  className="rounded border border-gray-300 px-4 py-2 w-full max-w-lg text-lg focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none mt-1"
                  placeholder={getText("job-title-placeholder", "")}
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
                  {getText(
                    "skill-search-label",
                    "Search skills or add your own"
                  )}
                </label>
                <div className="flex gap-2 items-start mb-2" ref={dropdownRef}>
                  <input
                    {...getElementAttributes('skill-search-input', 0)}
                    className="rounded border border-gray-300 px-4 py-2 w-full max-w-lg text-base focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none"
                    placeholder={getText(
                      "skill-search-placeholder",
                      "Type a skill and press Enter or Add button"
                    )}
                    type="text"
                    value={form.customSkill}
                    onChange={(e) => {
                      const query = e.target.value;
                      setValue("customSkill", query);
                      if (query.length > 0) {
                        const matches = popularSkillOptions.filter((s) =>
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
                    className="rounded bg-[#08b4ce] text-white px-6 py-2 h-11 ml-2 font-semibold hover:bg-[#0999ac] transition whitespace-nowrap"
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
                    {getText("add-skill-button-label", "Add it")}
                  </button>
                </div>
                <div className="mb-2 text-xs text-[#4a545b]">
                  {getText(
                    "skills-helper-text",
                    "For the best results, add 3-5 skills"
                  )}
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
                    {getText(
                      "popular-skills-heading",
                      "Popular skills for Software Development"
                    )}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {popularSkillOptions.map((skill) => (
                      <button
                        key={skill}
                        {...getElementAttributes('popular-skill-button', popularSkillOptions.indexOf(skill))}
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
                  {getText(
                    "scope-step-heading",
                    "Estimate the size of your project"
                  )}
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
                    {getText(
                      "duration-heading",
                      "How long will your work take?"
                    )}
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
              <div className="space-y-8">
                {(layout.formFields?.budget ?? ["type", "rate", "increase"]).map((sectionKey) => {
                  if (sectionKey === "type") {
                    return (
                      <section key="budget-type">
                        <span className="font-semibold mb-2 block text-[#253037]">
                          Choose a budget type
                        </span>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-2">
                          {budgetTypeOptions.map((option, optionIndex) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => setValue("budgetType", option.key)}
                              className={`flex-1 px-6 py-5 rounded-xl border text-left ${
                                form.budgetType === option.key
                                  ? "border-green-600 bg-[#f8fff8]"
                                  : "border-gray-200 bg-white"
                              }`}
                              {...getElementAttributes('budget-type-button', optionIndex)}
                            >
                              <span className="block mb-1 font-bold text-lg flex items-center gap-2">
                                <span
                                  className={`inline-block w-5 h-5 mr-1 rounded-full border-2 ${
                                    form.budgetType === option.key
                                      ? "border-green-600 bg-[#1fc12c]"
                                      : "border-gray-200 bg-white"
                                  }`}
                                ></span>
                                {option.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  if (sectionKey === "rate") {
                    return (
                      <section key="budget-rate">
                        <div className="flex flex-wrap gap-4 items-end">
                          <div className="flex flex-col">
                            <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                              From
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              className="rounded border border-gray-300 px-4 py-2 w-28 text-base focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none"
                              value={form.rateFrom}
                              onChange={(e) => setValue("rateFrom", e.target.value)}
                            />
                          </div>
                          <span className="text-gray-500 font-medium pb-2">/hr</span>
                          <div className="flex flex-col">
                            <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                              To
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              className="rounded border border-gray-300 px-4 py-2 w-28 text-base focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none"
                              value={form.rateTo}
                              onChange={(e) => setValue("rateTo", e.target.value)}
                            />
                          </div>
                          <span className="text-gray-500 font-medium pb-2">/hr</span>
                        </div>
                        <div className="text-xs text-[#4a545b] mt-2">
                          This is the average rate for similar projects.
                        </div>
                      </section>
                    );
                  }

                  if (sectionKey === "increase") {
                    return (
                      <section
                        key="budget-increase"
                        className="rounded-xl border border-dashed border-gray-200 p-4 bg-gray-50"
                      >
                        <span className="font-semibold text-[#253037]">
                          Optional: Plan a future rate increase
                        </span>
                        <p className="text-sm text-[#4a545b] mt-2">
                          You can add rate adjustments later in your contract details if your work grows in scope.
                        </p>
                      </section>
                    );
                  }

                  return null;
                })}
              </div>
            )}
            {currentStepKey === 'description' && (
              <>
                <label
                  htmlFor="desc"
                  className="font-semibold mb-2 text-[#253037]"
                >
                  {getText(
                    "job-description-heading",
                    "Describe what you need"
                  )}
                </label>
                <textarea
                  id="desc"
                  {...getElementAttributes('job-description-textarea', 0)}
                  className="rounded border border-gray-300 px-4 py-2 w-full max-w-lg text-base focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none h-28 resize-vertical"
                  value={form.description}
                  onChange={(e) => setValue("description", e.target.value)}
                  placeholder={getText(
                    "job-description-placeholder",
                    "Already have a description? Paste it here!"
                  )}
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
                    <span className="text-lg">📎</span>{" "}
                    {getText("attach-file-button-label", "Attach file")}
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
        <div className="flex px-10 py-5 border-t border-gray-200 items-center bg-white shrink-0 justify-between">
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
            className="px-7 py-2 rounded-lg border text-[#253037] bg-white hover:bg-gray-50 shadow-sm"
            disabled={step === 1}
          >
            {backButtonLabel}
          </button>

          {step < totalSteps ? (
            <button
              {...getElementAttributes('next-button', step)}
              type="button"
              className="px-7 py-2 rounded-lg bg-[#1fc12c] text-white text-base font-semibold shadow-sm hover:bg-green-700"
              onClick={handleStepNext}
            >
              {nextButtonLabel}
            </button>
          ) : (
            <button
              {...getElementAttributes('submit-job-button', 0)}
              type="submit"
              onClick={() => {
                // Create job object
                const newJob = {
                  id: `job_${Date.now()}`,
                  title: form.title,
                  status: "Pending",
                  start: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  timestr: "Time logged this week:",
                  time: "0:00 hrs ($0)",
                  activity: "last active just now on Initial project setup",
                  skills: form.skills,
                  scope: form.scope,
                  duration: form.duration,
                  budgetType: form.budgetType,
                  rateFrom: form.rateFrom,
                  rateTo: form.rateTo,
                  description: form.description,
                };

                // Save to localStorage
                try {
                  const existingJobs = JSON.parse(
                    window.localStorage.getItem("autowork_user_jobs") || "[]"
                  );
                  existingJobs.unshift(newJob); // Add to beginning
                  window.localStorage.setItem("autowork_user_jobs", JSON.stringify(existingJobs));
                } catch (err) {
                  console.error("Failed to save job to localStorage:", err);
                }

                // Log event
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

                // Call callback to update parent
                if (onJobCreated) {
                  onJobCreated(newJob);
                }

                toast.success("Job Submitted successfully!");
                
                // Close wizard and reset form
                setTimeout(() => {
                  close();
                  setForm({
                    title: "",
                    skills: [],
                    customSkill: "",
                    scope: "",
                    duration: "",
                    budgetType: "hourly",
                    rateFrom: "",
                    rateTo: "",
                    description: "",
                    attachments: [],
                  });
                }, 1000);
              }}
              className="px-7 py-2 rounded-lg bg-[#1fc12c] text-white text-base font-semibold shadow-sm hover:bg-green-700"
            >
              {nextButtonLabel}
            </button>
          )}
        </div>
        </div>
      </div>
    </>
  ) : null;
}

export default function Home() {
	const pathname = usePathname();
	const [showPostJob, setShowPostJob] = useState(false);
	const [hasSeenInitialLoad, setHasSeenInitialLoad] = useState(false);
	const [userJobs, setUserJobs] = useState<any[]>([]);
	const { layout, getElementAttributes, getText } = useSeedLayout();

	const jobsState = useAutoworkData<any>("web_10_autowork_jobs", 6);
	const hiresState = useAutoworkData<any>("web_10_autowork_hires", 6);
	const expertsState = useAutoworkData<any>("web_10_autowork_experts", 6);

	// Load user jobs from localStorage
	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const saved = window.localStorage.getItem("autowork_user_jobs");
			if (saved) {
				const jobs = JSON.parse(saved);
				setUserJobs(jobs);
			}
		} catch (err) {
			console.error("Failed to load user jobs from localStorage:", err);
		}
	}, []);

	// Combine user jobs with fetched jobs (user jobs first)
	const allJobs = useMemo(() => {
		return [...userJobs, ...jobsState.data];
	}, [userJobs, jobsState.data]);

	const isLoading = jobsState.isLoading || hiresState.isLoading || expertsState.isLoading;
	const errorMessage = jobsState.error || hiresState.error || expertsState.error;
	const statusMessage = jobsState.statusMessage || hiresState.statusMessage || expertsState.statusMessage;

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			if (localStorage.getItem("autoworkInitialLoadComplete") === "true") {
				setHasSeenInitialLoad(true);
			}
		} catch {
			// ignore storage access errors
		}
	}, []);

	useEffect(() => {
		if (
			!hasSeenInitialLoad &&
			!isLoading &&
			jobsState.data.length > 0 &&
			hiresState.data.length > 0 &&
			expertsState.data.length > 0
		) {
			setHasSeenInitialLoad(true);
			try {
				localStorage.setItem("autoworkInitialLoadComplete", "true");
			} catch {
				// ignore storage access errors
			}
		}
	}, [hasSeenInitialLoad, isLoading, jobsState.data.length, hiresState.data.length, expertsState.data.length]);

	const showInitialLoading = !hasSeenInitialLoad && (isLoading || Boolean(statusMessage));

	// Persist combined dataset once loaded
	useEffect(() => {
		if (!isLoading) {
			const combined = {
				jobs: jobsState.data,
				hires: hiresState.data,
				experts: expertsState.data,
			};
			writeJson("autowork_all", combined);
			
			// Also save experts separately for ExpertProfileClient
			if (expertsState.data.length > 0) {
				window.localStorage.setItem("autowork_experts", JSON.stringify(expertsState.data));
			}
		}
	}, [isLoading, jobsState.data, hiresState.data, expertsState.data]);

	// Create section components
	const JobsSection = () => {
		const totalJobs = allJobs.length;
		const completedJobs = allJobs.filter((j: any) => j.status === "Completed").length;
		const inProgressJobs = allJobs.filter((j: any) => j.status === "In progress").length;
		
		const getStatusColor = (status: string) => {
			switch (status) {
				case "Completed":
					return {
						bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200",
						badge: "bg-green-100 text-green-800 border border-green-300",
						icon: "text-yellow-600",
					};
				case "In progress":
					return {
						bg: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
						badge: "bg-purple-100 text-purple-800 border border-purple-300",
						icon: "text-blue-600",
					};
				case "Pending":
					return {
						bg: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
						badge: "bg-gray-100 text-gray-800 border border-gray-300",
						icon: "text-orange-600",
					};
				case "In review":
					return {
						bg: "bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200",
						badge: "bg-indigo-100 text-indigo-800 border border-indigo-300",
						icon: "text-pink-600",
					};
				default:
					return {
						bg: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200",
						badge: "bg-gray-100 text-gray-800 border border-gray-300",
						icon: "text-gray-600",
					};
			}
		};

		return (
			<section id="jobs" className="px-10 mt-14 px-4">
				{/* Header with Stats */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<h2
							className="text-3xl font-bold text-gray-900"
							{...getElementAttributes('jobs-heading', 0)}
						>
							{getText('jobs-heading', 'Jobs Dashboard')}
						</h2>
						<button
							{...getElementAttributes('post-job-button', 0)}
							type="button"
							className={`inline-flex items-center px-6 py-3 rounded-full bg-[#1fc12c] hover:bg-[#199225] text-white font-semibold shadow-md hover:shadow-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#199225] ${
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
							{getText('post-job-button-label', '+ Create posting')}
						</button>
					</div>
					
					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
						<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Total Jobs</p>
									<p className="text-3xl font-bold text-gray-700">{totalJobs}</p>
								</div>
								<div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
									<svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
									</svg>
								</div>
							</div>
						</div>
						
						<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Completed</p>
									<p className="text-3xl font-bold text-green-700">{completedJobs}</p>
								</div>
								<div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
									<svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
						</div>
						
						<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">In Progress</p>
									<p className="text-3xl font-bold text-blue-700">{inProgressJobs}</p>
								</div>
								<div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
									<svg className="w-6 h-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Jobs Cards Grid */}
				<div className="grid gap-6 grid-cols-1 md:grid-cols-2">
					{allJobs.map((job: any, i: number) => {
						const statusColors = getStatusColor(job.status);
						return (
							<div
								key={i}
								{...getElementAttributes('job-item', i)}
								className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100 group"
							>
								<div className="flex items-start justify-between mb-4">
									<h3 className="text-lg font-bold text-gray-900 flex-1 pr-4">
										{job.title}
									</h3>
									<span
										className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${statusColors.badge}`}
									>
										{job.status}
									</span>
								</div>
								
								<div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
									<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
									<span>Started {job.start}</span>
								</div>

								<div className={`rounded-lg p-4 mb-4 border ${statusColors.bg}`}>
									<div className="flex items-center gap-2 mb-2">
										<svg className={`w-5 h-5 ${statusColors.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<span className="text-sm font-medium text-gray-700">
											{job.timestr}
										</span>
									</div>
									<div className="text-xl font-bold text-gray-900">
										{job.time}
									</div>
								</div>

								<div className="flex items-start gap-2 pt-3 border-t border-gray-100">
									<svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span className="text-xs text-gray-500 leading-relaxed">
										{job.activity}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</section>
		);
	};

	const HiresSection = () => {
		const router = useSeedRouter();
		
		// Helper function to generate slug from name
		const generateSlug = (name: string): string => {
			return name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');
		};

		// Helper function to handle navigation to expert profile
		const handleViewProfile = (hire: any) => {
			const slug = hire.slug || generateSlug(hire.name);
			router.push(`/expert/${slug}`);
		};

		const totalHires = hiresState.data.length;
		const availableHires = hiresState.data.filter((h: any) => h.rehire).length;
		const avgRating = hiresState.data.length > 0
			? (hiresState.data.reduce((acc: number, h: any) => acc + parseFloat(h.rating || 0), 0) / hiresState.data.length).toFixed(1)
			: "0.0";

		return (
			<section id="hires" className="px-10 mt-14 px-4">
				{/* Header with Stats */}
				<div className="mb-8">
					<h2
						className="text-3xl font-bold text-gray-900 mb-6"
						{...getElementAttributes('hires-heading', 0)}
					>
						{getText('hires-heading', 'Hires Dashboard')}
					</h2>
					
					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
						<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Total Hires</p>
									<p className="text-3xl font-bold text-blue-700">{totalHires}</p>
								</div>
								<div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
									<svg className="w-6 h-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
								</div>
							</div>
						</div>
						
						<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Available</p>
									<p className="text-3xl font-bold text-green-700">{availableHires}</p>
								</div>
								<div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
									<svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
						</div>
						
						<div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 shadow-sm">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Avg. Rating</p>
									<p className="text-3xl font-bold text-yellow-700">{avgRating}</p>
								</div>
								<div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
									<svg className="w-6 h-6 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.234c.969 0 1.371 1.24.588 1.81l-3.424 2.49a1 1 0 00-.364 1.118l1.286 3.965c.3.921-.755 1.688-1.539 1.118l-3.424-2.49a1 1 0 00-1.176 0l-3.424 2.49c-.783.57-1.838-.197-1.539-1.118l1.286-3.965a1 1 0 00-.364-1.118L2.22 9.392c-.783-.57-.38-1.81.588-1.81h4.234a1 1 0 00.95-.69l1.286-3.965z" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Hire Cards Grid */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{hiresState.data.map((hire: any) => (
						<div
							key={hire.name}
							className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100 group"
						>
							<div className="flex items-start gap-4 mb-4">
								<div className="relative">
									<img
										src={hire.avatar}
										alt={hire.name}
										className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-md group-hover:border-blue-400 transition-colors"
									/>
									{hire.rehire && (
										<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-bold text-lg text-gray-900 mb-1">
										{hire.name}
									</div>
									<div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
										<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
										{hire.country}
									</div>
									<div className="text-sm font-semibold text-blue-600 mb-1">
										{hire.rate}
									</div>
									<div className="text-sm text-gray-600">
										{hire.role}
									</div>
								</div>
							</div>
							
							<div className="flex items-center gap-4 mb-4 pt-3 border-t border-gray-100">
								<span className="flex items-center gap-1 text-sm">
									<svg
										className="w-4 h-4 text-yellow-400"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.234c.969 0 1.371 1.24.588 1.81l-3.424 2.49a1 1 0 00-.364 1.118l1.286 3.965c.3.921-.755 1.688-1.539 1.118l-3.424-2.49a1 1 0 00-1.176 0l-3.424 2.49c-.783.57-1.838-.197-1.539-1.118l1.286-3.965a1 1 0 00-.364-1.118L2.22 9.392c-.783-.57-.38-1.81.588-1.81h4.234a1 1 0 00.95-.69l1.286-3.965z" />
									</svg>
									<span className="font-semibold text-gray-700">{hire.rating}</span>
								</span>
								<span className="text-sm text-gray-500">•</span>
								<span className="text-sm text-gray-600">{hire.jobs} jobs</span>
							</div>
							
							{hire.rehire ? (
								<button
									onClick={() => handleViewProfile(hire)}
									className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
								>
									Available for rehire
								</button>
							) : (
								<button
									disabled
									className="w-full mt-4 bg-gray-100 text-gray-500 border border-gray-300 font-medium py-2.5 px-4 rounded-lg cursor-not-allowed"
								>
									Not available for rehire
								</button>
							)}
						</div>
					))}
				</div>
			</section>
		);
	};

	const ExpertsSection = () => {
		const router = useSeedRouter();
		const [favorites, setFavorites] = useState<Set<string>>(new Set());
		
		// Load favorites from localStorage
		useEffect(() => {
			if (typeof window === "undefined") return;
			try {
				const saved = localStorage.getItem("autowork_expert_favorites");
				if (saved) {
					setFavorites(new Set(JSON.parse(saved)));
				}
			} catch (err) {
				console.error("Failed to load favorites:", err);
			}
		}, []);

		// Save favorites to localStorage
		const saveFavorites = (newFavorites: Set<string>) => {
			setFavorites(newFavorites);
			if (typeof window !== "undefined") {
				try {
					localStorage.setItem("autowork_expert_favorites", JSON.stringify(Array.from(newFavorites)));
				} catch (err) {
					console.error("Failed to save favorites:", err);
				}
			}
		};

		const toggleFavorite = (expertName: string, e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const newFavorites = new Set(favorites);
			if (newFavorites.has(expertName)) {
				newFavorites.delete(expertName);
				logEvent(EVENT_TYPES.HIRE_BTN_CLICKED, {
					action: "unfavorite_expert",
					expertName,
				});
			} else {
				newFavorites.add(expertName);
				logEvent(EVENT_TYPES.HIRE_BTN_CLICKED, {
					action: "favorite_expert",
					expertName,
				});
			}
			saveFavorites(newFavorites);
		};
		
		const totalExperts = expertsState.data.length;
		const avgRating = expertsState.data.length > 0
			? (expertsState.data.reduce((acc: number, e: any) => acc + parseFloat(e.rating || 0), 0) / expertsState.data.length).toFixed(1)
			: "0.0";

		const handleViewExpert = (expert: any) => {
			const slug = (expert as any).slug ?? expert.name
				.toLowerCase()
				.replace(/\s+/g, "-")
				.replace(/\./g, "");
			router.push(`/expert/${slug}`);
		};

		return (
			<section id="experts" className="px-10 mt-16 px-4">
				{/* Header with Stats */}
				<div className="mb-8">
					<h2
						className="text-3xl font-bold text-gray-900 mb-6"
						{...getElementAttributes('experts-heading', 0)}
					>
						{getText('experts-heading', "Expert one-on-one to review your goals")}
					</h2>
					
					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
						<div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Available Experts</p>
									<p className="text-3xl font-bold text-purple-700">{totalExperts}</p>
								</div>
								<div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
									<svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
								</div>
							</div>
						</div>
						
						<div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 shadow-sm">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Avg. Rating</p>
									<p className="text-3xl font-bold text-yellow-700">{avgRating}</p>
								</div>
								<div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
									<svg className="w-6 h-6 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.234c.969 0 1.371 1.24.588 1.81l-3.424 2.49a1 1 0 00-.364 1.118l1.286 3.965c.3.921-.755 1.688-1.539 1.118l-3.424-2.49a1 1 0 00-1.176 0l-3.424 2.49c-.783.57-1.838-.197-1.539-1.118l1.286-3.965a1 1 0 00-.364-1.118L2.22 9.392c-.783-.57-.38-1.81.588-1.81h4.234a1 1 0 00.95-.69l1.286-3.965z" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Expert Cards Grid */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{expertsState.data.map((expert: any, i: number) => {
						const isFavorite = favorites.has(expert.name);
						return (
							<div
								key={expert.name}
								className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100 group relative"
							>
								{/* Favorite Button */}
								<button
									type="button"
									onClick={(e) => toggleFavorite(expert.name, e)}
									className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
									title={isFavorite ? "Remove from favorites" : "Add to favorites"}
								>
									<svg
										className={`w-5 h-5 transition-colors ${
											isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"
										}`}
										fill={isFavorite ? "currentColor" : "none"}
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
										/>
									</svg>
								</button>

								<div className="flex items-start gap-4 mb-4 pr-8">
									<div className="relative flex-shrink-0">
										<img
											src={expert.avatar}
											alt={expert.name}
											className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-md group-hover:border-purple-400 transition-colors"
										/>
										<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-bold text-lg text-gray-900 mb-1">
											{expert.name}
										</div>
										<div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
											{expert.country}
										</div>
										<div className="text-sm font-semibold text-gray-800 mb-1">
											{expert.role}
										</div>
									</div>
								</div>

								<div className="flex items-center gap-3 mb-3">
									<span className="text-sm font-semibold text-blue-600">
										{expert.rate}
									</span>
									<span className="flex items-center gap-1 text-sm">
										<svg
											className="w-4 h-4 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.234c.969 0 1.371 1.24.588 1.81l-3.424 2.49a1 1 0 00-.364 1.118l1.286 3.965c.3.921-.755 1.688-1.539 1.118l-3.424-2.49a1 1 0 00-1.176 0l-3.424 2.49c-.783.57-1.838-.197-1.539-1.118l1.286-3.965a1 1 0 00-.364-1.118L2.22 9.392c-.783-.57-.38-1.81.588-1.81h4.234a1 1 0 00.95-.69l1.286-3.965z" />
										</svg>
										<span className="font-semibold text-gray-700">{expert.rating}</span>
									</span>
									<span className="text-sm text-gray-500">•</span>
									<span className="text-sm text-gray-600">{expert.jobs} reviews</span>
								</div>

								<div className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-3">
									{expert.desc}
								</div>

								<div className="flex items-center gap-2 text-blue-600 font-semibold mb-4 pb-4 border-b border-gray-100">
									<svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-blue-600">
										<path
											stroke="currentColor"
											strokeWidth="1.5"
											d="M7.75 8.5h8.5M7.75 11.75h5.5M17.25 6.25V5A2.25 2.25 0 0 0 15 2.75H5A2.25 2.25 0 0 0 2.75 5v8A2.25 2.25 0 0 0 5 15.25h1.25m1 4.5h10A2.25 2.25 0 0 0 19.5 17.5v-6.25m-6.75 7.75-2.25-2.25m0 0 .446-.447c.267-.268.661-.306.93-.05l.424.406c.27.257.662.241.919-.03a.656.656 0 0 0-.018-.908l-.36-.356c-.26-.257-.239-.668.033-.917l.349-.327a.873.873 0 0 1 1.17.003l1.222 1.125c.32.294.843.217 1.064-.167l.022-.037M19.5 13V5A2.25 2.25 0 0 0 17.25 2.75H7a2.25 2.25 0 0 0-2.25 2.25v8c0 .414.336.75.75.75h12.5a.75.75 0 0 0 .75-.75Z"
										/>
									</svg>
									<span className="text-base">{expert.consultation}</span>
								</div>

								<button
									onClick={() => handleViewExpert(expert)}
									{...getElementAttributes('book-consultation-button', i)}
									className="w-full mt-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
								>
									{getText('book-consultation-button-label', 'Consult an expert')}
								</button>
							</div>
						);
					})}
				</div>
			</section>
		);
	};

	// Create section map for dynamic ordering
	const sectionMap = {
		jobs: <JobsSection key="jobs" />,
		hires: <HiresSection key="hires" />,
		experts: <ExpertsSection key="experts" />,
	};

	// Render sections based on route: jobs/hires/experts show only their section; home shows all
	const renderSections = () => {
		let allowed = layout.mainSections;
		if (pathname?.includes('/jobs')) allowed = ['jobs'];
		else if (pathname?.includes('/hires')) allowed = ['hires'];
		else if (pathname?.includes('/experts')) allowed = ['experts'];

		return allowed
			.map((sectionKey) => sectionMap[sectionKey as keyof typeof sectionMap])
			.filter(Boolean);
	};

	return (
		<main className="px-10 mt-12 pb-16 text-[#253037]">
			{showInitialLoading && (
				<div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
					<div className="w-14 h-14 rounded-full border-4 border-[#08b4ce] border-t-transparent animate-spin mb-5" aria-label="Loading" />
					<div className="text-xl font-semibold text-[#253037] mb-2">Generating data with AI</div>
					<div className="text-sm text-gray-600">It may take some time. Please wait…</div>
				</div>
			)}
			{statusMessage && (
				<div className="mb-6 rounded-lg border border-[#08b4ce30] bg-[#e6f9fb] text-[#056b79] px-4 py-3 text-sm">
					{statusMessage}
				</div>
			)}
			{errorMessage && (
				<div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
					{errorMessage}
				</div>
			)}
			{renderSections()}
			<PostJobWizard 
				open={showPostJob} 
				onClose={() => setShowPostJob(false)}
				onJobCreated={(job) => {
					setUserJobs(prev => [job, ...prev]);
				}}
			/>
		</main>
	);
}
