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

//     eacBldr.Circuits('some-circuit').With((bldr) => {
//       bldr.Neurons('first').Name('').Description('');

//       bldr.Neurons('first').Name('').Description('');
//     });

//     const ioc = await eacBldr.Compile();

//     console.log(ioc);
//   });
// });
