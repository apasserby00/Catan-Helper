import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "@/App";
import { clearActiveSession, clearHistory } from "@/lib/db";

describe("game flow", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearActiveSession();
    await clearHistory();
  });

  afterEach(() => {
    cleanup();
  });

  it("starts, restores, pauses, resumes, finishes, and shows history", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(await screen.findByRole("button", { name: /start game/i }));
    expect(await screen.findByText("running")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /settings/i }));
    await user.click(screen.getAllByRole("switch")[0]);
    await user.click(screen.getByRole("button", { name: /close sheet/i }));

    unmount();
    render(<App />);
    expect(await screen.findByText("running")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /pause/i }));
    expect(await screen.findByText("paused")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /resume/i }));
    expect(await screen.findByText("running")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /finish/i }));
    await user.type(screen.getByLabelText(/winner/i), "Jamie");
    await user.click(screen.getByRole("button", { name: /save game/i }));

    await user.click(screen.getByRole("button", { name: /history/i }));
    await waitFor(() => {
      expect(screen.getByText(/winner: jamie/i)).toBeInTheDocument();
    });
  });
});
