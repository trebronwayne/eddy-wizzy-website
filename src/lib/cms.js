import { useEffect, useState } from 'react';

// The public site reads the website content (announcements, news, shows) straight from Firestore's REST
// endpoint. That keeps the Firebase SDK (about 100 KB) out of the pages visitors download; it is only
// loaded inside /admin. Without the VITE_FIREBASE_* settings everything below quietly does nothing.
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
export const cmsEnabled = Boolean(projectId && apiKey);
const root = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

function decode(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, inner]) => [key, decode(inner)]));
  return null;
}
const decodeDoc = (doc) => ({ id: doc.name.split('/').pop(), ...Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, decode(value)])) });

const cache = new Map();
function load(collection, flag) {
  const hit = cache.get(collection);
  if (hit && Date.now() - hit.at < 120000) return hit.promise;
  const promise = fetch(`${root}:runQuery?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: flag }, op: 'EQUAL', value: { booleanValue: true } } }, limit: 100 } }),
  })
    .then((response) => { if (!response.ok) throw new Error(String(response.status)); return response.json(); })
    .then((rows) => rows.filter((row) => row.document).map((row) => decodeDoc(row.document)))
    .catch(() => { cache.delete(collection); return []; });
  cache.set(collection, { at: Date.now(), promise });
  return promise;
}

// Items of `collection` whose `flag` field (active / published) is true.
export function useCms(collection, flag) {
  const [state, setState] = useState({ items: [], loading: cmsEnabled });
  useEffect(() => {
    if (!cmsEnabled) return undefined;
    let live = true;
    load(collection, flag).then((items) => { if (live) setState({ items, loading: false }); });
    return () => { live = false; };
  }, [collection, flag]);
  return state;
}

// Newsletter sign-up. The email is the document id, so signing up twice never creates a duplicate.
export async function subscribeEmail(email, source) {
  const id = email.trim().toLowerCase();
  const response = await fetch(`${root}/subscribers?documentId=${encodeURIComponent(id)}&key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { email: { stringValue: id }, source: { stringValue: source }, createdAt: { timestampValue: new Date().toISOString() } } }),
  });
  if (response.status === 409) return 'exists';
  if (!response.ok) throw new Error(String(response.status));
  return 'ok';
}
