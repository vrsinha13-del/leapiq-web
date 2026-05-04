import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { emptyTopicRecord, updateRecord, guestLimitReachedForSubject } from './engine';

export const SUBJECTS = [
  { id:'maths',     label:'Mathematics',       short:'Maths',     icon:'∑',  color:'#4F46E5', light:'#EEF2FF' },
  { id:'english',   label:'English',           short:'English',   icon:'Aa', color:'#0891B2', light:'#ECFEFF' },
  { id:'gk',        label:'General Knowledge', short:'GK',        icon:'🌍', color:'#059669', light:'#ECFDF5' },
  { id:'reasoning', label:'Reasoning',         short:'Reasoning', icon:'⚡', color:'#D97706', light:'#FFFBEB' },
];

export const useStore = create(
  persist(
    (set, get) => ({
      user:           null,
      isLoggedIn:     false,
      guestCounts:    {},
      topicRecords:   {},
      sessionHistory: [],
      lastSession:    null,
      activeSession:  null,

      // ─── AUTH ─────────────────────────────────────────────────
      login: (userData) => set({
        user:        userData,
        isLoggedIn:  true,
        guestCounts: {},
      }),

      logout: () => set({
        user:       null,
        isLoggedIn: false,
      }),

      // ─── SESSION ──────────────────────────────────────────────
      startSession: (subject) => set({
        activeSession: {
          subject,
          questionsAnswered: 0,
          recentIds:         [],
          startedAt:         Date.now(),
        }
      }),

      // ─── RECORD ANSWER ────────────────────────────────────────
      // Key is now subject_level_topic
      // e.g. 'maths_6_decimals' instead of 'maths_decimals'
      // question object must have question_level (or level or grade)
      recordAnswer: (subject, topic, questionLevel, isCorrect, isLate, questionId) => {
        const s = get();

        // Build key with level included
        const level = String(questionLevel || '6');
        const key   = `${subject}_${level}_${topic}`;

        const updated = updateRecord(
          s.topicRecords[key] || emptyTopicRecord(),
          isCorrect,
          isLate
        );

        // Only count guest usage if not logged in
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
          topicRecords: { ...s.topicRecords, [key]: updated },
          guestCounts,
          activeSession,
        });
      },

      // ─── END SESSION ──────────────────────────────────────────
      endSession: (subject, questionsAnswered) => {
        const s   = get();
        const entry = {
          subject,
          questionsAnswered,
          date: Date.now(),
        };
        set({
          activeSession:  null,
          lastSession:    { questionsAnswered, date: Date.now(), subject },
          sessionHistory: [entry, ...s.sessionHistory].slice(0, 50),
        });
      },

      // ─── GUEST LIMIT ──────────────────────────────────────────
      isGuestLimited: (subject) => {
        const s = get();
        if (s.isLoggedIn) return false;
        return guestLimitReachedForSubject(s.guestCounts, subject);
      },
    }),

    // ─── PERSIST CONFIG ───────────────────────────────────────
    {
      name: 'leapiq-v2', // bumped version — clears old localStorage keys
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
