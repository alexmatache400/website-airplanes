import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// COMPREHENSIVE browser extension error suppression (MetaMask, etc.)
// Our code contains NO Web3/crypto - these are external extension errors only
if (typeof window !== 'undefined') {
  // Helper to check if error is from browser extension
  const isExtensionError = (errorMsg: string): boolean => {
    return (
      errorMsg.includes('MetaMask') ||
      errorMsg.includes('ethereum') ||
      errorMsg.includes('chrome-extension') ||
      errorMsg.includes('moz-extension') ||
      errorMsg.includes('nkbihfbeogaeaoehlefnkodbefgpgknn') ||
      errorMsg.includes('Failed to connect') ||
      errorMsg.includes('wallet') ||
      errorMsg.includes('Web3')
    );
  };

  // 1. Suppress console.error from extensions
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const errorString = args.join(' ');
    if (isExtensionError(errorString)) {
      return; // Suppress extension errors
    }
    originalError.apply(console, args);
  };

  // 2. Suppress runtime errors from extensions
  window.addEventListener('error', (event) => {
    if (event.error && isExtensionError(event.error.toString())) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    if (event.message && isExtensionError(event.message)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // 3. Suppress unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || '';
    if (isExtensionError(reason)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // 4. Override window.onerror
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const errorMsg = message?.toString() || '';
    if (isExtensionError(errorMsg) || (source && source.includes('chrome-extension'))) {
      return true; // Prevent default error handling
    }
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
