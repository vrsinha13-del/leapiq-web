// src/lib/engine.js
// PRIMR — Complete Adaptive Engine v3
// Key design:
// - Correctly answered questions are NEVER shown again
// - Incorrectly answered questions shown again after 10 other questions in same topic
// - Topic weight based on unanswered question count
// - Adaptive threshold: 200 questions per subject

// ─── SUBJECT CONFIGURATION ─────────────────────────────────────────────────
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
    promote: { easy: 3, medium: 2 },
    demote:  { unmastered: 3, mastered: 2 },
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
    promote: { easy: 3, medium: 2 },
    demote:  { unmastered: 3, mastered: 2 },
  },
  english: {
    timers: {
      grammar:          { easy: 60,  medium: 120, hard: 240 },
      vocabulary:       { easy: 60,  medium: 120, hard: 240 },
      comprehension:    { easy: 120, medium: 180, hard: 300 },
      verbal_reasoning: { easy: 90,  medium: 150, hard: 300 },
    },
    masteryTime: {
      grammar:          { easy: 45,  medium: 90,  hard: 180 },
      vocabulary:       { easy: 45,  medium: 90,  hard: 180 },
      comprehension:    { easy: 90,  medium: 135, hard: 225 },
      verbal_reasoning: { easy: 60,  medium: 110, hard: 210 },
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
    promote: { easy: 3, medium: 2 },
    demote:  { unmastered: 3, mastered: 2 },
  },
  gk: {
    timers:       { easy: 30, medium: 45, hard: 60 },
    masteryTime:  null,
    speedPenalty: false,
    mastery: {
      easy:   { minQ: 80,  minAcc: 85, minDays: 5 },
      medium: { minQ: 50,  minAcc: 80, minDays: 5 },
      hard:   { minQ: 25,  minAcc: 75, minDays: 5 },
    },
    promote: { easy: 3, medium: 2 },
    demote:  { unmastered: 3, mastered: 2 },
  },
};

export const DIFF_LABEL = ['Easy', 'Medium', 'Hard'];

// ─── THRESHOLDS ─────────────────────────────────────────────────────────────
export const ADAPTIVE_THRESHOLD = 200; // questions per subject before adaptive kicks in
export const MIN_TOPIC_ANSWERS  = 5;   // min answers per topic before adaptive scoring
export const WRONG_RETRY_AFTER  = 10;  // show wrong answer again after N other questions in topic

// ─── GET TIMER ──────────────────────────────────────────────────────────────
export function getTimers(subject, category, difficulty) {
  const cfg  = SUBJECT_CONFIG[subject];
  if (!cfg) return { shown: 60, mastery: 45 };
  const diff = difficulty?.toLowerCase() || 'easy';

  if (subject === 'english') {
    const cat     = category?.toLowerCase().replace(/\s+/g, '_') || 'grammar';
    const shown   = cfg.timers[cat]?.[diff]      ?? cfg.timers.grammar[diff];
    const mastery = cfg.masteryTime[cat]?.[diff]  ?? cfg.masteryTime.grammar[diff];
    return { shown, mastery };
  }

  return {
    shown:   cfg.timers[diff]        ?? 60,
    mastery: cfg.masteryTime?.[diff] ?? null,
  };
}

// ─── GET MASTERY CRITERIA ───────────────────────────────────────────────────
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
export function emptyTopicRecord() {
  return {
    answered:      0,
    correct:       0,
    slow:          0,
    lastWrong:     0,
    diffLevel:     0,
    easy:          { answered: 0, correct: 0, slow: 0 },
    medium:        { answered: 0, correct: 0, slow: 0 },
    hard:          { answered: 0, correct: 0, slow: 0 },
    daysPracticed: [],
  };
}

// ─── TOPIC SCORE ────────────────────────────────────────────────────────────
export function topicScore(r) {
  if (!r || r.answered < 3) return null;
  const eff = (r.correct - r.slow) + (r.slow * 0.7);
  return Math.round((eff / r.answered) * 100);
}

export function diffScore(r, diff) {
  const d = r?.[diff];
  if (!d || d.answered < 3) return null;
  const eff = (d.correct - d.slow) + (d.slow * 0.7);
  return Math.round((eff / d.answered) * 100);
}

// ─── TOPIC WEIGHT ───────────────────────────────────────────────────────────
// Phase 1 (< 200 questions): Coverage — prioritise unseen topics
// Phase 2 (>= 200 questions): Adaptive — prioritise weak topics
export function topicWeight(r, totalSubjectAnswered, freshQuestionCount) {
  // If no fresh questions left in this topic — very low weight
  if (freshQuestionCount === 0) return 0.1;

  if (totalSubjectAnswered < ADAPTIVE_THRESHOLD) {
    // Never seen → highest priority
    if (!r || r.answered === 0) return 4;

    // At Medium or Hard level — keep higher weight so student progresses
    if (r.diffLevel > 0) return 2.5;

    // At Easy level — reduce weight as more answered
    if (r.answered < 3)  return 2;
    if (r.answered < 6)  return 1;
    return 0.5;
  }

  // Adaptive phase
  if (!r || r.answered < MIN_TOPIC_ANSWERS) return 1.5;
  const s = topicScore(r);
  if (s === null) return 1.5;
  if (s < 50)    return 3;
  if (s < 70)    return 2;
  if (s < 85)    return 1;
  return 0.5;
}

// ─── IS TOPIC MASTERED ──────────────────────────────────────────────────────
export function isTopicMastered(record, subject, category) {
  if (!record) return false;
  for (const diff of ['easy', 'medium', 'hard']) {
    const criteria = getMasteryCriteria(subject, category, diff);
    const d        = record[diff];
    if (!d || d.answered < criteria.minQ) return false;
    if (SUBJECT_CONFIG[subject]?.speedPenalty && subject !== 'gk') {
      const score = diffScore(record, diff);
      if (score === null || score < criteria.minAcc) return false;
    } else {
      const acc = d.answered > 0 ? Math.round((d.correct / d.answered) * 100) : 0;
      if (acc < criteria.minAcc) return false;
    }
    const days = record.daysPracticed || [];
    if (days.length < criteria.minDays) return false;
  }
  return true;
}

// ─── GET TOPIC LEVEL MIX ───────────────────────────────────────────────────
export function getTopicLevelMix(topicRecords, subject, topic, category) {
  function rec(level)      { return topicRecords[`${subject}_${level}_${topic}`]; }
  function score(level)    { return topicScore(rec(level)) || 0; }
  function mastered(level) { return isTopicMastered(rec(level), subject, category); }

  if (!mastered('6')) return { '6': 1.0, '7': 0.0, '8': 0.0 };

  const l7Score = score('7');
  let l7Share = l7Score < 30 ? 0.20 : l7Score < 70 ? 0.40 : 0.60;

  if (!mastered('7')) {
    return {
      '6': parseFloat((1 - l7Share).toFixed(2)),
      '7': parseFloat(l7Share.toFixed(2)),
      '8': 0.0,
    };
  }

  const l8Score = score('8');
  let l8Share = l8Score < 30 ? 0.20 : l8Score < 70 ? 0.30 : 0.40;
  const remaining = parseFloat((1 - l8Share).toFixed(2));
  const l6Final   = Math.max(0.30, parseFloat((remaining / 2).toFixed(2)));
  const l7Final   = Math.max(0.30, parseFloat((remaining - l6Final).toFixed(2)));

  return { '6': l6Final, '7': l7Final, '8': parseFloat(l8Share.toFixed(2)) };
}

// ─── CHECK TOPIC LEVEL UNLOCK ──────────────────────────────────────────────
export function checkTopicLevelUnlock(topicRecords, subject, topic, category) {
  const levelNames = { '6': 'Grade VI', '7': 'Grade VII', '8': 'Grade VIII' };

  if (isTopicMastered(topicRecords[`${subject}_6_${topic}`], subject, category)) {
    const l7Key = `${subject}_7_${topic}`;
    if (!topicRecords[l7Key] || topicRecords[l7Key].answered === 0) {
      return {
        unlocked: true, topic,
        message: `Amazing! You have mastered ${levelNames['6']} ${topic}! ${levelNames['7']} questions unlocking now! 🚀`,
      };
    }
  }

  if (isTopicMastered(topicRecords[`${subject}_7_${topic}`], subject, category)) {
    const l8Key = `${subject}_8_${topic}`;
    if (!topicRecords[l8Key] || topicRecords[l8Key].answered === 0) {
      return {
        unlocked: true, topic,
        message: `Incredible! You have mastered ${levelNames['7']} ${topic}! ${levelNames['8']} questions unlocking now! 🔥`,
      };
    }
  }

  return { unlocked: false };
}

// ─── SELECT NEXT QUESTION ──────────────────────────────────────────────────
// answeredCorrectly: { questionId: true }  — never show again
// answeredWrongly:   { questionId: count } — show again after WRONG_RETRY_AFTER
// recentTopics:      [topicKey, ...] — last N topics served, for rotation
export function selectNextQuestion(
  allQuestions, topicRecords, totalSubjectAnswered,
  answeredCorrectly, answeredWrongly, subject, recentTopics
) {
  if (!allQuestions.length) return null;

  const aC = answeredCorrectly || {};
  const aW = answeredWrongly   || {};
  const rt = recentTopics      || [];  // last 5 topic keys served

  const today    = new Date().toISOString().split('T')[0];
  const eligible = allQuestions.filter(q => {
    if (subject === 'gk' && !q.is_evergreen && q.expires_at) {
      return q.expires_at >= today;
    }
    return true;
  });

  if (!eligible.length) return null;

  // Group by topic → level → difficulty
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
    const mix      = getTopicLevelMix(topicRecords, subject, topic, category);

    // Pick level based on mix weights
    const rand = Math.random();
    let cumulative  = 0;
    let chosenLevel = '6';
    for (const [level, weight] of Object.entries(mix)) {
      if (weight <= 0) continue;
      cumulative += weight;
      if (rand <= cumulative) { chosenLevel = level; break; }
    }

    const difficulties = levels[chosenLevel];
    if (!difficulties) continue;

    const key     = `${subject}_${chosenLevel}_${topic}`;
    const record  = topicRecords[key] || emptyTopicRecord();
    const isMast  = isTopicMastered(record, subject, category);
    const diffLevel = record.diffLevel || 0;
    const diffKey   = ['easy', 'medium', 'hard'][diffLevel];
    const allDiff   = difficulties[diffKey] || [];

    const topicAnswered = record.answered || 0;

    const freshCandidates = allDiff.filter(q => {
      if (aC[q.id]) return false;
      if (aW[q.id] !== undefined) {
        const wrongCount = aW[q.id];
        const retryAfter = wrongCount + WRONG_RETRY_AFTER;
        return topicAnswered >= retryAfter;
      }
      return true;
    });

    let candidates = freshCandidates;
    if (!candidates.length && diffLevel > 0) {
      const fallback    = ['easy', 'medium', 'hard'][diffLevel - 1];
      const fallbackAll = difficulties[fallback] || [];
      candidates = fallbackAll.filter(q => {
        if (aC[q.id]) return false;
        if (aW[q.id] !== undefined) {
          return topicAnswered >= (aW[q.id] + WRONG_RETRY_AFTER);
        }
        return true;
      });
    }

    if (!candidates.length) {
      candidates = allDiff.filter(q => !aC[q.id]);
    }

    if (!candidates.length) continue;

    // ── TOPIC WEIGHT ──────────────────────────────────────────────
    const freshCount = candidates.length;
    let weight = topicWeight(record, totalSubjectAnswered, freshCount);

    // ── RECENCY PENALTY — rotation enforcement ────────────────────
    // Topic just served (position 0) → skip entirely
    // Topic served 1 question ago    → 10% of normal weight
    // Topic served 2 questions ago   → 30% of normal weight
    // Topic served 3 questions ago   → 60% of normal weight
    // Topic served 4 questions ago   → 80% of normal weight
    // Topic served 5+ questions ago  → full weight
    const recentIndex = rt.indexOf(key);
    if (recentIndex === 0) continue;            // just served — skip
    if (recentIndex === 1) weight *= 0.1;       // 1 ago — almost skip
    if (recentIndex === 2) weight *= 0.3;       // 2 ago — heavily reduced
    if (recentIndex === 3) weight *= 0.6;       // 3 ago — reduced
    if (recentIndex === 4) weight *= 0.8;       // 4 ago — slightly reduced
    // recentIndex === -1 (not recent) or >= 5 → full weight

    const slots = Math.max(1, Math.round(weight * 2));

    for (let i = 0; i < slots; i++) {
      pool.push({ topic, category, candidates, record, key, chosenLevel, isMast });
    }
  }

  // Fallback — if all topics are in recent window (very few topics), ignore recency
  if (!pool.length) {
    for (const [topic, levels] of Object.entries(byTopic)) {
      const category  = levels.category || '';
      const key       = `${subject}_6_${topic}`;
      const record    = topicRecords[key] || emptyTopicRecord();
      const diffLevel = record.diffLevel || 0;
      const diffKey   = ['easy', 'medium', 'hard'][diffLevel];
      const candidates = (levels['6'] || {})[diffKey]?.filter(q => !aC[q.id]) || [];
      if (candidates.length) {
        pool.push({ topic, category, candidates, record, key, chosenLevel: '6', isMast: false });
      }
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
export function updateRecord(record, isCorrect, isLate, difficulty, today, subject, category) {
  const r    = { ...record };
  const diff = (difficulty || 'easy').toLowerCase();

  if (!r.easy)   r.easy   = { answered: 0, correct: 0, slow: 0 };
  if (!r.medium) r.medium = { answered: 0, correct: 0, slow: 0 };
  if (!r.hard)   r.hard   = { answered: 0, correct: 0, slow: 0 };
  if (!r.daysPracticed) r.daysPracticed = [];

  const mastered   = isTopicMastered(r, subject, category);
  const cfg        = SUBJECT_CONFIG[subject];
  const promoteAt  = cfg?.promote || { easy: 5, medium: 3 };
  const demoteAt   = mastered
    ? (cfg?.demote?.mastered   || 1)
    : (cfg?.demote?.unmastered || 2);

  r.answered++;
  r[diff].answered++;

  if (isCorrect) {
    r.correct++;
    r[diff].correct++;
    if (cfg?.speedPenalty && isLate) {
      r.slow = (r.slow || 0) + 1;
      r[diff].slow++;
    }
    r.lastWrong = 0;
    if (r.diffLevel === 0 && r.easy.correct >= promoteAt.easy)     r.diffLevel = 1;
    else if (r.diffLevel === 1 && r.medium.correct >= promoteAt.medium) r.diffLevel = 2;
  } else {
    r.lastWrong = (r.lastWrong || 0) + 1;
    if (r.lastWrong >= demoteAt && r.diffLevel > 0) {
      r.diffLevel--;
      r.lastWrong = 0;
    }
  }

  if (today) {
    const dateStr = typeof today === 'string' ? today : new Date(today).toDateString();
    if (!r.daysPracticed.includes(dateStr)) {
      r.daysPracticed = [...r.daysPracticed, dateStr];
    }
  }

  return r;
}

// ─── SESSION END MESSAGE ────────────────────────────────────────────────────
export function sessionEndMessage(topicRecords, subject, count) {
  if (!count || count === 0) {
    return {
      main: "Come back and practise! 💪",
      hint: "Every question makes you smarter. Start a session and give it your best shot!",
    };
  }

  const recs = Object.entries(topicRecords)
    .filter(([k]) => k.startsWith(subject + '_'))
    .map(([k, r]) => {
      const parts = k.replace(subject + '_', '').split('_');
      const topic = parts.slice(1).join('_');
      return { topic, score: topicScore(r), ans: r.answered };
    })
    .filter(t => t.ans >= 3);

  const mains = [
    `Amazing! ${count} questions today. You are on fire! 🔥`,
    `Fantastic! ${count} questions answered. Keep this up! ⭐`,
    `Brilliant — ${count} questions! Getting better every day! 🚀`,
    `Wow, ${count} questions! Be really proud! 🏆`,
  ];
  const main = mains[Math.floor(Math.random() * mains.length)];

  if (!recs.length) return { main, hint: "Keep going tomorrow — you are building something great!" };

  const tl   = t => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const best = [...recs].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  const weak = [...recs].sort((a, b) => (a.score || 0) - (b.score || 0))[0];

  let hint = '';
  if (best && (best.score || 0) >= 70) {
    hint = `You are doing great in ${tl(best.topic)}! 🌟`;
    if (weak && weak.topic !== best.topic && (weak.score || 0) < 65)
      hint += ` A little more practice in ${tl(weak.topic)} and you will be unstoppable! 💪`;
    else
      hint += ' Come back tomorrow to keep that streak going!';
  } else {
    hint = "You are making great progress! Every question makes you smarter. See you tomorrow! 💪";
  }

  return { main, hint };
}

// ─── STRENGTH SUMMARY ───────────────────────────────────────────────────────
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
  if (!stars.length && !good.length) return "You are making great progress! Keep practising! 💪";
  let msg = '';
  if (stars.length) msg += `⭐ Star at: ${stars.join(', ')}!`;
  if (good.length)  msg += `${stars.length ? ' ' : ''}📈 Coming along: ${good.join(', ')}`;
  return msg;
}

// ─── FULL TOPIC BREAKDOWN ───────────────────────────────────────────────────
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
        level, levelLabel: levelName(level), topic, label: tl(topic),
        answered: r.answered, correct: r.correct, score,
        diffLevel: r.diffLevel, mastered,
        needsWork: (score || 100) < 60,
        easyScore: diffScore(r, 'easy'),
        mediumScore: diffScore(r, 'medium'),
        hardScore: diffScore(r, 'hard'),
        daysPracticed: (r.daysPracticed || []).length,
      };
    })
    .sort((a, b) => {
      if (a.level !== b.level) return a.level.localeCompare(b.level);
      return (a.score || 0) - (b.score || 0);
    });
}

// ─── DAILY STREAK ───────────────────────────────────────────────────────────
export function calculateStreak(currentStreak, lastPracticeDate) {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (!lastPracticeDate)              return 1;
  if (lastPracticeDate === today)     return currentStreak;
  if (lastPracticeDate === yesterday) return currentStreak + 1;
  return 1;
}

// ─── GUEST LIMITS ───────────────────────────────────────────────────────────
export const GUEST_SOFT_LIMIT = 10;
export const GUEST_HARD_LIMIT = 20;

export function guestLimitStatus(guestCounts, subject) {
  const count = guestCounts[subject] || 0;
  if (count >= GUEST_HARD_LIMIT) return 'hard';
  if (count >= GUEST_SOFT_LIMIT) return 'soft';
  return 'ok';
}

export function guestLimitReachedForSubject(guestCounts, subject) {
  return guestLimitStatus(guestCounts, subject) === 'hard';
}

// ═══════════════════════════════════════════════════════════════════════════
// REWARDS SYSTEM — Buddies, Weekly/Monthly Badges, Tournament
// ═══════════════════════════════════════════════════════════════════════════
//
// Design (locked spec):
// - 3 metrics scored weekly per subject: Streak (days practiced), Accuracy,
//   Question Volume — each scored 2-5 stars.
// - The 3 scores sum to 6-15 -> Weekly Badge (3/4/5 stars) -> shown to the
//   student as a Buddy evolution stage (1/2/3), NOT as a number.
// - A month is always treated as exactly 4 "weeks" by day-of-month, so the
//   live weekly buddy and the monthly rollup always agree with each other:
//     Week 1: days 1-7   Week 2: days 8-14
//     Week 3: days 15-21 Week 4: days 22-end (absorbs any extra days)
//   NOTE: this is a day-of-month quartile, not a Mon-Sun calendar week —
//   chosen so "4 weeks per month" always divides evenly per the spec
//   ("keep 4 weeks only, extend first or last week"). Flag for adjustment
//   if true Mon-Sun weeks were intended instead.
// - Monthly total = sum of that month's 4 Weekly Badge star values (12-20)
//   -> shown as a Monthly Title (Tier 1/2/3), NOT as a number.
// - Tournament unlocks at monthly total >= 14 (Tier 2 or 3).
// - Every student starts at Stage 1 / Tier 1 the moment they answer their
//   first question in a subject — nothing is ever fully locked, only
//   "not yet leveled up further" (later stages render greyed out in the UI).

export const SUBJECT_REWARDS = {
  maths: {
    buddy: ['Cub', 'Yearling', 'Bear'],
    icon:  ['🐻', '🐻', '🐻'],
    title: ['Solver', 'Cruncher', 'Mathlete'],
  },
  english: {
    buddy: ['Caterpillar', 'Cocoon', 'Butterfly'],
    icon:  ['🐛', '🐛', '🦋'],
    title: ['Reader', 'Wordsmith', 'Author'],
  },
  reasoning: {
    buddy: ['Kit', 'Pup', 'Fox'],
    icon:  ['🦊', '🦊', '🦊'],
    title: ['Thinker', 'Analyst', 'Cracker'],
  },
  gk: {
    buddy: ['Egg', 'Hatchling', 'Frog'],
    icon:  ['🥚', '🐣', '🐸'],
    title: ['Quizzer', 'Whizkid', 'Wizard'],
  },
};

// ── Star thresholds (per locked spec) ───────────────────────────────────────
function starsForStreak(days) {
  if (days >= 7) return 5;
  if (days >= 5) return 4;
  if (days >= 3) return 3;
  return 2;
}
function starsForAccuracy(pct) {
  if (pct >= 90) return 5;
  if (pct >= 70) return 4;
  if (pct >= 50) return 3;
  return 2;
}
function starsForVolume(count) {
  if (count > 70) return 5;
  if (count > 50) return 4;
  if (count > 30) return 3;
  return 2;
}

// metric-star sum (6-15) -> weekly badge stars (3/4/5)
function weeklyBadgeStars(metricStarSum) {
  if (metricStarSum >= 14) return 5;
  if (metricStarSum >= 11) return 4;
  return 3;
}
export function buddyStageFromWeeklyStars(weeklyStars) {
  return Math.max(1, weeklyStars - 2); // 3->1, 4->2, 5->3
}
export function monthlyTitleTier(monthlyTotal) {
  if (monthlyTotal >= 16) return 3;
  if (monthlyTotal >= 14) return 2;
  return 1; // 12-13
}
export function isTournamentQualified(monthlyTotal) {
  return monthlyTotal >= 14;
}

export function monthWeekIndex(date) {
  const day = date.getDate();
  if (day <= 7)  return 0;
  if (day <= 14) return 1;
  if (day <= 21) return 2;
  return 3;
}
function startOfMonthWeek(date, weekIdx) {
  const y = date.getFullYear(), m = date.getMonth();
  return new Date(y, m, [1, 8, 15, 22][weekIdx]);
}
function endOfMonthWeek(date, weekIdx) {
  const y = date.getFullYear(), m = date.getMonth();
  if (weekIdx < 3) return new Date(y, m, [7, 14, 21][weekIdx], 23, 59, 59);
  return new Date(y, m + 1, 0, 23, 59, 59); // last calendar day of the month
}

function computeSubjectReward(rows, now) {
  const hasAnyAnswer = rows.length > 0;
  const curWeekIdx    = monthWeekIndex(now);
  const weekStart     = startOfMonthWeek(now, curWeekIdx);
  const weekEnd       = endOfMonthWeek(now, curWeekIdx);

  const thisWeekRows  = rows.filter(r => {
    const d = new Date(r.answered_at);
    return d >= weekStart && d <= weekEnd;
  });
  const daysThisWeek     = new Set(thisWeekRows.map(r => new Date(r.answered_at).toDateString())).size;
  const correctThisWeek  = thisWeekRows.filter(r => r.is_correct).length;
  const accuracyThisWeek = thisWeekRows.length > 0 ? Math.round((correctThisWeek / thisWeekRows.length) * 100) : 0;
  const volumeThisWeek   = thisWeekRows.length;

  const streakStars   = starsForStreak(daysThisWeek);
  const accuracyStars = starsForAccuracy(accuracyThisWeek);
  const volumeStars   = starsForVolume(volumeThisWeek);
  const metricStarSum = streakStars + accuracyStars + volumeStars;
  const weeklyStars   = thisWeekRows.length > 0 ? weeklyBadgeStars(metricStarSum) : 3; // floor
  const buddyStage    = hasAnyAnswer ? buddyStageFromWeeklyStars(weeklyStars) : 1;

  // Monthly rollup: sum the 4 month-weeks' badge stars (weeks not yet
  // reached this month don't count; weeks with 0 answers floor at 3).
  let monthlyTotal = 0;
  for (let w = 0; w < 4; w++) {
    const ws = startOfMonthWeek(now, w);
    if (ws > now) continue;
    const we = endOfMonthWeek(now, w);
    const wRows = rows.filter(r => { const d = new Date(r.answered_at); return d >= ws && d <= we; });
    if (wRows.length === 0) { monthlyTotal += 3; continue; }
    const days    = new Set(wRows.map(r => new Date(r.answered_at).toDateString())).size;
    const correct = wRows.filter(r => r.is_correct).length;
    const acc     = Math.round((correct / wRows.length) * 100);
    monthlyTotal += weeklyBadgeStars(starsForStreak(days) + starsForAccuracy(acc) + starsForVolume(wRows.length));
  }
  const titleTier = hasAnyAnswer ? monthlyTitleTier(monthlyTotal) : 1;

  return {
    hasAnyAnswer,
    buddyStage, weeklyStars, metricStarSum,
    daysThisWeek, accuracyThisWeek, volumeThisWeek,
    streakStars, accuracyStars, volumeStars,
    monthlyTotal, titleTier,
    tournamentQualified: isTournamentQualified(monthlyTotal),
  };
}

// Computes reward state for every subject from the student's raw answer rows
// (subject, is_correct, answered_at — as returned by fetchAnsweredHistory's
// .rows). Pure function — safe to call after every answer, not just on login.
export function computeRewardState(rows, now = new Date()) {
  const state = {};
  for (const subject of Object.keys(SUBJECT_REWARDS)) {
    state[subject] = computeSubjectReward(rows.filter(r => r.subject === subject && r.answered_at), now);
  }
  return state;
}

// Friendly, specific nudge — "Just 2 more days and you'll unlock your Frog!"
// Picks whichever gap (streak days / question volume) is closest to closing;
// falls back to an accuracy nudge if streak and volume are already maxed.
export function buddyNudgeMessage(subject, r) {
  const rewards = SUBJECT_REWARDS[subject];
  if (!rewards) return '';
  if (!r || !r.hasAnyAnswer) return `Answer your first question to hatch your ${rewards.buddy[0]}!`;
  if (r.buddyStage >= 3) return `Your ${rewards.buddy[2]} is fully grown this week! 🎉`;

  const nextBuddy = rewards.buddy[r.buddyStage];
  const streakGoal = [3, 5, 7].find(t => t > r.daysThisWeek);
  const volumeGoal = [31, 51, 71].find(t => t > r.volumeThisWeek);
  const daysNeeded = streakGoal ? streakGoal - r.daysThisWeek : 0;
  const qsNeeded   = volumeGoal ? volumeGoal - r.volumeThisWeek : 0;

  const candidates = [];
  if (daysNeeded > 0) candidates.push({ n: daysNeeded, text: `${daysNeeded} more day${daysNeeded > 1 ? 's' : ''} of practice` });
  if (qsNeeded   > 0) candidates.push({ n: qsNeeded,   text: `${qsNeeded} more question${qsNeeded > 1 ? 's' : ''}` });
  if (candidates.length === 0) return `Keep your accuracy up to unlock your ${nextBuddy}! 🌟`;

  candidates.sort((a, b) => a.n - b.n);
  return `Just ${candidates[0].text} and you'll unlock your ${nextBuddy}! 🌟`;
}
