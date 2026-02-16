"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Doctor } from "@/data/types";
import { getDoctors, subscribeDoctors, whenReady } from "@/dynamic/v2";
import { DoctorProfileClient } from "./doctor-profile-client";
import { useDynamicSystem } from "@/dynamic/shared";
import { useSeed } from "@/context/SeedContext";

export default function DoctorProfile() {
  const params = useParams();
  const id = params?.id as string;
  const dyn = useDynamicSystem();
  const { seed: currentSeed } = useSeed();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const loadDoctor = async () => {
      try {
        // Reset state when loading
        if (mounted) {
          setIsLoading(true);
          setNotFoundError(false);
          setDoctor(null);
        }

        // Wait for data to be ready (this will wait for reloads too)
        await whenReady();
        if (!mounted) return;

        // Get all doctors from the provider
        const doctors = getDoctors();
        console.log(`[DoctorProfile] Looking for doctor ID: ${id}, Total doctors: ${doctors.length}`);
        if (doctors.length > 0) {
          console.log(`[DoctorProfile] First few doctor IDs:`, doctors.slice(0, 5).map(d => d.id));
        }

        // Try to find doctor by ID first
        let foundDoctor = doctors.find((d) => d.id === id);

        // If not found by ID, try to find by index from sessionStorage (only if seed matches)
        if (!foundDoctor && typeof window !== 'undefined' && doctors.length > 0) {
          const indexDataStr = sessionStorage.getItem(`__autohealth_doctor_index_${id}`);
          if (indexDataStr !== null) {
            try {
              const indexData = JSON.parse(indexDataStr);
              // Only use the stored index if the seed matches the current seed
              if (indexData.seed === currentSeed && typeof indexData.index === 'number') {
                const index = indexData.index;
                if (!isNaN(index) && index >= 0) {
                  const order = dyn.v1.changeOrderElements("doctors-list", doctors.length);
                  const orderedDoctors = order.map((idx: number) => doctors[idx]);
                  if (index < orderedDoctors.length) {
                    const doctorByIndex = orderedDoctors[index];
                    if (doctorByIndex) {
                      foundDoctor = doctorByIndex;
                      console.log(`[DoctorProfile] Found doctor by index ${index} (seed=${currentSeed}): ${doctorByIndex.name}`);
                    }
                  }
                }
              } else {
                // Seed mismatch - clear the stale sessionStorage entry
                console.log(`[DoctorProfile] Seed mismatch (stored: ${indexData.seed}, current: ${currentSeed}), clearing sessionStorage entry`);
                sessionStorage.removeItem(`__autohealth_doctor_index_${id}`);
              }
            } catch (e) {
              // Legacy format (just a number) - clear it
              console.log(`[DoctorProfile] Legacy sessionStorage format detected, clearing entry`);
              sessionStorage.removeItem(`__autohealth_doctor_index_${id}`);
            }
          }
        }

        if (mounted) {
          if (foundDoctor) {
            console.log(`[DoctorProfile] Found doctor: ${foundDoctor.name}`);
            setDoctor(foundDoctor);
            setIsLoading(false);
            setNotFoundError(false);
          } else {
            console.warn(`[DoctorProfile] Doctor not found with ID: ${id}`);
            setNotFoundError(true);
            setIsLoading(false);
          }
        }

        // Subscribe to updates in case doctor data changes (e.g., when seed changes)
        unsubscribe = subscribeDoctors((updatedDoctors) => {
          if (mounted) {
            console.log(`[DoctorProfile] Doctors updated, count: ${updatedDoctors.length}, looking for ID: ${id}`);

            // If doctors array is empty, data is being reloaded - wait for it
            if (updatedDoctors.length === 0) {
              console.log(`[DoctorProfile] Doctors array is empty, waiting for reload...`);
              setIsLoading(true);
              setNotFoundError(false);
              setDoctor(null);
              return;
            }

            // Try to find doctor by ID first
            let updatedDoctor = updatedDoctors.find((d) => d.id === id);

            // If not found by ID, try to find by index from sessionStorage (only if seed matches)
            if (!updatedDoctor && typeof window !== 'undefined' && updatedDoctors.length > 0) {
              const indexDataStr = sessionStorage.getItem(`__autohealth_doctor_index_${id}`);
              if (indexDataStr !== null) {
                try {
                  const indexData = JSON.parse(indexDataStr);
                  // Only use the stored index if the seed matches the current seed
                  if (indexData.seed === currentSeed && typeof indexData.index === 'number') {
                    const index = indexData.index;
                    if (!isNaN(index) && index >= 0) {
                      const order = dyn.v1.changeOrderElements("doctors-list", updatedDoctors.length);
                      const orderedDoctors = order.map((idx: number) => updatedDoctors[idx]);
                      if (index < orderedDoctors.length) {
                        const doctorByIndex = orderedDoctors[index];
                        if (doctorByIndex) {
                          updatedDoctor = doctorByIndex;
                          console.log(`[DoctorProfile] Found doctor by index ${index} in updated list (seed=${currentSeed}): ${doctorByIndex.name}`);
                        }
                      }
                    }
                  } else {
                    // Seed mismatch - clear the stale sessionStorage entry
                    console.log(`[DoctorProfile] Seed mismatch in update (stored: ${indexData.seed}, current: ${currentSeed}), clearing sessionStorage entry`);
                    sessionStorage.removeItem(`__autohealth_doctor_index_${id}`);
                  }
                } catch (e) {
                  // Legacy format (just a number) - clear it
                  console.log(`[DoctorProfile] Legacy sessionStorage format detected in update, clearing entry`);
                  sessionStorage.removeItem(`__autohealth_doctor_index_${id}`);
                }
              }
            }

            if (updatedDoctor) {
              console.log(`[DoctorProfile] Found doctor in updated list: ${updatedDoctor.name}`);
              setDoctor(updatedDoctor);
              setIsLoading(false);
              setNotFoundError(false);
            } else {
              // Doctor not found in the new data
              console.warn(`[DoctorProfile] Doctor not found in updated list. Available IDs:`, updatedDoctors.slice(0, 5).map(d => d.id));
              setNotFoundError(true);
              setIsLoading(false);
            }
          }
        });
      } catch (error) {
        console.error('Error loading doctor:', error);
        if (mounted) {
          setNotFoundError(true);
          setIsLoading(false);
        }
      }
    };

    loadDoctor();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [id, currentSeed, dyn]);

  if (isLoading) {
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
