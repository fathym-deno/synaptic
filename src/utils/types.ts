// deno-lint-ignore-file no-explicit-any
import { z } from "../src.deps.ts";

export type InferSynapticState<T> = {
  [K in keyof T]: T[K] extends { value: (arg1: infer P, ...args: any[]) => any }
    ? P
    : never;
};

export type TypeToZod<T> = {
  [K in keyof T]: T[K] extends string | number | boolean | null | undefined
    ? undefined extends T[K]
      ? z.ZodOptional<z.ZodType<Exclude<T[K], undefined>>>
    : z.ZodType<T[K]>
    : z.ZodObject<TypeToZod<T[K]>>;
};
