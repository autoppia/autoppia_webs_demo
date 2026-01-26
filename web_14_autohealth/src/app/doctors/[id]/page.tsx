"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Doctor } from "@/data/types";
import { getDoctors, subscribeDoctors, whenReady } from "@/dynamic/v2";
import { DoctorProfileClient } from "./doctor-profile-client";
import { isDataGenerationAvailable } from "@/utils/healthDataGenerator";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { useDynamicSystem } from "@/dynamic/shared";

export default function DoctorProfile() {
  const params = useParams();
  const id = params?.id as string;
  const dyn = useDynamicSystem();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const useAiGeneration = isDataGenerationAvailable() && !isDbLoadModeEnabled();

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
        
        // If not found by ID, try to find by index from sessionStorage
        if (!foundDoctor && typeof window !== 'undefined' && doctors.length > 0) {
          const indexStr = sessionStorage.getItem(`__autohealth_doctor_index_${id}`);
          if (indexStr !== null) {
            const index = parseInt(indexStr, 10);
            if (!isNaN(index) && index >= 0) {
              const order = dyn.v1.changeOrderElements("doctors-list", doctors.length);
              const orderedDoctors = order.map((idx: number) => doctors[idx]);
              if (index < orderedDoctors.length) {
                const doctorByIndex = orderedDoctors[index];
                if (doctorByIndex) {
                  foundDoctor = doctorByIndex;
                  console.log(`[DoctorProfile] Found doctor by index ${index}: ${doctorByIndex.name}`);
                }
              }
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
            
            // If not found by ID, try to find by index from sessionStorage
            if (!updatedDoctor && typeof window !== 'undefined' && updatedDoctors.length > 0) {
              const indexStr = sessionStorage.getItem(`__autohealth_doctor_index_${id}`);
              if (indexStr !== null) {
                const index = parseInt(indexStr, 10);
                if (!isNaN(index) && index >= 0) {
                  const order = dyn.v1.changeOrderElements("doctors-list", updatedDoctors.length);
                  const orderedDoctors = order.map((idx: number) => updatedDoctors[idx]);
                  if (index < orderedDoctors.length) {
                    const doctorByIndex = orderedDoctors[index];
                    if (doctorByIndex) {
                      updatedDoctor = doctorByIndex;
                      console.log(`[DoctorProfile] Found doctor by index ${index} in updated list: ${doctorByIndex.name}`);
                    }
                  }
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
