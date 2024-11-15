import { assert, EverythingAsCodeDenoKV, Runnable } from "../../tests.deps.ts";
import { buildTestIoC } from "../../test-eac-setup.ts";
import { EaCCircuitNeuron } from "../../../src/eac/neurons/EaCCircuitNeuron.ts";
import { EverythingAsCodeSynaptic } from "../../../src/eac/EverythingAsCodeSynaptic.ts";

Deno.test("Circuits", async (t) => {
  const eac = {
    Circuits: {
      $neurons: {},
      $remotes: {
        "fathym|azure": "http://localhost:6151/all-circuits/",
      },
      "remote-chat": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            "": {
              Type: "Circuit",
              CircuitLookup: "fathym|azure|test",
            } as EaCCircuitNeuron,
          },
        },
      },
      "remote-chat-sub": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            "": {
              Type: "Circuit",
              CircuitLookup: "fathym|azure|test-sub",
            } as EaCCircuitNeuron,
          },
        },
      },
    },
  } as EverythingAsCodeSynaptic & EverythingAsCodeDenoKV;

  const { ioc, kvCleanup } = await buildTestIoC(eac, undefined, false);

  await t.step("Remote Chat Circuit - Invoke", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "remote-chat",
    );

    const chunk = await circuit.invoke({
      Input: "Tell me a limmerick",
    });

    assert(chunk.content, JSON.stringify(chunk));

    console.log(chunk.content);
  });

  await t.step("Remote Chat Circuit - Stream", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "remote-chat",
    );

    const chunks = await circuit.stream({
      Input: "Tell me a limmerick",
    });

    assert(chunks);

    for await (const chunk of chunks) {
      // assert(chunk.content, JSON.stringify(chunk));

      console.log(chunk.content);
    }
  });

  await t.step("Remote Chat Circuit - Stream Events", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "remote-chat",
    );

    const chunks = await circuit.streamEvents(
      {
        Input: "Tell me a limmerick",
      },
      {
        version: "v2",
      },
    );

    assert(chunks);

    for await (const chunk of chunks) {
      // assert(chunk.content, JSON.stringify(chunk));

      console.log(chunk.event);
    }
  });

  await t.step("Remote Sub Chat Circuit - Invoke", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "remote-chat-sub",
    );

    const chunk = await circuit.invoke({
      Input: "Tell me a haiku",
    });

    assert(chunk.content, JSON.stringify(chunk));

    console.log(chunk.content);
  });

  await t.step("Remote Sub Chat Circuit - Stream", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "remote-chat-sub",
    );

    const chunks = await circuit.stream({
      Input: "Tell me a haiku",
    });

    assert(chunks);

    for await (const chunk of chunks) {
      // assert(chunk.content, JSON.stringify(chunk));

      console.log(chunk.content);
    }
  });

  await t.step("Remote Sub Chat Circuit - Stream Events", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "remote-chat-sub",
    );

    const chunks = await circuit.streamEvents(
      {
        Input: "Tell me a limmerick",
      },
      {
        version: "v2",
      },
    );

    assert(chunks);

    for await (const chunk of chunks) {
      // assert(chunk.content, JSON.stringify(chunk));

      chunk.data?.chunk?.content ? console.log(chunk.data.chunk.content) : "";
    }
  });

  await kvCleanup();
});
