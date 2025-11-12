import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import useZustandAuth from "../hooks/useAuth"
import "./Protected.css"

interface ProtectedProps {
    children: React.ReactNode
}

const Protected: React.FC<ProtectedProps> = ({ children }) => {
    const navigate = useNavigate() 
    const isAuthenticated = useZustandAuth()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // Small delay to check authentication
        const timer = setTimeout(() => {
            setIsChecking(false)
            
            if (!isAuthenticated) {
                // Redirect to sign in after a brief moment
                const redirectTimer = setTimeout(() => {
                    navigate("/signin", { replace: true })
                }, 1500)
                
                return () => clearTimeout(redirectTimer)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [isAuthenticated, navigate])

    // Show loader while checking authentication
    if (isChecking) {
        return (
            <div className="protected-loader-container">
                <div className="protected-loader">
                    <div className="loader-circle"></div>
                    <div className="loader-circle"></div>
                    <div className="loader-circle"></div>
                    <div className="loader-icon">⚡</div>
                </div>
                <p className="loader-text">Loading...</p>
            </div>
        )
    }

    // Show unauthorized message
    if (!isAuthenticated) {
        return (
            <div className="protected-loader-container">
                <div className="unauthorized-card">
                    <div className="unauthorized-icon">🔒</div>
                    <h2 className="unauthorized-title">Access Denied</h2>
                    <p className="unauthorized-message">
                        You need to be signed in to access this page
                    </p>
                    <p className="unauthorized-redirect">
                        Redirecting to Sign In...
                    </p>
                </div>
            </div>
        )
    }

    // Render protected content if authenticated
    return <>{children}</>
}

export default Protected