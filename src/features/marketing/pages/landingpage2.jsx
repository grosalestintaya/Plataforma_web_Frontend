import React from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────
   PALETTE
   Primary  : #00C853  verde
   Blue     : #2962FF
   Yellow   : #FFC400
   Pink     : #FF4081
   Purple   : #7C4DFF
   Ink      : #003318  (text oscuro sobre verde)
───────────────────────────────────────── */

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

  .qy-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #00C853;
    color: #fff;
    overflow-x: hidden;
    min-height: 100vh;
  }

  /* ── NAVBAR (blanco estático) ── */
  .qy-nav {
    background: #fff;
    border-bottom: 1px solid rgba(0,200,83,0.15);
    padding: 0 2rem;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .qy-nav-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 66px;
  }
  .qy-logo-mark {
    width: 38px; height: 38px; border-radius: 11px;
    background: #00C853;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-weight: 900;
    color: #fff; font-size: 18px; flex-shrink: 0;
  }
  .qy-logo-text  { font-family: 'Fraunces', serif; font-weight: 700; font-size: 17px; color: #003318; }
  .qy-logo-sub   { font-size: 10px; color: #7A7560; font-weight: 600; }
  .qy-nav-link {
    font-size: 13px; font-weight: 700; color: #444;
    text-decoration: none; padding: 7px 14px; border-radius: 9px;
    transition: background 0.15s, color 0.15s; border: none; background: none; cursor: pointer;
  }
  .qy-nav-link:hover { background: #F0FDF4; color: #00A844; }
  .qy-btn-nav {
    background: #00C853; color: #fff;
    font-size: 13px; font-weight: 800;
    border: none; border-radius: 10px; padding: 9px 20px; cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }
  .qy-btn-nav:hover { opacity: 0.88; transform: translateY(-1px); }

  /* ── HERO ── */
  .qy-hero {
    max-width: 1100px; margin: 0 auto;
    padding: 80px 2rem 72px;
    display: grid; grid-template-columns: 1fr 420px; gap: 56px; align-items: center;
  }
  .qy-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
    border-radius: 100px; padding: 6px 16px;
    font-size: 12px; font-weight: 800; color: #fff; margin-bottom: 22px;
  }
  .qy-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #FFC400; }
  .qy-h1 {
    font-family: 'Fraunces', serif; font-weight: 900;
    font-size: 58px; line-height: 1.0; color: #fff; margin-bottom: 22px;
  }
  .qy-h1 .ac-yellow  { color: #FFC400; }
  .qy-h1 .ac-muted   { color: rgba(255,255,255,0.5); font-style: italic; }
  .qy-hero-p { font-size: 16px; color: rgba(255,255,255,0.8); line-height: 1.8; max-width: 480px; margin-bottom: 34px; }
  .qy-hero-actions { display: flex; align-items: center; gap: 14px; }
  .qy-btn-hero {
    background: #fff; color: #00C853;
    font-size: 15px; font-weight: 800;
    border: none; border-radius: 14px; padding: 14px 28px; cursor: pointer;
    box-shadow: 0 4px 24px rgba(0,0,0,0.18);
    transition: opacity 0.15s, transform 0.15s;
  }
  .qy-btn-hero:hover { opacity: 0.9; transform: translateY(-2px); }
  .qy-btn-ghost {
    background: transparent; color: rgba(255,255,255,0.75);
    font-size: 14px; font-weight: 700; border: none; cursor: pointer;
    text-decoration: underline; text-underline-offset: 3px;
  }
  .qy-stats { display: flex; gap: 28px; margin-top: 38px; align-items: center; }
  .qy-stat-n { font-family: 'Fraunces', serif; font-weight: 900; font-size: 30px; color: #fff; }
  .qy-stat-l { font-size: 12px; color: rgba(255,255,255,0.6); font-weight: 600; }
  .qy-stat-sep { width: 1px; height: 36px; background: rgba(255,255,255,0.2); }

  /* Hero card */
  .qy-hero-card {
    background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.18);
    border-radius: 24px; padding: 28px; backdrop-filter: blur(8px);
  }
  .qy-mission-label {
    display: inline-flex; align-items: center; gap: 6px;
    background: #FFC400; color: #1A1100;
    font-size: 11px; font-weight: 800;
    border-radius: 8px; padding: 4px 10px; margin-bottom: 14px;
  }
  .qy-mission-title { font-weight: 800; font-size: 15px; color: #fff; margin-bottom: 6px; }
  .qy-mission-sub   { font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6; }
  .qy-prog-wrap { background: rgba(255,255,255,0.15); border-radius: 100px; height: 7px; margin-top: 14px; overflow: hidden; }
  .qy-prog-bar  { height: 100%; border-radius: 100px; background: #fff; }
  .qy-prog-row  { display: flex; justify-content: space-between; margin-top: 7px; }
  .qy-prog-lbl  { font-size: 11px; color: rgba(255,255,255,0.6); font-weight: 700; }
  .qy-mini-row  { display: flex; gap: 8px; margin-top: 14px; }
  .qy-mini-chip {
    flex: 1; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18);
    border-radius: 10px; padding: 10px 12px;
    display: flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 800; color: #fff;
  }
  .qy-badges-r { display: flex; gap: 7px; margin-top: 12px; flex-wrap: wrap; }
  .qy-bp {
    font-size: 11px; font-weight: 800;
    border-radius: 100px; padding: 4px 12px;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .bp-yellow  { background: #FFC400; color: #1A1100; }
  .bp-blue    { background: #2962FF; color: #fff; }
  .bp-purple  { background: #7C4DFF; color: #fff; }
  .bp-pink    { background: #FF4081; color: #fff; }
  .bp-white   { background: rgba(255,255,255,0.15); color: #fff; }

  /* ── DIVIDER ── */
  .qy-divider { border: none; border-top: 1px solid rgba(255,255,255,0.15); margin: 0 2rem; }

  /* ── SECTIONS ── */
  .qy-section { max-width: 1100px; margin: 0 auto; padding: 64px 2rem; }
  .qy-s-label {
    font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
    color: rgba(255,255,255,0.55); margin-bottom: 10px;
  }
  .qy-s-h2 {
    font-family: 'Fraunces', serif; font-weight: 900; font-size: 38px;
    color: #fff; line-height: 1.1; margin-bottom: 12px;
  }
  .qy-s-p { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.8; max-width: 560px; }

  /* ── WHAT GRID ── */
  .qy-what-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 36px; }
  .qy-what-card {
    border-radius: 22px; padding: 28px;
    border: 1px solid rgba(255,255,255,0.18);
    transition: transform 0.2s; position: relative; overflow: hidden;
  }
  .qy-what-card:hover { transform: translateY(-3px); }
  .wc-glass  { background: rgba(255,255,255,0.1); }
  .wc-blue   { background: #2962FF; }
  .wc-yellow { background: #FFC400; }
  .qy-what-icon {
    width: 46px; height: 46px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 18px;
  }
  .wi-glass  { background: rgba(255,255,255,0.15); }
  .wi-blue   { background: rgba(255,255,255,0.18); }
  .wi-yellow { background: rgba(0,0,0,0.10); }
  .qy-wct { font-weight: 800; font-size: 19px; margin-bottom: 8px; }
  .wct-w { color: #fff; }
  .wct-dark { color: #1A1100; }
  .qy-wcd { font-size: 13px; line-height: 1.65; }
  .wcd-w    { color: rgba(255,255,255,0.72); }
  .wcd-dark { color: rgba(26,17,0,0.7); }
  .qy-what-items { list-style: none; margin-top: 16px; display: flex; flex-direction: column; gap: 7px; }
  .qy-what-items li { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; }
  .li-w    { color: rgba(255,255,255,0.85); }
  .li-dark { color: #1A1100; }
  .qy-wd   { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* ── HOW ── */
  .qy-how-wrap {
    margin-top: 36px; border-radius: 24px; padding: 32px;
    background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.15);
  }
  .qy-steps-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  .qy-step-card {
    border-radius: 16px; padding: 20px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.07);
  }
  .qy-step-n {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 15px; font-family: 'Fraunces', serif; margin-bottom: 12px;
  }
  .qy-step-title { font-weight: 800; font-size: 14px; color: #fff; margin-bottom: 4px; }
  .qy-step-desc  { font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.6; }
  .qy-how-cta {
    margin-top: 20px; border-radius: 16px; padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
    flex-wrap: wrap; gap: 12px;
  }
  .qy-how-cta-t { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.85); }
  .qy-btn-white {
    background: #fff; color: #00C853;
    font-size: 13px; font-weight: 800;
    border: none; border-radius: 10px; padding: 9px 20px; cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }
  .qy-btn-white:hover { opacity: 0.88; transform: translateY(-1px); }

  /* ── REWARDS ── */
  .qy-rewards-hdr { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
  .qy-rewards-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-top: 36px; }
  .qy-reward-card {
    border-radius: 22px; padding: 22px;
    border: 1px solid rgba(255,255,255,0.18);
    transition: transform 0.2s;
  }
  .qy-reward-card:hover { transform: translateY(-2px); }
  .rc-purple { background: rgba(124,77,255,0.25); }
  .rc-pink   { background: rgba(255,64,129,0.22); }
  .rc-blue   { background: rgba(41,98,255,0.25); }
  .rc-yellow { background: rgba(255,196,0,0.22); }
  .qy-reward-icon  { font-size: 28px; margin-bottom: 12px; }
  .qy-reward-title { font-weight: 800; font-size: 15px; color: #fff; margin-bottom: 6px; }
  .qy-reward-desc  { font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6; }
  .qy-reward-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 800;
    background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8);
    border-radius: 100px; padding: 3px 10px; margin-top: 10px;
  }

  /* Badges box */
  .qy-badges-box {
    margin-top: 20px; border-radius: 20px; padding: 24px;
    background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.15);
  }
  .qy-badges-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .qy-badges-hdr-t { font-weight: 800; font-size: 14px; color: #fff; }
  .qy-badges-hdr-s { font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 600; }
  .qy-badges-pills { display: flex; flex-wrap: wrap; gap: 8px; }

  /* ── CULTURAL (azul) ── */
  .qy-cultural {
    background: #2962FF;
    padding: 64px 2rem; position: relative; overflow: hidden;
  }
  .qy-cultural::before {
    content: ''; position: absolute; inset: 0;
    background-image: repeating-linear-gradient(
      90deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px,
      transparent 1px, transparent 28px
    );
  }
  .qy-cultural-inner {
    max-width: 1100px; margin: 0 auto; position: relative; z-index: 1;
    display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center;
  }
  .qy-cultural-h2 {
    font-family: 'Fraunces', serif; font-weight: 900; font-size: 40px;
    color: #fff; line-height: 1.05; margin-bottom: 14px;
  }
  .qy-cultural-h2 .cy { color: #FFC400; }
  .qy-cultural-p { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.8; max-width: 480px; margin-bottom: 28px; }
  .qy-btn-yellow {
    background: #FFC400; color: #1A1100;
    font-size: 14px; font-weight: 800;
    border: none; border-radius: 12px; padding: 13px 24px; cursor: pointer;
    transition: opacity 0.15s;
  }
  .qy-btn-yellow:hover { opacity: 0.88; }

  /* Quipu decoration */
  .qy-quipu-deco { display: flex; gap: 10px; align-items: flex-start; padding-top: 16px; }
  .qy-qs { display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .qy-qk { width: 11px; height: 11px; border-radius: 50%; }
  .qy-ql { width: 2px; background: rgba(255,255,255,0.22); }

  /* ── FOOTER ── */
  .qy-footer {
    background: #009E40;
    border-top: 1px solid rgba(255,255,255,0.15);
    padding: 48px 2rem 28px;
  }
  .qy-footer-inner { max-width: 1100px; margin: 0 auto; }
  .qy-footer-grid  { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; }
  .qy-footer-p {
    font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.75;
    margin-top: 12px; max-width: 320px;
  }
  .qy-footer-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
  .qy-footer-pill {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.75);
    background: rgba(255,255,255,0.1); border-radius: 100px; padding: 4px 12px;
    border: 1px solid rgba(255,255,255,0.15);
  }
  .qy-fpd { width: 6px; height: 6px; border-radius: 50%; }
  .qy-footer-h {
    font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
    color: rgba(255,255,255,0.5); margin-bottom: 14px;
  }
  .qy-footer-links { list-style: none; display: flex; flex-direction: column; gap: 9px; }
  .qy-footer-links a {
    font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7);
    text-decoration: none; transition: color 0.15s;
  }
  .qy-footer-links a:hover { color: #fff; }
  .qy-footer-tip {
    background: rgba(0,0,0,0.2); border-radius: 16px; padding: 16px 18px;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .qy-footer-tip-t { font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 6px; }
  .qy-footer-tip-p { font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.65; }
  .qy-footer-bottom {
    margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);
    display: flex; justify-content: space-between; align-items: center;
  }
  .qy-footer-copy { font-size: 12px; color: rgba(255,255,255,0.5); }
  .qy-cdots { display: flex; gap: 5px; }
  .qy-cd   { width: 7px; height: 7px; border-radius: 50%; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .qy-hero           { grid-template-columns: 1fr; padding: 48px 1.25rem 40px; gap: 32px; }
    .qy-what-grid      { grid-template-columns: 1fr; }
    .qy-steps-grid     { grid-template-columns: repeat(2,1fr); }
    .qy-rewards-grid   { grid-template-columns: repeat(2,1fr); }
    .qy-footer-grid    { grid-template-columns: 1fr; gap: 32px; }
    .qy-cultural-inner { grid-template-columns: 1fr; }
    .qy-quipu-deco     { display: none; }
    .qy-h1             { font-size: 40px; }
    .qy-s-h2           { font-size: 28px; }
    .qy-cultural-h2    { font-size: 30px; }
  }
`;

/* ─── Sub-components ─── */
import Heros from "@/assets/marketing/hero.webp";
function Navbar() {
  return (
    <nav className="qy-nav  sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur bg-yellow-50">
      <div className="qy-nav-inner ">
        <div className="flex items-center gap-3 ">
          <img src="/logo_full.webp" alt="Quipu Yachay" className="h-12 " />
          <div className="  leading-tight ">
            <div className="pl-10 text-xl text-slate-600 text-yellow-700 ">
              Tejiendo saberes, ordenando tu futuro.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="qy-nav-link"
            onClick={() =>
              document
                .getElementById("como-funciona")
                ?.scrollIntoView({ behavior: "smooth" })
            }>
            ¿Cómo funciona?
          </button>
          <Link to="/login">
            <button className="qy-btn-nav">Iniciar sesión</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="qy-hero">
      <div>
        <div className="qy-hero-badge">
          <span className="qy-badge-dot" />
          Educación financiera gamificada
        </div>
        <h1 className="qy-h1">
          Aprende a<br />
          manejar tu
          <br />
          <span className="ac-yellow">dinero.</span>
          <br />
          <span className="ac-muted">jugando.</span>
        </h1>
        <p className="qy-hero-p">
          Quipu Yachay te guía con misiones cortas, retos reales y recompensas
          que te motivan a seguir. Para estudiantes de colegios del Perú.
        </p>
        <div className="qy-hero-actions">
          <Link to="/login">
            <button className="qy-btn-hero">Comenzar ahora →</button>
          </Link>
          <button
            className="qy-btn-ghost"
            onClick={() =>
              document
                .getElementById("como-funciona")
                ?.scrollIntoView({ behavior: "smooth" })
            }>
            Ver cómo funciona
          </button>
        </div>
        <div className="qy-stats">
          <div>
            <div className="qy-stat-n">3</div>
            <div className="qy-stat-l">Pasos por misión</div>
          </div>
          <div className="qy-stat-sep" />
          <div>
            <div className="qy-stat-n">6+</div>
            <div className="qy-stat-l">Tipos de insignias</div>
          </div>
          <div className="qy-stat-sep" />
          <div>
            <div className="qy-stat-n">100%</div>
            <div className="qy-stat-l">En la web</div>
          </div>
        </div>
      </div>
      <Heros />

      {/* Preview card */}
      <div className="qy-hero-card">
        <div className="qy-mission-label">🎯 Misión activa</div>
        <div className="qy-mission-title">El presupuesto de Lucía</div>
        <div className="qy-mission-sub">
          Lucía recibe S/. 50 a la semana. ¿Cómo debería distribuirlos?
        </div>
        <div className="qy-prog-wrap">
          <div className="qy-prog-bar" style={{ width: "68%" }} />
        </div>
        <div className="qy-prog-row">
          <span className="qy-prog-lbl">68% completado</span>
          <span className="qy-prog-lbl">+120 XP</span>
        </div>
        <div className="qy-mini-row">
          <div className="qy-mini-chip">🔥 Racha 5 días</div>
          <div className="qy-mini-chip">⭐ Nivel 3</div>
        </div>
        <div className="qy-badges-r">
          <span className={`qy-bp bp-yellow`}>🏅 Ahorrista</span>
          <span className={`qy-bp bp-purple`}>🎯 Decisor</span>
          <span className={`qy-bp bp-pink`}>⚡ Constante</span>
        </div>
      </div>
    </section>
  );
}

function WhatSection() {
  const cards = [
    {
      cls: "wc-glass",
      iconCls: "wi-glass",
      icon: "📚",
      titleCls: "wct-w",
      descCls: "wcd-w",
      liCls: "li-w",
      dotBg: "rgba(255,255,255,0.5)",
      title: "Aprender",
      desc: "Conceptos clave con historias y ejemplos del día a día.",
      items: ["Ingresos vs gastos", "Ahorro inteligente", "Metas financieras"],
    },
    {
      cls: "wc-blue",
      iconCls: "wi-blue",
      icon: "⚔️",
      titleCls: "wct-w",
      descCls: "wcd-w",
      liCls: "li-w",
      dotBg: "rgba(255,255,255,0.5)",
      title: "Practicar",
      desc: "Retos rápidos con feedback inmediato para reforzar.",
      items: ["Presupuesto real", "Tomar decisiones", "Priorizar gastos"],
    },
    {
      cls: "wc-yellow",
      iconCls: "wi-yellow",
      icon: "🏆",
      titleCls: "wct-dark",
      descCls: "wcd-dark",
      liCls: "li-dark",
      dotBg: "rgba(26,17,0,0.35)",
      title: "Ganar",
      desc: "Puntos, insignias y posiciones en el ranking de tu salón.",
      items: ["Insignias únicas", "Ranking del salón", "Logros desbloqueables"],
    },
  ];

  return (
    <section className="qy-section" id="que-haras-aqui">
      <div className="qy-s-label">La experiencia</div>
      <h2 className="qy-s-h2">¿Qué harás aquí?</h2>
      <p className="qy-s-p">
        Aprende el concepto, practícalo con retos reales y gana recompensas que
        reflejan tu avance.
      </p>
      <div className="qy-what-grid">
        {cards.map((c) => (
          <div key={c.title} className={`qy-what-card ${c.cls}`}>
            <div className={`qy-what-icon ${c.iconCls}`}>{c.icon}</div>
            <div className={`qy-wct ${c.titleCls}`}>{c.title}</div>
            <div className={`qy-wcd ${c.descCls}`}>{c.desc}</div>
            <ul className="qy-what-items">
              {c.items.map((it) => (
                <li key={it} className={c.liCls}>
                  <span className="qy-wd" style={{ background: c.dotBg }} />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowSection() {
  const steps = [
    {
      n: "1",
      bg: "#FFC400",
      color: "#1A1100",
      title: "Historia",
      desc: "Un caso corto y real te pone en situación.",
    },
    {
      n: "2",
      bg: "#fff",
      color: "#00C853",
      title: "Actividad",
      desc: "Respondes, eliges o completas el reto.",
    },
    {
      n: "3",
      bg: "#2962FF",
      color: "#fff",
      title: "Feedback",
      desc: "Te explican el porqué de la respuesta correcta.",
    },
    {
      n: "4",
      bg: "#7C4DFF",
      color: "#fff",
      title: "Recompensa",
      desc: "Ganas XP, puntos e insignias.",
    },
  ];

  return (
    <section className="qy-section" id="como-funciona">
      <div className="qy-s-label">El flujo</div>
      <h2 className="qy-s-h2">¿Cómo funciona una misión?</h2>
      <p className="qy-s-p">
        Cuatro pasos cortos. Cada misión completa en minutos.
      </p>
      <div className="qy-how-wrap">
        <div className="qy-steps-grid">
          {steps.map((s) => (
            <div key={s.n} className="qy-step-card">
              <div
                className="qy-step-n"
                style={{ background: s.bg, color: s.color }}>
                {s.n}
              </div>
              <div className="qy-step-title">{s.title}</div>
              <div className="qy-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="qy-how-cta">
          <div className="qy-how-cta-t">
            Todo en pantallas cortas — avanzas rápido, sin perder el hilo.
          </div>
          <Link to="/login">
            <button className="qy-btn-white">Entrar y comenzar</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function RewardsSection() {
  const rewards = [
    {
      cls: "rc-purple",
      icon: "🏅",
      title: "Insignias",
      desc: "Logros únicos por completar misiones y retos especiales.",
      tag: "Colección",
    },
    {
      cls: "rc-pink",
      icon: "🔥",
      title: "Racha",
      desc: "Días seguidos aprendiendo. No la rompas.",
      tag: "Constancia",
    },
    {
      cls: "rc-blue",
      icon: "⭐",
      title: "Nivel",
      desc: "Sube con cada misión completada y punto ganado.",
      tag: "Progreso",
    },
    {
      cls: "rc-yellow",
      icon: "🏆",
      title: "Ranking",
      desc: "Tu posición comparada con tu salón en tiempo real.",
      tag: "Motivación",
    },
  ];

  const badges = [
    { cls: "bp-white", label: "🌿 Ahorrista" },
    { cls: "bp-blue", label: "📋 Planificador" },
    { cls: "bp-yellow", label: "⚡ Decisor" },
    { cls: "bp-pink", label: "🔥 Constante" },
    { cls: "bp-purple", label: "🦁 Avanzado" },
    { cls: "bp-yellow", label: "🏅 Finalista" },
  ];

  return (
    <section className="qy-section" id="recompensas">
      <div className="qy-rewards-hdr">
        <div>
          <div className="qy-s-label">Gamificación</div>
          <h2 className="qy-s-h2">Recompensas y progreso</h2>
          <p className="qy-s-p">
            Cada misión te da puntos. Sube de nivel, desbloquea insignias,
            mejora tu posición.
          </p>
        </div>
        <Link to="/login">
          <button className="qy-btn-white" style={{ whiteSpace: "nowrap" }}>
            Ver mis recompensas →
          </button>
        </Link>
      </div>

      <div className="qy-rewards-grid">
        {rewards.map((r) => (
          <div key={r.title} className={`qy-reward-card ${r.cls}`}>
            <div className="qy-reward-icon">{r.icon}</div>
            <div className="qy-reward-title">{r.title}</div>
            <div className="qy-reward-desc">{r.desc}</div>
            <div className="qy-reward-tag">{r.tag}</div>
          </div>
        ))}
      </div>

      <div className="qy-badges-box">
        <div className="qy-badges-hdr">
          <div className="qy-badges-hdr-t">Insignias de ejemplo</div>
          <div className="qy-badges-hdr-s">Se desbloquean por desempeño</div>
        </div>
        <div className="qy-badges-pills">
          {badges.map((b) => (
            <span key={b.label} className={`qy-bp ${b.cls}`}>
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CulturalStrip() {
  const strings = [
    [
      { bg: "#FFC400", h: null },
      { h: 55 },
      { bg: "#FFC400", opacity: 0.5, h: null },
      { h: 28 },
    ],
    [
      { h: 18 },
      { bg: "#fff", h: null },
      { h: 48 },
      { bg: "#fff", opacity: 0.4, h: null },
      { h: 36 },
    ],
    [
      { bg: "#00C853", h: null },
      { h: 38 },
      { bg: "#00C853", opacity: 0.5, h: null },
      { h: 58 },
      { bg: "#00C853", opacity: 0.25, h: null },
    ],
    [
      { h: 30 },
      { bg: "rgba(255,255,255,0.4)", h: null },
      { h: 52 },
      { bg: "rgba(255,255,255,0.2)", h: null },
      { h: 22 },
    ],
    [
      { bg: "#FF4081", opacity: 0.8, h: null },
      { h: 42 },
      { bg: "#7C4DFF", opacity: 0.7, h: null },
      { h: 32 },
      { bg: "#FFC400", opacity: 0.5, h: null },
    ],
  ];

  return (
    <div className="qy-cultural">
      <div className="qy-cultural-inner">
        <div>
          <h2 className="qy-cultural-h2">
            El nombre lo
            <br />
            dice todo:
            <br />
            <span className="cy">Quipu</span> + Yachay.
          </h2>
          <p className="qy-cultural-p">
            El quipu fue el sistema de registro del Tawantinsuyo. Cada misión es
            un nudo en tu camino hacia el dominio financiero.
          </p>
          <Link to="/login">
            <button className="qy-btn-yellow">Comenzar mi camino →</button>
          </Link>
        </div>

        <div className="qy-quipu-deco">
          {strings.map((str, si) => (
            <div key={si} className="qy-qs">
              {str.map((el, ei) =>
                el.h != null ? (
                  <div key={ei} className="qy-ql" style={{ height: el.h }} />
                ) : (
                  <div
                    key={ei}
                    className="qy-qk"
                    style={{ background: el.bg, opacity: el.opacity ?? 1 }}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="qy-footer">
      <div className="qy-footer-inner">
        <div className="qy-footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="qy-logo-mark">Q</div>
              <div>
                <div className="qy-logo-text">Quipu Yachay</div>
                <div className="qy-logo-sub">
                  Tejiendo saberes, ordenando tu futuro.
                </div>
              </div>
            </div>
            <p className="qy-footer-p">
              Plataforma gamificada de educación financiera para estudiantes
              peruanos. Misiones, retos y recompensas.
            </p>
            <div className="qy-footer-pills">
              <span className="qy-footer-pill">
                <span className="qy-fpd" style={{ background: "#FFC400" }} />{" "}
                Para colegios
              </span>
              <span className="qy-footer-pill">
                <span className="qy-fpd" style={{ background: "#fff" }} /> En la
                web
              </span>
              <span className="qy-footer-pill">
                <span className="qy-fpd" style={{ background: "#7C4DFF" }} />{" "}
                Misiones cortas
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="qy-footer-h">Accesos</div>
            <ul className="qy-footer-links">
              <li>
                <Link to="/login">
                  <a>Iniciar sesión</a>
                </Link>
              </li>
              <li>
                <Link to="/i">
                  <a>Introducción</a>
                </Link>
              </li>
              <li>
                <a href="#como-funciona">¿Cómo funciona?</a>
              </li>
            </ul>
            <div className="qy-footer-h" style={{ marginTop: 22 }}>
              Ayuda
            </div>
            <ul className="qy-footer-links">
              <li>
                <a>Preguntas frecuentes (próximamente)</a>
              </li>
              <li>
                <a>Soporte del colegio</a>
              </li>
            </ul>
          </div>

          {/* Tip */}
          <div>
            <div className="qy-footer-h">Consejo rápido</div>
            <div className="qy-footer-tip">
              <div className="qy-footer-tip-t">
                No necesitas ser bueno en mate.
              </div>
              <p className="qy-footer-tip-p">
                Solo constancia: misiones cortas, todos los días. El hábito hace
                al experto financiero.
              </p>
            </div>
          </div>
        </div>

        <div className="qy-footer-bottom">
          <div className="qy-footer-copy">
            © {new Date().getFullYear()} Quipu Yachay
          </div>
          <div className="qy-cdots">
            <div className="qy-cd" style={{ background: "#fff" }} />
            <div className="qy-cd" style={{ background: "#FFC400" }} />
            <div className="qy-cd" style={{ background: "#2962FF" }} />
            <div className="qy-cd" style={{ background: "#FF4081" }} />
            <div className="qy-cd" style={{ background: "#7C4DFF" }} />
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN EXPORT ─── */
export default function LandingPage() {
  return (
    <>
      <style>{styles}</style>
      <div className="qy-root">
        <Navbar />
        <Hero />
        <hr className="qy-divider" />
        <WhatSection />
        <hr className="qy-divider" />
        <HowSection />
        <hr className="qy-divider" />
        <RewardsSection />
        <CulturalStrip />
        <Footer />
      </div>
    </>
  );
}
