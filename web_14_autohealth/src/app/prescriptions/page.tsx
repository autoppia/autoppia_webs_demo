"use client";

import { useEffect, useState, useMemo } from "react";
import { getPrescriptions, subscribePrescriptions, whenReady } from "@/dynamic/v2";
import type { Prescription } from "@/data/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { Pagination, PAGINATION_PAGE_SIZE } from "@/components/ui/pagination";

export default function PrescriptionsPage() {
  const dyn = useDynamicSystem();
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [prescriptionList, setPrescriptionList] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Search input state (what user types)
  const [searchMedicine, setSearchMedicine] = useState<string>("");
  const [searchDoctor, setSearchDoctor] = useState<string>("");
  // Applied search state (used for filtering; set when user clicks Search)
  const [appliedSearchMedicine, setAppliedSearchMedicine] = useState<string>("");
  const [appliedSearchDoctor, setAppliedSearchDoctor] = useState<string>("");

  const handleViewPrescription = (prescription: Prescription) => {
    logEvent(EVENT_TYPES.VIEW_PRESCRIPTION, { prescription });
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

  const statuses = useMemo(() => ["all", "active", "completed", "discontinued", "refill_needed"], []);
  const orderedStatuses = useMemo(() => {
    const order = dyn.v1.changeOrderElements("prescriptions-statuses", statuses.length);
    return order.map((idx) => statuses[idx]);
  }, [dyn.v1, statuses]);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const loadPrescriptions = async () => {
      try {
        await whenReady();
        if (!mounted) return;

        // Get initial data
        const prescriptions = getPrescriptions();
        if (mounted) {
          setPrescriptionList(prescriptions);
          setIsLoading(false);
        }

        // Subscribe to updates
        unsubscribe = subscribePrescriptions((prescriptions) => {
          if (mounted) {
            setPrescriptionList(prescriptions);
          }
        });
      } catch (error) {
        console.error("[PrescriptionsPage] Failed to load prescriptions:", error);
        if (mounted) setIsLoading(false);
      }
    };

    loadPrescriptions();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Normalize status for comparison (API/dataset may use "Refill Needed" or "refill_needed")
  const normalizeStatus = (s: string | undefined) =>
    (s ?? "").toLowerCase().trim().replace(/\s+/g, "_");

  const handleSearch = () => {
    setAppliedSearchMedicine(searchMedicine.trim());
    setAppliedSearchDoctor(searchDoctor.trim());
    setCurrentPage(1);
    logEvent(EVENT_TYPES.SEARCH_PRESCRIPTION, {
      medicine: searchMedicine.trim() || undefined,
      doctor: searchDoctor.trim() || undefined,
    });
  };

  const filteredPrescriptions = useMemo(() => {
    let filtered = prescriptionList;
    if (selectedStatus !== "all") {
      const want = normalizeStatus(selectedStatus);
      filtered = filtered.filter((p) => normalizeStatus(p.status) === want);
    }
    if (appliedSearchMedicine) {
      const term = appliedSearchMedicine.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.medicineName.toLowerCase().includes(term) ||
          (p.genericName?.toLowerCase().includes(term) ?? false)
      );
    }
    if (appliedSearchDoctor) {
      const term = appliedSearchDoctor.toLowerCase();
      filtered = filtered.filter((p) => p.doctorName.toLowerCase().includes(term));
    }
    return filtered;
  }, [prescriptionList, selectedStatus, appliedSearchMedicine, appliedSearchDoctor]);

  const orderedRows = useMemo(() => {
    const order = dyn.v1.changeOrderElements("prescriptions-rows", filteredPrescriptions.length);
    return order.map((idx) => filteredPrescriptions[idx]);
  }, [dyn.v1, filteredPrescriptions]);

  // Reset to page 1 when filter or applied search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, appliedSearchMedicine, appliedSearchDoctor]);

  const totalPrescriptions = orderedRows.length;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGINATION_PAGE_SIZE;
    return orderedRows.slice(start, start + PAGINATION_PAGE_SIZE);
  }, [orderedRows, currentPage]);

  const columns = useMemo(() => [
    { key: 'medicine', header: 'Medicine' },
    { key: 'dosage', header: 'Dosage' },
    { key: 'doctor', header: 'Doctor' },
    { key: 'start', header: 'Start Date' },
    { key: 'status', header: 'Status' },
    { key: 'action', header: 'Action', align: 'right' as const },
  ], []);

  const orderedColumns = useMemo(() => {
    const order = dyn.v1.changeOrderElements("prescriptions-columns", columns.length);
    return order.map((idx) => columns[idx]);
  }, [dyn.v1, columns]);

  if (isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <div className="text-muted-foreground">Loading prescriptions…</div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Prescriptions</h1>

      {/* Search: Medicine & Doctor */}
      <div className="mt-6 rounded-lg border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search-prescription-medicine">Medicine</Label>
            <Input
              id="search-prescription-medicine"
              placeholder="Medicine name..."
              value={searchMedicine}
              onChange={(e) => setSearchMedicine(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              className="h-10"
              data-testid="search-prescription-medicine"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-prescription-doctor">Doctor</Label>
            <Input
              id="search-prescription-doctor"
              placeholder="Doctor name..."
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              className="h-10"
              data-testid="search-prescription-doctor"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleSearch}
              className="h-10 bg-emerald-600 hover:bg-emerald-700"
              data-testid="prescriptions-search-button"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedStatus !== "all" || appliedSearchMedicine || appliedSearchDoctor) && (
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              data-testid="filter-prescriptions-clear"
              onClick={() => {
                setSearchMedicine("");
                setSearchDoctor("");
                setAppliedSearchMedicine("");
                setAppliedSearchDoctor("");
                setSelectedStatus("all");
                setCurrentPage(1);
              }}
              className="text-sm"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {orderedStatuses.map((status, i) => (
          dyn.v1.addWrapDecoy(`status-filter-${i}`, (
            <Button
              key={status}
              id={dyn.v3.getVariant(`status-filter-button-${status}`, ID_VARIANTS_MAP, `status-filter-button-${status}`)}
              className={cn(dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
              variant={selectedStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(status)}
            >
              {dyn.v3.getVariant(`filter_${status}`, TEXT_VARIANTS_MAP, status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '))}
            </Button>
          ), `status-filter-${i}`)
        ))}
      </div>

      <Pagination
        totalItems={totalPrescriptions}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={PAGINATION_PAGE_SIZE}
        data-testid="prescriptions-pagination"
      />
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              {orderedColumns.map((c) => (
                <TableHead key={c.key} className={c.align === 'right' ? 'text-right' : undefined}>{c.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.map((p, ri) => (
              <TableRow key={p.id}>
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
                      <Badge className={cn(getStatusColor(p.status), dyn.v3.getVariant("badge", CLASS_VARIANTS_MAP, ""))}>
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  );
                  if (c.key === 'action') return (
                    <TableCell key={c.key} className="text-right">
                      {dyn.v1.addWrapDecoy(`view-prescription-button-${ri}`, (
                        <Button
                          id={dyn.v3.getVariant("view-prescription-button", ID_VARIANTS_MAP, `view-prescription-button-${ri}`)}
                          className={cn(dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
                          onClick={() => handleViewPrescription(p)}
                          size="sm"
                          data-testid="view-prescription-btn"
                        >
                          {dyn.v3.getVariant("view_prescription", TEXT_VARIANTS_MAP, "View Prescription")}
                        </Button>
                      ))}
                    </TableCell>
                  );
                  return null;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination
        totalItems={totalPrescriptions}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={PAGINATION_PAGE_SIZE}
        className="mt-6"
        data-testid="prescriptions-pagination-bottom"
      />

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedPrescription(null)}
          role="presentation"
          aria-label="Close modal"
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
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
              {dyn.v1.addWrapDecoy("close-modal-button", (
                <Button
                  id={dyn.v3.getVariant("close-modal-button", ID_VARIANTS_MAP, "close-modal-button")}
                  className={cn(dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
                  variant="outline"
                  onClick={() => setSelectedPrescription(null)}
                >
                  {dyn.v3.getVariant("close", TEXT_VARIANTS_MAP, "Close")}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                const sections = [
                  { key: 'details' },
                  { key: 'cost' },
                ];
                const order = dyn.v1.changeOrderElements("prescription-modal-sections", sections.length);
                return order.map((idx) => sections[idx]);
              })().map((s, si) =>
                dyn.v1.addWrapDecoy(`prescription-modal-section-${si}`, (
                  <div key={s.key} className="space-y-4">
                    {s.key === 'details' && (
                      <>
                        <h3 className="text-lg font-semibold">Prescription Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="font-medium">Dosage:</span><span>{selectedPrescription.dosage}</span></div>
                          <div className="flex justify-between"><span className="font-medium">Status:</span><Badge className={getStatusColor(selectedPrescription.status)}>{selectedPrescription.status.replace('_', ' ')}</Badge></div>
                          <div className="flex justify-between"><span className="font-medium">Start Date:</span><span>{selectedPrescription.startDate}</span></div>
                          {selectedPrescription.endDate && (<div className="flex justify-between"><span className="font-medium">End Date:</span><span>{selectedPrescription.endDate}</span></div>)}
                          <div className="flex justify-between"><span className="font-medium">Prescribing Doctor:</span><span>{selectedPrescription.doctorName}</span></div>
                          {selectedPrescription.pharmacy && (<div className="flex justify-between"><span className="font-medium">Pharmacy:</span><span>{selectedPrescription.pharmacy}</span></div>)}
                          {selectedPrescription.prescriptionNumber && (<div className="flex justify-between"><span className="font-medium">Prescription #:</span><span>{selectedPrescription.prescriptionNumber}</span></div>)}
                        </div>
                      </>
                    )}
                    {s.key === 'cost' && (
                      <>
                        <h3 className="text-lg font-semibold">Cost & Refills</h3>
                        <div className="space-y-2 text-sm">
                          {selectedPrescription.cost && (<div className="flex justify-between"><span className="font-medium">Cost:</span><span>${selectedPrescription.cost}</span></div>)}
                          <div className="flex justify-between"><span className="font-medium">Insurance Coverage:</span><Badge className={selectedPrescription.insuranceCoverage ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{selectedPrescription.insuranceCoverage ? "Covered" : "Not Covered"}</Badge></div>
                          {selectedPrescription.refillsRemaining !== undefined && (<div className="flex justify-between"><span className="font-medium">Refills Remaining:</span><span>{selectedPrescription.refillsRemaining}</span></div>)}
                          {selectedPrescription.totalRefills && (<div className="flex justify-between"><span className="font-medium">Total Refills:</span><span>{selectedPrescription.totalRefills}</span></div>)}
                        </div>
                      </>
                    )}
                  </div>
                ), `prescription-modal-section-wrap-${si}`)
              )}
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
                    prescription: selectedPrescription,
                  });
                }}
                disabled={selectedPrescription.refillsRemaining === 0}
                className="w-full"
                data-testid="request-refill-btn"
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
