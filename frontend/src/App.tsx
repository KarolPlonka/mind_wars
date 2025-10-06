// import { useState } from 'react'
import './App.css'
import Game from './components/game/game'
import Lobby from './components/lobby/lobby'
import PlayerName from './components/player/player_name'
import { UserProvider } from './contexts/UserContext'

function App() {
    return (
        <UserProvider>
            <div className="flex h-screen">
                <div className="w-[30%] overflow-y-auto border-r border-gray-300">
                    <PlayerName />
                    <Lobby />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <Game />
                </div>
            </div>
        </UserProvider>
    )
}

export default App
