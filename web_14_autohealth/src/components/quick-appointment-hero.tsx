"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { MEDICAL_SPECIALTIES, filterSpecialties } from "@/data/medical-specialties";

interface QuickAppointmentFormData {
  name: string;
  email: string;
  phone: string;
  specialty: string;
}

export function QuickAppointmentHero() {
  const dyn = useDynamicSystem();
  const [formData, setFormData] = useState<QuickAppointmentFormData>({
    name: "",
    email: "",
    phone: "",
    specialty: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredSpecialties, setFilteredSpecialties] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const specialtyInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Initialize with all specialties
  useEffect(() => {
    setFilteredSpecialties([...MEDICAL_SPECIALTIES].sort());
  }, []);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        specialtyInputRef.current &&
        !specialtyInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: keyof QuickAppointmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Filter specialties when typing in specialty field
    if (field === "specialty") {
      const filtered = filterSpecialties(value);
      setFilteredSpecialties(filtered);
      setShowSuggestions(value.length > 0 && filtered.length > 0);
    }
  };

  const handleSpecialtySelect = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialty: specialty
    }));
    setShowSuggestions(false);
  };

  const validateForm = (): boolean => {
    return formData.name.trim() !== "" && 
           formData.email.trim() !== "" && 
           formData.phone.trim() !== "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Log the quick appointment request
      logEvent(EVENT_TYPES.BOOK_APPOINTMENT, {
        source: "quick_appointment_hero",
        patientName: formData.name,
        patientEmail: formData.email,
        patientPhone: formData.phone,
        specialty: formData.specialty || "General",
        action: "redirect_to_filtered_appointments"
      });

      // Save form data to localStorage so it can be pre-filled in the booking modal
      if (typeof window !== 'undefined') {
        const quickFormData = {
          patientName: formData.name,
          patientEmail: formData.email,
          patientPhone: formData.phone,
        };
        localStorage.setItem('quick_appointment_form_data', JSON.stringify(quickFormData));
      }

      // Redirect immediately to appointments page with specialty filter if provided
      // User will select the appointment from the filtered list
      const redirectUrl = formData.specialty.trim()
        ? `/appointments?specialty=${encodeURIComponent(formData.specialty.trim())}`
        : "/appointments";
      
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Error redirecting to appointments:", error);
      // Still redirect even if logging fails
      const redirectUrl = formData.specialty.trim()
        ? `/appointments?specialty=${encodeURIComponent(formData.specialty.trim())}`
        : "/appointments";
      window.location.href = redirectUrl;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/hero/hospital.png')",
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Main text */}
            <div className="text-white space-y-4">
              {dyn.v1.addWrapDecoy("quick-hero-title", (
                <h2 
                  id={dyn.v3.getVariant("quick-hero-title", ID_VARIANTS_MAP, "quick-hero-title")}
                  className={cn("text-4xl md:text-5xl font-bold", dyn.v3.getVariant("hero-title", CLASS_VARIANTS_MAP, ""))}
                >
                  {dyn.v3.getVariant("quick_appointment_title", TEXT_VARIANTS_MAP, "Book your medical appointment now")}
                </h2>
              ))}
              {dyn.v1.addWrapDecoy("quick-hero-desc", (
                <p 
                  id={dyn.v3.getVariant("quick-hero-desc", ID_VARIANTS_MAP, "quick-hero-desc")}
                  className={cn("text-lg md:text-xl text-white/90", dyn.v3.getVariant("hero-desc", CLASS_VARIANTS_MAP, ""))}
                >
                  {dyn.v3.getVariant("quick_appointment_desc", TEXT_VARIANTS_MAP, "Complete the form and we'll contact you to confirm your appointment with our specialists")}
                </p>
              ))}
            </div>

            {/* Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor={dyn.v3.getVariant("quick-name-input", ID_VARIANTS_MAP, "quick-name")}
                    className="text-gray-700"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id={dyn.v3.getVariant("quick-name-input", ID_VARIANTS_MAP, "quick-name")}
                    className={cn("bg-white", dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor={dyn.v3.getVariant("quick-email-input", ID_VARIANTS_MAP, "quick-email")}
                    className="text-gray-700"
                  >
                    Email *
                  </Label>
                  <Input
                    id={dyn.v3.getVariant("quick-email-input", ID_VARIANTS_MAP, "quick-email")}
                    className={cn("bg-white", dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor={dyn.v3.getVariant("quick-phone-input", ID_VARIANTS_MAP, "quick-phone")}
                    className="text-gray-700"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id={dyn.v3.getVariant("quick-phone-input", ID_VARIANTS_MAP, "quick-phone")}
                    className={cn("bg-white", dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label 
                    htmlFor={dyn.v3.getVariant("quick-specialty-input", ID_VARIANTS_MAP, "quick-specialty")}
                    className="text-gray-700"
                  >
                    Specialty (optional)
                  </Label>
                  <div className="relative">
                    <Input
                      ref={specialtyInputRef}
                      id={dyn.v3.getVariant("quick-specialty-input", ID_VARIANTS_MAP, "quick-specialty")}
                      className={cn("bg-white", dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                      value={formData.specialty}
                      onChange={(e) => handleInputChange("specialty", e.target.value)}
                      onFocus={() => {
                        if (formData.specialty.length > 0 && filteredSpecialties.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="e.g., Cardiology, Dermatology..."
                    />
                    {showSuggestions && filteredSpecialties.length > 0 && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                      >
                        {filteredSpecialties.map((specialty, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none transition-colors"
                            onClick={() => handleSpecialtySelect(specialty)}
                          >
                            {specialty}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {dyn.v1.addWrapDecoy("quick-submit-button", (
                  <Button
                    id={dyn.v3.getVariant("quick-submit-button", ID_VARIANTS_MAP, "quick-submit-button")}
                    type="submit"
                    className={cn("w-full bg-emerald-600 hover:bg-emerald-700 text-white", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
                    size="lg"
                    disabled={isSubmitting || !validateForm()}
                  >
                    {isSubmitting 
                      ? dyn.v3.getVariant("sending", TEXT_VARIANTS_MAP, "Submitting...") 
                      : dyn.v3.getVariant("request_appointment", TEXT_VARIANTS_MAP, "Request Appointment")}
                  </Button>
                ))}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
