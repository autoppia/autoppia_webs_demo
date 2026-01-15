"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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

export default function AppointmentsPage() {
  const dyn = useDynamicSystem();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentList, setAppointmentList] = useState<Appointment[]>([]);
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  
  // Filter states
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  
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
  
  const useAiGeneration = isDataGenerationAvailable() && !isDbLoadModeEnabled();
  const isInitialMount = useRef(true);

  // Initialize filters from URL params on mount
  useEffect(() => {
    const doctorId = searchParams.get("doctorId") || "";
    const specialty = searchParams.get("specialty") || "";
    const date = searchParams.get("date") || "";
    
    setSelectedDoctorId(doctorId);
    setSelectedSpecialty(specialty);
    setDateFilter(date);
    isInitialMount.current = false;
  }, []); // Only run on mount

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

  // Update URL when filters change (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) return;
    
    const params = new URLSearchParams();
    if (selectedDoctorId) params.set("doctorId", selectedDoctorId);
    if (selectedSpecialty) params.set("specialty", selectedSpecialty);
    if (dateFilter) params.set("date", dateFilter);
    
    const newUrl = params.toString() ? `/appointments?${params.toString()}` : "/appointments";
    router.replace(newUrl, { scroll: false });
  }, [selectedDoctorId, selectedSpecialty, dateFilter, router]);

  const handleBookAppointment = (appointment: Appointment) => {
    // Log the initial booking attempt
    logEvent(EVENT_TYPES.BOOK_APPOINTMENT, {
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
      date: appointment.date,
      time: appointment.time,
      action: "open_booking_modal",
      source: "appointments_page",
      modalOpenTime: new Date().toISOString()
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
    { key: 'specialty', header: 'Specialty' },
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time' },
    { key: 'action', header: 'Action', align: 'right' as const },
  ], []);

  const orderedColumns = useMemo(() => {
    const order = dyn.v1.changeOrderElements("appointments-columns", columns.length);
    return order.map((idx) => columns[idx]);
  }, [dyn.seed, columns]);

  // Get available dates from filtered appointments (before date filter)
  const availableDates = useMemo(() => {
    let filtered = appointmentList;

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(
        appointment => appointment.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    // Filter by doctorId
    if (selectedDoctorId) {
      filtered = filtered.filter(
        appointment => appointment.doctorId.toLowerCase() === selectedDoctorId.toLowerCase()
      );
    }

    // Get unique dates
    const dates = Array.from(new Set(filtered.map(a => a.date))).sort();
    return dates;
  }, [appointmentList, selectedSpecialty, selectedDoctorId]);

  // Filter appointments by specialty, doctorId, and/or date if filters are provided
  const filteredAppointments = useMemo(() => {
    let filtered = appointmentList;

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(
        appointment => appointment.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    // Filter by doctorId
    if (selectedDoctorId) {
      filtered = filtered.filter(
        appointment => appointment.doctorId.toLowerCase() === selectedDoctorId.toLowerCase()
      );
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(
        appointment => appointment.date === dateFilter
      );
    }

    return filtered;
  }, [appointmentList, selectedSpecialty, selectedDoctorId, dateFilter]);

  const orderedRows = useMemo(() => {
    const order = dyn.v1.changeOrderElements("appointments-rows", filteredAppointments.length);
    return order.map((idx) => filteredAppointments[idx]);
  }, [dyn.seed, filteredAppointments]);

  // Get doctor name for display if filtering by doctorId
  const filteredDoctorName = useMemo(() => {
    if (!selectedDoctorId) return null;
    const doctor = doctorList.find(d => d.id.toLowerCase() === selectedDoctorId.toLowerCase());
    return doctor?.name || null;
  }, [doctorList, selectedDoctorId]);

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

  // Handle doctor selection
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

  // Handle specialty selection
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
              {filteredDoctorName
                ? `Available Appointments - ${filteredDoctorName}`
                : selectedSpecialty 
                ? `Available Appointments - ${selectedSpecialty}`
                : "Available Appointments"}
            </h1>
            
            {/* Filters */}
            <div className="p-4 md:p-6">
              <div className="grid md:grid-cols-3 gap-4">
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
                      placeholder="Search doctor by name or specialty..."
                      className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
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

                {/* Specialty Filter */}
                <div className="space-y-2 relative">
                  <Label htmlFor="specialty-filter" className="text-sm font-medium text-white">
                    Filter by Specialty
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
                      placeholder="Search specialty..."
                      className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
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
                    className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {(selectedDoctorId || selectedSpecialty || dateFilter) && (
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedDoctorId("");
                      setSelectedSpecialty("");
                      setDateFilter("");
                      setDoctorSearchText("");
                      setSpecialtySearchText("");
                    }}
                    className="text-sm"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Results Count */}
              <div className="mt-4 text-sm text-white">
                Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointments Table */}
      <div className="container py-10">
      <div className="mt-6">
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
              {orderedRows.map((a, ri) => (
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
                            className={cn("bg-blue-600 hover:bg-blue-700", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
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

      <AppointmentBookingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        appointment={selectedAppointment}
      />
      </div>
    </>
  );
}
