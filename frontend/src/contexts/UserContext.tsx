import { createContext, useContext, useEffect, useState } from 'react'

interface UserContextType {
    username: string
    userToken: string | null
    sessionId: string | null
    setUsername: (username: string) => void
    setUserToken: (token: string | null) => void
    setSessionId: (sessionId: string | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
}

const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

export const UserProvider = ({ children }: { children: any }) => {
    const [username, setUsernameState] = useState<string>(() => getCookie('username') || 'Dyzio')
    const [userToken, setUserTokenState] = useState<string | null>(() => getCookie('userToken'))
    const [sessionId, setSessionIdState] = useState<string | null>(() => getCookie('sessionId'))

    const setUsername = (username: string) => {
        setUsernameState(username)
        setCookie('username', username)
    }

    const setUserToken = (token: string | null) => {
        setUserTokenState(token)
        if (token) {
            setCookie('userToken', token)
        } else {
            deleteCookie('userToken')
        }
    }

    const setSessionId = (sessionId: string | null) => {
        setSessionIdState(sessionId)
        if (sessionId) {
            setCookie('sessionId', sessionId)
        } else {
            deleteCookie('sessionId')
        }
    }

    // Create default player on mount if no token exists
    useEffect(() => {
        if (!userToken) {
            const createDefaultPlayer = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/players/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: username }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.token) {
                            setUserToken(data.token);
                        }
                    }
                } catch (error) {
                    console.error('Failed to create default player:', error);
                }
            };

            createDefaultPlayer();
        }
    }, []);

    return (
        <UserContext.Provider
            value={{
                username,
                userToken,
                sessionId,
                setUsername,
                setUserToken,
                setSessionId,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
