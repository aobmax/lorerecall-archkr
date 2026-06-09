# Fork notes

## Injection position (per character → Retrieval → Injection)

**Assembled mode (default):** one combined lore block inserted into the outgoing
message array at `Prompt start` / `Prompt end` / `At depth (from end)` with a
selectable role. No world-book attachment required. The `{{wi_marker}}` macro is
NOT reachable here — it is resolved during prompt assembly, before the block is
placed.

**Native world-info mode:** Lore Recall stops emitting its own block and steers
Lumiverse's own world-info activation — force-activating exactly the entries it
selected and (optionally) disabling the rest of the managed-book candidates. Each
selected entry then lands at **its authored world-info position**, including
**"At Marker" → `{{wi_marker}}`**.

Native mode requires the managed book to be **attached** to the character: the
host only exposes attached/global/chat entries to the world-info interceptor, and
that hook can only enable/disable/force/rewrite existing candidates — it cannot
introduce an entry that isn't already a candidate. Unreachable selections (book
not attached) are reported in the retrieval feed.

### Two setups, both double-injection-free
1. **Entries enabled, book attached** — keep `Disable unselected managed entries`
   ON (default). Unselected managed entries are disabled per turn; selected ones
   are forced. One injection each.
2. **Entries disabled in the lorebook, book attached** — native keyword firing
   can never fire them; Lore Recall re-enables and forces only its picks per
   turn. (The host hands disabled entries to the interceptor as candidates; the
   disabled filter runs later, during activation.)

To place retrieved lore at `{{wi_marker}}`: author the relevant entries (or the
book default) at the **At Marker** position, put `{{wi_marker}}` where you want it
in your preset, switch Injection mode to **Native**, and Lore Recall will force
the relevant ones to activate there each turn.

## Context token budget (per character → Retrieval)

- **0 (Off)** — use the `Context messages` count (this build's behavior).
- **> 0** — read chat history newest-first, count tokens with your model's
  tokenizer (char/4 fallback if no exact tokenizer), and round DOWN to the whole
  messages whose cumulative tokens fit. The latest message is always kept. The
  retrieval feed reports the message count and token total.
