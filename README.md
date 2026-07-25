# Travel Solution: Comprehensive Multi-Platform Tour & Travel Management System

**Travel Solution** is a enterprise-grade, multi-client Tour and Travel Management System designed to seamlessly manage tour packages, hotel bookings, custom itineraries, agent assignments, real-time tracking, and client interaction.

The solution features multiple modern frontends (**Angular**, **React**, and **.NET MAUI**) communicating with a robust backend architecture built on ASP.NET Core and SQL Server, complete with real-time updates using SignalR, JWT authentication, and comprehensive audit logging.

---

## 🌟 Key Features & Functional Modules

### 1. 🧳 Tour & Destination Management
* **Tour Packages & Itinerary Builder**: Comprehensive creation of structured tour packages with custom daily itineraries, meal plans (Breakfast, Lunch, Dinner), activity schedules, and pricing.
* **Geographical & Location Management**: Categorization by geography, district, and tour spots across Bangladesh.
* **Custom Tour Planning**: End-to-end support for custom tour requests, allowing travelers to submit tailored itineraries for agent/admin approval and quoting.

### 2. 🏨 Hotel & Restaurant Booking
* **Hotel Directory & Room Inventory**: Detailed hotel management including room modal configurations, star ratings, and real-time inventory management.
* **Direct Booking Engines**: Integrated booking flows for hotels and tours with real-time status updates.
* **Restaurant Integration**: Local restaurant listings, dining recommendations, and meal planning linked to itineraries.

### 3. 💳 Secure Payments & Refund System
* **Multi-Gateway Payment Support**: Integrated processing for traditional card payments and Mobile Financial Services (MFS - bKash, Nagad, Rocket).
* **Automated Refund Handling**: Dedicated refund request lifecycle management for cancellation requests and admin approvals.

### 4. 👥 Role-Based Access Control (RBAC) & Agent Execution
* **Multi-Role Support**: Custom privileges for **Admins**, **Agents**, and **Clients/Travelers**.
* **Agent Assignment & Dashboard**: Admins can assign agents to specific tours and package executions.
* **Real-time Package Tracking**: Operational dashboards for agents to log execution steps, tour progress, and memory/photo logs.

### 5. 🔔 Real-Time Communication & Audit Trail
* **SignalR & WebSockets**: Instant notifications for booking approvals, assignment changes, and updates.
* **Comprehensive Audit Logging**: Detailed system-wide audit trails tracking state changes, transaction histories, and user management actions.

---

## 🏗 System Architecture & Technology Stack

```
                        +---------------------------------------+
                        |           Backend API & Services      |
                        |      (ASP.NET Core Web API / EF Core) |
                        +-------------------+-------------------+
                                            |
         +----------------------------------+----------------------------------+
         |                                  |                                  |
         v                                  v                                  v
+------------------+              +------------------+              +------------------+
| Angular Frontend |              |  React Frontend  |              |  MAUI Frontend   |
| (Admin / Agent)  |              | (Client Portal)  |              | (Cross-Platform) |
+------------------+              +------------------+              +------------------+
```

| Component | Technology / Stack |
| :--- | :--- |
| **Backend Framework** | ASP.NET Core Web API, Entity Framework Core, SQL Server |
| **Real-Time Services** | SignalR, WebSockets |
| **Authentication** | JWT (JSON Web Tokens), Identity Management |
| **Angular Web Client** | Angular 17+, RxJS, Angular Material/Tailwind, SignalR Client |
| **React Web Client** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Mobile Client** | .NET MAUI Blazor Hybrid (Android, iOS, Windows, macOS) |

---

## 📁 Repository Structure

```
Travel-Solution/
├── AngulerFrontend/         # Angular web application (Admin & Agent Management)
├── ReactFrontend/           # React + Vite client portal (Customer & Booking)
├── MAUIFrontEnd/            # .NET MAUI Blazor Hybrid multi-platform mobile app
├── Travel Solution/         # ASP.NET Core Web API solution files & backend modules
├── APP Password.txt         # Configuration / Mail service keys (dev reference)
└── fix_build.bat            # Automated workspace build & repair script
```

---

## 🚀 Getting Started

### Prerequisites
* **Backend**: .NET 8.0 SDK or later, SQL Server / LocalDB.
* **Angular Frontend**: Node.js (v18+) & Angular CLI (`npm install -g @angular/cli`).
* **React Frontend**: Node.js (v18+).
* **MAUI Frontend**: Visual Studio 2022 with .NET MAUI workload installed.

---

### Setup Instructions

#### 1. Backend Setup
1. Open the solution in Visual Studio / VS Code:
   ```bash
   cd "Travel Solution"
   dotnet restore
   ```
2. Configure database connection string in `appsettings.json`.
3. Apply Entity Framework database migrations:
   ```bash
   dotnet ef database update
   ```
4. Run the API project:
   ```bash
   dotnet run
   ```

#### 2. Angular Client (Admin & Agent Operations)
```bash
cd AngulerFrontend
npm install
ng serve
```
Access the application at `http://localhost:4200`.

#### 3. React Client (Customer Portal)
```bash
cd ReactFrontend
npm install
npm run dev
```
Access the portal at `http://localhost:5173`.

#### 4. .NET MAUI Hybrid Mobile Application
Open `MAUIFrontEnd/MAUIFrontEnd.csproj` in Visual Studio 2022, choose target device (Android, iOS, or Windows), and press `F5` to build and run.

---

## 📜 License & Governance
Developed for internal tour and travel management. All rights reserved.
