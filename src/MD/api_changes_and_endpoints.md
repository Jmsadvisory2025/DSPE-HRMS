# Recent Updates & API Documentation

## 1. Summary of Changes Made
1. **Email Template Update (`templates/emails/bulk_client_submission.html`)**: Removed the box styling, "Candidate Synopses" heading, and candidate names from the synopses section so that they only appear as simple text paragraphs.
2. **Job Status Update (`jobs/models.py`)**: Updated the `JobStatus` choices to explicitly include `open`, `ongoing`, `close`, and `hold`.
3. **Tracker Export Feature (`candidates/views_export.py`)**: Upgraded the `CandidateExportView` (`GET /api/v1/candidates/export/`) to accept comma-separated `application_ids` or `candidate_ids` so you can download CSV trackers for specifically selected rows.
4. **Client Reminder API (`candidates/views.py`)**: Added a new `client_reminder` action to `ApplicationViewSet` to handle bulk reminder submissions for selected applications.
5. **Client Reminder Background Task (`candidates/tasks.py`)**: Added the `simulate_bulk_client_reminder_email` function to dynamically build the reminder email, attach resumes, and route the email to the specific assigned client team member (or fallback to the main client).

---

## 2. API Endpoints

### A. Change Job Status
Use this to update the status of a job (e.g. from Open to Ongoing).

* **Method:** `PATCH`
* **URL:** `/api/v1/jobs/{job_id}/status/`
* **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer <your_token>"
  }
  ```
* **Request Body:**
  ```json
  {
    "status": "ongoing" 
  }
  ```
  *(Valid options: `open`, `ongoing`, `close`, `hold`)*
* **Success Response (200 OK):**
  ```json
  {
    "status": "ongoing"
  }
  ```

---

### B. Export Selected Trackers (CSV)
Use this to download the CSV tracker for the candidates/applications you have selected via checkboxes.

* **Method:** `GET`
* **URL:** `/api/v1/candidates/export/`
* **Query Parameters:**
  * `application_ids`: Comma-separated list of application UUIDs (Recommended).
  * `candidate_ids`: Comma-separated list of candidate UUIDs.
  * `job_id`: (Optional) The specific job UUID.
* **Example URL:**
  `/api/v1/candidates/export/?application_ids=uuid1,uuid2,uuid3`
* **Headers:**
  ```json
  {
    "Authorization": "Bearer <your_token>"
  }
  ```
* **Success Response (200 OK):**
  *Returns a downloadable Blob / CSV file (`candidates_export.csv`).*

---

### C. Send Client Reminder Mail
Use this when clicking the "Client Reminder" button after selecting specific candidates in the pending approvals queue.

* **Method:** `POST`
* **URL:** `/api/v1/candidates/applications/client-reminder/`
* **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer <your_token>"
  }
  ```
* **Request Body:**
  ```json
  {
    "application_ids": [
      "uuid-1", 
      "uuid-2"
    ],
    "header_color": "#f1f5f9",  // Optional
    "text_color": "#333333"     // Optional
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "message": "Successfully sent reminders for 2 applications to client.",
    "errors": []
  }
  ```
