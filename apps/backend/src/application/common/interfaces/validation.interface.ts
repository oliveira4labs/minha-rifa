/** Regra de um campo: devolve a mensagem de erro, ou null se válido. */
export type FieldCheck = (value: unknown) => string | null;

/** Normaliza o valor bruto do JSON antes de validar (trim, só dígitos, número…). */
export type FieldNormalizer = (value: unknown) => unknown;
