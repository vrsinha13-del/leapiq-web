// src/lib/store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  emptyTopicRecord,
  updateRecord,
  getTimers,
  computeRewardState,
  guestLimitReachedForSubject,
  guestLimitStatus,
  calculateStreak,
} from './engine';
import { registerStudent, saveSession, saveAnswers, linkStudentToSchool } from './supabase_sync';

export const SUBJECTS = [
  { id:'maths',     label:'Mathematics',       short:'Maths',     icon:'∑',  color:'#F2A93B', light:'#FCE7C2' },
  { id:'reasoning', label:'Reasoning',         short:'Reasoning', icon:'⚡', color:'#F0654B', light:'#FBD9CE' },
  { id:'english',   label:'English',           short:'English',   icon:'Aa', color:'#16A38A', light:'#C5EFE4' },
  { id:'gk',        label:'General Knowledge', short:'GK',        icon:'🌍', color:'#7C4DFF', light:'#E1D6FF' },
];

// Replays a student's full answer history (oldest to newest) through the
// exact same updateRecord() logic the live engine uses during practice, so
// topicRecords — difficulty level, mastery progress, answered/correct counts,
// days practiced — is rebuilt on login instead of resetting to empty. This is
// what makes "already mastered a level" survive logging out, a token refresh,
// or switching devices.
function rebuildTopicRecordsFromRows(rows) {
  const records = {};
  for (const row of rows) {
    if (!row.subject || !row.topic) continue;
    const level = String(row.question_level || '6');
    const key   = `${row.subject}_${level}_${row.topic}`;

    // category isn't stored on student_answers. It only changes timing and
    // mastery thresholds for English (comprehension vs standard topics), so
    // it's inferred here from the topic name — comprehension topics are
    // named "... Passages ..." by the generator. This is an approximation
    // used only for the isLate/speed-penalty reconstruction below.
    const category = row.subject === 'english' && /passage/i.test(row.topic)
      ? 'comprehension'
      : '';

    const { mastery: masteryTime } = getTimers(row.subject, category, row.difficulty);
    const isLate = masteryTime !== null && (row.time_taken_sec || 0) > masteryTime;
    const today  = row.answered_at ? new Date(row.answered_at).toDateString() : null;

    records[key] = updateRecord(
      records[key] || emptyTopicRecord(),
      !!row.is_correct, isLate, row.difficulty, today, row.subject, category
    );
  }
  return records;
}

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

      // ── Question answer tracking ──────────────────────────────────
      answeredCorrectly: {},
      answeredWrongly:   {},

      // ── Rewards system — buddies, weekly/monthly badges ────────────
      // answeredRows: lightweight running log of {subject, is_correct,
      // answered_at} used to compute rewardState live, without refetching
      // Supabase after every answer. Rebuilt from history on login.
      answeredRows: [],
      rewardState:  {},

      // ── Recent topics — last 5 topic keys served ──────────────────
      // Used for rotation enforcement — recency penalty applied
      recentTopics: [],

      // ── Session token ─────────────────────────────────────────────
      sessionToken: null,

      // ── Auth ────────────────────────────────────────────────
      login: async (userData) => {
        // Generate unique session token
        const token = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36);

        // Save token to Supabase if student has supabaseId
        if (userData.supabaseId) {
          try {
            const { setSessionToken, fetchStudentSessions, fetchAnsweredHistory } = await import('./supabase_sync');
            await setSessionToken(userData.supabaseId, token);

            // Fetch sessions AND the full answered-question history in parallel
            const [sessions, answeredHistory] = await Promise.all([
              fetchStudentSessions(userData.supabaseId),
              fetchAnsweredHistory(userData.supabaseId),
            ]);
            const lastSession = sessions.length > 0 ? {
              questionsAnswered: sessions[0].questionsAnswered,
              date:              sessions[0].date,
              subject:           sessions[0].subject,
            } : null;

            set({
              user:              { ...userData, sessionToken: token },
              isLoggedIn:        true,
              guestCounts:       {},
              softPromptSeen:    {},
              sessionToken:      token,
              sessionHistory:    sessions,
              lastSession:       lastSession,
              // Rebuild topic difficulty/mastery AND question-level history
              // from Supabase — a login no longer wipes progress, only the
              // in-memory session state.
              topicRecords:      rebuildTopicRecordsFromRows(answeredHistory.rows),
              answeredCorrectly: answeredHistory.answeredCorrectly,
              answeredWrongly:   answeredHistory.answeredWrongly,
              answeredRows:      answeredHistory.rows,
              rewardState:       computeRewardState(answeredHistory.rows),
              activeSession:     null,
              recentTopics:      [],
            });
            return;
          } catch(e) {
            console.error('login fetch failed:', e);
          }
        }

        set({
          user:              { ...userData, sessionToken: token },
          isLoggedIn:        true,
          guestCounts:       {},
          softPromptSeen:    {},
          sessionToken:      token,
          // Clear previous user's learning data
          topicRecords:      {},
          answeredCorrectly: {},
          answeredWrongly:   {},
          answeredRows:      [],
          rewardState:       {},
          activeSession:     null,
        });
      },

      logout: async () => {
        const s = get();

        // Flush any in-progress session before clearing state. Previously
        // this was skipped, so a student who hit "Sign out" mid-session
        // (rather than finishing normally) had that session's answers —
        // including correct ones — silently discarded and never saved to
        // Supabase. On next login, those questions looked "never answered"
        // and were served again. Reusing endSession() here keeps this in
        // sync with the normal end-of-session save path.
        if (s.activeSession && s.activeSession.questionsAnswered > 0 && s.user?.supabaseId) {
          try {
            await get().endSession(
              s.activeSession.subject,
              s.activeSession.questionsAnswered,
              s.activeSession.level
            );
          } catch (e) {
            console.error('Failed to flush active session on logout:', e);
          }
        }

        const s2 = get();
        if (s2.user?.supabaseId) {
          try {
            const { clearSessionToken } = await import('./supabase_sync');
            await clearSessionToken(s2.user.supabaseId);
          } catch(e) { console.error('clearSessionToken failed:', e); }
        }
        set({
          user:              null,
          isLoggedIn:        false,
          sessionToken:      null,
          topicRecords:      {},
          answeredCorrectly: {},
          answeredWrongly:   {},
          answeredRows:      [],
          rewardState:       {},
          sessionHistory:    [],
          lastSession:       null,
          activeSession:     null,
          guestCounts:       {},
          softPromptSeen:    {},
        });
      },

      // ── Verify session still valid ────────────────────────────────
      verifySession: async () => {
        const s = get();
        if (!s.isLoggedIn || !s.user?.supabaseId) return true;

        // Same silent-data-loss risk as logout(): this can force-clear state
        // mid-session (e.g. single-login enforcement kicking in), so flush
        // any in-progress session's answers to Supabase first.
        const flushActiveSession = async () => {
          const cur = get();
          if (cur.activeSession && cur.activeSession.questionsAnswered > 0) {
            try {
              await cur.endSession(
                cur.activeSession.subject,
                cur.activeSession.questionsAnswered,
                cur.activeSession.level
              );
            } catch (e) {
              console.error('Failed to flush active session on forced logout:', e);
            }
          }
        };

        // If no session token — user logged in before this feature
        // Force them to re-login to get a proper token
        if (!s.sessionToken) {
          await flushActiveSession();
          set({ user: null, isLoggedIn: false, sessionToken: null });
          return false;
        }

        try {
          const { verifySessionToken } = await import('./supabase_sync');
          const valid = await verifySessionToken(s.user.supabaseId, s.sessionToken);
          if (!valid) {
            await flushActiveSession();
            set({ user: null, isLoggedIn: false, sessionToken: null });
            return false;
          }
          return true;
        } catch(e) {
          return true; // fail open on network error
        }
      },

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

        // Generate session token for single login enforcement
        const token = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36);
        newUser.sessionToken = token;

        // Save session token to Supabase
        if (newUser.supabaseId) {
          try {
            const { setSessionToken } = await import('./supabase_sync');
            await setSessionToken(newUser.supabaseId, token);
          } catch(e) { console.error('setSessionToken on register failed:', e); }
        }

        set({
          user:         newUser,
          isLoggedIn:   true,
          guestCounts:  {},
          sessionToken: token,
          sessionHistory: [],
          lastSession:    null,
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

        // Track answered questions
        const answeredCorrectly = isCorrect
          ? { ...s.answeredCorrectly, [questionId]: true }
          : s.answeredCorrectly;

        const answeredWrongly = !isCorrect
          ? { ...s.answeredWrongly, [questionId]: (s.topicRecords[key]?.answered || 0) }
          : s.answeredWrongly;

        // Track last 5 topics — deduplicated to prevent back-to-back repeats
        const recentTopics = [key, ...(s.recentTopics || []).filter(function(k){ return k !== key; })].slice(0, 5);

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

        // Rewards system: append this answer to the running log and
        // recompute reward state live, so buddy progress/colors update in
        // real time during a session rather than waiting for next login.
        const answeredRows = newAnswer ? [...s.answeredRows, newAnswer] : s.answeredRows;
        const rewardState  = newAnswer ? computeRewardState(answeredRows) : s.rewardState;

        set({
          topicRecords:      { ...s.topicRecords, [key]: updated },
          guestCounts,
          activeSession,
          answeredCorrectly,
          answeredWrongly,
          recentTopics,
          answeredRows,
          rewardState,
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

        // Cap duration at 2 hours max (prevents overnight sessions)
        const rawDuration = s.activeSession?.startedAt
          ? Math.round((Date.now() - s.activeSession.startedAt) / 1000)
          : 0;
        const durationSeconds = Math.min(rawDuration, 7200);

        const correct         = s.activeSession?.correct         || 0;
        const wrong           = s.activeSession?.wrong           || 0;
        const easyAttempted   = s.activeSession?.easyAttempted   || 0;
        const mediumAttempted = s.activeSession?.mediumAttempted || 0;
        const hardAttempted   = s.activeSession?.hardAttempted   || 0;
        const answers         = s.activeSession?.answers         || [];

        // Only save to Supabase if at least 1 question was answered
        if (s.isLoggedIn && s.user?.supabaseId && questionsAnswered > 0) {
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
        answeredCorrectly: s.answeredCorrectly,
        answeredWrongly:   s.answeredWrongly,
        sessionToken:      s.sessionToken,
        recentTopics:      s.recentTopics,
      }),
    }
  )
);
