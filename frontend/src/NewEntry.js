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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });
  
      const data = await response.json();
      if (response.ok) {
        setMessage('New entry added!');
        setContent('');
        fetchEntries();
  
        setTimeout(() => {
          setMessage('');
        }, 3000);
  
      } else {
        setMessage(data.error);
  
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
  
      setTimeout(() => {
        setMessage('');
      }, 3000);
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
    <div className="entry-card new-entry-card">
      <h2 className="entries-title">New Gratitude Entry</h2>
      
      {message && <p className="success-message">{message}</p>}
     
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="I am grateful for..."
        className="entry-textarea"
      />
      <div className="button-container">
        <button className="btn-custom" onClick={handleSubmit}>Submit</button>
        <button className="btn-custom" onClick={() => navigate('/home')}>Home</button>
      </div>
    </div>
  );
};

export default NewEntry;
