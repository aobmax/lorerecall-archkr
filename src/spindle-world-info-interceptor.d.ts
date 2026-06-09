// Local ambient augmentation: the pinned lumiverse-spindle-types@0.4.39 predates
// the World Info Interceptor API, but the host (Lumiverse >= 0.9.0) supports it.
// Types-only; emits no runtime code.
import "lumiverse-spindle-types";

declare module "lumiverse-spindle-types" {
  interface WorldInfoInterceptorEntryDTO {
    id: string;
    world_book_id: string;
    comment: string;
    disabled: boolean;
    constant: boolean;
    extensions: Record<string, unknown>;
    key: string[];
    keysecondary: string[];
    position: number;
    depth: number;
    priority: number;
    probability: number;
    use_probability: boolean;
    content: string;
    automation_id: string | null;
    selective: boolean;
    selective_logic: number;
    match_whole_words: boolean;
    case_sensitive: boolean;
    use_regex: boolean;
    prevent_recursion: boolean;
    exclude_recursion: boolean;
    delay_until_recursion: boolean;
    scan_depth: number | null;
    order_value: number;
  }
  interface WorldInfoInterceptorMessageDTO {
    id: string;
    role: "system" | "user" | "assistant";
    content: string;
    is_user: boolean;
    is_greeting: boolean;
    greeting_index?: number;
    swipe_id: number;
    index_in_chat: number;
  }
  interface WorldInfoInterceptorCtxDTO {
    chatId: string;
    characterId: string;
    userId?: string;
    entries: WorldInfoInterceptorEntryDTO[];
    messages: WorldInfoInterceptorMessageDTO[];
    chatTurn: number;
    chatMetadata: Record<string, unknown>;
  }
  interface WorldInfoInterceptorResultDTO {
    disabled?: string[];
    enabled?: string[];
    forced?: string[];
    mutated?: { id: string; content?: string }[];
  }
  interface SpindleAPI {
    /** Permission: `generation`. Runs before world-info activation; hard 10s budget. */
    registerWorldInfoInterceptor(
      handler: (ctx: WorldInfoInterceptorCtxDTO) => Promise<WorldInfoInterceptorResultDTO | void>,
      priority?: number,
    ): void;
  }
}
