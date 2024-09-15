<<<<<<< HEAD
import { EverythingAsCodeSynaptic } from "../../../../src/eac/.exports.ts";
import { EaCGraphCircuitDetails } from "../../../../src/eac/EaCGraphCircuitDetails.ts";
import { synapticFluentBuilder } from "../../../../src/fluent/.exports.ts";
import { Annotation, assert, assertEquals } from "../../../tests.deps.ts";
import { Runnable, StateDefinition } from "../../../../src/src.deps.ts";

Deno.test("Fluent Branching Circuits", async (t) => {
  const _loadSimpleBootstrap = (value: string) => {
    return (state: { aggregate: string[] }) => {
      console.log(`Adding ${value} to ${state.aggregate}`);

      return { aggregate: [`I'm ${value}`] };
    };
  };

  const eacBldr = synapticFluentBuilder<EverythingAsCodeSynaptic>().Root();

  eacBldr.Details().Name("AI as Code Builder Test");

  // eacBldr.Circuits.$neurons('$pass', true);

  type x = ReturnType<typeof eacBldr.Circuits.$remotes>;

  eacBldr.Circuits.$remotes("remote", true);

  const stateDef: StateDefinition = {
    aggregate: Annotation<string[]>({
      reducer: (x, y) => x.concat(y),
      default: () => [],
    }),
  };

  eacBldr
    .Circuits("fan-out-fan-in", true)
    .Details<EaCGraphCircuitDetails>()
    .Type("Graph")
    .State(stateDef)
    .With((bldr) => {
      type x = ReturnType<typeof bldr.Neurons>;

      bldr.Neurons("a", true);

      bldr.Neurons("b", true);

      bldr.Neurons("c", true);

      bldr.Neurons("c", true);
    });

  const ioc = await eacBldr.Compile();

  await t.step("Circuit as Code Builder", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "fan-out-fan-in",
    );

    const chunk = await circuit.invoke({ aggregate: [] });

    console.log(chunk);

    assert(chunk.aggregate);
    assertEquals(chunk.aggregate[1], `I'm B`);
    assertEquals(chunk.aggregate[3], `I'm D`);
=======
// import { EverythingAsCodeSynaptic } from '../../../../src/eac/.exports.ts';
// import { EaCGraphCircuitDetails } from '../../../../src/eac/EaCGraphCircuitDetails.ts';
// import { eacFluentBuilder } from '../../../../src/fluent/.exports.ts';
// import { Annotation } from '../../../tests.deps.ts';
// import { StateDefinition } from '../../../../src/src.deps.ts';

// Deno.test('Fluent Branching Circuits', async (t) => {
//   await t.step('Circuit as Code Builder', async () => {
//     const _loadSimpleBootstrap = (value: string) => {
//       return (state: { aggregate: string[] }) => {
//         console.log(`Adding ${value} to ${state.aggregate}`);

//         return { aggregate: [`I'm ${value}`] };
//       };
//     };

//     eacFluentBuilder<{
//       Thing: {
//         Hello: string;
//       };
//     }>();

//     const eacBldr = eacFluentBuilder<EverythingAsCodeSynaptic>();

//     eacBldr.Details().Name('AI as Code Builder Test');

//     const stateDef: StateDefinition = {
//       aggregate: Annotation<string[]>({
//         reducer: (x, y) => x.concat(y),
//         default: () => [],
//       }),
//     };

//     eacBldr
//       .Circuits('fan-out-fan-in')
//       .Details<EaCGraphCircuitDetails>()
//       .Type('Graph')
//       .Name('')
//       .Description('')
//       // .InputSchema(stateDef)
//       .State(stateDef)
//       .With((bldr) => {
//         bldr.Neurons('').Botst;
//       });
>>>>>>> 8ed65ae4f33581526c61be8ac05214894d386fa4

//     eacBldr.Circuits('some-circuit').With((bldr) => {
//       bldr.Neurons('first').Name('').Description('');

//       bldr.Neurons('first').Name('').Description('');
//     });

//     const ioc = await eacBldr.Compile();

//     console.log(ioc);
//   });
// });
