import { defaultSeedData } from '../constants/seedData';

const STORAGE_KEY = 'DIVINE_CLASSES_APP_DATA';

export function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSeedData;
    const parsed = JSON.parse(raw);
    return {
      batches: parsed.batches || defaultSeedData.batches,
      students: parsed.students || defaultSeedData.students,
      materials: parsed.materials || defaultSeedData.materials,
      offlineTests: parsed.offlineTests || defaultSeedData.offlineTests,
      teachers: parsed.teachers || defaultSeedData.teachers,
      gallery: parsed.gallery || defaultSeedData.gallery,
      externalLinks: parsed.externalLinks || defaultSeedData.externalLinks,
      feedbacks: parsed.feedbacks || defaultSeedData.feedbacks,
      notifications: parsed.notifications || defaultSeedData.notifications,
      attendanceRecords: parsed.attendanceRecords || defaultSeedData.attendanceRecords,
      settings: { ...defaultSeedData.settings, ...(parsed.settings || {}) }
    };
  } catch (err) {
    console.warn('Error reading stored state, using seeds:', err);
    return defaultSeedData;
  }
}

export function saveStateLocally(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function clearApplicationData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
}
