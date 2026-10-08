import React, { useState } from 'react';
import { Student } from '../types';
import { PALETTE } from '../utils/storage';
import { CLASS_ROSTERS } from '../data/classRosters';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  RotateCcw,
  Search,
  CheckSquare,
  Square,
  Shuffle,
  Users,
  GraduationCap,
} from 'lucide-react';

interface StudentManagerProps {
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  onResetDefault: () => void;
  onRestoreAllActive: () => void;
  isSpinning: boolean;
  currentClassId: string;
  onSelectClass: (classId: string) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  onUpdateStudents,
  onResetDefault,
  onRestoreAllActive,
  isSpinning,
  currentClassId,
  onSelectClass,
}) => {
  const [newName, setNewName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Add a single student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    const nextColor = PALETTE[students.length % PALETTE.length];
    const newStudent: Student = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      name: trimmed,
      active: true,
      color: nextColor,
      spinsWon: 0,
    };

    onUpdateStudents([...students, newStudent]);
    setNewName('');
  };

  // Toggle active status
  const handleToggleActive = (id: string) => {
    onUpdateStudents(
      students.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  // Delete student
  const handleDelete = (id: string) => {
    onUpdateStudents(students.filter((s) => s.id !== id));
  };

  // Start inline editing
  const handleStartEdit = (student: Student) => {
    setEditingId(student.id);
    setEditingName(student.name);
  };

  // Save inline edit
  const handleSaveEdit = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    onUpdateStudents(
      students.map((s) => (s.id === id ? { ...s, name: trimmed } : s))
    );
    setEditingId(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Bulk import
  const handleBulkImport = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText
      .split(/[\r\n,;]+/)
      .map((item) => item.replace(/^\d+[\.\-\)]\s*/, '').trim())
      .filter((item) => item.length > 0);

    if (lines.length === 0) return;

    const newItems: Student[] = lines.map((name, idx) => ({
      id: (Date.now() + idx).toString() + Math.random().toString(36).substring(2, 5),
      name,
      active: true,
      color: PALETTE[(students.length + idx) % PALETTE.length],
      spinsWon: 0,
    }));

    onUpdateStudents([...students, ...newItems]);
    setBulkText('');
    setIsBulkModalOpen(false);
  };

  // Shuffle list order
  const handleShuffle = () => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    onUpdateStudents(shuffled);
  };

  // Select all or Unselect all
  const handleToggleAll = (active: boolean) => {
    onUpdateStudents(students.map((s) => ({ ...s, active })));
  };

  // Filter students by search term
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = students.filter((s) => s.active).length;
  const totalCount = students.length;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-amber-200/80 overflow-hidden">
      {/* Header bar: School & Class Picker */}
      <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-200/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 truncate">
            <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">TH-THCS Phan Bội Châu</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              disabled={isSpinning}
              title="Dán nhanh danh sách từ Excel/Word"
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3 h-3" />
              <span>Dán DS</span>
            </button>
            <button
              onClick={handleShuffle}
              disabled={isSpinning || students.length <= 1}
              title="Xáo trộn thứ tự học sinh"
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 bg-white border border-amber-200 hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Class Dropdown / Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 shrink-0">
            Lớp học:
          </label>
          <select
            value={currentClassId}
            onChange={(e) => onSelectClass(e.target.value)}
            disabled={isSpinning}
            className="flex-1 text-xs font-bold py-1.5 px-2.5 bg-white border-2 border-amber-400 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
          >
            {CLASS_ROSTERS.map((roster) => (
              <option key={roster.id} value={roster.id}>
                {roster.name} ({roster.students.length} học sinh) · {roster.grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subheader: Active counter */}
      <div className="px-3.5 py-2 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-bold text-slate-700">Đang chọn:</span>
          <span className="font-extrabold text-amber-700">
            {activeCount}/{totalCount} học sinh
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <button
            onClick={() => handleToggleAll(true)}
            className="flex items-center gap-1 hover:text-amber-700 font-medium transition-colors"
            title="Chọn tất cả để quay"
          >
            <CheckSquare className="w-3 h-3" />
            <span>Chọn hết</span>
          </button>
          <span>·</span>
          <button
            onClick={() => handleToggleAll(false)}
            className="flex items-center gap-1 hover:text-rose-700 font-medium transition-colors"
            title="Bỏ chọn tất cả"
          >
            <Square className="w-3 h-3" />
            <span>Bỏ hết</span>
          </button>
        </div>
      </div>

      {/* Add student input form */}
      <form onSubmit={handleAddStudent} className="p-2.5 border-b border-slate-100 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Thêm học sinh mới..."
          disabled={isSpinning}
          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={isSpinning || !newName.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm</span>
        </button>
      </form>

      {/* Search box */}
      <div className="px-3 py-1.5 bg-slate-50/60 border-b border-slate-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học sinh..."
            className="w-full pl-8 pr-2 py-1 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Student List Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[220px] max-h-[380px] sm:max-h-[460px]">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            {students.length === 0
              ? 'Danh sách chưa có học sinh nào.'
              : 'Không tìm thấy học sinh phù hợp.'}
          </div>
        ) : (
          filteredStudents.map((student, idx) => (
            <div
              key={student.id}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all border ${
                student.active
                  ? 'bg-white border-slate-200/80 shadow-2xs'
                  : 'bg-slate-100/70 border-slate-200/50 opacity-60'
              }`}
            >
              {/* Left: Checkbox + Color tag + Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={student.active}
                  onChange={() => handleToggleActive(student.id)}
                  disabled={isSpinning}
                  className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-500 shrink-0"
                  title={student.active ? 'Bỏ khỏi vòng quay' : 'Đưa vào vòng quay'}
                />

                {/* Color Dot indicator */}
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: student.color || '#3B82F6' }}
                />

                {/* Inline Editing or Normal Display */}
                {editingId === student.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(student.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                      className="flex-1 px-1.5 py-0.5 text-xs bg-white border border-amber-400 rounded focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(student.id)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {idx + 1}.
                    </span>
                    <span
                      className={`text-xs font-semibold truncate ${
                        student.active ? 'text-slate-800' : 'text-slate-400 line-through'
                      }`}
                    >
                      {student.name}
                    </span>
                    {student.spinsWon && student.spinsWon > 0 ? (
                      <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-bold shrink-0">
                        ★ {student.spinsWon}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editingId !== student.id && (
                <div className="flex items-center gap-0.5 shrink-0 ml-1">
                  <button
                    onClick={() => handleStartEdit(student)}
                    disabled={isSpinning}
                    title="Đổi tên"
                    className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    disabled={isSpinning}
                    title="Xóa học sinh này"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer controls: Restore Defaults / Khôi phục toàn bộ danh sách */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-1.5 text-xs">
        <button
          onClick={onRestoreAllActive}
          disabled={isSpinning}
          title="Kích hoạt lại tất cả học sinh đã bị loại"
          className="flex items-center gap-1 text-slate-600 hover:text-amber-700 font-medium px-2 py-1 rounded hover:bg-amber-100/50 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Bật lại tất cả ({students.length})</span>
        </button>

        <button
          onClick={onResetDefault}
          disabled={isSpinning}
          title="Nạp lại danh sách gốc của lớp này"
          className="text-amber-700 hover:text-amber-900 font-semibold px-2 py-1 rounded hover:bg-amber-100/50 transition-colors"
        >
          Đặt lại lớp hiện tại
        </button>
      </div>

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-600" />
                Dán nhanh danh sách học sinh
              </h4>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-3">
              Mỗi học sinh một dòng hoặc ngăn cách bằng dấu phẩy. Bạn có thể copy trực tiếp từ Excel, Word hoặc Google Sheets.
            </p>

            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Lê Kiều Anh&#10;Ngô Nguyễn Vân Anh&#10;Phạm Huyền Anh..."
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-sans"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkImport}
                disabled={!bulkText.trim()}
                className="px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm disabled:opacity-50"
              >
                Thêm vào danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
