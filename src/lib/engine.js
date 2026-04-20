export const DIFF_LABEL = ['Easy', 'Medium', 'Hard'];
export const DIFF_TIME  = [60, 120, 180];

export function emptyTopicRecord() {
  return { answered:0, correct:0, slow:0, streak:0, diffLevel:0, lastWrong:0 };
}

export function topicScore(r) {
  if (!r || r.answered < 3) return null;
  const eff = (r.correct - r.slow) + (r.slow * 0.7);
  return Math.round((eff / r.answered) * 100);
}

export function topicWeight(r, sessCount) {
  if (sessCount < 5) return 1;
  const s = topicScore(r);
  if (s === null) return 1.5;
  if (s < 50) return 3;
  if (s < 70) return 2;
  if (s < 85) return 1;
  return 0.5;
}

export function selectNextQuestion(allQuestions, topicRecords, sessionCount, recentIds, subject) {
  if (!allQuestions.length) return null;
  const byTopic = {};
  for (const q of allQuestions) {
    if (!byTopic[q.topic]) byTopic[q.topic] = { easy:[], medium:[], hard:[] };
    byTopic[q.topic][q.difficulty].push(q);
  }
  const pool = [];
  for (const [topic, difficulties] of Object.entries(byTopic)) {
    const key = `${subject}_${topic}`;
    const record = topicRecords[key] || emptyTopicRecord();
    const weight = topicWeight(record, sessionCount);
    const diffKey = ['easy','medium','hard'][record.diffLevel || 0];
    let candidates = difficulties[diffKey].filter(q => !recentIds.includes(q.id));
    if (!candidates.length && record.diffLevel > 0)
      candidates = difficulties[['easy','medium','hard'][record.diffLevel - 1]].filter(q => !recentIds.includes(q.id));
    if (!candidates.length) candidates = difficulties[diffKey];
    if (!candidates.length) continue;
    const slots = Math.max(1, Math.round(weight * 2));
    for (let i = 0; i < slots; i++) pool.push({ topic, candidates, record, key });
  }
  if (!pool.length) return null;
  const slot = pool[Math.floor(Math.random() * pool.length)];
  const q = slot.candidates[Math.floor(Math.random() * slot.candidates.length)];
  return { question: q, topicKey: slot.key, record: slot.record };
}

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

export function sessionEndMessage(topicRecords, subject, count) {
  const recs = Object.entries(topicRecords)
    .filter(([k]) => k.startsWith(subject + '_'))
    .map(([k,r]) => ({ topic: k.replace(subject+'_',''), score: topicScore(r), ans: r.answered }))
    .filter(t => t.ans >= 3);
  const mains = [
    `Amazing! ${count} questions today. You're on fire! 🔥`,
    `Fantastic! ${count} questions answered. Keep this up! ⭐`,
    `Brilliant — ${count} questions! Getting better every day! 🚀`,
    `Wow, ${count} questions! Be really proud! 🏆`,
  ];
  const main = mains[Math.floor(Math.random() * mains.length)];
  if (!recs.length) return { main, hint: "Keep going tomorrow — you're building something great!" };
  const tl = t => t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const best = [...recs].sort((a,b) => (b.score||0)-(a.score||0))[0];
  const weak = [...recs].sort((a,b) => (a.score||0)-(b.score||0))[0];
  let hint = '';
  if (best && (best.score||0) >= 70) {
    hint = `You're doing great in ${tl(best.topic)}! 🌟`;
    if (weak && weak.topic !== best.topic && (weak.score||0) < 65)
      hint += ` A little more practice in ${tl(weak.topic)} and you'll be unstoppable! 💪`;
    else hint += ' Come back tomorrow to keep that streak going!';
  } else {
    hint = "You're making great progress! Every question makes you smarter. See you tomorrow! 💪";
  }
  return { main, hint };
}

export function strengthSummary(topicRecords, subject) {
  const tl = t => t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const recs = Object.entries(topicRecords)
    .filter(([k]) => k.startsWith(subject+'_'))
    .map(([k,r]) => ({ topic: k.replace(subject+'_',''), score: topicScore(r), ans: r.answered }))
    .filter(t => t.ans >= 3 && t.score !== null)
    .sort((a,b) => b.score - a.score);
  if (!recs.length) return null;
  const stars = recs.filter(r => r.score >= 75).map(r => tl(r.topic));
  const good  = recs.filter(r => r.score >= 55 && r.score < 75).map(r => tl(r.topic));
  if (!stars.length && !good.length) return "You're making great progress! Keep practising! 💪";
  let msg = '';
  if (stars.length) msg += `⭐ Star at: ${stars.join(', ')}!`;
  if (good.length)  msg += `${stars.length ? ' ' : ''}📈 Coming along: ${good.join(', ')}`;
  return msg;
}

export function fullTopicBreakdown(topicRecords, subject) {
  const tl = t => t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  return Object.entries(topicRecords)
    .filter(([k]) => k.startsWith(subject+'_'))
    .map(([k,r]) => ({
      topic: k.replace(subject+'_',''),
      label: tl(k.replace(subject+'_','')),
      answered: r.answered,
      correct: r.correct,
      score: topicScore(r),
      diffLevel: r.diffLevel,
      needsWork: (topicScore(r) || 100) < 60,
    }))
    .sort((a,b) => (a.score||0)-(b.score||0));
}

export const GUEST_PER_SUBJECT = 10;
export const GUEST_TOTAL = 36;

export function guestLimitReachedForSubject(guestCounts, subject) {
  const total = Object.values(guestCounts).reduce((a,b) => a+b, 0);
  if (total >= GUEST_TOTAL) return true;
  if ((guestCounts[subject] || 0) >= GUEST_PER_SUBJECT) return true;
  return false;
}
