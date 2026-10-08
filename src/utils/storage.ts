import { Student, SpinHistoryItem, WheelSettings } from '../types';
import { CLASS_ROSTERS } from '../data/classRosters';

export const PALETTE = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#84CC16', // Lime
  '#E11D48', // Rose
];

export function createStudentsFromClass(classId: string): Student[] {
  const roster = CLASS_ROSTERS.find((c) => c.id === classId) || CLASS_ROSTERS[0];
  return roster.students.map((name, idx) => ({
    id: `${roster.id}-${idx + 1}`,
    name,
    active: true,
    color: PALETTE[idx % PALETTE.length],
    spinsWon: 0,
  }));
}

// Default to the first class from the user's school scan (Lớp 7.5 - 48 học sinh)
export const DEFAULT_STUDENTS: Student[] = createStudentsFromClass('7.5');

export const DEFAULT_SETTINGS: WheelSettings = {
  spinDurationSeconds: 5,
  soundEnabled: true,
  autoRemoveWinner: true,
  confettiEnabled: true,
};

const STORAGE_KEYS = {
  STUDENTS: 'vongquay_students_v2',
  HISTORY: 'vongquay_history_v2',
  SETTINGS: 'vongquay_settings_v2',
  SELECTED_CLASS: 'vongquay_selected_class_v2',
};

export function loadSelectedClassId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_CLASS);
    if (raw && CLASS_ROSTERS.some((c) => c.id === raw)) {
      return raw;
    }
  } catch {
    // fallback
  }
  return '7.5';
}

export function saveSelectedClassId(classId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CLASS, classId);
  } catch {
    // fallback
  }
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) return DEFAULT_STUDENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_STUDENTS;
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch {
    // quota exceeded or private mode
  }
}

export function loadHistory(): SpinHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fallback
  }
  return [];
}

export function saveHistory(history: SpinHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch {
    // fallback
  }
}

export function loadSettings(): WheelSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: WheelSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // fallback
  }
}
