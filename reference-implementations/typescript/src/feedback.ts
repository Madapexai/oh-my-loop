/** Consent-gated local outcome store. Do not use for sensitive life memory. */

import * as fs from "fs";
import * as pathModule from "path";

export interface FeedbackEntry {
  timestamp: string;
  task: string;
  pattern: string;
  success: boolean;
  costTokens: number;
  failureMode?: string;
}

export class FeedbackStore {
  constructor(
    private readonly path: string = "feedback.json",
    private readonly consent: boolean = false,
    private readonly maxEntries: number = 1000,
  ) {}

  record(entry: Omit<FeedbackEntry, "timestamp">): void {
    if (!this.consent) throw new Error("feedback persistence requires explicit consent");
    const history = this.read();
    history.push({ ...entry, timestamp: new Date().toISOString() });
    this.write(history.slice(-this.maxEntries));
  }

  getRecent(n: number = 20): FeedbackEntry[] { return this.read().slice(-Math.max(0, n)); }

  getFailureRate(pattern?: string): number {
    const history = pattern ? this.read().filter((h) => h.pattern === pattern) : this.read();
    if (history.length === 0) return 0;
    return history.filter((h) => !h.success).length / history.length;
  }

  private read(): FeedbackEntry[] {
    if (!fs.existsSync(this.path)) return [];
    const value: unknown = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    if (!Array.isArray(value)) throw new Error("feedback store is corrupt: expected an array");
    return value as FeedbackEntry[];
  }

  private write(data: FeedbackEntry[]): void {
    const directory = pathModule.dirname(pathModule.resolve(this.path));
    fs.mkdirSync(directory, { recursive: true });
    const temp = `${this.path}.${process.pid}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(data, null, 2), { encoding: "utf-8", mode: 0o600 });
    fs.renameSync(temp, this.path);
  }
}
