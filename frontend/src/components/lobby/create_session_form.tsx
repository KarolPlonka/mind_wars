import { useState } from 'react';

interface CreateSessionFormProps {
  onCreateSession: (sessionName: string) => void;
}

export default function CreateSessionForm({ onCreateSession }: CreateSessionFormProps) {
  const [newSessionName, setNewSessionName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newSessionName.trim() === '') {
      return;
    }

    onCreateSession(newSessionName);
    setNewSessionName('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Create New Session
      </h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          placeholder="Enter session name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
        >
          Create Session
        </button>
      </form>
    </div>
  );
}
