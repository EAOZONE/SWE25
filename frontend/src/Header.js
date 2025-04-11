import React, {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
    const navigate = useNavigate();
    const [showLogout, setShowLogout] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const toggleProfile = () => {
        setShowLogout(!showLogout);
        setShowNotifications(!showNotifications);
        setShowDelete(!showDelete);
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
    fetch("/notifications", {
        method: "POST",
        credentials: "include"
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                console.error("Notification Error:", errorData);
                return Promise.reject(errorData);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Notifications:", data);
        navigate("/notifications");
    })
    .catch(error => {
        console.error("Notification:", error);
    });
    toggleProfile();
};
const handleDelete = () => {
    fetch("/deleteAccount", {
        method: "POST",
        credentials: "include"
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                console.error("Error:", errorData);
                return Promise.reject(errorData);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Delete:", data);
        navigate("/");
    })
    .catch(error => {
        console.error("Delete:", error);
    });
    toggleProfile();
}

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
                    {showDelete && (
                        <button className="delete-button" onClick={handleDelete}>
                            Delete Account
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;