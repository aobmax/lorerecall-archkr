# Changelog

## 1.1.0-fork — fork of 1.0.0-TESTING

This fork is based on your **installed `1.0.0-TESTING` build** (not the older
public GitHub `0.1.x`), so it preserves all of that version's retrieval work and
only adds new, opt-in capabilities. The extension identifier is unchanged
(`lore_recall`), so it drops in over your existing install and keeps your trees,
per-character configs, and snapshots. New settings have backward-compatible
defaults, so behavior is unchanged until you turn them on.

### Added

- **Context token-budget window** (per character, Retrieval panel). When the new
  `Context token budget` slider is above zero, the extension reads chat history
  newest-first, counts tokens with your model's tokenizer (host token API, with
  a char/4 fallback), and **rounds down** to the whole messages that fit the
  budget before choosing the scope — sizing context by tokens rather than a
  fixed message count. The latest message is always included. At zero, the
  existing `Context messages` count is used.

- **Selectable injection position** (per character, Retrieval panel).
  - *Assembled mode* (default, unchanged behavior): one combined block placed at
    `Prompt start`, `Prompt end`, or `At depth (from end)`, with a selectable role.
  - *Native world-info mode*: force-activates the selected entries through
    Lumiverse's own world-info system so each lands at **its authored position —
    including "At Marker" → the `{{wi_marker}}` macro** — and disables the
    unselected managed-book candidates so native keyword firing can't
    double-inject. Implemented via a `registerWorldInfoInterceptor` (the only
    host hook that runs before assembly and can reach the marker), time-boxed to
    the host's 10s world-info budget. See `FORK_NOTES.md`.

- **CJK / Unicode-aware matching.** `normalizeSearchText` previously stripped
  everything outside `[a-z0-9]`, deleting CJK/Cyrillic/accented terms. It now
  preserves letters/numbers from all scripts, and the tokenizer emits CJK runs
  plus per-glyph/bigram tokens so multi-glyph names (e.g. 苍域) match.

- **Tail-preserving truncation + configurable limit.** Recent-message truncation
  now keeps both ends (so an end-of-turn destination/name survives), and the
  recent-message char cap is the configurable global `Recent message limit`
  (default 6000, matching this build's scene limit).

- **Controller reasoning toggle** (global, Advanced panel). Scope/selection
  controller calls disabled reasoning unconditionally; `Controller reasoning`
  (default off) lets the controller reason when you want higher-quality scope
  picks at some latency cost.

### Notes

- No new permissions: the world-info interceptor uses the existing `generation`
  permission; the token API needs none.
- Local type augmentation added for `registerWorldInfoInterceptor` (absent from
  the pinned `lumiverse-spindle-types@0.4.39`).
- `tsc --noEmit`, `bun run build`, and `bun test` (28 tests: the 17 existing +
  11 fork) all pass.
