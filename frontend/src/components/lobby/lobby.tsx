import { useState, useEffect } from 'react';
import CreateSessionForm from './create_session_form';
import { useUser } from '../../contexts/UserContext';
import SessionItem from './session_item';

interface Player {
  _id: string;
  name: string;
  role: string;
  action_points: number;
  token: string;
  __v: number;
}

interface Session {
  _id: string;
  name: string;
  player_a: Player | null;
  player_b: Player | null;
}

export default function Lobby() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const { userToken, setSessionId } = useUser();

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions`);
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async (sessionName: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sessionName }),
      });
      if (response.ok) {
        await fetchSessions();
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    if (!userToken) {
      console.error('No user token available');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/sessions/${sessionId}/join`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerToken: userToken }),
        }
      );

      if (response.ok) {
        setSessionId(sessionId);
        await fetchSessions();
      }
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Game Lobby</h1>
          <button
            onClick={fetchSessions}
            className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-sm shadow-md border border-indigo-200 flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <CreateSessionForm onCreateSession={handleCreateSession} />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Active Sessions</h2>
          
          {sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-4 text-center text-gray-500 text-sm">
              No sessions available. Create one to get started!
            </div>
          ) : (
            sessions.map((session) => (
              <SessionItem 
                key={session._id} 
                session={session} 
                onJoin={handleJoinSession}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
