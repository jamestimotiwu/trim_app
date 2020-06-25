import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Load from './pages/Load.js';

function App() {
  return (
    <div className="container">
      <BrowserRouter>
        <Route path="/" component={Load} />
      </BrowserRouter>
    </div>
  );
}

export default App;
