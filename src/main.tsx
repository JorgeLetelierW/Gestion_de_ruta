import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <BrowserRouter>
      <div
        style={{
          background: 'white',
          color: 'black',
          padding: '50px',
          fontSize: '32px',
        }}
      >
        REACT + CSS + ROUTER FUNCIONAN
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
