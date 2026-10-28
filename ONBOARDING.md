# Onboarding Guide: EV-HUB-PRO

## Overview
EV-HUB-PRO is an Electric Vehicle (EV) infrastructure aggregation and booking platform built with Next.js 15 and React 19. It provides charging station geospatial discovery (Leaflet & Google Maps), real-time timeslot reservation, vehicle fleet management, and energy tariff calculation.

## Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | 5.x |
| Framework | Next.js (App Router) | 15.x |
| UI Library | React 19 & Radix UI | 19.x |
| Styling | Tailwind CSS | 3.4+ |
| Maps | Leaflet & Google Maps Loader | Latest |
| Backend & Auth | Firebase / SQLite | Latest |
| Testing | Vitest | 5.x |

## Architecture
- **App Router**: Grouped under `app/(auth)` for authentication routes and `app/(dashboard)` for booking, vehicle registration, and charging history.
- **Booking Funnel**: Multi-step booking pipeline traversing provider selection, timeslot allocation, vehicle matching, and payment checkout.
- **Mapping**: Interactive Leaflet / Google Maps clients rendering nearby charging stations and route waypoint markers.

## Key Entry Points
- `app/layout.tsx`: Root layout with `ThemeProvider` and global metadata.
- `app/page.tsx`: Landing page with charging station lookup.
- `app/(dashboard)/booking/timeslot/page.tsx`: Real-time charging slot availability allocator.
- `components/leaflet-map.tsx`: Dynamic client-side geospatial map component.

## Common Tasks
- Run dev server: `npm run dev`
- Build production: `npm run build`
- Run tests: `npx vitest run`
