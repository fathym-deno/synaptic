// import { Page, PageManager } from "../../pages/PageManager.ts";
// import { JSX } from "../../src.deps.ts";
// import { Handlers } from "../../fresh.deps.ts";
// import { SynapticConfig } from "../SynapticConfig.ts";

// export function loadAllPagesApis(config: SynapticConfig) {
//   const pages = pagesRoute(
//     config.PageManager,
//     config.APIRoot,
//     config.Pages?.Root,
//   );

//   const layouts = pageLayoutsRoute(
//     config.PageManager,
//     config.APIRoot,
//     config.Pages?.Root,
//   );

//   const pageLookup = pageLookupRoute(
//     config.PageManager,
//     config.APIRoot,
//     config.Pages?.Root,
//   );

//   return {
//     Handlers: {
//       Pages: pages.handler,
//       Layouts: layouts.handler,
//       PageLookup: pageLookup.handler,
//     },
//     Routes: [pages, layouts, pageLookup],
//   };
// }

// export function pagesRoute(
//   pages: PageManager,
//   apiRoot?: string,
//   pagesRoot?: string,
// ) {
//   const handler: Handlers<JSX.Element, Record<string, unknown>> = {
//     async GET(_req, _ctx) {
//       const body = JSON.stringify(await pages.List());

//       return new Response(body, {
//         headers: {
//           "content-type": "application/json",
//           "cache-control": "no-cache",
//         },
//       });
//     },
//     async POST(req, _ctx) {
//       const page: Page = await req.json();

//       await pages.Save(page);

//       return new Response(JSON.stringify({ Status: "Success" }), {
//         headers: {
//           "content-type": "application/json",
//           "cache-control": "no-cache",
//         },
//       });
//     },
//   };

//   return {
//     path: `/${apiRoot || "api"}/${pagesRoot || "pages"}`,
//     handler,
//     component: undefined,
//   };
// }

// export function pageLayoutsRoute(
//   pages: PageManager,
//   apiRoot?: string,
//   pagesRoot?: string,
// ) {
//   const handler: Handlers<JSX.Element, Record<string, unknown>> = {
//     async GET(_req, _ctx) {
//       const body = JSON.stringify(await pages.Layouts());

//       return new Response(body, {
//         headers: {
//           "content-type": "application/json",
//           "cache-control": "no-cache",
//         },
//       });
//     },
//   };

//   return {
//     path: `/${apiRoot || "api"}/${pagesRoot || "pages"}/layouts`,
//     handler,
//     component: undefined,
//   };
// }

// export function pageLookupRoute(
//   pages: PageManager,
//   apiRoot?: string,
//   pagesRoot?: string,
// ) {
//   const handler: Handlers<JSX.Element, Record<string, unknown>> = {
//     async GET(_req, ctx) {
//       const page = await pages.Get(ctx.params.pageLookup);

//       const body = JSON.stringify(page);

//       return new Response(body, {
//         headers: {
//           "content-type": "text/event-stream",
//           "cache-control": "no-cache",
//         },
//       });
//     },
//     async DELETE(_req, ctx) {
//       const pageLookup = ctx.params.pageLookup;

//       await pages.Delete(pageLookup);

//       return new Response(null, {
//         headers: {
//           "content-type": "text/html",
//         },
//       });
//     },
//   };

//   return {
//     path: `/${apiRoot || "api"}/${pagesRoot || "pages"}/[pageLookup]`,
//     handler,
//     component: undefined,
//   };
// }
