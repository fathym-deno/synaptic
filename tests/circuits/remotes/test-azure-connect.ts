import {
  assert,
  EaCStatus,
  EaCStatusProcessingTypes,
  EverythingAsCodeDatabases,
  Runnable,
} from '../../tests.deps.ts';
import { buildTestIoC } from '../../test-eac-setup.ts';
import { EaCCircuitNeuron } from '../../../src/eac/neurons/EaCCircuitNeuron.ts';
import { EverythingAsCodeSynaptic } from '../../../src/eac/EverythingAsCodeSynaptic.ts';

Deno.test('Circuits', async (t) => {
  const eac = {
    Circuits: {
      $neurons: {},
      $remotes: {
        'fathym|azure': 'http://localhost:6151/all-circuits/',
        'thinky|eac|utils': 'http://localhost:6152/circuits/',
      },
      'azure-connect': {
        Details: {
          Type: 'Linear',
          Priority: 100,
          Neurons: {
            '': {
              Type: 'Circuit',
              CircuitLookup:
                'fathym|azure|AzureConnect2Plugin|cloud|azure-connect',
            } as EaCCircuitNeuron,
          },
        },
      },
      'wait-for-status': {
        Details: {
          Type: 'Linear',
          Priority: 100,
          Neurons: {
            '': {
              Type: 'Circuit',
              CircuitLookup:
                'thinky|eac|utils|FathymEaCStatus2Plugin|wait-for-status',
            } as EaCCircuitNeuron,
          },
        },
      },
    },
  } as EverythingAsCodeSynaptic & EverythingAsCodeDatabases;

  const { ioc, kvCleanup } = await buildTestIoC(eac, undefined, false);

  await t.step('Test Thinky EaC Wait For Status - Invoke', async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol('Circuit'),
      'wait-for-status'
    );

    const chunk = await circuit.invoke({
      Status: {
        EnterpriseLookup: crypto.randomUUID(),
        ID: crypto.randomUUID(),
        Processing: EaCStatusProcessingTypes.QUEUED,
        StartTime: new Date(),
        Username: 'random-test@fathym.com',
      } as EaCStatus,
      Operation: 'Testing Thinky Wait for Status',
    });

    assert(chunk.content, JSON.stringify(chunk));

    console.log(chunk.content);
  });

  // await t.step('Test Thinky EaC Wait For Status - Stream', async () => {
  //   const circuit = await ioc.Resolve<Runnable>(
  //     ioc.Symbol('Circuit'),
  //     'remote-chat'
  //   );

  //   const chunks = await circuit.stream({
  //     Input: 'Tell me a limmerick',
  //   });

  //   assert(chunks);

  //   for await (const chunk of chunks) {
  //     // assert(chunk.content, JSON.stringify(chunk));

  //     console.log(chunk.content);
  //   }
  // });

  // await t.step('Test Thinky EaC Wait For Status - Stream Events', async () => {
  //   const circuit = await ioc.Resolve<Runnable>(
  //     ioc.Symbol('Circuit'),
  //     'remote-chat'
  //   );

  //   const chunks = await circuit.streamEvents(
  //     {
  //       Input: 'Tell me a limmerick',
  //     },
  //     {
  //       version: 'v2',
  //     }
  //   );

  //   assert(chunks);

  //   for await (const chunk of chunks) {
  //     // assert(chunk.content, JSON.stringify(chunk));

  //     console.log(chunk.event);
  //   }
  // });

  // await t.step('Test Azure Connect Circuit - Invoke', async () => {
  //   const circuit = await ioc.Resolve<Runnable>(
  //     ioc.Symbol('Circuit'),
  //     'azure-connect'
  //   );

  //   const chunk = await circuit.invoke({
  //     Input: 'Tell me a limmerick',
  //   });

  //   assert(chunk.content, JSON.stringify(chunk));

  //   console.log(chunk.content);
  // });

  // await t.step('Test Azure Connect - Stream', async () => {
  //   const circuit = await ioc.Resolve<Runnable>(
  //     ioc.Symbol('Circuit'),
  //     'remote-chat'
  //   );

  //   const chunks = await circuit.stream({
  //     Input: 'Tell me a limmerick',
  //   });

  //   assert(chunks);

  //   for await (const chunk of chunks) {
  //     // assert(chunk.content, JSON.stringify(chunk));

  //     console.log(chunk.content);
  //   }
  // });

  // await t.step('Test Azure Connect - Stream Events', async () => {
  //   const circuit = await ioc.Resolve<Runnable>(
  //     ioc.Symbol('Circuit'),
  //     'remote-chat'
  //   );

  //   const chunks = await circuit.streamEvents(
  //     {
  //       Input: 'Tell me a limmerick',
  //     },
  //     {
  //       version: 'v2',
  //     }
  //   );

  //   assert(chunks);

  //   for await (const chunk of chunks) {
  //     // assert(chunk.content, JSON.stringify(chunk));

  //     console.log(chunk.event);
  //   }
  // });

  await kvCleanup();
});
