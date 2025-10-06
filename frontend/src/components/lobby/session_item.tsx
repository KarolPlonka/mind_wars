import { useUser } from '../../contexts/UserContext';

interface Player {
  _id: string;
  name: string;
  role: string;
  action_points: number;
  token: string;
  __v: number;
}

interface SessionItemProps {
  session: {
    _id: string;
    name: string;
    player_a: Player | null;
    player_b: Player | null;
  };
  onJoin: (sessionId: string) => void;
}

export default function SessionItem({ session, onJoin }: SessionItemProps) {
  const { userToken } = useUser();
  
  const isSessionFull = () => {
    return session.player_a !== null && session.player_b !== null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-gray-800 mb-1.5">
        {session.name}
      </h3>
      
      <div className="flex items-center justify-between gap-2">
        {/* Players */}
        <div className="flex items-center gap-2 text-sm flex-1">
          <span className="flex-1 text-gray-600 font-semibold truncate border border-gray-300 rounded px-2 py-0.5 text-center min-h-[1.75rem] flex items-center justify-center">
            {session.player_a ? (
              <span className="text-green-600">{session.player_a.name}</span>
            ) : (
              <span className="text-gray-400">&nbsp;</span>
            )}
          </span>
          <span className="flex-1 text-gray-600 font-semibold truncate border border-gray-300 rounded px-2 py-0.5 text-center min-h-[1.75rem] flex items-center justify-center">
            {session.player_b ? (
              <span className="text-green-600">{session.player_b.name}</span>
            ) : (
              <span className="text-gray-400">&nbsp;</span>
            )}
          </span>
        </div>
        {/* Join Button */}
        <button
          onClick={() => onJoin(session._id)}
          disabled={isSessionFull() || !userToken}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors shrink-0 ${
            isSessionFull() || !userToken
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          Join
        </button>
      </div>
    </div>
  );
}
