"use client";

import { useEffect, useState, useTransition } from "react";
import { markAttendance } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Student = { id: string; name: string; surname: string };
type Lesson = { id: number; name: string; class: { name: string } };

const AttendanceMarker = ({
  lessons,
  studentsByLesson,
  existingAttendance,
}: {
  lessons: Lesson[];
  studentsByLesson: Record<number, Student[]>;
  existingAttendance: Record<string, boolean>; // key: `${studentId}-${lessonId}-${date}` → present
}) => {
  const router = useRouter();
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(
    lessons.length > 0 ? lessons[0].id : null
  );
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  // Initialize attendance state from existing records when lesson/date changes
  useEffect(() => {
    if (!selectedLessonId) return;
    const students = studentsByLesson[selectedLessonId] || [];
    const init: Record<string, boolean> = {};
    students.forEach((s) => {
      const key = `${s.id}-${selectedLessonId}-${date}`;
      init[s.id] = existingAttendance[key] ?? true; // default: present
    });
    setAttendance(init);
  }, [selectedLessonId, date, studentsByLesson, existingAttendance]);

  const students = selectedLessonId ? studentsByLesson[selectedLessonId] || [] : [];

  const toggleAll = (value: boolean) => {
    const updated: Record<string, boolean> = {};
    students.forEach((s) => (updated[s.id] = value));
    setAttendance(updated);
  };

  const handleSubmit = () => {
    if (!selectedLessonId) return;
    const records = students.map((s) => ({
      studentId: s.id,
      lessonId: selectedLessonId,
      date,
      present: attendance[s.id] ?? true,
    }));

    startTransition(async () => {
      const result = await markAttendance(records);
      if (result.success) {
        toast.success("Attendance saved!");
        router.refresh();
      } else {
        toast.error("Failed to save attendance.");
      }
    });
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="bg-white rounded-xl p-5 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lesson</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedLessonId ?? ""}
            onChange={(e) => setSelectedLessonId(Number(e.target.value))}
          >
            {lessons.map((lesson) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name} — {lesson.class.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => toggleAll(true)}
            className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={() => toggleAll(false)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Stats */}
      {students.length > 0 && (
        <div className="flex gap-4">
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 flex-1 text-center">
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <div className="text-xs text-green-500 font-medium uppercase tracking-wide mt-1">Present</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex-1 text-center">
            <div className="text-2xl font-bold text-red-500">{absentCount}</div>
            <div className="text-xs text-red-400 font-medium uppercase tracking-wide mt-1">Absent</div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex-1 text-center">
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-xs text-blue-400 font-medium uppercase tracking-wide mt-1">Total</div>
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {lessons.length === 0
              ? "No lessons assigned to you."
              : "No students found for the selected lesson."}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Present</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student, idx) => {
                const isPresent = attendance[student.id] ?? true;
                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${isPresent ? "hover:bg-green-50/40" : "bg-red-50/30 hover:bg-red-50/50"}`}
                  >
                    <td className="px-5 py-3 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isPresent ? "bg-green-400" : "bg-red-400"}`}>
                          {student.name[0]}{student.surname[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {student.name} {student.surname}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isPresent}
                        onChange={(e) =>
                          setAttendance((prev) => ({ ...prev, [student.id]: e.target.checked }))
                        }
                        className="w-5 h-5 accent-green-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          isPresent
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Submit */}
      {students.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarker;
