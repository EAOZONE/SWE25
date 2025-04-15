import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import MyImage from "./efea45499e4aeaad2f9b0c13bff9f8ad.jpg"

// console.log("Rendering Login page"); dubigging

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Keeps session data
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Login successful!');
        setTimeout(() => navigate('/home'), 1000); // Redirect after 1.5s
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
       <img src={MyImage} alt=""/>
      {message && <p>{message}</p>}
      <form onSubmit={handleLogin}>
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
        <button type="submit">Log In</button>
      </form>
      <p>Don't have an account?</p>
      <button onClick={() => navigate('/register')}>Register</button>
      <button onClick={() => navigate('/')}>Home</button>
    </div>
  );
};

export default Login;
