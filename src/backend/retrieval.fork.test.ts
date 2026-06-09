// Fork regression tests — exercise the real shipped functions (via __testing)
// to prove the fork's context-fidelity + token-budget behavior on this base.
//
// Run: bun test

let tokenCounter: (text: string) => Promise<{ total_tokens: number }> = async (text) => ({
  total_tokens: Math.ceil(text.trim().length / 4),
});
(globalThis as unknown as { spindle: unknown }).spindle = {
  log: { warn() {}, info() {}, error() {} },
  tokens: { countText: (text: string) => tokenCounter(text) },
};

import { describe, expect, test } from "bun:test";
import { __testing } from "./retrieval";

const {
  buildRecentConversation,
  truncateConversationMessage,
  normalizeSearchText,
  tokenize,
  extractLatestUserText,
  resolveContextWindow,
  countTextTokens,
} = __testing;

const SCENE = [
  "*i didn't respond to akane's demand.*",
  "`it's chasing.`",
  '"you\'ll get your sword back."',
  "*i looked over my shoulder. 苍域 pulsed once. i pivoted to north toward the falling sun.*",
  '"hang on tight." *qinggong continued.*',
  "`shigure.`",
].join("\n");
const messages = [{ role: "user" as const, content: SCENE }];

describe("tail-preserving truncation", () => {
  test("keeps both ends so the end-of-turn cue survives", () => {
    const out = truncateConversationMessage("A".repeat(60) + " SHIGURE", 40);
    expect(out.length).toBeLessThanOrEqual(40);
    expect(out).toContain("SHIGURE");
    expect(out).toContain("…");
  });

  test("even a tight per-message limit keeps the trailing destination cue", () => {
    // Head-only truncation at a small limit would drop the final 'shigure.'
    const tight = buildRecentConversation(messages, 10, 60);
    expect(/shigure/i.test(tight)).toBe(true);
  });
});

describe("unicode / CJK awareness", () => {
  test("normalizeSearchText preserves CJK instead of deleting it", () => {
    expect(normalizeSearchText("苍域 pulsed")).toContain("苍域");
  });
  test("tokenize emits the run plus single glyphs for CJK", () => {
    const tokens = tokenize("苍域");
    expect(tokens).toContain("苍域");
    expect(tokens).toContain("苍");
    expect(tokens).toContain("域");
  });
  test("latin tokenization still works", () => {
    const tokens = tokenize("Shigure clan north");
    expect(tokens).toContain("shigure");
    expect(tokens).toContain("clan");
    expect(tokens).toContain("north");
  });
});

describe("latest user turn extraction", () => {
  test("returns the most recent user message", () => {
    expect(/shigure/i.test(extractLatestUserText(messages, 6000))).toBe(true);
  });
});

describe("token-budget context window", () => {
  const five = Array.from({ length: 5 }, (_, i) => ({
    role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
    content: "x".repeat(80), // ceil(80/4)+4 = 24 tokens each
  }));
  const cfg = (contextTokenBudget: number, contextMessages = 10) =>
    ({ contextTokenBudget, contextMessages } as unknown as Parameters<typeof resolveContextWindow>[1]);

  test("budget 0 falls back to the message-count setting", async () => {
    const res = await resolveContextWindow(five, cfg(0, 7), "u1", 6000);
    expect(res.budget).toBe(0);
    expect(res.count).toBe(7);
  });
  test("rounds DOWN to the whole messages that fit the budget", async () => {
    const res = await resolveContextWindow(five, cfg(80), "u1", 6000); // 3*24=72 fit, 4th=96 > 80
    expect(res.count).toBe(3);
    expect(res.tokens).toBeLessThanOrEqual(80);
  });
  test("always keeps at least the latest message", async () => {
    const res = await resolveContextWindow(five, cfg(10), "u1", 6000);
    expect(res.count).toBe(1);
  });
  test("system messages are excluded from the window", async () => {
    const withSystem = [{ role: "system" as const, content: "y".repeat(400) }, ...five];
    const res = await resolveContextWindow(withSystem, cfg(80), "u1", 6000);
    expect(res.count).toBe(3);
  });
  test("countTextTokens falls back to char/4 when the tokenizer errors", async () => {
    const prev = tokenCounter;
    tokenCounter = async () => {
      throw new Error("no tokenizer");
    };
    try {
      expect(await countTextTokens("abcdefgh", "u1")).toBe(2); // 8 chars -> ceil(8/4)
    } finally {
      tokenCounter = prev;
    }
  });
});
