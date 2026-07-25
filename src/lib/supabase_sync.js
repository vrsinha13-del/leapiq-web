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
        full_name:     userData.name,
        email:         userData.email,
        grade:         userData.grade,
        city:          userData.city     || null,
        country:       'India',
        password_hash: userData.password,
        pin:           userData.parentPin,
        registered_by: 'self',
        is_active:     true,
        is_verified:   false,
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
  durationSeconds,
  level,
}) {
  if (!studentId) return { success: false, error: 'No student ID' };

  try {
    const { error } = await supabase
      .from('session_logs')
      .insert({
        student_id:          studentId,
        subject,
        questions_answered:  questionsAnswered,
        correct_answers:     correct   || 0,
        wrong_answers:       wrong     || 0,
        duration_seconds:    durationSeconds || 0,
        level:               level     || '6',
        session_date:        new Date().toISOString(),
      });

    if (error) {
      console.error('Session save error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Session save exception:', err);
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
// Called on app load — prefetches all 4 subjects
// Returns { maths: [...], reasoning: [...], english: [...], gk: [...] }

export async function fetchAllQuestions() {
  const subjects = ['Maths', 'Reasoning', 'English', 'GK'];
  const today    = new Date().toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .eq('is_active', true)
      .or(`is_evergreen.eq.true,expires_at.gt.${today}`)
      .order('id');

    if (error) {
      console.error('Fetch all error:', error);
      return null;
    }

    // Group by subject and normalise
    const result = { maths: [], reasoning: [], english: [], gk: [] };

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
