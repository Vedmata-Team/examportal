# Exam Portal - Role Credentials & Permissions

This document outlines the standard test credentials for the various hierarchical roles within the ExamPlatform ecosystem. Use these credentials to test the platform functionally during development.

> [!NOTE]
> All passwords are standard for testing environments. Ensure you replace these or use your authentication provider (Clerk) to set up actual secured accounts for production.

## Standard Test Password
**Password for all test accounts:** `Password@123`

---

## 1. Central Administrator (Super Admin)
**Email:** `central@examportal.com`
**Role:** `CENTRAL`

### Capabilities
- **Global Oversight:** Complete visibility into every state, district, and institution across the platform.
- **System Configuration:** Manage global exam settings, grading schemas, and curriculum boards (CBSE, ICSE, State Boards).
- **User Management:** Create, suspend, or modify State and District Administrator accounts.
- **Analytics:** Access national-level performance metrics, test delivery success rates, and active user tracking out of the 850k+ student base.

---

## 2. State Administrator
**Email:** `state@examportal.com`
**Role:** `STATE`

### Capabilities
- **Regional Oversight:** Manage operations for an entire state's educational ecosystem.
- **District Management:** Create and oversee District Administrator accounts within their jurisdiction.
- **State-wide Assessments:** Deploy state-level mock tests or standardized exams.
- **Performance Tracking:** View aggregated results and engagement metrics across all districts in the state.

---

## 3. District Administrator
**Email:** `district@examportal.com`
**Role:** `DISTRICT`

### Capabilities
- **District Oversight:** Manage operations for schools and institutions within a specific district.
- **Institution Management:** Onboard new schools/colleges and create Institution Admin accounts.
- **District-wide Exams:** Schedule and deploy district-level benchmarks.
- **Support & Compliance:** Monitor institution compliance with examination protocols and security lockdowns.

---

## 4. Institution Administrator (School/College Admin)
**Email:** `institution@examportal.com`
**Role:** `INSTITUTION`

### Capabilities
- **Curriculum Setup:** Define classes (Class 6-12), sections, and map students to their designated cohorts.
- **Content Authoring:** Create chapters, study guides, and localized quizzes using the rich-text editor.
- **Exam Proctoring:** Deploy secure quizzes, activate lockdown modes, and view real-time proctoring audit logs.
- **Student Management:** Manage individual student accounts and reset passwords.
- **Reporting:** Instantly generate and distribute performance reports to students and parents.

---

## 5. Student
**Email:** `student@examportal.com`
**Role:** `STUDENT`

### Capabilities
- **Learning Dashboard:** Access assigned chapters, practice quizzes, and study material mapped to their current class.
- **Timed Assessments:** Take secure mock tests and participate in national/state/district-level standardized tests.
- **Instant Analysis:** View real-time exam results, correct/incorrect breakdowns, and review historical performance tracking.
- **Profile Management:** Manage their personal learning journey and credentials securely.

---
> [!IMPORTANT]
> Because the application currently utilizes Clerk for authentication, these accounts do not automatically exist. To use them, you will need to manually sign up these email addresses in your local frontend, and then access your Clerk Dashboard to assign the exact string (e.g., `CENTRAL`, `INSTITUTION`) to each user's `publicMetadata.role`. This ensures the application routes users correctly to `/admin/dashboard` or `/student/dashboard`.
