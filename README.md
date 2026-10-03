# BuyerLead — Live API Integrated Internship Demo

A React + Node/Express web app for discovering potential US home-decor business buyers, enriching them with professional emails, and sending outreach emails.

## Live API chain

```text
Seller input
   ↓
React frontend
   ↓
Node/Express backend
   ↓
OpenStreetMap Nominatim + Overpass API  ← business discovery, no account/key
   ↓
Hunter API                              ← professional email discovery
   ↓
Seller selects leads
   ↓
Resend API                              ← email delivery
```

### Why OpenStreetMap instead of Yelp?

This version removes the Yelp account/API-key dependency so the project can be run locally for an internship demo. OpenStreetMap data is retrieved live through Nominatim geocoding and the Overpass API. It is not a commercial buyer database, so results depend on what businesses are mapped in OpenStreetMap.

## Requirements

- Node.js 18+
- Internet connection for the live APIs
- Hunter API key for real professional email discovery
- Resend API key + sender address for real email sending

Business discovery itself does not require a key.

## Setup

### Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and add your Hunter/Resend credentials if available.

```bash
npm run dev
```

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL, normally `http://localhost:5173`.

## Demo search

- Product: `Handmade wall decor`
- Buyer type: `Interior designers`
- Location: `Los Angeles, CA`

The website first geocodes the US location, then queries nearby mapped businesses through Overpass. The first `HUNTER_LIMIT` results are enriched through Hunter.

## Environment

```env
PORT=5000
OSM_LIMIT=12
OSM_RADIUS_METERS=15000
HUNTER_API_KEY=
RESEND_API_KEY=
FROM_EMAIL=
HUNTER_LIMIT=3
```

Keep API keys only in `backend/.env`. Never put them in React source code or commit them to GitHub.

## Important demo note

OpenStreetMap can discover real mapped businesses, but it does not guarantee that every result is a buyer for a seller's specific product. Hunter may not find an email for every business. These limitations should be stated honestly in an internship presentation.
