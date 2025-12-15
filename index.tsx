import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Equilibrium Ledger Engine: Initializing mount...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical Failure: Could not find root element '#root' in DOM.");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Equilibrium Ledger Engine: Rendered successfully.");
} catch (error) {
  console.error("Equilibrium Ledger Engine: Initialization crashed.", error);
}