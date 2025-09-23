"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logEvent, EVENT_TYPES } from "@/library/events";
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
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        reasonForVisit: formData.reasonForVisit,
        hasInsurance: !!formData.insuranceProvider,
        action: "confirm_booking"
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log successful booking
      logEvent(EVENT_TYPES.APPOINTMENT_BOOKED_SUCCESSFULLY, {
        appointmentId: appointment.id,
        doctorName: appointment.doctorName,
        patientName: formData.patientName,
        bookingTimestamp: new Date().toISOString()
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
    logEvent(EVENT_TYPES.BOOK_APPOINTMENT, {
      appointmentId: appointment?.id,
      doctorName: appointment?.doctorName,
      action: "cancel_booking_modal"
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
                <Label htmlFor="patientName">Full Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange("patientName", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientEmail">Email Address *</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => handleInputChange("patientEmail", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Phone Number *</Label>
                <Input
                  id="patientPhone"
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => handleInputChange("patientPhone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reasonForVisit">Reason for Visit *</Label>
                <Input
                  id="reasonForVisit"
                  value={formData.reasonForVisit}
                  onChange={(e) => handleInputChange("reasonForVisit", e.target.value)}
                  placeholder="Brief description of your concern"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Insurance Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                  placeholder="e.g., Blue Cross Blue Shield"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">Policy Number</Label>
                <Input
                  id="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={(e) => handleInputChange("insuranceNumber", e.target.value)}
                  placeholder="Enter policy number"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Notes (Optional)</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information you'd like to share with the doctor..."
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAppointment} 
            disabled={isSubmitting || !validateForm()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Booking..." : "Confirm Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
