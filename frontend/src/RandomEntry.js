import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";

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
      <div className="random-entry-container">
        <h2>Random Gratitude Entry</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{color: 'red'}}>{error}</p>}

        {!loading ? (
            entry ? (
                <div className="random-entry">
                  <p>{entry.content}</p>
                  <small>{new Date(entry.time).toLocaleString()}</small>
                </div>
            ) : (
                <p>No entries found. Start writing gratitude entries!</p>
            )) : null}
        <button onClick={fetchRandomEntry}>Get Random Entry</button>
        <button onClick={handleTweet}>
          Share on Twitter
        </button>
        <button type="home-btn" onClick={() => navigate('/home')}>
          Home
        </button>
      </div>
  );
}

export default RandomEntry;