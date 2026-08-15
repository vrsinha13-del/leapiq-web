// src/lib/supabase_sync.js
// Handles all Supabase read/write operations for Leap IQ
// 1. Registration — save student to students table
// 2. Session end — save to session_logs table
// 3. Question fetch — load from question_bank table

import { supabase } from './supabase';

// ── 1. REGISTRATION ────────────────────────────────────────────────────────
// Called when student completes signup form
// Saves to Supabase students table

export async function registerStudent(userData) {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert({
        full_name:           userData.name,
        email:               userData.email,
        grade:               userData.grade,
        city:                userData.city     || null,
        country:             'India',
        password_hash:       userData.password,
        pin:                 userData.parentPin,
        registered_by:       'self',
        is_active:           true,
        is_verified:         false,
        trial_ends_at:       userData.trialEndsAt,
        subscription_status: 'trial',
      })
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      // Don't block signup — save locally even if Supabase fails
      return { success: false, error: error.message };
    }

    return { success: true, student: data };
  } catch (err) {
    console.error('Registration exception:', err);
    return { success: false, error: err.message };
  }
}

// ── 2. SESSION SAVE ────────────────────────────────────────────────────────
// Called when student taps Practice Later
// Saves summary to session_logs table

export async function saveSession({
  studentId,
  subject,
  questionsAnswered,
  correct,
  wrong,
  easyAttempted,
  mediumAttempted,
  hardAttempted,
  durationSeconds,
  level,
}) {
  if (!studentId) return { success: false, error: 'No student ID' };

  try {
    const total    = questionsAnswered || 0;
    const cor      = correct  || 0;
    const wrg      = wrong    || 0;
    const scorePct = total > 0 ? Math.round((cor / total) * 100) : 0;

    const { data, error } = await supabase
      .from('session_logs')
      .insert({
        student_id:        studentId,
        subject,
        question_level:    level || '6',
        total_attempted:   total,
        total_correct:     cor,
        total_wrong:       wrg,
        score_pct:         scorePct,
        easy_attempted:    easyAttempted   || 0,
        medium_attempted:  mediumAttempted || 0,
        hard_attempted:    hardAttempted   || 0,
        duration_seconds:  durationSeconds || 0,
        started_at:        new Date(Date.now() - (durationSeconds||0)*1000).toISOString(),
        ended_at:          new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Session save error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, sessionId: data?.id };
  } catch (err) {
    console.error('Session save exception:', err);
    return { success: false, error: err.message };
  }
}

// ── 3. SAVE STUDENT ANSWERS ─────────────────────────────────────────────────
// Bulk insert all answers from a session into student_answers table
// Only called for Supabase questions (UUID IDs)

export async function saveAnswers(studentId, sessionId, answers) {
  if (!studentId || !sessionId || !answers.length) return { success: false };

  try {
    const rows = answers.map(a => ({
      student_id:     studentId,
      session_id:     sessionId,
      question_id:    a.question_id,
      subject:        a.subject,
      topic:          a.topic,
      difficulty:     a.difficulty,
      question_level: a.question_level,
      answer_given:   a.answer_given,
      correct_answer: a.correct_answer,
      is_correct:     a.is_correct,
      time_taken_sec: a.time_taken_sec,
      answered_at:    a.answered_at,
    }));

    const { error } = await supabase
      .from('student_answers')
      .insert(rows);

    if (error) {
      console.error('saveAnswers error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, count: rows.length };
  } catch (err) {
    console.error('saveAnswers exception:', err);
    return { success: false, error: err.message };
  }
}

// ── 3. QUESTION FETCH ──────────────────────────────────────────────────────
// Called on app load or when subject is selected
// Loads questions from question_bank table
// Falls back to local questions.js if Supabase fails

export async function fetchQuestions(subject) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .eq('subject', subject.charAt(0).toUpperCase() + subject.slice(1))
      .eq('is_active', true)
      .or(`is_evergreen.eq.true,expires_at.gt.${today}`)
      .order('id');

    if (error) {
      console.error('Question fetch error:', error);
      return { success: false, questions: [] };
    }

    // Normalise to engine format
    // Engine expects: id, topic, question_level, difficulty, category,
    //                 q (or question), opts (or option_a/b/c/d),
    //                 ans (or answer), exp (or explanation)
    const normalised = data.map(q => ({
      id:             q.id,
      subject:        q.subject?.toLowerCase(),
      question_level: String(q.question_level || '6'),
      chapter:        q.chapter,
      category:       q.category,
      topic:          q.topic,
      difficulty:     q.difficulty?.toLowerCase(),
      q:              q.question,
      question:       q.question,
      opts:           [q.option_a, q.option_b, q.option_c, q.option_d],
      option_a:       q.option_a,
      option_b:       q.option_b,
      option_c:       q.option_c,
      option_d:       q.option_d,
      ans:            q.answer,
      answer:         q.answer,
      exp:            q.explanation,
      explanation:    q.explanation,
      is_evergreen:   q.is_evergreen,
      expires_at:     q.expires_at,
    }));

    return { success: true, questions: normalised };
  } catch (err) {
    console.error('Question fetch exception:', err);
    return { success: false, questions: [] };
  }
}

// ── 4. FETCH ALL SUBJECTS AT ONCE ──────────────────────────────────────────
// Fetches each subject separately to avoid Supabase 1000-row default limit
// Returns { maths: [...], reasoning: [...], english: [...], gk: [...] }

export async function fetchAllQuestions() {
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = { maths: [], reasoning: [], english: [], gk: [] };

    // Fetch each subject separately — avoids 1000 row limit
    for (const [key, subjectName] of [['maths','Maths'],['reasoning','Reasoning'],['english','English'],['gk','GK']]) {
      let allRows = [];
      let from    = 0;
      const PAGE  = 1000;

      // Paginate until all rows fetched
      while (true) {
        const { data, error } = await supabase
          .from('question_bank')
          .select('*')
          .eq('subject', subjectName)
          .eq('is_active', true)
          .order('id')
          .range(from, from + PAGE - 1);

        if (error) {
          console.error(`Fetch ${subjectName} error:`, error);
          break;
        }

        if (!data || data.length === 0) break;
        allRows = [...allRows, ...data];
        if (data.length < PAGE) break;  // last page
        from += PAGE;
      }

      // Normalise
      result[key] = allRows.map(q => ({
        id:             q.id,
        subject:        key,
        question_level: String(q.question_level || '6'),
        chapter:        q.chapter,
        category:       q.category,
        topic:          q.topic,
        difficulty:     q.difficulty?.toLowerCase(),
        q:              q.question,
        question:       q.question,
        opts:           [q.option_a, q.option_b, q.option_c, q.option_d],
        option_a:       q.option_a,
        option_b:       q.option_b,
        option_c:       q.option_c,
        option_d:       q.option_d,
        ans:            q.answer,
        answer:         q.answer,
        exp:            q.explanation,
        explanation:    q.explanation,
        is_evergreen:   q.is_evergreen,
        expires_at:     q.expires_at,
      }));

      console.log(`Leap IQ: Loaded ${result[key].length} ${subjectName} questions`);
    }

    return result;
  } catch (err) {
    console.error('Fetch all exception:', err);
    return null;
  }
}

    for (const q of data) {
      const subj = q.subject?.toLowerCase();
      if (!result[subj]) continue;

      result[subj].push({
        id:             q.id,
        subject:        subj,
        question_level: String(q.question_level || '6'),
        chapter:        q.chapter,
        category:       q.category,
        topic:          q.topic,
        difficulty:     q.difficulty?.toLowerCase(),
        q:              q.question,
        question:       q.question,
        opts:           [q.option_a, q.option_b, q.option_c, q.option_d],
        option_a:       q.option_a,
        option_b:       q.option_b,
        option_c:       q.option_c,
        option_d:       q.option_d,
        ans:            q.answer,
        answer:         q.answer,
        exp:            q.explanation,
        explanation:    q.explanation,
        is_evergreen:   q.is_evergreen,
        expires_at:     q.expires_at,
      });
    }

    return result;
  } catch (err) {
    console.error('Fetch all exception:', err);
    return null;
  }
}

// ── 5. FETCH CITIES ─────────────────────────────────────────────────────────
// Returns unique list of cities from schools table — dynamic, no hardcoding

export async function fetchCities() {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('city')
      .eq('is_active', true)
      .order('city');

    if (error) { console.error('fetchCities error:', error); return []; }

    // Deduplicate cities
    const unique = [...new Set(data.map(r => r.city).filter(Boolean))];
    return unique;
  } catch (err) {
    console.error('fetchCities exception:', err);
    return [];
  }
}

// ── 6. FETCH SCHOOLS BY CITY ────────────────────────────────────────────────
// Returns schools for a given city — used in registration dropdown

export async function fetchSchools(city) {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, city')
      .eq('is_active', true)
      .eq('city', city)
      .order('name');

    if (error) { console.error('fetchSchools error:', error); return []; }
    return data || [];
  } catch (err) {
    console.error('fetchSchools exception:', err);
    return [];
  }
}

// ── 7. LINK STUDENT TO SCHOOL ───────────────────────────────────────────────
// Creates a school_students row when student opts to share with school
// Status = pending_approval — school admin must accept

export async function linkStudentToSchool(studentId, schoolId, addedBy = 'self') {
  try {
    const { error } = await supabase
      .from('school_students')
      .insert({
        student_id: studentId,
        school_id:  schoolId,
        status:     'pending_approval',
        added_by:   addedBy,
      });

    if (error) {
      console.error('linkStudentToSchool error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('linkStudentToSchool exception:', err);
    return { success: false, error: err.message };
  }
}

// ── 8. FETCH STUDENT BY EMAIL ──────────────────────────────────────────────
// Used for sign in — fetches student from Supabase by email

export async function fetchStudentByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error) { console.error('fetchStudentByEmail error:', error); return null; }
    return data;
  } catch (err) {
    console.error('fetchStudentByEmail exception:', err);
    return null;
  }
}
