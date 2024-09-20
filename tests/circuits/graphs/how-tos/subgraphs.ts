import {
  Annotation,
  assert,
  assertEquals,
  END,
  EverythingAsCodeDatabases,
  Runnable,
  START,
} from "../../../tests.deps.ts";
import { buildTestIoC } from "../../../test-eac-setup.ts";
import { EaCPassthroughNeuron } from "../../../../src/eac/neurons/EaCPassthroughNeuron.ts";
import { EaCNeuron } from "../../../../src/eac/EaCNeuron.ts";
import { EaCGraphCircuitDetails } from "../../../../src/eac/EaCGraphCircuitDetails.ts";
import { EaCCircuitNeuron } from "../../../../src/eac/neurons/EaCCircuitNeuron.ts";
import { EverythingAsCodeSynaptic } from "../../../../src/eac/EverythingAsCodeSynaptic.ts";

// https://github.com/langchain-ai/langgraphjs/blob/main/examples/how-tos/subgraph.ipynb

type ValWithId = { id?: string; val: string };

Deno.test("Graph Subgraphs Circuits", async (t) => {
  const eac = {
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
              reducer: (left, right): string[] => {
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
              BootstrapInput() {
                return { path: ["child_end"] };
              },
            } as Partial<EaCNeuron>,
            child_middle: {
              BootstrapInput() {
                return { path: ["child_middle"] };
              },
            } as Partial<EaCNeuron>,
            child_start: {
              BootstrapInput() {
                return { path: ["child_start"] };
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
              BootstrapInput() {
                return { path: ["fin"] };
              },
            } as Partial<EaCNeuron>,
            grandparent: {
              BootstrapInput() {
                return { path: ["grandparent"] };
              },
            } as Partial<EaCNeuron>,
            parent: {
              BootstrapInput() {
                return { path: ["parent"] };
              },
            } as Partial<EaCNeuron>,
            sibling: {
              BootstrapInput() {
                return { path: ["sibling"] };
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
      "state-handoff-child": {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: {
            name: Annotation<string>({
              reducer: (x, y) => (y ? y : x),
              default: () => "default",
            }),
            path: Annotation<ValWithId[] | ValWithId | undefined>({
              value: (left, right): ValWithId[] => {
                /**
                 * Append the right-hand list, replacing any elements with the same id in the left-hand list.
                 */
                if (!left) {
                  left = [];
                } else if (!Array.isArray(left)) {
                  left = [left];
                }
                if (!right) {
                  right = [];
                } else if (!Array.isArray(right)) {
                  right = [right];
                }
                // Ensure there's an id for each element
                const [left_, right_] = [left, right].map((orig) =>
                  orig.map((val) => {
                    if (!val?.id) {
                      val.id = crypto.randomUUID();
                    }
                    return val;
                  })
                );

                // Merge the two lists
                const leftIdxById = left_.reduce(
                  (acc, val, i) => ({ ...acc, [val.id as string]: i }),
                  {} as Record<string, number>,
                );
                const merged = [...left_];
                for (const val of right_) {
                  const existingIdx = leftIdxById[val.id as string];
                  if (existingIdx !== undefined) {
                    merged[existingIdx] = val;
                  } else {
                    merged.push(val);
                  }
                }
                return merged;
              },
              default: () => [],
            }),
          },
          Neurons: {
            child_end: {
              BootstrapInput() {
                return { path: [{ val: "child_end" }] };
              },
            } as Partial<EaCNeuron>,
            child_middle: {
              BootstrapInput() {
                return { path: [{ val: "child_middle" }] };
              },
            } as Partial<EaCNeuron>,
            child_start: {
              BootstrapInput() {
                return { path: [{ val: "child_start" }] };
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
      "state-handoff-main": {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: {
            name: Annotation<string>({
              reducer: (x, y) => (y ? y : x),
              default: () => "default",
            }),
            path: Annotation<ValWithId[] | ValWithId | undefined>({
              value: (left, right): ValWithId[] => {
                /**
                 * Append the right-hand list, replacing any elements with the same id in the left-hand list.
                 */
                if (!left) {
                  left = [];
                } else if (!Array.isArray(left)) {
                  left = [left];
                }
                if (!right) {
                  right = [];
                } else if (!Array.isArray(right)) {
                  right = [right];
                }
                // Ensure there's an id for each element
                const [left_, right_] = [left, right].map((orig) =>
                  orig.map((val) => {
                    if (!val?.id) {
                      val.id = crypto.randomUUID();
                    }
                    return val;
                  })
                );

                // Merge the two lists
                const leftIdxById = left_.reduce(
                  (acc, val, i) => ({ ...acc, [val.id as string]: i }),
                  {} as Record<string, number>,
                );
                const merged = [...left_];
                for (const val of right_) {
                  const existingIdx = leftIdxById[val.id as string];
                  if (existingIdx !== undefined) {
                    merged[existingIdx] = val;
                  } else {
                    merged.push(val);
                  }
                }
                return merged;
              },
              default: () => [],
            }),
          },
          Neurons: {
            child: {
              Type: "Circuit",
              CircuitLookup: "state-handoff-child",
            } as EaCCircuitNeuron,
            fin: {
              BootstrapInput() {
                return { path: [{ val: "fin" }] };
              },
            } as Partial<EaCNeuron>,
            grandparent: {
              BootstrapInput() {
                return { path: [{ val: "grandparent" }] };
              },
            } as Partial<EaCNeuron>,
            parent: {
              BootstrapInput() {
                return { path: [{ val: "parent" }] };
              },
            } as Partial<EaCNeuron>,
            sibling: {
              BootstrapInput() {
                return { path: [{ val: "sibling" }] };
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
  } as EverythingAsCodeSynaptic & EverythingAsCodeDatabases;

  const { ioc, kvCleanup } = await buildTestIoC(eac);

  await t.step("Parent + Child Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(ioc.Symbol("Circuit"), "main");

    const chunk = await circuit.invoke({ name: "test" });

    assert(chunk);

    console.log(chunk);

    assertEquals(chunk.name, "test");
    assertEquals(chunk.path[0], "grandparent");
    assertEquals(chunk.path[1], "parent");
    assertEquals(chunk.path[2], "grandparent");
    assertEquals(chunk.path[3], "parent");
    assertEquals(chunk.path[4], "child_start");
    assertEquals(chunk.path[5], "child_middle");
    assertEquals(chunk.path[6], "child_end");
    assertEquals(chunk.path[7], "sibling");
    assertEquals(chunk.path[8], "fin");
  });

  await t.step("State Handoff Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "state-handoff-main",
    );

    const chunk = await circuit.invoke({ name: "test" });

    assert(chunk);

    console.log(chunk);

    assertEquals(chunk.name, "test");
    assertEquals(chunk.path[0].val, "grandparent");
    assertEquals(chunk.path[1].val, "parent");
    assertEquals(chunk.path[2].val, "child_start");
    assertEquals(chunk.path[3].val, "child_middle");
    assertEquals(chunk.path[4].val, "child_end");
    assertEquals(chunk.path[5].val, "sibling");
    assertEquals(chunk.path[6].val, "fin");
  });

  await kvCleanup();
});
