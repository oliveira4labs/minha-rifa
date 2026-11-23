export const CONFIG_KEYS = {
  createUser: 'createUser',
} as const;

export const isDisabled = (value: string | null): boolean => value?.trim().toLowerCase() === 'disabled';
