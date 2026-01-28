# ADI AAM - Application Management Platform 🚀

A comprehensive React Native + Spring Boot application for managing support tickets, orders, deliveries, and customer interactions.

## � Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Features](#features)
- [Communication & Support Module](#communication--support-module)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🎯 Overview

ADI AAM is a full-stack application designed for managing customer support operations, including ticket management, real-time updates, file attachments, and team collaboration.

**Current Status:** Communication & Support Module **100% Complete** ✅

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** React Native with Expo SDK 54
- **Language:** TypeScript
- **UI Components:** React Native core components
- **Icons:** @expo/vector-icons (Ionicons)
- **Navigation:** React Navigation
- **File Upload:** expo-document-picker v14.0.7
- **HTTP Client:** Axios
- **Real-time:** WebSocket client

### Backend

- **Framework:** Spring Boot 3.2.0
- **Language:** Java 25
- **Database:** PostgreSQL (Neon)
- **ORM:** Hibernate/JPA
- **Real-time:** WebSocket (Spring WebSocket)
- **Build Tool:** Maven 3.9.11
- **Server:** Apache Tomcat (embedded)

---

## 📁 Project Structure

```
adi_aam/
├── AAM_Frontend/          # React Native application
│   ├── components/        # Reusable UI components
│   │   ├── AddNoteModal.tsx
│   │   ├── AssignTicketModal.tsx
│   │   └── AttachmentUploadModal.tsx
│   ├── screens/          # Screen components
│   │   ├── SupportDashboard.tsx
│   │   ├── TicketDetailScreen.tsx
│   │   └── TicketDetailScreenEnhanced.tsx
│   ├── services/         # API and WebSocket services
│   │   ├── supportTicketService.ts
│   │   └── websocketService.ts
│   ├── config/           # Configuration files
│   │   └── api.config.ts
│   └── types/            # TypeScript type definitions
│
├── AAM_Backend/          # Spring Boot application
│   └── src/main/java/com/app/support/
│       ├── model/        # JPA entities
│       │   ├── SupportTicket.java
│       │   ├── TicketAttachment.java
│       │   └── TicketActivityLog.java
│       ├── repository/   # Data access layer
│       ├── service/      # Business logic
│       │   ├── SupportTicketService.java
│       │   ├── FileStorageService.java
│       │   └── TicketActivityLogService.java
│       ├── controller/   # REST endpoints
│       │   ├── SupportTicketController.java
│       │   └── DevelopmentDataController.java
│       ├── config/       # Configuration
│       │   └── WebSocketConfig.java
│       └── websocket/    # WebSocket handlers
│
└── Documentation/        # Project documentation
    ├── SUPPORT_MODULE_COMPLETE.md
    ├── SUPPORT_MODULE_STATUS.md
    ├── SUPPORT_MODULE_TESTING_GUIDE.md
    └── WEBSOCKET_FIX.md
```

---

## 🚀 Getting Started

### Test Credentials

#### Superadmin Login
- **Email:** `admin@amraj.com`
- **Password:** `admin`
- **Access:** Full admin dashboard with 7 tabs (Home, Orders, Tickets, Products, Hubs, Users, Profile)

#### Customer Login
- Register a new account through the app
- Or use existing test customer credentials from your database

---

### Prerequisites

- **Node.js** 18+ and npm
- **Java** 17+ (JDK)
- **Maven** 3.8+
- **Expo Go** app (for mobile testing)
- **PostgreSQL** database (or use provided Neon instance)

### Frontend Setup

```bash
cd AAM_Frontend

# Install dependencies
npm install

# Start development server
npm start
# or
npx expo start

# Scan QR code with Expo Go app
```

### Backend Setup

```bash
cd AAM_Backend

# Compile project
mvn compile

# Run application
mvn spring-boot:run

# Server starts on http://localhost:8080
```

### Generate Test Data

```bash
# Generate 50 dummy support tickets
curl -X POST http://localhost:8080/api/support/dev/generate-tickets

# Clear all tickets (if needed)
curl -X POST http://localhost:8080/api/support/dev/clear-tickets
```

### Configuration

**Frontend:** Update `AAM_Frontend/config/api.config.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: "http://YOUR_IP:8080", // Use your machine's IP
  WEBSOCKET_URL: "ws://YOUR_IP:8080/ws/tickets",
  // For Android emulator: http://10.0.2.2:8080
  // For iOS simulator: http://localhost:8080 (or machine IP)
};
```

**Backend:** Update `AAM_Backend/src/main/resources/application.properties`

```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://YOUR_DB_HOST:5432/YOUR_DB
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

---

## ✨ Features

### Current Features (v1.0)

#### 1. Support Ticket Management

- Create, view, update, and delete support tickets
- Ticket priorities: LOW, MEDIUM, HIGH, URGENT
- Ticket statuses: OPEN, IN_PROGRESS, PENDING, RESOLVED, CLOSED
- Categories: Order Issue, Delivery Problem, Payment Issue, etc.

#### 2. Dashboard

- Real-time ticket list with filtering and sorting
- Badge counters (Open, In Progress, Closed, Total)
- Advanced filters (status, priority, hub, assignee)
- Sort options (newest, priority, oldest)
- Swipeable ticket cards with quick actions

#### 3. Ticket Assignment

- Assign tickets to support staff or hubs
- Change priority during assignment
- Add assignment comments
- Activity logging for audit trail

#### 4. Notes & Collaboration

- Add text notes to tickets
- Chat-style notes timeline with timestamps
- Character validation (10-1000 characters)
- Real-time note updates via WebSocket

#### 5. File Attachments

- Upload images (JPEG, PNG, GIF, WebP) and PDFs
- 10MB file size limit with validation
- Image preview and PDF icon display
- Attachment gallery in ticket details
- Optional file descriptions

#### 6. Real-Time Updates

- WebSocket connection for live updates
- Instant notification of ticket changes
- Auto-reconnection (3 attempts)
- 2-minute background refresh

#### 7. Activity Logging

- Complete audit trail of all actions
- Track status changes, assignments, notes, attachments
- Timestamp and user tracking for compliance

---

## 🎫 Communication & Support Module

### Overview

The Communication & Support module is a complete ticketing system that enables teams to manage customer support requests efficiently. It includes real-time collaboration, file attachments, and comprehensive filtering.

### User Stories Implemented

#### ✅ User Story 9.1 – View Support Dashboard

View all support tickets with filtering, sorting, and real-time updates.

**Features:**

- Ticket list with all details (ID, raised by, assigned to, priority, status, hub, date)
- Badge counters for quick status overview
- Filters by status and priority
- Sort by newest, priority, or oldest
- Swipe actions for quick operations
- Pull-to-refresh

#### ✅ User Story 9.2 – Ticket Details Page

View complete ticket information including notes timeline and attachments.

**Features:**

- Full ticket metadata display
- Chat-style notes timeline
- Attachment gallery with previews
- Status change capability
- Resolution tracking
- Floating action buttons for quick access

#### ✅ User Story 9.3 – Assign Ticket Modal

Assign or reassign tickets to support staff with notifications.

**Features:**

- Assignee dropdown selection
- Priority adjustment
- Assignment comments
- Real-time broadcast to team
- Activity logging

#### ✅ User Story 9.4 – Add Notes & Attachments

Maintain detailed resolution history with notes and files.

**Features:**

- Text notes with validation
- Image and PDF upload
- File size and type validation
- Preview functionality
- Real-time updates

#### ✅ User Story 9.5 – Update Ticket Status

Manage ticket lifecycle from open to closed.

**Features:**

- Status transition controls
- Confirmation dialogs
- Activity logging
- Real-time broadcast
- Visual status indicators

### Quick Start Guide

1. **Start the backend:**

   ```bash
   cd AAM_Backend && mvn spring-boot:run
   ```

2. **Generate test data:**

   ```bash
   curl -X POST http://localhost:8080/api/support/dev/generate-tickets
   ```

3. **Start the frontend:**

   ```bash
   cd AAM_Frontend && npm start
   ```

4. **Test the features:**
   - View 50 pre-generated tickets
   - Filter by status and priority
   - Swipe left on tickets for actions
   - Assign tickets to support staff
   - Add notes and upload attachments
   - View real-time updates

### Documentation

- **Complete Guide:** [SUPPORT_MODULE_COMPLETE.md](./SUPPORT_MODULE_COMPLETE.md)
- **Status Report:** [SUPPORT_MODULE_STATUS.md](./SUPPORT_MODULE_STATUS.md)
- **Testing Guide:** [SUPPORT_MODULE_TESTING_GUIDE.md](./SUPPORT_MODULE_TESTING_GUIDE.md)
- **WebSocket Setup:** [WEBSOCKET_FIX.md](./WEBSOCKET_FIX.md)

---

## 📡 API Documentation

### Base URL

```
http://localhost:8080/api/support
```

### Endpoints

#### Tickets

| Method | Endpoint               | Description                  |
| ------ | ---------------------- | ---------------------------- |
| GET    | `/tickets`             | Get all tickets with filters |
| GET    | `/tickets/{id}`        | Get ticket by ID             |
| POST   | `/tickets`             | Create new ticket            |
| PUT    | `/tickets/{id}`        | Update ticket                |
| PATCH  | `/tickets/{id}/status` | Update ticket status         |
| DELETE | `/tickets/{id}`        | Delete ticket                |

#### Filtering & Stats

| Method | Endpoint                         | Description              |
| ------ | -------------------------------- | ------------------------ |
| GET    | `/tickets/status/{status}`       | Filter by status         |
| GET    | `/tickets/assigned/{assignedTo}` | Filter by assignee       |
| GET    | `/tickets/stats`                 | Get dashboard statistics |

#### Assignment

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| PUT    | `/tickets/{id}/assign` | Assign ticket to user |

#### Notes

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| POST   | `/tickets/{id}/notes` | Add note to ticket |

#### Attachments

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| POST   | `/tickets/{id}/attachments`   | Upload attachment      |
| GET    | `/tickets/{id}/attachments`   | Get ticket attachments |
| DELETE | `/attachments/{attachmentId}` | Delete attachment      |

#### Development

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/dev/generate-tickets` | Generate 50 test tickets |
| POST   | `/dev/clear-tickets`    | Clear all tickets        |

### Example Requests

**Get filtered tickets:**

```bash
curl "http://localhost:8080/api/support/tickets?status=OPEN&priority=HIGH&sort=newest"
```

**Get dashboard stats:**

```bash
curl http://localhost:8080/api/support/tickets/stats
```

**Assign ticket:**

```bash
curl -X PUT http://localhost:8080/api/support/tickets/1/assign \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": "support_001",
    "assignedToName": "Support Agent A",
    "priority": "HIGH",
    "comment": "Urgent issue"
  }'
```

### WebSocket

**Endpoint:** `ws://localhost:8080/ws/tickets`

**Events:**

- `connection` - Connection established
- `ticket_update` - Ticket modified
- `note_added` - Note added to ticket
- `attachment_uploaded` - File attached to ticket

---

## 💻 Development

### Frontend Development

```bash
cd AAM_Frontend

# Install dependencies
npm install

# Start with cleared cache
npm start -- --clear

# Run on specific platform
npm run android
npm run ios
npm run web
```

### Backend Development

```bash
cd AAM_Backend

# Compile only
mvn compile

# Run tests
mvn test

# Package application
mvn package

# Run with live reload
mvn spring-boot:run
```

### Code Style

**Frontend:**

- TypeScript with strict mode
- ESLint for code quality
- Prettier for formatting

**Backend:**

- Java code conventions
- Spring Boot best practices
- JPA/Hibernate patterns

---

## 🧪 Testing

### Quick Test (5 minutes)

1. ✅ Backend running on port 8080
2. ✅ Dummy data generated (50 tickets)
3. ✅ Frontend connects to backend
4. ✅ WebSocket connection established
5. ✅ Dashboard shows tickets with badge counters
6. ✅ Filters work (status and priority)
7. ✅ Swipe actions functional
8. ✅ Assign modal saves successfully
9. ✅ Notes can be added
10. ✅ Attachments upload correctly

### Comprehensive Testing

Follow the detailed test plan in [SUPPORT_MODULE_TESTING_GUIDE.md](./SUPPORT_MODULE_TESTING_GUIDE.md)

**Test Coverage:**

- Dashboard functionality (5 min)
- Swipe actions (3 min)
- Ticket assignment (2 min)
- Note creation (2 min)
- File upload (3 min)
- Ticket details (5 min)
- Real-time updates (3 min)

---

## 🚀 Deployment

### Backend Deployment

**Requirements:**

- Java 17+ runtime
- PostgreSQL database
- 512MB RAM minimum

**Steps:**

```bash
# Package application
cd AAM_Backend
mvn clean package

# Run JAR file
java -jar target/user-api-0.0.1-SNAPSHOT.jar

# Or use Docker
docker build -t aam-backend .
docker run -p 8080:8080 aam-backend
```

### Frontend Deployment

**Build for Production:**

```bash
cd AAM_Frontend

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for web
npx expo export:web
```

### Environment Configuration

**Production Backend:**

- Update database credentials
- Configure CORS allowed origins
- Set up cloud storage (AWS S3 or Azure Blob)
- Enable HTTPS
- Configure push notifications (Firebase)

**Production Frontend:**

- Update API_CONFIG with production URLs
- Use WSS (secure WebSocket)
- Configure app signing
- Set up analytics

---

## 📊 Database Schema

### SupportTicket Table

```sql
CREATE TABLE support_tickets (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  category VARCHAR(255) NOT NULL,
  hub_region VARCHAR(255),
  assigned_to VARCHAR(255),
  assigned_to_name VARCHAR(255),
  raised_by_name VARCHAR(255),
  raised_by_role VARCHAR(255),
  resolution TEXT,
  notes TEXT,
  attachments TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  resolved_at TIMESTAMP
);
```

### TicketAttachment Table

```sql
CREATE TABLE ticket_attachments (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL,
  file_name VARCHAR(255),
  file_url TEXT,
  file_type VARCHAR(100),
  file_size BIGINT,
  uploaded_by VARCHAR(255),
  uploaded_by_role VARCHAR(100),
  uploaded_at TIMESTAMP,
  description TEXT,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id)
);
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software owned by ORIGIN-HUBS.

---

## 🆘 Support & Troubleshooting

### Common Issues

**WebSocket Connection Failed:**

- Check backend is running: `lsof -ti:8080`
- Verify IP address in `api.config.ts`
- Ensure devices are on same network
- See [WEBSOCKET_FIX.md](./WEBSOCKET_FIX.md)

**Backend Won't Start:**

- Port already in use: `lsof -ti:8080 | xargs kill -9`
- Database connection issues: Check `application.properties`
- Maven build errors: Run `mvn clean install`

**File Upload Fails:**

- File > 10MB: Use smaller file
- Wrong file type: Only images and PDFs supported
- Backend not running: Start Spring Boot server

### Need Help?

- Check documentation in `/Documentation` folder
- Review test guides for step-by-step instructions
- Check backend logs for error messages
- Verify WebSocket connection status in app console

---

## 📝 Version History

### v1.0.0 (Current) - November 11, 2025

- ✅ Communication & Support Module complete
- ✅ 5 user stories fully implemented
- ✅ 18 REST API endpoints
- ✅ Real-time WebSocket updates
- ✅ File upload with validation
- ✅ Activity logging and audit trail
- ✅ 50 dummy tickets for testing

### Upcoming Features

- User authentication and authorization
- Role-based access control
- Push notifications (Firebase)
- Cloud storage integration (AWS S3/Azure Blob)
- Analytics dashboard
- Email notifications
- Search functionality
- Export features (CSV, PDF)

---

## 📞 Contact

**Project:** ADI AAM  
**Repository:** [ORIGIN-HUBS/adi_aam](https://github.com/ORIGIN-HUBS/adi_aam)  
**Branch:** feature/ASA-KB

---

## 🎯 Project Status

| Module                  | Status         | Completion |
| ----------------------- | -------------- | ---------- |
| Communication & Support | ✅ Complete    | 100%       |
| User Authentication     | 🔨 In Progress | 60%        |
| Order Management        | 📋 Planned     | 0%         |
| Delivery Tracking       | 📋 Planned     | 0%         |

**Overall Progress:** 25% Complete

---

Made with ❤️ by ORIGIN-HUBS Team

**Port Configuration**
- **Superadmin_Backend:** `http://localhost:8083`
- **CustomerPortal_Backend:** `http://localhost:8081`
- **Superadmin_Frontend:** `http://localhost:19000` (Metro bundler)
- **CustomerPortal_Frontend:** `http://localhost:19001` (Metro bundler)
- Both backends share the same Neon Postgres database but run on different ports to avoid conflicts.

**Data Safety**
- **No auto-DDL:** Both backends use `spring.jpa.hibernate.ddl-auto=none`. Startup will not create/drop tables.
- **No auto-migrations:** `Superadmin_Backend` has `app.migration.enabled=false` and no Flyway/Liquibase dependencies. SQL files under `src/main/resources/db/migration` are not executed automatically.
- **Backup first:** Use `scripts/backup_postgres.sh` to snapshot the Neon Postgres DB before runs.
  - Example:
    - `./scripts/backup_postgres.sh --url "jdbc:postgresql://ep-round-butterfly-ahe9b8oh-pooler.c-3.us-east-1.aws.neon.tech:5432/neondb?sslmode=require" --user neondb_owner --password <PASSWORD>`
  - Output is saved under `backups/` as `<dbname>_<timestamp>.sql`.
- **Do not run manual SQL alter scripts** (e.g., `apply_foreign_key_complete.sh`) unless you intend to change schema; these are manual and safe by default because they are not invoked by app startup.
