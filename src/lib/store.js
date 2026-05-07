import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  emptyTopicRecord,
  updateRecord,
  guestLimitReachedForSubject,
  calculateStreak,
} from './engine';

export const SUBJECTS = [
  { id:'maths',     label:'Mathematics',       short:'Maths',     icon:'∑',  color:'#4F46E5', light:'#EEF2FF' },
  { id:'reasoning', label:'Reasoning',         short:'Reasoning', icon:'⚡', color:'#D97706', light:'#FFFBEB' },
  { id:'english',   label:'English',           short:'English',   icon:'Aa', color:'#0891B2', light:'#ECFEFF' },
  { id:'gk',        label:'General Knowledge', short:'GK',        icon:'🌍', color:'#059669', light:'#ECFDF5' },
];

export const useStore = create(
  persist(
    (set, get) => ({

      // ── User ────────────────────────────────────────────────
      user:           null,
      isLoggedIn:     false,

      // ── Guest tracking ──────────────────────────────────────
      guestCounts:    {},

      // ── Learning data ───────────────────────────────────────
      topicRecords:   {},   // key: subject_level_topic
      sessionHistory: [],   // last 200 sessions
      lastSession:    null,
      activeSession:  null,

      // ── Auth ────────────────────────────────────────────────
      login: (userData) => set({
        user:        userData,
        isLoggedIn:  true,
        guestCounts: {},
      }),

      logout: () => set({
        user:       null,
        isLoggedIn: false,
      }),

      // ── Start session ────────────────────────────────────────
      startSession: (subject) => set({
        activeSession: {
          subject,
          questionsAnswered: 0,
          recentIds:         [],
          startedAt:         Date.now(),
        },
      }),

      // ── Record answer ────────────────────────────────────────
      // Key format: subject_level_topic
      // e.g. maths_6_fractions
      recordAnswer: (
        subject,
        topic,
        questionLevel,   // '6' | '7' | '8'
        difficulty,      // 'easy' | 'medium' | 'hard'
        category,        // for English timer selection
        isCorrect,
        isLate,          // exceeded internal mastery time threshold
        questionId
      ) => {
        const s     = get();
        const level = String(questionLevel || '6');
        const key   = `${subject}_${level}_${topic}`;
        const today = new Date().toDateString();

        const updated = updateRecord(
          s.topicRecords[key] || emptyTopicRecord(),
          isCorrect,
          isLate,
          difficulty,
          today,
          subject,
          category
        );

        // Guest counting
        const guestCounts = s.isLoggedIn
          ? s.guestCounts
          : { ...s.guestCounts, [subject]: (s.guestCounts[subject] || 0) + 1 };

        // Update active session
        const activeSession = s.activeSession ? {
          ...s.activeSession,
          questionsAnswered: s.activeSession.questionsAnswered + 1,
          recentIds: [questionId, ...s.activeSession.recentIds].slice(0, 15),
        } : null;

        set({
          topicRecords:  { ...s.topicRecords, [key]: updated },
          guestCounts,
          activeSession,
        });
      },

      // ── End session ──────────────────────────────────────────
      endSession: (subject, questionsAnswered, level) => {
        const s     = get();
        const today = new Date().toDateString();

        // Calculate streak
        const streak = calculateStreak(
          s.user?.streak          || 0,
          s.user?.lastPracticeDate || null
        );

        const entry = {
          subject,
          questionsAnswered,
          level: level || '6',
          date:  Date.now(),
        };

        set({
          activeSession:  null,
          lastSession:    {
            questionsAnswered,
            date:    Date.now(),
            subject,
          },
          sessionHistory: [entry, ...s.sessionHistory].slice(0, 200),
          // Update streak on user object
          user: s.user ? {
            ...s.user,
            streak,
            lastPracticeDate: today,
          } : s.user,
        });
      },

      // ── Guest limit check ────────────────────────────────────
      isGuestLimited: (subject) => {
        const s = get();
        if (s.isLoggedIn) return false;
        return guestLimitReachedForSubject(s.guestCounts, subject);
      },

    }),

    // ── Persist config ──────────────────────────────────────────
    {
      name: 'leapiq-v3',  // bumped — clears old localStorage format
      partialize: (s) => ({
        user:           s.user,
        isLoggedIn:     s.isLoggedIn,
        guestCounts:    s.guestCounts,
        topicRecords:   s.topicRecords,
        sessionHistory: s.sessionHistory,
        lastSession:    s.lastSession,
      }),
    }
  )
);
