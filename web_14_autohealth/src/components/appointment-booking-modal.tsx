"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/data/appointments";

interface AppointmentBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

interface BookingFormData {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  reasonForVisit: string;
  insuranceProvider: string;
  insuranceNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
}

export function AppointmentBookingModal({ open, onOpenChange, appointment }: AppointmentBookingModalProps) {
  const dyn = useDynamicSystem();
  const [formData, setFormData] = React.useState<BookingFormData>({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    reasonForVisit: "",
    insuranceProvider: "",
    insuranceNumber: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof BookingFormData)[] = [
      "patientName", 
      "patientEmail", 
      "patientPhone", 
      "reasonForVisit"
    ];
    
    return requiredFields.every(field => formData[field].trim() !== "");
  };

  const handleConfirmAppointment = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!appointment) return;

    setIsSubmitting(true);

    try {
      // Log the appointment booking event
      logEvent(EVENT_TYPES.BOOK_APPOINTMENT, {
        appointmentId: appointment.id,
        doctorName: appointment.doctorName,
        specialty: appointment.specialty,
        date: appointment.date,
        time: appointment.time,
        // Patient Information
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        reasonForVisit: formData.reasonForVisit,
        // Insurance Information
        insuranceProvider: formData.insuranceProvider,
        insuranceNumber: formData.insuranceNumber,
        hasInsurance: !!formData.insuranceProvider,
        // Emergency Contact
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        hasEmergencyContact: !!formData.emergencyContact,
        // Additional Information
        notes: formData.notes,
        hasNotes: !!formData.notes,
        // Form completion
        action: "confirm_booking",
        formCompletionTime: new Date().toISOString()
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log successful booking
      logEvent(EVENT_TYPES.APPOINTMENT_BOOKED_SUCCESSFULLY, {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        specialty: appointment.specialty,
        date: appointment.date,
        time: appointment.time,
        // Patient Information
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        reasonForVisit: formData.reasonForVisit,
        // Insurance Information
        insuranceProvider: formData.insuranceProvider,
        insuranceNumber: formData.insuranceNumber,
        hasInsurance: !!formData.insuranceProvider,
        // Emergency Contact
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        hasEmergencyContact: !!formData.emergencyContact,
        // Additional Information
        notes: formData.notes,
        hasNotes: !!formData.notes,
        // Success metadata
        bookingTimestamp: new Date().toISOString(),
        success: true
      });

      alert("Appointment booked successfully!");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        reasonForVisit: "",
        insuranceProvider: "",
        insuranceNumber: "",
        emergencyContact: "",
        emergencyPhone: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    logEvent(EVENT_TYPES.CANCEL_BOOK_APPOINTMENT, {
      appointmentId: appointment?.id,
      doctorName: appointment?.doctorName,
      specialty: appointment?.specialty,
      date: appointment?.date,
      time: appointment?.time
    });
    onOpenChange(false);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Book an appointment with {appointment.doctorName} ({appointment.specialty}) 
            on {appointment.date} at {appointment.time}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("booking-patient-name-input", ID_VARIANTS_MAP, "patientName")}>Full Name *</Label>
                <Input
                  id={dyn.v3.getVariant("booking-patient-name-input", ID_VARIANTS_MAP, "patientName")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  value={formData.patientName}
                  onChange={(e) => handleInputChange("patientName", e.target.value)}
                  placeholder={dyn.v3.getVariant("booking_patient_name_placeholder", TEXT_VARIANTS_MAP, "Enter your full name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("booking-patient-email-input", ID_VARIANTS_MAP, "patientEmail")}>Email Address *</Label>
                <Input
                  id={dyn.v3.getVariant("booking-patient-email-input", ID_VARIANTS_MAP, "patientEmail")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => handleInputChange("patientEmail", e.target.value)}
                  placeholder={dyn.v3.getVariant("booking_patient_email_placeholder", TEXT_VARIANTS_MAP, "Enter your email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("booking-patient-phone-input", ID_VARIANTS_MAP, "patientPhone")}>Phone Number *</Label>
                <Input
                  id={dyn.v3.getVariant("booking-patient-phone-input", ID_VARIANTS_MAP, "patientPhone")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => handleInputChange("patientPhone", e.target.value)}
                  placeholder={dyn.v3.getVariant("booking_patient_phone_placeholder", TEXT_VARIANTS_MAP, "Enter your phone number")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("booking-reason-input", ID_VARIANTS_MAP, "reasonForVisit")}>Reason for Visit *</Label>
                <Input
                  id={dyn.v3.getVariant("booking-reason-input", ID_VARIANTS_MAP, "reasonForVisit")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  value={formData.reasonForVisit}
                  onChange={(e) => handleInputChange("reasonForVisit", e.target.value)}
                  placeholder={dyn.v3.getVariant("booking_reason_placeholder", TEXT_VARIANTS_MAP, "Brief description of your concern")}
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Insurance Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("booking-insurance-provider-input", ID_VARIANTS_MAP, "insuranceProvider")}>Insurance Provider</Label>
                <Input
                  id={dyn.v3.getVariant("booking-insurance-provider-input", ID_VARIANTS_MAP, "insuranceProvider")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  value={formData.insuranceProvider}
                  onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                  placeholder={dyn.v3.getVariant("booking_insurance_provider_placeholder", TEXT_VARIANTS_MAP, "e.g., Blue Cross Blue Shield")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("booking-insurance-number-input", ID_VARIANTS_MAP, "insuranceNumber")}>Policy Number</Label>
                <Input
                  id={dyn.v3.getVariant("booking-insurance-number-input", ID_VARIANTS_MAP, "insuranceNumber")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  value={formData.insuranceNumber}
                  onChange={(e) => handleInputChange("insuranceNumber", e.target.value)}
                  placeholder={dyn.v3.getVariant("booking_insurance_number_placeholder", TEXT_VARIANTS_MAP, "Enter policy number")}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("booking-emergency-contact-input", ID_VARIANTS_MAP, "emergencyContact")}>Emergency Contact Name</Label>
                <Input
                  id={dyn.v3.getVariant("booking-emergency-contact-input", ID_VARIANTS_MAP, "emergencyContact")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder={dyn.v3.getVariant("booking_emergency_contact_placeholder", TEXT_VARIANTS_MAP, "Emergency contact name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={dyn.v3.getVariant("booking-emergency-phone-input", ID_VARIANTS_MAP, "emergencyPhone")}>Emergency Contact Phone</Label>
                <Input
                  id={dyn.v3.getVariant("booking-emergency-phone-input", ID_VARIANTS_MAP, "emergencyPhone")}
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder={dyn.v3.getVariant("booking_emergency_phone_placeholder", TEXT_VARIANTS_MAP, "Emergency contact phone")}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Notes (Optional)</h3>
            <div className="space-y-2">
              <Label htmlFor={dyn.v3.getVariant("booking-notes-input", ID_VARIANTS_MAP, "notes")}>Notes</Label>
              <textarea
                id={dyn.v3.getVariant("booking-notes-input", ID_VARIANTS_MAP, "notes")}
                className={cn("w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500", dyn.v3.getVariant("textarea", CLASS_VARIANTS_MAP, ""))}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder={dyn.v3.getVariant("booking_notes_placeholder", TEXT_VARIANTS_MAP, "Any additional information you'd like to share with the doctor...")}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          {dyn.v1.addWrapDecoy("cancel-booking-button", (
            <Button 
              id={dyn.v3.getVariant("cancel-booking-button", ID_VARIANTS_MAP, "cancel-booking-button")}
              className={cn(dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
              variant="outline" 
              onClick={handleCancel} 
              disabled={isSubmitting}
            >
              {dyn.v3.getVariant("cancel", TEXT_VARIANTS_MAP, "Cancel")}
            </Button>
          ))}
          {dyn.v1.addWrapDecoy("confirm-booking-button", (
            <Button 
              id={dyn.v3.getVariant("confirm-booking-button", ID_VARIANTS_MAP, "confirm-booking-button")}
              className={cn("bg-blue-600 hover:bg-blue-700", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
              onClick={handleConfirmAppointment} 
              disabled={isSubmitting || !validateForm()}
            >
              {isSubmitting ? dyn.v3.getVariant("booking", TEXT_VARIANTS_MAP, "Booking...") : dyn.v3.getVariant("confirm_appointment", TEXT_VARIANTS_MAP, "Confirm Appointment")}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
