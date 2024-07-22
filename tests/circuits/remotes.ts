import { assert, EverythingAsCodeDatabases, Runnable } from '../tests.deps.ts';
import { buildTestIoC } from '../test-eac-setup.ts';
import { EaCCircuitNeuron } from '../../src/eac/neurons/EaCCircuitNeuron.ts';
import { EverythingAsCodeSynaptic } from '../../src/eac/EverythingAsCodeSynaptic.ts';

Deno.test('Circuits', async (t) => {
  const eac = {
    Circuits: {
      $neurons: {},
      $remotes: {
        thinky: 'http://localhost:6132/circuits/',
      },
      'remote-chat': {
        Details: {
          Type: 'Linear',
          Priority: 100,
          Neurons: {
            '': {
              Type: 'Circuit',
              CircuitLookup: 'thinky:thinky',
            } as EaCCircuitNeuron,
          },
        },
      },
    },
  } as EverythingAsCodeSynaptic & EverythingAsCodeDatabases;

  const { ioc, kvCleanup } = await buildTestIoC(eac);

  const sessionId = 'test';

  await t.step('Remote Chat Circuit - Invoke', async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol('Circuit'),
      'remote-chat'
    );

    const chunk = await circuit.invoke(
      {
        input: 'What is the weather in sf?',
      },
      { configurable: { sessionId } }
    );

    assert(chunk.content, JSON.stringify(chunk));

    console.log(chunk.content);
  });

  // await t.step('Remote Chat Circuit - Stream', async () => {
  //   const circuit = await ioc.Resolve<Runnable>(
  //     ioc.Symbol('Circuit'),
  //     'remote-chat'
  //   );

  //   const chunks = await circuit.stream(
  //     {
  //       messages: [
  //         [
  //           'human',
  //           'What is the weather in sf?',
  //         ],
  //       ],
  //     },
  //     { configurable: { sessionId } }
  //   );

  //   assert(chunks);

  //   for await (const chunk of chunks) {
  //     // assert(chunk.content, JSON.stringify(chunk));

  //     console.log(chunk.content);
  //   }
  // });

  await kvCleanup();
});
