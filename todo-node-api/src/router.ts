import { Application, Request, Response } from 'express';
import * as repo from './repository';

// Full path regex for keyed routes, e.g. /odata/TodoItems(42)
const COLLECTION = '/odata/TodoItems';
const KEY_RE = /^\/odata\/TodoItems\((\d+)\)$/;

function parseKey(req: Request): number | null {
  const match = req.path.match(KEY_RE);
  return match ? parseInt(match[1], 10) : null;
}

export function registerRoutes(app: Application): void {
  // GET /odata/TodoItems
  app.get(COLLECTION, async (_req: Request, res: Response) => {
    const items = await repo.getAll();
    res.json({ value: items });
  });

  // GET /odata/TodoItems(id)
  app.get(KEY_RE, async (req: Request, res: Response) => {
    const id = parseKey(req);
    if (id === null) { res.status(400).json({ error: 'Invalid key' }); return; }
    const item = await repo.getById(id);
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  });

  // POST /odata/TodoItems
  app.post(COLLECTION, async (req: Request, res: Response) => {
    const body = req.body as { title?: string; isComplete?: boolean };
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    const created = await repo.add(body);
    res.status(201).json(created);
  });

  // PUT /odata/TodoItems(id)
  app.put(KEY_RE, async (req: Request, res: Response) => {
    const id = parseKey(req);
    if (id === null) { res.status(400).json({ error: 'Invalid key' }); return; }
    const updated = await repo.update(id, req.body as { title?: string; isComplete?: boolean });
    if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(updated);
  });

  // PATCH /odata/TodoItems(id)
  app.patch(KEY_RE, async (req: Request, res: Response) => {
    const id = parseKey(req);
    if (id === null) { res.status(400).json({ error: 'Invalid key' }); return; }
    const updated = await repo.update(id, req.body as { title?: string; isComplete?: boolean });
    if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(updated);
  });

  // DELETE /odata/TodoItems(id)
  app.delete(KEY_RE, async (req: Request, res: Response) => {
    const id = parseKey(req);
    if (id === null) { res.status(400).json({ error: 'Invalid key' }); return; }
    const deleted = await repo.remove(id);
    if (!deleted) { res.status(404).json({ error: 'Not found' }); return; }
    res.status(204).send();
  });
}
