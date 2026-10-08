import React from 'react';
import { SpinHistoryItem } from '../types';
import { Clock, Trash2, CheckCircle2, UserMinus, Copy, Check } from 'lucide-react';

interface HistoryDrawerProps {
  history: SpinHistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  isOpen,
  onClose,
  onClearHistory,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = history
      .map((item, idx) => `${idx + 1}. ${item.studentName} (${new Date(item.timestamp).toLocaleTimeString()})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[80vh] animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-800 text-base">Lịch sử lượt quay ({history.length})</h4>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-semibold px-2 py-1"
          >
            Đóng
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Chưa có lượt quay nào trong buổi học này.
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {history.length - idx}
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">{item.studentName}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div>
                  {item.removedAfter ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-medium">
                      <UserMinus className="w-3 h-3" /> Đã loại
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Giữ lại
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-amber-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép danh sách'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa sạch lịch sử lượt quay?')) {
                  onClearHistory();
                }
              }}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa lịch sử</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
