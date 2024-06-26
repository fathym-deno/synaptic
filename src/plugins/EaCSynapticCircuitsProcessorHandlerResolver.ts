import { EaCCircuitAsCode } from "../eac/EaCCircuitAsCode.ts";
import { isEaCSynapticCircuitsProcessor } from "../eac/EaCSynapticCircuitsProcessor.ts";
import { EverythingAsCodeSynaptic } from "../eac/EverythingAsCodeSynaptic.ts";
import {
  delay,
  EaCRuntimeEaC,
  ProcessorHandlerResolver,
  Runnable,
  RunnableConfig,
  ServerSentEventMessage,
  ServerSentEventStream,
  zodToJsonSchema,
} from "../src.deps.ts";
import { RemoteCircuitDefinition } from "./FathymSynapticPlugin.ts";
import { customStringify } from "./customStringify.ts";

export type SynapticCircuitsExecuteRequest = {
  config: Partial<RunnableConfig> & {
    version?: "v1" | "v2";
  };

  input: unknown;

  kwargs?: unknown;
};

export const EaCSynapticCircuitsProcessorHandlerResolver:
  ProcessorHandlerResolver<
    EaCRuntimeEaC & EverythingAsCodeSynaptic
  > = {
    async Resolve(ioc, appProcCfg, eac) {
      const processor = appProcCfg.Application.Processor;

      if (!isEaCSynapticCircuitsProcessor(processor)) {
        throw new Deno.errors.NotSupported(
          "The provided processor is not supported for the EaCSynapticCircuitsProcessorHandlerResolver.",
        );
      }

      const skipCircuits = ["$neurons", "$remotes"];

      const eacCircuits = Object.keys(eac.Circuits || {}).reduce((acc, key) => {
        if (!skipCircuits.includes(key)) {
          const eacCircuit = eac.Circuits![key];

          let addCircuit = false;

          if (processor.Includes) {
            if (processor.Includes.includes(key)) {
              addCircuit = true;
            }
          } else if (processor.Excludes) {
            if (!processor.Excludes.includes(key)) {
              addCircuit = true;
            }
          } else {
            addCircuit = true;
          }

          if (addCircuit) {
            acc[key] = eacCircuit;
          }
        }

        return acc;
      }, {} as Record<string, EaCCircuitAsCode>);

      const circuitsSet = await Promise.all(
        Object.keys(eacCircuits).map(async (key) => {
          return [
            key,
            await ioc.Resolve<Runnable>(ioc.Symbol("Circuit"), key),
          ] as [string, Runnable];
        }),
      );

      const circuits = circuitsSet.reduce(
        (acc, [lookup, circuit]) => {
          const eacCircuit = eacCircuits[lookup];

          if (circuit) {
            acc[lookup] = { Circuit: eacCircuit, Runnable: circuit };
          }

          return acc;
        },
        {} as Record<string, { Circuit: EaCCircuitAsCode; Runnable: Runnable }>,
      );

      return async (req, ctx) => {
        if (
          ctx.Runtime.URLMatch.Path === "/" ||
          ctx.Runtime.URLMatch.Path === ""
        ) {
          return Response.json(
            Object.keys(circuits).reduce((acc, lookup) => {
              const circuit = circuits[lookup];

              acc[lookup] = {
                Name: circuit.Circuit.Details!.Name!,
                Description: circuit.Circuit.Details!.Description!,
                InputSchema: circuit.Circuit.Details!.InputSchema
                  ? zodToJsonSchema(circuit.Circuit.Details!.InputSchema)
                  : undefined,
              };

              return acc;
            }, {} as Record<string, RemoteCircuitDefinition>),
          );
        } else {
          const pathMatch = new URLPattern({
            pathname: "/:circuitLookup/:action",
          });

          if (
            pathMatch.test(
              new URL(ctx.Runtime.URLMatch.Path, "https://notused.com"),
            )
          ) {
            const result = pathMatch.exec(
              new URL(ctx.Runtime.URLMatch.Path, "https://notused.com"),
            );

            let matchedCircuitLookup = result?.pathname.groups["circuitLookup"];

            if (matchedCircuitLookup?.startsWith("/")) {
              matchedCircuitLookup = matchedCircuitLookup.slice(1);
            }

            if (matchedCircuitLookup && matchedCircuitLookup in circuits) {
              const action = (result?.pathname.groups["action"] as
                | "invoke"
                | "stream"
                | "stream_log"
                | "stream_events") || "invoke";

              const circuit = circuits[matchedCircuitLookup];

              if (req.method.toUpperCase() === "POST") {
                const circuitsReq: SynapticCircuitsExecuteRequest = await req
                  .json();

                // https://github.com/langchain-ai/langserve/blob/main/langserve/api_handler.py#L1026

                if (action === "stream") {
                  const streamed = await circuit.Runnable.stream(
                    circuitsReq.input,
                    circuitsReq.config,
                  );

                  const body = new ReadableStream({
                    async start(controller) {
                      const hasSentMetadata = false;

                      for await (const event of streamed) {
                        if (!hasSentMetadata) {
                          //  TODO:  Support Metadata
                        }

                        controller.enqueue({
                          id: Date.now(),
                          event: "data",
                          data: customStringify(event),
                        } as ServerSentEventMessage);

                        await delay(1);
                      }

                      controller.enqueue({
                        id: Date.now(),
                        event: "end",
                      } as ServerSentEventMessage);

                      controller.close();
                    },
                    cancel() {
                      // divined.cancel();
                    },
                  });

                  return new Response(
                    body.pipeThrough(new ServerSentEventStream()),
                    {
                      headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                      },
                    },
                  );
                } else if (action === "stream_events") {
                  const streamed = await circuit.Runnable.streamEvents(
                    circuitsReq.input,
                    {
                      ...circuitsReq.config,
                      version: circuitsReq.config.version || "v2",
                    },
                  );

                  const body = new ReadableStream({
                    async start(controller) {
                      for await (const event of streamed) {
                        controller.enqueue({
                          id: Date.now(),
                          event: "data",
                          data: customStringify(event),
                        } as ServerSentEventMessage);

                        await delay(1);
                      }

                      controller.enqueue({
                        id: Date.now(),
                        event: "end",
                      } as ServerSentEventMessage);

                      controller.close();
                    },
                    cancel() {
                      // divined.cancel();
                    },
                  });

                  return new Response(
                    body.pipeThrough(new ServerSentEventStream()),
                    {
                      headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                      },
                    },
                  );
                } else if (action === "stream_log") {
                  const streamed = await circuit.Runnable.streamLog(
                    circuitsReq.input,
                    circuitsReq.config,
                  );

                  const body = new ReadableStream({
                    async start(controller) {
                      for await (const event of streamed) {
                        controller.enqueue({
                          id: Date.now(),
                          event: "data",
                          data: customStringify(event),
                        } as ServerSentEventMessage);

                        await delay(1);
                      }

                      controller.close();
                    },
                    cancel() {
                      // divined.cancel();
                    },
                  });

                  return new Response(
                    body.pipeThrough(new ServerSentEventStream()),
                    {
                      headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                      },
                    },
                  );
                } else {
                  const res = await circuit.Runnable.invoke(
                    circuitsReq.input,
                    circuitsReq.config,
                  );

                  return Response.json({
                    output: JSON.parse(customStringify(res)),
                  });
                }
              } else {
                return Response.json({
                  Name: circuit.Circuit.Details!.Name!,
                  Description: circuit.Circuit.Details!.Description!,
                  InputSchema: zodToJsonSchema(
                    circuit.Circuit.Details!.InputSchema!,
                  ),
                } as RemoteCircuitDefinition);
              }
            } else {
              throw new Deno.errors.NotFound(
                `There is no circuit configured for ${ctx.Runtime.URLMatch.Path}.`,
              );
            }
          } else {
            throw new Deno.errors.NotFound(
              `The circuit could not be found for path ${ctx.Runtime.URLMatch.Path}.`,
            );
          }
        }
      };
    },
  };
