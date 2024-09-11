import { EverythingAsCodeSynaptic } from '../../../../src/eac/.exports.ts';
import { EaCGraphCircuitDetails } from '../../../../src/eac/EaCGraphCircuitDetails.ts';
import { synapticFluentBuilder } from '../../../../src/fluent/.exports.ts';
import { Annotation } from '../../../tests.deps.ts';
import { StateDefinition } from '../../../../src/src.deps.ts';
import { fluentBuilder } from 'jsr:@fathym/common@0.2.145/fluent';

Deno.test('Fluent Branching Circuits', async (t) => {
  await t.step('Circuit as Code Builder', async () => {
    const _loadSimpleBootstrap = (value: string) => {
      return (state: { aggregate: string[] }) => {
        console.log(`Adding ${value} to ${state.aggregate}`);

        return { aggregate: [`I'm ${value}`] };
      };
    };

    const eacBldr = synapticFluentBuilder<EverythingAsCodeSynaptic>().Root();

    const xBldr = fluentBuilder<{
      test: Record<string, string>;
    }>().Root();
    xBldr.test('', true)('Hey');

    eacBldr.Details().Name('AI as Code Builder Test');

    const stateDef: StateDefinition = {
      aggregate: Annotation<string[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
      }),
    };

    eacBldr
      .Circuits('fan-out-fan-in', true)
      .Details<EaCGraphCircuitDetails>()
      .Type('Graph')
      .State(stateDef)
      .With((bldr) => {
        bldr.Neurons('', true);
      });

    const ioc = await eacBldr.Compile();

    console.log(ioc);
  });
});
