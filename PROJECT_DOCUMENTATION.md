# Uni Door Dash — Project Technical Documentation

This document provides a comprehensive overview of all dependencies added, file architecture, and technical errors resolved during the setup and deployment of the **Uni Door Dash** application.

---

## 📦 Dependencies & Purpose

### 1. Framework & Core Routing
* **`@tanstack/react-start` (`1.168.32`)**: Full-stack React SSR framework built on top of TanStack Router and Vite.
* **`@tanstack/react-router` (`1.170.18`)**: Type-safe client/server routing engine.
* **`@tanstack/router-plugin` (`1.168.23`)**: Vite plugin for automatic route tree generation (`src/routeTree.gen.ts`).
* **`nitro` (`3.0.260603-beta`)**: Server engine powering server functions and cross-platform production deployments (Vercel, Cloudflare, Node).
* **`react` & `react-dom` (`19.2.0`)**: Core React framework.

### 2. State & Backend Integration
* **`@tanstack/react-query` (`5.101.1`)**: Asynchronous data fetching, caching, and server state management.
* **`firebase` (`12.18.0`)**: Auth (Google, Apple, Email/Password) and Firestore Database SDK.
* **`jose` (`5.9.6`)**: Lightweight JWT verification library used on the server to verify Firebase RS256 auth tokens for admin image uploads.

### 3. Styling & Animations
* **`tailwindcss` (`4.2.1`) & `@tailwindcss/vite` (`4.2.1`)**: Tailwind CSS v4 engine integrated directly into Vite.
* **`tw-animate-css` (`1.3.4`)**: Tailwind CSS plugin for smooth UI keyframe animations.
* **`framer-motion` (`13.1.0`)**: Declarative animation engine for glass popovers, slide-ins, and floating UI elements.
* **`clsx` & `tailwind-merge`**: Utility functions (`cn()`) for merging Tailwind class names conditionally.

### 4. UI Components & Accessibility (Radix UI)
* **Radix Primitives (`@radix-ui/react-*`)**: Accordion, Alert Dialog, Aspect Ratio, Avatar, Checkbox, Collapsible, Context Menu, Dialog, Dropdown Menu, Hover Card, Label, Menubar, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Slider, Slot, Switch, Tabs, Toggle, Toggle Group, Tooltip.
* **`lucide-react` (`0.575.0`)**: Modern SVG icons used throughout navigation and actions.
* **`sonner` (`2.0.7`)**: Toast notification system.
* **`embla-carousel-react` (`8.6.0`)**: Touch-friendly carousel component.
* **`cmdk` (`1.1.1`)**: Command menu palette component.
* **`vaul` (`1.1.2`)**: Drawer component for mobile overlays.

### 5. Forms & Validation
* **`react-hook-form` (`7.71.2`)**: Form state and input management.
* **`zod` (`3.24.2`)**: Schema-based type validation.
* **`@hookform/resolvers` (`5.2.2`)**: Zod schema resolver for React Hook Form.

### 6. Development & Postinstall Configuration
* **`package.json` -> `allowScripts`**:
  ```json
  "allowScripts": {
    "@firebase/util": true,
    "protobufjs": true
  }
  ```
  Explicitly permits postinstall scripts for `@firebase/util` and `protobufjs` to set executable permissions on npm 11+.

---

## 📁 Files & Project Architecture

```
UNI Door Dash v2/
├── .env                              # Environment variables (CLOUDINARY_API_SECRET)
├── .env.example                      # Template for environment configuration
├── .gitignore                        # Excludes node_modules, .env, build output (.vercel, .output)
├── firestore.rules                   # Database security rules (admin gating & shopper order access)
├── package.json                      # Dependencies, scripts, and allowScripts config
├── tsconfig.json                     # TypeScript strict mode configuration
├── vercel.json                       # Vercel deployment configuration
├── vite.config.ts                    # Vite config with TanStack Start, Tailwind v4, & Nitro
└── src/
    ├── start.ts                      # TanStack Start entry configuration
    ├── router.tsx                    # TanStack Router instance & QueryClient context
    ├── server.ts                     # SSR entry point with catastrophic error handler
    ├── styles.css                    # Design system tokens, liquid glass classes, dark mode
    ├── components/
        ├── auth-provider.tsx         # Firebase Auth state subscriber & admin context
        ├── order-confirm-dialog.tsx  # Liquid glass order confirmation modal
        ├── segmented-control.tsx     # Custom glass toggle switch
        ├── sidebar-provider.tsx      # Sidebar collapse & mobile menu state
        ├── sign-in-dialog.tsx        # Liquid glass authentication dialog
        ├── theme-provider.tsx        # Dark/Light mode theme state
        ├── dashboard/                # Admin piece creation, order progress list, storage metrics
        ├── home/                     # Product cards, hero banners, community listings
        ├── mobile/                   # Touch-adapted navigation dock & text roll
        ├── stores/                   # Vendor store cards & filter dropdowns
        ├── subscription/             # Membership pricing, countdown timers, slot text
        └── ui/                       # Reusable Radix/Tailwind UI primitives
    ├── lib/
        ├── cart.ts                   # Shopping cart local state & helpers
        ├── cloudinary-config.ts      # Cloudinary public constants & folder mapping
        ├── error-capture.ts          # Global error tracking utility
        ├── error-page.ts             # SSR error fallback page generator
        ├── firebase.ts               # Firebase initialization & ADMIN_EMAIL definition
        ├── firestore-data.ts         # Product & order Firestore CRUD operations
        └── utils.ts                  # Utility functions (cn class merger)
    ├── routes/
        ├── __root.tsx                # Root layout with RootDocument (<HeadContent />, <Scripts />)
        ├── index.tsx                 # Home / Landing page
        ├── market-place.tsx          # Product catalog page
        ├── stores.tsx                # Stores directory page
        ├── subscription.tsx          # Membership & subscription page
        └── dashboard.tsx             # Admin dashboard page (gated to hello.cherrylabs@gmail.com)
    └── server/
        └── cloudinary-upload.ts      # Server function generating signed Cloudinary upload tokens
```

---

## 🛠️ Errors Fixed & Solutions

### Error 1: npm Postinstall Permission Failure (`TAR_ENTRY_ERROR` / EACCES)
* **Symptom**: Installing dependencies on npm 11+ resulted in file permission errors or aborted postinstall hooks for Firebase libraries (`@firebase/util` and `protobufjs`).
* **Root Cause**: Modern npm restricts script execution permissions unless `--foreground-scripts` is specified or explicitly approved in `package.json`.
* **Fix**: Added `--foreground-scripts` to install commands and added `allowScripts` block to `package.json`:
  ```json
  "allowScripts": {
    "@firebase/util": true,
    "protobufjs": true
  }
  ```

---

### Error 2: TS4111 Strict Index Signature Access Errors
* **Symptom**: `npx tsc --noEmit` failed during build with 3 errors in `src/server/cloudinary-upload.ts`:
  ```
  error TS4111: Property 'email' comes from an index signature, so it must be accessed with ['email'].
  error TS4111: Property 'CLOUDINARY_API_SECRET' comes from an index signature, so it must be accessed with ['CLOUDINARY_API_SECRET'].
  ```
* **Root Cause**: TypeScript strict mode (`noUncheckedIndexedAccess` / index signature policy) requires string index signatures (`JWTPayload` and `process.env`) to be accessed using bracket notation rather than property dot notation.
* **Fix**: Updated `src/server/cloudinary-upload.ts`:
  ```ts
  // Fixed JWT payload access
  email = typeof payload['email'] === "string" ? payload['email'] : undefined;

  // Fixed process.env access
  const apiSecret = process.env['CLOUDINARY_API_SECRET'];
  ```

---

### Error 3: Unstyled Page Layout / Missing CSS & Scripts on Production (Vercel)
* **Symptom**: On Vercel, the application rendered raw, unstyled HTML (blue links, plain black text, white background, unstyled buttons) instead of styled glass components.
* **Root Cause**: In `src/routes/__root.tsx`, the root route configured `shellComponent: RootShell`. Because `shellComponent` is an unrecognized property in TanStack Router, `RootShell` (which contained `<HeadContent />` and `<Scripts />`) was never executed. `<HeadContent />` injects `<link rel="stylesheet" href={appCss}>` into the document `<head>`, so without it, no CSS link was emitted into the HTML.
* **Fix**: Updated `src/routes/__root.tsx` to wrap `RootComponent` in a proper `RootDocument` component:
  ```tsx
  function RootDocument({ children }: { children: ReactNode }) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          {children}
          <Scripts />
        </body>
      </html>
    );
  }

  function RootComponent() {
    const { queryClient } = Route.useRouteContext();
    return (
      <RootDocument>
        <QueryClientProvider client={queryClient}>
          {/* App Layout & Routes */}
        </QueryClientProvider>
      </RootDocument>
    );
  }
  ```
