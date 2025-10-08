import { useState } from 'react'
import { useUser } from '../../contexts/UserContext'

const PlayerName = () => {
    const { username, setUsername, setUserToken } = useUser()
    const [isEditing, setIsEditing] = useState(false)
    const [tempName, setTempName] = useState(username || '')

    const handleEdit = () => {
        setTempName(username || '')
        setIsEditing(true)
    }

    const handleSave = async () => {
        if (tempName.trim()) {
            console.log('API URL:', import.meta.env.VITE_API_URL);

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/players/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: tempName.trim() }),
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Save the token in context
                    if (data.token) {
                        setUserToken(data.token);
                    }
                    setUsername(tempName.trim());
                }
            } catch (error) {
                console.error('Failed to create/update player:', error);
            }
        }
        setIsEditing(false)
    }

    const handleCancel = () => {
        setTempName(username || '')
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            handleCancel()
        }
    }

    return (
        <div className="p-4 border border-gray-300 rounded bg-white shadow">
            <div className="mb-2 font-bold">Player Name:</div>
            {isEditing ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded"
                        autoFocus
                    />
                    <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{username}</span>
                    <button
                        onClick={handleEdit}
                        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Edit
                    </button>
                </div>
            )}
        </div>
    )
}

export default PlayerName
