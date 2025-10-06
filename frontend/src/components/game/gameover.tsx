// GameOverBanner.tsx
interface Player {
  _id: string;
  name: string;
  role: string;
  action_points: number;
  token: string;
}

interface GameOverBannerProps {
  winner: "player_a" | "player_b" | "draw" | null;
  currentRound: number;
  player_a: Player | null;
  player_b: Player | null;
  points_a: number;
  points_b: number;
}

export default function GameOverBanner({
  winner,
  currentRound,
  player_a,
  player_b,
  points_a,
  points_b
}: GameOverBannerProps) {
  if (!winner) return null;

  return (
    <div className="mb-6 bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl border-4 border-indigo-700">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4 text-indigo-600">
          🎉 Game Over! 🎉
        </h2>
        {winner === 'draw' ? (
          <p className="text-2xl text-gray-700">
            It's a <span className="font-bold text-purple-600">Draw!</span>
          </p>
        ) : (
          <p className="text-2xl text-gray-700">
            Winner: <span className={`font-bold ${
              winner === 'player_a' ? 'text-blue-600' : 'text-red-600'
            }`}>
              {winner === 'player_a' 
                ? (player_a?.name || 'Player A')
                : (player_b?.name || 'Player B')}
            </span>
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Final Round: {currentRound}
          </p>
          <div className="flex justify-center gap-8 mt-2">
            <div className="text-sm">
              <span className="font-semibold text-blue-600">
                {player_a?.name || 'Player A'}:
              </span>
              <span className="ml-2">{points_a} ⭐</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-red-600">
                {player_b?.name || 'Player B'}:
              </span>
              <span className="ml-2">{points_b} ⭐</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
