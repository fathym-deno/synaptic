import { HumanMessage } from 'npm:@langchain/core/messages';
import { EaCCircuitAsCode } from '../eac/EaCCircuitAsCode.ts';
import { isEaCSynapticCircuitsProcessor } from '../eac/EaCSynapticCircuitsProcessor.ts';
import { EverythingAsCodeSynaptic } from '../eac/EverythingAsCodeSynaptic.ts';
import {
  ProcessorHandlerResolver,
  Runnable,
  delay,
  zodToJsonSchema,
} from '../src.deps.ts';
import {
  ServerSentEventMessage,
  ServerSentEventStream,
} from 'https://deno.land/std@0.220.1/http/server_sent_event_stream.ts';

export type SynapticCircuitsExecuteRequest = {
  ConversationID?: string;

  Input: unknown;
};

export const EaCSynapticCircuitsProcessorHandlerResolver: ProcessorHandlerResolver =
  {
    async Resolve(ioc, appProcCfg, eac: EverythingAsCodeSynaptic) {
      const processor = appProcCfg.Application.Processor;

      if (!isEaCSynapticCircuitsProcessor(processor)) {
        throw new Deno.errors.NotSupported(
          'The provided processor is not supported for the EaCSynapticCircuitsProcessorHandlerResolver.'
        );
      }

      const eacCircuits = Object.keys(eac.Circuits || {}).reduce((acc, key) => {
        if (key !== '$neurons') {
          const eacCircuit = eac.Circuits![key];

          let addCircuit = false;

          if (processor.Includes?.includes(key)) {
            addCircuit = true;
          } else if (processor.Excludes?.includes(key)) {
            addCircuit = true;
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
            await ioc.Resolve<Runnable>(ioc.Symbol('Circuit'), key),
          ] as [string, Runnable];
        })
      );

      const circuits = circuitsSet.reduce((acc, [lookup, circuit]) => {
        const eacCircuit = eacCircuits[lookup];

        if (circuit) {
          acc[lookup] = { Circuit: eacCircuit, Runnable: circuit };
        }

        return acc;
      }, {} as Record<string, { Circuit: EaCCircuitAsCode; Runnable: Runnable }>);

      return async (req, ctx) => {
        if (
          ctx.Runtime.URLMatch.Path === '/' ||
          ctx.Runtime.URLMatch.Path === ''
        ) {
          return Response.json(
            Object.keys(circuits).reduce(
              (acc, lookup) => {
                const circuit = circuits[lookup];

                acc[lookup] = {
                  Name: circuit.Circuit.Details!.Name!,
                  Description: circuit.Circuit.Details!.Description!,
                  InputSchema: zodToJsonSchema(
                    circuit.Circuit.Details!.InputSchema!
                  ),
                };

                return acc;
              },
              {} as Record<
                string,
                {
                  Name: string;
                  Description: string;
                  InputSchema: any;
                }
              >
            )
          );
        } else {
          const pathMatch = new URLPattern({
            pathname: '/:circuitLookup',
          });

          if (
            pathMatch.test(
              new URL(ctx.Runtime.URLMatch.Path, 'https://notused.com')
            )
          ) {
            const result = pathMatch.exec(
              new URL(ctx.Runtime.URLMatch.Path, 'https://notused.com')
            );

            let matchedCircuitLookup = result?.pathname.groups['circuitLookup'];

            if (matchedCircuitLookup?.startsWith('/')) {
              matchedCircuitLookup = matchedCircuitLookup.slice(1);
            }

            if (matchedCircuitLookup && matchedCircuitLookup in circuits) {
              const circuit = circuits[matchedCircuitLookup];

              const controls = new URL(req.url).searchParams;

              if (req.method.toUpperCase() === 'POST') {
                const circuitsReq: SynapticCircuitsExecuteRequest =
                  await req.json();

                const stream = JSON.parse(controls.get('stream') || 'false');

                const streamEvents = JSON.parse(
                  controls.get('streamEvents') || 'false'
                );

                if (stream) {
                  const streamed = await circuit.Runnable.stream(
                    circuitsReq.Input,
                    {
                      configurable: {
                        sessionId: circuitsReq.ConversationID,
                        thread_id: circuitsReq.ConversationID,
                      },
                    }
                  );

                  const body = new ReadableStream({
                    async start(controller) {
                      for await (const event of streamed) {
                        controller.enqueue({
                          id: Date.now(),
                          event: 'message',
                          data: JSON.stringify(event),
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
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                      },
                    }
                  );
                } else if (streamEvents) {
                  const streamed = await circuit.Runnable.streamEvents(
                    circuitsReq.Input,
                    {
                      version: 'v1',
                      configurable: {
                        sessionId: circuitsReq.ConversationID,
                        thread_id: circuitsReq.ConversationID,
                      },
                    }
                  );

                  const body = new ReadableStream({
                    async start(controller) {
                      for await (const event of streamed) {
                        controller.enqueue({
                          id: Date.now(),
                          event: 'message',
                          data: JSON.stringify(event),
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
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                      },
                    }
                  );
                } else {
                  console.log(circuitsReq.Input);
                  const res = await circuit.Runnable.invoke(circuitsReq.Input, {
                    configurable: {
                      sessionId: circuitsReq.ConversationID,
                      thread_id: circuitsReq.ConversationID,
                    },
                  });

                  console.log(res);

                  return Response.json(res);
                }
              } else {
                return Response.json({
                  Name: circuit.Circuit.Details!.Name!,
                  Description: circuit.Circuit.Details!.Description!,
                  InputSchema: zodToJsonSchema(
                    circuit.Circuit.Details!.InputSchema!
                  ),
                });
              }
            } else {
              throw new Deno.errors.NotFound(
                `There is no circuit configured for ${ctx.Runtime.URLMatch.Path}.`
              );
            }
          } else {
            throw new Deno.errors.NotFound(
              `The circuit could not be found for path ${ctx.Runtime.URLMatch.Path}.`
            );
          }
        }
      };
    },
  };
