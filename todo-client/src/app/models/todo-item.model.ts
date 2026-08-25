export interface TodoItem {
  id: number;
  title: string;
  isComplete: boolean;
  createdAt: string;
  /** Position in the user's manual ordering. Only used by the default sort. */
  displayOrder: number;
}
