// EaCPersonalityDetails.ts
import {
  BaseMessagePromptTemplateLike, // type only
  EaCVertexDetails,
  EaCVertexDetailsSchema,
  z,
} from '../src.deps.ts';

/**
 * Supported message roles for prompt construction.
 * Includes OpenAI-style roles plus `tool`. `ai` is treated as an alias of `assistant`.
 */
const RoleSchema = z
  .enum(['system', 'assistant', 'ai', 'user', 'tool'])
  .describe(
    'Message role. `ai` is an alias of `assistant`. `tool` carries tool-call results or tool context.'
  );

/** Tuple form: [role, content] */
const TupleMsgSchema = z
  .tuple([RoleSchema, z.string()])
  .describe('Tuple message: [role, content]. Minimal, library-friendly shape.');

/** Object form for normal roles: { role, content } */
const ObjectMsgSchema = z
  .object({ role: RoleSchema, content: z.string() })
  .strict()
  .describe('Object message: { role, content }. General form for all roles.');

/** Tool message form: { role: 'tool', content, name?, toolCallId? } */
const ToolMsgSchema = z
  .object({
    role: z.literal('tool'),
    content: z.string(),
    name: z.string().optional(),
    toolCallId: z.string().optional(), // OpenAI-style interop; optional
  })
  .strict()
  .describe(
    'Tool message object. Optional `name`/`toolCallId` support OpenAI/LangChain tool flows.'
  );

/**
 * Best-effort runtime validator for BaseMessagePromptTemplateLike.
 * Accepts tuple, object, tool-object, or passthrough for custom formats.
 */
export const BaseMessagePromptTemplateLikeSchema = z
  .union([TupleMsgSchema, ToolMsgSchema, ObjectMsgSchema, z.any()])
  .describe(
    'Union for validating messages accepted by prompt builders. Supports tuples, objects, and tool-object variants.'
  );

export type EaCPersonalityDetails = {
  /** System-level constraints and stance. */
  SystemMessages?: string[];

  /** Short rules the model should follow (style, tone, behavior). */
  Instructions?: string[];

  /** Optional bank inserted after the system+instructions block and before Messages. */
  PreludeMessages?: BaseMessagePromptTemplateLike[];

  /** Initial message set (few-shot/priming) included before normal prompts. */
  Messages?: BaseMessagePromptTemplateLike[];

  /** Messages appended when new context is introduced (incremental updates). */
  NewMessages?: BaseMessagePromptTemplateLike[];

  /** Optional bank appended after all other messages (post-amble/checks). */
  PostMessages?: BaseMessagePromptTemplateLike[];

  /** Language/region hint (e.g., "en-US"). */
  Locale?: string;

  /** Preferred output format hint for downstream renderers. */
  OutputFormat?: 'text' | 'markdown' | 'mdx' | 'json';

  /** Target reader shorthand (e.g., "players", "editors", "exec brief"). */
  Audience?: string;
  
  // /**
  //  * Optional override of message-bank order (system+instructions is always first).
  //  * Supported keys: "PreludeMessages", "Messages", "NewMessages", "PostMessages".
  //  * Tool-role messages can appear inside any bank and will be emitted in-order.
  //  */
  // MessageOrder?: Array<
  //   'PreludeMessages' | 'Messages' | 'NewMessages' | 'PostMessages'
  // >;

  // /** Sampling randomness: 0 precise → 2 very creative. */
  // Temperature?: number;

  // /** Nucleus sampling; use instead of or alongside Temperature (0–1). */
  // TopP?: number;

  // /** Discourage repeating the same tokens (≥0). */
  // FrequencyPenalty?: number;

  // /** Encourage introducing new tokens/ideas (≥0). */
  // PresencePenalty?: number;

  // /** Soft cap on generated tokens per response. */
  // MaxTokens?: number;

  // /** Stop sequences to truncate output when matched. */
  // Stop?: string[];

} & EaCVertexDetails;

/** Zod schema for EaCPersonalityDetails */
export const EaCPersonalityDetailsSchema: z.ZodType<EaCPersonalityDetails> =
  EaCVertexDetailsSchema.extend({
    SystemMessages: z
      .array(z.string())
      .optional()
      .describe('High-priority directives (stance/guardrails).'),

    Instructions: z
      .array(z.string())
      .optional()
      .describe('Short rules the model should follow (style, tone, behavior).'),

    PreludeMessages: z
      .array(BaseMessagePromptTemplateLikeSchema)
      .optional()
      .describe(
        'Messages inserted after the system block and before "Messages".'
      ),

    Messages: z
      .array(BaseMessagePromptTemplateLikeSchema)
      .optional()
      .describe(
        'Seed messages (few-shot/priming) included early in the prompt.'
      ),

    NewMessages: z
      .array(BaseMessagePromptTemplateLikeSchema)
      .optional()
      .describe(
        'Messages injected when new context arrives during an ongoing flow.'
      ),

    PostMessages: z
      .array(BaseMessagePromptTemplateLikeSchema)
      .optional()
      .describe(
        'Messages appended at the end (e.g., checks, rubric, constraints).'
      ),

    Locale: z
      .string()
      .optional()
      .describe('Language/region hint (e.g., "en-US").'),

    OutputFormat: z
      .enum(['text', 'markdown', 'mdx', 'json'])
      .optional()
      .describe('Preferred output format for downstream renderers.'),

    Audience: z
      .string()
      .optional()
      .describe(
        "Target reader shorthand (e.g., 'players', 'editors', 'exec brief')."
      ),
      
    // MessageOrder: z
    //   .array(
    //     z.enum(['PreludeMessages', 'Messages', 'NewMessages', 'PostMessages'])
    //   )
    //   .optional()
    //   .describe(
    //     'Optional override for bank ordering (system+instructions is always first). ' +
    //       'Default: PreludeMessages → Messages → NewMessages → PostMessages. Tool-role messages are allowed in any bank.'
    //   ),

    // Temperature: z
    //   .number()
    //   .min(0)
    //   .max(2)
    //   .optional()
    //   .describe('Randomness: 0 precise → 2 very creative.'),

    // TopP: z
    //   .number()
    //   .min(0)
    //   .max(1)
    //   .optional()
    //   .describe('Nucleus sampling fraction; alternative to Temperature.'),

    // FrequencyPenalty: z
    //   .number()
    //   .min(0)
    //   .optional()
    //   .describe('Discourages repetition.'),

    // PresencePenalty: z
    //   .number()
    //   .min(0)
    //   .optional()
    //   .describe('Encourages introducing new tokens/ideas.'),

    // MaxTokens: z
    //   .number()
    //   .int()
    //   .positive()
    //   .max(512_000)
    //   .optional()
    //   .describe('Soft cap on generated tokens per response.'),

    // Stop: z
    //   .array(z.string().min(1))
    //   .optional()
    //   .describe('Stop sequences that truncate output when matched.'),

  }).describe(
    'Personality payload consumed by prompt builders. ' +
      'The system block is formed from SystemMessages + Instructions; ' +
      'then banks are applied in order: PreludeMessages → Messages → NewMessages → PostMessages. ' +
      'Tool-role messages are permitted inside any bank and will be emitted in sequence. ' +
      // 'Generation knobs (Temperature/TopP, penalties, MaxTokens, Stop) guide sampling; ' +
      'Locale/Audience/OutputFormat hint tone and rendering.'
  );

export function isEaCPersonalityDetails(
  details: unknown
): details is EaCPersonalityDetails {
  return EaCPersonalityDetailsSchema.safeParse(details).success;
}
