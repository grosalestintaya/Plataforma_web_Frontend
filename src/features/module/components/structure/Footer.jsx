export default function ModuleFooter({ model }) {
  if (model?.type === "cta") {
    return (
      <footer className="h-10 bg-neutral-900 border-t border-white/10">
        <div className="h-full px-4 flex items-center justify-center text-white/80 text-sm">
          <button
            disabled={!model.center.enabled}
            onClick={model.center.onClick}
            className="h-8 px-4 rounded bg-white/10 disabled:opacity-40"
          >
            {model.center.label}
          </button>
        </div>
      </footer>
    );
  }

  if (model?.type === "locked") {
    return (
      <footer className="h-10 bg-neutral-900 border-t border-white/10">
        <div className="h-full px-4 flex items-center justify-between text-white/80 text-sm">
          <button disabled className="h-8 px-3 rounded bg-white/10 opacity-40">
            {model.left.label}
          </button>

          <span>{model.centerText}</span>

          <button disabled className="h-8 px-3 rounded bg-white/10 opacity-40">
            {model.right.label}
          </button>
        </div>
      </footer>
    );
  }

  // normal
  return (
    <footer className="h-10 bg-transparent-900 border-t border-white/10">
      <div className="h-full px-4 flex items-center justify-between text-white/80 text-sm">
        <button
          disabled={!model.left.enabled}
          onClick={model.left.onClick}
          className="h-8 px-3 rounded bg-white/10 disabled:opacity-40"
        >
          {model.left.label}
        </button>

        <span>{model.centerText ?? "Quipu Yachay"}</span>

        <button
          disabled={!model.right.enabled}
          onClick={model.right.onClick}
          className="h-8 px-3 rounded bg-white/10 disabled:opacity-40"
        >
          {model.right.label}
        </button>
      </div>
    </footer>
  );
}




// export default function ModuleFooter() {
//   return (
//     <footer className="h-10 bg-neutral-900 border-t border-white/10">
//       <div className="h-full px-4 flex items-center justify-between text-white/80 text-sm">
//         <button
//           disabled= {true}       //{!nextEnabled}
//           className="h-8 px-3 rounded bg-white/10 disabled:opacity-40"
//         >
//           ◀ Atrás
//         </button>

//         <span>Quipu Yachay</span>

//         <button
//           disabled= {false}
//           className="h-8 px-3 rounded bg-white/10 disabled:opacity-40"
//         >
//           Siguiente ▶
//         </button>
//       </div>
//     </footer>
//   );
// }
