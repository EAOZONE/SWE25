import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";


const ViewEntries = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

const deleteAllEntries = async () => {
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
      <h2>Your Gratitude Entries</h2>
      {entries.length === 0 ? (
        <p>No entries yet. Start writing gratitude notes!</p>
      ) : (
        <ul>
          {entries.map((entry, index) => (
            <li key={index}>
              <p>{entry.content}</p>
              <small>{new Date(entry.time).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
        <button type="home-btn" onClick={deleteAllEntries}>
            Clear All Entries
        </button>
      <button type="home-btn"onClick={() => navigate('/home')}>
          Home
      </button>
    </div>
  );
};

export default ViewEntries;
