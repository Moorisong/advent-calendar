import { APP } from '../config/constants.js';

export function readSession(key) {
  try {
    return sessionStorage.getItem(`${APP.storagePrefix}${key}`);
  } catch {
    return null;
  }
}

export function writeSession(key, value) {
  try {
    sessionStorage.setItem(`${APP.storagePrefix}${key}`, value);
  } catch {
    // Private browsing can disallow storage. The current view remains functional.
  }
}

export function clearSession(key) {
  try {
    sessionStorage.removeItem(`${APP.storagePrefix}${key}`);
  } catch {
    // Storage is optional for preserving temporary navigation context.
  }
}

export function readLocal(key) {
  try {
    return localStorage.getItem(`${APP.storagePrefix}${key}`);
  } catch {
    return null;
  }
}

export function writeLocal(key, value) {
  try {
    localStorage.setItem(`${APP.storagePrefix}${key}`, value);
  } catch {
    // Storage may be disabled; no personal data is saved for tutorials.
  }
}

export function removeLocal(key) {
  try {
    localStorage.removeItem(`${APP.storagePrefix}${key}`);
  } catch {
    // Storage may be unavailable.
  }
}
