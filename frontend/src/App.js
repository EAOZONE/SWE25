// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TempLogin from './Login';
import NewEntry from './NewEntry';
import ViewEntries from './ViewEntries';
import RandomEntry from './RandomEntry';
import Register from './Register';
import Header from './Header';
import Home from './Home';
import Homepage from './Homepage'
import '/'

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Homepage/>} />
        <Route path="/login" element={<TempLogin />} />
        <Route path='/register' element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/entries" element={<NewEntry />} />
        <Route path="/view_entries" element={<ViewEntries />} />
        <Route path="/random_entry" element={<RandomEntry />} />
      </Routes>
    </Router>
  );
}

export default App;
