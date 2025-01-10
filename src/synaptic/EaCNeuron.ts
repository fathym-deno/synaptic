// deno-lint-ignore-file no-explicit-any
import { Runnable, RunnableConfig } from '../runtime/langwrap/.deps.ts';
import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

/**
 * Represents a neuron-like structure in the Everything as Code (EaC) framework.
 *
 * A neuron-like structure can be:
 * - A complete `EaCNeuron`.
 * - A partial `EaCNeuron`.
 * - A string identifier.
 * - A tuple containing a string identifier and another neuron-like structure.
 */
export type EaCNeuronLike =
  | EaCNeuron<any>
  | Partial<EaCNeuron<any>>
  | string
  | [string, EaCNeuronLike];

/**
 * Schema for `EaCNeuronLike`.
 * Validates neuron-like structures, including full or partial neurons, string identifiers, and tuples.
 */
export const EaCNeuronLikeSchema: z.ZodType<EaCNeuronLike> = z.lazy(() =>
  z.union([
    EaCNeuronSchema, // Full `EaCNeuron`
    EaCNeuronSchema.partial(), // Partial `EaCNeuron`
    z.string(), // String identifier
    z.tuple([z.string(), z.lazy(() => EaCNeuronLikeSchema)]), // Tuple of string and another neuron-like
  ])
);

/**
 * Type guard for `EaCNeuronLike`.
 * Validates if the given object conforms to the `EaCNeuronLike` structure.
 *
 * @param value - The object to validate.
 * @returns True if the object is a valid `EaCNeuronLike`, false otherwise.
 */
export function isEaCNeuronLike(value: unknown): value is EaCNeuronLike {
  return EaCNeuronLikeSchema.safeParse(value).success;
}

/**
 * Validates and parses an object as `EaCNeuronLike`.
 *
 * @param value - The object to validate and parse.
 * @throws If the object does not conform to the `EaCNeuronLike` schema.
 * @returns The parsed `EaCNeuronLike` object.
 */
export function parseEaCNeuronLike(value: unknown): EaCNeuronLike {
  return EaCNeuronLikeSchema.parse(value);
}

/**
 * Represents a neuron in the Everything as Code (EaC) framework.
 *
 * Extends `EaCVertexDetails` and includes properties for bootstrapping, configuration,
 * nested neurons, synapses, and a neuron-specific `Type`.
 *
 * @template TType - The type of the neuron.
 */
export type EaCNeuron<TType = unknown> = {
  Bootstrap?: (
    runnable: Runnable,
    neuron: EaCNeuron<TType>
  ) => Runnable | Promise<Runnable>;

  BootstrapInput?: <TIn, TOut>(
    input: TIn,
    neuron: EaCNeuron<TType>,
    options?: Record<string, any> & { config?: RunnableConfig }
  ) => TOut | Promise<TOut>;

  BootstrapOutput?: <TIn, TOut>(
    input: TIn,
    neuron: EaCNeuron<TType>,
    options?: Record<string, any> & { config?: RunnableConfig }
  ) => TOut | Promise<TOut>;

  Configure?: <TIn>(
    runnable: Runnable,
    input: TIn,
    neuron: EaCNeuron<TType>,
    options?: Record<string, any> & { config?: RunnableConfig }
  ) => Runnable | Promise<Runnable>;

  Neurons?: Record<string, EaCNeuronLike>;

  Synapses?: Record<string, EaCNeuronLike>;

  Type: TType;
} & EaCVertexDetails;

/**
 * Schema for `EaCNeuron`.
 * Validates neuron properties, including bootstrapping, configuration, and nested structures.
 */
export const EaCNeuronSchema: z.ZodObject<
  z.objectUtil.extendShape<
    {
      Description: z.ZodOptional<z.ZodString>;
      Name: z.ZodOptional<z.ZodString>;
    },
    {
      // Bootstrap: z.ZodOptional<
      //   z.ZodFunction<
      //     z.ZodTuple<[z.ZodTuple<[z.ZodAny, z.ZodAny], null>], z.ZodUnknown>,
      //     z.ZodAny
      //   >
      // >;
      // BootstrapInput: z.ZodOptional<
      //   z.ZodFunction<
      //     z.ZodTuple<
      //       [z.ZodTuple<[z.ZodAny, z.ZodAny, z.ZodAny], null>],
      //       z.ZodUnknown
      //     >,
      //     z.ZodAny
      //   >
      // >;
      // BootstrapOutput: z.ZodOptional<
      //   z.ZodFunction<
      //     z.ZodTuple<
      //       [z.ZodTuple<[z.ZodAny, z.ZodAny, z.ZodAny], null>],
      //       z.ZodUnknown
      //     >,
      //     z.ZodAny
      //   >
      // >;
      // Configure: z.ZodOptional<
      //   z.ZodFunction<
      //     z.ZodTuple<
      //       [z.ZodTuple<[z.ZodAny, z.ZodAny, z.ZodAny], null>],
      //       z.ZodUnknown
      //     >,
      //     z.ZodAny
      //   >
      // >;
      // Neurons: z.ZodOptional<
      //   z.ZodRecord<
      //     z.ZodString,
      //     z.ZodLazy<z.ZodType<EaCNeuronLike, z.ZodTypeDef, EaCNeuronLike>>
      //   >
      // >;
      // Synapses: z.ZodOptional<
      //   z.ZodRecord<
      //     z.ZodString,
      //     z.ZodLazy<z.ZodType<EaCNeuronLike, z.ZodTypeDef, EaCNeuronLike>>
      //   >
      // >;
      Type: z.ZodAny;
    }
  >,
  'strip',
  z.ZodTypeAny,
  z.infer<typeof EaCVertexDetailsSchema> & {
    Bootstrap?: (
      runnable: unknown,
      neuron: unknown
    ) => unknown | Promise<unknown>;
    BootstrapInput?: <TIn, TOut>(
      input: TIn,
      neuron: unknown,
      options?: Record<string, any>
    ) => TOut | Promise<TOut>;
    BootstrapOutput?: <TIn, TOut>(
      input: TIn,
      neuron: unknown,
      options?: Record<string, any>
    ) => TOut | Promise<TOut>;
    Configure?: <TIn>(
      runnable: unknown,
      input: TIn,
      neuron: unknown,
      options?: Record<string, any>
    ) => unknown | Promise<unknown>;
    Neurons?: Record<string, unknown>;
    Synapses?: Record<string, unknown>;
    Type: unknown;
  },
  z.infer<typeof EaCVertexDetailsSchema> & {
    Bootstrap?: (
      runnable: unknown,
      neuron: unknown
    ) => unknown | Promise<unknown>;
    BootstrapInput?: <TIn, TOut>(
      input: TIn,
      neuron: unknown,
      options?: Record<string, any>
    ) => TOut | Promise<TOut>;
    BootstrapOutput?: <TIn, TOut>(
      input: TIn,
      neuron: unknown,
      options?: Record<string, any>
    ) => TOut | Promise<TOut>;
    Configure?: <TIn>(
      runnable: unknown,
      input: TIn,
      neuron: unknown,
      options?: Record<string, any>
    ) => unknown | Promise<unknown>;
    Neurons?: Record<string, unknown>;
    Synapses?: Record<string, unknown>;
    Type: unknown;
  }
> = EaCVertexDetailsSchema.extend({
  // Bootstrap: z
  //   .function()
  //   .args(z.tuple([z.any(), z.any()]))
  //   .returns(z.any())
  //   .optional(),
  // BootstrapInput: z
  //   .function()
  //   .args(z.tuple([z.any(), z.any(), z.any()]))
  //   .returns(z.any())
  //   .optional(),
  // BootstrapOutput: z
  //   .function()
  //   .args(z.tuple([z.any(), z.any(), z.any()]))
  //   .returns(z.any())
  //   .optional(),
  // Configure: z
  //   .function()
  //   .args(z.tuple([z.any(), z.any(), z.any()]))
  //   .returns(z.any())
  //   .optional(),
  // Neurons: z
  //   .record(
  //     z.string(),
  //     z.lazy(() => EaCNeuronLikeSchema)
  //   )
  //   .optional(),
  // Synapses: z
  //   .record(
  //     z.string(),
  //     z.lazy(() => EaCNeuronLikeSchema)
  //   )
  //   .optional(),
  Type: z.any(),
}).describe(
  'Schema for EaCNeuron, defining bootstrapping, configuration, nested neurons, synapses, and type-specific properties.'
);

/**
 * Type guard for `EaCNeuron`.
 * Validates if the given object conforms to the `EaCNeuron` structure.
 *
 * @param type - The expected neuron type.
 * @param details - The object to validate.
 * @returns True if the object is a valid `EaCNeuron<TType>`, false otherwise.
 */
export function isEaCNeuron<TType = unknown>(
  type: TType,
  details: unknown
): details is EaCNeuron<TType> {
  const result = EaCNeuronSchema.safeParse(details);
  return result.success && (!type || result.data.Type === type);
}

/**
 * Validates and parses an object as `EaCNeuron`.
 *
 * @param details - The object to validate and parse.
 * @throws If the object does not conform to the `EaCNeuronSchema`.
 * @returns The parsed `EaCNeuron<TType>` object.
 */
export function parseEaCNeuron<TType = unknown>(
  details: unknown
): EaCNeuron<TType> {
  return EaCNeuronSchema.parse(details) as EaCNeuron<TType>;
}
