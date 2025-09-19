# Event Logging Implementation for web_14_autohealth

## ✅ Implementation Complete

I've successfully implemented a comprehensive event logging system for web_14_autohealth, similar to the one in web_3_autozone. Here's what was implemented:

### 📁 Files Created/Modified

1. **`src/library/events.ts`** - Event types and logging utility
2. **`src/app/api/log-event/route.ts`** - API endpoint for event logging
3. **`src/components/event-button.tsx`** - Updated to use proper event logging
4. **All page components** - Updated with event logging

### 🎯 Event Types Implemented

#### Appointment Events
- `BOOK_APPOINTMENT` - When user books an appointment
- `VIEW_APPOINTMENT` - When user views appointment details
- `CANCEL_APPOINTMENT` - When user cancels an appointment
- `RESCHEDULE_APPOINTMENT` - When user reschedules an appointment

#### Prescription Events
- `VIEW_PRESCRIPTION` - When user views prescription details
- `REFILL_PRESCRIPTION` - When user requests prescription refill
- `DOWNLOAD_PRESCRIPTION` - When user downloads prescription

#### Doctor Events
- `VIEW_DOCTOR_PROFILE` - When user views doctor profile
- `SEARCH_DOCTORS` - When user searches for doctors
- `FILTER_DOCTORS` - When user filters doctors

#### Navigation Events
- `NAVIGATE_TO_APPOINTMENTS` - Navigation to appointments page
- `NAVIGATE_TO_PRESCRIPTIONS` - Navigation to prescriptions page
- `NAVIGATE_TO_DOCTORS` - Navigation to doctors page
- `NAVIGATE_TO_HOME` - Navigation to home page

#### Health Data Events
- `UPLOAD_HEALTH_DATA` - When user uploads medical records
- `VIEW_HEALTH_METRICS` - When user views health data
- `EXPORT_HEALTH_DATA` - When user exports health data

### 🔧 Components Updated

#### 1. EventButton Component
- Now uses proper event types from `EVENT_TYPES`
- Automatically logs events with payload data
- Type-safe event handling

#### 2. Page Components
- **Appointments Page**: Logs `BOOK_APPOINTMENT` with appointment details
- **Prescriptions Page**: Logs `VIEW_PRESCRIPTION` with prescription data
- **Doctors Page**: Logs `VIEW_DOCTOR_PROFILE` and `BOOK_APPOINTMENT`
- **Doctor Profile Page**: Logs `BOOK_APPOINTMENT` with contact action
- **Medical Records Page**: Logs `UPLOAD_HEALTH_DATA` and `VIEW_HEALTH_METRICS`
- **Home Page**: Logs navigation events for all cards and CTA buttons
- **Navbar**: Logs navigation events for all links

### 📊 Event Data Structure

Each event includes:
```typescript
{
  event_name: string,        // Event type (e.g., "BOOK_APPOINTMENT")
  web_agent_id: string,      // From headers
  user_id: string | null,    // From localStorage
  data: {                    // Event-specific data
    // Appointment data, doctor info, etc.
  },
  timestamp: string          // ISO timestamp
}
```

### 🚀 How It Works

1. **Client-side**: Events are logged using `logEvent()` function
2. **API Route**: `/api/log-event` receives and validates events
3. **Backend Integration**: Events are forwarded to backend at `API_URL/save_events/`
4. **Error Handling**: Graceful fallback if backend is unavailable

### 🧪 Testing

#### Manual Testing Steps

1. **Deploy the application**:
   ```bash
   bash scripts/setup.sh --demo=autohealth --web_port=8014
   ```

2. **Test Event Logging**:
   - Navigate between pages (check console for navigation events)
   - Book appointments (check for `BOOK_APPOINTMENT` events)
   - View prescriptions (check for `VIEW_PRESCRIPTION` events)
   - Upload medical records (check for `UPLOAD_HEALTH_DATA` events)
   - View doctor profiles (check for `VIEW_DOCTOR_PROFILE` events)

3. **Verify Event Data**:
   - Check browser console for logged events
   - Verify API calls to `/api/log-event`
   - Check backend logs for received events

#### Expected Event Flow

```
User Action → logEvent() → /api/log-event → Backend API → Database
```

### 🔍 Event Examples

#### Booking an Appointment
```javascript
logEvent(EVENT_TYPES.BOOK_APPOINTMENT, {
  appointmentId: "apt-1",
  doctorName: "Dr. Smith",
  specialty: "Cardiology",
  date: "2024-01-15",
  time: "10:00 AM"
});
```

#### Viewing Doctor Profile
```javascript
logEvent(EVENT_TYPES.VIEW_DOCTOR_PROFILE, {
  doctorId: "doc-1",
  doctorName: "Dr. Johnson",
  specialty: "Dermatology",
  rating: 4.8
});
```

#### Uploading Medical Records
```javascript
logEvent(EVENT_TYPES.UPLOAD_HEALTH_DATA, {
  files: [
    { name: "lab-results.pdf", type: "application/pdf", size: 1024000 }
  ]
});
```

### 🎉 Benefits

1. **Comprehensive Tracking**: All user interactions are logged
2. **Rich Context**: Events include relevant data for analysis
3. **Type Safety**: TypeScript ensures correct event usage
4. **Backend Integration**: Seamless integration with existing backend
5. **Error Resilience**: Graceful handling of network issues
6. **Easy Extension**: Simple to add new event types

### 🔧 Configuration

The system uses the same backend integration as web_3_autozone:
- `API_URL` environment variable points to backend
- Events are sent to `/save_events/` endpoint
- Includes web agent ID and user ID tracking

The implementation is now complete and ready for testing! 🚀
