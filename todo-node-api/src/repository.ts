import fs from 'fs';
import path from 'path';
import { TodoItem } from './types';

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'todos.json');

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readAll(): TodoItem[] {
  ensureFile();
  const raw = fs.readFileSync(FILE_PATH, 'utf-8');
  return JSON.parse(raw) as TodoItem[];
}

function writeAll(items: TodoItem[]): void {
  ensureFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(items, null, 2), 'utf-8');
}

export function getAll(): TodoItem[] {
  return readAll();
}

export function getById(id: number): TodoItem | undefined {
  return readAll().find((t) => t.id === id);
}

export function add(item: Partial<TodoItem>): TodoItem {
  const items = readAll();
  const newId = items.length > 0 ? Math.max(...items.map((t) => t.id)) + 1 : 1;
  const newItem: TodoItem = {
    id: newId,
    title: item.title ?? '',
    isComplete: item.isComplete ?? false,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeAll(items);
  return newItem;
}

export function update(id: number, patch: Partial<TodoItem>): TodoItem | undefined {
  const items = readAll();
  const existing = items.find((t) => t.id === id);
  if (!existing) return undefined;

  if (patch.title !== undefined) existing.title = patch.title;
  if (patch.isComplete !== undefined) existing.isComplete = patch.isComplete;

  writeAll(items);
  return existing;
}

export function remove(id: number): boolean {
  const items = readAll();
  const index = items.findIndex((t) => t.id === id);
  if (index === -1) return false;

  items.splice(index, 1);
  writeAll(items);
  return true;
}
