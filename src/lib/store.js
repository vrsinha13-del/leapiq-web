// src/lib/store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  emptyTopicRecord,
  updateRecord,
  guestLimitReachedForSubject,
  calculateStreak,
} from './engine';
import { registerStudent, saveSession } from './supabase_sync';

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

      // ── Questions cache ─────────────────────────────────────
      // Loaded from Supabase on app start
      questionsCache: {},  // { maths: [...], reasoning: [...] }

      // ── Learning data ───────────────────────────────────────
      topicRecords:   {},
      sessionHistory: [],
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

      // ── Register — saves to Supabase + localStorage ──────────
      register: async (userData) => {
        const pin = String(Math.floor(100000 + Math.random() * 900000));
        const newUser = {
          id:               Date.now() + '',
          name:             userData.name,
          email:            userData.email.trim().toLowerCase(),
          mobile:           userData.mobile,
          grade:            userData.grade,
          password:         userData.password,
          parentPin:        pin,
          parentPinChanged: false,
          streak:           0,
          lastPracticeDate: null,
          supabaseId:       null,
        };

        // Save to Supabase (non-blocking — don't fail if offline)
        const result = await registerStudent(newUser);
        if (result.success && result.student?.id) {
          newUser.supabaseId = result.student.id;
        }

        // Always save locally
        set({
          user:       newUser,
          isLoggedIn: true,
          guestCounts: {},
        });

        return { user: newUser, pin };
      },

      // ── Set questions cache ──────────────────────────────────
      setQuestionsCache: (cache) => set({ questionsCache: cache }),

      // ── Start session ────────────────────────────────────────
      startSession: (subject) => set({
        activeSession: {
          subject,
          questionsAnswered: 0,
          correct:           0,
          wrong:             0,
          recentIds:         [],
          startedAt:         Date.now(),
        },
      }),

      // ── Record answer ────────────────────────────────────────
      recordAnswer: (
        subject, topic, questionLevel, difficulty,
        category, isCorrect, isLate, questionId
      ) => {
        const s     = get();
        const level = String(questionLevel || '6');
        const key   = `${subject}_${level}_${topic}`;
        const today = new Date().toDateString();

        const updated = updateRecord(
          s.topicRecords[key] || emptyTopicRecord(),
          isCorrect, isLate, difficulty, today, subject, category
        );

        const guestCounts = s.isLoggedIn
          ? s.guestCounts
          : { ...s.guestCounts, [subject]: (s.guestCounts[subject] || 0) + 1 };

        const activeSession = s.activeSession ? {
          ...s.activeSession,
          questionsAnswered: s.activeSession.questionsAnswered + 1,
          correct:  s.activeSession.correct  + (isCorrect ? 1 : 0),
          wrong:    s.activeSession.wrong    + (isCorrect ? 0 : 1),
          recentIds: [questionId, ...s.activeSession.recentIds].slice(0, 15),
        } : null;

        set({
          topicRecords:  { ...s.topicRecords, [key]: updated },
          guestCounts,
          activeSession,
        });
      },

      // ── End session — saves to Supabase ──────────────────────
      endSession: async (subject, questionsAnswered, level) => {
        const s     = get();
        const today = new Date().toDateString();

        const streak = calculateStreak(
          s.user?.streak          || 0,
          s.user?.lastPracticeDate || null
        );

        const durationSeconds = s.activeSession?.startedAt
          ? Math.round((Date.now() - s.activeSession.startedAt) / 1000)
          : 0;

        const correct = s.activeSession?.correct || 0;
        const wrong   = s.activeSession?.wrong   || 0;

        // Save to Supabase if logged in
        if (s.isLoggedIn && s.user?.supabaseId) {
          saveSession({
            studentId:        s.user.supabaseId,
            subject,
            questionsAnswered,
            correct,
            wrong,
            durationSeconds,
            level: level || '6',
          }).catch(err => console.error('Session save failed:', err));
        }

        const entry = {
          subject,
          questionsAnswered,
          correct,
          wrong,
          level:   level || '6',
          date:    Date.now(),
        };

        set({
          activeSession:  null,
          lastSession:    { questionsAnswered, date: Date.now(), subject },
          sessionHistory: [entry, ...s.sessionHistory].slice(0, 200),
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

    {
      name: 'leapiq-v3',
      partialize: (s) => ({
        user:           s.user,
        isLoggedIn:     s.isLoggedIn,
        guestCounts:    s.guestCounts,
        topicRecords:   s.topicRecords,
        sessionHistory: s.sessionHistory,
        lastSession:    s.lastSession,
        // Don't persist questionsCache — always fresh from Supabase
      }),
    }
  )
);
