"use client";

import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { initializeAppointments } from "@/data/appointments-enhanced";
import { initializeDoctors } from "@/data/doctors-enhanced";
import type { Appointment, Doctor } from "@/data/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AppointmentBookingModal } from "@/components/appointment-booking-modal";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { isDataGenerationAvailable } from "@/utils/healthDataGenerator";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEDICAL_SPECIALTIES, filterSpecialties } from "@/data/medical-specialties";
import { Pagination, PAGINATION_PAGE_SIZE } from "@/components/ui/pagination";

function AppointmentsPageContent() {
  const dyn = useDynamicSystem();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentList, setAppointmentList] = useState<Appointment[]>([]);
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  
  // Filter input state (what user types/selects)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  // Applied filter state (used for filtering list; set when user clicks Search)
  const [appliedDoctorId, setAppliedDoctorId] = useState<string>("");
  const [appliedDoctorNameQuery, setAppliedDoctorNameQuery] = useState<string>("");
  const [appliedSpecialty, setAppliedSpecialty] = useState<string>("");
  const [appliedDateFilter, setAppliedDateFilter] = useState<string>("");

  // Autocomplete states for doctors
  const [doctorSearchText, setDoctorSearchText] = useState<string>("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [showDoctorSuggestions, setShowDoctorSuggestions] = useState(false);
  const doctorInputRef = useRef<HTMLInputElement>(null);
  const doctorSuggestionsRef = useRef<HTMLDivElement>(null);
  
  // Autocomplete states for specialties
  const [specialtySearchText, setSpecialtySearchText] = useState<string>("");
  const [filteredSpecialties, setFilteredSpecialties] = useState<string[]>([]);
  const [showSpecialtySuggestions, setShowSpecialtySuggestions] = useState(false);
  const specialtyInputRef = useRef<HTMLInputElement>(null);
  const specialtySuggestionsRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const useAiGeneration = isDataGenerationAvailable() && !isDbLoadModeEnabled();
  const isInitialMount = useRef(true);

  // Sync filters from URL so that landing with ?doctorId= (e.g. from Doctors page) preloads filter and applied state
  useEffect(() => {
    const doctorId = searchParams.get("doctorId") || "";
    const specialty = searchParams.get("specialty") || "";
    const date = searchParams.get("date") || "";
    setSelectedDoctorId(doctorId);
    setSelectedSpecialty(specialty);
    setDateFilter(date);
    setAppliedDoctorId(doctorId);
    setAppliedSpecialty(specialty);
    setAppliedDateFilter(date);
  }, [searchParams]);

  // Initialize search text from selected values after doctors are loaded
  useEffect(() => {
    if (doctorList.length > 0 && selectedDoctorId) {
      const doctor = doctorList.find(d => d.id === selectedDoctorId);
      if (doctor) {
        setDoctorSearchText(`${doctor.name} - ${doctor.specialty}`);
      }
    }
  }, [doctorList, selectedDoctorId]);

  useEffect(() => {
    if (selectedSpecialty) {
      setSpecialtySearchText(selectedSpecialty);
    }
  }, [selectedSpecialty]);

  // Update URL when applied filters change (skip first run so we don't overwrite URL params on mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (appliedDoctorId) params.set("doctorId", appliedDoctorId);
    if (appliedSpecialty) params.set("specialty", appliedSpecialty);
    if (appliedDateFilter) params.set("date", appliedDateFilter);
    const currentSource = searchParams.get("source");
    if (currentSource) params.set("source", currentSource);
    const newUrl = params.toString() ? `/appointments?${params.toString()}` : "/appointments";
    router.replace(newUrl, { scroll: false });
  }, [appliedDoctorId, appliedSpecialty, appliedDateFilter, router, searchParams]);

  const handleBookAppointment = (appointment: Appointment) => {
    const doctor = doctorList.find((d) => d.id === appointment.doctorId);

    logEvent(EVENT_TYPES.OPEN_APPOINTMENT_FORM, {
      appointment,
      ...(doctor && { doctor }),
    });

    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  useEffect(() => {
    let mounted = true;
    initializeAppointments()
      .then((data) => { if (mounted) setAppointmentList(data); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    initializeDoctors()
      .then((data) => { 
        if (mounted) {
          setDoctorList(data);
          setFilteredDoctors(data);
        }
      })
      .finally(() => { if (mounted) setIsLoadingDoctors(false); });
    return () => { mounted = false; };
  }, []);

  // Initialize filtered specialties
  useEffect(() => {
    setFilteredSpecialties([...MEDICAL_SPECIALTIES].sort());
  }, []);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Doctor suggestions
      if (
        doctorSuggestionsRef.current &&
        !doctorSuggestionsRef.current.contains(event.target as Node) &&
        doctorInputRef.current &&
        !doctorInputRef.current.contains(event.target as Node)
      ) {
        setShowDoctorSuggestions(false);
      }
      
      // Specialty suggestions
      if (
        specialtySuggestionsRef.current &&
        !specialtySuggestionsRef.current.contains(event.target as Node) &&
        specialtyInputRef.current &&
        !specialtyInputRef.current.contains(event.target as Node)
      ) {
        setShowSpecialtySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Column definitions (keys drive order of headers/cells)
  const columns = useMemo(() => [
    { key: 'doctor', header: 'Doctor' },
    { key: 'specialty', header: 'Speciality' },
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time' },
    { key: 'action', header: 'Action', align: 'right' as const },
  ], []);

  const orderedColumns = useMemo(() => {
    const order = dyn.v1.changeOrderElements("appointments-columns", columns.length);
    return order.map((idx) => columns[idx]);
  }, [dyn.v1, columns]);

  // Get available dates from filtered appointments (by applied doctor/specialty only)
  const availableDates = useMemo(() => {
    let filtered = appointmentList;
    if (appliedSpecialty) {
      filtered = filtered.filter(
        (a) => a.specialty.toLowerCase() === appliedSpecialty.toLowerCase()
      );
    }
    if (appliedDoctorId) {
      filtered = filtered.filter(
        (a) => a.doctorId.toLowerCase() === appliedDoctorId.toLowerCase()
      );
    }
    if (!appliedDoctorId && appliedDoctorNameQuery.trim()) {
      const query = appliedDoctorNameQuery.trim().toLowerCase();
      filtered = filtered.filter((a) => a.doctorName.toLowerCase().includes(query));
    }
    return Array.from(new Set(filtered.map((a) => a.date))).sort();
  }, [appointmentList, appliedSpecialty, appliedDoctorId, appliedDoctorNameQuery]);

  // Filter appointments by applied filters only (applied when user clicks Search)
  const filteredAppointments = useMemo(() => {
    let filtered = appointmentList;
    if (appliedSpecialty) {
      filtered = filtered.filter(
        (a) => a.specialty.toLowerCase() === appliedSpecialty.toLowerCase()
      );
    }
    if (appliedDoctorId) {
      filtered = filtered.filter(
        (a) => a.doctorId.toLowerCase() === appliedDoctorId.toLowerCase()
      );
    }
    if (!appliedDoctorId && appliedDoctorNameQuery.trim()) {
      const query = appliedDoctorNameQuery.trim().toLowerCase();
      filtered = filtered.filter((a) => a.doctorName.toLowerCase().includes(query));
    }
    if (appliedDateFilter) {
      filtered = filtered.filter((a) => a.date === appliedDateFilter);
    }
    return filtered;
  }, [appointmentList, appliedSpecialty, appliedDoctorId, appliedDoctorNameQuery, appliedDateFilter]);

  const orderedRows = useMemo(() => {
    const order = dyn.v1.changeOrderElements("appointments-rows", filteredAppointments.length);
    return order.map((idx) => filteredAppointments[idx]);
  }, [dyn.v1, filteredAppointments]);

  // Reset to page 1 when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedDoctorId, appliedDoctorNameQuery, appliedSpecialty, appliedDateFilter]);

  const totalAppointments = orderedRows.length;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGINATION_PAGE_SIZE;
    return orderedRows.slice(start, start + PAGINATION_PAGE_SIZE);
  }, [orderedRows, currentPage]);

  // Get doctor label for display when filtering by doctorId or name query (use applied)
  const filteredDoctorLabel = useMemo(() => {
    if (!appliedDoctorId) return null;
    const doctor = doctorList.find((d) => d.id.toLowerCase() === appliedDoctorId.toLowerCase());
    return doctor?.name || null;
  }, [doctorList, appliedDoctorId]);

  const filteredDoctorQueryLabel = useMemo(() => {
    if (appliedDoctorId) return null;
    const query = appliedDoctorNameQuery.trim();
    return query ? query : null;
  }, [appliedDoctorId, appliedDoctorNameQuery]);

  const handleSearch = () => {
    const doctorNameQuery = doctorSearchText.split(" - ")[0]?.trim();
    setAppliedDoctorId(selectedDoctorId);
    setAppliedDoctorNameQuery(selectedDoctorId ? "" : (doctorNameQuery || ""));
    setAppliedSpecialty(selectedSpecialty);
    setAppliedDateFilter(dateFilter);
    setCurrentPage(1);

    const doctor = selectedDoctorId
      ? doctorList.find((d) => d.id === selectedDoctorId)
      : null;
    logEvent(EVENT_TYPES.SEARCH_APPOINTMENT, {
      filterType: selectedDoctorId || (doctorNameQuery || "").trim()
        ? "doctor"
        : selectedSpecialty
          ? "specialty"
          : dateFilter
            ? "date"
            : "none",
      ...(doctor && { doctor }),
      ...(doctorNameQuery && { doctorName: doctorNameQuery }),
      ...(selectedSpecialty && { specialty: selectedSpecialty }),
      ...(dateFilter && { date: dateFilter }),
    });
  };

  // Handle doctor search input
  const handleDoctorSearchChange = (value: string) => {
    setDoctorSearchText(value);
    
    if (!value.trim()) {
      setFilteredDoctors(doctorList);
      setShowDoctorSuggestions(false);
      setSelectedDoctorId("");
      return;
    }
    
    const searchTerm = value.toLowerCase();
    const filtered = doctorList.filter(doctor =>
      doctor.name.toLowerCase().includes(searchTerm) ||
      doctor.specialty.toLowerCase().includes(searchTerm)
    );
    setFilteredDoctors(filtered);
    setShowDoctorSuggestions(filtered.length > 0);
    
    // If exact match found, select it
    const exactMatch = doctorList.find(doctor =>
      doctor.name.toLowerCase() === searchTerm ||
      `${doctor.name} - ${doctor.specialty}`.toLowerCase() === searchTerm.toLowerCase()
    );
    if (exactMatch) {
      setSelectedDoctorId(exactMatch.id);
    } else {
      setSelectedDoctorId("");
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctorId(doctor.id);
    setDoctorSearchText(`${doctor.name} - ${doctor.specialty}`);
    setShowDoctorSuggestions(false);
  };

  // Handle specialty search input
  const handleSpecialtySearchChange = (value: string) => {
    setSpecialtySearchText(value);
    
    if (!value.trim()) {
      setFilteredSpecialties([...MEDICAL_SPECIALTIES].sort());
      setShowSpecialtySuggestions(false);
      setSelectedSpecialty("");
      return;
    }
    
    const filtered = filterSpecialties(value);
    setFilteredSpecialties(filtered);
    setShowSpecialtySuggestions(filtered.length > 0);
    
    // If exact match found, select it
    const exactMatch = MEDICAL_SPECIALTIES.find(specialty =>
      specialty.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch) {
      setSelectedSpecialty(exactMatch);
    } else {
      setSelectedSpecialty("");
    }
  };

  const handleSpecialtySelect = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setSpecialtySearchText(specialty);
    setShowSpecialtySuggestions(false);
  };


  if (useAiGeneration && isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Data is being generated by AI, this may take some time…</span>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <div className="text-muted-foreground">Loading appointments…</div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with Filters */}
      <section 
        className="relative min-h-[280px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/consulta.jpg')",
        }}
      >
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content */}
              <div className="relative z-10 container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
              {filteredDoctorLabel
                ? `Available Appointments - ${filteredDoctorLabel}`
                : filteredDoctorQueryLabel
                  ? `Available Appointments - ${filteredDoctorQueryLabel}`
                : appliedSpecialty
                  ? `Available Appointments - ${appliedSpecialty}`
                  : "Available Appointments"}
            </h1>

            {/* Filters */}
            <div className="p-4 md:p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
                {/* Doctor Filter */}
                <div className="space-y-2 relative">
                  <Label htmlFor="doctor-filter" className="text-sm font-medium text-white">
                    Filter by Doctor
                  </Label>
                  <div className="relative">
                    <Input
                      ref={doctorInputRef}
                      id="doctor-filter"
                      value={doctorSearchText}
                      onChange={(e) => handleDoctorSearchChange(e.target.value)}
                      onFocus={() => {
                        if (doctorSearchText.length > 0 && filteredDoctors.length > 0) {
                          setShowDoctorSuggestions(true);
                        }
                      }}
                      placeholder="Search doctor by name or speciality..."
                      className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                      data-testid="filter-appointment-doctor"
                    />
                    {showDoctorSuggestions && filteredDoctors.length > 0 && (
                      <div
                        ref={doctorSuggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                      >
                        {filteredDoctors.map((doctor) => (
                          <button
                            key={doctor.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none transition-colors"
                            onClick={() => handleDoctorSelect(doctor)}
                          >
                            <div className="font-medium">{doctor.name}</div>
                            <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Speciality Filter */}
                <div className="space-y-2 relative">
                  <Label htmlFor="specialty-filter" className="text-sm font-medium text-white">
                    Filter by Speciality
                  </Label>
                  <div className="relative">
                    <Input
                      ref={specialtyInputRef}
                      id="specialty-filter"
                      value={specialtySearchText}
                      onChange={(e) => handleSpecialtySearchChange(e.target.value)}
                      onFocus={() => {
                        if (specialtySearchText.length > 0 && filteredSpecialties.length > 0) {
                          setShowSpecialtySuggestions(true);
                        }
                      }}
                      placeholder="Search speciality..."
                      className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                      data-testid="filter-appointment-specialty"
                    />
                    {showSpecialtySuggestions && filteredSpecialties.length > 0 && (
                      <div
                        ref={specialtySuggestionsRef}
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

                {/* Date Filter */}
                <div className="space-y-2">
                  <Label htmlFor="date-filter" className="text-sm font-medium text-white">
                    Filter by Date
                  </Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                    className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                    data-testid="filter-appointment-date"
                  />
                </div>

                {/* Search button: applies filters and fires SEARCH_APPOINTMENT */}
                <Button
                  type="button"
                  onClick={handleSearch}
                  className={cn("bg-emerald-600 hover:bg-emerald-700 h-10", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
                  data-testid="appointments-search-button"
                >
                  {dyn.v3.getVariant("search", TEXT_VARIANTS_MAP, "Search")}
                </Button>
              </div>

              {/* Clear Filters Button */}
              {(appliedDoctorId || appliedSpecialty || appliedDateFilter) && (
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="filter-appointment-clear"
                    onClick={() => {
                      setSelectedDoctorId("");
                      setSelectedSpecialty("");
                      setDateFilter("");
                      setAppliedDoctorId("");
                      setAppliedDoctorNameQuery("");
                      setAppliedSpecialty("");
                      setAppliedDateFilter("");
                      setDoctorSearchText("");
                      setSpecialtySearchText("");
                      setCurrentPage(1);
                    }}
                    className="text-sm"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Results Count */}
              <div className="mt-4 text-sm text-white">
                {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointments Table */}
      <div className="container py-10">
      <Pagination
        totalItems={totalAppointments}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={PAGINATION_PAGE_SIZE}
        data-testid="appointments-pagination"
      />
      <div className="mt-4">
        {dyn.v1.addWrapDecoy("appointments-table", (
          <Table>
            <TableHeader>
              <TableRow>
                {orderedColumns.map((c, ci) => (
                  <TableHead key={c.key} className={c.align === 'right' ? 'text-right' : undefined}>
                    {c.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.map((a, ri) => (
                <TableRow key={a.id}>
                  {orderedColumns.map((c) => {
                    if (c.key === 'doctor') return <TableCell key={c.key}>{a.doctorName}</TableCell>;
                    if (c.key === 'specialty') return <TableCell key={c.key}>{a.specialty}</TableCell>;
                    if (c.key === 'date') return <TableCell key={c.key}>{a.date}</TableCell>;
                    if (c.key === 'time') return <TableCell key={c.key}>{a.time}</TableCell>;
                    if (c.key === 'action') return (
                      <TableCell key={c.key} className="text-right">
                        {dyn.v1.addWrapDecoy(`book-appointment-button-${ri}`, (
                          <Button 
                            id={dyn.v3.getVariant("book-appointment-button", ID_VARIANTS_MAP, `book-appointment-button-${ri}`)}
                            className={cn("bg-emerald-600 hover:bg-emerald-700", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
                            onClick={() => handleBookAppointment(a)}
                          >
                            {dyn.v3.getVariant("book_appointment", TEXT_VARIANTS_MAP, "Book Appointment")}
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
        ), "appointments-table-wrap")}
      </div>
      <Pagination
        totalItems={totalAppointments}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={PAGINATION_PAGE_SIZE}
        className="mt-6"
        data-testid="appointments-pagination-bottom"
      />

      <AppointmentBookingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        appointment={selectedAppointment}
        source={searchParams.get("source") || "appointments_table"} // Use source from query params or default
      />
      </div>
    </>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={
      <div className="container py-20 flex items-center justify-center">
        <div className="text-muted-foreground">Loading appointments…</div>
      </div>
    }>
      <AppointmentsPageContent />
    </Suspense>
  );
}
