import { ApplicantRecord } from '../types';

const DB_NAME = 'educaro_gateway_idb';
const DB_VERSION = 1;
const STORE_APPLICANTS = 'applicants';
const STORE_SNAPSHOTS = 'snapshots';

const LOCAL_STORAGE_KEY = 'educaro_persistent_applicant_record_v2';
const SNAPSHOT_STORAGE_KEY = 'educaro_applicant_snapshots_v2';

/**
 * Open or create IndexedDB instance with fallback safety
 */
function openIDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_APPLICANTS)) {
          db.createObjectStore(STORE_APPLICANTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
          db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'snapshotId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Persist applicant state automatically to localStorage + IndexedDB
 */
export async function persistApplicantLocal(record: ApplicantRecord): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Instant sync to localStorage for immediate synchronous reads
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(record));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }

  // 2. Asynchronous IndexedDB storage for heavy payloads (OCR texts, logs, transcripts)
  try {
    const db = await openIDB();
    if (db) {
      const tx = db.transaction(STORE_APPLICANTS, 'readwrite');
      tx.objectStore(STORE_APPLICANTS).put(record);
    }
  } catch (e) {
    console.warn('IndexedDB write notice:', e);
  }
}

/**
 * Load cached applicant from localStorage / IndexedDB
 */
export async function loadCachedApplicantLocal(): Promise<ApplicantRecord | null> {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('localStorage read error:', e);
  }

  try {
    const db = await openIDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_APPLICANTS, 'readonly');
        const store = tx.objectStore(STORE_APPLICANTS);
        const req = store.getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            resolve(req.result[req.result.length - 1]);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    }
  } catch {
    // fallback
  }

  return null;
}

/**
 * Save explicit snapshot with timestamp
 */
export async function saveProfileSnapshot(record: ApplicantRecord): Promise<{ id: string; timestamp: string }> {
  const timestamp = new Date().toLocaleString();
  const snapshotId = `snap_${Date.now()}`;
  const payload = {
    snapshotId,
    timestamp,
    record: JSON.parse(JSON.stringify(record)),
  };

  try {
    const existing = JSON.parse(localStorage.getItem(SNAPSHOT_STORAGE_KEY) || '[]');
    existing.unshift(payload);
    // Keep last 10 snapshots
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(existing.slice(0, 10)));
  } catch (e) {}

  try {
    const db = await openIDB();
    if (db) {
      const tx = db.transaction(STORE_SNAPSHOTS, 'readwrite');
      tx.objectStore(STORE_SNAPSHOTS).put(payload);
    }
  } catch (e) {}

  return { id: snapshotId, timestamp };
}

/**
 * Export full JSON data record for jury inspection
 */
export function exportApplicantJson(record: ApplicantRecord): void {
  const dataStr = JSON.stringify(record, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedName = (record.personal?.name || 'candidate').replace(/\s+/g, '_');
  link.download = `Educaro_Dossier_${sanitizedName}_${record.id || 'record'}.json`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Purge local stores and reset completely
 */
export async function purgeAllLocalData(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
    localStorage.removeItem('educaro_applicants_sessions_v1');
    localStorage.removeItem('educaro_active_applicant_id_v1');
  } catch (e) {}

  try {
    const db = await openIDB();
    if (db) {
      const tx1 = db.transaction(STORE_APPLICANTS, 'readwrite');
      tx1.objectStore(STORE_APPLICANTS).clear();
      const tx2 = db.transaction(STORE_SNAPSHOTS, 'readwrite');
      tx2.objectStore(STORE_SNAPSHOTS).clear();
    }
  } catch (e) {}
}

export { DatabaseControlBar, type DatabaseControlBarProps } from '../components/DatabaseControlBar';
