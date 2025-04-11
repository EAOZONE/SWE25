import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogout, setShowLogout] = useState(false);

    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };

    const handleLogout = () => {
        // Add your logout logic here
        setIsLoggedIn(false);
        setShowLogout(false);
    };

    return (
        <header className="header">
            <div className="container">
                <h1 className="header-brand cabin-sketch-bold">
                    jar of joy
                </h1>
                <div className="profile-container">
                    <button className="profile-icon" onClick={toggleLogout}>
                        👤 {/* Replace with an actual icon if needed */}
                    </button>
                    {showLogout && (
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;