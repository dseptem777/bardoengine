#!/usr/bin/env node
/*
 * centinelas-lint.cjs — deterministic narrative QA linter for Centinelas.
 *
 * READ-ONLY w.r.t. the story: it never edits or recompiles centinelas.ink.
 * It (A) walks the compiled JSON with inkjs to establish reachability, and
 * (B) scans the .ink source text for structural-tag invariants, then
 * cross-references the per-game config. Findings are printed as JSON and
 * a full trace is written to .omc/research/centinelas-trace.json.
 *
 * Invariants encoded (see plan / git history):
 *   1  # next / any tag placed AFTER a divert (dead/misplaced)      [source]
 *   2  # MINIGAME structured syntax + follows a # next line         [source]
 *   3  cumulative var compared with == (hub softlock; use >=)       [source]
 *   4  relationship/stat threshold ladders: every attainable tier   [targeted JSON]
 *   5  minigame knots carry no music:/play_sfx:                     [source]
 *   6  # play_sfx: / # music: well-formed                           [source]
 *   7  SPIDER_START/STOP balance                                    [source; N/A if absent]
 *   8  achievement ids valid (config), reachable, fire once         [JSON + config]
 *   9  cumulative-vs-exclusive stat shape                           [heuristic]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INK_PATH = path.join(ROOT, 'centinelas.ink');
const JSON_PATH = path.join(ROOT, 'src', 'stories', 'centinelas.json');
const CONFIG_PATH = path.join(ROOT, 'src', 'stories', 'centinelas.config.json');
const TRACE_DIR = path.join(ROOT, '.omc', 'research');
const TRACE_PATH = path.join(TRACE_DIR, 'centinelas-trace.json');

function readUtf8(p) {
  let s = fs.readFileSync(p, 'utf-8');
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  return s;
}

const findings = [];
function add(severity, invariant, knot, line, message, repro, patch) {
  findings.push({ severity, invariant, knot, line: line || null, message, repro: repro || null, patch: patch || null });
}

// ---------------------------------------------------------------------------
// Load sources
// ---------------------------------------------------------------------------
const inkText = readUtf8(INK_PATH);
const inkLines = inkText.split(/\r?\n/);
const config = JSON.parse(readUtf8(CONFIG_PATH));
const configAchIds = new Set((config.achievements || []).map((a) => a.id));
const configStats = new Set(Object.keys(config.stats || {}));

// Map each source line to the knot it belongs to.
const knotOfLine = new Array(inkLines.length).fill(null);
const knotStartLine = {};
const knotOrder = [];
{
  let cur = '(root)';
  for (let i = 0; i < inkLines.length; i++) {
    const m = inkLines[i].match(/^\s*===?\s*([A-Za-z0-9_]+)\s*={0,3}\s*$/);
    if (m && /^===/.test(inkLines[i].trim())) {
      cur = m[1];
      if (!(cur in knotStartLine)) { knotStartLine[cur] = i + 1; knotOrder.push(cur); }
    }
    knotOfLine[i] = cur;
  }
}

function prevNonBlank(idx) {
  for (let i = idx - 1; i >= 0; i--) {
    if (inkLines[i].trim() !== '') return { i, text: inkLines[i] };
  }
  return null;
}
function nextNonBlank(idx) {
  for (let i = idx + 1; i < inkLines.length; i++) {
    if (inkLines[i].trim() !== '') return { i, text: inkLines[i] };
  }
  return null;
}

const isStandaloneDivert = (t) => /^->\s+\S+/.test(t.trim()) && !/^->->/.test(t.trim());
const isTagLine = (t) => /^#/.test(t.trim());

// ---------------------------------------------------------------------------
// SOURCE SCAN
// ---------------------------------------------------------------------------

// per-knot audio/minigame grouping for invariant 5
const knotHasMinigame = {};
const knotAudioLines = {}; // knot -> [{line, tag}]
// track whether a "# next" has been seen earlier in the current knot (for invariant 2)
const knotSawNextBeforeLine = {}; // knot -> Set of line numbers where # next appeared

// vars that ever receive a numeric increment/decrement -> "cumulative"
const cumulativeVars = new Set();
for (const ln of inkLines) {
  let m;
  const re = /#\s*stat:([A-Za-z0-9_]+):[+-]\d+/g;
  while ((m = re.exec(ln))) cumulativeVars.add(m[1]);
  const re2 = /~\s*([A-Za-z0-9_]+)\s*([+\-])=?\s*\d+/g; // ~ x += 1 / ~ x = x + 1 (loose)
  while ((m = re2.exec(ln))) cumulativeVars.add(m[1]);
}

// counts of each achievement id and where (for once-only / validity)
const achLines = {}; // id -> [lines]

for (let i = 0; i < inkLines.length; i++) {
  const raw = inkLines[i];
  const t = raw.trim();
  const knot = knotOfLine[i];
  const lineNo = i + 1;

  // --- Invariant 1: tag after a standalone divert (dead/misplaced) ---
  if (isTagLine(t)) {
    const prev = prevNonBlank(i);
    if (prev && isStandaloneDivert(prev.text)) {
      const isNext = /^#\s*next\b/.test(t);
      const sev = isNext ? 'Critical' : 'High';
      add(
        sev,
        1,
        knot,
        lineNo,
        `Tag "${t}" appears after divert "${prev.text.trim()}" (line ${prev.i + 1}). In Ink the divert ends flow, so this tag is dead/misplaced${isNext ? ' — a # next here fires the page-break against the TARGET knot' : ''}.`,
        `knot ${knot}`,
        `Move "${t}" to BEFORE the divert "${prev.text.trim()}".`
      );
    }
  }

  // group audio + minigame per knot (for invariant 5)
  if (/#\s*MINIGAME:/i.test(t) || /#\s*(KEY_MASH|MINIGAME)\b/i.test(t)) knotHasMinigame[knot] = true;
  {
    let gm;
    const gre = /#\s*(play_sfx|music):\s*([^\s#]+)/gi;
    while ((gm = gre.exec(t))) {
      (knotAudioLines[knot] = knotAudioLines[knot] || []).push({ line: lineNo, tag: gm[0].trim() });
    }
  }

  // record # next occurrences per knot (used by invariant 2 ordering)
  if (/^#\s*next\b/.test(t)) {
    (knotSawNextBeforeLine[knot] = knotSawNextBeforeLine[knot] || new Set()).add(lineNo);
  }

  // --- Invariant 2 & 6: MINIGAME + audio tags ---
  if (/#\s*MINIGAME:/i.test(t)) {
    if (!/type=/.test(t)) {
      add('High', 2, knot, lineNo, `MINIGAME tag missing structured "type=" syntax: "${t}".`, `knot ${knot}`,
        `Rewrite as "# MINIGAME: type=<type>, key=..., count=..., timeLimit=..., autostart=true".`);
    }
    // ordering: a "# next" must appear somewhere earlier in the same knot (it may sit
    // before a "{ minigame_result == -1: ... }" re-entry guard, so don't require it on
    // the immediately preceding line).
    const nexts = knotSawNextBeforeLine[knot];
    const hasEarlierNext = nexts && [...nexts].some((n) => n < lineNo);
    if (!hasEarlierNext) {
      add('Medium', 2, knot, lineNo, `MINIGAME tag in knot "${knot}" has no "# next" earlier in the knot — the minigame may fire without a page-break pause.`, `knot ${knot}`,
        `Add a "# next" before the MINIGAME (typically before the re-entry guard).`);
    }
  }

  // collect achievement ids
  let am;
  const are = /#\s*achievement:unlock:([A-Za-z0-9_]+)/g;
  while ((am = are.exec(raw))) {
    (achLines[am[1]] = achLines[am[1]] || []).push(lineNo);
  }

  // --- Invariant 3: cumulative var compared with == <int> (heuristic review) ---
  // Skip "== 0": that is a depletion/floor check (e.g. willpower == 0), not the
  // ascending-counter softlock pattern. Flag "== N" (N>0) on cumulative vars as a
  // REVIEW item — it is only a bug if the value can exceed N or is shadowed by a
  // broader gate above it.
  {
    let cm;
    const cre = /\b([A-Za-z0-9_]+)\s*==\s*([1-9]\d*)\b/g;
    while ((cm = cre.exec(t))) {
      if (cumulativeVars.has(cm[1])) {
        add('Medium', 3, knot, lineNo,
          `Equality on cumulative var "${cm[1]} == ${cm[2]}". Review: if "${cm[1]}" can exceed ${cm[2]}, or a broader gate (e.g. ">= ${cm[2] - 1}") diverts above this, the branch is unreachable / softlocks.`,
          `knot ${knot}`,
          `Prefer ">= ${cm[2]}" and order specific gates before broader ones.`);
      }
    }
  }

  // --- Invariant 6: malformed audio tags ---
  let fm;
  const fre = /#\s*(play_sfx|music):\s*([^\s#]*)/gi;
  while ((fm = fre.exec(t))) {
    if (!fm[2] || fm[2].length === 0) {
      add('Medium', 6, knot, lineNo, `Empty ${fm[1]} tag: "${t}".`, `knot ${knot}`, `Provide an asset name.`);
    }
  }
}

// --- Invariant 3b: shadowed threshold blocks ---
// Pattern: { var >= A: ... -> divert } closely followed by { var == B: } or { var >= B: }
// with B >= A. The first block diverts whenever var >= A, so the later (more specific or
// higher) block is unreachable for those values.
for (let i = 0; i < inkLines.length; i++) {
  const m = inkLines[i].trim().match(/^\{\s*([A-Za-z0-9_]+)\s*>=\s*(\d+)\s*:/);
  if (!m) continue;
  const [, varA, aStr] = m; const A = parseInt(aStr, 10);
  // confirm this block contains a divert before it closes
  let hasDivert = false, j = i + 1;
  for (; j < inkLines.length; j++) {
    const tj = inkLines[j].trim();
    if (tj === '}') break;
    if (isStandaloneDivert(tj)) hasDivert = true;
    if (/^===/.test(tj)) break;
  }
  if (!hasDivert) continue;
  // scan the next few non-blank lines for a sibling block on the same var with B >= A
  let scanned = 0;
  for (let k = j + 1; k < inkLines.length && scanned < 6; k++) {
    const tk = inkLines[k].trim();
    if (tk === '') continue;
    scanned++;
    const mk = tk.match(/^\{\s*([A-Za-z0-9_]+)\s*(==|>=)\s*(\d+)\s*:/);
    if (mk && mk[1] === varA) {
      const B = parseInt(mk[3], 10);
      if (B >= A) {
        add('High', 3, knotOfLine[k], k + 1,
          `Block "{ ${varA} ${mk[2]} ${B}: }" (line ${k + 1}) is shadowed by the earlier "{ ${varA} >= ${A}: ... -> divert }" (line ${i + 1}): whenever ${varA} ${mk[2] === '==' ? '==' : '>='} ${B} the earlier block already diverts, so this branch is UNREACHABLE.`,
          `knot ${knotOfLine[k]}`,
          `Reorder so the specific/higher gate ("${varA} ${mk[2]} ${B}") comes BEFORE the "${varA} >= ${A}" divert, or make the >= gate exclusive (e.g. "${varA} >= ${A} && ${varA} < ${B}").`);
      }
    }
    if (/^===/.test(tk)) break;
  }
}

// --- Invariant 5: audio tags inside minigame knots ---
for (const knot of Object.keys(knotHasMinigame)) {
  const audio = knotAudioLines[knot] || [];
  for (const a of audio) {
    add('Medium', 5, knot, a.line,
      `Minigame knot "${knot}" carries audio tag "${a.tag}". Minigames own their audio space — music:/play_sfx: here can collide with the minigame's own sound.`,
      `knot ${knot}`, `Move "${a.tag}" out of the minigame knot (to the knot before/after).`);
  }
}

// --- Invariant 7: SPIDER balance (N/A if none) ---
const spiderStart = (inkText.match(/SPIDER_START/g) || []).length;
const spiderStop = (inkText.match(/SPIDER_STOP/g) || []).length;
const spiderNote = spiderStart === 0 && spiderStop === 0
  ? 'No SPIDER_START/STOP tags in centinelas.ink — invariant N/A for this story.'
  : `SPIDER_START=${spiderStart}, SPIDER_STOP=${spiderStop}.`;
if (spiderStart !== spiderStop) {
  add('High', 7, null, null, `SPIDER_START/STOP count mismatch: ${spiderStart} starts vs ${spiderStop} stops.`, null,
    `Ensure every SPIDER_START has a matching SPIDER_STOP on all exit paths.`);
}

// --- Invariant 8 (static half): id validity + multi-line (double-unlock) ---
for (const [id, lines] of Object.entries(achLines)) {
  if (!configAchIds.has(id)) {
    add('High', 8, knotOfLine[lines[0] - 1], lines[0],
      `achievement:unlock:${id} is not declared in centinelas.config.json achievements.`,
      null, `Add "${id}" to config achievements, or fix the tag's id.`);
  }
  if (lines.length > 1) {
    add('Low', 8, knotOfLine[lines[0] - 1], lines[0],
      `achievement:unlock:${id} appears on ${lines.length} source lines (${lines.join(', ')}). If two are reachable on one path it double-fires.`,
      null, `Confirm the duplicate unlocks are mutually exclusive branches.`);
  }
}
// config achievements never referenced in ink (orphans)
const inkAchIds = new Set(Object.keys(achLines));
const orphanAch = [...configAchIds].filter((id) => !inkAchIds.has(id));

// ---------------------------------------------------------------------------
// JSON TRAVERSAL (inkjs) — reachability + threshold ladders
// ---------------------------------------------------------------------------
let inkjs;
try { inkjs = require('inkjs'); } catch (e) { inkjs = null; }

const reachedKnots = new Set();
const achievementsFired = new Set();
let beats = 0;
let coverageOk = false;
let storyJson = null; // compiled-from-source JSON, runtime-compatible (NOT the tracked file)
let compileNote = '';

// The tracked src/stories/centinelas.json is inkVersion 21 (produced by inklecate),
// but the installed inkjs runtime is v20 and the inkjs Compiler rejects the source.
// We read the shipped JSON READ-ONLY and override its inkVersion to 20 in memory so
// the v20 runtime will load it (the runtime format is compatible for traversal). The
// tracked file is never modified.
if (inkjs) {
  try {
    const data = JSON.parse(readUtf8(JSON_PATH));
    const origVer = data.inkVersion;
    if (origVer && origVer > 20) data.inkVersion = 20;
    storyJson = JSON.stringify(data);
    compileNote = `loaded shipped centinelas.json (inkVersion ${origVer}) with runtime override to 20; tracked file untouched`;
  } catch (e) {
    compileNote = 'load failed: ' + String(e);
    inkjs = null;
  }
}

function makeStory() {
  const s = new inkjs.Story(storyJson);
  s.onError = () => {}; // swallow non-fatal "ran out of content" on synthetic walks
  return s;
}

function recordKnotFromPath(s) {
  try {
    const p = s.state.currentPathString;
    if (p) reachedKnots.add(String(p).split('.')[0]);
  } catch (e) { /* ignore */ }
}

// Bounded DFS from the start: establishes the set of knots REACHABLE via real choices.
// (Bounded => a knot absent here is "not reached by the bounded walk", not proven dead.)
const seenGlobal = new Set();
function walk(minigameResult) {
  const s = makeStory();
  try { s.variablesState['minigame_result'] = minigameResult; } catch (e) {}
  const MAX_BEATS = 25000;

  function dfs(depth) {
    if (beats > MAX_BEATS || depth > 400) return;
    while (s.canContinue) {
      beats++;
      try { s.Continue(); } catch (e) { return; }
      recordKnotFromPath(s);
      const tags = s.currentTags || [];
      for (const tag of tags) {
        const tt = String(tag).trim();
        const am = tt.match(/^achievement:unlock:([A-Za-z0-9_]+)/);
        if (am) achievementsFired.add(am[1]);
        const im = tt.match(/^input:([A-Za-z0-9_]+)/);
        if (im) { try { s.variablesState[im[1]] = 'x'; } catch (e) {} }
        if (/^minigame:/i.test(tt)) { try { s.variablesState['minigame_result'] = minigameResult; } catch (e) {} }
      }
      if (beats > MAX_BEATS) return;
    }
    const choices = s.currentChoices;
    if (!choices || choices.length === 0) return;
    const sig = (() => { try { return s.state.currentPathString + '|' + choices.length; } catch (e) { return String(beats); } })();
    if (seenGlobal.has(sig)) return;
    seenGlobal.add(sig);
    const snapshot = s.state.toJson();
    for (let i = 0; i < choices.length; i++) {
      s.state.LoadJson(snapshot);
      try { s.ChooseChoiceIndex(i); } catch (e) { continue; }
      dfs(depth + 1);
    }
  }
  try { dfs(0); } catch (e) {}
}

// Direct per-knot probe: jump into EVERY declared knot and run it bounded. This inspects
// all 379 knots regardless of state-gating — the right basis for per-knot tag checks.
const knotProbeErrors = {}; // knot -> error string
const knotEmits = {};       // knot -> { achievements:Set, music:[], sfx:[], next:int }
function probeAllKnots() {
  for (const knot of knotOrder) {
    const s = makeStory();
    let err = null;
    s.onError = (m) => { err = err || String(m); };
    try { s.ChoosePathString(knot, true); } catch (e) { knotProbeErrors[knot] = 'jump:' + String(e); continue; }
    const emit = { achievements: new Set(), music: [], sfx: [], next: 0 };
    let guard = 0;
    while (s.canContinue && guard++ < 120) {
      let txt;
      try { txt = s.Continue(); } catch (e) { err = err || String(e); break; }
      for (const tag of (s.currentTags || [])) {
        const tt = String(tag).trim();
        let m;
        if ((m = tt.match(/^achievement:unlock:([A-Za-z0-9_]+)/))) emit.achievements.add(m[1]);
        else if ((m = tt.match(/^music:(.+)/))) emit.music.push(m[1].trim());
        else if ((m = tt.match(/^play_sfx:(.+)/))) emit.sfx.push(m[1].trim());
        else if (/^next\b/.test(tt)) emit.next++;
        if (/^input:([A-Za-z0-9_]+)/.test(tt)) { const v = tt.match(/^input:([A-Za-z0-9_]+)/)[1]; try { s.variablesState[v] = 'x'; } catch (e) {} }
        if (/^minigame:/i.test(tt)) { try { s.variablesState['minigame_result'] = 1; } catch (e) {} }
      }
      if (s.currentChoices && s.currentChoices.length > 0) { try { s.ChooseChoiceIndex(0); } catch (e) { break; } }
    }
    knotEmits[knot] = { achievements: [...emit.achievements], music: emit.music, sfx: emit.sfx, next: emit.next };
    if (err) knotProbeErrors[knot] = err;
  }
}

// targeted threshold-ladder probe for amistad_abuela (invariant 4)
function probeAbuelaLadder() {
  const out = [];
  for (const val of [0, 1, 2, 3]) {
    const s = makeStory();
    try {
      s.variablesState['inter2_actividad'] = 'abuela';
      s.variablesState['amistad_abuela'] = val;
      s.ChoosePathString('inter2_convergencia', true);
    } catch (e) { out.push({ val, error: String(e) }); continue; }
    let text = '';
    let guard = 0;
    while (s.canContinue && guard++ < 50) {
      try { text += s.Continue(); } catch (e) { break; }
    }
    out.push({ val, text: text.replace(/\s+/g, ' ').trim().slice(0, 120) });
  }
  return out;
}

let abuelaLadder = [];
if (inkjs) {
  try { walk(1); } catch (e) {}
  try { walk(0); } catch (e) {}
  try { probeAllKnots(); } catch (e) {}
  // union achievements emitted by any directly-probed knot (tag-is-wired evidence)
  for (const k of Object.keys(knotEmits)) for (const id of knotEmits[k].achievements) achievementsFired.add(id);
  coverageOk = reachedKnots.size > 5;
  try { abuelaLadder = probeAbuelaLadder(); } catch (e) { abuelaLadder = [{ error: String(e) }]; }

  // tier-distinctness check for the ladder
  const texts = abuelaLadder.filter((x) => x.text).map((x) => x.text);
  const v0 = abuelaLadder.find((x) => x.val === 0);
  const v1 = abuelaLadder.find((x) => x.val === 1);
  const v2 = abuelaLadder.find((x) => x.val === 2);
  if (v0 && v1 && v2 && v0.text && v1.text && v2.text) {
    if (v1.text === v0.text) {
      add('High', 4, 'inter2_convergencia', knotStartLine['inter2_convergencia'] || null,
        `amistad_abuela=1 yields the SAME text as value 0 — the mid-tier ("conforme") is unreachable (value-of-1 gap).`,
        `set amistad_abuela=1, inter2_actividad="abuela" -> inter2_convergencia`,
        `Ensure a ">= 1" gate sits above the rejection branch.`);
    }
    if (v1.text === v2.text) {
      add('High', 4, 'inter2_convergencia', knotStartLine['inter2_convergencia'] || null,
        `amistad_abuela=1 yields the SAME text as value 2 — thresholds collapsed.`, null,
        `Verify the >=2 gate precedes the >=1 gate.`);
    }
  }
} else {
  add('Medium', 0, null, null, 'inkjs not available — JSON traversal skipped; only source-scan findings produced.', null, 'npm i');
}

// achievements declared in ink but not emitted by any probed knot (tag not wired/dead)
const unreachedAch = [...inkAchIds].filter((id) => !achievementsFired.has(id));

// knots not reached by the bounded start-walk (caveat: not proven dead) AND not the root
const unreachedByWalk = knotOrder.filter((k) => !reachedKnots.has(k));

// knots that threw a runtime error when probed directly (real structural problems)
const probeErrorKnots = Object.entries(knotProbeErrors)
  .filter(([k, v]) => !/ran out of content/i.test(v))
  .map(([k, v]) => ({ knot: k, line: knotStartLine[k] || null, error: String(v).slice(0, 160) }));
for (const pe of probeErrorKnots) {
  add('High', 0, pe.knot, pe.line, `Knot "${pe.knot}" throws on direct execution: ${pe.error}`, `-> ${pe.knot}`, `Inspect the knot for malformed flow.`);
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
const sevRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
findings.sort((a, b) => (sevRank[a.severity] - sevRank[b.severity]) || (a.invariant - b.invariant) || ((a.line || 0) - (b.line || 0)));

const summary = {
  generatedAt: new Date().toISOString(),
  coverage: {
    inkjsAvailable: !!inkjs,
    compileNote,
    beats,
    knotsDeclared: knotOrder.length,
    knotsReached: reachedKnots.size,
    coverageOk,
  },
  spiderNote,
  cumulativeVars: [...cumulativeVars],
  abuelaLadder,
  achievements: {
    inConfig: configAchIds.size,
    referencedInInk: inkAchIds.size,
    emittedWhenProbed: achievementsFired.size,
    orphansInConfig: orphanAch,
    referencedButNotEmitted: unreachedAch,
  },
  knotsReachedByStartWalk: reachedKnots.size,
  unreachedByWalkCount: unreachedByWalk.length,
  unreachedByWalk,
  probeErrorKnots,
  findingsBySeverity: {
    Critical: findings.filter((f) => f.severity === 'Critical').length,
    High: findings.filter((f) => f.severity === 'High').length,
    Medium: findings.filter((f) => f.severity === 'Medium').length,
    Low: findings.filter((f) => f.severity === 'Low').length,
  },
  findings,
};

fs.mkdirSync(TRACE_DIR, { recursive: true });
fs.writeFileSync(TRACE_PATH, JSON.stringify({ summary, reachedKnots: [...reachedKnots] }, null, 2));

// compact plain-text summary (ASCII) for easy reading
const L = [];
L.push('=== CENTINELAS LINT SUMMARY ===');
L.push(compileNote);
L.push(`beats=${beats} knotsDeclared=${knotOrder.length} reachedByStartWalk=${reachedKnots.size} unreachedByWalk=${unreachedByWalk.length}`);
L.push(spiderNote);
L.push(`probeErrorKnots=${probeErrorKnots.length}`);
L.push(`cumulativeVars: ${[...cumulativeVars].join(', ')}`);
L.push('--- abuela ladder (invariant 4) ---');
for (const a of abuelaLadder) L.push(`  amistad_abuela=${a.val}: ${a.text || a.error || '(empty)'}`);
L.push('--- achievements ---');
L.push(`  inConfig=${configAchIds.size} referencedInInk=${inkAchIds.size} emittedWhenProbed=${achievementsFired.size}`);
L.push(`  orphansInConfig: ${orphanAch.join(', ') || '(none)'}`);
L.push(`  referencedButNotEmitted: ${unreachedAch.join(', ') || '(none)'}`);
L.push(`--- findings: C=${summary.findingsBySeverity.Critical} H=${summary.findingsBySeverity.High} M=${summary.findingsBySeverity.Medium} L=${summary.findingsBySeverity.Low} ---`);
findings.forEach((f, i) => {
  L.push(`[${i + 1}] ${f.severity} inv#${f.invariant} ${f.knot || '-'}:${f.line || '-'}`);
  L.push(`    ${f.message}`);
  if (f.patch) L.push(`    FIX: ${f.patch}`);
});
fs.writeFileSync(path.join(TRACE_DIR, 'centinelas-lint-summary.txt'), L.join('\n'), 'utf-8');

// compact stdout for the orchestrator
console.log(JSON.stringify({
  coverage: summary.coverage,
  spiderNote,
  abuelaLadder,
  achievements: summary.achievements,
  probeErrorKnots,
  findingsBySeverity: summary.findingsBySeverity,
  findings,
}, null, 2));
