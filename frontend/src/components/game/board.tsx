// Board.tsx
import Field from './field';
import { useUser } from '../../contexts/UserContext';

interface Cell {
  cost: number;
  income: number;
  ownerPoints: number;
  owner: string | null;
  takeoverRound: number | null;
  blockUntilRound: number | null;
  _id: string;
  takeoverHistory: any[];
}

interface BoardProps {
  boardData: Cell[][] | null;
  currentRound: number;
  currentPlayer?: string;
}

export default function Board({ boardData, currentRound, currentPlayer }: BoardProps) {
  const { userToken, sessionId } = useUser();

  const handleCellClick = async (row: number, col: number) => {
    if (!sessionId || !userToken) {
      console.error('Missing session ID or player token');
      return;
    }

    // Check if cell is blocked
    const cellData = boardData?.[row]?.[col];
    if (cellData?.blockUntilRound && cellData.blockUntilRound > currentRound) {
      alert(`This field is locked until round ${cellData.blockUntilRound}`);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/play/make_move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          playerToken: userToken,
          fieldX: row,
          fieldY: col,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || `Error: ${response.status} ${response.statusText}`);
        return;
      }
      
    } catch (error) {
      console.error('Error making move:', error);
      alert('Failed to make move. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="inline-grid grid-cols-9 gap-0 border-4 border-gray-800 shadow-2xl rounded-lg overflow-hidden">
        {Array.from({ length: 81 }).map((_, cell) => {
          const row = Math.floor(cell / 9);
          const col = cell % 9;
          
          // Get cell data from boardData if available
          const cellData = boardData?.[row]?.[col];
          const isCurrentPlayer = cellData?.owner === currentPlayer;
          
          return (
            <div
              key={cell}
              className={`${
                isCurrentPlayer 
                  ? 'ring-4 ring-yellow-400 ring-inset shadow-lg shadow-yellow-400/50 z-10' 
                  : ''
              }`}
            >
              <Field
                row={row}
                col={col}
                value={cellData?.owner || null}
                cost={cellData?.cost || 0}
                income={cellData?.income || 0}
                ownerPoints={cellData?.ownerPoints || 0}
                blockUntilRound={cellData?.blockUntilRound || null}
                currentRound={currentRound}
                onClick={() => handleCellClick(row, col)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
