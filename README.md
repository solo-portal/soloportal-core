# SoloPortal Lite 📅💳

A lightweight, streamlined booking and payment platform designed for freelancers, consultants, and independent professionals.

> **خلاصه:** هدف این پروژه، ساده‌سازی فرایند رزرو و پرداخت آنلاین برای فریلنسرهاست تا بدون درگیری با هماهنگی‌های دستی و چت‌های طولانی، جلسات خود را مدیریت کنند.

---

## 📌 Project Overview

**SoloPortal Lite** empowers freelancers to set up a clean, dedicated booking page where clients can explore services, check transparent pricing, view real-time availability on a Jalali (Shamsi) calendar, and reserve appointments with instant online payment verification.

The platform eliminates double-booking issues through reliable database-level concurrency control, while keeping the architecture lightweight and maintainable for academic presentation and real-world portfolio use.

---

## ✨ Features

* **Public Freelancer Profiles:** Dedicated landing page displaying personal bio, offerings, and direct booking options. *(پروفایل اختصاصی فریلنسر)*
* **Service & Pricing Management:** Create, update, and manage services with customizable rates and durations.
* **Availability & Working Hours:** Configure weekly schedules, active hours, and appointment buffers.
* **Smart Time-Slot Locking:** Prevents overlapping appointments by temporarily reserving selected slots during checkout.
* **Lazy Expiration Mechanism:** Unpaid bookings automatically expire on subsequent checks using an `expires_at` timestamp—eliminating the overhead of complex background queues or workers.
* **Online Payment Integration:** Direct checkout workflow (e.g., Zarinpal) for instant fee settlement.
* **Payment Verification:** Validates transaction authenticity via gateway callbacks before finalizing reservations.
* **Management Dashboard:** Simple control center for tracking upcoming appointments, client details, and revenue.
* **Persian Calendar Support:** Native support for the Jalali (Shamsi) calendar format for seamless local booking.

---

## 🛠 Tech Stack

The architecture is designed around standard, reliable tools:

* **Backend:** Python with FastAPI, or Node.js with NestJS / Express *(planned / candidate frameworks)*
* **Database:** PostgreSQL (utilizing ACID transactions and row-level locking for strict concurrency control)
* **Frontend:** React.js or Next.js with Tailwind CSS *(for a responsive, mobile-first booking interface)*

---

## ⚙️ How It Works

1. **Availability Definition:** The freelancer sets working hours and session durations in the dashboard.
2. **Client Slot Selection:** A client selects an available date and time slot from the public booking page.
3. **Slot Reservation & Locking:** The system opens a database transaction and acquires a row lock (`SELECT FOR UPDATE`) to temporarily reserve the slot, setting an `expires_at` window (e.g., 15 minutes).
4. **Checkout & Expiration Handling:**
* If payment is completed within the window, the booking transitions to `CONFIRMED`.
* If the client leaves or fails to pay, the slot is treated as available once `expires_at < NOW()`, clearing the hold naturally via **lazy expiration** without requiring a standalone background daemon.


5. **Confirmation:** The transaction is verified against the payment gateway, locking in the booking and issuing confirmation details.

---

## 🚀 Getting Started

### Prerequisites

* Git
* Relational Database: PostgreSQL installed locally or running via Docker
* Runtime Environment: Python (3.10+) or Node.js (18+), depending on backend implementation
* Package Manager: `npm` / `yarn` / `pnpm` (Frontend/Node) or `pip` / `poetry` (Python)

### General Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd soloportal-lite

```


2. **Backend Setup:**
* Navigate to the backend directory:
```bash
cd backend

```


* Install required dependencies:
```bash
# For Python
pip install -r requirements.txt

# Or for Node.js
npm install

```


* Configure local database credentials in your local environment file.
* Run database migrations:
```bash
# Example for Prisma/Alembic depending on selected stack
npm run migrate # or alembic upgrade head

```


* Start the development server.


3. **Frontend Setup:**
* Navigate to the frontend directory:
```bash
cd ../frontend

```


* Install dependencies:
```bash
npm install

```


* Start the local development server:
```bash
npm run dev

```



---

## 🗺 Project Roadmap (3-Month MVP Plan)

* **Month 1: Foundation & Data Modeling**
* Schema design in PostgreSQL (`users`, `services`, `availability`, `bookings`).
* Authentication and profile configuration endpoints.
* Core logic for generating available time slots from recurring availability rules.


* **Month 2: Booking Engine & Concurrency**
* Public booking interface with Jalali (Shamsi) datepicker.
* Implementation of row-level locking and transaction boundaries for race-condition prevention.
* Payment gateway request dispatch and initial checkout flow.


* **Month 3: Payment Verification, Dashboard & Refinement**
* Verification callback endpoint and booking state machine transitions.
* Implementation of lazy expiration checks on slot queries.
* Freelancer management dashboard for reviewing bookings and revenue.
* End-to-end integration testing and demonstration preparation.



---

## 🔮 Future Improvements

* Automated SMS or email notifications for booking confirmations and reminders.
* Two-way synchronization with Google Calendar.
* Automatic generation of virtual meeting rooms (e.g., Google Meet, Skyroom).
* Client cancellation and self-service rescheduling workflows.
* Custom subdomain or custom domain mapping for individual freelancer pages.

---



## 📬 Contact

For questions, academic evaluations, or feedback regarding this project, feel free to open an issue or reach out through the project's repository discussion board.
