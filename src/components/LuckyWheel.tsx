import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Student, WheelSettings } from '../types';
import { soundEngine } from '../utils/audio';

interface LuckyWheelProps {
  students: Student[];
  settings: WheelSettings;
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: Student) => void;
}

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  students,
  settings,
  isSpinning,
  onSpinStart,
  onSpinEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastSectorIndexRef = useRef<number>(-1);
  const [pointerKick, setPointerKick] = useState<number>(0);

  // Filter only active students
  const activeStudents = students.filter((s) => s.active);

  // Draw the wheel onto the canvas
  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const size = Math.min(width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = size / 2 - 24; // padding for bezel & shadows

      ctx.clearRect(0, 0, width, height);

      // If no active students
      if (activeStudents.length === 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#E2E8F0';
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#CBD5E1';
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Chưa có học sinh trong vòng quay', centerX, centerY - 14);
        ctx.font = '15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Vui lòng bật học sinh hoặc thêm mới danh sách', centerX, centerY + 18);
        ctx.restore();
        return;
      }

      const numSlices = activeStudents.length;
      const sliceAngle = (2 * Math.PI) / numSlices;

      // 1. Draw outer glowing bezel/rim
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 14, 0, 2 * Math.PI);
      const bezelGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius,
        centerX,
        centerY,
        radius + 18
      );
      bezelGrad.addColorStop(0, '#D97706');
      bezelGrad.addColorStop(0.5, '#F59E0B');
      bezelGrad.addColorStop(1, '#B45309');
      ctx.fillStyle = bezelGrad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.fill();
      ctx.restore();

      // Outer bezel studs / bulbs
      const numStuds = Math.max(16, numSlices * 2);
      for (let i = 0; i < numStuds; i++) {
        const studAngle = (i * 2 * Math.PI) / numStuds;
        const sx = centerX + (radius + 7) * Math.cos(studAngle);
        const sy = centerY + (radius + 7) * Math.sin(studAngle);
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = i % 2 === 0 ? '#FEF08A' : '#FFFFFF';
        ctx.fill();
      }

      // 2. Draw Wheel Slices
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      for (let i = 0; i < numSlices; i++) {
        const student = activeStudents[i];
        const startA = i * sliceAngle;
        const endA = startA + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startA, endA);
        ctx.closePath();

        // Fill color
        ctx.fillStyle = student.color || '#3B82F6';
        ctx.fill();

        // Subtle slice separator stroke
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // Draw Student Name
        ctx.save();
        ctx.rotate(startA + sliceAngle / 2);

        // Adjust font size based on slice count
        let fontSize = 18;
        if (numSlices > 24) fontSize = 12;
        else if (numSlices > 16) fontSize = 14;
        else if (numSlices > 10) fontSize = 16;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // Text drop shadow for high contrast
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Truncate name if too long
        let displayName = student.name;
        const maxTextWidth = radius - 75;
        if (ctx.measureText(displayName).width > maxTextWidth) {
          while (ctx.measureText(displayName + '...').width > maxTextWidth && displayName.length > 2) {
            displayName = displayName.slice(0, -1);
          }
          displayName += '...';
        }

        ctx.fillText(displayName, radius - 20, 0);

        // Optional small decorative indicator at the outer edge
        ctx.beginPath();
        ctx.arc(radius - 8, 0, 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();

      // 3. Center Hub ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 52, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 44, 0, 2 * Math.PI);
      const hubGrad = ctx.createLinearGradient(centerX - 44, centerY - 44, centerX + 44, centerY + 44);
      hubGrad.addColorStop(0, '#F59E0B');
      hubGrad.addColorStop(1, '#D97706');
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.restore();
    },
    [activeStudents]
  );

  // Setup high DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const displaySize = 520;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  // Redraw when students change
  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel, activeStudents]);

  // Compute which student is currently pointed at by the top ticker (12 o'clock = -PI/2)
  const getSelectedStudentIndex = (angle: number): number => {
    if (activeStudents.length === 0) return -1;
    const numSlices = activeStudents.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    // Top pointer is at angle 3*PI/2 (or -PI/2)
    const targetAngle = 1.5 * Math.PI;
    let normalized = (targetAngle - (angle % (2 * Math.PI))) % (2 * Math.PI);
    if (normalized < 0) normalized += 2 * Math.PI;
    return Math.floor(normalized / sliceAngle) % numSlices;
  };

  // Spin trigger
  const spin = () => {
    if (isSpinning || activeStudents.length === 0) return;

    onSpinStart();
    soundEngine.playSpinStart();

    const startAngle = currentAngleRef.current;
    // Guarantee 6 to 10 full turns + random landing spot
    const totalDurationMs = (settings.spinDurationSeconds || 5) * 1000;
    const minTurns = 5;
    const extraTurns = Math.random() * 4;
    const randomOffset = Math.random() * Math.PI * 2;
    const totalRotation = (minTurns + extraTurns) * Math.PI * 2 + randomOffset;
    const targetAngle = startAngle + totalRotation;

    const startTime = performance.now();
    lastSectorIndexRef.current = getSelectedStudentIndex(startAngle);

    // Easing: Quartic ease-out for ultra smooth deceleration
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDurationMs);
      const easedProgress = easeOutQuart(progress);

      const currentAngle = startAngle + totalRotation * easedProgress;
      currentAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      // Detect sector crossings for ticker sound & flapper wiggle
      const currentSector = getSelectedStudentIndex(currentAngle);
      if (currentSector !== lastSectorIndexRef.current && currentSector >= 0) {
        lastSectorIndexRef.current = currentSector;
        // Pitch variation according to speed
        const speedRatio = 1 - progress;
        soundEngine.playTick(0.8 + speedRatio * 0.6);
        setPointerKick(progress < 0.7 ? 14 : 6);
        setTimeout(() => setPointerKick(0), 40);
      }

      if (progress < 1) {
        animFrameIdRef.current = requestAnimationFrame(step);
      } else {
        // Spin finished!
        const finalWinnerIdx = getSelectedStudentIndex(targetAngle);
        const winner = activeStudents[finalWinnerIdx] || activeStudents[0];
        soundEngine.playVictory();
        onSpinEnd(winner);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(step);
  };

  // Keyboard shortcut: Spacebar or Enter to spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.code === 'Space' || e.key === 'Enter') &&
        !isSpinning &&
        activeStudents.length > 0
      ) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          spin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, activeStudents.length, settings.spinDurationSeconds]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Ticker / Needle at Top */}
      <div
        className="absolute top-0 z-20 transition-transform pointer-events-none duration-75"
        style={{
          transform: `translateY(4px) rotate(${pointerKick}deg)`,
          transformOrigin: '50% 10%',
        }}
      >
        <svg
          width="44"
          height="52"
          viewBox="0 0 44 52"
          fill="none"
          className="drop-shadow-lg filter"
        >
          {/* Outer triangle flapper */}
          <path
            d="M22 50L6 10C4 6 7 2 11 2H33C37 2 40 6 38 10L22 50Z"
            fill="#DC2626"
            stroke="#991B1B"
            strokeWidth="2.5"
          />
          {/* Inner highlight */}
          <path
            d="M22 43L11 10C10 7.5 12 5 15 5H29C32 5 34 7.5 33 10L22 43Z"
            fill="#EF4444"
          />
          {/* Pivot pin */}
          <circle cx="22" cy="11" r="5" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />
        </svg>
      </div>

      {/* Wheel Canvas Container */}
      <div className="relative flex items-center justify-center p-3">
        <canvas
          ref={canvasRef}
          style={{ width: 520, height: 520, maxWidth: '100%', maxHeight: '72vh', aspectRatio: '1/1' }}
          className="rounded-full shadow-2xl transition-transform"
        />

        {/* Center Spin Action Button */}
        <button
          onClick={spin}
          disabled={isSpinning || activeStudents.length === 0}
          title="Nhấn để quay hoặc bấm phím Cách (Space)"
          className={`absolute z-10 flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-300 font-bungee text-white text-xl sm:text-2xl shadow-xl transition-all active:scale-95 ${
            isSpinning
              ? 'bg-amber-600/90 cursor-not-allowed scale-95 opacity-90'
              : activeStudents.length === 0
              ? 'bg-slate-400 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 hover:scale-105 hover:shadow-amber-500/50 cursor-pointer animate-pulse'
          }`}
        >
          <span className="tracking-wider drop-shadow-md">
            {isSpinning ? '...' : 'QUAY'}
          </span>
          <span className="text-[10px] sm:text-xs font-sans font-medium text-amber-100 uppercase tracking-tight -mt-0.5">
            {isSpinning ? 'Đang quay' : 'Phím Space'}
          </span>
        </button>
      </div>

      {/* Helper caption below wheel */}
      <div className="mt-2 text-center">
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          {activeStudents.length > 0 ? (
            <span>
              🎯 <strong className="text-slate-800">{activeStudents.length}</strong> học sinh đang sẵn sàng trên vòng quay
            </span>
          ) : (
            <span className="text-red-500 font-medium">⚠️ Vòng quay trống. Hãy kích hoạt học sinh bên dưới!</span>
          )}
        </p>
      </div>
    </div>
  );
};
