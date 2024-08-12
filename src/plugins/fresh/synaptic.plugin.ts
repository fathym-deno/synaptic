// import { Plugin } from "../../fresh.deps.ts";
// import { SynapticConfig } from "./SynapticConfig.ts";
// import { loadAllConversationsApis } from "./routes/conversations.apis.ts";
// import { loadAllPageBlocksApis } from "./routes/page-blocks.apis.ts";
// import { loadAllPagesApis } from "./routes/pages.apis.ts";

// export function synapticPlugin(config: SynapticConfig) {
//   const convosApis = loadAllConversationsApis(config);

//   const pagesApis = loadAllPagesApis(config);

//   const pageBlocksApis = loadAllPageBlocksApis(config);

//   return {
//     Plugin: {
//       name: "fathym_synaptic",
//       routes: [
//         ...convosApis.Routes,
//         ...pagesApis.Routes,
//         ...pageBlocksApis.Routes,
//       ],
//     } as Plugin,
//     Handlers: {
//       ...convosApis.Handlers,
//       ...pagesApis.Handlers,
//       ...pageBlocksApis.Handlers,
//     },
//   };
// }
