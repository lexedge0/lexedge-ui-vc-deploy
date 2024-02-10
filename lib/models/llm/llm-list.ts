import { LLM } from "@/types"
import { ANTHROPIC_LLM_LIST } from "./anthropic-llm-list"
import { OPENAI_LLM_LIST } from "./openai-llm-list"

export const LLM_LIST: LLM[] = [...OPENAI_LLM_LIST, ...ANTHROPIC_LLM_LIST]

export const LLM_LIST_MAP: Record<string, LLM[]> = {
  openai: OPENAI_LLM_LIST,
  anthropic: ANTHROPIC_LLM_LIST
}
