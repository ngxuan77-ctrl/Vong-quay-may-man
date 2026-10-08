export interface Student {
  id: string;
  name: string;
  active: boolean; // whether included in the current wheel
  color?: string;  // custom or assigned sector color
  spinsWon?: number;
}

export interface SpinHistoryItem {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: number;
  removedAfter: boolean;
}

export interface WheelSettings {
  spinDurationSeconds: number; // e.g. 4, 6, 8 seconds
  soundEnabled: boolean;
  autoRemoveWinner: boolean; // default option to exclude after pick
  confettiEnabled: boolean;
}
