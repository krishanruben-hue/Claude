import { Router } from 'express';
import type { Request, Response } from 'express';
import { getAllCards, upsertCard, deleteCardById, resetCards } from '../database';
import { SEED_DATA } from '../../../src/lib/db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(getAllCards());
});

router.post('/', (req: Request, res: Response) => {
  const card = req.body as Record<string, unknown>;
  if (!card.id || !card.name || !card.set) {
    res.status(400).json({ error: 'Påkrevd: id, name, set' });
    return;
  }
  card.lastUpdated = new Date().toISOString();
  upsertCard(card as unknown as Parameters<typeof upsertCard>[0]);
  res.status(201).json(card);
});

router.put('/:id', (req: Request, res: Response) => {
  const card = { ...req.body as Record<string, unknown>, id: req.params.id, lastUpdated: new Date().toISOString() };
  upsertCard(card as Parameters<typeof upsertCard>[0]);
  res.json(card);
});

router.delete('/:id', (req: Request, res: Response) => {
  deleteCardById(String(req.params['id']));
  res.status(204).end();
});

router.post('/reset', (_req: Request, res: Response) => {
  resetCards(SEED_DATA);
  res.json({ message: `Tilbakestilt til ${SEED_DATA.length} standard-kort` });
});

export default router;
