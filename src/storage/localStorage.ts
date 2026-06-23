import {
  type StorageRepository,
  type Progress,
  type SrsState,
  defaultProgress,
} from './repository';

const KEYS = {
  progress: 'padikkam.progress.v1',
  srs: 'padikkam.srs.v1',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — fail silently, app still works in-memory */
  }
}

export class LocalStorageRepository implements StorageRepository {
  getProgress(): Progress {
    return read<Progress>(KEYS.progress, defaultProgress());
  }
  saveProgress(p: Progress): void {
    write(KEYS.progress, p);
  }
  getSrs(): SrsState {
    return read<SrsState>(KEYS.srs, {});
  }
  saveSrs(s: SrsState): void {
    write(KEYS.srs, s);
  }
  reset(): void {
    localStorage.removeItem(KEYS.progress);
    localStorage.removeItem(KEYS.srs);
  }
}
