export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number; // 0-5
  image?: string;
  bio: string;
  experience: number; // years of experience
  education: string[];
  certifications: string[];
  languages: string[];
  hospitalAffiliations: string[];
  officeLocation: string;
  phone: string;
  email: string;
  consultationFee: number;
  insuranceAccepted: string[];
  availability: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  specialties: string[];
  patientReviews: {
    rating: number;
    comment: string;
    patientName: string;
    date: string;
  }[];
  awards: string[];
  publications: string[];
  procedures: string[];
};

export const doctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Alice Thompson",
    specialty: "Cardiology",
    rating: 4.8,
    image: undefined,
    bio: "Experienced cardiologist with over 15 years of practice, specializing in preventive cardiology and interventional procedures. Dr. Thompson is dedicated to providing comprehensive heart care with a focus on patient education and lifestyle modifications.",
    experience: 15,
    education: [
      "MD - Harvard Medical School",
      "Residency - Johns Hopkins Hospital",
      "Fellowship - Mayo Clinic Cardiology"
    ],
    certifications: [
      "Board Certified in Internal Medicine",
      "Board Certified in Cardiovascular Disease",
      "Fellow of the American College of Cardiology"
    ],
    languages: ["English", "Spanish"],
    hospitalAffiliations: [
      "City Medical Center",
      "Regional Heart Institute"
    ],
    officeLocation: "123 Heart Street, Medical District",
    phone: "(555) 123-4567",
    email: "alice.thompson@citymedical.com",
    consultationFee: 250,
    insuranceAccepted: [
      "Blue Cross Blue Shield",
      "Aetna",
      "Cigna",
      "Medicare",
      "Medicaid"
    ],
    availability: {
      monday: "8:00 AM - 5:00 PM",
      tuesday: "8:00 AM - 5:00 PM",
      wednesday: "8:00 AM - 5:00 PM",
      thursday: "8:00 AM - 5:00 PM",
      friday: "8:00 AM - 3:00 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    specialties: [
      "Preventive Cardiology",
      "Interventional Cardiology",
      "Heart Failure Management",
      "Arrhythmia Treatment"
    ],
    patientReviews: [
      {
        rating: 5,
        comment: "Dr. Thompson is amazing! She took the time to explain everything clearly and made me feel comfortable.",
        patientName: "Sarah M.",
        date: "2024-01-15"
      },
      {
        rating: 5,
        comment: "Excellent care and follow-up. Highly recommend for heart health.",
        patientName: "John D.",
        date: "2024-01-10"
      }
    ],
    awards: [
      "Top Cardiologist 2023 - City Medical Journal",
      "Patient Choice Award 2022"
    ],
    publications: [
      "Preventive Cardiology in Modern Practice - 2023",
      "Advances in Interventional Cardiology - 2022"
    ],
    procedures: [
      "Cardiac Catheterization",
      "Angioplasty",
      "Pacemaker Implantation",
      "Echocardiography"
    ]
  },
  {
    id: "d2",
    name: "Dr. Brian Patel",
    specialty: "Dermatology",
    rating: 4.5,
    image: undefined,
    bio: "Board-certified dermatologist with expertise in medical and cosmetic dermatology. Dr. Patel specializes in skin cancer detection, acne treatment, and advanced dermatological procedures.",
    experience: 12,
    education: [
      "MD - Stanford University School of Medicine",
      "Residency - UCSF Dermatology",
      "Fellowship - Mohs Surgery"
    ],
    certifications: [
      "Board Certified in Dermatology",
      "Mohs Surgery Certified",
      "Cosmetic Dermatology Specialist"
    ],
    languages: ["English", "Hindi", "Gujarati"],
    hospitalAffiliations: [
      "Skin Care Specialists",
      "City Medical Center"
    ],
    officeLocation: "456 Skin Avenue, Dermatology Plaza",
    phone: "(555) 234-5678",
    email: "brian.patel@skincare.com",
    consultationFee: 200,
    insuranceAccepted: [
      "Blue Cross Blue Shield",
      "Aetna",
      "Cigna",
      "UnitedHealth"
    ],
    availability: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 4:00 PM",
      saturday: "9:00 AM - 2:00 PM",
      sunday: "Closed"
    },
    specialties: [
      "Skin Cancer Detection",
      "Acne Treatment",
      "Mohs Surgery",
      "Cosmetic Dermatology"
    ],
    patientReviews: [
      {
        rating: 4,
        comment: "Great dermatologist, very thorough in skin cancer screening.",
        patientName: "Lisa K.",
        date: "2024-01-12"
      },
      {
        rating: 5,
        comment: "Helped clear up my acne completely. Very knowledgeable!",
        patientName: "Mike R.",
        date: "2024-01-08"
      }
    ],
    awards: [
      "Best Dermatologist 2023 - Local Health Magazine",
      "Excellence in Mohs Surgery 2022"
    ],
    publications: [
      "Advanced Skin Cancer Detection Techniques - 2023",
      "Modern Acne Treatment Protocols - 2022"
    ],
    procedures: [
      "Mohs Surgery",
      "Skin Biopsy",
      "Chemical Peels",
      "Laser Treatment"
    ]
  },
  {
    id: "d3",
    name: "Dr. Clara Nguyen",
    specialty: "Pediatrics",
    rating: 4.9,
    image: undefined,
    bio: "Pediatrician with a passion for child wellness and family-centered care. Dr. Nguyen has extensive experience in preventive care, developmental assessments, and managing complex pediatric conditions.",
    experience: 18,
    education: [
      "MD - University of California San Francisco",
      "Residency - Children's Hospital Los Angeles",
      "Fellowship - Pediatric Emergency Medicine"
    ],
    certifications: [
      "Board Certified in Pediatrics",
      "Pediatric Advanced Life Support",
      "Child Development Specialist"
    ],
    languages: ["English", "Vietnamese", "Spanish"],
    hospitalAffiliations: [
      "Children's Medical Center",
      "City General Hospital"
    ],
    officeLocation: "789 Kids Lane, Pediatric Center",
    phone: "(555) 345-6789",
    email: "clara.nguyen@childrensmed.com",
    consultationFee: 180,
    insuranceAccepted: [
      "Blue Cross Blue Shield",
      "Aetna",
      "Cigna",
      "Medicaid",
      "CHIP"
    ],
    availability: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 5:00 PM",
      saturday: "9:00 AM - 1:00 PM",
      sunday: "Closed"
    },
    specialties: [
      "Well-Child Care",
      "Developmental Assessments",
      "Vaccination Programs",
      "Pediatric Emergency Care"
    ],
    patientReviews: [
      {
        rating: 5,
        comment: "Dr. Nguyen is wonderful with children. My kids love going to see her!",
        patientName: "Maria G.",
        date: "2024-01-14"
      },
      {
        rating: 5,
        comment: "Excellent pediatrician, very thorough and caring.",
        patientName: "David L.",
        date: "2024-01-11"
      }
    ],
    awards: [
      "Pediatrician of the Year 2023",
      "Family Choice Award 2022"
    ],
    publications: [
      "Childhood Vaccination Best Practices - 2023",
      "Developmental Milestones in Modern Pediatrics - 2022"
    ],
    procedures: [
      "Well-Child Examinations",
      "Vaccinations",
      "Developmental Screenings",
      "Minor Procedures"
    ]
  },
  {
    id: "d4",
    name: "Dr. Daniel Ruiz",
    specialty: "Orthopedics",
    rating: 4.6,
    image: undefined,
    bio: "Orthopedic surgeon specializing in sports medicine and minimally invasive techniques. Dr. Ruiz has extensive experience in joint replacement, arthroscopic surgery, and sports injury treatment.",
    experience: 14,
    education: [
      "MD - University of Texas Southwestern",
      "Residency - Hospital for Special Surgery",
      "Fellowship - Sports Medicine"
    ],
    certifications: [
      "Board Certified in Orthopedic Surgery",
      "Sports Medicine Specialist",
      "Arthroscopic Surgery Certified"
    ],
    languages: ["English", "Spanish"],
    hospitalAffiliations: [
      "Sports Medicine Institute",
      "City Orthopedic Center"
    ],
    officeLocation: "321 Bone Street, Orthopedic Plaza",
    phone: "(555) 456-7890",
    email: "daniel.ruiz@sportsmed.com",
    consultationFee: 300,
    insuranceAccepted: [
      "Blue Cross Blue Shield",
      "Aetna",
      "Cigna",
      "Workers' Compensation"
    ],
    availability: {
      monday: "7:00 AM - 5:00 PM",
      tuesday: "7:00 AM - 5:00 PM",
      wednesday: "7:00 AM - 5:00 PM",
      thursday: "7:00 AM - 5:00 PM",
      friday: "7:00 AM - 3:00 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    specialties: [
      "Sports Medicine",
      "Joint Replacement",
      "Arthroscopic Surgery",
      "Trauma Surgery"
    ],
    patientReviews: [
      {
        rating: 4,
        comment: "Great surgeon, helped me get back to sports quickly.",
        patientName: "Alex T.",
        date: "2024-01-13"
      },
      {
        rating: 5,
        comment: "Excellent care and follow-up. Highly recommend!",
        patientName: "Jennifer W.",
        date: "2024-01-09"
      }
    ],
    awards: [
      "Top Orthopedic Surgeon 2023",
      "Sports Medicine Excellence Award 2022"
    ],
    publications: [
      "Advances in Arthroscopic Surgery - 2023",
      "Sports Injury Prevention and Treatment - 2022"
    ],
    procedures: [
      "Knee Arthroscopy",
      "Hip Replacement",
      "Shoulder Surgery",
      "ACL Reconstruction"
    ]
  },
  {
    id: "d5",
    name: "Dr. Sarah Johnson",
    specialty: "Internal Medicine",
    rating: 4.7,
    image: undefined,
    bio: "Internal medicine physician with a focus on preventive care and chronic disease management. Dr. Johnson provides comprehensive primary care for adults with emphasis on wellness and health maintenance.",
    experience: 16,
    education: [
      "MD - Yale School of Medicine",
      "Residency - Massachusetts General Hospital",
      "Fellowship - Geriatric Medicine"
    ],
    certifications: [
      "Board Certified in Internal Medicine",
      "Geriatric Medicine Specialist",
      "Preventive Medicine Certified"
    ],
    languages: ["English", "French"],
    hospitalAffiliations: [
      "City Medical Center",
      "Senior Care Clinic"
    ],
    officeLocation: "654 Health Boulevard, Medical Plaza",
    phone: "(555) 567-8901",
    email: "sarah.johnson@citymedical.com",
    consultationFee: 220,
    insuranceAccepted: [
      "Blue Cross Blue Shield",
      "Aetna",
      "Cigna",
      "Medicare",
      "Medicaid"
    ],
    availability: {
      monday: "8:00 AM - 5:00 PM",
      tuesday: "8:00 AM - 5:00 PM",
      wednesday: "8:00 AM - 5:00 PM",
      thursday: "8:00 AM - 5:00 PM",
      friday: "8:00 AM - 4:00 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    specialties: [
      "Preventive Medicine",
      "Chronic Disease Management",
      "Geriatric Care",
      "Health Screenings"
    ],
    patientReviews: [
      {
        rating: 5,
        comment: "Dr. Johnson is thorough and caring. Great primary care physician.",
        patientName: "Robert H.",
        date: "2024-01-16"
      },
      {
        rating: 4,
        comment: "Excellent preventive care and health management.",
        patientName: "Linda P.",
        date: "2024-01-12"
      }
    ],
    awards: [
      "Primary Care Physician of the Year 2023",
      "Excellence in Geriatric Care 2022"
    ],
    publications: [
      "Preventive Medicine in Primary Care - 2023",
      "Managing Chronic Conditions in Older Adults - 2022"
    ],
    procedures: [
      "Annual Physical Examinations",
      "Health Screenings",
      "Chronic Disease Management",
      "Vaccinations"
    ]
  },
  {
    id: "d6",
    name: "Dr. Michael Chen",
    specialty: "Gastroenterology",
    rating: 4.4,
    image: undefined,
    bio: "Gastroenterologist specializing in digestive health, endoscopy, and liver disease. Dr. Chen provides comprehensive care for gastrointestinal conditions with advanced diagnostic and therapeutic procedures.",
    experience: 13,
    education: [
      "MD - Johns Hopkins School of Medicine",
      "Residency - Cleveland Clinic",
      "Fellowship - Gastroenterology"
    ],
    certifications: [
      "Board Certified in Internal Medicine",
      "Board Certified in Gastroenterology",
      "Advanced Endoscopy Certified"
    ],
    languages: ["English", "Mandarin"],
    hospitalAffiliations: [
      "Gastroenterology Associates",
      "City Medical Center"
    ],
    officeLocation: "987 Digestive Drive, GI Center",
    phone: "(555) 678-9012",
    email: "michael.chen@giassociates.com",
    consultationFee: 280,
    insuranceAccepted: [
      "Blue Cross Blue Shield",
      "Aetna",
      "Cigna",
      "Medicare"
    ],
    availability: {
      monday: "8:00 AM - 5:00 PM",
      tuesday: "8:00 AM - 5:00 PM",
      wednesday: "8:00 AM - 5:00 PM",
      thursday: "8:00 AM - 5:00 PM",
      friday: "8:00 AM - 3:00 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    specialties: [
      "Endoscopy",
      "Liver Disease",
      "Inflammatory Bowel Disease",
      "Colon Cancer Screening"
    ],
    patientReviews: [
      {
        rating: 4,
        comment: "Very thorough and professional. Made the procedure comfortable.",
        patientName: "Thomas B.",
        date: "2024-01-15"
      },
      {
        rating: 5,
        comment: "Excellent gastroenterologist, highly recommend!",
        patientName: "Nancy M.",
        date: "2024-01-10"
      }
    ],
    awards: [
      "Gastroenterologist of the Year 2023",
      "Excellence in Endoscopy 2022"
    ],
    publications: [
      "Advanced Endoscopic Techniques - 2023",
      "Liver Disease Management - 2022"
    ],
    procedures: [
      "Colonoscopy",
      "Upper Endoscopy",
      "ERCP",
      "Liver Biopsy"
    ]
  },
  {
    id: "d7",
    name: "Dr. Emily Rodriguez",
    specialty: "Neurology",
    rating: 4.8,
    image: undefined,
    bio: "Neurologist specializing in headache disorders, epilepsy, and movement disorders. Dr. Rodriguez provides comprehensive neurological care with advanced diagnostic capabilities and personalized treatment plans.",
    experience: 11,
    education: [
      "MD - University of Pennsylvania",
      "Residency - Mayo Clinic Neurology",
      "Fellowship - Movement Disorders"
    ],
    certifications: [
      "Board Certified in Neurology",
      "Epilepsy Specialist",
      "Movement Disorders Certified"
    ],
    languages: ["English", "Spanish"],
    hospitalAffiliations: [
      "Neurological Institute",
      "City Medical Center"
    ],
    officeLocation: "147 Brain Street, Neuro Center",
    phone: "(555) 789-0123",
    email: "emily.rodriguez@neuroinstitute.com",
    consultationFee: 320,
    insuranceAccepted: [
      "Blue Cross Blue Shield",
      "Aetna",
      "Cigna",
      "Medicare"
    ],
    availability: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "9:00 AM - 5:00 PM",
      wednesday: "9:00 AM - 5:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 3:00 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    specialties: [
      "Headache Disorders",
      "Epilepsy",
      "Movement Disorders",
      "Multiple Sclerosis"
    ],
    patientReviews: [
      {
        rating: 5,
        comment: "Dr. Rodriguez helped me manage my migraines effectively.",
        patientName: "Amanda K.",
        date: "2024-01-14"
      },
      {
        rating: 4,
        comment: "Very knowledgeable and caring neurologist.",
        patientName: "James R.",
        date: "2024-01-11"
      }
    ],
    awards: [
      "Neurologist of the Year 2023",
      "Excellence in Patient Care 2022"
    ],
    publications: [
      "Modern Treatment of Headache Disorders - 2023",
      "Advances in Epilepsy Management - 2022"
    ],
    procedures: [
      "EEG",
      "EMG",
      "Botulinum Toxin Injections",
      "Deep Brain Stimulation"
    ]
  },
  {
    id: "d8",
    name: "Dr. James Wilson",
    specialty: "Urology",
    rating: 4.3,
    image: undefined,
    bio: "Urologist with expertise in minimally invasive surgery, prostate health, and kidney stone treatment. Dr. Wilson provides comprehensive urological care with advanced surgical techniques and patient-centered approach.",
    experience: 17,
    education: [
      "MD - Duke University School of Medicine",
      "Residency - University of California San Francisco",
      "Fellowship - Minimally Invasive Urology"
    ],
    certifications: [
      "Board Certified in Urology",
      "Robotic Surgery Certified",
      "Endourology Specialist"
    ],
    languages: ["English"],
    hospitalAffiliations: [
      "Urological Associates",
      "City Medical Center"
    ],
    officeLocation: "258 Urology Way, Medical Complex",
    phone: "(555) 890-1234",
    email: "james.wilson@urologyassoc.com",
    consultationFee: 260,
    insuranceAccepted: [
      "Blue Cross Blue Shield",
      "Aetna",
      "Cigna",
      "Medicare"
    ],
    availability: {
      monday: "8:00 AM - 5:00 PM",
      tuesday: "8:00 AM - 5:00 PM",
      wednesday: "8:00 AM - 5:00 PM",
      thursday: "8:00 AM - 5:00 PM",
      friday: "8:00 AM - 3:00 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    specialties: [
      "Prostate Health",
      "Kidney Stone Treatment",
      "Minimally Invasive Surgery",
      "Male Infertility"
    ],
    patientReviews: [
      {
        rating: 4,
        comment: "Professional and skilled surgeon. Good outcomes.",
        patientName: "Mark S.",
        date: "2024-01-13"
      },
      {
        rating: 5,
        comment: "Excellent care for kidney stones. Quick recovery.",
        patientName: "Susan L.",
        date: "2024-01-09"
      }
    ],
    awards: [
      "Urologist of the Year 2023",
      "Excellence in Robotic Surgery 2022"
    ],
    publications: [
      "Minimally Invasive Urological Surgery - 2023",
      "Kidney Stone Management - 2022"
    ],
    procedures: [
      "Robotic Prostate Surgery",
      "Kidney Stone Removal",
      "Cystoscopy",
      "Vasectomy"
    ]
  }
];
