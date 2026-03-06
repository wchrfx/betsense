
import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase";

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg: #0a0c10;
    --surface: #111318;
    --card: #161a22;
    --border: #1f2430;
    --border2: #2a3040;
    --text: #e8ecf4;
    --muted: #6b7590;
    --accent: #00e5a0;
    --accent2: #0098ff;
    --gold: #f5c842;
    --danger: #ff4d6a;
    --warning: #ff9f43;
    --premium: #c084fc;
    --grad1: linear-gradient(135deg, #00e5a0 0%, #0098ff 100%);
    --grad2: linear-gradient(135deg, #c084fc 0%, #818cf8 100%);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app { display: flex; min-height: 100vh; }

  .sidebar {
    width: 240px; background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 24px 0; position: fixed;
    top: 0; left: 0; height: 100vh; z-index: 50;
  }

  .logo {
    display: flex; align-items: center; gap: 10px;
    padding: 0 20px 32px; border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }

  .logo-icon {
    width: 36px; height: 36px; background: var(--grad1);
    border-radius: 10px; display: flex; align-items: center;
    justify-content: center; font-size: 18px;
  }

  .logo-text {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px;
    background: var(--grad1); -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; background-clip: text;
  }

  .nav-section { padding: 8px 12px; flex: 1; }

  .nav-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--muted); padding: 4px 8px 8px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px; cursor: pointer;
    transition: all 0.15s; font-size: 14px; font-weight: 500;
    color: var(--muted); margin-bottom: 2px;
  }

  .nav-item:hover { background: var(--card); color: var(--text); }
  .nav-item.active { background: rgba(0,229,160,0.1); color: var(--accent); }
  .nav-item .icon { font-size: 16px; width: 20px; text-align: center; }

  .sidebar-bottom { padding: 16px 20px; border-top: 1px solid var(--border); }

  .sidebar-user { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }

  .avatar {
    width: 36px; height: 36px; background: var(--grad2);
    border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0;
  }

  .user-info { min-width: 0; }
  .user-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-plan { font-size: 11px; color: var(--accent); font-weight: 500; }
  .user-plan.free { color: var(--muted); }

  .logout-btn {
    width: 100%; padding: 8px; background: transparent;
    border: 1px solid var(--border); border-radius: 8px;
    color: var(--muted); font-size: 12px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.15s; text-align: center;
  }
  .logout-btn:hover { border-color: var(--danger); color: var(--danger); }

  .main { margin-left: 240px; flex: 1; padding: 32px; max-width: 1200px; }

  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
  }

  .page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--text); }
  .page-subtitle { font-size: 14px; color: var(--muted); margin-top: 4px; }

  .stats-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px; margin-bottom: 32px;
  }

  .stat-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 20px; position: relative; overflow: hidden;
  }

  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 2px; background: var(--grad1);
  }

  .stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: var(--text); line-height: 1; }
  .stat-value.green { color: var(--accent); }
  .stat-value.gold { color: var(--gold); }
  .stat-value.blue { color: var(--accent2); }
  .stat-sub { font-size: 12px; color: var(--muted); margin-top: 6px; }

  .streak { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
  .streak-dot { width: 14px; height: 14px; border-radius: 3px; }
  .streak-dot.won { background: var(--accent); }
  .streak-dot.lost { background: var(--danger); }

  .filter-bar { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }

  .filter-btn {
    padding: 8px 16px; border-radius: 30px; border: 1px solid var(--border);
    background: var(--card); color: var(--muted); font-size: 13px;
    font-weight: 500; cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .filter-btn:hover { border-color: var(--border2); color: var(--text); }
  .filter-btn.active { background: rgba(0,229,160,0.1); border-color: var(--accent); color: var(--accent); }

  .tips-grid { display: grid; gap: 16px; }

  .tip-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    transition: border-color 0.2s, transform 0.2s; position: relative;
  }
  .tip-card:hover { border-color: var(--border2); transform: translateY(-1px); }
  .tip-card.premium-locked { opacity: 0.85; }

  .tip-header { padding: 18px 20px 14px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .tip-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
  }
  .badge.sport-football { background: rgba(0,229,160,0.12); color: var(--accent); }
  .badge.sport-basketball { background: rgba(255,159,67,0.12); color: var(--warning); }
  .badge.league { background: rgba(107,117,144,0.15); color: var(--muted); }
  .badge.premium { background: rgba(192,132,252,0.15); color: var(--premium); }
  .badge.free-badge { background: rgba(0,152,255,0.12); color: var(--accent2); }
  .badge.market { background: rgba(0,152,255,0.1); color: var(--accent2); }
  .badge.result-won { background: rgba(0,229,160,0.15); color: var(--accent); }
  .badge.result-lost { background: rgba(255,77,106,0.15); color: var(--danger); }
  .badge.result-pending { background: rgba(107,117,144,0.15); color: var(--muted); }

  .match-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: var(--text); line-height: 1.3; }

  .tip-prediction-row { padding: 0 20px 16px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

  .prediction-pill {
    background: rgba(0,229,160,0.08); border: 1px solid rgba(0,229,160,0.3);
    border-radius: 8px; padding: 8px 16px; display: flex; flex-direction: column; gap: 2px;
  }
  .prediction-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
  .prediction-value { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: var(--accent); }

  .odds-pill {
    background: rgba(245,200,66,0.08); border: 1px solid rgba(245,200,66,0.25);
    border-radius: 8px; padding: 8px 16px; display: flex; flex-direction: column; gap: 2px;
  }
  .odds-value { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: var(--gold); }

  .metrics-row { padding: 0 20px 16px; display: flex; gap: 20px; flex-wrap: wrap; }
  .metric-item { flex: 1; min-width: 140px; }
  .metric-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 6px; }

  .confidence-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
  .confidence-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
  .confidence-text { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }

  .value-stars { display: flex; gap: 3px; }
  .star { width: 16px; height: 16px; border-radius: 3px; }
  .star.filled { background: var(--gold); }
  .star.empty { background: var(--border2); }

  .bias-indicator { display: flex; align-items: center; gap: 6px; }
  .bias-bar { display: flex; gap: 3px; }
  .bias-seg { width: 20px; height: 6px; border-radius: 2px; }
  .bias-seg.filled.low { background: var(--accent2); }
  .bias-seg.filled.medium { background: var(--warning); }
  .bias-seg.filled.high { background: var(--danger); }
  .bias-seg.empty { background: var(--border2); }
  .bias-text { font-size: 12px; font-weight: 600; }
  .bias-text.low { color: var(--accent2); }
  .bias-text.medium { color: var(--warning); }
  .bias-text.high { color: var(--danger); }

  .tip-footer {
    padding: 12px 20px; border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 8px;
  }
  .match-date-text { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 6px; }

  .expand-btn {
    background: none; border: 1px solid var(--border); border-radius: 8px;
    padding: 5px 12px; font-size: 12px; font-weight: 500; color: var(--muted);
    cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .expand-btn:hover { border-color: var(--accent); color: var(--accent); }

  .reasoning-panel {
    padding: 16px 20px 20px; border-top: 1px solid var(--border);
    background: rgba(0,0,0,0.2); animation: fadeIn 0.2s ease;
  }
  .reasoning-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 10px; }
  .reasoning-text { font-size: 14px; line-height: 1.7; color: #c8d0e4; }
  .analyst-note {
    margin-top: 12px; padding: 10px 14px;
    background: rgba(245,200,66,0.06); border-left: 3px solid var(--gold);
    border-radius: 0 8px 8px 0; font-size: 13px; color: var(--gold);
  }

  .locked-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 40%, rgba(10,12,16,0.95) 70%);
    display: flex; align-items: flex-end; justify-content: center;
    padding-bottom: 24px; border-radius: 16px; z-index: 10;
  }
  .locked-cta { text-align: center; }
  .locked-icon { font-size: 24px; margin-bottom: 8px; }
  .locked-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .locked-sub { font-size: 12px; color: var(--muted); margin-bottom: 12px; }

  .btn-primary {
    background: var(--grad1); color: #000; font-weight: 700; font-size: 14px;
    padding: 10px 24px; border: none; border-radius: 10px; cursor: pointer;
    font-family: 'Syne', sans-serif; transition: opacity 0.15s, transform 0.15s;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .btn-secondary {
    background: transparent; color: var(--text); font-weight: 600; font-size: 14px;
    padding: 10px 24px; border: 1px solid var(--border2); border-radius: 10px;
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  .btn-premium {
    background: var(--grad2); color: #fff; font-weight: 700; font-size: 13px;
    padding: 8px 20px; border: none; border-radius: 10px; cursor: pointer;
    font-family: 'Syne', sans-serif; transition: opacity 0.15s;
  }
  .btn-premium:hover { opacity: 0.85; }

  .sub-page { max-width: 800px; }
  .plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }

  .plan-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px 24px; cursor: pointer;
    transition: all 0.2s; position: relative;
  }
  .plan-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .plan-card.selected { border-color: var(--accent); background: rgba(0,229,160,0.04); }
  .plan-card.popular::before {
    content: 'BEST VALUE'; position: absolute; top: -12px; left: 50%;
    transform: translateX(-50%); background: var(--grad1); color: #000;
    font-size: 10px; font-weight: 800; letter-spacing: 0.1em;
    padding: 3px 12px; border-radius: 20px; font-family: 'Syne', sans-serif;
  }

  .plan-name { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 4px; }
  .plan-price { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: var(--accent); line-height: 1; margin: 12px 0 4px; }
  .plan-currency { font-size: 16px; vertical-align: super; font-weight: 600; }
  .plan-period { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .plan-features { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .plan-feature { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
  .plan-feature.included { color: var(--text); }
  .plan-feature .check { color: var(--accent); }

  .payment-form { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px 24px; margin-bottom: 20px; }
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px; }

  .form-input {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px; color: var(--text);
    font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.15s;
  }
  .form-input:focus { border-color: var(--accent); }
  .form-input::placeholder { color: var(--muted); }

  .payment-instruction {
    background: rgba(0,229,160,0.06); border: 1px solid rgba(0,229,160,0.2);
    border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;
  }
  .payment-instruction h4 { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
  .payment-instruction p { font-size: 13px; line-height: 1.7; color: #9ba8bf; }
  .payment-instruction code { background: rgba(0,229,160,0.15); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-weight: 600; }

  .admin-section { margin-bottom: 32px; }
  .admin-table { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; width: 100%; }

  .table-header {
    display: grid; gap: 12px; padding: 12px 16px; background: rgba(0,0,0,0.2);
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--muted); border-bottom: 1px solid var(--border);
  }
  .table-row {
    display: grid; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--border);
    align-items: center; transition: background 0.15s;
  }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: rgba(255,255,255,0.02); }

  .tips-table .table-header,
  .tips-table .table-row { grid-template-columns: 1fr 100px 90px 80px 90px 110px; }
  .users-table .table-header,
  .users-table .table-row { grid-template-columns: 1fr 140px 130px 100px 100px; }

  .table-cell { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .result-toggle { display: flex; gap: 4px; }

  .result-btn {
    padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: 600;
    cursor: pointer; border: 1px solid; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .result-btn.won { border-color: var(--accent); color: var(--accent); background: transparent; }
  .result-btn.won:hover, .result-btn.won.active { background: rgba(0,229,160,0.15); }
  .result-btn.lost { border-color: var(--danger); color: var(--danger); background: transparent; }
  .result-btn.lost:hover, .result-btn.lost.active { background: rgba(255,77,106,0.15); }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px); z-index: 100; display: flex;
    align-items: center; justify-content: center; padding: 20px;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 20px; padding: 28px; width: 100%;
    max-width: 600px; max-height: 90vh; overflow-y: auto;
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; }
  .modal-close {
    background: var(--card); border: 1px solid var(--border); width: 32px; height: 32px;
    border-radius: 8px; cursor: pointer; color: var(--muted); font-size: 16px;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .modal-close:hover { color: var(--text); border-color: var(--border2); }

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .form-select {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px; color: var(--text);
    font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.15s; cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7590' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
  }
  .form-select:focus { border-color: var(--accent); }

  .form-textarea {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px; color: var(--text);
    font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none;
    resize: vertical; min-height: 100px; line-height: 1.6; transition: border-color 0.15s;
  }
  .form-textarea:focus { border-color: var(--accent); }

  .range-row { display: flex; align-items: center; gap: 12px; }
  input[type="range"] { flex: 1; appearance: none; height: 4px; border-radius: 2px; background: var(--border2); outline: none; cursor: pointer; }
  input[type="range"]::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--accent); cursor: pointer; }
  .range-value { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--accent); min-width: 40px; text-align: right; }

  .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; }
  .toggle-label { font-size: 14px; font-weight: 500; }
  .toggle { position: relative; width: 40px; height: 22px; }
  .toggle input { display: none; }
  .toggle-slider { position: absolute; inset: 0; background: var(--border2); border-radius: 11px; cursor: pointer; transition: background 0.2s; }
  .toggle-slider::before { content: ''; position: absolute; width: 16px; height: 16px; border-radius: 50%; background: white; top: 3px; left: 3px; transition: transform 0.2s; }
  .toggle input:checked + .toggle-slider { background: var(--accent); }
  .toggle input:checked + .toggle-slider::before { transform: translateX(18px); }

  .status-dot { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; }
  .status-dot::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
  .status-dot.active::before { background: var(--accent); }
  .status-dot.active { color: var(--accent); }
  .status-dot.free::before { background: var(--muted); }
  .status-dot.free { color: var(--muted); }
  .status-dot.pending::before { background: var(--warning); }
  .status-dot.pending { color: var(--warning); }

  .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .empty-sub { font-size: 14px; }

  .success-state { text-align: center; padding: 40px 20px; }
  .success-icon { width: 64px; height: 64px; background: rgba(0,229,160,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.3s ease forwards; }
  .slide-in { animation: slideIn 0.4s ease forwards; }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .main { margin-left: 0; padding: 20px 16px; }
    .plans-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .tips-table .table-header,
    .tips-table .table-row { grid-template-columns: 1fr 80px 80px; }
    .tips-table .hide-mobile { display: none; }
  }

  .notification-banner {
    position: fixed; top: 20px; right: 20px; z-index: 999;
    background: var(--card); border: 1px solid var(--accent);
    border-radius: 12px; padding: 14px 18px; max-width: 320px;
    box-shadow: 0 8px 32px rgba(0,229,160,0.1); animation: slideIn 0.3s ease;
    display: flex; align-items: center; gap: 10px; font-size: 14px;
  }
  .notification-banner.error { border-color: var(--danger); }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--muted); }

  .auth-page { min-height: 100vh; background: #0a0c10; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .auth-card { background: #161a22; border: 1px solid #1f2430; border-radius: 20px; padding: 40px; width: 100%; max-width: 420px; }
  .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; justify-content: center; }
  .auth-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 6px; text-align: center; color: #e8ecf4; }
  .auth-sub { font-size: 14px; color: #6b7590; text-align: center; margin-bottom: 28px; }
  .auth-tabs { display: flex; background: #111318; border-radius: 10px; padding: 4px; margin-bottom: 24px; }
  .auth-tab { flex: 1; padding: 8px; text-align: center; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; color: #6b7590; transition: all 0.15s; border: none; background: none; font-family: 'DM Sans', sans-serif; }
  .auth-tab.active { background: #161a22; color: #e8ecf4; }
  .auth-error { background: rgba(255,77,106,0.1); border: 1px solid rgba(255,77,106,0.3); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #ff4d6a; margin-bottom: 16px; }
  .auth-success { background: rgba(0,229,160,0.1); border: 1px solid rgba(0,229,160,0.3); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #00e5a0; margin-bottom: 16px; text-align: center; }

  .loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; background: #0a0c10; color: #00e5a0; font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: 2px; flex-direction: column; gap: 16px; }
  .loading-dot { width: 8px; height: 8px; border-radius: 50%; background: #00e5a0; animation: pulse 1s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
`;

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-UG", { weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
}

function getConfidenceColor(pct) {
  if (pct >= 75) return "#00e5a0";
  if (pct >= 60) return "#0098ff";
  if (pct >= 45) return "#ff9f43";
  return "#ff4d6a";
}

function biasSegments(bias) {
  const map = { low: 1, medium: 2, high: 3 };
  return map[bias] || 1;
}

// ─────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────
function ValueStars({ rating }) {
  return (
    <div className="value-stars">
      {[1,2,3,4,5].map(i => <div key={i} className={`star ${i <= rating ? "filled" : "empty"}`} />)}
    </div>
  );
}

function BiasIndicator({ bias }) {
  const filled = biasSegments(bias);
  return (
    <div className="bias-indicator">
      <div className="bias-bar">
        {[1,2,3].map(i => <div key={i} className={`bias-seg ${i <= filled ? `filled ${bias}` : "empty"}`} />)}
      </div>
      <span className={`bias-text ${bias}`}>{bias.charAt(0).toUpperCase() + bias.slice(1)}</span>
    </div>
  );
}

function ConfidenceBar({ pct }) {
  const color = getConfidenceColor(pct);
  return (
    <div>
      <div className="confidence-bar">
        <div className="confidence-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="confidence-text" style={{ color }}>{pct}%</span>
    </div>
  );
}

function Notification({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`notification-banner ${type === "error" ? "error" : ""}`}>
      <span>{type === "error" ? "⚠️" : "✅"}</span>
      <span>{msg}</span>
      <span style={{marginLeft:"auto",cursor:"pointer",opacity:0.6}} onClick={onClose}>✕</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AUTH PAGE
// ─────────────────────────────────────────────────────────────
function AuthPage() {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Fill in all fields"); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); }
  };

  const handleSignup = async () => {
    if (!email || !password || !fullName) { setError("Fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess("Account created! Check your email to confirm, then log in.");
    setLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-icon">📈</div>
            <span className="logo-text">BetSense</span>
          </div>
          <h2 className="auth-title">{tab === "login" ? "Welcome back" : "Create account"}</h2>
          <p className="auth-sub">{tab === "login" ? "Sign in to access your tips" : "Start your BetSense journey"}</p>
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Login</button>
            <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}>Sign Up</button>
          </div>
          {error && <div className="auth-error">⚠️ {error}</div>}
          {success && <div className="auth-success">✅ {success}</div>}
          {tab === "signup" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleSignup())} />
          </div>
          <button className="btn-primary" style={{width:"100%",justifyContent:"center",marginTop:8}} onClick={tab === "login" ? handleLogin : handleSignup} disabled={loading}>
            {loading ? "Please wait..." : tab === "login" ? "→ Sign In" : "→ Create Account"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TIP CARD
// ─────────────────────────────────────────────────────────────
function TipCard({ tip, isPremiumUser, onSubscribeClick }) {
  const [expanded, setExpanded] = useState(false);
  const isLocked = tip.is_premium && !isPremiumUser;

  return (
    <div className={`tip-card ${isLocked ? "premium-locked" : ""} slide-in`}>
      <div className="tip-header">
        <div>
          <div className="tip-meta">
            <span className={`badge sport-${tip.sport}`}>{tip.sport === "football" ? "⚽" : "🏀"} {tip.sport}</span>
            <span className="badge league">{tip.league}</span>
            <span className="badge market">{tip.market_type}</span>
            {tip.is_premium ? <span className="badge premium">🔐 Premium</span> : <span className="badge free-badge">🆓 Free</span>}
            <span className={`badge result-${tip.result_status}`}>
              {tip.result_status === "won" ? "✓ Won" : tip.result_status === "lost" ? "✗ Lost" : "⏳ Pending"}
            </span>
          </div>
          <div className="match-title">{tip.match_title}</div>
        </div>
      </div>
      <div className="tip-prediction-row">
        <div className="prediction-pill">
          <span className="prediction-label">Prediction</span>
          <span className="prediction-value">{isLocked ? "🔒 Premium Only" : tip.prediction}</span>
        </div>
        <div className="odds-pill">
          <span className="prediction-label">Odds</span>
          <span className="odds-value">{isLocked ? "—" : Number(tip.odds_reference).toFixed(2)}</span>
        </div>
      </div>
      {!isLocked && (
        <div className="metrics-row">
          <div className="metric-item">
            <div className="metric-label">Confidence</div>
            <ConfidenceBar pct={tip.confidence_percentage} />
          </div>
          <div className="metric-item">
            <div className="metric-label">Value Rating</div>
            <ValueStars rating={tip.value_rating} />
          </div>
          <div className="metric-item">
            <div className="metric-label">Public Bias</div>
            <BiasIndicator bias={tip.public_bias || "medium"} />
          </div>
        </div>
      )}
      <div className="tip-footer">
        <span className="match-date-text">📅 {formatDate(tip.match_date)}</span>
        {!isLocked && (
          <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? "▲ Hide Analysis" : "▼ View Analysis"}
          </button>
        )}
      </div>
      {expanded && !isLocked && (
        <div className="reasoning-panel fade-in">
          <div className="reasoning-title">📊 Analyst Breakdown</div>
          <p className="reasoning-text">{tip.reasoning_text}</p>
          {tip.analyst_note && <div className="analyst-note">💡 <strong>Note:</strong> {tip.analyst_note}</div>}
        </div>
      )}
      {isLocked && (
        <div className="locked-overlay">
          <div className="locked-cta">
            <div className="locked-icon">🔐</div>
            <div className="locked-title">Premium Tip</div>
            <div className="locked-sub">Upgrade to unlock full analysis & predictions</div>
            <button className="btn-premium" onClick={onSubscribeClick}>Unlock Premium →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATS PANEL
// ─────────────────────────────────────────────────────────────
function StatsPanel({ stats }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Win Rate</div>
        <div className="stat-value green">{stats.win_rate}%</div>
        <div className="stat-sub">All time</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">ROI</div>
        <div className="stat-value gold">+{stats.roi_percentage}%</div>
        <div className="stat-sub">Return on investment</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Tips</div>
        <div className="stat-value blue">{stats.total_tips}</div>
        <div className="stat-sub">{stats.won_tips}W / {stats.lost_tips}L</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Avg Odds</div>
        <div className="stat-value">{stats.avg_odds}</div>
        <div className="stat-sub">Reference odds</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">⚽ Football</div>
        <div className="stat-value green">{stats.football_win_rate}%</div>
        <div className="stat-sub">Win rate</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">🏀 Basketball</div>
        <div className="stat-value blue">{stats.basketball_win_rate}%</div>
        <div className="stat-sub">Win rate</div>
      </div>
      <div className="stat-card" style={{gridColumn:"span 2"}}>
        <div className="stat-label">Last 10 Tips</div>
        <div className="streak" style={{marginTop:8}}>
          {stats.last_10.length > 0
            ? stats.last_10.map((r, i) => <div key={i} className={`streak-dot ${r}`} title={r} />)
            : <span style={{fontSize:12,color:"var(--muted)"}}>No results yet</span>
          }
        </div>
        <div className="stat-sub" style={{marginTop:8}}>{stats.last_10.filter(x=>x==="won").length}/10 wins</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────
function DashboardPage({ user, tips, stats, onSubscribeClick }) {
  const [sport, setSport] = useState("all");
  const [showPremium, setShowPremium] = useState(true);
  const isPremium = user?.subscription_status !== "free";
  const filtered = tips.filter(t => sport === "all" || t.sport === sport);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Today's Tips</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString("en-UG", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
        </div>
        {!isPremium && <button className="btn-premium" onClick={onSubscribeClick}>⭐ Upgrade to Premium</button>}
      </div>
      <StatsPanel stats={stats} />
      <div className="filter-bar">
        {["all","football","basketball"].map(s => (
          <button key={s} className={`filter-btn ${sport === s ? "active" : ""}`} onClick={() => setSport(s)}>
            {s === "all" ? "All Sports" : s === "football" ? "⚽ Football" : "🏀 Basketball"}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13,color:"var(--muted)"}}>Show locked tips</span>
          <label className="toggle">
            <input type="checkbox" checked={showPremium} onChange={e=>setShowPremium(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No tips yet</div>
          <div className="empty-sub">Check back soon for today's picks</div>
        </div>
      ) : (
        <div className="tips-grid">
          {filtered.filter(t => showPremium || !t.is_premium || isPremium).map(tip => (
            <TipCard key={tip.id} tip={tip} isPremiumUser={isPremium} onSubscribeClick={onSubscribeClick} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUBSCRIPTION PAGE
// ─────────────────────────────────────────────────────────────
// ⚠️ CHANGE THIS TO YOUR REAL MOBILE MONEY NUMBER
const PAYMENT_NUMBER = "0764 008 486";

function SubscriptionPage({ user }) {
  const [selected, setSelected] = useState("monthly");
  const [phone, setPhone] = useState("");
  const [txRef, setTxRef] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const plans = {
    weekly: { name: "Weekly", price: 15000, period: "/week", days: 7 },
    monthly: { name: "Monthly", price: 45000, period: "/month", days: 30 },
  };

  const handleSubmit = async () => {
    if (!phone.match(/^256[0-9]{9}$/)) { alert("Enter a valid Uganda number: 256XXXXXXXXX"); return; }
    if (!txRef.trim()) { alert("Enter the transaction reference from your mobile money"); return; }
    setSaving(true);
    const prices = { weekly: 15000, monthly: 45000 };
    const { error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan_type: selected,
      price: prices[selected],
      currency: 'UGX',
      payment_status: 'pending',
      payment_method: 'mobile_money',
      mobile_number: phone,
      transaction_ref: txRef,
    });
    setSaving(false);
    if (error) { alert("Error submitting: " + error.message); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="sub-page">
        <div className="success-state">
          <div className="success-icon">✅</div>
          <h2 className="page-title" style={{marginBottom:8}}>Payment Submitted!</h2>
          <p style={{color:"var(--muted)",marginBottom:24,fontSize:15,lineHeight:1.7}}>
            Your subscription request has been received.<br/>
            Admin will verify and activate within <strong style={{color:"var(--accent)"}}>1–6 hours</strong>.
          </p>
          <button className="btn-secondary" style={{marginTop:24}} onClick={() => setSubmitted(false)}>← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sub-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upgrade to Premium</h1>
          <p className="page-subtitle">Unlock all tips, full analysis & performance tracking</p>
        </div>
      </div>
      <div className="plans-grid">
        {Object.entries(plans).map(([key, plan]) => (
          <div key={key} className={`plan-card ${selected === key ? "selected" : ""} ${key === "monthly" ? "popular" : ""}`}
            onClick={() => setSelected(key)} style={{marginTop: key === "monthly" ? 16 : 0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span className="plan-name">{plan.name}</span>
              {selected === key && <span style={{color:"var(--accent)",fontSize:20}}>✓</span>}
            </div>
            <div className="plan-price"><span className="plan-currency">UGX</span>{plan.price.toLocaleString()}</div>
            <div className="plan-period">per {key} • {plan.days} days access</div>
            <ul className="plan-features">
              {[[true,"All premium tips daily"],[true,"Full reasoning breakdown"],[true,"Confidence % & value rating"],[true,"Performance analytics"],[key==="monthly","Priority support"],[key==="monthly","Early access to tips"]].map(([included, text], i) => (
                <li key={i} className={`plan-feature ${included ? "included" : ""}`}>
                  <span className="check">{included ? "✓" : "—"}</span>{text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="payment-instruction">
        <h4>📱 How to Pay — Mobile Money (MTN/Airtel)</h4>
        <p>
          1. Dial <code>*165*3#</code> (MTN) or <code>*185*9#</code> (Airtel)<br/>
          2. Send <code>UGX {plans[selected].price.toLocaleString()}</code> to number <code>{PAYMENT_NUMBER}</code><br/>
          3. Enter your phone number and transaction reference below<br/>
          4. Admin activates your account within <strong>1–6 hours</strong>
        </p>
      </div>
      <div className="payment-form">
        <h3 style={{fontFamily:"Syne, sans-serif",fontWeight:700,marginBottom:20,fontSize:16}}>Payment Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Selected Plan</label>
            <div style={{background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.3)",borderRadius:10,padding:"12px 16px",fontWeight:700,fontSize:15}}>
              {plans[selected].name} — <span style={{color:"var(--gold)"}}>UGX {plans[selected].price.toLocaleString()}</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number Used</label>
            <input className="form-input" placeholder="256XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Transaction Reference</label>
          <input className="form-input" placeholder="e.g. MTN123456789 (from your SMS)" value={txRef} onChange={e => setTxRef(e.target.value)} />
        </div>
        <button className="btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={handleSubmit} disabled={saving}>
          {saving ? "Submitting..." : "✅ Submit Payment Request"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CREATE TIP MODAL
// ─────────────────────────────────────────────────────────────
function CreateTipModal({ onClose, onSave, notify, userId }) {
  const [form, setForm] = useState({
    sport: "football", home_team: "", away_team: "",
    league: "", market_type: "1X2", prediction: "",
    odds_reference: "", value_rating: 3, confidence_percentage: 65,
    public_bias: "medium", reasoning_text: "", analyst_note: "",
    match_date: "", is_premium: true,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSave = async () => {
    if (!form.home_team) { notify("Home team is required", "error"); return; }
    if (!form.away_team) { notify("Away team is required", "error"); return; }
    if (!form.league) { notify("League is required", "error"); return; }
    if (!form.prediction) { notify("Prediction is required", "error"); return; }
    if (!form.odds_reference) { notify("Odds are required", "error"); return; }
    if (!form.match_date) { notify("Match date is required", "error"); return; }

    setSaving(true);
    const newTip = {
      sport: form.sport,
      home_team: form.home_team,
      away_team: form.away_team,
      match_title: `${form.home_team} vs ${form.away_team}`,
      league: form.league.trim(),
      market_type: form.market_type,
      prediction: form.prediction,
      odds_reference: parseFloat(form.odds_reference),
      value_rating: parseInt(form.value_rating),
      confidence_percentage: parseInt(form.confidence_percentage),
      public_bias: form.public_bias,
      reasoning_text: form.reasoning_text || null,
      analyst_note: form.analyst_note || null,
      match_date: new Date(form.match_date).toISOString(),
      is_premium: form.is_premium,
      result_status: "pending",
      created_by: userId,
    };

    const res = await fetch("https://gyamnnubkxlddbctvbxk.supabase.co/rest/v1/tips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5YW1ubnVia3hsZGRiY3R2YnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njk1NjYsImV4cCI6MjA4ODI0NTU2Nn0.SCiVnDTAkgkuF6cYe8tG9FzeLuYdWfGj0D38gyKSnac",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5YW1ubnVia3hsZGRiY3R2YnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njk1NjYsImV4cCI6MjA4ODI0NTU2Nn0.SCiVnDTAkgkuF6cYe8tG9FzeLuYdWfGj0D38gyKSnac",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(newTip)
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      notify("Error: " + JSON.stringify(json), "error");
      return;
    }
    onSave(json[0]);
    notify("Tip created successfully ✓");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <span className="modal-title">Create New Tip</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Sport *</label>
            <select className="form-select" value={form.sport} onChange={e=>set("sport",e.target.value)}>
              <option value="football">⚽ Football</option>
              <option value="basketball">🏀 Basketball</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Market Type *</label>
            <select className="form-select" value={form.market_type} onChange={e=>set("market_type",e.target.value)}>
              {["1X2","Over/Under","BTTS","Spread","DNB","Asian Handicap","HT/FT","Correct Score"].map(m=>(
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Home Team *</label>
            <input className="form-input" placeholder="e.g. Arsenal" value={form.home_team} onChange={e=>set("home_team",e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Away Team *</label>
            <input className="form-input" placeholder="e.g. Chelsea" value={form.away_team} onChange={e=>set("away_team",e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">League *</label>
            <input className="form-input" placeholder="e.g. Premier League" value={form.league} onChange={e=>set("league",e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Match Date *</label>
            <input className="form-input" type="datetime-local" value={form.match_date} onChange={e=>set("match_date",e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prediction *</label>
            <input className="form-input" placeholder="e.g. Arsenal Win" value={form.prediction} onChange={e=>set("prediction",e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Reference Odds *</label>
            <input className="form-input" type="number" step="0.01" min="1.01" placeholder="e.g. 1.85" value={form.odds_reference} onChange={e=>set("odds_reference",e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Confidence % — {form.confidence_percentage}%</label>
          <div className="range-row">
            <input type="range" min="10" max="99" value={form.confidence_percentage} onChange={e=>set("confidence_percentage",+e.target.value)} />
            <span className="range-value">{form.confidence_percentage}%</span>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Value Rating — {form.value_rating}/5</label>
            <div className="range-row">
              <input type="range" min="1" max="5" value={form.value_rating} onChange={e=>set("value_rating",+e.target.value)} />
              <span className="range-value">{form.value_rating}</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Public Bias</label>
            <select className="form-select" value={form.public_bias} onChange={e=>set("public_bias",e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Reasoning / Analysis</label>
          <textarea className="form-textarea" placeholder="Provide data-backed reasoning..." value={form.reasoning_text} onChange={e=>set("reasoning_text",e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Analyst Note (optional)</label>
          <input className="form-input" placeholder="e.g. Monitor lineup, check injury news" value={form.analyst_note} onChange={e=>set("analyst_note",e.target.value)} />
        </div>
        <div className="toggle-row">
          <span className="toggle-label">Premium Tip (paid users only)</span>
          <label className="toggle">
            <input type="checkbox" checked={form.is_premium} onChange={e=>set("is_premium",e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button className="btn-secondary" onClick={onClose} style={{flex:1,textAlign:"center"}}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} style={{flex:2,justifyContent:"center"}} disabled={saving}>
            {saving ? "Saving..." : "💾 Save Tip"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN PAGE
// ─────────────────────────────────────────────────────────────
function AdminPage({ tips, setTips, notify, userId, allUsers }) {
  const [tab, setTab] = useState("tips");
  const [showCreate, setShowCreate] = useState(false);
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    supabase.from('subscriptions')
      .select('*, users:user_id(email, full_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setSubs(data); });
  }, []);

  const updateResult = async (tipId, status) => {
    const { error } = await supabase.from('tips').update({ result_status: status }).eq('id', tipId);
    if (error) { notify("Error: " + error.message, "error"); return; }
    setTips(prev => prev.map(t => t.id === tipId ? {...t, result_status: status} : t));
    notify(`Marked as ${status} ✓`);
  };

  const deleteTip = async (tipId) => {
    if (!window.confirm("Delete this tip permanently?")) return;
    const { error } = await supabase.from('tips').delete().eq('id', tipId);
    if (error) { notify("Error: " + error.message, "error"); return; }
    setTips(prev => prev.filter(t => t.id !== tipId));
    notify("Tip deleted");
  };

  const togglePremium = async (tipId, current) => {
    const { error } = await supabase.from('tips').update({ is_premium: !current }).eq('id', tipId);
    if (error) { notify("Error: " + error.message, "error"); return; }
    setTips(prev => prev.map(t => t.id === tipId ? {...t, is_premium: !current} : t));
    notify("Premium status updated");
  };

  const activateSub = async (sub) => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + (sub.plan_type === 'weekly' ? 7 : 30));
    const { error } = await supabase.from('subscriptions').update({
      payment_status: 'confirmed',
      start_date: now.toISOString(),
      end_date: end.toISOString(),
      activated_by: userId,
      activated_at: now.toISOString(),
    }).eq('id', sub.id);
    if (error) { notify("Error: " + error.message, "error"); return; }
    setSubs(prev => prev.map(s => s.id === sub.id ? {...s, payment_status:"confirmed"} : s));
    notify("Subscription activated ✓");
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage tips, users & subscriptions</p>
        </div>
        {tab === "tips" && <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Create Tip</button>}
      </div>
      <div className="filter-bar" style={{marginBottom:24}}>
        {[["tips","📊 Tips"],["subscriptions","💳 Subscriptions"],["users","👥 Users"]].map(([key,label]) => (
          <button key={key} className={`filter-btn ${tab===key?"active":""}`} onClick={()=>setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === "tips" && (
        <div className="admin-section">
          <div className="admin-table tips-table">
            <div className="table-header">
              <span>Match</span>
              <span className="hide-mobile">League</span>
              <span>Market</span>
              <span className="hide-mobile">Confidence</span>
              <span>Premium</span>
              <span>Result</span>
            </div>
            {tips.length === 0 && (
              <div style={{padding:24,textAlign:"center",color:"var(--muted)",fontSize:14}}>No tips yet — create your first one!</div>
            )}
            {tips.map(tip => (
              <div key={tip.id} className="table-row">
                <div className="table-cell">
                  <div style={{fontWeight:600,fontSize:13}}>{tip.match_title}</div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{formatDate(tip.match_date)}</div>
                </div>
                <div className="table-cell hide-mobile"><span style={{fontSize:12,color:"var(--muted)"}}>{tip.league}</span></div>
                <div className="table-cell"><span className="badge market" style={{fontSize:11}}>{tip.market_type}</span></div>
                <div className="table-cell hide-mobile">
                  <span style={{color:getConfidenceColor(tip.confidence_percentage),fontWeight:700,fontSize:13}}>{tip.confidence_percentage}%</span>
                </div>
                <div className="table-cell">
                  <label className="toggle" style={{transform:"scale(0.85)"}}>
                    <input type="checkbox" checked={tip.is_premium} onChange={()=>togglePremium(tip.id, tip.is_premium)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="table-cell">
                  <div className="result-toggle">
                    <button className={`result-btn won ${tip.result_status==="won"?"active":""}`} onClick={()=>updateResult(tip.id,"won")}>W</button>
                    <button className={`result-btn lost ${tip.result_status==="lost"?"active":""}`} onClick={()=>updateResult(tip.id,"lost")}>L</button>
                    <button className="result-btn" style={{borderColor:"#6b7590",color:"#6b7590"}} onClick={()=>deleteTip(tip.id)}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="admin-section">
          <div className="admin-table">
            <div className="table-header" style={{gridTemplateColumns:"1fr 100px 130px 130px 100px"}}>
              <span>User</span><span>Plan</span><span>Phone</span><span>Tx Ref</span><span>Action</span>
            </div>
            {subs.length === 0 && (
              <div style={{padding:24,textAlign:"center",color:"var(--muted)",fontSize:14}}>No subscription requests yet</div>
            )}
            {subs.map(sub => (
              <div key={sub.id} className="table-row" style={{gridTemplateColumns:"1fr 100px 130px 130px 100px"}}>
                <div className="table-cell">
                  <div style={{fontWeight:600,fontSize:13}}>{sub.users?.email || "—"}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>UGX {sub.price?.toLocaleString()}</div>
                </div>
                <div className="table-cell"><span className="badge market">{sub.plan_type}</span></div>
                <div className="table-cell" style={{fontSize:12}}>{sub.mobile_number}</div>
                <div className="table-cell"><span style={{fontSize:12,color:"var(--accent)",fontWeight:600}}>{sub.transaction_ref}</span></div>
                <div className="table-cell">
                  {sub.payment_status === "pending"
                    ? <button className="btn-primary" style={{padding:"5px 12px",fontSize:12}} onClick={()=>activateSub(sub)}>Activate</button>
                    : <span className="status-dot active">Active</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="admin-section">
          <div className="admin-table users-table">
            <div className="table-header">
              <span>User</span><span>Plan</span><span>Expiry</span><span>Role</span><span>Joined</span>
            </div>
            {allUsers.map(u => (
              <div key={u.id} className="table-row">
                <div className="table-cell">
                  <div style={{fontWeight:600,fontSize:13}}>{u.full_name || "—"}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{u.email}</div>
                </div>
                <div className="table-cell">
                  <span className={`status-dot ${u.subscription_status === "free" ? "free" : "active"}`}>{u.subscription_status}</span>
                </div>
                <div className="table-cell" style={{fontSize:12,color:"var(--muted)"}}>
                  {u.subscription_expiry ? new Date(u.subscription_expiry).toLocaleDateString() : "—"}
                </div>
                <div className="table-cell">
                  <span className="badge" style={{background:"rgba(107,117,144,0.15)",color:u.role==="admin"?"var(--warning)":"var(--muted)"}}>{u.role}</span>
                </div>
                <div className="table-cell" style={{fontSize:12,color:"var(--muted)"}}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreate && (
        <CreateTipModal
          onClose={() => setShowCreate(false)}
          onSave={tip => setTips(prev => [tip, ...prev])}
          notify={notify}
          userId={userId}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
const emptyStats = { total_tips:0, won_tips:0, lost_tips:0, win_rate:0, roi_percentage:0, avg_odds:0, football_win_rate:0, basketball_win_rate:0, last_10:[] };

export default function BetSenseApp() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [tips, setTips] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [notification, setNotification] = useState(null);

  const notify = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
  }, []);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (profile) setUser(profile);
      }
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (profile) setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when logged in
  useEffect(() => {
    if (!user) return;

    // Load tips
    supabase.from('tips').select('*').order('match_date', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Tips error:", error);
        else setTips(data || []);
      });

    // Load stats
    async function loadStats() {
      try {
        const [overall, football, basketball, lastTen] = await Promise.all([
          supabase.rpc('get_performance_stats'),
          supabase.rpc('get_performance_stats', { p_sport: 'football' }),
          supabase.rpc('get_performance_stats', { p_sport: 'basketball' }),
          supabase.rpc('get_last_n_performance', { n: 10 }),
        ]);
        const o = overall.data?.[0];
        const f = football.data?.[0];
        const b = basketball.data?.[0];
        const l = lastTen.data || [];
        if (o) {
          setStats({
            total_tips: o.total_tips || 0,
            won_tips: o.won_tips || 0,
            lost_tips: o.lost_tips || 0,
            win_rate: o.win_rate || 0,
            roi_percentage: o.roi || 0,
            avg_odds: o.avg_odds || 0,
            football_win_rate: f?.win_rate || 0,
            basketball_win_rate: b?.win_rate || 0,
            last_10: l.map(t => t.result),
          });
        }
      } catch (err) {
        console.error("Stats error:", err);
      }
    }
    loadStats();

    // Load users (admin only)
    if (user.role === 'admin') {
      supabase.from('users').select('*').order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setAllUsers(data); });
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTips([]);
    setStats(emptyStats);
    setPage("dashboard");
  };

  // Loading
  if (!authChecked) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <div>📈 BetSense</div>
          <div className="loading-dot" />
        </div>
      </>
    );
  }

  // Auth
  if (!user) return <AuthPage />;

  const isPremium = user?.subscription_status !== "free";
  const isAdmin = user?.role === "admin";

  const navItems = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"subscription", icon:"⭐", label:"Subscription" },
    ...(isAdmin ? [{ id:"admin", icon:"🛡️", label:"Admin Panel" }] : []),
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-icon">📈</div>
            <span className="logo-text">BetSense</span>
          </div>
          <nav className="nav-section">
            <div className="nav-label">Navigation</div>
            {navItems.map(item => (
              <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
                <span className="icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-user">
              <div className="avatar">{user?.full_name?.charAt(0) || "U"}</div>
              <div className="user-info">
                <div className="user-name">{user?.full_name || user?.email}</div>
                <div className={`user-plan ${isPremium ? "" : "free"}`}>
                  {isPremium ? `✓ ${user.subscription_status}` : "Free Plan"}
                </div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>← Sign Out</button>
          </div>
        </aside>

        <main className="main">
          {page === "dashboard" && (
            <DashboardPage user={user} tips={tips} stats={stats} onSubscribeClick={() => setPage("subscription")} />
          )}
          {page === "subscription" && <SubscriptionPage user={user} />}
          {page === "admin" && isAdmin && (
            <AdminPage tips={tips} setTips={setTips} notify={notify} userId={user.id} allUsers={allUsers} />
          )}
        </main>
      </div>

      {notification && (
        <Notification msg={notification.msg} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </>
  );
}
