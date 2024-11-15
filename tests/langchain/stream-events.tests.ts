import { EaCGraphCircuitDetails } from "../../src/eac/EaCGraphCircuitDetails.ts";
import { EaCNeuron } from "../../src/eac/EaCNeuron.ts";
import { EverythingAsCodeSynaptic } from "../../src/eac/EverythingAsCodeSynaptic.ts";
import { EaCCircuitNeuron } from "../../src/eac/neurons/EaCCircuitNeuron.ts";
import { EaCPassthroughNeuron } from "../../src/eac/neurons/EaCPassthroughNeuron.ts";
import {
  Annotation,
  dispatchCustomEvent,
  END,
  EverythingAsCodeDenoKV,
  RunnableLambda,
  START,
} from "../tests.deps.ts";

type ValWithId = { id?: string; val: string };

Deno.test("Stream Events Tests", async (t) => {
  const _eac = {
    Circuits: {
      $neurons: {
        $pass: {
          Type: "Passthrough",
        } as EaCPassthroughNeuron,
      },
      child: {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: {
            name: Annotation<string>({
              reducer: (x, y) => (y ? y : x),
              default: () => "default",
            }),
            path: Annotation<string[] | string | undefined>({
              value: (left, right): string[] => {
                if (!left) {
                  left = [];
                } else if (typeof left === "string") {
                  left = [left];
                }
                if (!right) {
                  right = [];
                } else if (typeof right === "string") {
                  right = [right];
                }
                return [...left, ...right];
              },
              default: () => [],
            }),
          },
          Neurons: {
            child: {
              Type: "Circuit",
              CircuitLookup: "grandchild",
            } as EaCCircuitNeuron,
            fin: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["fin"] };
                });
              },
            } as Partial<EaCNeuron>,
            grandparent: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["grandparent"] };
                });
              },
            } as Partial<EaCNeuron>,
            parent: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["parent"] };
                });
              },
            } as Partial<EaCNeuron>,
            sibling: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["sibling"] };
                });
              },
            } as Partial<EaCNeuron>,
          },
          Edges: {
            [START]: "grandparent",
            grandparent: "parent",
            parent: ["child", "sibling"],
            child: "fin",
            sibling: "fin",
            fin: END,
          },
        } as EaCGraphCircuitDetails,
      },
      grandchild: {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: {
            name: Annotation<string>({
              reducer: (x, y) => (y ? y : x),
              default: () => "default",
            }),
            path: Annotation<string[] | string | undefined>({
              value: (left, right): string[] => {
                if (!left) {
                  left = [];
                } else if (typeof left === "string") {
                  left = [left];
                }
                if (!right) {
                  right = [];
                } else if (typeof right === "string") {
                  right = [right];
                }
                return [...left, ...right];
              },
              default: () => [],
            }),
          },
          Neurons: {
            child_end: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["child_end"] };
                });
              },
            } as Partial<EaCNeuron>,
            child_middle: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["child_middle"] };
                });
              },
            } as Partial<EaCNeuron>,
            child_start: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["child_start"] };
                });
              },
            } as Partial<EaCNeuron>,
          },
          Edges: {
            [START]: "child_start",
            child_start: "child_middle",
            child_middle: "child_end",
            child_end: END,
          },
        } as EaCGraphCircuitDetails,
      },
      main: {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: {
            name: Annotation<string>({
              reducer: (x, y) => (y ? y : x),
              default: () => "default",
            }),
            path: Annotation<string[] | string | undefined>({
              value: (left, right): string[] => {
                if (!left) {
                  left = [];
                } else if (typeof left === "string") {
                  left = [left];
                }
                if (!right) {
                  right = [];
                } else if (typeof right === "string") {
                  right = [right];
                }
                return [...left, ...right];
              },
              default: () => [],
            }),
          },
          Neurons: {
            child: {
              Type: "Circuit",
              CircuitLookup: "child",
            } as EaCCircuitNeuron,
            fin: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["fin"] };
                });
              },
            } as Partial<EaCNeuron>,
            grandparent: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["grandparent"] };
                });
              },
            } as Partial<EaCNeuron>,
            parent: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["parent"] };
                });
              },
            } as Partial<EaCNeuron>,
            sibling: {
              Bootstrap: () => {
                return RunnableLambda.from(() => {
                  return { path: ["sibling"] };
                });
              },
            } as Partial<EaCNeuron>,
          },
          Edges: {
            [START]: "grandparent",
            grandparent: "parent",
            parent: ["child", "sibling"],
            child: "fin",
            sibling: "fin",
            fin: END,
          },
        } as EaCGraphCircuitDetails,
      },
    },
  } as EverythingAsCodeSynaptic & EverythingAsCodeDenoKV;

  // const { ioc } = await buildTestIoC(eac);

  // await t.step('Long Graph Stream Through Readable', async () => {
  //   const circuit = await ioc.Resolve<Runnable>(ioc.Symbol('Circuit'), 'main');

  //   const body = new ReadableStream({
  //     async start(controller) {
  //       const streamed = await circuit.streamEvents(
  //         { name: 'test' },
  //         {
  //           version: 'v2',
  //         }
  //       );

  //       for await (const event of streamed) {
  //         controller.enqueue({
  //           id: Date.now(),
  //           event: 'data',
  //           data: customStringify(event),
  //         } as ServerSentEventMessage);

  //         // await delay(1);
  //       }

  //       controller.enqueue({
  //         id: Date.now(),
  //         event: 'end',
  //       } as ServerSentEventMessage);

  //       controller.close();
  //     },
  //     cancel() {
  //       // divined.cancel();
  //     },
  //   });

  //   const sses = body.pipeThrough(new ServerSentEventStream());

  //   const text = await toText(sses);

  //   console.log(text);
  // });

  await t.step("Custum Events", async () => {
    const runnable = RunnableLambda.from(() => {
      dispatchCustomEvent("thinky:page:navigate", undefined);
    });

    const events = runnable.streamEvents({}, { version: "v2" });

    for await (const event of events) {
      console.log(event.name);
    }
  });
});
