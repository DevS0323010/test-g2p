# test-g2p
[![Coverage](https://img.shields.io/badge/coverage-79.4%25-blue)](#)

A lightweight, rule-based English Grapheme-to-Phoneme (G2P) converter designed for educational and research purposes.

## Overview
`test-g2p` implements a deterministic G2P system using pattern-matching rules. Unlike neural approaches, this project prioritizes transparency, speed, and ease of customization. The rule set is automatically generated from the [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) using pattern matching and greedy selection.

*(Note: Coverage metrics are calculated locally against the rule parser; training code is not yet public.)*

## Usage
### Web Demo
Try the converter live at: [devs0323010.github.io/test-g2p](https://devs0323010.github.io/test-g2p/)

### Local / Custom Implementation
You can integrate the rules into your own project by parsing the `rules.txt` file. Rules follow a tab-separated format:
```text
<prefix>\t<target>\t<suffix>\t<transcription>
```

**Field Specifications:**
| Field | Description | Regex Pattern |
|-------|-------------|---------------|
| `prefix` | Context before the target. Use `^` for word start, `'` for word end/apostrophe. Leave empty for no constraint. | `[a-z'\^]*` |
| `target` | The letter sequence to transcribe. | `[a-z']*` |
| `suffix` | Context after the target. Leave empty for no constraint. | `[a-z']*` |
| `transcription` | Output phoneme using a custom ASCII encoding (see [Phoneme Mapping](#phoneme-mapping)). Use `!` for silent letters. | Any string |

**Rule Priority:** Rules are evaluated **top-to-bottom**. The first matching rule takes precedence, making earlier rules higher priority.

**Example Rule:**
```text
	ough	t	4
```
*Matches words containing `ough` followed by `t` (e.g., "b**ough**t", "th**ough**t") and transcribes them as `/ɔ/` (ARPABET: `AO`). The empty `prefix` field means the pattern can appear anywhere in the word.*

## Phoneme Mapping
The project uses a simplified, case-sensitive ASCII encoding for phonemes to streamline pattern matching. Uppercase letters typically denote distinct phonemes or digraphs.

| ASCII | ARPABET | IPA | Notes |
|-------|---------|-----|-------|
| A     | AA      | ɑ   |       |
| @     | AE      | æ   |       |
| X     | AH      | ʌ   |       |
| ?     | AX      | ə   | Schwa |
| 4     | AO      | ɔ   |       |
| #     | AW      | aʊ  |       |
| 9     | AY      | aɪ  |       |
| E     | EH      | ɛ   |       |
| R     | ER      | ɝ   | R-colored |
| 8     | EY      | eɪ  |       |
| I     | IH      | ɪ   |       |
| Y     | IY      | i   | Long E |
| O     | OW      | oʊ  |       |
| /     | OY      | ɔɪ  |       |
| U     | UH      | ʊ   |       |
| W     | UW      | u   |       |
| b     | B       | b   |       |
| c     | CH      | tʃ  |       |
| d     | D       | d   |       |
| D     | DH      | ð   | Voiced TH |
| f     | F       | f   |       |
| g     | G       | g   |       |
| h     | HH      | h   |       |
| j     | JH      | dʒ  |       |
| k     | K       | k   |       |
| l     | L       | l   |       |
| m     | M       | m   |       |
| n     | N       | n   |       |
| N     | NG      | ŋ   |       |
| p     | P       | p   |       |
| r     | R       | r   |       |
| s     | S       | s   |       |
| S     | SH      | ʃ   |       |
| t     | T       | t   |       |
| T     | TH      | θ   | Unvoiced TH |
| v     | V       | v   |       |
| w     | W       | w   |       |
| y     | Y       | j   | Yod |
| z     | Z       | z   |       |
| Z     | ZH      | ʒ   | Voiced SH |

## How It Works
1. **Data Source**: The CMU Pronouncing Dictionary provides word-to-phoneme alignments.
2. **Rule Generation**: A greedy pattern-matching algorithm extracts recurring grapheme-to-phoneme mappings with contextual constraints (prefix/suffix).
3. **Application**: The parser reads `rules.txt` top-to-bottom, applies the first matching rule to each character sequence, and outputs the final transcription.

## Limitations & Scope
- **Rule-based**: May struggle with proper nouns, loanwords, or highly irregular pronunciations not covered in the CMU dictionary.
- **Deterministic**: No statistical smoothing or language modeling; edge cases require manual rule tuning.
- **Scope**: Designed for educational/research use and English-specific G2P.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for:
- Rule improvements or edge-case fixes
- Documentation updates
- Bug reports or feature requests

## License
This project is licensed under the [MIT License](LICENSE).

## Acknowledgements
- [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) for training data
- ARPABET & IPA standards for phonetic reference
