import express from 'express';
import cors from 'cors';
import { initDb } from './database';
import { SEED_DATA } from '../../src/lib/db';
import cardsRouter from './routes/cards';
import scrapeRouter from './routes/scrape';
import { startScheduler } from './scheduler';

const app = express();
const PORT = 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/api/cards', cardsRouter);
app.use('/api/scrape', scrapeRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Graceful error handling
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Intern serverfeil' });
});

initDb(SEED_DATA);
startScheduler();

app.listen(PORT, () => {
  console.log(`\nPokerade server kjører på http://localhost:${PORT}`);
  console.log(`Data lagres i: ~/.pokerade/pokerade.db\n`);
});
