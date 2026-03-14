import Dexie, { type Table } from "dexie";
import type { ActiveGameSession, GameHistoryRecord } from "@/types";

class CatanHelperDatabase extends Dexie {
  activeSession!: Table<ActiveGameSession, string>;
  history!: Table<GameHistoryRecord, string>;

  constructor() {
    super("CatanHelperDatabase");
    this.version(1).stores({
      activeSession: "id, status, startedAt",
      history: "id, startedAt, finishedAt"
    });
  }
}

export const db = new CatanHelperDatabase();

const ACTIVE_SESSION_KEY = "active";

export async function getActiveSession() {
  return db.activeSession.get(ACTIVE_SESSION_KEY);
}

export async function saveActiveSession(session: ActiveGameSession) {
  await db.activeSession.put({ ...session, id: ACTIVE_SESSION_KEY });
}

export async function clearActiveSession() {
  await db.activeSession.clear();
}

export async function listHistory() {
  return db.history.orderBy("finishedAt").reverse().toArray();
}

export async function addHistory(record: GameHistoryRecord) {
  await db.history.put(record);
  await pruneHistory(30);
}

export async function deleteHistory(id: string) {
  await db.history.delete(id);
}

export async function clearHistory() {
  await db.history.clear();
}

export async function pruneHistory(limit: number) {
  const records = await db.history.orderBy("finishedAt").reverse().toArray();
  const stale = records.slice(limit);

  if (stale.length > 0) {
    await db.history.bulkDelete(stale.map((record) => record.id));
  }
}
