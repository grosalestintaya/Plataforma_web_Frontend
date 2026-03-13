// src/module/ModuleHeader.jsx
export default function Header({ moduleData, missionKey }) {
  const mission = moduleData?.missions?.[missionKey];
  const missionTitle = mission?.missionTitle ?? moduleData?.meta?.missions?.[missionKey]?.title ?? "";
  return (
    <header className="h-44 text-white border-b border-be-black">
      <div className="h-full px-4 grid grid-cols-[auto_1fr_auto] items-center">
        <button className="h-9 w-9 rounded bg-white/10">⚙️</button>
        <div className="justify-self-center text-center font-bold">{missionTitle}</div>
        <button className="h-9 w-9 rounded bg-white/10">⚙️</button>
      </div>
    </header>
  );
}
