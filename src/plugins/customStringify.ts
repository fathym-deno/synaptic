// deno-lint-ignore-file no-explicit-any
export function customStringify(obj: any): string {
  function serialize(value: any): any {
    if (value && typeof value === "object") {
      if ("lc_serializable" in value) {
        value.type = value.constructor.name;
      }

      if (Array.isArray(value)) {
        // Handle arrays
        return value.map(serialize);
      } else {
        // Handle objects
        const plainObject: any = {};
        for (const key in value) {
          // if (value.hasOwnProperty(key)) {
          plainObject[key] = serialize(value[key]);
          // }
          if (key === "lc_name") {
            plainObject["type"] = value[key];
          }
        }
        return plainObject;
      }
    } else {
      // Return the value directly for non-object types
      return value;
    }
  }

  // Serialize the input object and convert it to a JSON string
  return JSON.stringify(serialize(obj));
}
