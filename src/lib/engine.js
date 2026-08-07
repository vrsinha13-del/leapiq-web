// src/lib/engine.js
// Leap IQ — Complete Adaptive Engine
// All 4 subjects: Maths, Reasoning, English, GK

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
    promote: { easy: 5, medium: 3 },
    demote:  { unmastered: 2, mastered: 1 },
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
    promote: { easy: 5, medium: 3 },
    demote:  { unmastered: 2, mastered: 1 },
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
    promote: { easy: 5, medium: 3 },
    demote:  { unmastered: 2, mastered: 1 },
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
    promote: { easy: 5, medium: 3 },
    demote:  { unmastered: 2, mastered: 1 },
  },
};

export const DIFF_LABEL = ['Easy', 'Medium', 'Hard'];

// ─── ADAPTIVE THRESHOLD ─────────────────────────────────────────────────────
// Minimum questions per subject before adaptive weighting kicks in
export const ADAPTIVE_THRESHOLD = 200;

// Minimum answers per topic before it gets adaptive scoring
export const MIN_TOPIC_ANSWERS = 5;

// Topic cooldown — how many different topics must be served before
// the same topic can be served again
export const TOPIC_COOLDOWN = 3;

// Per-topic recent questions — how many questions to block per topic
export const RECENT_PER_TOPIC = 4;

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
// Two phases:
// Phase 1 (< 200 questions per subject): Coverage phase
//   - Never served topics get highest weight
//   - Encourages exploring all topics before repeating
// Phase 2 (>= 200 questions per subject): Adaptive phase
//   - Weak topics get higher weight
//   - Strong topics get lower weight
//   - Requires minimum 5 answers per topic for scoring
export function topicWeight(r, totalSubjectAnswered) {
  if (totalSubjectAnswered < ADAPTIVE_THRESHOLD) {
    // ── Phase 1: Coverage phase ──
    if (!r || r.answered === 0) return 2;    // never served → highest priority
    if (r.answered < 5)         return 1;    // served a little → normal
    return 0.5;                              // served enough → lower priority
  }

  // ── Phase 2: Adaptive phase ──
  // Need minimum answers per topic for meaningful score
  if (!r || r.answered < MIN_TOPIC_ANSWERS) return 1.5;

  const s = topicScore(r);
  if (s === null) return 1.5;  // not enough data
  if (s < 50)    return 3;     // weak → 3x more likely
  if (s < 70)    return 2;     // average → 2x more likely
  if (s < 85)    return 1;     // good → normal
  return 0.5;                  // strong → half as likely
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
  let l7Share;
  if (l7Score < 30)      l7Share = 0.20;
  else if (l7Score < 70) l7Share = 0.40;
  else                   l7Share = 0.60;

  if (!mastered('7')) {
    return {
      '6': parseFloat((1 - l7Share).toFixed(2)),
      '7': parseFloat(l7Share.toFixed(2)),
      '8': 0.0,
    };
  }

  const l8Score = score('8');
  let l8Share;
  if (l8Score < 30)      l8Share = 0.20;
  else if (l8Score < 70) l8Share = 0.30;
  else                   l8Share = 0.40;

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
export function checkTopicLevelUnlock(topicRecords, subject, topic, category) {
  const levelNames = { '6': 'Grade VI', '7': 'Grade VII', '8': 'Grade VIII' };

  if (isTopicMastered(topicRecords[`${subject}_6_${topic}`], subject, category)) {
    const l7Key = `${subject}_7_${topic}`;
    if (!topicRecords[l7Key] || topicRecords[l7Key].answered === 0) {
      return {
        unlocked: true, topic,
        from: levelNames['6'], to: levelNames['7'],
        message: `Amazing! You have mastered ${levelNames['6']} ${topic}! ${levelNames['7']} questions unlocking now! 🚀`,
      };
    }
  }

  if (isTopicMastered(topicRecords[`${subject}_7_${topic}`], subject, category)) {
    const l8Key = `${subject}_8_${topic}`;
    if (!topicRecords[l8Key] || topicRecords[l8Key].answered === 0) {
      return {
        unlocked: true, topic,
        from: levelNames['7'], to: levelNames['8'],
        message: `Incredible! You have mastered ${levelNames['7']} ${topic}! ${levelNames['8']} questions unlocking now! 🔥`,
      };
    }
  }

  return { unlocked: false };
}

// ─── SELECT NEXT QUESTION ──────────────────────────────────────────────────
// recentIds is now an OBJECT: { topicKey: [id1, id2, id3, id4] }
// recentTopics is an ARRAY of last 3 topic keys served
export function selectNextQuestion(
  allQuestions, topicRecords, totalSubjectAnswered,
  recentIds, subject, recentTopics
) {
  if (!allQuestions.length) return null;

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

  // Calculate total answered for this subject
  const totalAnswered = totalSubjectAnswered ||
    Object.keys(topicRecords)
      .filter(k => k.startsWith(subject + '_'))
      .reduce((sum, k) => sum + (topicRecords[k]?.answered || 0), 0);

  const pool          = [];
  const recentTopicArr = recentTopics || [];

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

    const key      = `${subject}_${chosenLevel}_${topic}`;
    const record   = topicRecords[key] || emptyTopicRecord();
    const weight   = topicWeight(record, totalAnswered);
    const isMast   = isTopicMastered(record, subject, category);
    const diffLevel = record.diffLevel || 0;
    const diffKey   = ['easy', 'medium', 'hard'][diffLevel];

    // ── FIX 1: Per-topic recentIds ──────────────────────────────
    // Block only the last RECENT_PER_TOPIC questions for THIS topic
    const topicRecentIds = (recentIds && recentIds[key]) || [];
    let candidates = difficulties[diffKey]?.filter(
      q => !topicRecentIds.includes(q.id)
    ) || [];

    // Fallback to easier difficulty if exhausted
    if (!candidates.length && diffLevel > 0) {
      const fallback = ['easy', 'medium', 'hard'][diffLevel - 1];
      candidates = difficulties[fallback]?.filter(
        q => !topicRecentIds.includes(q.id)
      ) || [];
    }

    // Allow repeats only if truly exhausted
    if (!candidates.length) candidates = difficulties[diffKey] || [];
    if (!candidates.length) continue;

    // ── FIX 2: Topic cooldown ────────────────────────────────────
    // If this topic was served in the last TOPIC_COOLDOWN questions,
    // give it 0 slots UNLESS it's the only topic available
    const inCooldown = recentTopicArr.includes(key);

    const slots = inCooldown ? 0 : Math.max(1, Math.round(weight * 2));

    if (slots > 0) {
      for (let i = 0; i < slots; i++) {
        pool.push({ topic, category, candidates, record, key, chosenLevel, isMast });
      }
    }
  }

  // If all topics are in cooldown (edge case with very few topics),
  // fall back to all topics ignoring cooldown
  let finalPool = pool;
  if (!pool.length) {
    for (const [topic, levels] of Object.entries(byTopic)) {
      const category = levels.category || '';
      const mix      = getTopicLevelMix(topicRecords, subject, topic, category);
      const rand     = Math.random();
      let cumulative  = 0;
      let chosenLevel = '6';
      for (const [level, weight] of Object.entries(mix)) {
        if (weight <= 0) continue;
        cumulative += weight;
        if (rand <= cumulative) { chosenLevel = level; break; }
      }
      const difficulties = levels[chosenLevel];
      if (!difficulties) continue;
      const key         = `${subject}_${chosenLevel}_${topic}`;
      const record      = topicRecords[key] || emptyTopicRecord();
      const diffLevel   = record.diffLevel || 0;
      const diffKey     = ['easy', 'medium', 'hard'][diffLevel];
      const candidates  = difficulties[diffKey] || [];
      if (!candidates.length) continue;
      finalPool.push({ topic, category, candidates, record, key, chosenLevel, isMast: false });
    }
  }

  if (!finalPool.length) return null;

  const slot = finalPool[Math.floor(Math.random() * finalPool.length)];
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
// Promotion based on TOTAL correct at difficulty, not streak
// Easy → Medium when easy.correct >= 5 (total, not consecutive)
// Medium → Hard when medium.correct >= 3 (total, not consecutive)
// Demotion still based on consecutive wrong answers

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
    ? (cfg?.demote?.mastered    || 1)
    : (cfg?.demote?.unmastered  || 2);

  r.answered++;
  r[diff].answered++;

  if (isCorrect) {
    r.correct++;
    r[diff].correct++;

    const applySlowPenalty = cfg?.speedPenalty && isLate;
    if (applySlowPenalty) {
      r.slow = (r.slow || 0) + 1;
      r[diff].slow++;
    }

    r.lastWrong = 0;

    // Promotion — total correct at current difficulty
    if (r.diffLevel === 0 && r.easy.correct >= promoteAt.easy) {
      r.diffLevel = 1;
    } else if (r.diffLevel === 1 && r.medium.correct >= promoteAt.medium) {
      r.diffLevel = 2;
    }
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
  // Don't show session end message if no questions answered
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

// ─── STRENGTH SUMMARY (student view) ───────────────────────────────────────
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
    return "You are making great progress! Keep practising! 💪";

  let msg = '';
  if (stars.length) msg += `⭐ Star at: ${stars.join(', ')}!`;
  if (good.length)  msg += `${stars.length ? ' ' : ''}📈 Coming along: ${good.join(', ')}`;
  return msg;
}

// ─── FULL TOPIC BREAKDOWN (parent view) ────────────────────────────────────
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
