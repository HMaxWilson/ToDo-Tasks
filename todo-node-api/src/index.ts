import express from 'express';
import cors from 'cors';
import { registerRoutes } from './router';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 7234;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

registerRoutes(app);

app.listen(PORT, () => {
  console.log(`Todo Node API listening on http://localhost:${PORT}`);
});
