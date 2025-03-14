import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";


function Home() {
    const navigate = useNavigate();
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        fetch("/streak", { credentials: "include" })
            .then(response => response.json())
            .then(data => {
                if (data.streak !== undefined) {
                    setStreak(data.streak);
                }
            })
            .catch(error => console.error("Error fetching streak:", error));
    }, []);

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
    };

    return (
        <div className="home-container">
            <h1 className="home-title">Welcome!</h1>
            <h2 className="streak-text">Daily Streak: {streak}</h2>
            <div className="hearts-container">
            </div>
            <div className="jar-container">
                <button className="jar-button" onClick={() => navigate('/entries')}>
                    Add An Entry to Your Jar
                </button>
                <img src="/images/jar3.png" alt="Jar of Joy" className="jar-image" />
            </div>
            <div className="button-container">
                <button className="btn-custom"onClick={() => navigate('/view_entries')}>
                    View All Entries
                </button>
                <button className="btn-custom" onClick={() => navigate('/random_entry')}>
                    Random Entry
                </button>
                <button 
                    className="btn-custom" 
                    onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Home;