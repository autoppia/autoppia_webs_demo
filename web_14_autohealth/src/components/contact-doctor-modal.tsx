"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import type { Doctor } from "@/data/types";

interface ContactDoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
}

interface ContactFormData {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  subject: string;
  message: string;
  urgency: "low" | "medium" | "high";
  preferredContactMethod: "email" | "phone" | "either";
  appointmentRequest: boolean;
}

export function ContactDoctorModal({ open, onOpenChange, doctor }: ContactDoctorModalProps) {
  const dyn = useDynamicSystem();
  const [formData, setFormData] = React.useState<ContactFormData>({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    subject: "",
    message: "",
    urgency: "medium",
    preferredContactMethod: "either",
    appointmentRequest: false,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleInputChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof ContactFormData)[] = [
      "patientName", 
      "patientEmail", 
      "subject", 
      "message"
    ];
    
    return requiredFields.every(field => {
      const value = formData[field];
      return typeof value === 'string' ? value.trim() !== "" : true;
    });
  };

  const handleSubmitContact = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!doctor) return;

    setIsSubmitting(true);

    try {
      // Log the contact doctor event
      logEvent(EVENT_TYPES.CONTACT_DOCTOR, {
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        action: "contact_doctor_submit",
        urgency: formData.urgency,
        preferredContactMethod: formData.preferredContactMethod,
        appointmentRequest: formData.appointmentRequest,
        subject: formData.subject
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log successful contact
      logEvent(EVENT_TYPES.DOCTOR_CONTACTED_SUCCESSFULLY, {
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        // Patient Information
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        // Message Information
        subject: formData.subject,
        message: formData.message,
        urgency: formData.urgency,
        preferredContactMethod: formData.preferredContactMethod,
        appointmentRequest: formData.appointmentRequest,
        // Success metadata
        contactTimestamp: new Date().toISOString(),
        success: true
      });

      alert("Your message has been sent successfully! The doctor will contact you within 24 hours.");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        subject: "",
        message: "",
        urgency: "medium",
        preferredContactMethod: "either",
        appointmentRequest: false,
      });
    } catch (error) {
      console.error("Error contacting doctor:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    logEvent(EVENT_TYPES.CANCEL_CONTACT_DOCTOR, {
      doctorId: doctor?.id,
      doctorName: doctor?.name,
      specialty: doctor?.specialty
    });
    onOpenChange(false);
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact {doctor.name}</DialogTitle>
          <DialogDescription>
            Send a message to {doctor.name} ({doctor.specialty}). 
            We'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("contact-patient-name-input", ID_VARIANTS_MAP, "patientName")}>Full Name *</Label>
                <Input
                  id={dyn.v3.getVariant("contact-patient-name-input", ID_VARIANTS_MAP, "patientName")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  value={formData.patientName}
                  onChange={(e) => handleInputChange("patientName", e.target.value)}
                  placeholder={dyn.v3.getVariant("contact_patient_name_placeholder", TEXT_VARIANTS_MAP, "Enter your full name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("contact-patient-email-input", ID_VARIANTS_MAP, "patientEmail")}>Email Address *</Label>
                <Input
                  id={dyn.v3.getVariant("contact-patient-email-input", ID_VARIANTS_MAP, "patientEmail")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => handleInputChange("patientEmail", e.target.value)}
                  placeholder={dyn.v3.getVariant("contact_patient_email_placeholder", TEXT_VARIANTS_MAP, "Enter your email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("contact-patient-phone-input", ID_VARIANTS_MAP, "patientPhone")}>Phone Number</Label>
                <Input
                  id={dyn.v3.getVariant("contact-patient-phone-input", ID_VARIANTS_MAP, "patientPhone")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => handleInputChange("patientPhone", e.target.value)}
                  placeholder={dyn.v3.getVariant("contact_patient_phone_placeholder", TEXT_VARIANTS_MAP, "Enter your phone number")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("contact-urgency-select", ID_VARIANTS_MAP, "urgency")}>Urgency Level</Label>
                <select
                  id={dyn.v3.getVariant("contact-urgency-select", ID_VARIANTS_MAP, "urgency")}
                  className={cn("w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", dyn.v3.getVariant("select", CLASS_VARIANTS_MAP, ""))}
                  value={formData.urgency}
                  onChange={(e) => handleInputChange("urgency", e.target.value as "low" | "medium" | "high")}
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Need response soon</option>
                  <option value="high">High - Urgent medical question</option>
                </select>
              </div>
            </div>
          </div>

          {/* Message Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Message Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("contact-subject-input", ID_VARIANTS_MAP, "subject")}>Subject *</Label>
                <Input
                  id={dyn.v3.getVariant("contact-subject-input", ID_VARIANTS_MAP, "subject")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder={dyn.v3.getVariant("contact_subject_placeholder", TEXT_VARIANTS_MAP, "Brief description of your inquiry")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("contact-message-input", ID_VARIANTS_MAP, "message")}>Message *</Label>
                <textarea
                  id={dyn.v3.getVariant("contact-message-input", ID_VARIANTS_MAP, "message")}
                  className={cn("w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500", dyn.v3.getVariant("textarea", CLASS_VARIANTS_MAP, ""))}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder={dyn.v3.getVariant("contact_message_placeholder", TEXT_VARIANTS_MAP, "Please provide details about your inquiry, symptoms, or questions...")}
                />
              </div>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("contact-preferred-method-select", ID_VARIANTS_MAP, "preferredContactMethod")}>Preferred Contact Method</Label>
                <select
                  id={dyn.v3.getVariant("contact-preferred-method-select", ID_VARIANTS_MAP, "preferredContactMethod")}
                  className={cn("w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", dyn.v3.getVariant("select", CLASS_VARIANTS_MAP, ""))}
                  value={formData.preferredContactMethod}
                  onChange={(e) => handleInputChange("preferredContactMethod", e.target.value as "email" | "phone" | "either")}
                >
                  <option value="either">Either email or phone</option>
                  <option value="email">Email only</option>
                  <option value="phone">Phone only</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={dyn.v3.getVariant("contact-appointment-request-checkbox", ID_VARIANTS_MAP, "appointmentRequest")}
                    checked={formData.appointmentRequest}
                    onChange={(e) => handleInputChange("appointmentRequest", e.target.checked)}
                    className={cn("rounded border-gray-300", dyn.v3.getVariant("checkbox", CLASS_VARIANTS_MAP, ""))}
                  />
                  <Label htmlFor={dyn.v3.getVariant("contact-appointment-request-checkbox", ID_VARIANTS_MAP, "appointmentRequest")}>I would like to request an appointment</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Doctor Information</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Name:</strong> {doctor.name}</p>
              <p><strong>Specialty:</strong> {doctor.specialty}</p>
              <p><strong>Office:</strong> {doctor.officeLocation}</p>
              <p><strong>Phone:</strong> {doctor.phone}</p>
              <p><strong>Email:</strong> {doctor.email}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          {dyn.v1.addWrapDecoy("cancel-contact-button", (
            <Button 
              className={cn(dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
              variant="outline" 
              onClick={handleCancel} 
              disabled={isSubmitting}
            >
              {dyn.v3.getVariant("cancel", TEXT_VARIANTS_MAP, "Cancel")}
            </Button>
          ))}
          {dyn.v1.addWrapDecoy("send-message-button", (
            <Button 
              id={dyn.v3.getVariant("contact-doctor-button", ID_VARIANTS_MAP, "send-message-button")}
              className={cn("bg-blue-600 hover:bg-blue-700", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
              onClick={handleSubmitContact} 
              disabled={isSubmitting || !validateForm()}
            >
              {isSubmitting ? dyn.v3.getVariant("booking", TEXT_VARIANTS_MAP, "Sending...") : dyn.v3.getVariant("contact_doctor", TEXT_VARIANTS_MAP, "Send Message")}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
