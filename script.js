let rules = [];
fetch("rules.txt")
    .then((res) => res.text())
    .then((text) => {
        lines = text.trim().split("\n");
        lines.forEach((line) => {
            rules.push(line.split("\t"));
        })
    })
    .catch((e) => console.error(e));


const lookup = {
    "A": "ɑ",
    "@": "æ",
    "X": "ʌ",
    "4": "ɔ",
    "#": "aʊ",
    "9": "aɪ",
    "E": "ɛ",
    "R": "ɝ",
    "8": "eɪ",
    "I": "ɪ",
    "Y": "i",
    "O": "oʊ",
    "/": "ɔɪ",
    "U": "ʊ",
    "W": "u",
    "b": "b",
    "c": "tʃ",
    "d": "d",
    "D": "ð",
    "f": "f",
    "g": "g",
    "h": "h",
    "j": "dʒ",
    "k": "k",
    "l": "l",
    "m": "m",
    "n": "n",
    "N": "ŋ",
    "p": "p",
    "r": "r",
    "s": "s",
    "S": "ʃ",
    "t": "t",
    "T": "θ",
    "v": "v",
    "w": "w",
    "y": "j",
    "z": "z",
    "Z": "ʒ",
    "?": "ə",
    "!": ""
}

function printRules() {
    rules.forEach((rule) => {
        console.log(rule);
    })
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
    } return ipa;
}

function applyRules(word) {
    const trimmed = "^" + word.trim() + "'";
    let letterUsed = [];
    let transcription = [];
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
            if (letterUsed.slice(pos, pos + matchLen).some(Boolean))
                continue;
            transcription[pos] = getIPA(rules[i][3]);
            for (let k = pos; k < pos + matchLen; k++)
                letterUsed[k] = true;
        }
    }
    return {
        "result": "/" + transcription.join("") + "/",
    };
}
