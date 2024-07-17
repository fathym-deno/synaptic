import { EaCLinearCircuitDetails } from '../../../src/eac/EaCLinearCircuitDetails.ts';
import { EaCNeuron } from '../../../src/eac/EaCNeuron.ts';
import { EverythingAsCodeSynaptic } from '../../../src/eac/EverythingAsCodeSynaptic.ts';
import { EaCToolNeuron } from '../../../src/eac/neurons/EaCToolNeuron.ts';
import { EaCDynamicToolDetails } from '../../../src/eac/tools/EaCDynamicToolDetails.ts';
import FathymSynapticPlugin from '../../../src/plugins/FathymSynapticPlugin.ts';
import { buildTestIoC } from '../../test-eac-setup.ts';
import {
  assert,
  assertEquals,
  Runnable,
  RunnableLambda,
  z,
} from '../../tests.deps.ts';

Deno.test('EaCToolNeuron Tests', async (t) => {
  const tstMsg = 'This is a test tool';

  const eac = {
    AIs: {
      test: {
        Tools: {
          test: {
            Details: {
              Type: 'Dynamic',
              Name: 'test',
              Description: 'A test',
              Schema: z.object({}),
              Action: async () => {
                return await tstMsg;
              },
            } as EaCDynamicToolDetails,
          },
        },
      },
    },
    Circuits: {
      $neurons: {
        'test-tool': {
          Type: 'Tool',
          ToolLookup: 'test|test',
        } as EaCToolNeuron,
      },
      basic: {
        Details: {
          Type: 'Linear',
          Neurons: {
            '': 'test-tool',
          },
        } as EaCLinearCircuitDetails,
      },
      'basic-bootstrap-circuit': {
        Details: {
          Type: 'Linear',
          Neurons: {
            '': 'test-tool',
          },
          Bootstrap: (r) =>
            r.pipe(
              RunnableLambda.from((res: string) => {
                return `Circuit Bootstrap: ${res}`;
              })
            ),
        } as EaCLinearCircuitDetails,
      },
      'basic-bootstrap-neuron': {
        Details: {
          Type: 'Linear',
          Neurons: {
            '': [
              'test-tool',
              {
                Bootstrap: (r) =>
                  r.pipe(
                    RunnableLambda.from((res: string) => {
                      return `Neuron Bootstrap: ${res}`;
                    })
                  ),
              } as Partial<EaCNeuron>,
            ],
          },
        } as EaCLinearCircuitDetails,
      },
      'basic-sub-neuron': {
        Details: {
          Type: 'Linear',
          Neurons: {
            '': [
              'test-tool',
              {
                Neurons: {
                  '': {
                    Bootstrap: () =>
                      RunnableLambda.from((res: string) => {
                        return `Neuron Sub: ${res}`;
                      }),
                  } as Partial<EaCNeuron>,
                },
              } as Partial<EaCNeuron>,
            ],
          },
        } as EaCLinearCircuitDetails,
      },
    },
  } as EverythingAsCodeSynaptic;

  const { ioc } = await buildTestIoC(
    eac,
    [new FathymSynapticPlugin(true)],
    false
  );

  await t.step('Basic Invoke', async () => {
    const circuit = await ioc.Resolve<Runnable>(ioc.Symbol('Circuit'), 'basic');

    const result = await circuit.invoke({});

    assert(result);
    assertEquals(result, tstMsg);
  });

  await t.step('Basic Invoke W/ Bootstrap Circuit', async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol('Circuit'),
      'basic-bootstrap-circuit'
    );

    const result = await circuit.invoke({});

    assert(result);
    assertEquals(result, `Circuit Bootstrap: ${tstMsg}`);
  });

  await t.step('Basic Invoke W/ Bootstrap Neuron', async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol('Circuit'),
      'basic-bootstrap-neuron'
    );

    const result = await circuit.invoke({});

    assert(result);
    assertEquals(result, `Neuron Bootstrap: ${tstMsg}`);
  });

  await t.step('Basic Invoke W/ Sub Neuron', async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol('Circuit'),
      'basic-sub-neuron'
    );

    const result = await circuit.invoke({});

    assert(result);
    assertEquals(result, `Neuron Sub: ${tstMsg}`);
  });
});
