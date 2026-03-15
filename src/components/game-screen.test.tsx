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

    expect(screen.queryByText(/turn reminder/i)).not.toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: /start game/i }));
    expect(await screen.findByText(/game in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/turn timer/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /enable sound/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open settings/i }));
    await user.click(screen.getAllByRole("switch")[0]);
    await user.click(screen.getByRole("button", { name: /close sheet/i }));

    unmount();
    render(<App />);
    expect(await screen.findByText(/game in progress/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next turn/i }));
    expect(screen.getByText(/1 turn finished/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /pause/i }));
    expect(await screen.findByText(/game paused/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /resume/i }));
    expect(await screen.findByText(/game in progress/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /pause/i }));
    await user.click(screen.getByRole("button", { name: /finish/i }));
    await user.type(screen.getByLabelText(/winner/i), "Jamie");
    await user.click(screen.getByRole("button", { name: /save to history/i }));

    await user.click(screen.getByRole("button", { name: /open game history/i }));
    await waitFor(() => {
      expect(screen.getByText(/winner: jamie/i)).toBeInTheDocument();
      expect(screen.getByText(/turn timer: 1m 30s/i)).toBeInTheDocument();
      expect(screen.getByText(/turns played: 1/i)).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/delete history/i));
    expect(screen.getByText(/delete this game/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await waitFor(() => {
      expect(screen.getByText(/you have not finished a game yet/i)).toBeInTheDocument();
    });
  });
});
