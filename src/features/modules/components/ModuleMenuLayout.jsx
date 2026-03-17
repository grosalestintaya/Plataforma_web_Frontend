// src/features/module-menu/components/ModuleMenuLayout.jsx
import React from "react";

export default function ModuleMenuLayout({ left, center, right }) {
  return (
    <main className="px-4 pb-12 pt-2 md:px-8 lg:px-10">
      <div className="relative min-h-[65vh]">
        {" "}
        {left}
        <section className="mx-auto flex w-full max-w-[820px] justify-center">
          {center}
        </section>
        {right}
      </div>
    </main>
  );
}
