import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Register.css";



function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <h1>Register</h1>

      {message && <p>{message}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className='btn-custom'>Register</button>
      </form>
      <p>Already have an account?</p>
      <button className='btn-custom' onClick={() => navigate('/Login')}>Back to Login</button>
      <button className='btn-custom' onClick={() => navigate('/')}>Home</button>
    </div>
  );
};

export default Register;
