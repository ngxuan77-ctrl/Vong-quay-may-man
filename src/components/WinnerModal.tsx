import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Student } from '../types';
import { Award, UserMinus, RotateCcw, X, Sparkles, Check } from 'lucide-react';

interface WinnerModalProps {
  winner: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onRemoveWinner: (studentId: string) => void;
  onKeepWinner: () => void;
  onSpinAgain: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  isOpen,
  onClose,
  onRemoveWinner,
  onKeepWinner,
  onSpinAgain,
}) => {
  useEffect(() => {
    if (isOpen && winner) {
      // Fire confetti cannon
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isOpen, winner]);

  if (!isOpen || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden transform animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top festive decorative header */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 pt-7 pb-6 text-center text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-black/10 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner mb-3 border border-white/30 text-amber-100">
            <Award className="w-10 h-10 text-yellow-300 drop-shadow" />
          </div>

          <div className="flex items-center justify-center gap-2 text-amber-200 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-spin text-yellow-300" style={{ animationDuration: '3s' }} />
            CHÚC MỪNG BẠN MAY MẮN
            <Sparkles className="w-4 h-4 animate-spin text-yellow-300" style={{ animationDuration: '3s' }} />
          </div>

          {/* Big Winner Name Display */}
          <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md break-words">
            {winner.name}
          </h2>
        </div>

        {/* Action content */}
        <div className="p-6 sm:p-7 space-y-5 bg-amber-50/30">
          <p className="text-center text-slate-600 text-sm sm:text-base font-medium">
            Bạn đã được chọn trong lượt quay này! Thầy/Cô muốn làm gì tiếp theo?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option: Remove from subsequent spins */}
            <button
              onClick={() => onRemoveWinner(winner.id)}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition-all hover:scale-[1.02] shadow-sm active:scale-95"
            >
              <UserMinus className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="text-sm">Loại khỏi lượt sau</span>
            </button>

            {/* Option: Keep in wheel */}
            <button
              onClick={onKeepWinner}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300 transition-all hover:scale-[1.02] shadow-sm active:scale-95"
            >
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm">Giữ lại trong vòng</span>
            </button>
          </div>

          {/* Quick Spin Next Action */}
          <button
            onClick={onSpinAgain}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-base sm:text-lg shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-95"
          >
            <RotateCcw className="w-5 h-5 animate-spin-reverse" />
            <span>Quay tiếp lượt mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};
