let rules = [];
let stress = [];
let stress_offset = [];
let stress_ignore = [];

// load rules on page load

document.addEventListener("DOMContentLoaded", async () => {
  fetch("rules.txt")
    .then((res) => res.text())
    .then((text) => {
      lines = text.trim().split("\n");
      lines.forEach((line) => {
        rules.push(line.split("\t"));
      });
      document.getElementById("rule-count").textContent =
        "rules.txt - " + rules.length;
    })
    .catch((e) => console.error(e));

  fetch("stress.txt")
    .then((res) => res.text())
    .then((text) => {
      lines = text.trim().split("\n");
      lines.forEach((line) => {
        let split = line.split("\t");
        if (split[0] == "TAIL") {
          stress_offset = split.slice(2);
        } else if (split[0] == "SKIP") {
          stress_ignore = split.slice(2);
        } else {
          stress.push(split);
        }
      });
      document.getElementById("stress-count").textContent =
        "stress.txt - " + stress.length;
    })
    .catch((e) => console.error(e));
});

const lookup = {
  A: "ɑ",
  "@": "æ",
  X: "ʌ",
  4: "ɔ",
  "#": "aʊ",
  9: "aɪ",
  E: "ɛ",
  R: "ɝ",
  8: "eɪ",
  I: "ɪ",
  Y: "i",
  O: "oʊ",
  "/": "ɔɪ",
  U: "ʊ",
  W: "u",
  b: "b",
  c: "tʃ",
  d: "d",
  D: "ð",
  f: "f",
  g: "g",
  h: "h",
  j: "dʒ",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  N: "ŋ",
  p: "p",
  r: "r",
  s: "s",
  S: "ʃ",
  t: "t",
  T: "θ",
  v: "v",
  w: "w",
  y: "j",
  z: "z",
  Z: "ʒ",
  "?": "ə",
  "!": "",
  "'": "'",
  "^": "^"
};

function printRules() {
  rules.forEach((rule) => {
    console.log(rule);
  });
}

function getMatchPositions(str, match) {
  if (!match) return [];
  const positions = [];
  let index = str.indexOf(match);

  while (index !== -1) {
    positions.push(index);
    index = str.indexOf(match, index + 1);
  }
  return positions;
}

function getIPA(pron) {
  let ipa = "";
  for (let i = 0; i < pron.length; i++) {
    const phoneme = pron[i];
    ipa += lookup[phoneme];
  }
  return ipa;
}

function applyRules(word) {
  const trimmed = "^" + word.trim() + "'";
  let letterUsed = [];
  let transcription = [];
  let logs = [];
  for (let i = 0; i < trimmed.length; i++) {
    letterUsed.push(false);
    transcription.push("");
  }
  for (let i = 0; i < rules.length; i++) {
    const match = rules[i][0] + rules[i][1] + rules[i][2];
    const matchLen = rules[i][1].length;
    const matchOffset = rules[i][0].length;
    positions = getMatchPositions(trimmed, match);
    for (let j = 0; j < positions.length; j++) {
      const pos = positions[j] + matchOffset;
      if (letterUsed.slice(pos, pos + matchLen).some(Boolean)) continue;
      transcription[pos] = rules[i][3] == "!" ? "" : rules[i][3];
      logs.push(
        `<code id="midlight">Rule ${String(i).padStart(5, " ")}: </code><i>${positions[j] >= 1 ? " " + trimmed.substring(1, positions[j]) : ""}</i><code id="midlight">${rules[i][0]}</code><u><b id="highlight">${rules[i][1]}</b></u><code id="midlight">${rules[i][2]}</code><i>${positions[j] + match.length <= trimmed.length - 1 ? trimmed.substring(positions[j] + match.length, trimmed.length - 1) + " " : ""}</i><code id="midlight"> &rarr;</code> <code id="highlight">/${getIPA(transcription[pos])}/</code>`,
      );
      for (let k = pos; k < pos + matchLen; k++) letterUsed[k] = true;
    }
  }
  return {
    result: transcription.join(""),
    logs: logs.join("<br>"),
  };
}

function applyStress(pron) {
  const trimmed = "^" + pron + "'";
  const vowels = /(?=A|@|X|4|8|9|E|Y|I|O|U|W|R|#|\/|\?)/g;
  let scores = [];
  let logs = [];
  let offset = pron.length + 1;
  stress_ignore.forEach((item) => {
    if (trimmed.substring(pron.length - item.length + 1) == item + "'")
      offset = Math.min(offset, pron.length - item.length + 1);
  })
  let vowel_cnt = 0;
  for (let i = trimmed.length - 2; i > 0; i--) {
    if (trimmed[i].match(vowels)) {
      let score = Number(vowel_cnt < stress_offset.length ?
        stress_offset[vowel_cnt] :
        stress_offset[stress_offset.length - 1]);
      if (i < offset) vowel_cnt++;
      logs.push(
        `<code id="midlight">         Position:  </code><i>${getIPA(trimmed.substring(1, i))}</i><u><b id="highlight">${getIPA(trimmed[i])}</b></u><i>${getIPA(trimmed.substring(i+1, trimmed.length - 1)) + " "}</i><code id="midlight"> &rarr;</code> <code id="highlight">${score>=0?"+":""}${score}${i >= offset ? "(suffix)" : ""}</code>`,
      );
      for (let j = 0; j < stress.length; j++) {
        const item = stress[j];
        if (item[1] == trimmed[i]) {
          const match = item[0] + item[1] + item[2], start = i - item[0].length, end = i + 1 + item[2].length;
          if (
            trimmed.substring(start, end) == match
          ) {
            logs.push(
              `<code id="midlight">        Rule ${String(j).padStart(4, " ")}: </code><i>${start >= 1 ? " " + getIPA(trimmed.substring(1, start)) : ""}</i><code id="midlight">${getIPA(item[0])}</code><u><b id="highlight">${getIPA(item[1])}</b></u><code id="midlight">${getIPA(item[2])}</code><i>${end <= trimmed.length - 1 ? getIPA(trimmed.substring(end, trimmed.length - 1)) + " " : ""}</i><code id="midlight"> &rarr;</code> <code id="highlight">${item[3]>=0?"+":""}${item[3]}</code>`,
            );
            score += Number(item[3]);
          }
        }
      }
      scores.push(score);
    }
    else
      scores.push(-Infinity)
  }
  scores.reverse();
  // logs.push(`Scores: ${scores}`)
  let max = -Infinity, max_stress = -1;
  for(let i = 0; i < scores.length; i++) {
    if(scores[i] > max){
      max = scores[i];
      max_stress = i;
    }
  }
  let result;
  logs.push("")
  if(max_stress > -1){
    result = getIPA(pron.substring(0, max_stress) + "'" + pron.substring(max_stress));
    logs.push(`<code id="midlight">Stress determined:</code> ${getIPA(pron.substring(0, max_stress))}<b id="highlight">'${getIPA(pron[max_stress])}</b>${getIPA(pron.substring(max_stress+1))} <code id="midlight">(score <b id="highlight">${max>=0?"+":""}${max}</b>)</code>`);
  }
  else{
    result = getIPA(pron);
    logs.push(`<code id="midlight">No vowels for stress!</code>`)
  }
  result = result.replaceAll(/ɝ('?)(?=ɑ|æ|ʌ|ɔ|a|ɛ|ɝ|e|ɪ|i|o|ʊ|u|ə)/g, (_, apostrophe) => `ɝr${apostrophe}`);
  result = result.replaceAll(/'((?:ɑ|æ|ʌ|ɔ|a|ɛ|ɝ|e|ɪ|i|o|ʊ|u|ə)r?)t(?=ɑ|æ|ʌ|ɔ|a|ɛ|ɝ|e|ɪ|i|o|ʊ|u|ə)/g, (_, a, b) => `'${a}t̬`);
  return {
    result: result,
    logs: logs.join("<br>"),
  };
}

function transcribe() {
  const word = document.getElementById("input").value.trim().toLowerCase();
  if (!/^[a-z']+$/.test(word)) {
    document.getElementById("transcription").innerHTML = "Invalid input";
    document.getElementById("logs").innerHTML =
      "<b id='highlight'>Please enter a word with only letters and apostrophes.</b>";
    return;
  }
  const result = applyRules(word);
  const result2 = applyStress(result["result"]);
  document.getElementById("rule-logs").innerHTML = result["logs"];
  document.getElementById("stress-logs").innerHTML = result2["logs"];
  document.getElementById("transcription").innerHTML =
    word + " → /" + result2["result"] + "/";
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("transcribe-btn");
  const input = document.getElementById("input");

  if (btn) {
    btn.addEventListener("click", transcribe);
  }

  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        transcribe();
      }
    });
  }
});
