"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Doctor } from "@/data/doctors";
import { initializeDoctors } from "@/data/doctors-enhanced";
import { DoctorProfileClient } from "./doctor-profile-client";
import { isDataGenerationAvailable } from "@/utils/healthDataGenerator";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

export default function DoctorProfile() {
  const params = useParams();
  const id = params?.id as string;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const useAiGeneration = isDataGenerationAvailable() && !isDbLoadModeEnabled();

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        // Load doctors from enhanced source (checks localStorage for AI-generated data)
        const doctors = await initializeDoctors();
        const foundDoctor = doctors.find((d) => d.id === id);
        
        if (mounted) {
          if (foundDoctor) {
            setDoctor(foundDoctor);
          } else {
            setNotFoundError(true);
          }
        }
      } catch (error) {
        console.error('Error loading doctor:', error);
        if (mounted) setNotFoundError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    
    return () => { mounted = false; };
  }, [id]);

  if (isLoading) {
    if (useAiGeneration) {
      return (
        <div className="container py-20 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading doctor profile...</span>
          </div>
        </div>
      );
    }
    return (
      <div className="container py-20 flex items-center justify-center">
        <div className="text-muted-foreground">Loading doctor profile…</div>
      </div>
    );
  }

  if (notFoundError || !doctor) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Doctor Not Found</h1>
          <p className="text-muted-foreground">The doctor you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <DoctorProfileClient doctor={doctor} />;
}
