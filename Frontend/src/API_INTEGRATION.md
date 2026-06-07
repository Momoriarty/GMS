# API Integration Documentation

## Setup Frontend untuk API

### 1. Configure API URL
Buat file `.env` di folder Frontend:

```bash
VITE_API_URL=http://localhost:8000/api
```

### 2. Import Services
Di component yang membutuhkan API, import services:

```javascript
import { eventApi, jadwalApi, pendaftaranApi, klasemenApi, notifikasiApi, auditLogApi } from '@/data/services';
```

### 3. Contoh Penggunaan di Component

#### Fetch Events
```javascript
import { useState, useEffect } from 'react';
import { eventApi } from '@/data/services';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventApi.getAll()
      .then(res => setEvents(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.nama_event}</div>
      ))}
    </div>
  );
}
```

#### Create Event
```javascript
const handleCreateEvent = async (formData) => {
  try {
    const response = await eventApi.create(formData);
    if (response.data.success) {
      alert('Event berhasil dibuat');
      // Reload data
    }
  } catch (error) {
    console.error(error.response.data);
  }
};
```

#### Filter Jadwal by Event
```javascript
const jadwalByEvent = await jadwalApi.getAll({ event_id: 1 });
```

#### Verify Pendaftaran
```javascript
const verifyPendaftaran = async (id, status) => {
  try {
    const response = await pendaftaranApi.verify(id, status);
    // status: 'diterima' atau 'ditolak'
  } catch (error) {
    console.error(error);
  }
};
```

## Backend API Endpoints Reference

### Public Endpoints (No Auth Required)
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Protected Endpoints (Auth Required)

#### Events Management
- `GET /api/events` - Get all events
- `GET /api/events/{id}` - Get event details
- `POST /api/events` - Create new event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

#### Jadwal Pertandingan
- `GET /api/jadwal-pertandingan?event_id=1&status=terjadwal` - Filter jadwal
- `POST /api/jadwal-pertandingan` - Create jadwal
- `PUT /api/jadwal-pertandingan/{id}` - Update jadwal
- `DELETE /api/jadwal-pertandingan/{id}` - Delete jadwal

#### Hasil Pertandingan
- `GET /api/hasil-pertandingan?jadwal_id=1` - Get hasil
- `POST /api/hasil-pertandingan` - Input hasil
- `PUT /api/hasil-pertandingan/{id}` - Update hasil
- `DELETE /api/hasil-pertandingan/{id}` - Delete hasil

#### Pendaftaran
- `GET /api/pendaftaran?status=menunggu&event_id=1` - Get pendaftaran dengan filter
- `POST /api/pendaftaran` - Create pendaftaran
- `POST /api/pendaftaran/{id}/verify` - Verify (terima/tolak)
- `DELETE /api/pendaftaran/{id}` - Delete pendaftaran

#### Klasemen
- `GET /api/klasemen?event_id=1` - Get klasemen for event
- `POST /api/klasemen` - Create klasemen entry
- `PUT /api/klasemen/{id}` - Update klasemen

#### Notifikasi
- `GET /api/notifikasi?is_read=0` - Get unread notifications
- `POST /api/notifikasi` - Send notification (admin)
- `POST /api/notifikasi/{id}/read` - Mark as read
- `DELETE /api/notifikasi/{id}` - Delete notification

#### Audit Log
- `GET /api/audit-log?user_id=1&tabel=events&aksi=create&per_page=20` - Get logs with filters
- `POST /api/audit-log` - Create log entry (internal)

## Testing API

### Using Postman
1. Get token via login
2. Add header: `Authorization: Bearer {token}`
3. Test endpoints

### Using cURL
```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get Events (with token)
curl -X GET http://localhost:8000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

## Common HTTP Status Codes
- 200 - OK
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 404 - Not Found
- 422 - Unprocessable Entity
- 500 - Server Error

## Notes
- All timestamps are in UTC
- Date format: YYYY-MM-DD
- DateTime format: YYYY-MM-DD HH:mm:ss
- All IDs are integers (auto-increment)
