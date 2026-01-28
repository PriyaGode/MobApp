# Audit Log Dashboard (Story 2.1)

## User Story
As a Super Admin
I want to view all audit logs of system activities
So that I can trace who performed what action, where, and when.

## Acceptance Criteria Implemented

| Criterion | Implementation |
|-----------|----------------|
| Columns | User ID, Action Type, Timestamp, Hub/Region, IP Address, Action Summary (expandable) |
| Actions Logged | HUB_EDIT, PRODUCT_UPDATE, INVENTORY_TRANSFER, ORDER_MODIFICATION, USER_ROLE_CHANGE, USER_STATUS_CHANGE, LOGIN, LOGOUT, TICKET_ACTION, CONFIG_CHANGE |
| Default Sort | Newest first (createdAt DESC in service) |
| Pagination | `page` and `size` query params, Page metadata returned |
| Search | `search` param (matches summary, hub name, region, IP) |
| Filter by User ID | `userId` query param |
| Filter by Action Type | `actionType` enum query param |
| Date Range | `dateRange=YYYY-MM-DD,YYYY-MM-DD` OR separate `startDate` / `endDate` |
| API Endpoint | `GET /api/audit/logs` |
| Expand Row | Tap row arrow to show full action summary |
| Filter Panel | Modal launched via Filter button (userId, actionType chips, dates, search) |
| Audit Count Summary | `todayCount` returned; displayed as "X Actions Logged Today" |
| Scrollable Table | FlatList with custom header & row layout |

## Backend Components
- Entity: `AuditLog` (`id`, `userId`, `actionType`, `createdAt`, `hubName`, `hubRegion`, `ipAddress`, `actionSummary`)
- Enum: `AuditActionType`
- Repository: `AuditLogRepository` (+ today count via `countByCreatedAtBetween`)
- Specification: `AuditLogSpecification` for dynamic filtering
- Service: `AuditLogService` (record + fetch + countToday)
- Controller: `AuditLogController` (`/api/audit/logs`)

### Query Parameters
```
GET /api/audit/logs?userId=&actionType=&search=&dateRange=YYYY-MM-DD,YYYY-MM-DD&page=0&size=20
```
Alternative:
```
GET /api/audit/logs?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Response Shape
```json
{
  "content": [
    {
      "id": 10,
      "userId": "USR-1002",
      "actionType": "HUB_EDIT",
      "timestamp": "2025-11-25T09:31:12.123",
      "hubName": "West Hub",
      "hubRegion": "West",
      "ipAddress": "192.168.0.14",
      "actionSummary": "Updated hub capacity to 1200"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 245,
  "totalPages": 13,
  "hasNext": true,
  "hasPrevious": false,
  "todayCount": 37
}
```

## Frontend Components
- Screen: `AuditDashboardScreen.tsx`
  - Header with Filter button
  - Summary bar (today count)
  - Table header + paginated FlatList rows
  - Expandable summary area per row
  - Filter modal with chips + date fields + search
- Navigation: Registered in `App.tsx` as `AuditDashboard`; reachable from Super Admin dashboard header button.
- Service: `auditLogService.ts` exports `fetchAuditLogs` for future reuse.

## Usage Notes
1. Ensure backend is compiled and running.
2. Navigate: Super Admin Dashboard → Audit Logs button.
3. Apply filters; pagination updates on next/prev.

## Future Enhancements
- Persist filters in navigation params.
- Add export (CSV / JSON) endpoint.
- Add server-side sort override (actionType, hubName).
- Integrate real-time push of new audit entries via WebSocket.

## Quality Checklist
- [x] Endpoint returns paginated data sorted descending.
- [x] Today count included.
- [x] Filters work across userId, actionType, date range, search.
- [x] Frontend renders table & handles empty state.
- [x] Expandable row view for full summary.

## Verification Commands (Optional)
```powershell
# Backend compile
Set-Location -Path 'AAM_Backend'; .\mvnw.cmd compile

# Sample request (adjust host/IP)
Invoke-WebRequest "http://localhost:8080/api/audit/logs?page=0&size=5" | Select-Object -ExpandProperty Content
```
