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
      user: null,
      isLoggedIn: false,
      guestCounts: {},
      topicRecords: {},
      sessionHistory: [],
      lastSession: null,
      activeSession: null,

      login: (userData) => set({ user: userData, isLoggedIn: true, guestCounts: {} }),
      logout: () => set({ user: null, isLoggedIn: false }),

      startSession: (subject) => set({
        activeSession: { subject, questionsAnswered: 0, recentIds: [], startedAt: Date.now() }
      }),

      recordAnswer: (subject, topic, isCorrect, isLate, questionId) => {
        const s = get();
        const key = `${subject}_${topic}`;
        const updated = updateRecord(s.topicRecords[key] || emptyTopicRecord(), isCorrect, isLate);
        const guestCounts = s.isLoggedIn ? s.guestCounts : {
          ...s.guestCounts, [subject]: (s.guestCounts[subject] || 0) + 1
        };
        const activeSession = s.activeSession ? {
          ...s.activeSession,
          questionsAnswered: s.activeSession.questionsAnswered + 1,
          recentIds: [questionId, ...s.activeSession.recentIds].slice(0, 15),
        } : null;
        set({ topicRecords: { ...s.topicRecords, [key]: updated }, guestCounts, activeSession });
      },

      endSession: (subject, questionsAnswered) => {
        const s = get();
        const entry = { subject, questionsAnswered, date: Date.now() };
        set({
          activeSession: null,
          lastSession: { questionsAnswered, date: Date.now(), subject },
          sessionHistory: [entry, ...s.sessionHistory].slice(0, 50),
        });
      },

      isGuestLimited: (subject) => {
        const s = get();
        if (s.isLoggedIn) return false;
        return guestLimitReachedForSubject(s.guestCounts, subject);
      },
    }),
    {
      name: 'leapiq-v1',
      partialize: (s) => ({
        user: s.user, isLoggedIn: s.isLoggedIn, guestCounts: s.guestCounts,
        topicRecords: s.topicRecords, sessionHistory: s.sessionHistory, lastSession: s.lastSession,
      }),
    }
  )
);
