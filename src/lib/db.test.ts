import { beforeEach, describe, expect, it } from "vitest";
import { db, addHistory, clearActiveSession, clearHistory, getActiveSession, listHistory, saveActiveSession } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/settings-storage";
import { createSession, finishSession } from "@/lib/timer";

describe("dexie persistence", () => {
  beforeEach(async () => {
    await clearActiveSession();
    await clearHistory();
  });

  it("saves and restores the active session", async () => {
    const session = createSession(DEFAULT_SETTINGS, 100);
    await saveActiveSession(session);

    const restored = await getActiveSession();
    expect(restored?.status).toBe("running");
    expect(restored?.startedAt).toBe(100);
  });

  it("stores history and prunes to the latest 30 records", async () => {
    for (let index = 0; index < 31; index += 1) {
      const session = createSession(DEFAULT_SETTINGS, index * 1_000);
      await addHistory(finishSession(session, "", index * 1_000 + 500));
    }

    const history = await listHistory();
    expect(history).toHaveLength(30);
  });

  it("supports clearing the database tables", async () => {
    const session = createSession(DEFAULT_SETTINGS, 0);
    await saveActiveSession(session);
    await clearActiveSession();

    expect(await getActiveSession()).toBeUndefined();
    await db.delete();
  });
});
