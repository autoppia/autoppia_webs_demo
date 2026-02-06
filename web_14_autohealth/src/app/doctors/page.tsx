"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import { useEffect, useState, useMemo } from "react";
import { initializeDoctors } from "@/data/doctors-enhanced";
import { isDataGenerationAvailable } from "@/utils/healthDataGenerator";
import type { Doctor } from "@/data/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEDICAL_SPECIALTIES } from "@/data/medical-specialties";
import { Pagination } from "@/components/ui/pagination";

const DOCTORS_PAGE_SIZE = 9;

function Stars({ value }: { value: number }) {
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const active = value >= i + 1 - 1e-6 || value > i && value < i + 1; // show full for simplicity
    return (
      <Star key={i} className={`h-4 w-4 ${active ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"}`} />
    );
  });
  return <div className="flex items-center gap-1">{stars}</div>;
}

export default function DoctorsPage() {
  const dyn = useDynamicSystem();
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [appliedSearchName, setAppliedSearchName] = useState("");
  const [appliedSpecialty, setAppliedSpecialty] = useState<string>("");
  const [appliedLanguage, setAppliedLanguage] = useState<string>("");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const useAiGeneration = isDataGenerationAvailable() && !isDbLoadModeEnabled();

  const handleSearch = () => {
    const nameFilter = searchName.trim();
    const specialtyFilter = selectedSpecialty;
    const languageFilter = selectedLanguage;
    setAppliedSearchName(nameFilter);
    setAppliedSpecialty(specialtyFilter);
    setAppliedLanguage(languageFilter);
    setCurrentPage(1);

    let resultDoctors = doctorList;
    if (nameFilter) {
      const term = nameFilter.toLowerCase();
      resultDoctors = resultDoctors.filter((d) => d.name.toLowerCase().includes(term));
    }
    if (specialtyFilter) {
      resultDoctors = resultDoctors.filter(
        (d) => d.specialty.toLowerCase() === specialtyFilter.toLowerCase()
      );
    }
    if (languageFilter) {
      resultDoctors = resultDoctors.filter((d) =>
        (d.languages || []).some((l) => l.toLowerCase() === languageFilter.toLowerCase())
      );
    }

    const hasSearch = nameFilter.length > 0 || specialtyFilter.length > 0 || languageFilter.length > 0;
    if (hasSearch) {
      logEvent(EVENT_TYPES.SEARCH_DOCTORS, {
        searchTerm: nameFilter || null,
        specialty: specialtyFilter || null,
        language: languageFilter || null,
        doctors: resultDoctors,
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    initializeDoctors()
      .then((data) => { if (mounted) setDoctorList(data); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);
  
  // Unique languages from doctor list for filter dropdown
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    doctorList.forEach((d) => (d.languages || []).forEach((l) => set.add(l)));
    return [...set].sort();
  }, [doctorList]);

  // Filter doctors by applied name, speciality, language
  const filteredDoctors = useMemo(() => {
    let filtered = doctorList;
    if (appliedSearchName) {
      const searchTerm = appliedSearchName.toLowerCase();
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm)
      );
    }
    if (appliedSpecialty) {
      filtered = filtered.filter(doctor =>
        doctor.specialty.toLowerCase() === appliedSpecialty.toLowerCase()
      );
    }
    if (appliedLanguage) {
      filtered = filtered.filter((d) =>
        (d.languages || []).some((l) => l.toLowerCase() === appliedLanguage.toLowerCase())
      );
    }
    return filtered;
  }, [doctorList, appliedSearchName, appliedSpecialty, appliedLanguage]);

  // Sort then apply dynamic order
  const orderedDoctors = useMemo(() => {
    let list = [...filteredDoctors];
    if (sortBy === "rating") {
      list.sort((a, b) => (sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating));
    } else if (sortBy === "price") {
      list.sort((a, b) => (sortOrder === "desc" ? b.consultationFee - a.consultationFee : a.consultationFee - b.consultationFee));
    } else {
      const order = dyn.v1.changeOrderElements("doctors-list", list.length);
      list = order.map((idx) => list[idx]);
    }
    return list;
  }, [dyn.seed, filteredDoctors, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchName, appliedSpecialty, appliedLanguage, sortBy, sortOrder]);

  const totalDoctors = orderedDoctors.length;
  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * DOCTORS_PAGE_SIZE;
    return orderedDoctors.slice(start, start + DOCTORS_PAGE_SIZE);
  }, [orderedDoctors, currentPage]);

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
        <div className="text-muted-foreground">Loading doctors…</div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with Filters */}
      <section 
        className="relative min-h-[280px] flex items-center justify-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/doctors.jpg')",
          backgroundPosition: "center top",
        }}
      >
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {dyn.v1.addWrapDecoy("doctors-page-header", (
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">Doctors</h1>
            ))}
            
            {/* Search and Filter Section: Name, Speciality, Language only */}
            <div className="p-4 md:p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
                <div className="space-y-2">
                  <Label htmlFor="doctor-name-search" className="text-sm font-medium text-white">Search by Name</Label>
                  <Input
                    id="doctor-name-search"
                    type="text"
                    placeholder="Enter doctor's name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                    data-testid="doctor-name-search"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-specialty-filter" className="text-sm font-medium text-white">Filter by Speciality</Label>
                  <select
                    id="doctor-specialty-filter"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, "")
                    )}
                    data-testid="doctor-specialty-filter"
                  >
                    <option value="">All Specialties</option>
                    {[...MEDICAL_SPECIALTIES].sort().map((specialty: string) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-language-filter" className="text-sm font-medium text-white">Filter by Language</Label>
                  <select
                    id="doctor-language-filter"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, "")
                    )}
                    data-testid="doctor-language-filter"
                  >
                    <option value="">All Languages</option>
                    {availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  onClick={handleSearch}
                  className={cn("bg-emerald-600 hover:bg-emerald-700 h-10", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
                  data-testid="doctors-search-button"
                >
                  {dyn.v3.getVariant("search", TEXT_VARIANTS_MAP, "Search")}
                </Button>
              </div>
              <div className="mt-4 text-sm text-white">
                {totalDoctors} of {doctorList.length} doctors
                {appliedSearchName && ` matching "${appliedSearchName}"`}
                {appliedSpecialty && ` in ${appliedSpecialty}`}
                {appliedLanguage && ` speaking ${appliedLanguage}`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid + Sort by Rating / Price */}
      <div className="container py-10">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <span className="text-sm font-medium text-muted-foreground">Sort by</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy((e.target.value || "") as "rating" | "price" | "")}
          className={cn(
            "flex h-9 min-w-[120px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, "")
          )}
          data-testid="doctors-sort-by"
        >
          <option value="">Default</option>
          <option value="rating">Rating</option>
          <option value="price">Price</option>
        </select>
        {sortBy && (
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className={cn(
              "flex h-9 min-w-[100px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, "")
            )}
            data-testid="doctors-sort-order"
          >
            <option value="desc">{sortBy === "rating" ? "Highest first" : "Highest first"}</option>
            <option value="asc">{sortBy === "rating" ? "Lowest first" : "Lowest first"}</option>
          </select>
        )}
      </div>
      <Pagination
        totalItems={totalDoctors}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={DOCTORS_PAGE_SIZE}
        data-testid="doctors-pagination"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {paginatedDoctors.map((d, i) => (
          dyn.v1.addWrapDecoy(`doctor-card-${i}`, (
            <Card key={d.id} className={cn("flex flex-col w-full", dyn.v3.getVariant("doctor-card", CLASS_VARIANTS_MAP, ""))}>
              <CardHeader className="flex-row items-center gap-4">
                <Avatar 
                  src={`/images/doctors/${d.id}.jpg`}
                  alt={`${d.name} profile photo`}
                  name={d.name}
                  data-testid={`doctor-avatar-${d.id}`}
                  data-agent-id={`doctor-profile-image-${d.id}`}
                />
                <div>
                  <CardTitle className="text-lg">{d.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">{d.specialty}</div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Stars value={d.rating} />
                <p className="mt-3 text-sm text-muted-foreground">{d.bio}</p>
              </CardContent>
              <CardFooter className="mt-auto flex items-center justify-end pt-2">
                <SeedLink href={`/doctors/${d.id}`}>
                  {dyn.v1.addWrapDecoy(`view-profile-button-${i}`, (
                    <Button
                      id={dyn.v3.getVariant("view-profile-button", ID_VARIANTS_MAP, `view-profile-button-${i}`)}
                      className={cn("bg-green-600 hover:bg-green-700 text-white", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
                      data-testid="view-doctor-profile-btn"
                      onClick={() => logEvent(EVENT_TYPES.VIEW_DOCTOR_PROFILE, { doctor: d })}
                    >
                      {dyn.v3.getVariant("view_profile", TEXT_VARIANTS_MAP, "View Profile")}
                    </Button>
                  ))}
                </SeedLink>
              </CardFooter>
            </Card>
          ), `doctor-card-${i}`)
        ))}
      </div>
      <Pagination
        totalItems={totalDoctors}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={DOCTORS_PAGE_SIZE}
        className="mt-6"
        data-testid="doctors-pagination-bottom"
      />
      </div>
    </>
  );
}
