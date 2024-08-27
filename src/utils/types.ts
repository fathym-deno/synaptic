import { z } from '../src.deps.ts';

// export type InferSynapticState<T> = {
//   [K in keyof T]: T[K] extends { value: (arg1: infer P, ...args: any[]) => any }
//     ? P
//     : never;
// };
// export type InferSynapticState<T> = T extends AnnotationRoot<infer SD>
//   ? {
//       [K in keyof SD]: SD[K] extends ReturnType<typeof Annotation>
//         ? SD[K]['ValueType']
//         : never;
//     }
//   : never;

export type InferSynapticState<T> = T extends {
  State: infer S;
}
  ? S
  : never;

export type TypeToZod<T> = {
  [K in keyof T]: T[K] extends string | number | boolean | null | undefined
    ? undefined extends T[K]
      ? z.ZodOptional<z.ZodType<Exclude<T[K], undefined>>>
      : z.ZodType<T[K]>
    : z.ZodObject<TypeToZod<T[K]>> | z.ZodType<T[K]>;
};
