// Field.tsx
interface FieldProps {
  row: number;
  col: number;
  value: string | null;
  cost: number;
  income: number;
  ownerPoints: number;
  blockUntilRound: number | null;
  currentRound: number;
  onClick: () => void;
}

function getBorderStyle(income: number): string {
    if (income >= 8) {
        return 'border-[#6f12fc] border-[9px]'; // Very light purple/lavender
    } else if (income >= 3) {
        return 'border-[#904bfa] border-[4px]'; // Light purple
    } else if (income >= 2) {
        return 'border-[#c6a1ff] border-2'; // Medium-light purple
    }
    return 'border-gray-400 border';
}

export default function Field({ 
  row, 
  col, 
  value, 
  cost,
  income,
  ownerPoints,
  blockUntilRound,
  currentRound,
  onClick 
}: FieldProps) {
  // Get cost-based border styling
  const costBorderStyle = getBorderStyle(income);
  
  // Add thicker borders for 3x3 sections (overlays on top of cost borders)
  const borderRight = (col + 1) % 3 === 0 && col !== 8 ? 'border-r-4 border-r-gray-600' : '';
  const borderBottom = (row + 1) % 3 === 0 && row !== 8 ? 'border-b-4 border-b-gray-600' : '';
  
  // Check if field is locked
  const isLocked = blockUntilRound && blockUntilRound > currentRound;
  const roundsUntilUnlock = isLocked ? blockUntilRound - currentRound : 0;
  
  // Determine background color based on owner
  let bgColor = 'bg-white';
  
  if (value === 'player_a') {
    bgColor = isLocked ? 'bg-blue-200/50' : 'bg-blue-200';
  } else if (value === 'player_b') {
    bgColor = isLocked ? 'bg-red-200/50' : 'bg-red-200';
  } else if (isLocked) {
    bgColor = 'bg-gray-200/50';
  }
  
  return (
    <div
      onClick={onClick}
      className={`w-18 h-18 flex flex-col items-center justify-center ${costBorderStyle} ${bgColor} ${borderRight} ${borderBottom} ${
        isLocked ? 'cursor-not-allowed opacity-60' : 'hover:bg-blue-50 cursor-pointer'
      } transition-colors relative`}
    >
      {/* Lock icon with rounds until unlock */}
      {isLocked && (
        <div className="absolute top-1 right-1 flex items-center gap-0.5">
          <span className="text-xs">🔒</span>
          <span className="text-xs font-bold text-gray-700">{roundsUntilUnlock}</span>
        </div>
      )}
      
      {/* Current points for owned fields */}
      {value && (
        <div className="text-[14px] text-gray-600 flex flex-col gap-1 items-center">
          <p className="text-[12px] text-gray-500">Cost: {cost}</p>
          <p className="font-semibold">{ownerPoints} ⭐</p>
          <p className="text-[12px] text-gray-400">+{income}/round</p>
        </div>
      )}
      
      {/* Cost for unowned fields */}
      {!value && !isLocked && (
        <div className="text-[12px] text-gray-600 flex flex-col items-center gap-1">
          <p className="text-[12px] text-gray-500">Cost: {cost}</p>
          <p className="text-[12x] text-gray-400">+{income}/round</p>
        </div>
      )}
    </div>
  );
}
