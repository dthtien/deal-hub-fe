import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter as Router } from "react-router-dom";
import './index.css'
import { HelmetProvider } from 'react-helmet-async';

const helmetContext = {};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider context={helmetContext}>
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>,
  </HelmetProvider>
)
