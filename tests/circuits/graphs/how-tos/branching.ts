import {
  assert,
  assertEquals,
  END,
  EverythingAsCodeDenoKV,
  Runnable,
  START,
} from "../../../tests.deps.ts";
import { StateBuilder } from "../../../../src/fluent/state/StateBuilder.ts";
import { buildTestIoC } from "../../../test-eac-setup.ts";
import { EaCPassthroughNeuron } from "../../../../src/eac/neurons/EaCPassthroughNeuron.ts";
import { EaCNeuron } from "../../../../src/eac/EaCNeuron.ts";
import { EaCGraphCircuitDetails } from "../../../../src/eac/EaCGraphCircuitDetails.ts";
import { EverythingAsCodeSynaptic } from "../../../../src/eac/EverythingAsCodeSynaptic.ts";

// https://github.com/langchain-ai/langgraphjs/blob/main/examples/how-tos/branching.ipynb

type ScoredValue = {
  value: string;
  score: number;
};

Deno.test("Graph Branching Circuits", async (t) => {
  const loadSimpleBootstrap = (value: string) => {
    return (state: { aggregate: string[] }) => {
      console.log(`Adding ${value} to ${state.aggregate}`);

      return { aggregate: [`I'm ${value}`] };
    };
  };

  const loadScoredBootstrap = (value: string, score: number) => {
    return (state: { aggregate: string[] }) => {
      console.log(`Adding ${value} to ${state.aggregate}`);

      return { fanoutValues: [{ value: `I'm ${value}`, score }] };
    };
  };

  const fanOutFanInState = new StateBuilder()
    .Field("aggregate", {
      reducer: (x: string[], y: string[]) => x.concat(y),
      default: () => [],
    })
    .Build();

  const conditionalState = new StateBuilder()
    .Field("aggregate", {
      reducer: (x: string[], y: string[]) => x.concat(y),
      default: () => [],
    })
    .Field("which", {
      reducer: (x: string, y: string) => (y ? y : x),
      default: () => "",
    })
    .Build();

  const eac = {
    Circuits: {
      $neurons: {
        $pass: {
          Type: "Passthrough",
        } as EaCPassthroughNeuron,
      },
      "fan-out-fan-in": {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: fanOutFanInState,
          Neurons: {
            a: {
              BootstrapInput: loadSimpleBootstrap("A"),
            } as Partial<EaCNeuron>,
            b: {
              BootstrapInput: loadSimpleBootstrap("B"),
            } as Partial<EaCNeuron>,
            c: {
              BootstrapInput: loadSimpleBootstrap("C"),
            } as Partial<EaCNeuron>,
            d: {
              BootstrapInput: loadSimpleBootstrap("D"),
            } as Partial<EaCNeuron>,
          },
          Edges: {
            [START]: "a",
            a: ["b", "c"],
            b: "d",
            c: "d",
            d: END,
          },
        } as EaCGraphCircuitDetails,
      },
      conditional: {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: conditionalState,
          Neurons: {
            a: {
              BootstrapInput: loadSimpleBootstrap("A"),
            } as Partial<EaCNeuron>,
            b: {
              BootstrapInput: loadSimpleBootstrap("B"),
            } as Partial<EaCNeuron>,
            c: {
              BootstrapInput: loadSimpleBootstrap("C"),
            } as Partial<EaCNeuron>,
            d: {
              BootstrapInput: loadSimpleBootstrap("D"),
            } as Partial<EaCNeuron>,
            e: {
              BootstrapInput: loadSimpleBootstrap("E"),
            } as Partial<EaCNeuron>,
          },
          Edges: {
            [START]: "a",
            a: {
              Node: {
                b: "b",
                c: "c",
                d: "d",
              },
              Condition: (state: { which: string }) => {
                if (state.which === "cd") {
                  return ["c", "d"];
                }

                return ["b", "c"];
              },
            },
            b: "e",
            c: "e",
            d: "e",
            e: END,
          },
        } as EaCGraphCircuitDetails,
      },
      "stable-sorting": {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: {
            aggregate: Annotation<string[]>({
              reducer: (x, y) => x.concat(y),
              default: () => [],
            }),
            which: Annotation<string>({
              reducer: (x, y) => (y ? y : x),
              default: () => "",
            }),
            fanoutValues: Annotation<ScoredValue[]>({
              reducer: (left, right) => {
                if (!left) {
                  left = [];
                }
                if (!right || right?.length === 0) {
                  // Overwrite. Similar to redux.
                  return [];
                }
                return left.concat(right);
              },
              default: () => [],
            }),
          },
          Neurons: {
            a: {
              BootstrapInput: loadSimpleBootstrap("A"),
            } as Partial<EaCNeuron>,
            b: {
              BootstrapInput: loadScoredBootstrap("B", 0.1),
            } as Partial<EaCNeuron>,
            c: {
              BootstrapInput: loadScoredBootstrap("C", 0.9),
            } as Partial<EaCNeuron>,
            d: {
              BootstrapInput: loadScoredBootstrap("D", 0.3),
            } as Partial<EaCNeuron>,
            e: {
              BootstrapInput(state: { fanoutValues: ScoredValue[] }) {
                // Sort by score (reversed)
                state.fanoutValues.sort((a, b) => b.score - a.score);

                return {
                  aggregate: state.fanoutValues
                    .map((v) => v.value)
                    .concat(["I'm E"]),
                  fanoutValues: [],
                };
              },
            } as Partial<EaCNeuron>,
          },
          Edges: {
            [START]: "a",
            a: {
              Node: {
                b: "b",
                c: "c",
                d: "d",
              },
              Condition: (state: { which: string }) => {
                if (state.which === "cd") {
                  return ["c", "d"];
                }

                return ["b", "c"];
              },
            },
            b: "e",
            c: "e",
            d: "e",
            e: END,
          },
        } as EaCGraphCircuitDetails,
      },
    },
  } as EverythingAsCodeSynaptic & EverythingAsCodeDenoKV;

  const { ioc } = await buildTestIoC(eac, undefined, false);

  await t.step("Fan Out Fan In Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "fan-out-fan-in",
    );

    const chunk = await circuit.invoke({ aggregate: [] });

    console.log(chunk);

    assert(chunk.aggregate);
    assertEquals(chunk.aggregate[1], `I'm B`);
    assertEquals(chunk.aggregate[3], `I'm D`);
  });

  await t.step("Conditional Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "conditional",
    );

    let chunk = await circuit.invoke({ aggregate: [], which: "bc" });

    console.log(chunk);

    assert(chunk.aggregate);
    assertEquals(chunk.aggregate[1], `I'm B`);
    assertEquals(chunk.aggregate[2], `I'm C`);
    assertEquals(chunk.aggregate[3], `I'm E`);

    chunk = await circuit.invoke({ aggregate: [], which: "cd" });

    console.log(chunk);

    assert(chunk.aggregate);
    assertEquals(chunk.aggregate[1], `I'm C`);
    assertEquals(chunk.aggregate[2], `I'm D`);
    assertEquals(chunk.aggregate[3], `I'm E`);
  });

  await t.step("Stable Sorting Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "stable-sorting",
    );

    let chunk = await circuit.invoke({ aggregate: [], which: "bc" });

    console.log(chunk);

    assert(chunk.aggregate);
    assertEquals(chunk.aggregate[1], `I'm C`);
    assertEquals(chunk.aggregate[2], `I'm B`);
    assertEquals(chunk.aggregate[3], `I'm E`);

    chunk = await circuit.invoke({ aggregate: [], which: "cd" });

    console.log(chunk);

    assert(chunk.aggregate);
    assertEquals(chunk.aggregate[1], `I'm C`);
    assertEquals(chunk.aggregate[2], `I'm D`);
    assertEquals(chunk.aggregate[3], `I'm E`);
  });
});
