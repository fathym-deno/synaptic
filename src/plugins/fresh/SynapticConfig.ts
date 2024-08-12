// import { IConversationState } from "../../conversations/IConversationState.ts";
// import { OpenAILLMAccessor } from "../../llms/openai/OpenAILLMAccessor.ts";
// import { PageManager } from "../../pages/PageManager.ts";
// import { PageBlockManager } from "../../pages/blocks/PageBlockManager.ts";
// import { IPersonalityProvider } from "../../personalities/IPersonalityProvider.ts";
// import { PersonalityKey } from "../../personalities/PersonalityKey.ts";

// export type SynapticConversationsAPIConfig = {
//   ChatPersonalityKey: PersonalityKey;

//   Root?: string;
// };

// export type SynapticPagesAPIConfig = {
//   Blocks: SynapticPageBlocksAPIConfig;

//   Root?: string;
// };

// export type SynapticPageBlocksAPIConfig = {
//   RegeneratePersonalityKey: PersonalityKey;

//   Root?: string;
// };

// export type SynapticConfig = {
//   APIRoot?: string;

//   Conversations: SynapticConversationsAPIConfig;

//   ConvoState: IConversationState;

//   LLM: OpenAILLMAccessor;

//   PageBlockManager: PageBlockManager;

//   PageManager: PageManager;

//   Pages: SynapticPagesAPIConfig;

//   Personalities: IPersonalityProvider;
// };
