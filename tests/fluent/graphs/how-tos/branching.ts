import { EverythingAsCodeSynaptic } from "../../../../src/eac/.exports.ts";
import { EaCGraphCircuitDetails } from "../../../../src/eac/EaCGraphCircuitDetails.ts";
import { eacFluentBuilder } from "../../../../src/fluent/.exports.ts";
import { Annotation, START } from "../../../tests.deps.ts";
import { StateDefinition } from "../../../../src/src.deps.ts";

Deno.test("Fluent Branching Circuits", async (t) => {
  await t.step("Circuit as Code Builder", async () => {
    const loadSimpleBootstrap = (value: string) => {
      return (state: { aggregate: string[] }) => {
        console.log(`Adding ${value} to ${state.aggregate}`);

        return { aggregate: [`I'm ${value}`] };
      };
    };

    const eacBldr = eacFluentBuilder<EverythingAsCodeSynaptic>();

    eacBldr.Details().Name("AI as Code Builder Test");

    const stateDef: StateDefinition = {
      aggregate: Annotation<string[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
      }),
    };

    eacBldr
      .Circuits("fan-out-fan-in")
      .Details<EaCGraphCircuitDetails>()
      .Type("Graph")
      .Name("")
      .Description("")
      .State(stateDef)
      .With((bldr) => {
        bldr.Neurons("a").BootstrapInput(loadSimpleBootstrap("A"));

        bldr.Neurons("b").BootstrapInput(loadSimpleBootstrap("B"));

        bldr.Neurons("c").BootstrapInput(loadSimpleBootstrap("C"));

        bldr.Neurons("d").BootstrapInput(loadSimpleBootstrap("D"));
      })
      .With((bldr) => {
        bldr.Edges(START).To("b");

        bldr.Edges("b").To("c");

        bldr.Neurons("b").BootstrapInput(loadSimpleBootstrap("B"));

        bldr.Neurons("c").BootstrapInput(loadSimpleBootstrap("C"));

        bldr.Neurons("d").BootstrapInput(loadSimpleBootstrap("D"));
      });

    const ioc = await eacBldr.Compile();

    console.log(ioc);
  });
});
