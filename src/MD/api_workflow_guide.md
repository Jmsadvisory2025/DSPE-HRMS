# Interview Scheduling Workflow - API Guide

Here is the step-by-step process of the new interview scheduling workflow, complete with API endpoints, request bodies, and their expected responses for Postman.

> [!NOTE]
> All endpoints below require the `Application ID` in the URL (represented as `{id}`). You can get this ID from the `GET /api/v1/candidates/applications/` API.

---

### Step 1: Manager Moves Candidate to "Interview" Stage
The Manager reviews the application and moves the candidate to the Interview stage. 
- **Endpoint**: `POST /api/v1/candidates/applications/{id}/move-stage/`
- **What Happens**: The candidate's stage is updated. The backend automatically triggers an **in-app notification** and an **email alert** to the assigned Recruiter.
- **Request Body**:
  ```json
  {
      "stage_id": "uuid-of-the-interview-stage"
  }
  ```
- **Expected Response (200 OK)**:
  Returns the full `ApplicationDetail` object reflecting the new stage.
  ```json
  {
      "id": "b477d056-31a1-4dee-821e-325b4b093655",
      "status": "screening",
      "current_stage": {
          "id": "uuid-of-the-interview-stage",
          "name": "First Interview"
      },
      "...": "..." 
  }
  ```

---

### Step 2: Recruiter Proposes an Interview Schedule
The Recruiter coordinates with the candidate and submits the proposed interview date, time, and mode.
- **Endpoint**: `POST /api/v1/candidates/applications/{id}/schedule-interview/`
- **What Happens**: The schedule is saved with `manager_approval_status = "pending"`. An **email is sent to the Manager** asking them to review and approve the proposed schedule.
- **Request Body**:
  ```json
  {
      "date": "2026-08-15",
      "time": "14:30:00",
      "mode": "online",
      "interviewer_name": "Jane Doe", 
      "notes": "First technical round"
  }
  ```
- **Expected Response (201 Created)**:
  Returns the newly created Interview Schedule object.
  ```json
  {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-123456789abc",
      "date": "2026-08-15",
      "time": "14:30:00",
      "mode": "online",
      "interviewer_name": "Jane Doe",
      "notes": "First technical round",
      "manager_approval_status": "pending",
      "attendance_status": "pending",
      "created_at": "2026-08-13T10:00:00Z"
  }
  ```

---

### Step 3: Manager Approves or Rejects the Schedule
The Manager reviews the proposed time and either approves or rejects it.
- **Endpoint**: `POST /api/v1/candidates/applications/{id}/approve-interview-schedule/`
- **What Happens**: The `manager_approval_status` is updated. An **email alert is sent back to the Recruiter** with the result. If approved, the system also schedules interview reminders.
- **Request Body**:
  ```json
  {
      "status": "approved"
  }
  ```
  *(Valid values: `"approved"`, `"rejected"`)*
- **Expected Response (200 OK)**:
  ```json
  {
      "message": "Interview schedule approved"
  }
  ```

---

### Step 4: Resubmission Flow (If Rejected or Rescheduled)
If the Manager rejects the proposed schedule or if the candidate requires a reschedule, the Recruiter simply repeats **Step 2** using the exact same endpoint.
- **Endpoint**: `POST /api/v1/candidates/applications/{id}/schedule-interview/`
- **What Happens**: The existing interview record is updated. The system resets the `manager_approval_status` and `attendance_status` back to `"pending"`, and **a fresh approval request email is sent to the Manager**.
- **Request Body & Response**: (Exactly the same as Step 2)

---

### Step 5: Recruiter Sends Interview Details to Client (Optional)
If the job is for a client, the Recruiter manually triggers the system to send the finalized interview details to the client's email.
- **Endpoint**: `POST /api/v1/candidates/applications/{id}/send-interview-to-client/`
- **What Happens**: An **email containing the interview schedule and candidate details is sent to the Client**.
- **Request Body**:
  ```json
  {}
  ```
- **Expected Response (200 OK)**:
  ```json
  {
      "message": "Interview details sent to client successfully"
  }
  ```

---

### Step 6: Recruiter Updates Interview Attendance
After the interview time has passed, the Recruiter logs whether the candidate attended the interview.
- **Endpoint**: `POST /api/v1/candidates/applications/{id}/update-interview-attendance/`
- **What Happens**: The `attendance_status` is updated. An **email alert is immediately sent to the Manager** informing them of the attendance status.
- **Request Body**:
  ```json
  {
      "status": "attended"
  }
  ```
  *(Valid values: `"pending"`, `"attended"`, `"no-show"`, `"reschedule-requested"`)*
- **Expected Response (200 OK)**:
  ```json
  {
      "message": "Attendance status updated to attended"
  }
  ```
