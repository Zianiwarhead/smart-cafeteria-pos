# Smart Cafeteria Pre-Order & Queue Management System
**Unit:** Object-Oriented Programming with C++  
**Student:** Brian Murimi Muchiri  

A campus dining pre-order, queue management, and M-Pesa checkout system featuring:
1. **Core Logic in C++17:** Complete OOP implementation showcasing the 4 pillars (Encapsulation, Inheritance, Polymorphism, Abstraction) and file-based data persistence (database).
2. **Native ANSI Terminal TUI:** 1980s IBM 3270 / CRT phosphor theme (`#33FF33` P1 Green, `#FFB700` P3 Amber, `#FFA500` P12 Orange) with mechanical stepped thermal receipt printer simulation and cutter detach animation.
3. **Web Terminal Interface:** React + Tailwind CRT terminal with printable / downloadable 80mm PDF receipts.

---

## 🏛️ C++ Object-Oriented Design & Technical Architecture

The core logic is written in modern **C++17** mapping real-world cafeteria entities to classes:

### 1. Encapsulation & Security
- `User`: Encapsulates credentials, roles (`Admin`, `Customer`), and permission checks. Customers cannot access admin analytics or inventory.
- `Order`: Financial data (`subtotal`, `tax`, `total`, `isPaid`, `transactionCode`) is immutable outside validated transaction routines.
- `MenuItem`: Encapsulates item pricing, preparation time, and stock decrements.

### 2. Inheritance & Code Reuse
- `User` ──► `Customer`, `Admin`
- `MenuItem` ──► `FoodItem`, `DrinkItem`, `ComboDeal` (specialized bundle pricing)
- `Order` ──► `PreOrder` (scheduled queue), `WalkInOrder` (live queue)
- `PaymentMethod` ──► `CashPayment` (change calculation), `MobileMoneyPayment` (STK Push simulation)

### 3. Polymorphism & Flexibility
- `order.process()`: Executes scheduled time-slot validation for pre-orders or calculates dynamic live wait times for walk-ins without conditional branches.
- `payment.process(amount)`: Polymorphically handles cash change calculations or Safaricom M-Pesa STK PIN validation through a unified interface.

### 4. Abstraction
- `QueueManager`: Hides complex queue wait calculations, peak hour detection, and progress bar generation.
- `AnalyticsEngine`: Handles file parsing and statistical analysis. Client code calls `generateReport()` without knowing file parsing internals.

---

## 💾 File Persistence (Database)

All records persist to local file streams:
- `cpp/data/users.txt` — Credentials and role-based access control.
- `cpp/data/menu.txt` — Food & drink items, prep times, pricing in KES, and stock levels.
- `cpp/data/orders.txt` — Immutable transaction log (timestamp, items, total in KES, payment method).
- `cpp/data/receipts/` — Downloadable individual receipts (`receipt_<transaction_id>.txt`).
- `cpp/data/daily_sales_report.csv` — Generated sales analytics for cafeteria management.

---

## 🟢 1980s IBM Phosphor Color Profiles

Both the C++ TUI and the Web interface support authentic phosphor wavelengths:
- **P1 Phosphor (Classic IBM PC / Apple II):** `#33FF33` / `#4AFF00` warm cathode luminescence.
- **P31 Phosphor (Vibrant Radar/Scope):** `#7FFF00` high-efficiency chartreuse.
- **P39 Phosphor (Long Persistence):** `#006400` / `#4ADE80` low-flicker forest green.
- **P3 Phosphor (Warm Amber):** `#FFB700` golden amber (DEC VT220 / Wyse style).
- **P12 Phosphor (Safety Orange):** `#FFA500` high-visibility amber.
- **IBM 3279 Color:** Multi-color CRT terminal matrix (Green, Cyan, Amber, Red).

---

## ⚡ How to Build & Run the C++ Core

### On Windows:
```cmd
# Double click or run:
build.bat

# Run the terminal application:
run.bat
# or directly:
.\smart_cafeteria.exe
```

### On Linux / macOS / MSYS2:
```bash
make
./smart_cafeteria
```

---

## 🌐 How to Run the Web CRT Terminal
```bash
npm install
npm run dev
```
Open `http://localhost:5173` to interact with the web dispenser and download thermal PDF receipts.
