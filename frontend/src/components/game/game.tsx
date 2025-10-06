// Game.tsx
import { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import Board from './board';
import GameOverBanner from './gameover';

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

interface Player {
  _id: string;
  name: string;
  role: string;
  action_points: number;
  token: string;
}

interface SessionData {
  type: string;
  session?: {
    _id: string;
    name: string;
    player_a: Player | null;
    player_b: Player | null;
    action_points_a: number;
    action_points_b: number;
    points_a: number;
    points_b: number;
    playerTurn: string;
    currentRound: number;
    status: "waiting" | "active" | "completed";
    board: Cell[][];
    winner: "player_a" | "player_b" | "draw" | null;
  };
  sessionId?: string;
}

export default function Game() {
  const { sessionId, userToken } = useUser();
  const [sessionData, setSessionData] = useState<SessionData['session'] | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Create SSE connection
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/sessions/${sessionId}/stream`
    );

    eventSource.onmessage = (event) => {
      // Skip heartbeat messages
      if (event.data === ':heartbeat') return;

      try {
        const data: SessionData = JSON.parse(event.data);

        // Update session data when session_update is received
        if (data.type === 'session_update' && data.session) {
          setSessionData(data.session);
          console.log('Session data updated:', data.session);
        }

      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    // Cleanup: close connection when component unmounts or sessionId changes
    return () => {
      console.log('Closing SSE connection');
      eventSource.close();
    };
  }, [sessionId]);

  const handleEndTurn = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/play/end_turn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          playerToken: userToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end turn');
      }

      const data = await response.json();
      console.log('Turn ended successfully:', data);
    } catch (error) {
      console.error('Error ending turn:', error);
      // TODO: Add user-facing error handling
    }
  };

  // const handleLeaveGame = () => {
  //   console.log('Leave Game button clicked');
  //   // TODO: Add API call to leave game
  // };

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-8">
      {/* Winner Announcement */}
      <GameOverBanner
        winner={sessionData.winner}
        currentRound={sessionData.currentRound}
        player_a={sessionData.player_a}
        player_b={sessionData.player_b}
        points_a={sessionData.points_a}
        points_b={sessionData.points_b}
      />

      {/* Game Info Header */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-4 text-center">{sessionData.name}</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Player A Info */}
          <div className={`bg-blue-50 p-4 rounded ${
                sessionData.playerTurn === 'player_a' && sessionData.status === 'active' ? 'border-[5px] border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.9)]' : ''
          }`}>
            <h2 className="font-semibold text-lg mb-2">Player A</h2>
            <p className="text-gray-700">
              {sessionData.player_a ? sessionData.player_a.name : 'Waiting...'}
            </p>
            {sessionData.player_a && ( <>
              <p className="text-sm text-gray-600">
                Points: {sessionData.points_a} ⭐
              </p>
              <p className="text-sm text-gray-600">
                Action Points: {sessionData.action_points_a}
              </p>
            </>)}
          </div>

          {/* Player B Info */}
          <div className={`bg-red-50 p-4 rounded ${
                sessionData.playerTurn === 'player_b' && sessionData.status === 'active' ? 'border-[5px] border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.9)]' : ''
          }`}>
            <h2 className="font-semibold text-lg mb-2">Player B</h2>
            <p className="text-gray-700">
              {sessionData.player_b ? sessionData.player_b.name : 'Waiting...'}
            </p>
            {sessionData.player_b && ( <>
              <p className="text-sm text-gray-600">
                Points: {sessionData.points_b} ⭐
              </p>
              <p className="text-sm text-gray-600">
                Action Points: {sessionData.action_points_b}
              </p>
            </>)}
          </div>
        </div>

        {/* Game Status */}
        <div className="flex justify-between items-center border-t pt-4">
          <div>
            <span className="font-semibold">Status: </span>
            <span className={`px-3 py-1 rounded ${
              sessionData.status === 'active' ? 'bg-green-200 text-green-800' :
              sessionData.status === 'waiting' ? 'bg-yellow-200 text-yellow-800' :
              'bg-gray-200 text-gray-800'
            }`}>
              {sessionData.status.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="font-semibold">Round: </span>
            <span className="text-lg">{sessionData.currentRound}</span>
          </div>
        </div>
      </div>

      {/* Board */}
      <Board boardData={sessionData.board} currentRound={sessionData.currentRound} />

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleEndTurn}
          disabled={sessionData.winner !== null}
          className={`w-full px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
            sessionData.winner !== null
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          End Turn
        </button>
        {/*
        <button
          onClick={handleLeaveGame}
          className="w-full px-4 py-2 bg-red-200 text-red-800 rounded-lg hover:bg-red-300 transition-colors font-medium text-sm"
        >
          Leave Game
        </button>
        */}
      </div>
    </div>
  );
}
