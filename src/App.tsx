import { GameProvider } from "@/app/game-store";
import { GameScreen } from "@/components/game-screen";

export default function App() {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
}
