"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { getMedicalRecords, subscribeMedicalRecords, whenReady } from "@/dynamic/v2";
import type { MedicalRecord } from "@/data/types";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { Pagination } from "@/components/ui/pagination";

const RECORDS_PAGE_SIZE = 9;
const CATEGORIES = ["all", "diagnostic", "preventive", "treatment", "monitoring"] as const;

export default function MedicalRecordsPage() {
  const dyn = useDynamicSystem();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [recordsList, setRecordsList] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Search input state (what user types)
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [searchDoctor, setSearchDoctor] = useState<string>("");
  // Applied search state (used for filtering; set when user clicks Search)
  const [appliedSearchTitle, setAppliedSearchTitle] = useState<string>("");
  const [appliedSearchDoctor, setAppliedSearchDoctor] = useState<string>("");

  const handleViewRecord = (record: MedicalRecord) => {
    logEvent(EVENT_TYPES.VIEW_MEDICAL_ANALYSIS, { record });
    setSelectedRecord(record);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-green-100 text-green-800";
      case "abnormal": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lab_result": return "🧪";
      case "imaging": return "📷";
      case "vaccination": return "💉";
      case "visit_summary": return "📋";
      case "prescription_history": return "💊";
      case "allergy": return "⚠️";
      case "vital_signs": return "❤️";
      case "procedure": return "🏥";
      default: return "📄";
    }
  };

  const orderedCategories = useMemo(() => {
    const order = dyn.v1.changeOrderElements("medical-records-categories", CATEGORIES.length);
    return order.map((idx) => CATEGORIES[idx]);
  }, [dyn.v1]);
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const loadMedicalRecords = async () => {
      try {
        await whenReady();
        if (!mounted) return;

        // Get initial data
        const records = getMedicalRecords();
        if (mounted) {
          setRecordsList(records);
          setIsLoading(false);
        }

        // Subscribe to updates
        unsubscribe = subscribeMedicalRecords((records) => {
          if (mounted) {
            setRecordsList(records);
          }
        });
      } catch (error) {
        console.error("[MedicalRecordsPage] Failed to load medical records:", error);
        if (mounted) setIsLoading(false);
      }
    };

    loadMedicalRecords();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSearch = () => {
    setAppliedSearchTitle(searchTitle.trim());
    setAppliedSearchDoctor(searchDoctor.trim());
    setCurrentPage(1);
    logEvent(EVENT_TYPES.SEARCH_MEDICAL_ANALYSIS, {
      source: "medical_records_page",
      action: "search",
      title: searchTitle.trim() || undefined,
      doctor: searchDoctor.trim() || undefined,
    });
  };

  const filteredRecords = useMemo(() => {
    let filtered = recordsList;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((record) => record.category === selectedCategory);
    }
    if (appliedSearchTitle) {
      const term = appliedSearchTitle.toLowerCase();
      filtered = filtered.filter((record) => record.title.toLowerCase().includes(term));
    }
    if (appliedSearchDoctor) {
      const term = appliedSearchDoctor.toLowerCase();
      filtered = filtered.filter(
        (record) => (record.doctorName ?? "").toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [recordsList, selectedCategory, appliedSearchTitle, appliedSearchDoctor]);

  const orderedRecords = useMemo(() => {
    const order = dyn.v1.changeOrderElements("medical-records-list", filteredRecords.length);
    return order.map((idx) => filteredRecords[idx]);
  }, [dyn.v1, filteredRecords]);

  // Reset to page 1 when filter or applied search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, appliedSearchTitle, appliedSearchDoctor]);

  const totalRecords = orderedRecords.length;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * RECORDS_PAGE_SIZE;
    return orderedRecords.slice(start, start + RECORDS_PAGE_SIZE);
  }, [orderedRecords, currentPage]);

  if (isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <div className="text-muted-foreground">Loading medical analysis…</div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Medical Analysis</h1>

      {/* Category Filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {orderedCategories.map((category, i) => (
          dyn.v1.addWrapDecoy(`records-filter-${i}`, (
            <Button
              key={category}
              id={dyn.v3.getVariant(`category-filter-button-${category}`, ID_VARIANTS_MAP, `category-filter-button-${category}`)}
              className={cn(dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {dyn.v3.getVariant(`filter_${category}`, TEXT_VARIANTS_MAP, category.charAt(0).toUpperCase() + category.slice(1))}
            </Button>
          ), `records-filter-${i}`)
        ))}
      </div>

      {/* Search: Title & Doctor */}
      <div className="mt-6 rounded-lg border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search-record-title">Title</Label>
            <Input
              id="search-record-title"
              placeholder="Record title..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              className="h-10"
              data-testid="search-record-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-record-doctor">Doctor</Label>
            <Input
              id="search-record-doctor"
              placeholder="Doctor name..."
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              className="h-10"
              data-testid="search-record-doctor"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleSearch}
              className="h-10 bg-emerald-600 hover:bg-emerald-700"
              data-testid="medical-records-search-button"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedCategory !== "all" || appliedSearchTitle || appliedSearchDoctor) && (
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              data-testid="filter-medical-records-clear"
              onClick={() => {
                setSearchTitle("");
                setSearchDoctor("");
                setAppliedSearchTitle("");
                setAppliedSearchDoctor("");
                setSelectedCategory("all");
                setCurrentPage(1);
              }}
              className="text-sm"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      <Pagination
        totalItems={totalRecords}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={RECORDS_PAGE_SIZE}
        data-testid="records-pagination"
      />
      {/* Medical Analysis Grid */}
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedRecords.map((record, i) => (
          dyn.v1.addWrapDecoy(`record-card-${i}`, (
            <Card key={record.id} className={cn("hover:shadow-md transition-shadow", dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, ""))}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(record.type)}</span>
                    <CardTitle className="text-base">{record.title}</CardTitle>
                  </div>
                  <Badge className={cn(getStatusColor(record.status), dyn.v3.getVariant("badge", CLASS_VARIANTS_MAP, ""))}>
                    {record.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {record.date} • {record.doctorName}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {record.description}
                </p>
                {dyn.v1.addWrapDecoy(`view-record-button-${i}`, (
                  <Button
                    id={dyn.v3.getVariant("view-record-button", ID_VARIANTS_MAP, `view-record-button-${i}`)}
                    className={cn("w-full", dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
                    size="sm"
                    onClick={() => handleViewRecord(record)}
                    data-testid="view-record-btn"
                  >
                    {dyn.v3.getVariant("view_record", TEXT_VARIANTS_MAP, "View Analysis")}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ), `record-card-${i}`)
        ))}
      </div>
      <Pagination
        totalItems={totalRecords}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={RECORDS_PAGE_SIZE}
        className="mt-6"
        data-testid="records-pagination-bottom"
      />

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(selectedRecord.type)}</span>
                <h2 className="text-xl font-semibold">{selectedRecord.title}</h2>
              </div>
              {dyn.v1.addWrapDecoy("close-modal-button", (
                <Button
                  id={dyn.v3.getVariant("close-modal-button", ID_VARIANTS_MAP, "close-modal-button")}
                  className={cn(dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
                  variant="outline"
                  onClick={() => setSelectedRecord(null)}
                >
                  {dyn.v3.getVariant("close", TEXT_VARIANTS_MAP, "Close")}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {(() => {
                const infoBlocks = [
                  { key: 'meta' },
                  { key: 'desc' },
                  { key: 'values' },
                ];
                const order = dyn.v1.changeOrderElements("record-modal-blocks", infoBlocks.length);
                const orderedBlocks = order.map((idx) => infoBlocks[idx]);
                return orderedBlocks.map((b, bi) =>
                  dyn.v1.addWrapDecoy(`record-modal-block-${bi}`, (
                    <div key={b.key}>
                      {b.key === 'meta' && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="font-medium">Date:</span> {selectedRecord.date}</div>
                          <div><span className="font-medium">Doctor:</span> {selectedRecord.doctorName}</div>
                          <div><span className="font-medium">Facility:</span> {selectedRecord.facility}</div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <Badge className={cn("ml-2", getStatusColor(selectedRecord.status), dyn.v3.getVariant("badge", CLASS_VARIANTS_MAP, ""))}>{selectedRecord.status}</Badge>
                          </div>
                        </div>
                      )}
                      {b.key === 'desc' && (
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="mt-1 text-muted-foreground">{selectedRecord.description}</p>
                        </div>
                      )}
                      {b.key === 'values' && selectedRecord.values && (
                        <div>
                          <span className="font-medium">Results/Values:</span>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(selectedRecord.values).map(([key, value]) => (
                              <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                                <span className="font-medium">{key}:</span>
                                <span>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ), `record-modal-block-wrap-${bi}`)
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
