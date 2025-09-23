"use client";

import { useState } from "react";
import { prescriptions, type Prescription } from "@/data/prescriptions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logEvent, EVENT_TYPES } from "@/library/events";

export default function PrescriptionsPage() {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const handleViewPrescription = (prescription: Prescription) => {
    logEvent(EVENT_TYPES.VIEW_PRESCRIPTION, {
      prescriptionId: prescription.id,
      medicineName: prescription.medicineName,
      dosage: prescription.dosage,
      doctorName: prescription.doctorName,
      startDate: prescription.startDate,
      status: prescription.status,
      category: prescription.category
    });
    setSelectedPrescription(prescription);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "discontinued": return "bg-gray-100 text-gray-800";
      case "refill_needed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cardiovascular": return "❤️";
      case "antibiotic": return "🦠";
      case "pain_management": return "💊";
      case "diabetes": return "🩸";
      case "blood_pressure": return "🫀";
      case "cholesterol": return "🧪";
      case "thyroid": return "🦋";
      case "vitamin": return "💊";
      default: return "💊";
    }
  };

  const statuses = ["all", "active", "completed", "discontinued", "refill_needed"];
  const filteredPrescriptions = selectedStatus === "all" 
    ? prescriptions 
    : prescriptions.filter(p => p.status === selectedStatus);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Prescriptions</h1>

      {/* Status Filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedStatus(status);
              logEvent(EVENT_TYPES.FILTER_BY_SPECIALTY, { status });
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrescriptions.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{getCategoryIcon(p.category)}</span>
                    <div>
                      <div className="font-medium">{p.medicineName}</div>
                      {p.genericName && (
                        <div className="text-sm text-muted-foreground">{p.genericName}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{p.dosage}</TableCell>
                <TableCell>{p.doctorName}</TableCell>
                <TableCell>{p.startDate}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(p.status)}>
                    {p.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    onClick={() => handleViewPrescription(p)}
                    size="sm"
                  >
                    View Prescription
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCategoryIcon(selectedPrescription.category)}</span>
                <div>
                  <h2 className="text-2xl font-semibold">{selectedPrescription.medicineName}</h2>
                  {selectedPrescription.genericName && (
                    <p className="text-muted-foreground">Generic: {selectedPrescription.genericName}</p>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedPrescription(null)}>
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Prescription Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Dosage:</span>
                    <span>{selectedPrescription.dosage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge className={getStatusColor(selectedPrescription.status)}>
                      {selectedPrescription.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Start Date:</span>
                    <span>{selectedPrescription.startDate}</span>
                  </div>
                  {selectedPrescription.endDate && (
                    <div className="flex justify-between">
                      <span className="font-medium">End Date:</span>
                      <span>{selectedPrescription.endDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Prescribing Doctor:</span>
                    <span>{selectedPrescription.doctorName}</span>
                  </div>
                  {selectedPrescription.pharmacy && (
                    <div className="flex justify-between">
                      <span className="font-medium">Pharmacy:</span>
                      <span>{selectedPrescription.pharmacy}</span>
                    </div>
                  )}
                  {selectedPrescription.prescriptionNumber && (
                    <div className="flex justify-between">
                      <span className="font-medium">Prescription #:</span>
                      <span>{selectedPrescription.prescriptionNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost and Refills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cost & Refills</h3>
                <div className="space-y-2 text-sm">
                  {selectedPrescription.cost && (
                    <div className="flex justify-between">
                      <span className="font-medium">Cost:</span>
                      <span>${selectedPrescription.cost}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Insurance Coverage:</span>
                    <Badge className={selectedPrescription.insuranceCoverage ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {selectedPrescription.insuranceCoverage ? "Covered" : "Not Covered"}
                    </Badge>
                  </div>
                  {selectedPrescription.refillsRemaining !== undefined && (
                    <div className="flex justify-between">
                      <span className="font-medium">Refills Remaining:</span>
                      <span>{selectedPrescription.refillsRemaining}</span>
                    </div>
                  )}
                  {selectedPrescription.totalRefills && (
                    <div className="flex justify-between">
                      <span className="font-medium">Total Refills:</span>
                      <span>{selectedPrescription.totalRefills}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Instructions</h3>
              <p className="text-sm bg-gray-50 p-3 rounded">{selectedPrescription.instructions}</p>
            </div>

            {/* Side Effects */}
            {selectedPrescription.sideEffects && selectedPrescription.sideEffects.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Possible Side Effects</h3>
                <ul className="text-sm space-y-1">
                  {selectedPrescription.sideEffects.map((effect, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-red-500">•</span>
                      <span>{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {selectedPrescription.warnings && selectedPrescription.warnings.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Important Warnings</h3>
                <ul className="text-sm space-y-1">
                  {selectedPrescription.warnings.map((warning, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-yellow-500">⚠</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6">
              <Button 
                onClick={() => {
                  logEvent(EVENT_TYPES.REFILL_PRESCRIPTION, {
                    prescriptionId: selectedPrescription.id,
                    medicineName: selectedPrescription.medicineName
                  });
                }}
                disabled={selectedPrescription.refillsRemaining === 0}
                className="w-full"
              >
                Request Refill
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
