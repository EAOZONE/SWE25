import React, {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
    const navigate = useNavigate();
    const [showLogout, setShowLogout] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const toggleProfile = () => {
        setShowLogout(!showLogout);
        setShowNotifications(!showNotifications);
    };

        const handleLogout = () => {
        fetch("/logout", {
            method: "POST",
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            console.log("Logged out:", data);
            navigate("/"); // Redirect to login page
        })
        .catch(error => console.error("Logout error:", error));
        toggleProfile();
    };
  const handleNotifications = () => {
        navigate('/notifications');
        toggleProfile(); // Call toggleProfile when navigating to notifications
    };

    return (
        <header className="header">
            <div className="container">
                <h1 className="header-brand cabin-sketch-bold">
                    jar of joy
                </h1>
                <div className="profile-container">
                    <button className="profile-icon" onClick={toggleProfile}>
                        👤 {/* Replace with an actual icon if needed */}
                    </button>
                    {showLogout && (
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    )}
                    {showNotifications && (
                        <button className="notification-button" onClick={handleNotifications}>
                            Notifications
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;