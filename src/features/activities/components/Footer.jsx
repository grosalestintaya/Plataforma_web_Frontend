/**
 * Renderiza la navegación inferior del reproductor.
 * Usa un modelo ya resuelto por el hook principal.
 */
export default function Footer({ model }) {
  return (
    <footer className="px-6 py-4 border-t border-white/10 bg-neutral-950 text-white">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          {model?.showPrev && (
            <button
              disabled={!model?.prevEnabled}
              onClick={model?.onPrev}
              className="rounded-xl px-4 py-2 bg-white/10 border border-white/10 disabled:opacity-40"
            >
              Anterior
            </button>
          )}

          {model?.showNext && (
            <button
              disabled={!model?.nextEnabled}
              onClick={model?.onNext}
              className="rounded-xl px-4 py-2 bg-white/10 border border-white/10 disabled:opacity-40"
            >
              Siguiente
            </button>
          )}

          {model?.showFinish && (
            <button
              disabled={!model?.finishEnabled}
              onClick={model?.onFinish}
              className="rounded-xl px-4 py-2 bg-white/10 border border-white/10 disabled:opacity-40"
            >
              Finalizar
            </button>
          )}
        </div>

        <button
          onClick={model?.onExit}
          className="rounded-xl px-4 py-2 bg-white/10 border border-white/10"
        >
          Salir
        </button>
      </div>
    </footer>
  );
}