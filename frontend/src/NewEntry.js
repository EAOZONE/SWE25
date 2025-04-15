import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import "./NewEntry.css";
console.log("NewEntry component is rendering!");



function NewEntry() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [entries, setEntries] = useState([]);

  // submit an entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Entry created successfully!');
        setContent('');
        fetchEntries();
      } else {
        console.log("Error here bb") // debuggin
        setMessage(data.error);
      }
    } catch (error) {
      console.log("Request error")
      setMessage('An error occurred. Please try again.');
    }
};

  // fetch past gratitude entries
  const fetchEntries = async () => {
    try {
      const response = await fetch('/entries', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setEntries(data); // store entries in state
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  // fetch entries when the component loads
  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="entry-container">
      <h2>New Gratitude Entry</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="I am grateful for..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <button type="submit">Submit</button>
      </form>
      <button type="home-btn"onClick={() => navigate('/home')}>
          Home
      </button>
    </div>
  );
};

export default NewEntry;
