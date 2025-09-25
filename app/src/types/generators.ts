import { Idl } from '@coral-xyz/anchor';

export type ExtractDefinedKeys<T> = T extends any
  ? keyof {
      [K in keyof T as T[K] extends Record<string, never> ? K : never]: T[K];
    }
  : never;

export function extractEnumVariants(idl: Idl, enumName: string): string[] {
  if (!idl.types) {
    throw new Error('IDL has no types defined.');
  }

  const enumType = idl.types.find((type) => type.name === enumName);

  if (!enumType || enumType.type.kind !== 'enum') {
    throw new Error(`Enum "${enumName}" not found in IDL`);
  }

  return enumType.type.variants.map((variant) => {
    return variant.name.slice(0, 1).toLowerCase() + variant.name.slice(1);
  });
}
