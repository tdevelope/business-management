# 🗂️ Business Management System

A full-stack business management platform for independent service providers and small businesses.  
Designed to streamline appointment scheduling, customer management, and daily operations through a centralized admin dashboard.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Type](https://img.shields.io/badge/type-commercial-blue)
![License](https://img.shields.io/badge/license-UNLICENSED-lightgrey)

---

## 🎯 Overview

**Business Management System** is a production-oriented web application built for small, service-based businesses.

The system enables business owners to manage appointments, services, customers, availability, and waitlists from a single platform, with a strong focus on reliability, clear separation of roles, and prevention of scheduling conflicts.

This repository represents a **commercial product** under active development.

---

## ✨ Key Features

### 🧩 Core
- Intelligent appointment scheduling with conflict prevention
- Service catalog management (pricing, duration, descriptions)
- Customer management with contact details
- Business availability configuration and blocked times
- Waitlist mechanism for fully booked time slots
- Email notifications for confirmations and updates

### 🛠️ Admin
- Centralized admin dashboard
- Calendar-based appointment management
- Manual appointment creation, update, and cancellation
- Service and availability management
- Basic operational reports and summaries

### 👤 Customer
- Self-service appointment booking
- View, reschedule, and cancel personal appointments
- Join waitlists when no availability exists
- Receive automated email notifications

---

## ⚙️ Technical Highlights

- JWT-based authentication and authorization
- Background job processing for waitlist handling and notifications
- Redis-backed Bull Queue for asynchronous tasks
- Modular backend architecture
- Type-safe communication across frontend and backend

---

## 🛠 Tech Stack

### Backend
- **NestJS**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Bull Queue**
- **Redis** (used for background jobs)
- **JWT + Passport**
- **Swagger** (API documentation)

### Frontend
- **Next.js**
- **React**
- **Zustand**
- **React Hook Form**
- **TanStack React Query**
- **Tailwind CSS**
- **Radix UI**
- **Lucide Icons**
- **date-fns**

### Infrastructure
- **Docker**
- **Docker Compose**

---

## 🧱 Project Structure

business-management/
├── backend/
│ ├── src/modules/
│ │ ├── auth
│ │ ├── users
│ │ ├── services
│ │ ├── appointments
│ │ ├── waitlist
│ │ └── notifications
│ └── prisma/
│
├── frontend/
│ ├── app/
│ │ ├── admin
│ │ ├── customer
│ │ └── auth
│ └── src/
│
└── docker-compose.yml


---

## 🚀 Running the Application

The system is designed to be run using Docker Compose.

```bash
docker-compose up -d
```

**Access the application:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## 📚 API Documentation

Interactive API documentation is available via Swagger:

```
http://localhost:3001/api/docs
```

---

## 🗄️ Database Overview

Main entities:

- **Users** – customers and administrators
- **Services** – service definitions
- **Appointments** – scheduled bookings
- **BlockedTimes** – unavailable periods
- **Waitlist** – pending booking requests

---

## 🏗️ Architecture

### Backend

- Modular NestJS design
- Controllers, services, DTOs, and guards
- Clear separation of business logic and transport layer

### Frontend

- Component-driven architecture
- Centralized API layer
- Global state management with Zustand
- Server state handled via React Query

---

## 📄 License

**UNLICENSED** – Proprietary Software

All rights reserved.
