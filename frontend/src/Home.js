import React, {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";


function Home() {
    const navigate = useNavigate();
    const [streak, setStreak] = useState(0);
    const streakFetched = useRef(false);

    useEffect(() => {
        if (!streakFetched.current) {
            streakFetched.current = true;
            fetch("/streak", { credentials: "include" })
                .then(response => response.json())
                .then(data => {
                    if (data.streak !== undefined) {
                        setStreak(data.streak);
                    }
                })
                .catch(error => console.error("Error fetching streak:", error));
        }
    }, []);

    return (
        <div className="home-container">
            <h1 className="home-title">Welcome!</h1>
            <h2 className="streak-text">Your Gratitude Streak: {streak}</h2>
            <div className="hearts-container">
            </div>
            <div className="jar-container">
            <img src="/images/jar3.png" alt="Jar of Joy" className="jar-image" />
                <button className="jar-button" onClick={() => navigate('/entries')}>
                    Add An Entry to Your Jar
                </button>
            </div>

            <div className="button-container">
                <button className="btn-custom btn-home"onClick={() => navigate('/view_entries')}>
                    View All Entries
                </button>
                <button className="btn-custom btn-home" onClick={() => navigate('/random_entry')}>
                    Random Entry
                </button>
            </div>
        </div>
    );
}

export default Home;