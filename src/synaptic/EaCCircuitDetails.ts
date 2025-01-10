// deno-lint-ignore-file no-explicit-any
import {
  Runnable,
  RunnableConfig,
} from '../runtime/langwrap/.deps.langchain.ts';
import {
  EaCVertexDetails,
  EaCVertexDetailsSchema,
  z,
  ZodType,
} from './.deps.ts';
import { EaCNeuronLike, EaCNeuronLikeSchema } from './EaCNeuron.ts';

/**
 * Represents circuit details in the Everything as Code (EaC) framework.
 *
 * Extends `EaCVertexDetails` and includes properties such as `Bootstrap`, `InputSchema`,
 * `Neurons`, `Synapses`, and circuit-specific `Type`.
 *
 * @template TType - The type of the circuit.
 */
export type EaCCircuitDetails<TType = unknown> = {
  /** Optional bootstrap function for initializing the circuit. */
  Bootstrap?: (
    runnable: Runnable,
    circuitDetails: EaCCircuitDetails<TType>
  ) => Runnable | Promise<Runnable>;

  /** Optional input bootstrap function. */
  BootstrapInput?: <TIn, TOut>(
    input: TIn,
    circuitDetails: EaCCircuitDetails<TType>,
    options?:
      | (Record<string, any> & { config?: RunnableConfig })
      | Record<string, any>
      | (Record<string, any> & { config: RunnableConfig } & RunnableConfig)
  ) => TOut | Promise<TOut>;

  /** Optional output bootstrap function. */
  BootstrapOutput?: <TIn, TOut>(
    input: TIn,
    circuitDetails: EaCCircuitDetails<TType>,
    options?:
      | (Record<string, any> & { config?: RunnableConfig })
      | Record<string, any>
      | (Record<string, any> & { config: RunnableConfig } & RunnableConfig)
  ) => TOut | Promise<TOut>;

  /** Schema defining the expected input structure for the circuit. */
  InputSchema?: ZodType<any>;

  /** Indicates whether the circuit is callable. */
  IsCallable?: boolean;

  /** A collection of neurons associated with the circuit. */
  Neurons?: Record<string, EaCNeuronLike>;

  /** A collection of synapses associated with the circuit. */
  Synapses?: Record<string, EaCNeuronLike>;

  /** The type of the circuit. */
  Type: TType;
} & EaCVertexDetails;

/**
 * Schema for `EaCCircuitDetails`.
 * Validates the structure, ensuring compatibility with `EaCVertexDetails` and circuit-specific properties.
 */
export const EaCCircuitDetailsSchema: z.ZodObject<
  {
    Bootstrap: z.ZodOptional<
      z.ZodFunction<
        z.ZodTuple<
          [z.ZodTuple<[z.ZodTuple<[z.ZodAny, z.ZodAny], null>], null>],
          z.ZodUnknown
        >,
        z.ZodAny
      >
    >;
    // BootstrapInput: z.ZodOptional<
    //   z.ZodFunction<
    //     z.ZodTuple<[z.ZodAny, z.ZodAny, z.ZodAny], z.ZodUnknown>,
    //     z.ZodAny
    //   >
    // >;
    // BootstrapOutput: z.ZodOptional<
    //   z.ZodFunction<
    //     z.ZodTuple<[z.ZodAny, z.ZodAny, z.ZodAny], z.ZodUnknown>,
    //     z.ZodAny
    //   >
    // >;
    // InputSchema: z.ZodOptional<z.ZodType<any>>;
    // IsCallable: z.ZodOptional<z.ZodBoolean>;
    // Neurons: z.ZodOptional<
    //   z.ZodRecord<z.ZodString, typeof EaCNeuronLikeSchema>
    // >;
    // Synapses: z.ZodOptional<
    //   z.ZodRecord<z.ZodString, typeof EaCNeuronLikeSchema>
    // >;
    // Type: z.ZodAny;
    // Name: z.ZodOptional<z.ZodString>;
    // Description: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  EaCCircuitDetails,
  EaCCircuitDetails
>;
export const EaCCircuitDetailsSchemas = EaCVertexDetailsSchema.extend({
  Bootstrap: z
    .function()
    .args(z.tuple([z.tuple([z.any(), z.any()])]))
    .returns(z.any())
    .optional(),
  BootstrapInput: z
    .function()
    .args(z.tuple([z.any(), z.any(), z.any()]))
    .returns(z.any())
    .optional(),
  BootstrapOutput: z
    .function()
    .args(z.tuple([z.any(), z.any(), z.any()]))
    .returns(z.any())
    .optional(),
  InputSchema: z.any().optional(),
  IsCallable: z.boolean().optional(),
  Neurons: z.record(z.string(), EaCNeuronLikeSchema).optional(),
  Synapses: z.record(z.string(), EaCNeuronLikeSchema).optional(),
  Type: z.any(),
}).describe(
  'Schema for EaCCircuitDetails, extending EaCVertexDetails and defining properties for circuit initialization, neurons, synapses, and input schema.'
);

/**
 * Type guard for `EaCCircuitDetails`.
 * Validates if the given object conforms to the `EaCCircuitDetails` structure.
 *
 * @param details - The object to validate.
 * @returns True if the object is a valid `EaCCircuitDetails`, false otherwise.
 */
export function isEaCCircuitDetails<TType = unknown>(
  details: unknown
): details is EaCCircuitDetails<TType> {
  return EaCCircuitDetailsSchema.safeParse(details).success;
}

/**
 * Validates and parses an object as `EaCCircuitDetails`.
 *
 * @param details - The object to validate and parse.
 * @throws If the object does not conform to the `EaCCircuitDetailsSchema`.
 * @returns The parsed `EaCCircuitDetails<TType>` object.
 */
export function parseEaCCircuitDetails<TType = unknown>(
  details: unknown
): EaCCircuitDetails<TType> {
  return EaCCircuitDetailsSchema.parse(details) as EaCCircuitDetails<TType>;
}
