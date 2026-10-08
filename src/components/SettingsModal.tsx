import React from 'react';
import { WheelSettings } from '../types';
import { CLASS_ROSTERS } from '../data/classRosters';
import { Settings, Volume2, VolumeX, Sparkles, UserMinus, Timer, X, GraduationCap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WheelSettings;
  onUpdateSettings: (settings: WheelSettings) => void;
  currentClassId: string;
  onSelectClass: (classId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentClassId,
  onSelectClass,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-800 text-base">Cài đặt vòng quay & Lớp học</h4>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5 text-sm overflow-y-auto flex-1">
          {/* Official Class Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 font-bold text-slate-800">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                Danh sách học sinh theo lớp (TH-THCS Phan Bội Châu):
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CLASS_ROSTERS.map((roster) => {
                const isSelected = currentClassId === roster.id;
                return (
                  <button
                    key={roster.id}
                    type="button"
                    onClick={() => {
                      onSelectClass(roster.id);
                    }}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    <div className="truncate">{roster.name}</div>
                    <div className={`text-[10px] font-normal ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                      {roster.students.length} học sinh
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spin duration */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-slate-700 mb-2">
              <Timer className="w-4 h-4 text-amber-600" />
              Thời gian vòng quay quay (giây):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 8, 10].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, spinDurationSeconds: dur })}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                    settings.spinDurationSeconds === dur
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          {/* Sound toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-amber-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <p className="font-semibold text-slate-800">Hiệu ứng âm thanh</p>
                <p className="text-xs text-slate-500">Tiếng cạch cạch kim quay & nhạc chúc mừng</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-500"
            />
          </div>

          {/* Auto-remove winner option */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <UserMinus className="w-5 h-5 text-rose-500" />
              <div>
                <p className="font-semibold text-slate-800">Tự động loại học sinh đã trúng khỏi lượt sau</p>
                <p className="text-xs text-slate-500">Loại khỏi các lượt tiếp theo để nhường lượt cho bạn khác</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoRemoveWinner}
              onChange={(e) => onUpdateSettings({ ...settings, autoRemoveWinner: e.target.checked })}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-500"
            />
          </div>

          {/* Confetti toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-semibold text-slate-800">Pháo hoa & Hoa giấy chúc mừng</p>
                <p className="text-xs text-slate-500">Bắn hiệu ứng chúc mừng khi dừng vòng quay</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.confettiEnabled}
              onChange={(e) => onUpdateSettings({ ...settings, confettiEnabled: e.target.checked })}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
