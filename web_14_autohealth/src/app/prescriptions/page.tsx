"use client";

import { useState } from "react";
import { prescriptions, type Prescription } from "@/data/prescriptions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeedLayout } from "@/library/useSeedLayout";
import { DynamicElement } from "@/components/DynamicElement";

export default function PrescriptionsPage() {
  const { reorderElements, getText, getElementAttributes } = useSeedLayout();
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
  const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
  const hasSeed = !!(sp?.get('seed-structure') || sp?.get('seed'));
  const orderedStatuses = hasSeed ? reorderElements(statuses) : statuses;
  const filteredPrescriptions = selectedStatus === "all" 
    ? prescriptions 
    : prescriptions.filter(p => p.status === selectedStatus);
  const orderedRows = hasSeed ? reorderElements(filteredPrescriptions) : filteredPrescriptions;

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold" {...getElementAttributes('prescriptions-heading', 0)}>{getText('prescriptions-heading', 'Prescriptions')}</h1>

      {/* Status Filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {orderedStatuses.map((status, i) => (
          <DynamicElement key={status} elementType="status-filter" as="span" index={i}>
          <Button
            variant={selectedStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedStatus(status);
              logEvent(EVENT_TYPES.FILTER_BY_SPECIALTY, { status });
            }}
            {...getElementAttributes('prescriptions-status-filter', i)}
          >
            {status === 'all' && getText('presc-filter-all', 'All')}
            {status === 'active' && getText('presc-filter-active', 'Active')}
            {status === 'completed' && getText('presc-filter-completed', 'Completed')}
            {status === 'discontinued' && getText('presc-filter-discontinued', 'Discontinued')}
            {status === 'refill_needed' && getText('presc-filter-refill', 'Refill needed')}
          </Button>
          </DynamicElement>
        ))}
      </div>

      <div className="mt-6">
        {(() => {
          const columns = [
            { key: 'medicine', header: getText('presc-col-medicine', 'Medicine') },
            { key: 'dosage', header: getText('presc-col-dosage', 'Dosage') },
            { key: 'doctor', header: getText('presc-col-doctor', 'Doctor') },
            { key: 'start', header: getText('presc-col-start', 'Start Date') },
            { key: 'status', header: getText('presc-col-status', 'Status') },
            { key: 'action', header: getText('presc-col-action', 'Action'), align: 'right' as const },
          ];
          const orderedColumns = hasSeed ? reorderElements(columns) : columns;
          return (
        <Table>
          <TableHeader>
            <TableRow>
              {orderedColumns.map((c, ci) => (
                <TableHead key={c.key} className={c.align === 'right' ? 'text-right' : undefined} {...getElementAttributes('presc-col', ci)}>{c.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedRows.map((p, ri) => (
              <DynamicElement key={p.id} elementType="prescription-row" as="tr" index={ri}>
                {orderedColumns.map((c) => {
                  if (c.key === 'medicine') return (
                    <TableCell key={c.key}>
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
                  );
                  if (c.key === 'dosage') return <TableCell key={c.key}>{p.dosage}</TableCell>;
                  if (c.key === 'doctor') return <TableCell key={c.key}>{p.doctorName}</TableCell>;
                  if (c.key === 'start') return <TableCell key={c.key}>{p.startDate}</TableCell>;
                  if (c.key === 'status') return (
                    <TableCell key={c.key}>
                      <Badge className={getStatusColor(p.status)}>
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  );
                  if (c.key === 'action') return (
                    <TableCell key={c.key} className="text-right">
                      <Button onClick={() => handleViewPrescription(p)} size="sm" {...getElementAttributes('view-prescription-button', ri)}>{getText('view-prescription-button', 'View Prescription')}</Button>
                    </TableCell>
                  );
                  return null;
                })}
              </DynamicElement>
            ))}
          </TableBody>
        </Table>
          );
        })()}
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
              <Button variant="outline" onClick={() => setSelectedPrescription(null)} {...getElementAttributes('presc-modal-close', 0)}>
                {getText('presc-modal-close', 'Close')}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                const sections = [
                  { key: 'details' },
                  { key: 'cost' },
                ];
                const orderedSections = hasSeed ? reorderElements(sections) : sections;
                return orderedSections.map((s, si) => (
                  <DynamicElement key={s.key} elementType="prescription-modal-section" as="div" index={si} className="space-y-4">
                    {s.key === 'details' && (
                      <>
                        <h3 className="text-lg font-semibold" {...getElementAttributes('presc-details-heading', 0)}>{getText('presc-details-heading', 'Prescription Details')}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="font-medium">{getText('presc-label-dosage', 'Dosage:')}</span><span>{selectedPrescription.dosage}</span></div>
                          <div className="flex justify-between"><span className="font-medium">{getText('presc-label-status', 'Status:')}</span><Badge className={getStatusColor(selectedPrescription.status)}>{selectedPrescription.status.replace('_', ' ')}</Badge></div>
                          <div className="flex justify-between"><span className="font-medium">{getText('presc-label-start', 'Start Date:')}</span><span>{selectedPrescription.startDate}</span></div>
                          {selectedPrescription.endDate && (<div className="flex justify-between"><span className="font-medium">{getText('presc-label-end', 'End Date:')}</span><span>{selectedPrescription.endDate}</span></div>)}
                          <div className="flex justify-between"><span className="font-medium">{getText('presc-label-doctor', 'Prescribing Doctor:')}</span><span>{selectedPrescription.doctorName}</span></div>
                          {selectedPrescription.pharmacy && (<div className="flex justify-between"><span className="font-medium">{getText('presc-label-pharmacy', 'Pharmacy:')}</span><span>{selectedPrescription.pharmacy}</span></div>)}
                          {selectedPrescription.prescriptionNumber && (<div className="flex justify-between"><span className="font-medium">{getText('presc-label-number', 'Prescription #:')}</span><span>{selectedPrescription.prescriptionNumber}</span></div>)}
                        </div>
                      </>
                    )}
                    {s.key === 'cost' && (
                      <>
                        <h3 className="text-lg font-semibold" {...getElementAttributes('presc-cost-heading', 0)}>{getText('presc-cost-heading', 'Cost & Refills')}</h3>
                        <div className="space-y-2 text-sm">
                          {selectedPrescription.cost && (<div className="flex justify-between"><span className="font-medium">{getText('presc-label-cost', 'Cost:')}</span><span>${selectedPrescription.cost}</span></div>)}
                          <div className="flex justify-between"><span className="font-medium">{getText('presc-label-insurance', 'Insurance Coverage:')}</span><Badge className={selectedPrescription.insuranceCoverage ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{selectedPrescription.insuranceCoverage ? getText('presc-badge-covered', 'Covered') : getText('presc-badge-not-covered', 'Not Covered')}</Badge></div>
                          {selectedPrescription.refillsRemaining !== undefined && (<div className="flex justify-between"><span className="font-medium">{getText('presc-label-refills-remaining', 'Refills Remaining:')}</span><span>{selectedPrescription.refillsRemaining}</span></div>)}
                          {selectedPrescription.totalRefills && (<div className="flex justify-between"><span className="font-medium">{getText('presc-label-total-refills', 'Total Refills:')}</span><span>{selectedPrescription.totalRefills}</span></div>)}
                        </div>
                      </>
                    )}
                  </DynamicElement>
                ));
              })()}
            </div>

            {/* Instructions */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2" {...getElementAttributes('presc-instructions-heading', 0)}>{getText('presc-instructions-heading', 'Instructions')}</h3>
              <p className="text-sm bg-gray-50 p-3 rounded">{selectedPrescription.instructions}</p>
            </div>

            {/* Side Effects */}
            {selectedPrescription.sideEffects && selectedPrescription.sideEffects.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2" {...getElementAttributes('presc-side-effects-heading', 0)}>{getText('presc-side-effects-heading', 'Possible Side Effects')}</h3>
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
                <h3 className="text-lg font-semibold mb-2" {...getElementAttributes('presc-warnings-heading', 0)}>{getText('presc-warnings-heading', 'Important Warnings')}</h3>
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
                {...getElementAttributes('presc-request-refill', 0)}
              >
                {getText('presc-request-refill', 'Request Refill')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
