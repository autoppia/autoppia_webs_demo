#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_COUNT = 50;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(PROJECT_ROOT, 'src/data');

const FILE_MAP = {
  doctors: 'doctors.json',
  appointments: 'appointments.json',
  prescriptions: 'prescriptions.json',
  medicalRecords: 'medical-records.json'
};

const args = process.argv.slice(2);
const typeArg = args.find(arg => arg.startsWith('--type'));
const countArg = args.find(arg => arg.startsWith('--count'));
let dataType = 'doctors';
if (typeArg) {
  const [, value] = typeArg.split('=');
  if (value && Object.keys(FILE_MAP).includes(value)) {
    dataType = value;
  }
}
let count = DEFAULT_COUNT;
if (countArg) {
  const [, value] = countArg.split('=');
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isNaN(parsed) && parsed > 0) {
    count = parsed;
  }
}

function filePath(type) {
  const file = FILE_MAP[type];
  if (!file) throw new Error(`Unknown data type: ${type}`);
  return path.resolve(DATA_DIR, file);
}

function loadData(type) {
  const p = filePath(type);
  if (!fs.existsSync(p)) return [];
  try {
    const content = fs.readFileSync(p, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Failed to parse ${p}:`, error.message);
    return [];
  }
}

function saveData(type, data) {
  const p = filePath(type);
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, digits = 1) {
  return Number((Math.random() * (max - min) + min).toFixed(digits));
}

function randomDate(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = startDate.getTime() + Math.random() * timeDiff;
  return new Date(randomTime);
}

const specialties = [
  'Cardiology','Dermatology','Pediatrics','Orthopedics','Internal Medicine',
  'Gastroenterology','Neurology','Urology','Endocrinology','Psychiatry',
  'Oncology','Rheumatology','Pulmonology','Family Medicine','Ophthalmology'
];

const schools = [
  'Harvard Medical School','Stanford University School of Medicine','Johns Hopkins School of Medicine',
  'Mayo Clinic Alix School of Medicine','Yale School of Medicine','Duke University School of Medicine',
  'University of Pennsylvania','Columbia University Vagelos College'
];

const hospitals = [
  'City Medical Center','Regional Heart Institute','Children\'s Medical Center','General Health Hospital',
  'Northwest Specialty Clinic','Community Health System','National Research Hospital'
];

const insurancePlans = [
  'Blue Cross Blue Shield','Aetna','Cigna','UnitedHealth','Medicare','Medicaid','Kaiser Permanente'
];

const languages = ['English','Spanish','Mandarin','Hindi','French','Vietnamese','Arabic','Portuguese'];

const medCategories = ['diagnostic','preventive','treatment','monitoring'];
const medTypes = ['lab_result','imaging','vaccination','visit_summary','allergy','vital_signs','procedure','prescription_history'];
const rxCategories = ['cardiovascular','antibiotic','pain_management','diabetes','blood_pressure','cholesterol','thyroid','vitamin','other'];
const rxStatus = ['active','completed','discontinued','refill_needed'];
const appointmentTimes = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM'];

function generateDoctors(existing, count) {
  const existingIds = new Set(existing.map(d => d.id));
  const existingNames = new Set(existing.map(d => d.name.toLowerCase()));
  let nextIdNum = existing.reduce((max, doc) => Math.max(max, Number(doc.id?.replace(/\D/g, '')) || 0), 0) + 1;
  const results = [];
  while (results.length < count) {
    const id = `d${nextIdNum++}`;
    if (existingIds.has(id)) continue;
    const firstNames = ['Alice','Brian','Clara','Daniel','Sarah','Michael','Emily','James','Priya','Noah','Ava','Mateo','Isabella','Leo','Sofia'];
    const lastNames = ['Thompson','Patel','Nguyen','Ruiz','Johnson','Chen','Rodriguez','Wilson','Garcia','Lee','Singh','Lopez'];
    let firstName = randomFrom(firstNames);
    let lastName = randomFrom(lastNames);
    let name = `Dr. ${firstName} ${lastName}`;
    
    // Add numerical variation if name already exists
    let nameAttempt = 0;
    while (existingNames.has(name.toLowerCase()) && nameAttempt < 10) {
      const variation = randomInt(1, 999);
      name = `Dr. ${firstName} ${lastName} ${variation}`;
      nameAttempt += 1;
    }
    if (existingNames.has(name.toLowerCase())) {
      name = `Dr. ${firstName} ${lastName} ${randomInt(1000, 9999)}`;
    }
    const specialty = randomFrom(specialties);
    const rating = randomFloat(4.0, 5.0, 1);
    const experience = randomInt(5, 30);
    const education = [
      `MD - ${randomFrom(schools)}`,
      `Residency - ${randomFrom(hospitals)}`
    ];
    const certifications = [
      `Board Certified in ${specialty}`,
      `${specialty} Specialist`
    ];
    const langSet = [...new Set(Array.from({ length: randomInt(1, 3) }, () => randomFrom(languages)))];
    const insurance = [...new Set(Array.from({ length: randomInt(2, 5) }, () => randomFrom(insurancePlans)))];
    const availability = {
      monday: '8:00 AM - 5:00 PM',
      tuesday: '8:00 AM - 5:00 PM',
      wednesday: '8:00 AM - 5:00 PM',
      thursday: '8:00 AM - 5:00 PM',
      friday: '8:00 AM - 3:00 PM',
      saturday: Math.random() > 0.5 ? '9:00 AM - 1:00 PM' : 'Closed',
      sunday: 'Closed'
    };
    const patientReviews = Array.from({ length: 2 }, () => ({
      rating: randomInt(4, 5),
      comment: `${randomFrom(['Great experience','Highly recommend','Excellent care'])} with ${name}.`,
      patientName: `${randomFrom(['Alex','Jordan','Taylor','Sam','Casey','Drew'])} ${randomFrom(['K.','M.','R.','L.'])}`,
      date: new Date(Date.now() - randomInt(0, 365) * 86400000).toISOString().slice(0, 10)
    }));
    const doctor = {
      id,
      name,
      specialty,
      rating,
      bio: `${specialty} specialist with ${experience}+ years of experience providing patient-centered care.`,
      experience,
      education,
      certifications,
      languages: langSet,
      hospitalAffiliations: [randomFrom(hospitals), randomFrom(hospitals)],
      officeLocation: `${randomInt(100, 999)} Health Ave, Medical District`,
      phone: `(555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
      email: `${name.replace(/\s+/g, '.').replace('Dr.', '').toLowerCase()}@autohealth.com`,
      consultationFee: randomInt(150, 400),
      insuranceAccepted: insurance,
      availability,
      specialties: [specialty, randomFrom(specialties)],
      patientReviews,
      awards: [`${specialty} Excellence Award ${randomInt(2018, 2024)}`],
      publications: [`Advances in ${specialty} - ${randomInt(2020, 2024)}`],
      procedures: [`${specialty} Consultation`, `${specialty} Follow-up`]
    };
    existingIds.add(id);
    existingNames.add(name.toLowerCase());
    results.push(doctor);
  }
  return results;
}

function getDoctorLookup() {
  const doctors = loadData('doctors');
  return doctors.length > 0
    ? doctors.map(d => ({ id: d.id, name: d.name, specialty: d.specialty }))
    : [{ id: 'd1', name: 'Dr. Default', specialty: 'General Medicine' }];
}

function generateAppointments(existing, count) {
  const doctors = getDoctorLookup();
  const existingIds = new Set(existing.map(a => a.id));
  let nextIdNum = existing.reduce((max, appt) => Math.max(max, Number(appt.id?.replace(/\D/g, '')) || 0), 0) + 1;
  const results = [];
  while (results.length < count) {
    const doc = randomFrom(doctors);
    const id = `a${nextIdNum++}`;
    if (existingIds.has(id)) continue;
    const date = randomDate('2024-01-01', '2026-12-31');
    results.push({
      id,
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      date: date.toISOString().slice(0, 10),
      time: randomFrom(appointmentTimes)
    });
    existingIds.add(id);
  }
  return results;
}

function generatePrescriptions(existing, count) {
  const doctors = getDoctorLookup();
  const existingIds = new Set(existing.map(r => r.id));
  let nextIdNum = existing.reduce((max, rx) => Math.max(max, Number(rx.id?.replace(/\D/g, '')) || 0), 0) + 1;
  const medicines = ['Atorvastatin','Metformin','Lisinopril','Levothyroxine','Albuterol','Omeprazole','Ibuprofen','Gabapentin','Losartan','Simvastatin'];
  const instructionsList = ['Take with food','Take on empty stomach','Do not skip doses','Use as needed for pain','Monitor blood pressure'];
  const results = [];
  while (results.length < count) {
    const id = `p${nextIdNum++}`;
    if (existingIds.has(id)) continue;
    const doc = randomFrom(doctors);
    const med = randomFrom(medicines);
    const start = randomDate('2023-01-01', '2025-12-31');
    const maybeEnd = Math.random() > 0.6 ? new Date(start.getTime() + randomInt(15, 120) * 86400000) : null;
    results.push({
      id,
      medicineName: med,
      genericName: med,
      dosage: `${randomInt(5, 50)} mg ${Math.random() > 0.5 ? 'daily' : 'twice daily'}`,
      doctorName: doc.name,
      startDate: start.toISOString().slice(0, 10),
      endDate: maybeEnd ? maybeEnd.toISOString().slice(0, 10) : undefined,
      status: randomFrom(rxStatus),
      category: randomFrom(rxCategories),
      instructions: randomFrom(instructionsList),
      sideEffects: ['Nausea','Dizziness','Headache'].filter(() => Math.random() > 0.5),
      warnings: ['Do not exceed recommended dose','Monitor labs','Take with water'].filter(() => Math.random() > 0.5),
      refillsRemaining: randomInt(0, 5),
      totalRefills: randomInt(0, 6),
      pharmacy: randomFrom(['CVS Pharmacy','Walgreens','Rite Aid','Costco Pharmacy']),
      prescriptionNumber: `RX-${randomInt(2023, 2025)}-${randomInt(100000, 999999)}`,
      cost: Number((Math.random() * 40 + 5).toFixed(2)),
      insuranceCoverage: Math.random() > 0.2
    });
    existingIds.add(id);
  }
  return results;
}

function generateMedicalRecords(existing, count) {
  const doctors = getDoctorLookup();
  const existingIds = new Set(existing.map(r => r.id));
  let nextIdNum = existing.reduce((max, rec) => Math.max(max, Number(rec.id?.replace(/\D/g, '')) || 0), 0) + 1;
  const facilities = ['City Medical Lab','Community Health Center','Radiology Associates','Advanced Imaging Center'];
  const statuses = ['normal','abnormal','pending','reviewed'];
  const results = [];
  while (results.length < count) {
    const id = `mr${nextIdNum++}`;
    if (existingIds.has(id)) continue;
    const doc = randomFrom(doctors);
    const type = randomFrom(medTypes);
    const category = randomFrom(medCategories);
    const recordDate = randomDate('2023-01-01', '2025-12-31');
    const record = {
      id,
      type,
      title: `${type.replace(/_/g, ' ')} Report ${id}`,
      date: recordDate.toISOString().slice(0, 10),
      doctorName: doc.name,
      facility: randomFrom(facilities),
      description: `Summary for ${type} generated by ${doc.name}.`,
      status: randomFrom(statuses),
      category,
      values: type === 'lab_result' ? {
        observation: `${randomFloat(0.8, 1.2)} units`
      } : undefined
    };
    existingIds.add(id);
    results.push(record);
  }
  return results;
}

function main() {
  const current = loadData(dataType);
  let newEntries = [];
  switch (dataType) {
    case 'doctors':
      newEntries = generateDoctors(current, count);
      break;
    case 'appointments':
      newEntries = generateAppointments(current, count);
      break;
    case 'prescriptions':
      newEntries = generatePrescriptions(current, count);
      break;
    case 'medicalRecords':
      newEntries = generateMedicalRecords(current, count);
      break;
    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }

  if (newEntries.length === 0) {
    console.warn('No new entries generated.');
    return;
  }

  const updated = [...current, ...newEntries];
  saveData(dataType, updated);
  console.log(`Added ${newEntries.length} ${dataType} entries to ${FILE_MAP[dataType]}`);
}

main();
