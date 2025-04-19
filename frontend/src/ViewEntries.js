import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './ViewEntries.css'


const ViewEntries = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const handleTweet = (content) => {
    if (!content) {
      alert("No entry to share!\nWrite a gratitude entry first.");
      return;
    }
    const tweetText = encodeURIComponent(`${content}\n#JarOfJoy #Gratitude`);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, "_blank");
  };
  

const deleteAllEntries = async () => {
  const confirmed = window.confirm("Are you sure you want to delete all entries? This can not be undone.");
  if (!confirmed) return;
  try {
    const response = await fetch('/delete_entries', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const rawBody = await response.text(); // read once

      let errorMessage = 'Failed to delete entries.';
      try {
        const data = JSON.parse(rawBody); // try to parse JSON from raw text
        errorMessage = data.error || errorMessage;
      } catch (e) {
        console.error('Non-JSON error response:', rawBody);
      }

      throw new Error(errorMessage);
    }

    setEntries([]);
  } catch (err) {
    setError(err.message);
  }
};


  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/view_entries', { credentials: 'include' });

        if (!response.ok) {
          throw new Error('Failed to load entries');
        }

        const data = await response.json();
        setEntries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (loading) return <p>Loading entries...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="entries-container">
      <div className="entries-header">
        <h2 className="entries-title">Your Gratitude Entries</h2>
        
        <div className="nav-buttons">
          <button onClick={() => navigate('/entries')} className="btn-custom">
            Write an Entry
          </button>
         <button onClick={() => navigate('/home')} className="btn-custom">
            Home
         </button>
        

        {entries.length > 0 && (
          <button onClick={deleteAllEntries} className="btn-custom clear-btn">
          Clear All
        </button>

        )}
        </div>
        

      </div>

  {entries.length === 0 ? (
    <p>No entries yet. Add an entry to your jar!</p>
  ) : (
    <div className="entries-list">
        {entries.map((entry, index) => (
          <div key={index} className="entry-card">
          <p className="entry-content">{entry.content}</p>
          <div className="entry-footer">
            <small className="entry-time">{new Date(entry.time).toLocaleString()}</small>
            <div className="twitter-btn-container">
              <button
                onClick={() => handleTweet(entry.content)}
                className="twitter-btn"
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
        ))}
    </div>
  )}
</div>
  );
};

export default ViewEntries;
