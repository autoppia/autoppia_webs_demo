export interface DataGenerationResponse<T = unknown> {
  success: boolean;
  data: T[];
  count: number;
  generationTime: number;
  error?: string;
}

export interface ProjectEntityConfig {
  entityType: string;
  interfaceDefinition: string;
  examples: unknown[];
}

export interface ProjectConfig {
  projectName: string;
  entities: Record<string, ProjectEntityConfig>;
}

const HEALTH_PROJECT: ProjectConfig = {
  projectName: 'AutoHealth',
  entities: {
    doctors: {
      entityType: 'doctors',
      interfaceDefinition: `
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  bio?: string;
}
      `,
      examples: [
        { id: 'd1', name: 'Dr. Alice Lee', specialty: 'Cardiology', rating: 4.7, experience: 12 },
      ],
    },
    appointments: {
      entityType: 'appointments',
      interfaceDefinition: `
export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
}
      `,
      examples: [
        { id: 'a1', doctorId: 'd1', doctorName: 'Dr. Alice Lee', specialty: 'Cardiology', date: '2025-07-09', time: '10:00 AM' },
      ],
    },
    prescriptions: {
      entityType: 'prescriptions',
      interfaceDefinition: `
export interface Prescription {
  id: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  doctorName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'discontinued' | 'refill_needed';
  category: string;
}
      `,
      examples: [
        { id: 'p1', medicineName: 'Atorvastatin', genericName: 'Lipitor', dosage: '10mg daily', doctorName: 'Dr. Alice Lee', startDate: '2025-07-01', status: 'active', category: 'cholesterol' },
      ],
    },
    medical_records: {
      entityType: 'medical_records',
      interfaceDefinition: `
export interface MedicalRecord {
  id: string;
  title: string;
  type: string;
  category: string;
  date: string;
  doctorName: string;
  status: 'normal' | 'abnormal' | 'pending' | 'reviewed';
  description?: string;
}
      `,
      examples: [
        { id: 'm1', title: 'CBC Panel', type: 'lab_result', category: 'diagnostic', date: '2025-07-05', doctorName: 'Dr. Bob', status: 'reviewed' },
      ],
    },
  },
};

export async function generateProjectData<T = unknown>(
  entityKey: keyof typeof HEALTH_PROJECT.entities,
  count: number = 10
): Promise<DataGenerationResponse<T>> {
  const config = HEALTH_PROJECT.entities[entityKey as string];
  if (!config) {
    return { success: false, data: [], count: 0, generationTime: 0, error: `Unknown entity: ${String(entityKey)}` };
  }

  const start = Date.now();
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/datasets/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interface_definition: config.interfaceDefinition,
        examples: config.examples,
        count: Math.max(1, Math.min(200, count)),
        project_key: 'web_14_autohealth',
        entity_type: config.entityType,
        save_to_db: true,
      }),
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    const result = await response.json();
    return { success: true, data: result.generated_data as T[], count: result.count, generationTime: (Date.now() - start) / 1000 };
  } catch (e) {
    return { success: false, data: [], count: 0, generationTime: (Date.now() - start) / 1000, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export function isDataGenerationEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_DATA_GENERATION || process.env.ENABLE_DATA_GENERATION || '').toString().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8090';
}


