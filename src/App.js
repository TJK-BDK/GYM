import { useState, useEffect } from "react";

const PLAN = {
  days: [
    {
      id: 1,
      label: "DAY 1",
      name: "PUSH",
      tag: "Chest · Shoulders · Triceps",
      tip: "Go hard on lateral raises — this is how you build width.",
      color: "#FF5733",
      accent: "#FF8C69",
      exercises: [
        { id: "p1", name: "Incline Dumbbell Press", sets: 4, reps: "8–12", priority: false },
        { id: "p2", name: "Flat Machine / Barbell Press", sets: 3, reps: "8–12", priority: false },
        { id: "p3", name: "Shoulder Press", sets: 3, reps: "8–12", priority: false },
        { id: "p4", name: "Lateral Raises", sets: 5, reps: "12–20", priority: true },
        { id: "p5", name: "Cable Chest Fly", sets: 3, reps: "12–15", priority: false },
        { id: "p6", name: "Tricep Pushdowns", sets: 3, reps: "10–15", priority: false },
      ],
    },
    {
      id: 2,
      label: "DAY 2",
      name: "PULL",
      tag: "Back · Biceps",
      tip: "Focus on pulling with elbows, not hands.",
      color: "#3B82F6",
      accent: "#60A5FA",
      exercises: [
        { id: "pu1", name: "Lat Pulldown (wide grip)", sets: 4, reps: "8–12", priority: false },
        { id: "pu2", name: "Seated Cable Row", sets: 3, reps: "10–12", priority: false },
        { id: "pu3", name: "One-Arm Dumbbell Row", sets: 3, reps: "10–12", priority: false },
        { id: "pu4", name: "Face Pulls", sets: 3, reps: "12–15", priority: false },
        { id: "pu5", name: "Dumbbell Curls", sets: 3, reps: "10–12", priority: false },
        { id: "pu6", name: "Hammer Curls", sets: 3, reps: "10–12", priority: false },
      ],
    },
    {
      id: 3,
      label: "DAY 3",
      name: "LEGS",
      tag: "Quads · Hamstrings · Calves",
      tip: "Maintain and build balance. Don't skip.",
      color: "#10B981",
      accent: "#34D399",
      exercises: [
        { id: "l1", name: "Squats / Leg Press", sets: 4, reps: "8–12", priority: false },
        { id: "l2", name: "Romanian Deadlift", sets: 3, reps: "8–10", priority: false },
        { id: "l3", name: "Leg Curl", sets: 3, reps: "10–12", priority: false },
        { id: "l4", name: "Leg Extension", sets: 3, reps: "12–15", priority: false },
        { id: "l5", name: "Calf Raises", sets: 4, reps: "12–20", priority: false },
      ],
    },
    {
      id: 4,
      label: "DAY 4",
      name: "UPPER",
      tag: "Weak Points · Growth Day",
      tip: "This is your growth day. Show up for it.",
      color: "#8B5CF6",
      accent: "#A78BFA",
      exercises: [
        { id: "u1", name: "Incline Press", sets: 3, reps: "8–12", priority: false },
        { id: "u2", name: "Lat Pulldown", sets: 3, reps: "8–12", priority: false },
        { id: "u3", name: "Lateral Raises", sets: 5, reps: "12–20", priority: true },
        { id: "u4", name: "Shoulder Press", sets: 3, reps: "8–12", priority: false },
        { id: "u5", name: "Cable Rows", sets: 3, reps: "10–12", priority: false },
        { id: "u6", name: "Dumbbell Curls", sets: 2, reps: "10–12", priority: false },
        { id: "u7", name: "Tricep Pushdowns", sets: 2, reps: "10–15", priority: false },
      ],
    },
  ],
  rules: [
    "Rest 60–90 sec between sets",
    "Last 2 reps should be a real challenge",
    "Progressive overload every week",
    "Form over ego — always",
  ],
};

const STORAGE_KEY = "gym_tracker_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export default function App() {
  const [activeDay, setActiveDay] = useState(0);
  const [completedSets, setCompletedSets] = useState(loadState);
  const [restTimer, setRestTimer] = useState(null);
  const [timerSec, setTimerSec] = useState(0);
  const [view, setView] = useState("workout"); // workout | overview

  useEffect(() => {
    saveState(completedSets);
  }, [completedSets]);

  useEffect(() => {
    if (restTimer === null) return;
    if (timerSec <= 0) {
      setRestTimer(null);
      return;
    }
    const t = setTimeout(() => setTimerSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timerSec, restTimer]);

  const day = PLAN.days[activeDay];
  const today = new Date().toDateString();

  function toggleSet(exerciseId, setIdx) {
    const key = `${today}_${exerciseId}_${setIdx}`;
    setCompletedSets((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
        setRestTimer(key);
        setTimerSec(75);
      }
      return next;
    });
  }

  function isSetDone(exerciseId, setIdx) {
    return !!completedSets[`${today}_${exerciseId}_${setIdx}`];
  }

  function isDayComplete(dayObj) {
    return dayObj.exercises.every((ex) =>
      Array.from({ length: ex.sets }, (_, i) => i).every((i) =>
        completedSets[`${today}_${ex.id}_${i}`]
      )
    );
  }

  function setsCompletedForExercise(exerciseId, totalSets) {
    return Array.from({ length: totalSets }, (_, i) => i).filter(
      (i) => completedSets[`${today}_${exerciseId}_${i}`]
    ).length;
  }

  function totalSetsToday() {
    return day.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  }

  function completedSetsToday() {
    return day.exercises.reduce(
      (acc, ex) => acc + setsCompletedForExercise(ex.id, ex.sets),
      0
    );
  }

  const progress = totalSetsToday() > 0 ? completedSetsToday() / totalSetsToday() : 0;

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>⬡</span>
          <span style={styles.logoText}>FORGE</span>
        </div>
        <div style={styles.headerTabs}>
          <button
            style={{ ...styles.tabBtn, ...(view === "workout" ? styles.tabActive : {}) }}
            onClick={() => setView("workout")}
          >
            Today
          </button>
          <button
            style={{ ...styles.tabBtn, ...(view === "overview" ? styles.tabActive : {}) }}
            onClick={() => setView("overview")}
          >
            Plan
          </button>
        </div>
      </div>

      {/* Rest Timer Banner */}
      {restTimer && timerSec > 0 && (
        <div style={styles.timerBanner}>
          <span style={styles.timerIcon}>⏱</span>
          <span style={styles.timerText}>Rest</span>
          <span style={styles.timerCount}>{timerSec}s</span>
          <div
            style={{
              ...styles.timerBar,
              width: `${(timerSec / 75) * 100}%`,
            }}
          />
          <button style={styles.timerSkip} onClick={() => { setRestTimer(null); setTimerSec(0); }}>
            Skip
          </button>
        </div>
      )}

      {view === "workout" && (
        <div style={styles.content}>
          {/* Day Selector */}
          <div style={styles.daySelectorWrap}>
            <div style={styles.daySelector}>
              {PLAN.days.map((d, i) => {
                const done = isDayComplete(d);
                return (
                  <button
                    key={d.id}
                    onClick={() => setActiveDay(i)}
                    style={{
                      ...styles.dayPill,
                      background: i === activeDay ? d.color : "transparent",
                      border: `1.5px solid ${i === activeDay ? d.color : "#333"}`,
                      color: i === activeDay ? "#fff" : "#888",
                    }}
                  >
                    {done && <span style={styles.doneBadge}>✓</span>}
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Hero */}
          <div style={{ ...styles.dayHero, borderLeft: `4px solid ${day.color}` }}>
            <div style={styles.heroTop}>
              <div>
                <div style={{ ...styles.heroName, color: day.color }}>{day.name}</div>
                <div style={styles.heroTag}>{day.tag}</div>
              </div>
              <div style={styles.progressWrap}>
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#222" strokeWidth="4" />
                  <circle
                    cx="26" cy="26" r="22"
                    fill="none"
                    stroke={day.color}
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 26 26)"
                  />
                  <text x="26" y="31" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
                    {Math.round(progress * 100)}%
                  </text>
                </svg>
              </div>
            </div>
            <div style={styles.tipBox}>
              <span style={{ color: day.accent }}>💡</span> {day.tip}
            </div>
          </div>

          {/* Exercises */}
          <div style={styles.exerciseList}>
            {day.exercises.map((ex) => {
              const done = setsCompletedForExercise(ex.id, ex.sets);
              const allDone = done === ex.sets;
              return (
                <div
                  key={ex.id}
                  style={{
                    ...styles.exerciseCard,
                    opacity: allDone ? 0.6 : 1,
                    borderColor: allDone ? day.color : "#1e1e1e",
                  }}
                >
                  <div style={styles.exHeader}>
                    <div style={styles.exLeft}>
                      {ex.priority && (
                        <span style={{ ...styles.priorityBadge, background: day.color }}>
                          PRIORITY
                        </span>
                      )}
                      <span style={styles.exName}>{ex.name}</span>
                    </div>
                    <div style={styles.exMeta}>
                      <span style={styles.exReps}>{ex.reps}</span>
                      <span style={styles.exSetsLabel}>
                        {done}/{ex.sets} sets
                      </span>
                    </div>
                  </div>
                  <div style={styles.setsRow}>
                    {Array.from({ length: ex.sets }, (_, i) => {
                      const done = isSetDone(ex.id, i);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleSet(ex.id, i)}
                          style={{
                            ...styles.setBtn,
                            background: done ? day.color : "transparent",
                            border: `1.5px solid ${done ? day.color : "#444"}`,
                            color: done ? "#fff" : "#666",
                          }}
                        >
                          {done ? "✓" : i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rules */}
          <div style={styles.rulesBox}>
            <div style={styles.rulesTitle}>Training Rules</div>
            {PLAN.rules.map((r, i) => (
              <div key={i} style={styles.ruleRow}>
                <span style={styles.ruleDot}>—</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "overview" && (
        <div style={styles.content}>
          <div style={styles.overviewTitle}>4-Day Split</div>
          <div style={styles.overviewSub}>Push · Pull · Legs · Upper</div>
          {PLAN.days.map((d, i) => (
            <div
              key={d.id}
              style={{ ...styles.overviewCard, borderLeft: `3px solid ${d.color}` }}
              onClick={() => { setActiveDay(i); setView("workout"); }}
            >
              <div style={styles.overviewCardTop}>
                <div>
                  <div style={{ ...styles.overviewDayLabel, color: d.color }}>{d.label} · {d.name}</div>
                  <div style={styles.overviewTag}>{d.tag}</div>
                </div>
                <span style={styles.overviewArrow}>›</span>
              </div>
              <div style={styles.overviewExList}>
                {d.exercises.map((ex) => (
                  <span key={ex.id} style={{
                    ...styles.overviewEx,
                    background: ex.priority ? `${d.color}22` : "#161616",
                    color: ex.priority ? d.accent : "#666",
                    border: ex.priority ? `1px solid ${d.color}44` : "1px solid #222",
                  }}>
                    {ex.name}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div style={styles.rulesBox}>
            <div style={styles.rulesTitle}>Training Rules</div>
            {PLAN.rules.map((r, i) => (
              <div key={i} style={styles.ruleRow}>
                <span style={styles.ruleDot}>—</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#e8e8e8",
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    maxWidth: 480,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px 12px",
    borderBottom: "1px solid #141414",
    position: "sticky",
    top: 0,
    background: "#0a0a0a",
    zIndex: 10,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    fontSize: 18,
    color: "#FF5733",
  },
  logoText: {
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: "0.15em",
    color: "#fff",
  },
  headerTabs: {
    display: "flex",
    gap: 4,
    background: "#111",
    borderRadius: 8,
    padding: 3,
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    color: "#666",
    fontSize: 13,
    fontWeight: 500,
    padding: "5px 14px",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#1e1e1e",
    color: "#fff",
  },
  timerBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 20px",
    background: "#111",
    borderBottom: "1px solid #1e1e1e",
    position: "relative",
    overflow: "hidden",
  },
  timerIcon: { fontSize: 14 },
  timerText: { fontSize: 13, color: "#888", flex: 1 },
  timerCount: { fontSize: 20, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" },
  timerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 2,
    background: "#FF5733",
    transition: "width 1s linear",
  },
  timerSkip: {
    background: "transparent",
    border: "1px solid #333",
    color: "#666",
    fontSize: 12,
    padding: "3px 10px",
    borderRadius: 4,
    cursor: "pointer",
  },
  content: {
    padding: "16px 16px 40px",
  },
  daySelectorWrap: {
    marginBottom: 16,
    overflowX: "auto",
  },
  daySelector: {
    display: "flex",
    gap: 8,
    paddingBottom: 4,
  },
  dayPill: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    padding: "7px 14px",
    borderRadius: 6,
    cursor: "pointer",
    position: "relative",
    transition: "all 0.15s",
  },
  doneBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    background: "#10B981",
    color: "#fff",
    borderRadius: "50%",
    width: 14,
    height: 14,
    fontSize: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },
  dayHero: {
    background: "#111",
    borderRadius: 12,
    padding: "16px 18px",
    marginBottom: 16,
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  heroName: {
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "0.04em",
    lineHeight: 1,
  },
  heroTag: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    letterSpacing: "0.05em",
  },
  progressWrap: {},
  tipBox: {
    background: "#161616",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12,
    color: "#aaa",
    lineHeight: 1.5,
  },
  exerciseList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
  },
  exerciseCard: {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: 10,
    padding: "14px 16px",
    transition: "border-color 0.2s",
  },
  exHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  exLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  priorityBadge: {
    display: "inline-block",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.1em",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: 3,
    width: "fit-content",
  },
  exName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#ddd",
    lineHeight: 1.3,
  },
  exMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
    marginLeft: 12,
  },
  exReps: {
    fontSize: 12,
    color: "#888",
    fontVariantNumeric: "tabular-nums",
  },
  exSetsLabel: {
    fontSize: 11,
    color: "#555",
  },
  setsRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  setBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.12s",
  },
  rulesBox: {
    background: "#0f0f0f",
    border: "1px solid #1a1a1a",
    borderRadius: 10,
    padding: "14px 16px",
  },
  rulesTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#555",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  ruleRow: {
    display: "flex",
    gap: 10,
    fontSize: 13,
    color: "#777",
    marginBottom: 6,
    lineHeight: 1.4,
  },
  ruleDot: {
    color: "#444",
    flexShrink: 0,
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: "0.04em",
    marginBottom: 2,
  },
  overviewSub: {
    fontSize: 12,
    color: "#555",
    letterSpacing: "0.08em",
    marginBottom: 20,
  },
  overviewCard: {
    background: "#111",
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 10,
    cursor: "pointer",
  },
  overviewCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  overviewDayLabel: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.06em",
  },
  overviewTag: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
  },
  overviewArrow: {
    fontSize: 20,
    color: "#444",
  },
  overviewExList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  overviewEx: {
    fontSize: 11,
    padding: "3px 8px",
    borderRadius: 4,
    fontWeight: 500,
  },
};
import React from 'react';