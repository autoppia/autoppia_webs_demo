"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logEvent, EVENT_TYPES } from "@/library/events";
import type { Appointment } from "@/data/appointments";
import { useSeedLayout } from "@/library/useSeedLayout";

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
  const { getText, getElementAttributes } = useSeedLayout();
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
          <DialogTitle {...getElementAttributes('apts-modal-title', 0)}>{getText('apts-modal-title', 'Book Appointment')}</DialogTitle>
          <DialogDescription {...getElementAttributes('apts-modal-desc', 0)}>
            {getText('apts-modal-desc-prefix', 'Book an appointment with')} {appointment.doctorName} ({appointment.specialty}) 
            on {appointment.date} at {appointment.time}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium" {...getElementAttributes('apts-modal-section', 0)}>{getText('apts-modal-patient-info', 'Patient Information')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">{getText('apts-modal-name-label', 'Full Name *')}</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange("patientName", e.target.value)}
                  placeholder={getText('apts-modal-name-ph', 'Enter your full name')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientEmail">{getText('apts-modal-email-label', 'Email Address *')}</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => handleInputChange("patientEmail", e.target.value)}
                  placeholder={getText('apts-modal-email-ph', 'Enter your email')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">{getText('apts-modal-phone-label', 'Phone Number *')}</Label>
                <Input
                  id="patientPhone"
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => handleInputChange("patientPhone", e.target.value)}
                  placeholder={getText('apts-modal-phone-ph', 'Enter your phone number')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reasonForVisit">{getText('apts-modal-reason-label', 'Reason for Visit *')}</Label>
                <Input
                  id="reasonForVisit"
                  value={formData.reasonForVisit}
                  onChange={(e) => handleInputChange("reasonForVisit", e.target.value)}
                  placeholder={getText('apts-modal-reason-ph', 'Brief description of your concern')}
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium" {...getElementAttributes('apts-modal-section', 1)}>{getText('apts-modal-insurance', 'Insurance Information (Optional)')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">{getText('apts-modal-ins-provider', 'Insurance Provider')}</Label>
                <Input
                  id="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                  placeholder={getText('apts-modal-ins-provider-ph', 'e.g., Blue Cross Blue Shield')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">{getText('apts-modal-ins-number', 'Policy Number')}</Label>
                <Input
                  id="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={(e) => handleInputChange("insuranceNumber", e.target.value)}
                  placeholder={getText('apts-modal-ins-number-ph', 'Enter policy number')}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium" {...getElementAttributes('apts-modal-section', 2)}>{getText('apts-modal-emergency', 'Emergency Contact (Optional)')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">{getText('apts-modal-em-name', 'Emergency Contact Name')}</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder={getText('apts-modal-em-name-ph', 'Emergency contact name')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">{getText('apts-modal-em-phone', 'Emergency Contact Phone')}</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder={getText('apts-modal-em-phone-ph', 'Emergency contact phone')}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium" {...getElementAttributes('apts-modal-section', 3)}>{getText('apts-modal-notes', 'Additional Notes (Optional)')}</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">{getText('apts-modal-notes-label', 'Notes')}</Label>
              <textarea
                id="notes"
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder={getText('apts-modal-notes-ph', "Any additional information you'd like to share with the doctor...")}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting} {...getElementAttributes('apts-modal-cancel', 0)}>
            {getText('apts-modal-cancel', 'Cancel')}
          </Button>
          <Button 
            onClick={handleConfirmAppointment} 
            disabled={isSubmitting || !validateForm()}
            className="bg-blue-600 hover:bg-blue-700"
            {...getElementAttributes('apts-modal-confirm', 0)}
          >
            {isSubmitting ? getText('apts-modal-booking', 'Booking...') : getText('apts-modal-confirm', 'Confirm Appointment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
