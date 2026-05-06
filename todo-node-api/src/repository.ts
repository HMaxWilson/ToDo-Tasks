import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { TodoItem } from './types';

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'todos.json');

interface Store {
  nextId: number;
  items: TodoItem[];
}

function ensureDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function readStore(): Promise<Store> {
  ensureDir();
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(raw) as Store;
  } catch {
    return { nextId: 1, items: [] };
  }
}

async function writeStore(store: Store): Promise<void> {
  ensureDir();
  await fs.writeFile(FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// Serializes all mutating operations to avoid concurrent write races.
let writeTail: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeTail.then(fn);
  writeTail = next.catch(() => undefined);
  return next;
}

export async function getAll(): Promise<TodoItem[]> {
  const store = await readStore();
  return store.items;
}

export async function getById(id: number): Promise<TodoItem | undefined> {
  const store = await readStore();
  return store.items.find((t) => t.id === id);
}

export function add(item: Partial<TodoItem>): Promise<TodoItem> {
  return enqueue(async () => {
    const store = await readStore();
    const newItem: TodoItem = {
      id: store.nextId,
      title: item.title ?? '',
      isComplete: item.isComplete ?? false,
      createdAt: new Date().toISOString(),
    };
    store.nextId += 1;
    store.items.push(newItem);
    await writeStore(store);
    return newItem;
  });
}

export function update(id: number, patch: Partial<TodoItem>): Promise<TodoItem | undefined> {
  return enqueue(async () => {
    const store = await readStore();
    const existing = store.items.find((t) => t.id === id);
    if (!existing) return undefined;

    if (patch.title !== undefined) existing.title = patch.title;
    if (patch.isComplete !== undefined) existing.isComplete = patch.isComplete;

    await writeStore(store);
    return existing;
  });
}

export function remove(id: number): Promise<boolean> {
  return enqueue(async () => {
    const store = await readStore();
    const index = store.items.findIndex((t) => t.id === id);
    if (index === -1) return false;

    store.items.splice(index, 1);
    await writeStore(store);
    return true;
  });
}
