// ─── SUBJECT CONFIGURATION ─────────────────────────────────────────────────
// All subject-specific constants in one place
// Timer = shown to student · MasteryTime = internal slow threshold

export const SUBJECT_CONFIG = {

  maths: {
    timers:       { easy: 60,  medium: 120, hard: 240 },
    masteryTime:  { easy: 45,  medium: 90,  hard: 180 },
    speedPenalty: true,
    mastery: {
      easy:   { minQ: 100, minAcc: 90, minDays: 7 },
      medium: { minQ: 60,  minAcc: 85, minDays: 7 },
      hard:   { minQ: 30,  minAcc: 80, minDays: 7 },
    },
  },

  reasoning: {
    timers:       { easy: 90,  medium: 150, hard: 300 },
    masteryTime:  { easy: 60,  medium: 110, hard: 210 },
    speedPenalty: true,
    mastery: {
      easy:   { minQ: 100, minAcc: 90, minDays: 7 },
      medium: { minQ: 60,  minAcc: 85, minDays: 7 },
      hard:   { minQ: 30,  minAcc: 80, minDays: 7 },
    },
  },

  english: {
    // Timer varies by category
    timers: {
      grammar:         { easy: 60,  medium: 120, hard: 240 },
      vocabulary:      { easy: 60,  medium: 120, hard: 240 },
      comprehension:   { easy: 120, medium: 180, hard: 300 },
      verbal_reasoning:{ easy: 90,  medium: 150, hard: 300 },
    },
    masteryTime: {
      grammar:         { easy: 45,  medium: 90,  hard: 180 },
      vocabulary:      { easy: 45,  medium: 90,  hard: 180 },
      comprehension:   { easy: 90,  medium: 135, hard: 225 },
      verbal_reasoning:{ easy: 60,  medium: 110, hard: 210 },
    },
    speedPenalty: true,
    mastery: {
      standard: {
        easy:   { minQ: 100, minAcc: 90, minDays: 7 },
        medium: { minQ: 60,  minAcc: 85, minDays: 7 },
        hard:   { minQ: 30,  minAcc: 80, minDays: 7 },
      },
      comprehension: {
        easy:   { minQ: 100, minAcc: 85, minDays: 7 },
        medium: { minQ: 60,  minAcc: 80, minDays: 7 },
        hard:   { minQ: 30,  minAcc: 75, minDays: 7 },
      },
    },
  },

  gk: {
    timers:       { easy: 30, medium: 45, hard: 60 },
    masteryTime:  null,        // no speed penalty for GK
    speedPenalty: false,
    mastery: {
      easy:   { minQ: 80,  minAcc: 85, minDays: 5 },
      medium: { minQ: 50,  minAcc: 80, minDays: 5 },
      hard:   { minQ: 25,  minAcc: 75, minDays: 5 },
    },
  },
};

// ─── DIFF LABELS ────────────────────────────────────────────────────────────
export const DIFF_LABEL = ['Easy', 'Medium', 'Hard'];

// ─── GET TIMER FOR QUESTION ─────────────────────────────────────────────────
// Returns { shown, mastery } for a given subject + category + difficulty

export function getTimers(subject, category, difficulty) {
  const cfg = SUBJECT_CONFIG[subject];
  if (!cfg) return { shown: 60, mastery: 45 };

  const diff = difficulty?.toLowerCase() || 'easy';

  if (subject === 'english') {
    const cat      = category?.toLowerCase().replace(/\s+/g, '_') || 'grammar';
    const shown    = cfg.timers[cat]?.[diff]    ?? cfg.timers.grammar[diff];
    const mastery  = cfg.masteryTime[cat]?.[diff] ?? cfg.masteryTime.grammar[diff];
    return { shown, mastery };
  }

  return {
    shown:   cfg.timers[diff]      ?? 60,
    mastery: cfg.masteryTime?.[diff] ?? null,
  };
}

// ─── GET MASTERY CRITERIA ───────────────────────────────────────────────────
// Returns { minQ, minAcc, minDays } for a subject + category + difficulty

export function getMasteryCriteria(subject, category, difficulty) {
  const cfg  = SUBJECT_CONFIG[subject];
  if (!cfg) return { minQ: 100, minAcc: 90, minDays: 7 };

  const diff = difficulty?.toLowerCase() || 'easy';

  if (subject === 'english') {
    const cat      = category?.toLowerCase().replace(/\s+/g, '_') || 'grammar';
    const criteria = cat === 'comprehension'
      ? cfg.mastery.comprehension
      : cfg.mastery.standard;
    return criteria[diff] ?? criteria.easy;
  }

  return cfg.mastery[diff] ?? cfg.mastery.easy;
}

// ─── EMPTY TOPIC RECORD ─────────────────────────────────────────────────────
// One record per subject_level_topic combination

export function emptyTopicRecord() {
  return {
    answered:      0,
    correct:       0,
    slow:          0,
    streak:        0,
    lastWrong:     0,
    diffLevel:     0,   // 0=Easy 1=Medium 2=Hard
    easy:          { answered: 0, correct: 0, slow: 0 },
    medium:        { answered: 0, correct: 0, slow: 0 },
    hard:          { answered: 0, correct: 0, slow: 0 },
    daysPracticed: [],  // array of date strings
  };
}

// ─── TOPIC SCORE ────────────────────────────────────────────────────────────
// Overall accuracy score for a topic (with slow penalty)

export function topicScore(r) {
  if (!r || r.answered < 3) return null;
  const eff = (r.correct - r.slow) + (r.slow * 0.7);
  return Math.round((eff / r.answered) * 100);
}

// Score for a specific difficulty within a topic
export function diffScore(r, diff) {
  const d = r?.[diff];
  if (!d || d.answered < 3) return null;
  const eff = (d.correct - d.slow) + (d.slow * 0.7);
  return Math.round((eff / d.answered) * 100);
}

// ─── TOPIC WEIGHT ───────────────────────────────────────────────────────────
// Weak topics appear more often in question selection

export function topicWeight(r, sessCount) {
  if (sessCount < 5) return 1;
  const s = topicScore(r);
  if (s === null) return 1.5;
  if (s < 50)    return 3;
  if (s < 70)    return 2;
  if (s < 85)    return 1;
  return 0.5;
}

// ─── IS TOPIC MASTERED ──────────────────────────────────────────────────────
// ALL THREE difficulties must be cleared to master a topic
// GK: no speed penalty — uses raw accuracy only

export function isTopicMastered(record, subject, category) {
  if (!record) return false;

  for (const diff of ['easy', 'medium', 'hard']) {
    const criteria = getMasteryCriteria(subject, category, diff);
    const d        = record[diff];

    // Minimum questions at this difficulty
    if (!d || d.answered < criteria.minQ) return false;

    // Minimum accuracy
    let acc;
    if (SUBJECT_CONFIG[subject]?.speedPenalty && subject !== 'gk') {
      // Use slow-adjusted score
      const score = diffScore(record, diff);
      if (score === null || score < criteria.minAcc) return false;
    } else {
      // GK — raw accuracy only, no slow penalty
      acc = d.answered > 0 ? Math.round((d.correct / d.answered) * 100) : 0;
      if (acc < criteria.minAcc) return false;
    }

    // Minimum days practiced
    const days = record.daysPracticed || [];
    if (days.length < criteria.minDays) return false;
  }

  return true;
}

// ─── GET TOPIC LEVEL MIX ───────────────────────────────────────────────────
// Returns question mix ratios per level for a specific topic
// Purely performance driven — no grade gating
// Per topic · Per level · Based on accuracy at higher level

export function getTopicLevelMix(topicRecords, subject, topic, category) {

  function rec(level) {
    return topicRecords[`${subject}_${level}_${topic}`];
  }
  function score(level) {
    return topicScore(rec(level)) || 0;
  }
  function mastered(level) {
    return isTopicMastered(rec(level), subject, category);
  }

  // ── Level 6 not mastered — 100% Level 6 ──────────────────────
  if (!mastered('6')) {
    return { '6': 1.0, '7': 0.0, '8': 0.0 };
  }

  // ── Level 6 mastered — introduce Level 7 ─────────────────────
  const l7Score = score('7');
  let l7Share;
  if (l7Score < 30)      l7Share = 0.20; // < 30%  → 80/20
  else if (l7Score < 70) l7Share = 0.40; // 30-70% → 60/40
  else                   l7Share = 0.60; // > 70%  → 40/60

  // ── Level 7 not mastered — no Level 8 yet ────────────────────
  if (!mastered('7')) {
    return {
      '6': parseFloat((1 - l7Share).toFixed(2)),
      '7': parseFloat(l7Share.toFixed(2)),
      '8': 0.0,
    };
  }

  // ── Level 7 mastered — introduce Level 8 ─────────────────────
  const l8Score = score('8');
  let l8Share;
  if (l8Score < 30)      l8Share = 0.20; // < 30%  → 40/40/20
  else if (l8Score < 70) l8Share = 0.30; // 30-70% → 35/35/30
  else                   l8Share = 0.40; // > 70%  → 30/30/40 ← permanent

  const remaining = parseFloat((1 - l8Share).toFixed(2));
  const l6Final   = Math.max(0.30, parseFloat((remaining / 2).toFixed(2)));
  const l7Final   = Math.max(0.30, parseFloat((remaining - l6Final).toFixed(2)));

  return {
    '6': l6Final,
    '7': l7Final,
    '8': parseFloat(l8Share.toFixed(2)),
  };
}

// ─── CHECK TOPIC LEVEL UNLOCK ──────────────────────────────────────────────
// Returns celebration message when a topic just unlocked a new level
// Called after every answer

export function checkTopicLevelUnlock(topicRecords, subject, topic, category) {
  const levelNames = { '6': 'Grade VI', '7': 'Grade VII', '8': 'Grade VIII' };

  // Check Level 6 → 7 unlock
  if (isTopicMastered(topicRecords[`${subject}_6_${topic}`], subject, category)) {
    const l7Key = `${subject}_7_${topic}`;
    if (!topicRecords[l7Key] || topicRecords[l7Key].answered === 0) {
      return {
        unlocked: true,
        topic,
        from:    levelNames['6'],
        to:      levelNames['7'],
        message: `🎉 Amazing! You've mastered ${levelNames['6']} ${topic}! ${levelNames['7']} questions are now unlocking — let's go! 🚀`,
      };
    }
  }

  // Check Level 7 → 8 unlock
  if (isTopicMastered(topicRecords[`${subject}_7_${topic}`], subject, category)) {
    const l8Key = `${subject}_8_${topic}`;
    if (!topicRecords[l8Key] || topicRecords[l8Key].answered === 0) {
      return {
        unlocked: true,
        topic,
        from:    levelNames['7'],
        to:      levelNames['8'],
        message: `🎉 Incredible! You've mastered ${levelNames['7']} ${topic}! ${levelNames['8']} questions are now unlocking — you're on fire! 🚀`,
      };
    }
  }

  return { unlocked: false };
}

// ─── SELECT NEXT QUESTION ──────────────────────────────────────────────────
// The core engine — picks next question using per-topic level mix + weighting
// Works for all four subjects with no changes

export function selectNextQuestion(
  allQuestions,   // all questions for this subject from question bank
  topicRecords,   // student's topic records from store
  sessionCount,   // number of sessions so far
  recentIds,      // last 15 question IDs shown this session
  subject         // 'maths' | 'reasoning' | 'english' | 'gk'
) {
  if (!allQuestions.length) return null;

  // Filter out expired GK questions
  const today     = new Date().toISOString().split('T')[0];
  const eligible  = allQuestions.filter(q => {
    if (subject === 'gk' && !q.is_evergreen && q.expires_at) {
      return q.expires_at >= today;
    }
    return true;
  });

  if (!eligible.length) return null;

  // Group questions by topic → level → difficulty
  const byTopic = {};
  for (const q of eligible) {
    const level = String(q.question_level || q.level || q.grade || '6');
    const topic = q.topic;
    const diff  = (q.difficulty || 'easy').toLowerCase();
    const cat   = q.category || '';

    if (!byTopic[topic]) byTopic[topic] = { category: cat };
    if (!byTopic[topic][level])
      byTopic[topic][level] = { easy: [], medium: [], hard: [] };
    if (byTopic[topic][level][diff]) {
      byTopic[topic][level][diff].push(q);
    }
  }

  if (!Object.keys(byTopic).length) return null;

  const pool = [];

  for (const [topic, levels] of Object.entries(byTopic)) {
    const category = levels.category || '';

    // Get per-topic level mix — purely performance driven
    const mix = getTopicLevelMix(topicRecords, subject, topic, category);

    // Pick level for this topic based on mix weights
    const rand = Math.random();
    let cumulative  = 0;
    let chosenLevel = '6';
    for (const [level, weight] of Object.entries(mix)) {
      if (weight <= 0) continue;
      cumulative += weight;
      if (rand <= cumulative) { chosenLevel = level; break; }
    }

    // Get questions for chosen topic + level
    const difficulties = levels[chosenLevel];
    if (!difficulties) continue;

    // Get topic record for chosen level
    const key    = `${subject}_${chosenLevel}_${topic}`;
    const record = topicRecords[key] || emptyTopicRecord();
    const weight = topicWeight(record, sessionCount);
    const isMast = isTopicMastered(record, subject, category);

    // Determine difficulty — mastered topics start at Hard
    const diffLevel = record.diffLevel || 0;
    const diffKey   = ['easy', 'medium', 'hard'][diffLevel];

    // Get candidates — exclude recently seen
    let candidates = difficulties[diffKey]?.filter(
      q => !recentIds.includes(q.id)
    ) || [];

    // Fallback to easier difficulty if exhausted
    if (!candidates.length && diffLevel > 0) {
      const fallback = ['easy', 'medium', 'hard'][diffLevel - 1];
      candidates = difficulties[fallback]?.filter(
        q => !recentIds.includes(q.id)
      ) || [];
    }

    // Allow repeats if all exhausted (spaced repetition)
    if (!candidates.length) candidates = difficulties[diffKey] || [];
    if (!candidates.length) continue;

    // Add weighted slots to pool
    const slots = Math.max(1, Math.round(weight * 2));
    for (let i = 0; i < slots; i++) {
      pool.push({ topic, category, candidates, record, key, chosenLevel, isMast });
    }
  }

  if (!pool.length) return null;

  const slot = pool[Math.floor(Math.random() * pool.length)];
  const q    = slot.candidates[Math.floor(Math.random() * slot.candidates.length)];

  return {
    question:   q,
    topicKey:   slot.key,
    record:     slot.record,
    isMastered: slot.isMast,
    level:      slot.chosenLevel,
    category:   slot.category,
  };
}

// ─── UPDATE RECORD ──────────────────────────────────────────────────────────
// Updates topic record after each answer
// Handles mastery-aware demotion (1 wrong demotes mastered topic)
// Handles GK (no slow penalty)

export function updateRecord(
  record,
  isCorrect,
  isLate,         // true if answer exceeded mastery time threshold
  difficulty,     // 'easy' | 'medium' | 'hard'
  today,          // date string e.g. 'Mon May 1 2025'
  subject,        // for GK — no slow penalty
  category        // for English comprehension mastery criteria
) {
  const r    = { ...record };
  const diff = (difficulty || 'easy').toLowerCase();

  // Ensure per-difficulty objects exist
  if (!r.easy)   r.easy   = { answered: 0, correct: 0, slow: 0 };
  if (!r.medium) r.medium = { answered: 0, correct: 0, slow: 0 };
  if (!r.hard)   r.hard   = { answered: 0, correct: 0, slow: 0 };
  if (!r.daysPracticed) r.daysPracticed = [];

  // Check if topic is currently mastered
  const mastered = isTopicMastered(r, subject, category);

  // ── Update counters ──────────────────────────────────────────
  r.answered++;
  r[diff].answered++;

  if (isCorrect) {
    r.correct++;
    r[diff].correct++;

    // Slow penalty — not for GK
    const applySlowPenalty = SUBJECT_CONFIG[subject]?.speedPenalty && isLate;
    if (applySlowPenalty) {
      r.slow++;
      r[diff].slow++;
    }

    r.streak++;
    r.lastWrong = 0;

    // Promotion thresholds:
    // Easy → Medium: 5 correct in a row
    // Medium → Hard: 3 correct in a row
    // Mastered topic returning from demotion: 3 correct → back to Hard
    const promoteAt = r.diffLevel === 0
      ? 5   // Easy → Medium always needs 5
      : 3;  // Medium → Hard needs 3 (also mastered Medium → Hard)

    if (r.streak >= promoteAt && r.diffLevel < 2) {
      r.diffLevel++;
      r.streak = 0;
    }

  } else {
    r.streak    = 0;
    r.lastWrong++;

    // Demotion:
    // Mastered topic: 1 wrong → demote immediately
    // Unmastered topic: 2 wrong → demote
    const demoteAt = mastered ? 1 : 2;

    if (r.lastWrong >= demoteAt && r.diffLevel > 0) {
      r.diffLevel--;
      r.lastWrong = 0;
    }
  }

  // ── Track days practiced ─────────────────────────────────────
  if (today) {
    const dateStr = typeof today === 'string'
      ? today
      : new Date(today).toDateString();
    if (!r.daysPracticed.includes(dateStr)) {
      r.daysPracticed = [...r.daysPracticed, dateStr];
    }
  }

  return r;
}

// ─── SESSION END MESSAGE ────────────────────────────────────────────────────
// Always positive — student sees strengths only

export function sessionEndMessage(topicRecords, subject, count) {
  const recs = Object.entries(topicRecords)
    .filter(([k]) => k.startsWith(subject + '_'))
    .map(([k, r]) => {
      const parts = k.replace(subject + '_', '').split('_');
      const topic = parts.slice(1).join('_');
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

// ─── STRENGTH SUMMARY (student view — positives only) ──────────────────────

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

// ─── FULL TOPIC BREAKDOWN (parent/teacher view) ─────────────────────────────
// Groups by level · Shows mastery status · Per-difficulty scores

export function fullTopicBreakdown(topicRecords, subject) {
  const tl        = t => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const levelName = l => ({ '6': 'Grade VI', '7': 'Grade VII', '8': 'Grade VIII' }[l] || l);

  return Object.entries(topicRecords)
    .filter(([k]) => k.startsWith(subject + '_'))
    .map(([k, r]) => {
      const parts    = k.replace(subject + '_', '').split('_');
      const level    = parts[0];
      const topic    = parts.slice(1).join('_');
      const score    = topicScore(r);
      const mastered = isTopicMastered(r, subject, '');

      return {
        level,
        levelLabel:    levelName(level),
        topic,
        label:         tl(topic),
        answered:      r.answered,
        correct:       r.correct,
        score,
        diffLevel:     r.diffLevel,
        mastered,
        needsWork:     (score || 100) < 60,
        easyScore:     diffScore(r, 'easy'),
        mediumScore:   diffScore(r, 'medium'),
        hardScore:     diffScore(r, 'hard'),
        daysPracticed: (r.daysPracticed || []).length,
      };
    })
    .sort((a, b) => {
      if (a.level !== b.level) return a.level.localeCompare(b.level);
      return (a.score || 0) - (b.score || 0);
    });
}

// ─── DAILY STREAK ───────────────────────────────────────────────────────────
// Returns updated streak count based on last practice date

export function calculateStreak(currentStreak, lastPracticeDate) {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (!lastPracticeDate)           return 1;  // first ever session
  if (lastPracticeDate === today)  return currentStreak; // already practiced today
  if (lastPracticeDate === yesterday) return currentStreak + 1; // streak continues
  return 1; // missed a day — reset
}

// ─── GUEST LIMITS ───────────────────────────────────────────────────────────
export const GUEST_PER_SUBJECT = 10;
export const GUEST_TOTAL       = 36;

export function guestLimitReachedForSubject(guestCounts, subject) {
  const total = Object.values(guestCounts).reduce((a, b) => a + b, 0);
  if (total >= GUEST_TOTAL)                        return true;
  if ((guestCounts[subject] || 0) >= GUEST_PER_SUBJECT) return true;
  return false;
}
