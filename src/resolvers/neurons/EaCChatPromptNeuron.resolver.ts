import { SynapticNeuronResolver } from '../SynapticNeuronResolver.ts';
import { SynapticResolverConfiguration } from '../SynapticResolverConfiguration.ts';
import { EaCChatPromptNeuron } from '../../eac/neurons/EaCChatPromptNeuron.ts';
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  mergeWithArrays,
  MessagesPlaceholder,
  RunnableLambda,
} from '../../src.deps.ts';
import { EaCPersonalityDetails } from '../../eac/EaCPersonalityDetails.ts';

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: 'neuron',
  Name: 'ChatPrompt',
};

type BankKey = 'PreludeMessages' | 'Messages' | 'NewMessages' | 'PostMessages';
const DEFAULT_ORDER: BankKey[] = [
  'PreludeMessages',
  'Messages',
  'NewMessages',
  'PostMessages',
];

export default {
  async Resolve(_neuronLookup, neuron, ioc) {
    const iocPersonality: EaCPersonalityDetails = neuron.PersonalityLookup
      ? await ioc.Resolve<EaCPersonalityDetails>(
          ioc.Symbol('Personality'),
          neuron.PersonalityLookup
        )
      : ({} as EaCPersonalityDetails);

    return RunnableLambda.from((_, cfg) => {
      const personalityCfg = cfg.configurable?.personality ?? {};

      const personality = mergeWithArrays<EaCPersonalityDetails>(
        iocPersonality,
        personalityCfg,
        {
          SystemMessages: neuron.SystemMessage ? [neuron.SystemMessage] : [],
          Instructions: neuron.Instructions ?? [],
          PreludeMessages: neuron.PreludeMessages ?? [],
          Messages: neuron.Messages ?? [],
          NewMessages: neuron.NewMessages ?? [],
          PostMessages: neuron.PostMessages ?? [],
        } as Partial<EaCPersonalityDetails>
      );

      const messages: BaseMessagePromptTemplateLike[] =
        buildMessagesFromPersonality(personality) ?? [];

      // const prevLlmPatch = cfg.configurable!.llmPatch ?? {};

      // const llmPatch = stripUndefined({
      //   temperature: personality.Temperature,
      //   topP: personality.TopP,
      //   frequencyPenalty: personality.FrequencyPenalty,
      //   presencePenalty: personality.PresencePenalty,
      //   maxTokens: personality.MaxTokens,
      //   stop: personality.Stop,
      // });

      // cfg.configurable!.llmPatch = mergeWithArrays(prevLlmPatch, llmPatch);

      return { Messages: messages };
    }).pipe(
      ChatPromptTemplate.fromMessages([new MessagesPlaceholder('Messages')])
    );
  },
} as SynapticNeuronResolver<EaCChatPromptNeuron>;

export function buildMessagesFromPersonality(
  personality: EaCPersonalityDetails
): BaseMessagePromptTemplateLike[] {
  const messages: BaseMessagePromptTemplateLike[] = [];

  // Assemble the system block if present
  if (
    personality.SystemMessages?.length ||
    personality.Instructions?.length ||
    personality.Audience ||
    personality.Locale ||
    personality.OutputFormat
  ) {
    const parts: string[] = [];

    if (personality.SystemMessages?.length) {
      parts.push(personality.SystemMessages.join('\n'));
    }

    if (personality.Instructions?.length) {
      parts.push(personality.Instructions.join('\n\n'));
    }

    const hintBits: string[] = [];

    if (personality.Audience) {
      hintBits.push(`Audience: ${personality.Audience}`);
    }

    if (personality.Locale) {
      hintBits.push(`Locale: ${personality.Locale}`);
    }

    if (personality.OutputFormat) {
      hintBits.push(`Output: ${personality.OutputFormat}`);
    }

    if (hintBits.length) {
      parts.push(hintBits.join(' | '));
    }

    messages.push(['system', parts.join('\n\n')]);
  }

  // Order banks and push messages
  const order: BankKey[] = DEFAULT_ORDER;
  // personality.MessageOrder?.filter((k): k is BankKey =>
  //   DEFAULT_ORDER.includes(k as BankKey)
  // ) ?? DEFAULT_ORDER;

  const pushBank = (
    out: BaseMessagePromptTemplateLike[],
    bank?: BaseMessagePromptTemplateLike[]
  ) => {
    bank?.forEach((m) => out.push(normalizeMessage(m)));
  };

  for (const key of order) {
    pushBank(messages, personality[key]);
  }

  return messages;
}

function normalizeMessage(
  msg: BaseMessagePromptTemplateLike
): BaseMessagePromptTemplateLike {
  if (Array.isArray(msg) && typeof msg[0] === 'string') {
    const role = msg[0] === 'ai' ? 'assistant' : msg[0];
    return [role, String(msg[1])];
  }
  if (msg && typeof msg === 'object' && 'role' in msg) {
    const o = msg;
    const role = o.role === 'ai' ? 'assistant' : o.role;
    return {
      ...o,
      role,
      content: o.content.toString(),
    } as BaseMessagePromptTemplateLike;
  }
  return msg;
}

function stripUndefined<T extends Record<string, unknown>>(o: T): Partial<T> {
  const r: Partial<T> = {};
  for (const k in o) if (o[k] !== undefined) r[k] = o[k];
  return r;
}

// 2) Merge neuron-provided overrides/additions (arrays stack)
// personality = mergeWithArrays(personality, personalityCfg, {
//   SystemMessages: neuron.SystemMessage ? [neuron.SystemMessage] : [],
//   Instructions: neuron.Instructions ?? [],
//   PreludeMessages: neuron.PreludeMessages ?? [],
//   Messages: neuron.Messages ?? [],
//   NewMessages: neuron.NewMessages ?? [],
//   PostMessages: neuron.PostMessages ?? [],
// } as Partial<EaCPersonalityDetails>);

// // 3) System block (SystemMessages + Instructions [+ compact hints])
// if (
//   personality.SystemMessages?.length ||
//   personality.Instructions?.length ||
//   personality.Audience ||
//   personality.Locale ||
//   personality.OutputFormat
// ) {
//   const parts: string[] = [];
//   if (personality.SystemMessages?.length) {
//     parts.push(personality.SystemMessages.join('\n'));
//   }
//   if (personality.Instructions?.length) {
//     parts.push(personality.Instructions.join('\n\n'));
//   }
//   const hintBits: string[] = [];
//   if (personality.Audience)
//     hintBits.push(`Audience: ${personality.Audience}`);
//   if (personality.Locale) hintBits.push(`Locale: ${personality.Locale}`);
//   if (personality.OutputFormat)
//     hintBits.push(`Output: ${personality.OutputFormat}`);
//   if (hintBits.length) parts.push(hintBits.join(' | '));

//   messages.push(['system', parts.join('\n\n')]);
// }

// // 4) Determine bank order
// const order: BankKey[] =
//   personality.MessageOrder?.filter((k): k is BankKey =>
//     (DEFAULT_ORDER as readonly string[]).includes(k)
//   ) ?? DEFAULT_ORDER;

// // 5) Emit banks in order (tool-role allowed in any bank)
// for (const key of order) {
//   pushBank(messages, personality[key]);
// }

// // 6) Build ChatPromptTemplate
// const base = ChatPromptTemplate.fromMessages(messages);
