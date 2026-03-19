'use client';

import { getFullSnapshot, mergeSnapshot } from './localDB';

// ─── Constants ───
const CLIENT_ID = '52231852498-t1mckbqpauc4ofbrtkgahfactlcunbov.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const BACKUP_FILENAME = 'sajda_backup.json';
const DRIVE_CONNECTED_KEY = 'sajda_drive_connected';
const DRIVE_LAST_SYNC_KEY = 'sajda_drive_last_sync';

// ─── Types ───
interface TokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
  callback: (response: TokenResponse) => void;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            prompt?: string;
          }) => TokenClient;
          revoke: (token: string, callback?: () => void) => void;
        };
      };
    };
  }
}

// ─── State ───
let accessToken: string | null = null;
let tokenClient: TokenClient | null = null;
let gisLoaded = false;

// ─── Load GIS Script ───
export function loadGISScript(): Promise<void> {
  if (gisLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.getElementById('gis-script')) {
      gisLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => { gisLoaded = true; resolve(); };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

// ─── Initialize Token Client ───
function getTokenClient(): Promise<TokenClient> {
  if (tokenClient) return Promise.resolve(tokenClient);
  return loadGISScript().then(() => {
    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services not loaded');
    }
    return new Promise<TokenClient>((resolve) => {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => {}, // Will be overridden per-call
      });
      tokenClient = client;
      resolve(client);
    });
  });
}

// ─── Sign In ───
export async function signIn(): Promise<string | null> {
  const client = await getTokenClient();
  return new Promise((resolve) => {
    client.callback = (response: TokenResponse) => {
      if (response.error || !response.access_token) {
        resolve(null);
        return;
      }
      accessToken = response.access_token;
      localStorage.setItem(DRIVE_CONNECTED_KEY, 'true');
      resolve(response.access_token);
    };
    client.requestAccessToken({ prompt: 'consent' });
  });
}

// ─── Silent Re-auth (no popup) ───
export async function silentReauth(): Promise<string | null> {
  const client = await getTokenClient();
  return new Promise((resolve) => {
    client.callback = (response: TokenResponse) => {
      if (response.error || !response.access_token) {
        resolve(null);
        return;
      }
      accessToken = response.access_token;
      resolve(response.access_token);
    };
    client.requestAccessToken({ prompt: '' });
  });
}

// ─── Sign Out ───
export function signOut(): void {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  localStorage.removeItem(DRIVE_CONNECTED_KEY);
  localStorage.removeItem(DRIVE_LAST_SYNC_KEY);
}

// ─── Check Connection ───
export function isDriveConnected(): boolean {
  return localStorage.getItem(DRIVE_CONNECTED_KEY) === 'true';
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(DRIVE_LAST_SYNC_KEY);
}

// ─── Ensure Token ───
async function ensureToken(): Promise<string> {
  if (accessToken) return accessToken;
  const token = await silentReauth();
  if (!token) throw new Error('NOT_AUTHENTICATED');
  return token;
}

// ─── Find backup file in appDataFolder ───
async function findBackupFileId(token: string): Promise<string | null> {
  const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id,name)`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

// ─── Download backup from Drive ───
async function downloadBackup(token: string, fileId: string): Promise<unknown> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive download error: ${res.status}`);
  return res.json();
}

// ─── Upload backup to Drive ───
async function uploadBackup(token: string, data: unknown, existingFileId?: string | null): Promise<void> {
  const metadata = {
    name: BACKUP_FILENAME,
    ...(existingFileId ? {} : { parents: ['appDataFolder'] }),
  };

  const boundary = '---sajda_boundary---';
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${JSON.stringify(data)}\r\n` +
    `--${boundary}--`;

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

  const method = existingFileId ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) throw new Error(`Drive upload error: ${res.status}`);
}

// ─── Sync To Cloud (Push local → Drive) ───
export async function syncToCloud(): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await ensureToken();
    const snapshot = getFullSnapshot();
    const fileId = await findBackupFileId(token);

    // If a file already exists on Drive, download it first & merge
    if (fileId) {
      const remoteData = await downloadBackup(token, fileId) as ReturnType<typeof getFullSnapshot>;
      // Merge remote into local (local wins on conflicts)
      mergeSnapshot(remoteData);
    }

    // Now upload the merged local snapshot
    const mergedSnapshot = getFullSnapshot();
    await uploadBackup(token, mergedSnapshot, fileId);

    const now = new Date().toISOString();
    localStorage.setItem(DRIVE_LAST_SYNC_KEY, now);

    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Sync failed';
    if (msg === 'NOT_AUTHENTICATED') {
      return { success: false, error: 'Please reconnect Google Drive.' };
    }
    return { success: false, error: msg };
  }
}

// ─── Sync From Cloud (Pull Drive → local) ───
export async function syncFromCloud(): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await ensureToken();
    const fileId = await findBackupFileId(token);

    if (!fileId) {
      return { success: true, error: 'No backup found on Drive.' };
    }

    const remoteData = await downloadBackup(token, fileId) as ReturnType<typeof getFullSnapshot>;
    mergeSnapshot(remoteData);

    const now = new Date().toISOString();
    localStorage.setItem(DRIVE_LAST_SYNC_KEY, now);

    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Sync failed';
    if (msg === 'NOT_AUTHENTICATED') {
      return { success: false, error: 'Please reconnect Google Drive.' };
    }
    return { success: false, error: msg };
  }
}

// ─── Delete Cloud Data ───
export async function deleteCloudData(): Promise<void> {
  try {
    const token = await ensureToken();
    const fileId = await findBackupFileId(token);
    if (fileId) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // silent fail for cleanup
  }
}
