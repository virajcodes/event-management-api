# Event Management API

This project is a Event Management REST API using Node.js, Express, and PostgreSQL. It allows creating events, user registration, cancellation, and viewing event statistics.

## Setup Instructions

1. **Clone the repository:**

   git clone https://github.com/yourusername/event-management-api.git
   cd event-management-api
  

2. **Install dependencies:**

   npm install

3. Create the PostgreSQL database:


5. **Create a `.env` file:**

   ```bash
   PORT=3000
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_DATABASE=event_db
   DB_PASSWORD=your_db_password
   DB_PORT=5432
   ```

6. **Run the server:**

   ```bash
   node index.js
   ```

   The API will run at `http://localhost:3000`.

---

## API Endpoints

### Events

* **POST /events** - Create an event
* **GET /events/\:id** - Get event details with registered users
* **POST /events/\:id/register** - Register a user for an event
* **DELETE /events/\:id/register/\:userId** - Cancel a user's registration
* **GET /events/upcoming** - List upcoming events sorted by date and location
* **GET /events/\:id/stats** - Get event statistics (registrations, capacity, percentage filled)

### Users

* **POST /users** - Create a user
* **GET /users/\:id** - Get user details

---

## Example Requests and Responses

### Create Event

**Request:**

```http
POST /events
Content-Type: application/json

{
  "title": "AI Conference",
  "datetime": "2025-12-31T10:00:00+05:30",
  "location": "Mumbai",
  "capacity": 200
}
```

**Response:**

```json
{
  "message": "Event created",
  "eventId": 1
}
```

### Register User for Event

**Request:**

```http
POST /events/1/register
Content-Type: application/json

{
  "userId": 1
}
```

**Response:**

```json
{
  "message": "User registered successfully"
}
```

### Get Upcoming Events

**Request:**

```http
GET /events/upcoming
```

**Response:**

```json
[
  {
    "id": 1,
    "title": "AI Conference",
    "datetime": "2025-12-31T04:30:00.000Z",
    "location": "Mumbai",
    "capacity": 200
  }
]
```

### Cancel User Registration

**Request:**

```http
DELETE /events/1/register/1
```

**Response:**

```json
{
  "message": "Registration cancelled"
}
```

### Get Event Statistics

**Request:**

```http
GET /events/1/stats
```

**Response:**

```json
{
  "eventId": 1,
  "title": "AI Conference",
  "totalRegistrations": 1,
  "remainingCapacity": 199,
  "percentageUsed": "0.50%"
}
```

---


