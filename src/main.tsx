import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill for __publicField which is sometimes injected by transpilers
// but not defined in the global scope.
(function() {
  const polyfill = (obj: any, key: any, value: any) => {
    if (typeof obj === 'undefined' || obj === null) return value;
    try {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } catch (e) {
      obj[key] = value;
    }
    return value;
  };
  if (typeof (window as any).__publicField === 'undefined') (window as any).__publicField = polyfill;
  if (typeof (globalThis as any).__publicField === 'undefined') (globalThis as any).__publicField = polyfill;
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
