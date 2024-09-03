import { AnnotationRoot } from 'npm:@langchain/langgraph@0.1.4-rc.1';
import { EverythingAsCodeSynaptic } from '../../../../src/eac/.exports.ts';
import { EaCGraphCircuitDetails } from '../../../../src/eac/EaCGraphCircuitDetails.ts';
import { eacFluentBuilder } from '../../../../src/fluent/.exports.ts';
import {
  Annotation,
  assert,
  assertEquals,
  RunnableLambda,
} from '../../../tests.deps.ts';
import { StateDefinition } from '../../../../src/src.deps.ts';

Deno.test('Fluent Branching Circuits', async (t) => {
  await t.step('Circuit as Code Builder', async () => {
    const loadSimpleBootstrap = (value: string) => {
      return (state: { aggregate: string[] }) => {
        console.log(`Adding ${value} to ${state.aggregate}`);

        return { aggregate: [`I'm ${value}`] };
      };
    };

    const eacBldr = eacFluentBuilder<EverythingAsCodeSynaptic>({
      Details: {
        Name: 'AI as Code Builder Test',
      },
    });

    const stateDef: StateDefinition = {
      aggregate: Annotation<string[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
      }),
    };

    const state = Annotation.Root(stateDef);

    assert(state);
    assertEquals(state.constructor.name, AnnotationRoot.name);

    eacBldr
      .Circuits('fan-out-fan-in')
      .Details<EaCGraphCircuitDetails>()
      .Type('Graph')
      .Name('')
      .Description('')
      .State(state)
      .With((bldr) => {
        bldr.Neurons();
      });

    const ioc = await eacBldr.Compile();

    console.log(ioc);
  });
});
