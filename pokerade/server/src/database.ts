import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';
import type { StoredCard } from '../../src/lib/types';

export type { StoredCard };

const DB_DIR = path.join(os.homedir(), '.pokerade');
export const DB_PATH = path.join(DB_DIR, 'pokerade.db');

let db: Database.Database;

export function getDb(): Database.Database {
  return db;
}

export function initDb(seedData: StoredCard[]): void {
  fs.mkdirSync(DB_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      set_name      TEXT NOT NULL,
      number        TEXT NOT NULL,
      raw_nok       REAL NOT NULL DEFAULT 0,
      psa10_usd     REAL NOT NULL DEFAULT 0,
      psa10_pop     INTEGER NOT NULL DEFAULT 0,
      total_graded  INTEGER NOT NULL DEFAULT 0,
      gem_rate      REAL NOT NULL DEFAULT 0,
      finn_avg_price      REAL NOT NULL DEFAULT 0,
      finn_listings_count INTEGER NOT NULL DEFAULT 0,
      last_updated  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS finn_listings (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      finn_code   TEXT UNIQUE NOT NULL,
      card_id     TEXT REFERENCES cards(id) ON DELETE SET NULL,
      title       TEXT NOT NULL,
      price_nok   REAL,
      url         TEXT NOT NULL,
      thumbnail   TEXT,
      published_at TEXT,
      scraped_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id     TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      psa10_usd   REAL NOT NULL,
      raw_nok     REAL NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scrape_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      type        TEXT NOT NULL,
      status      TEXT NOT NULL,
      message     TEXT,
      cards_updated INTEGER DEFAULT 0,
      ran_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed only if table is empty
  const count = (db.prepare('SELECT COUNT(*) as c FROM cards').get() as { c: number }).c;
  if (count === 0) {
    console.log(`Seeding ${seedData.length} kort fra standard datasett...`);
    const insert = db.prepare(`
      INSERT OR IGNORE INTO cards
        (id, name, set_name, number, raw_nok, psa10_usd, psa10_pop, total_graded,
         gem_rate, finn_avg_price, finn_listings_count, last_updated)
      VALUES
        (@id, @name, @set, @number, @rawNok, @psa10Usd, @psa10Pop, @totalGraded,
         @gemRate, @finnAvgPrice, @finnListingsCount, @lastUpdated)
    `);
    const insertMany = db.transaction((cards: StoredCard[]) => {
      for (const c of cards) insert.run(c);
    });
    insertMany(seedData);
    console.log('Seeding ferdig.');
  }
}

// ─── Card helpers ────────────────────────────────────────────────────────────

function rowToCard(row: Record<string, unknown>): StoredCard {
  return {
    id:                 row.id as string,
    name:               row.name as string,
    set:                row.set_name as string,
    number:             row.number as string,
    rawNok:             row.raw_nok as number,
    psa10Usd:           row.psa10_usd as number,
    psa10Pop:           row.psa10_pop as number,
    totalGraded:        row.total_graded as number,
    gemRate:            row.gem_rate as number,
    finnAvgPrice:       row.finn_avg_price as number,
    finnListingsCount:  row.finn_listings_count as number,
    lastUpdated:        row.last_updated as string,
  };
}

export function getAllCards(): StoredCard[] {
  return (db.prepare('SELECT * FROM cards ORDER BY name').all() as Record<string, unknown>[]).map(rowToCard);
}

export function upsertCard(card: StoredCard): void {
  db.prepare(`
    INSERT INTO cards
      (id, name, set_name, number, raw_nok, psa10_usd, psa10_pop, total_graded,
       gem_rate, finn_avg_price, finn_listings_count, last_updated)
    VALUES
      (@id, @name, @set, @number, @rawNok, @psa10Usd, @psa10Pop, @totalGraded,
       @gemRate, @finnAvgPrice, @finnListingsCount, @lastUpdated)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      set_name = excluded.set_name,
      number = excluded.number,
      raw_nok = excluded.raw_nok,
      psa10_usd = excluded.psa10_usd,
      psa10_pop = excluded.psa10_pop,
      total_graded = excluded.total_graded,
      gem_rate = excluded.gem_rate,
      finn_avg_price = excluded.finn_avg_price,
      finn_listings_count = excluded.finn_listings_count,
      last_updated = excluded.last_updated
  `).run(card);
}

export function deleteCardById(id: string): void {
  db.prepare('DELETE FROM cards WHERE id = ?').run(id);
}

export function resetCards(seedData: StoredCard[]): void {
  db.prepare('DELETE FROM cards').run();
  db.prepare('DELETE FROM finn_listings').run();
  const insert = db.prepare(`
    INSERT INTO cards
      (id, name, set_name, number, raw_nok, psa10_usd, psa10_pop, total_graded,
       gem_rate, finn_avg_price, finn_listings_count, last_updated)
    VALUES
      (@id, @name, @set, @number, @rawNok, @psa10Usd, @psa10Pop, @totalGraded,
       @gemRate, @finnAvgPrice, @finnListingsCount, @lastUpdated)
  `);
  db.transaction((cards: StoredCard[]) => { for (const c of cards) insert.run(c); })(seedData);
}

// ─── Finn helpers ─────────────────────────────────────────────────────────────

export interface FinnListing {
  finnCode: string;
  cardId: string | null;
  title: string;
  priceNok: number | null;
  url: string;
  thumbnail: string | null;
  publishedAt: string | null;
}

export function upsertFinnListings(listings: FinnListing[]): void {
  const stmt = db.prepare(`
    INSERT INTO finn_listings (finn_code, card_id, title, price_nok, url, thumbnail, published_at)
    VALUES (@finnCode, @cardId, @title, @priceNok, @url, @thumbnail, @publishedAt)
    ON CONFLICT(finn_code) DO UPDATE SET
      card_id = excluded.card_id,
      title = excluded.title,
      price_nok = excluded.price_nok,
      url = excluded.url,
      thumbnail = excluded.thumbnail,
      published_at = excluded.published_at,
      scraped_at = datetime('now')
  `);
  db.transaction((ls: FinnListing[]) => { for (const l of ls) stmt.run(l); })(listings);
}

export function updateCardFinnStats(cardId: string): void {
  const rows = db.prepare(
    'SELECT price_nok FROM finn_listings WHERE card_id = ? AND price_nok IS NOT NULL AND price_nok > 0'
  ).all(cardId) as { price_nok: number }[];

  const count = rows.length;
  const avg = count > 0 ? rows.reduce((s, r) => s + r.price_nok, 0) / count : 0;

  db.prepare(`
    UPDATE cards SET finn_avg_price = ?, finn_listings_count = ?, last_updated = datetime('now')
    WHERE id = ?
  `).run(avg, count, cardId);
}

export function logScrape(type: string, status: string, message: string, cardsUpdated = 0): void {
  db.prepare('INSERT INTO scrape_log (type, status, message, cards_updated) VALUES (?, ?, ?, ?)').run(
    type, status, message, cardsUpdated
  );
}

export function getLastScrapeLog(): { finn: Record<string, unknown> | null; prices: Record<string, unknown> | null } {
  const row = (type: string) =>
    db.prepare("SELECT * FROM scrape_log WHERE type = ? ORDER BY ran_at DESC LIMIT 1").get(type) as Record<string, unknown> | null;
  return { finn: row('finn'), prices: row('prices') };
}
