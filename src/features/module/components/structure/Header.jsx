// src/module/ModuleHeader.jsx
export default function ModuleHeader({ title, moduleName }) {
  return (
    <header className="h-14 bg-neutral-900 text-white border-b border-white/10">
      <div className="h-full px-4 grid grid-cols-[auto_1fr_auto] items-center">
        <button className="h-9 w-9 rounded bg-white/10">⚙️</button>
        <div className="justify-self-center text-center font-bold">{title}</div>
        <button className="h-9 w-9 rounded bg-white/10">⚙️</button>
      </div>
    </header>
  );
}
