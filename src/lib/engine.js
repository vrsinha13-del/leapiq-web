export const DIFF_LABEL = ['Easy', 'Medium', 'Hard'];
export const DIFF_TIME  = [60, 120, 180];

// ─── GRADE ACCESS MAP ───────────────────────────────────────────
// Which question levels each student grade can access
export const GRADE_ACCESS = {
  'Grade 5':  ['6'],
  'Grade 6':  ['6'],
  'Grade 7':  ['6', '7'],
  'Grade 8':  ['6', '7', '8'],
  'Grade 9':  ['6', '7', '8'],
  'Grade 10': ['6', '7', '8'],
  'Other':    ['6', '7', '8'],
};

// ─── TOPIC RECORD ───────────────────────────────────────────────
export function emptyTopicRecord() {
  return { answered:0, correct:0, slow:0, streak:0, diffLevel:0, lastWrong:0 };
}

// ─── TOPIC SCORE ────────────────────────────────────────────────
export function topicScore(r) {
  if (!r || r.answered < 3) return null;
  const eff = (r.correct - r.slow) + (r.slow * 0.7);
  return Math.round((eff / r.answered) * 100);
}

// ─── TOPIC WEIGHT ───────────────────────────────────────────────
export function topicWeight(r, sessCount) {
  if (sessCount < 5) return 1;
  const s = topicScore(r);
  if (s === null) return 1.5;
  if (s < 50) return 3;
  if (s < 70) return 2;
  if (s < 85) return 1;
  return 0.5;
}

// ─── LEVEL GRADUATION CHECK ─────────────────────────────────────
// A level is graduated when:
// - Average score across all topics in that level >= 70%
// - At least 10 questions answered at that level
export function isLevelGraduated(topicRecords, subject, level) {
  const keys = Object.keys(topicRecords)
    .filter(k => k.startsWith(`${subject}_${level}_`));
  if (!keys.length) return false;
  const totalAnswered = keys.reduce((a, k) =>
    a + topicRecords[k].answered, 0);
  if (totalAnswered < 10) return false;
  const scores = keys
    .map(k => topicScore(topicRecords[k]))
    .filter(s => s !== null);
  if (!scores.length) return false;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return avg >= 70;
}

// ─── GET ACTIVE LEVELS ──────────────────────────────────────────
// Returns which levels the student should see right now
// Always starts at level 6, unlocks next only when current is graduated
export function getActiveLevels(topicRecords, subject, studentGrade) {
  const allowed = GRADE_ACCESS[studentGrade] || ['6'];
  const active = [];
  for (const level of allowed) {
    active.push(level);
    // Stop here — student has not yet graduated this level
    if (!isLevelGraduated(topicRecords, subject, level)) break;
  }
  return active;
}

// ─── CHECK LEVEL GRADUATION ─────────────────────────────────────
// Call after each answer — returns graduation event if just unlocked
export function checkLevelGraduation(topicRecords, subject, studentGrade) {
  const allowed = GRADE_ACCESS[studentGrade] || ['6'];
  const levelNames = { '6': 'Grade VI', '7': 'Grade VII', '8': 'Grade VIII' };
  for (let i = 0; i < allowed.length; i++) {
    const level = allowed[i];
    const next  = allowed[i + 1];
    if (!next) continue; // already at max level for this grade
    if (isLevelGraduated(topicRecords, subject, level)) {
      // Check if next level was NOT active before this answer
      // i.e. this is a fresh graduation
      const prevActive = [];
      for (const l of allowed) {
        prevActive.push(l);
        if (l === level) break;
      }
      if (!prevActive.includes(next)) {
        return {
          graduated: true,
          from: levelNames[level] || level,
          to:   levelNames[next]  || next,
          message: `🎉 Amazing! You've mastered ${levelNames[level]}! ${levelNames[next]} questions unlocked — let's go! 🚀`
        };
      }
    }
  }
  return { graduated: false };
}

// ─── SELECT NEXT QUESTION ───────────────────────────────────────
// Now accepts studentGrade and filters by active levels
export function selectNextQuestion(
  allQuestions,
  topicRecords,
  sessionCount,
  recentIds,
  subject,
  studentGrade   // ← new parameter
) {
  if (!allQuestions.length) return null;

  // Get which levels this student can see right now
  const activeLevels = getActiveLevels(topicRecords, subject, studentGrade);

  // Filter to only eligible questions for this student
  const eligible = allQuestions.filter(q =>
    activeLevels.includes(String(q.question_level || q.level || q.grade || '6'))
  );

  if (!eligible.length) return null;

  // Build topic pools from eligible questions only
  const byTopic = {};
  for (const q of eligible) {
    if (!byTopic[q.topic]) byTopic[q.topic] = { easy:[], medium:[], hard:[] };
    const diff = (q.difficulty || 'easy').toLowerCase();
    if (byTopic[q.topic][diff]) byTopic[q.topic][diff].push(q);
  }

  const pool = [];
  for (const [topic, difficulties] of Object.entries(byTopic)) {
    // Key now includes level — e.g. 'maths_6_decimals'
    // We find the right level for this topic from the question itself
    const sampleQ = difficulties.easy[0] || difficulties.medium[0] || difficulties.hard[0];
    const level   = String(sampleQ?.question_level || sampleQ?.level || sampleQ?.grade || '6');
    const key     = `${subject}_${level}_${topic}`;

    const record  = topicRecords[key] || emptyTopicRecord();
    const weight  = topicWeight(record, sessionCount);
    const diffKey = ['easy', 'medium', 'hard'][record.diffLevel || 0];

    let candidates = difficulties[diffKey].filter(q => !recentIds.includes(q.id));

    // Fallback to easier level if no candidates at current difficulty
    if (!candidates.length && record.diffLevel > 0) {
      const fallbackKey = ['easy', 'medium', 'hard'][record.diffLevel - 1];
      candidates = difficulties[fallbackKey].filter(q => !recentIds.includes(q.id));
    }

    // Fallback to any question in this difficulty (allow repeats)
    if (!candidates.length) candidates = difficulties[diffKey];
    if (!candidates.length) continue;

    const slots = Math.max(1, Math.round(weight * 2));
    for (let i = 0; i < slots; i++) {
      pool.push({ topic, candidates, record, key });
    }
  }

  if (!pool.length) return null;

  const slot = pool[Math.floor(Math.random() * pool.length)];
  const q    = slot.candidates[Math.floor(Math.random() * slot.candidates.length)];

  return { question: q, topicKey: slot.key, record: slot.record };
}

// ─── UPDATE RECORD ──────────────────────────────────────────────
// Unchanged — works exactly as before
export function updateRecord(record, isCorrect, isLate) {
  const r = { ...record };
  r.answered++;
  if (isCorrect) {
    r.correct++;
    if (isLate) r.slow++;
    r.streak++;
    r.lastWrong = 0;
    if (r.streak >= 3 && r.diffLevel < 2) { r.diffLevel++; r.streak = 0; }
  } else {
    r.streak = 0;
    r.lastWrong++;
    if (r.lastWrong >= 2 && r.diffLevel > 0) { r.diffLevel--; r.lastWrong = 0; }
  }
  return r;
}

// ─── SESSION END MESSAGE ────────────────────────────────────────
// Updated to handle new key format subject_level_topic
export function sessionEndMessage(topicRecords, subject, count) {
  const recs = Object.entries(topicRecords)
    .filter(([k]) => k.startsWith(subject + '_'))
    .map(([k, r]) => {
      // Key is now subject_level_topic — extract just the topic part
      const parts = k.replace(subject + '_', '').split('_');
      const topic = parts.slice(1).join('_'); // everything after level
      return { topic, score: topicScore(r), ans: r.answered };
    })
    .filter(t => t.ans >= 3);

  const mains = [
    `Amazing! ${count} questions today. You're on fire! 🔥`,
    `Fantastic! ${count} questions answered. Keep this up! ⭐`,
    `Brilliant — ${count} questions! Getting better every day! 🚀`,
    `Wow, ${count} questions! Be really proud! 🏆`,
  ];
  const main = mains[Math.floor(Math.random() * mains.length)];

  if (!recs.length) return {
    main,
    hint: "Keep going tomorrow — you're building something great!"
  };

  const tl   = t => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const best = [...recs].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  const weak = [...recs].sort((a, b) => (a.score || 0) - (b.score || 0))[0];

  let hint = '';
  if (best && (best.score || 0) >= 70) {
    hint = `You're doing great in ${tl(best.topic)}! 🌟`;
    if (weak && weak.topic !== best.topic && (weak.score || 0) < 65)
      hint += ` A little more practice in ${tl(weak.topic)} and you'll be unstoppable! 💪`;
    else
      hint += ' Come back tomorrow to keep that streak going!';
  } else {
    hint = "You're making great progress! Every question makes you smarter. See you tomorrow! 💪";
  }

  return { main, hint };
}

// ─── STRENGTH SUMMARY (student view — positives only) ───────────
// Updated for new key format
export function strengthSummary(topicRecords, subject) {
  const tl = t => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const recs = Object.entries(topicRecords)
    .filter(([k]) => k.startsWith(subject + '_'))
    .map(([k, r]) => {
      const parts = k.replace(subject + '_', '').split('_');
      const topic = parts.slice(1).join('_');
      return { topic, score: topicScore(r), ans: r.answered };
    })
    .filter(t => t.ans >= 3 && t.score !== null)
    .sort((a, b) => b.score - a.score);

  if (!recs.length) return null;

  const stars = recs.filter(r => r.score >= 75).map(r => tl(r.topic));
  const good  = recs.filter(r => r.score >= 55 && r.score < 75).map(r => tl(r.topic));

  if (!stars.length && !good.length)
    return "You're making great progress! Keep practising! 💪";

  let msg = '';
  if (stars.length) msg += `⭐ Star at: ${stars.join(', ')}!`;
  if (good.length)  msg += `${stars.length ? ' ' : ''}📈 Coming along: ${good.join(', ')}`;
  return msg;
}

// ─── FULL TOPIC BREAKDOWN (parent/teacher view) ─────────────────
// Updated for new key format — groups by level as well
export function fullTopicBreakdown(topicRecords, subject) {
  const tl        = t => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const levelName = l => ({ '6':'Grade VI', '7':'Grade VII', '8':'Grade VIII' }[l] || l);

  return Object.entries(topicRecords)
    .filter(([k]) => k.startsWith(subject + '_'))
    .map(([k, r]) => {
      const parts = k.replace(subject + '_', '').split('_');
      const level = parts[0];
      const topic = parts.slice(1).join('_');
      return {
        level,
        levelLabel: levelName(level),
        topic,
        label:      tl(topic),
        answered:   r.answered,
        correct:    r.correct,
        score:      topicScore(r),
        diffLevel:  r.diffLevel,
        needsWork:  (topicScore(r) || 100) < 60,
      };
    })
    .sort((a, b) => {
      // Sort by level first, then by score ascending (weakest first)
      if (a.level !== b.level) return a.level.localeCompare(b.level);
      return (a.score || 0) - (b.score || 0);
    });
}

// ─── GUEST LIMITS ───────────────────────────────────────────────
export const GUEST_PER_SUBJECT = 10;
export const GUEST_TOTAL       = 36;

export function guestLimitReachedForSubject(guestCounts, subject) {
  const total = Object.values(guestCounts).reduce((a, b) => a + b, 0);
  if (total >= GUEST_TOTAL) return true;
  if ((guestCounts[subject] || 0) >= GUEST_PER_SUBJECT) return true;
  return false;
}
