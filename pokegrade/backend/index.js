import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cardsRouter from './routes/cards.js';
import adminRouter from './routes/admin.js';
import { startScheduler } from './jobs/scheduler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/cards', cardsRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`PokeGrade backend kjorer pa port ${PORT}`);
  startScheduler();
});
