import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// 디자인을 위한 css파일
import "./assets/vendor/nucleo/css/nucleo.css";
import "./assets/scss/argon-dashboard-react.scss";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

