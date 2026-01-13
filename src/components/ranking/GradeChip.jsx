// GradeChip.jsx
export default function GradeChip({ grade }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
      {grade}
    </span>
  );
}
