# Use Case Logged Data (Autohealth)

Reference document for which data is sent in `logEvent(EVENT_TYPES.XXX, data)` for each use case. Use this to align frontend payloads with benchmark constraints.

---

## Reglas

1. **No usar nunca:** `source`, `appointmentId`, `doctorId`, `success`, `action`. No enviar ni validar estos campos.
2. **Objeto como fuente:** Cuando haya datos de doctor, appointment, prescription o medical record, enviar el **objeto** (`doctor`, `appointment`, `prescription`, `record`) y obtener los campos a través de él. No duplicar campos planos (p. ej. `doctorName`, `doctorId`, `specialty`) en el payload cuando ya se envía el objeto; el backend obtiene esos valores del objeto.

---

## Appointments

| Use case | File | Payload fields |
|----------|------|----------------|
| **OPEN_APPOINTMENT_FORM** | `src/app/appointments/page.tsx` | `appointment`, `doctor` (opcional). Campos derivados del objeto en backend. |
| **APPOINTMENT_BOOKED_SUCCESSFULLY** | `src/components/appointment-booking-modal.tsx` | `appointment`, `patientName`, `patientEmail`, `patientPhone`, `reasonForVisit`, `insuranceProvider`, `insuranceNumber`, `hasInsurance`, `emergencyContact`, `emergencyPhone`, `hasEmergencyContact`, `notes`, `hasNotes`, `bookingTimestamp`. Campos de cita desde `appointment`. |
| **REQUEST_QUICK_APPOINTMENT** | `src/components/quick-appointment-hero.tsx` | `patientName`, `patientEmail`, `patientPhone`, `specialty` |
| **SEARCH_APPOINTMENT** | `src/app/appointments/page.tsx` | `filterType`, y según filtro: `doctor` (objeto), `specialty`, `date` |

---

## Doctors

| Use case | File | Payload fields |
|----------|------|----------------|
| **SEARCH_DOCTORS** | `src/app/doctors/page.tsx` | `searchTerm`, `specialty`, `doctors` |
| **VIEW_DOCTOR_PROFILE** | `src/app/doctors/page.tsx` | `doctor` (objeto). Campos desde `doctor`. |
| **VIEW_DOCTOR_EDUCATION** | `src/app/doctors/[id]/doctor-profile-client.tsx` | `doctor` (objeto). Campos desde `doctor`. |
| **OPEN_CONTACT_DOCTOR_FORM** | `src/app/doctors/[id]/doctor-profile-client.tsx` | `doctor` (objeto). Campos desde `doctor`. |
| **CONTACT_DOCTOR** | `src/components/contact-doctor-modal.tsx` | `doctor` (objeto), `patientName`, `patientEmail`, `patientPhone`, `subject`, `message`, `urgency`, `preferredContactMethod`, `appointmentRequest`. No `success`. |
| **FILTER_DOCTOR_REVIEWS** | `src/components/doctor-reviews-modal.tsx` | `doctor` (opcional), `filterRating`, `sortOrder`. Campos de doctor desde `doctor`. |

---

## Prescriptions

| Use case | File | Payload fields |
|----------|------|----------------|
| **SEARCH_PRESCRIPTION** | `src/app/prescriptions/page.tsx` | `medicine`, `doctor` (on Search click). |
| **VIEW_PRESCRIPTION** | `src/app/prescriptions/page.tsx` | `prescription` (objeto). Campos desde `prescription`. |
| **REFILL_PRESCRIPTION** | `src/app/prescriptions/page.tsx` | `prescription` (objeto). Campos desde `prescription`. |

---

## Health data

| Use case | File | Payload fields |
|----------|------|----------------|
| **SEARCH_MEDICAL_ANALYSIS** | `src/app/medical-records/page.tsx` | `source`, `action`, `title`, `doctor` (on Search click). |
| **VIEW_MEDICAL_ANALYSIS** | `src/app/medical-records/page.tsx` | `record` (objeto), `recordId`, `title`, `type`, `date`, `doctorName`, `status`, `category`. |

---

## Campos a mantener (opcional)

*(Indica aquí qué campos quieres conservar por use case cuando restrinjas datos.)*

---

## Cómo usar este documento

1. **Consultar:** Usa las tablas para ver qué datos se envían en cada `logEvent`.
2. **Restringir datos:** Indica el use case y los campos a mantener; se actualizará el doc y el código (frontend y, si aplica, backend).
