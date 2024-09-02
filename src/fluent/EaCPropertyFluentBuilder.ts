// export class EaCPropertyFluentBuilder<TProp> {
//   constructor(protected propName: string, protected porpName: TProp) {}

//   public Export(): Record<string, TProp> {
//     return { [this.propName]: this.porpName };
//   }

//   public async With(action: (x: this) => Promise<void>): Promise<this> {
//     await action(this);

//     return this;
//   }
// }
