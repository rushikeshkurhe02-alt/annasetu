# AnnaSetu (अन्नसेतू) — Food Surplus & Trust Bridge

> **"Good food should reach a plate, not a dustbin."**  
> Built for the **NEUROVERSE Ideathon (Open Innovation Track)** by team **Code Ninjas**.

AnnaSetu is an institutional relationship and trust platform connecting surplus food providers (banquet halls, caterers, hostel messes, restaurants, hotels) with verified NGOs to reliably feed orphanages, old-age homes, and community shelters.

Unlike commercial food-ordering or delivery apps, AnnaSetu focuses on **transparency, mutual verification, and closed-loop accountability** with photographic proof of distribution and FSSAI safe-window tracking.

---

## 🌟 Key Features

### 1. Dual-Track Stakeholder Portals
- **Food Providers**: Restaurants, banquet halls/karyalays, caterers, university messes, hotels, bakeries.
- **NGOs**: Verified relief societies, student squads, and community feeding trusts with dedicated insulated transport.
- **1-Tap Demo Access**: Instant evaluation modes for judges without manual credential setup.

### 2. Core 4-Step Verification Loop
1. **Surplus Listing**: Providers post surplus with plate count, packaging rules, and FSSAI safe-window countdowns.
2. **Distribution Plan**: NGOs must declare the target shelter/orphanage, expected beneficiaries, meal type, driver contact, and vehicle details before claiming food.
3. **Mutual 4-Digit Handover Code**: Verified on-site at pickup to lock allocation and release food.
4. **Photo-Verified Serve Reports**: NGOs upload photo proof, actual plates served, and honest leftover audits. Donors acknowledge reports with a *"Provider verified this report"* trust badge.

### 3. Safety & Compliance
- **FSSAI Safe-Window Guard**: Dynamic countdown ring alerting users when safe consumption limits approach (Green >60%, Amber 30–60%, Red <30%, or Expired).
- **CSR & ESG Sustainability Reporting**: Computes avoided CO₂ emissions (0.65 kg CO₂e / plate saved from landfill decay), conserved virtual agricultural water, and exports audit certificates.

### 4. Interactive Mapping & Localization
- **Leaflet & OpenStreetMap**: Maps donors, care centers, and live surplus offers across Pune without external API keys.
- **Trilingual Interface**: Instant switching between **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

### 5. Evaluator Sandbox
- **Time Acceleration**: Run the simulated clock at 1x, 60x, or 300x speed to demo live safe-window expiration.
- **Simulation Triggers**: Spawn new surplus offers, generate NGO requests, or auto-submit serve reports in one tap.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7 (`react-router-dom`)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (CSR charts & beneficiary metrics)
- **Mapping**: Leaflet + OpenStreetMap
- **State & Storage**: React Context + localStorage abstraction (`src/services/api.ts`) ready for Firebase/Cloud SQL integration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### Installation
```bash
# Clone the repository
git clone https://github.com/rushikeshkurhe02-alt/annasetu.git
cd annasetu

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` to interact with the platform.

### Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── common/         # Navbar, Footer, CountdownRing, VerificationBadge, LeafletMap
│   │   └── demo/           # Demo floating controls & sandbox triggers
│   ├── context/            # AuthContext, DemoContext, LanguageContext
│   ├── data/               # Seed data for Pune providers, NGOs, and care facilities
│   ├── pages/              # Directory pages, dashboards, detail views, CSR impact report
│   ├── services/           # api.ts (Local persistence and data layer)
│   ├── types/              # Full TypeScript schemas for offers, plans, reports
│   ├── utils/              # FSSAI guidance constants, rules, scoring algorithms
│   ├── App.tsx             # Route definitions and provider providers
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind configuration and theme variables
├── package.json
└── README.md
```

---

## 👥 Team Code Ninjas
Developed for **NEUROVERSE — Open Innovation Track**.
