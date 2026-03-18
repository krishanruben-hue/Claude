# PokeGrade

Webapp for norske Pokemon-kortinvestorer. Henter priser fra Pricecharting, PSA Pop Report og Finn.no for å beregne ROI, multiplier og gem rate per kort.

## Kom i gang

### Krav
- Node.js 18+
- macOS / Linux

### Start appen
```bash
bash start.sh
```
Eller dobbeltklikk `PokeGrade.command` i Finder.

Appen åpner på **http://localhost:5173** med demo-data uten API-nøkler.

## API-nøkler (for live-data)

Rediger `backend/.env`:

| Variabel | Hvor | Kostnad |
|---|---|---|
| `SUPABASE_URL` + `SUPABASE_ANON_KEY` | supabase.com | Gratis |
| `PRICECHARTING_API_KEY` | pricecharting.com | $10/mnd |
| `EXCHANGERATE_API_KEY` | exchangerate.host | Gratis |

### Database-oppsett (Supabase)
1. Opprett prosjekt på supabase.com
2. Åpne SQL Editor, lim inn innholdet fra `backend/db/schema.sql`
3. Kjør: `cd backend && node db/seed.js`

## Teknisk stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: Supabase (PostgreSQL)
- Scraping: Playwright (Finn.no, PSA Pop Report)
- Pris-API: Pricecharting
- FX-data: ExchangeRate API
