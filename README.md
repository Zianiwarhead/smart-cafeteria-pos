# Smart Cafeteria Pre-Order & Queue Management System
### IBM 3270 / 1980s Retro Terminal Edition

A campus dining pre-order, queue management, and M-Pesa checkout terminal built with authentic 1980s IBM green/amber CRT phosphor aesthetics, mechanical stepper-motor audio synthesis, and a physical thermal receipt dispenser with downloadable PDF vouchers.

---

## 🟢 Features

- **Classic IBM CRT Phosphor Themes:**
  - **P1 Phosphor (Classic IBM PC / Apple II):** `#33FF33` / `#4AFF00` warm cathode luminescence.
  - **P31 Phosphor (Radar/Scope):** `#7FFF00` high-efficiency chartreuse.
  - **P39 Phosphor (Long Persistence):** `#006400` / `#4ADE80` low-flicker forest green.
  - **P3 Phosphor (Warm Amber):** `#FFB700` golden amber (DEC VT220 / Wyse style).
  - **P12 Phosphor (Safety Orange):** `#FFA500` high-visibility amber.
  - **IBM 3279 Color:** 4-color CRT matrix (Green, Cyan, Amber, Red).
- **Stepped Thermal Receipt Printer:**
  - Realistic stepped line feed keyframes matching mechanical stepper motors.
  - 40-tooth serrated cutter tear edge.
  - **Direct PDF Receipt Download** formatted as an 80mm thermal receipt roll with barcodes, queue ticket numbers, timestamp, itemized breakdowns, and VAT.
  - Tear voucher animation and plain-text clipboard copy.
- **Campus Dining Menu (KES Currency):**
  - Swahili & Kenyan campus favorites (Chapatis & Ndengu, Swahili Beef Pilau, Ugali & Sukuma Wiki, Fried Tilapia, Chai, Dawa, and combos).
- **Simulated Safaricom M-Pesa STK Push:**
  - Instant STK push simulation with 4-digit PIN verification.
  - 10-character alphanumeric transaction codes (e.g. `QFH38X92L`).
- **Queue Simulation & Analytics:**
  - Dynamic wait-time calculation based on kitchen load.
  - Walk-in live queue vs. Scheduled Pre-Order pickup slots.
  - Exportable CSV daily sales reports (`daily_sales_report.csv`).
- **Mechanical Web Audio Synthesizer:**
  - Zero audio assets: synthesizes authentic IBM key beeps, print head step rattle, CRT degauss, and completion chimes using the Web Audio API.

---

## 🛠️ Tech Stack

- **Frontend & UI:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Phosphor Icons
- **Animation & Motion:** Motion (Framer Motion)
- **PDF Generation:** jsPDF (80mm thermal roll format)
- **Audio Engine:** Web Audio API synthesizer
- **Build Tool:** Vite

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Zianiwarhead/smart-cafeteria-pos.git

# Navigate to project directory
cd smart-cafeteria-pos

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` (or the port indicated in your console) to launch the terminal.
