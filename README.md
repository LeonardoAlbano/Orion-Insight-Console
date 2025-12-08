# Orion Insight – NASA Near-Earth Objects Dashboard

Orion Insight is a frontend dashboard built with **Angular**, **PO-UI (TOTVS)**, **TailwindCSS**, **RxJS**, and **Zod** to visualize data from the **NASA Open APIs** (APOD and Near-Earth Objects).

The goal of this project is to practice modern frontend architecture, web security concerns, and build a case that fits well with the **TOTVS** ecosystem (PO-UI).

---

## ✨ Features

✅ **NEO risk dashboard**  
- Daily summary of Near-Earth Objects (NEOs)  
- Automatic hazardous objects percentage calculation  
- Risk classification: `low`, `moderate`, `high`  

✅ **Charts with PO-UI**  
- Line chart showing total objects vs. hazardous objects per day  
- Donut chart splitting hazardous vs. non-hazardous objects  
- Dark and minimal layout for a clean visualization  

✅ **Near-Earth Objects table**  
- PO-UI table with configurable columns  
- Filter by risk: `all`, `dangerous`, `safe`  
- Filter by date range: 1, 3, or 7 days  
- Search by object name or approach date  
- Client-side pagination controlled by a facade (page, pageSize, totalPages)  

✅ **APOD – Astronomy Picture of the Day**  
- Displays NASA's image/video of the day  
- Graceful fallback when the API fails  
- Secure external links to media  

✅ **Architecture focused on scalability**  
- Clear separation between:
  - `core` (config, services, layout, validation)  
  - `features` (dashboard, near-earth-objects)  
  - `facades` that orchestrate data and expose view models  
- Heavy use of RxJS (`BehaviorSubject`, `combineLatest`, `switchMap`, `shareReplay`)  

✅ **Validation and robustness**  
- All NASA responses validated with **Zod**  
- Strong typing with `z.infer`  
- Safe fallbacks for network and validation errors  

✅ **Unit tests**  
- Service tests (`NasaNeoService`) using `HttpClientTestingModule`  
- Component tests with mocked facades  
- `RouterTestingModule` and `HttpClientTestingModule` support for PO-UI  

✅ **Security best practices**  
- NASA API key kept out of the repository (environment + .gitignore)  
- External links with `rel="noopener noreferrer"`  
- Input validation and API error handling  

---

## 🚀 Tech Stack

> Adjust exact versions according to your `package.json`.

**Core**

- Node.js: 18+ / 20+  
- Angular: 19.x (standalone components)  
- TypeScript: 5.x  

**Framework & Libraries**

- Angular – SPA framework  
- PO-UI (TOTVS) – UI components (charts, tables, layout)  
- TailwindCSS – styling utilities and dark theme  
- RxJS – reactive programming and state orchestration  
- Zod – schema validation for external APIs  

**Main dependencies**

- `@angular/core`, `@angular/router`, `@angular/common`  
- `@po-ui/ng-components`  
- `rxjs`  
- `zod`  
- `typescript`  

**Dev dependencies**

- `@angular/cli`  
- `@angular-devkit/build-angular`  
- `karma`, `jasmine`  
- `eslint` / `prettier` (if configured)  

---

## 📋 Prerequisites

- Node.js 18+ (20+ recommended)  
- npm / pnpm / yarn  
- Angular CLI installed globally (optional but recommended)  
- NASA API key (optional, but recommended to avoid `DEMO_KEY` limits)

---

## 🛠️ Installation

📥 **Clone the repository**

```bash
git clone https://github.com/LeonardoAlbano/Orion-Insight-Console
```

📦 **Install dependencies**

```bash
# with npm
npm install

# or with pnpm
pnpm install

# or with yarn
yarn install
```

⚙️ **Configure environment**

The project uses an environment file to store the NASA API key.

1. Copy the example environment:

```bash
cp src/environment/environment.example.ts src/environment/environment.ts
```

2. Edit `src/environment/environment.ts`:

```ts
export const environment = {
  nasaApiKey: 'DEMO_KEY', // replace with your own key if you prefer
};
```

> `src/environment/environment.ts` is ignored by Git to avoid leaking secrets.

---

## 🚀 Running the Application

🧪 **Development**

```bash
# using Angular CLI
ng serve

# or, if you have a start script
npm run start
# or
pnpm start
```

Navigate to:  
`http://localhost:4200`

🏗 **Production build**

```bash
ng build
# or
npm run build
# or
pnpm build
```

The optimized build will be generated in the `dist/` folder.

---

## 📚 Routes & Features

### `/dashboard` – Dashboard

- Daily summary:
  - Total NEOs
  - Number of potentially hazardous objects
  - Closest distance to Earth (km)
  - Risk percentage and classification (`low`, `moderate`, `high`)
- Charts (PO-UI `po-chart`):
  - Line: total vs. hazardous objects per day
  - Donut: hazardous vs. non-hazardous objects
- APOD:
  - Image or video of the day
  - Secure link to NASA’s original media

### `/near-earth-objects` – NEO Table

- PO-UI table with:
  - Object name  
  - Approach date  
  - Distance (km)  
  - Velocity (km/s)  
  - Risk (`dangerous` / `safe`)  
- Filters:
  - Date range: 1, 3, or 7 days
  - Risk: `all`, `dangerous`, `safe`
  - Search: name or date
- Pagination:
  - `page`, `pageSize`, `total`, `totalPages`, `canPrev`, `canNext`
- Column manager:
  - Show/hide columns
  - Reorder columns
  - Restore default layout

---

## 📁 Project Structure

```txt
src/
  app/
    core/
      config/
        nasa.config.ts              # Base URL + NASA API key
      layout/
        main-layout/
          main-layout.component.ts
          main-layout.component.html
          main-layout.component.scss
      services/
        nasa-apod.service.ts        # APOD (NASA) HTTP + Zod
        nasa-neo.service.ts         # NeoWs HTTP + aggregation logic
      validation/
        nasa-apod.schema.ts         # Zod schema + TS type for APOD
        nasa-neo.schema.ts          # Zod schemas + types for NEOs
        zod-angular.ts              # Zod + Angular helpers
    features/
      dashboard/
        dashboard.objects.facade.ts         # Dashboard facade
        pages/
          dashboard-page.component.ts       # Dashboard page (UI)
          dashboard-page.component.html
          dashboard-page.component.scss
      neo-objects/
        neo.objects.facade.ts               # NEO list facade
        page/
          neo-object-page.component.ts      # NEO table page (UI)
          neo-object-page.component.html
          neo-object-page.component.scss
    app.component.ts               # Root component (<router-outlet>)
    app.routes.ts                  # Application routes
    app.config.ts                  # Global providers (router, HttpClient, etc.)
  environment/
    environment.example.ts         # Example environment (no secrets)
    environment.ts                 # Local environment (Git-ignored)
```

---

## 🧪 Testing

The project uses **Karma + Jasmine** and Angular testing utilities.

### Run unit tests

```bash
ng test
# or
npm test
# or
pnpm test
```

Main test scenarios:

- `NasaNeoService`
  - `getClosestDistanceKm` helper
  - Correct API URL and query params (including `api_key`)
- `NeoObjectsPageComponent`
  - Uses a mocked `NeoObjectsFacade`
  - Ensures `viewModel` exposes paginated data correctly
- `DashboardPageComponent`
  - Uses a mocked `DashboardObjectsFacade`
  - Verifies component creation with standalone imports
- `MainLayoutComponent` and `AppComponent`
  - Use `RouterTestingModule` to validate layout and `<router-outlet>`

> You can configure Karma to run with `ChromeHeadless` and `singleRun: true` for CI usage.

---

## 🔐 Security

- **API key handling**
  - NASA API key is never committed to the repository.
  - Only stored in `environment.ts`, which is excluded via `.gitignore`.
  - `environment.example.ts` is provided as a template.

- **Data validation**
  - All external responses (NASA) are parsed by Zod schemas.
  - This protects the UI from unexpected shape changes.
  - On validation failure, the app logs the error and falls back to safe defaults.

- **External links**
  - All `target="_blank"` links use `rel="noopener noreferrer"` to avoid tabnabbing.

---

## 🧭 Roadmap / Next Steps

Some ideas to evolve this project:

- 🖥 **Backend with .NET + PostgreSQL + Docker**
  - Build a REST API that:
    - Persists NASA data to Postgres
    - Exposes:
      - `/api/dashboard/summary`
      - `/api/neo-objects`
      - `/api/apod/today`
  - Apply Clean Architecture / CQRS patterns

- 🔐 **Authentication**
  - Simple admin login for dashboard access
  - JWT + route guards in Angular

- 📊 **Observability**
  - Structured logging in the backend
  - Basic metrics (latency, error rates, etc.)

- 🎨 **UX/UI**
  - Light/dark theme toggle
  - Tooltips on chart points
  - Persist filters in localStorage

---

## 🧾 License

This project was built for learning and portfolio purposes.  
Feel free to use it as a reference or starting point for your own experiments.
