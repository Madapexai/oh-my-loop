/** Optional feedback store - persists loop outcomes across sessions.
 * This is OPTIONAL. Skills are stateless by default; this module provides
 * a simple JSON store for users who want feedback accumulation. */

import * as fs from "fs";

export interface FeedbackEntry {
  timestamp: string;
  task: string;
  pattern: string;
  success: boolean;
  costTokens: number;
  failureMode?: string;
}

export class FeedbackStore {
  constructor(private readonly path: string = "feedback.json") {}

  record(entry: Omit<FeedbackEntry, "timestamp">): void {
    const history = this.read();
    const fullEntry: FeedbackEntry = { ...entry, timestamp: new Date().toISOString() };
    history.push(fullEntry);
    this.write(history);
  }

  getRecent(n: number = 20): FeedbackEntry[] {
    return this.read().slice(-n);
  }

  getFailureRate(pattern?: string): number {
    let history = this.read();
    if (pattern) {
      history = history.filter((h) => h.pattern === pattern);
    }
    if (history.length === 0) return 0;
    const failures = history.filter((h) => !h.success).length;
    return failures / history.length;
  }

  private read(): FeedbackEntry[] {
    if (!fs.existsSync(this.path)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.path, "utf-8"));
    } catch {
      return [];
    }
  }

  private write(data: FeedbackEntry[]): void {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }
}
