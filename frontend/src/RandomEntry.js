import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import './RandomEntry.css'

function RandomEntry() {
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fetchCalled = useRef(false);

  const fetchRandomEntry = async () => {
    setLoading(true);
    try {
      const response = await fetch('/random_entry', { credentials: 'include' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch entry.');
      }

      const data = await response.json();
      setEntry(data);
      setError('');
    } catch (err) {
      setError(err.message);
      setEntry(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTweet = () => {
    if (!entry) {
      alert("No entry to share!\nWrite a gratitude entry first.");
      return;
    }
    const tweetText = encodeURIComponent(`${entry.content}\n#JarOfJoy #Gratitude`);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, "_blank");
};

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      fetchRandomEntry();
    }
  }, []);

  return (
    <div className="entries-container">
      <div className="center-title">
        <h2 className="entries-title">
          Random Gratitude Entry
        </h2>
      </div>
  
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
  
      {!loading && entry ? (
        <div className="random-entry-card">
          <p className="entry-content">{entry.content}</p>
          <div className="entry-footer">
            <small className="entry-time">{new Date(entry.time).toLocaleString()}</small>
            <div className="twitter-btn-container">
              <button 
                className="twitter-btn" 
                onClick={handleTweet}
              >
                <img 
                  src="/images/twitter-white.png" 
                  alt="Twitter"
                  className="twitter-icon" 
                />
                Share on Twitter
              </button>
            </div>
          </div>
        </div>
      ) : !loading ? (
        <p>No entries found. Start writing gratitude entries!</p>
      ) : null}
  
      <div className="random-nav-buttons-wrapper">
      <button onClick={fetchRandomEntry} className="btn-custom-random">
        Random Entry
      </button>
        <button onClick={() => navigate('/home')} className="btn-custom-random">
          Home
        </button>
      </div>
    </div>
  );
  
}

export default RandomEntry;