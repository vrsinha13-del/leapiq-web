// src/lib/store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  emptyTopicRecord,
  updateRecord,
  guestLimitReachedForSubject,
  guestLimitStatus,
  calculateStreak,
} from './engine';
import { registerStudent, saveSession, saveAnswers, linkStudentToSchool } from './supabase_sync';

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
      softPromptSeen: {},  // subjects where soft prompt already shown

      // ── Questions cache ─────────────────────────────────────
      questionsCache: {},

      // ── Learning data ───────────────────────────────────────
      topicRecords:   {},
      sessionHistory: [],
      lastSession:    null,
      activeSession:  null,

      // ── Per-topic recentIds — blocks last 4 questions per topic
      // Object: { 'maths_6_LCM': ['id1','id2','id3','id4'] }
      recentIds:    {},

      // ── Recent topics — last 3 topics served
      // Array: ['maths_6_LCM', 'maths_6_Fractions', 'maths_6_Decimals']
      recentTopics: [],

      // ── Auth ────────────────────────────────────────────────
      login: (userData) => set({
        user:           userData,
        isLoggedIn:     true,
        guestCounts:    {},
        softPromptSeen: {},
      }),

      logout: () => set({
        user:       null,
        isLoggedIn: false,
      }),

      // ── Trial helpers ─────────────────────────────────────────
      isTrialExpired: () => {
        const s = get();
        if (!s.isLoggedIn || !s.user) return false;
        if (s.user.subscriptionStatus === 'active') return false;
        if (!s.user.trialEndsAt) return false;
        return new Date() > new Date(s.user.trialEndsAt);
      },

      trialDaysLeft: () => {
        const s = get();
        if (!s.isLoggedIn || !s.user?.trialEndsAt) return null;
        const diff = new Date(s.user.trialEndsAt) - new Date();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      },

      // ── Guest limit status ────────────────────────────────────
      guestStatus: (subject) => {
        const s = get();
        if (s.isLoggedIn) return 'ok';
        const count = s.guestCounts[subject] || 0;
        if (count >= 20) return 'hard';
        if (count >= 10 && !s.softPromptSeen[subject]) return 'soft';
        return 'ok';
      },

      // ── Mark soft prompt seen for subject ─────────────────────
      markSoftPromptSeen: (subject) => {
        const s = get();
        set({ softPromptSeen: { ...s.softPromptSeen, [subject]: true } });
      },

      // ── Register ─────────────────────────────────────────────
      register: async (userData) => {
        const pin         = String(Math.floor(100000 + Math.random() * 900000));
        const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const newUser = {
          id:                 Date.now() + '',
          name:               userData.name,
          email:              userData.email.trim().toLowerCase(),
          grade:              userData.grade,
          city:               userData.city || '',
          password:           userData.password,
          parentPin:          pin,
          parentPinChanged:   false,
          streak:             0,
          lastPracticeDate:   null,
          supabaseId:         null,
          schoolId:           userData.schoolId || null,
          shareData:          userData.shareData || false,
          trialEndsAt,
          subscriptionStatus: 'trial',
        };

        const result = await registerStudent(newUser);
        if (result.success && result.student?.id) {
          newUser.supabaseId = result.student.id;
          if (userData.schoolId && userData.shareData) {
            await linkStudentToSchool(result.student.id, userData.schoolId, 'self');
          }
        }

        set({
          user:        newUser,
          isLoggedIn:  true,
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
          easyAttempted:     0,
          mediumAttempted:   0,
          hardAttempted:     0,
          startedAt:         Date.now(),
          answers:           [], // buffer for student_answers table
        },
      }),

      // ── Record answer ────────────────────────────────────────
      recordAnswer: (
        subject, topic, questionLevel, difficulty,
        category, isCorrect, isLate, questionId,
        correctAnswer, answerGiven, timeTakenSec
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

        const diff = (difficulty || 'easy').toLowerCase();

        // Only buffer answers for Supabase questions (UUID format)
        const isSupabaseQuestion = questionId && questionId.includes('-');
        const newAnswer = isSupabaseQuestion ? {
          question_id:    questionId,
          subject,
          topic,
          difficulty:     diff,
          question_level: level,
          answer_given:   answerGiven   || null,
          correct_answer: correctAnswer || null,
          is_correct:     isCorrect,
          time_taken_sec: timeTakenSec  || 0,
          answered_at:    new Date().toISOString(),
        } : null;

        // FIX 1: Per-topic recentIds — block last 4 questions per topic
        const topicRecentIds = (s.recentIds && s.recentIds[key]) || [];
        const recentIds = {
          ...(s.recentIds || {}),
          [key]: [questionId, ...topicRecentIds].slice(0, 4),
        };

        // FIX 2: Topic cooldown — track last 3 topics served
        const recentTopics = [key, ...(s.recentTopics || [])].slice(0, 3);

        const activeSession = s.activeSession ? {
          ...s.activeSession,
          questionsAnswered: s.activeSession.questionsAnswered + 1,
          correct:           s.activeSession.correct + (isCorrect ? 1 : 0),
          wrong:             s.activeSession.wrong   + (isCorrect ? 0 : 1),
          easyAttempted:     (s.activeSession.easyAttempted   || 0) + (diff === 'easy'   ? 1 : 0),
          mediumAttempted:   (s.activeSession.mediumAttempted || 0) + (diff === 'medium' ? 1 : 0),
          hardAttempted:     (s.activeSession.hardAttempted   || 0) + (diff === 'hard'   ? 1 : 0),
          answers:           newAnswer
            ? [...(s.activeSession.answers || []), newAnswer]
            : (s.activeSession.answers || []),
        } : null;

        set({
          topicRecords:  { ...s.topicRecords, [key]: updated },
          guestCounts,
          activeSession,
          recentIds,
          recentTopics,
        });
      },

      // ── End session ──────────────────────────────────────────
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

        const correct         = s.activeSession?.correct         || 0;
        const wrong           = s.activeSession?.wrong           || 0;
        const easyAttempted   = s.activeSession?.easyAttempted   || 0;
        const mediumAttempted = s.activeSession?.mediumAttempted || 0;
        const hardAttempted   = s.activeSession?.hardAttempted   || 0;
        const answers         = s.activeSession?.answers         || [];

        // Save to Supabase if logged in
        if (s.isLoggedIn && s.user?.supabaseId) {
          // First save session to get session_id
          const sessionResult = await saveSession({
            studentId:        s.user.supabaseId,
            subject,
            questionsAnswered,
            correct,
            wrong,
            easyAttempted,
            mediumAttempted,
            hardAttempted,
            durationSeconds,
            level: level || '6',
          }).catch(err => { console.error('Session save failed:', err); return null; });

          // Then bulk save answers with session_id
          if (sessionResult?.sessionId && answers.length > 0) {
            saveAnswers(
              s.user.supabaseId,
              sessionResult.sessionId,
              answers
            ).catch(err => console.error('Answers save failed:', err));
          }
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
        softPromptSeen: s.softPromptSeen,
        topicRecords:   s.topicRecords,
        sessionHistory: s.sessionHistory,
        lastSession:    s.lastSession,
        recentIds:      s.recentIds,
        recentTopics:   s.recentTopics,
      }),
    }
  )
);
