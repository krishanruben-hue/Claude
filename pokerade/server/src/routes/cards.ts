import { Router } from 'express';
import type { Request, Response } from 'express';
import { getAllCards, upsertCard, deleteCardById, resetCards } from '../database';
import { SEED_DATA } from '../../../src/lib/db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    res.json(await getAllCards());
  } catch (err) {
    console.error('getAllCards feilet:', err);
    res.status(500).json({ error: 'DB-feil' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const card = req.body as Record<string, unknown>;
  if (!card.id || !card.name || !card.set) {
    res.status(400).json({ error: 'Påkrevd: id, name, set' });
    return;
  }
  card.lastUpdated = new Date().toISOString();
  try {
    await upsertCard(card as unknown as Parameters<typeof upsertCard>[0]);
    res.status(201).json(card);
  } catch (err) {
    console.error('upsertCard feilet:', err);
    res.status(500).json({ error: 'DB-feil' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const card = { ...req.body as Record<string, unknown>, id: req.params.id, lastUpdated: new Date().toISOString() };
  try {
    await upsertCard(card as Parameters<typeof upsertCard>[0]);
    res.json(card);
  } catch (err) {
    console.error('upsertCard feilet:', err);
    res.status(500).json({ error: 'DB-feil' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteCardById(String(req.params['id']));
    res.status(204).end();
  } catch (err) {
    console.error('deleteCardById feilet:', err);
    res.status(500).json({ error: 'DB-feil' });
  }
});

router.post('/reset', async (_req: Request, res: Response) => {
  try {
    await resetCards(SEED_DATA);
    res.json({ message: `Tilbakestilt til ${SEED_DATA.length} standard-kort` });
  } catch (err) {
    console.error('resetCards feilet:', err);
    res.status(500).json({ error: 'DB-feil' });
  }
});

export default router;
