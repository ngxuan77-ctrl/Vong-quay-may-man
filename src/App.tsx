/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Student, SpinHistoryItem, WheelSettings } from './types';
import {
  loadStudents,
  saveStudents,
  loadHistory,
  saveHistory,
  loadSettings,
  saveSettings,
  loadSelectedClassId,
  saveSelectedClassId,
  createStudentsFromClass,
} from './utils/storage';
import { CLASS_ROSTERS } from './data/classRosters';
import { soundEngine } from './utils/audio';
import { LuckyWheel } from './components/LuckyWheel';
import { StudentManager } from './components/StudentManager';
import { WinnerModal } from './components/WinnerModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Clock,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';

export default function App() {
  const [currentClassId, setCurrentClassId] = useState<string>(() => loadSelectedClassId());
  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [history, setHistory] = useState<SpinHistoryItem[]>(() => loadHistory());
  const [settings, setSettings] = useState<WheelSettings>(() => loadSettings());
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Student | null>(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'wheel' | 'list'>('wheel');

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync sound settings
  useEffect(() => {
    soundEngine.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Save changes to localStorage
  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveSelectedClassId(currentClassId);
  }, [currentClassId]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Switch class roster
  const handleSelectClass = (classId: string) => {
    setCurrentClassId(classId);
    const newStudents = createStudentsFromClass(classId);
    setStudents(newStudents);
    setWinner(null);
    setIsWinnerModalOpen(false);
  };

  // Handlers for wheel spin
  const handleSpinStart = () => {
    setIsSpinning(true);
    setIsWinnerModalOpen(false);
  };

  const handleSpinEnd = (chosenWinner: Student) => {
    setIsSpinning(false);
    setWinner(chosenWinner);
    setIsWinnerModalOpen(true);

    // Increment win count for student
    setStudents((prev) =>
      prev.map((s) => (s.id === chosenWinner.id ? { ...s, spinsWon: (s.spinsWon || 0) + 1 } : s))
    );

    // Add to history
    const historyItem: SpinHistoryItem = {
      id: Date.now().toString(),
      studentId: chosenWinner.id,
      studentName: chosenWinner.name,
      timestamp: Date.now(),
      removedAfter: false,
    };
    setHistory((prev) => [historyItem, ...prev]);
  };

  // Winner modal action: Remove from next spins
  const handleRemoveWinner = (winnerId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === winnerId ? { ...s, active: false } : s))
    );
    // Mark history item as removed
    setHistory((prev) =>
      prev.map((item, idx) => (idx === 0 ? { ...item, removedAfter: true } : item))
    );
    setIsWinnerModalOpen(false);
  };

  // Winner modal action: Keep in wheel
  const handleKeepWinner = () => {
    setIsWinnerModalOpen(false);
  };

  // Winner modal action: Spin again immediately
  const handleSpinAgain = () => {
    if (settings.autoRemoveWinner && winner) {
      handleRemoveWinner(winner.id);
    } else {
      setIsWinnerModalOpen(false);
    }
    setTimeout(() => {
      const spinBtn = document.querySelector('button[title*="Nhấn để quay"]') as HTMLButtonElement | null;
      if (spinBtn) {
        spinBtn.click();
      }
    }, 250);
  };

  // Restore all active students
  const handleRestoreAllActive = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, active: true })));
  };

  // Reset to default roster of current class
  const handleResetCurrentClass = () => {
    const defaultRoster = createStudentsFromClass(currentClassId);
    setStudents(defaultRoster);
  };

  const activeCount = students.filter((s) => s.active).length;
  const currentRoster = CLASS_ROSTERS.find((c) => c.id === currentClassId) || CLASS_ROSTERS[0];

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50 text-slate-800"
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-200/80 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bungee tracking-wide text-amber-600 leading-none">
                VÒNG QUAY MAY MẮN
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                Gọi tên học sinh ngẫu nhiên · TH-THCS Phan Bội Châu
              </p>
            </div>
          </div>

          {/* Quick Class Switcher Dropdown in Top Nav */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex items-center">
              <div className="flex items-center gap-1 bg-amber-100/90 text-amber-900 border border-amber-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                <select
                  value={currentClassId}
                  onChange={(e) => handleSelectClass(e.target.value)}
                  disabled={isSpinning}
                  className="bg-transparent font-bold text-xs sm:text-sm text-amber-950 focus:outline-none cursor-pointer pr-1"
                  title="Chọn lớp học từ phiếu điểm"
                >
                  {CLASS_ROSTERS.map((roster) => (
                    <option key={roster.id} value={roster.id}>
                      {roster.name} ({roster.students.length} HS)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() =>
                setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
              }
              title={settings.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                settings.soundEnabled
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden xl:inline">
                {settings.soundEnabled ? 'Âm thanh' : 'Tắt tiếng'}
              </span>
            </button>

            {/* History Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              title="Lịch sử gọi tên"
              className="p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="hidden xl:inline">Lịch sử</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {history.length}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Cài đặt vòng quay"
              className="p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="hidden xl:inline">Cài đặt</span>
            </button>

            {/* Fullscreen / Projector Mode */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Thoát toàn màn hình' : 'Chế độ máy chiếu toàn màn hình'}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              <span className="hidden lg:inline">
                {isFullscreen ? 'Thu nhỏ' : 'Máy chiếu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden px-4 pt-2.5 pb-1 flex justify-center">
        <div className="inline-flex p-1 bg-amber-200/50 rounded-xl border border-amber-300">
          <button
            onClick={() => setMobileTab('wheel')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'wheel'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-amber-900 hover:text-amber-950'
            }`}
          >
            🎡 Vòng quay ({activeCount})
          </button>
          <button
            onClick={() => setMobileTab('list')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'list'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-amber-900 hover:text-amber-950'
            }`}
          >
            📋 {currentRoster.name} ({students.length})
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Wheel Arena */}
        <div
          className={`lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs rounded-3xl p-4 sm:p-6 border border-amber-200/70 shadow-sm relative min-h-[500px] ${
            mobileTab === 'list' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Top Quick Class Info Bar */}
          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-amber-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-800">
                {currentRoster.name}
              </span>
              <span className="text-xs text-slate-500">· {currentRoster.school}</span>
            </div>

            {/* Quick reset active students button */}
            {students.some((s) => !s.active) && (
              <button
                onClick={handleRestoreAllActive}
                disabled={isSpinning}
                title="Khôi phục tất cả học sinh đã loại vào lại vòng quay"
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/70 hover:bg-amber-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục toàn bộ ({students.length})</span>
              </button>
            )}
          </div>

          {/* Interactive Wheel */}
          <LuckyWheel
            students={students}
            settings={settings}
            isSpinning={isSpinning}
            onSpinStart={handleSpinStart}
            onSpinEnd={handleSpinEnd}
          />

          {/* Shortcut guide banner */}
          <div className="mt-3 px-4 py-2 bg-amber-100/60 rounded-xl border border-amber-200/50 flex items-center gap-2 text-xs text-amber-900">
            <span className="font-bold bg-white px-2 py-0.5 rounded shadow-2xs border border-amber-200">
              Phím Space
            </span>
            <span>hoặc nhấn nút <strong>QUAY</strong> ở giữa để gọi tên ngẫu nhiên</span>
          </div>
        </div>

        {/* Side Panel: Student Management */}
        <div
          className={`lg:col-span-5 xl:col-span-4 h-full flex flex-col ${
            mobileTab === 'wheel' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <StudentManager
            students={students}
            onUpdateStudents={setStudents}
            onResetDefault={handleResetCurrentClass}
            onRestoreAllActive={handleRestoreAllActive}
            isSpinning={isSpinning}
            currentClassId={currentClassId}
            onSelectClass={handleSelectClass}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-2.5 px-4 border-t border-amber-200/60 text-center text-xs text-slate-500 bg-white/50">
        <p className="font-medium">
          Vòng Quay May Mắn · TH-THCS Phan Bội Châu (Năm học 2026-2027) · Lưu tự động trên trình duyệt
        </p>
      </footer>

      {/* Winner Announcement Modal with Confetti */}
      <WinnerModal
        winner={winner}
        isOpen={isWinnerModalOpen}
        onClose={() => setIsWinnerModalOpen(false)}
        onRemoveWinner={handleRemoveWinner}
        onKeepWinner={handleKeepWinner}
        onSpinAgain={handleSpinAgain}
      />

      {/* Spin History Drawer */}
      <HistoryDrawer
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onClearHistory={() => setHistory([])}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        currentClassId={currentClassId}
        onSelectClass={handleSelectClass}
      />
    </div>
  );
}
