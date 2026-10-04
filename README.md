# test-g2p

[![Coverage](https://img.shields.io/badge/coverage-79.3%25-blue)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A lightweight, rule-based English Grapheme-to-Phoneme (G2P) converter built as a single-page web application. Designed for educational and research purposes.

## Overview

`test-g2p` implements a deterministic G2P system using pattern-matching rules. Unlike neural approaches, this project prioritizes **transparency**, **speed**, and **ease of customization**. The rule set is automatically generated from the [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) using a greedy pattern-matching algorithm.

### Features

- **Pure client-side**: No server required — runs entirely in the browser
- **Deterministic**: Same input always produces the same output
- **Transparent**: Visual rule logs show exactly which rules matched for each word
- **Customizable**: Edit `rules.txt` and `stress.txt` to tweak behavior
- **Zero dependencies**: Vanilla HTML, CSS, and JavaScript

## Live Demo

Try the converter at: [devs0323010.github.io/test-g2p](https://devs0323010.github.io/test-g2p/)

> **Note:** The converter applies two additional transformations not present in the ruleset files:
> - **Flap T weakening**: `/t/` becomes a flap `[t̬]` between vowels (e.g., "butter" → `[b'ʌt̬ɝ]`)
> - **ER+r insertion**: An `/r/` sound is inserted between "ER" and following vowels

## Quick Example

| Input | Output (IPA) |
|-------|-------------|
| `hello` | `/hɛl'oʊ/` |
| `through` | `/θr'u/` |
| `persist` | `/pɝs'ɪst/` |

## Project Structure

```
├── index.html          # Web demo entry point
├── script.js           # Core G2P logic (rule parser, stress calculator, IPA renderer)
├── rules.txt           # Grapheme-to-phoneme pronunciation rules
├── stress.txt          # Primary stress scoring rules
├── LICENSE             # MIT License
└── README.md           # This file
```

## Ruleset Reference

### `rules.txt` — Pronunciation Rules

Determines how letter sequences are transcribed into phonemes. Rules are **tab-separated** and evaluated **top-to-bottom** (first match wins).

**Format:**
```text
<prefix>\t<target>\t<suffix>\t<transcription>
```

**Fields:**

| Field | Description | Pattern |
|-------|-------------|---------|
| `prefix` | Context before target. Use `^` for word start, `'` for word end. Empty = no constraint. | `[a-z'\^]*` |
| `target` | The letter sequence to transcribe. | `[a-z']*` |
| `suffix` | Context after target. Empty = no constraint. | `[a-z']*` |
| `transcription` | Output phoneme (see [Phoneme Mapping](#phoneme-mapping)). Use `!` for silent letters. | `{phoneme}\|!` |

**Example:**
```text
	ough	t	4
```
Matches `ough` followed by `t` in words like "b**ough**t" or "th**ough**t", transcribing as `/ɔ/` (ARPABET: `AO`). The empty prefix means the pattern can appear anywhere in the word.

### `stress.txt` — Stress Scoring

Determines which syllable receives primary stress using a scoring system.

#### Headers

The header defines two configuration lines:

- **`TAIL`** — Followed by integers `a_1, a_2, ..., a_n`. Each `a_i` adds an offset to the score of the `i`th-to-last vowel.
- **`SKIP`** — Followed by suffix strings. If a word ends with any of these, the suffix is excluded from syllable counting.

#### Stress Rules

**Format:**
```text
<prefix>\t<target>\t<suffix>\t<score>
```

**Fields:**

| Field | Description | Pattern |
|-------|-------------|---------|
| `prefix` | Phoneme context before target. Use `^` for word start. Empty = no constraint. | `\^?{phoneme}` |
| `target` | The vowel phoneme to evaluate. | `[a-z']*` |
| `suffix` | Phoneme context after target. Use `'` for word end. Empty = no constraint. | `{phoneme}'?` |
| `score` | Score adjustment for this vowel. | `-?\d+` |

**Priority:** All rules have equal weight. The vowel with the highest total score receives stress. Ties are broken by choosing the leftmost vowel.

**Example:**
```text
	R	sIst	-130
```
Reduces the stress score for `/ɝ/` in words like "p**ersist**ence" (pronunciation: `/pɝsɪst/`), preventing it from being stressed.

## Phoneme Mapping

The project uses a simplified, case-sensitive ASCII encoding for phonemes. Uppercase letters typically denote distinct phonemes or diphthongs.

| ASCII | ARPABET | IPA | Notes |
|-------|---------|-----|-------|
| `A` | AA | ɑ | Vowel in "cot" |
| `@` | AE | æ | |
| `X` | AH | ʌ | |
| `?` | AX | ə | Schwa |
| `4` | AO | ɔ | Vowel in "caught" |
| `#` | AW | aʊ | |
| `9` | AY | aɪ | |
| `E` | EH | ɛ | |
| `R` | ER | ɝ | R-colored vowel |
| `8` | EY | eɪ | |
| `I` | IH | ɪ | |
| `Y` | IY | i | Long "e" |
| `O` | OW | oʊ | |
| `/` | OY | ɔɪ | |
| `U` | UH | ʊ | |
| `W` | UW | u | |
| `b` | B | b | |
| `c` | CH | tʃ | |
| `d` | D | d | |
| `D` | DH | ð | Voiced "th" |
| `f` | F | f | |
| `g` | G | g | |
| `h` | HH | h | |
| `j` | JH | dʒ | |
| `k` | K | k | |
| `l` | L | l | |
| `m` | M | m | |
| `n` | N | n | |
| `N` | NG | ŋ | |
| `p` | P | p | |
| `r` | R | r | |
| `s` | S | s | |
| `S` | SH | ʃ | |
| `t` | T | t | |
| `T` | TH | θ | Unvoiced "th" |
| `v` | V | v | |
| `w` | W | w | |
| `y` | Y | j | Yod |
| `z` | Z | z | |
| `Z` | ZH | ʒ | Voiced "sh" |

**Special Characters:**

| ASCII | Meaning |
|-------|---------|
| `!` | Silent letter |
| `'` | Word boundary / apostrophe |
| `^` | Word start |

## How It Works

1. **Data Source**: The CMU Pronouncing Dictionary provides word-to-phoneme alignments for training.
2. **Rule Generation**: A greedy algorithm extracts recurring grapheme-to-phoneme mappings with contextual constraints (prefix/suffix).
3. **Pronunciation**: The parser reads `rules.txt` top-to-bottom, applies the first matching rule to each character sequence, and produces a phoneme string.
4. **Stress Assignment**: The scoring system in `stress.txt` evaluates each vowel, adding offsets based on position and surrounding phonemes. The highest-scoring vowel receives primary stress.
5. **Post-processing**: Two transformations are applied after rule matching — flap T weakening and ER+r insertion — implemented directly in `script.js`.

## Limitations

- **Rule-based**: May struggle with proper nouns, loanwords, or irregular pronunciations not covered in the CMU dictionary.
- **Deterministic**: No statistical smoothing or language modeling; edge cases require manual rule tuning.
- **English-only**: Optimized for General American English pronunciation.
- **Coverage**: Current coverage is approximately 79% (measured against the rule parser). Training code is not yet included.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for:

- Rule improvements or edge-case fixes
- Documentation updates
- Bug reports or feature requests

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) — Training data source
- ARPABET & IPA standards — Phonetic reference
