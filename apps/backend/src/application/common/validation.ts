import { applyDecorators } from '@nestjs/common';
import { Expose, Transform } from 'class-transformer';
import { ValidateBy } from 'class-validator';
import type { FieldCheck, FieldNormalizer } from './interfaces/validation.interface.js';

function Field(name: string, normalize: FieldNormalizer, check?: FieldCheck) {
  const decorators: PropertyDecorator[] = [Expose(), Transform(({ value }) => normalize(value))];
  if (check) {
    decorators.push(ValidateBy({
      name,
      validator: {
        validate: (value) => check(value) === null,
        defaultMessage: (args) => check(args?.value) ?? '',
      },
    }));
  }
  return applyDecorators(...decorators);
}

const trimmed: FieldNormalizer = (v) => (typeof v === 'string' ? v.trim() : '');
const onlyDigits: FieldNormalizer = (v) => String(v ?? '').replace(/\D/g, '');
const isEmpty = (v: unknown) => v == null || v === '';

export const RequiredText = (label: string, max: number) =>
  Field('requiredText', trimmed, (v) => {
    const s = v as string;
    if (!s) return `Preencha o campo "${label}".`;
    if (s.length > max) return `O campo "${label}" é muito longo.`;
    return null;
  });

export const OptionalText = (label: string, max: number) =>
  Field('optionalText', trimmed, (v) => ((v as string).length > max ? `O campo "${label}" é muito longo.` : null));

export const Phone = (label: string) =>
  Field('phone', onlyDigits, (v) => {
    const d = v as string;
    return d.length < 10 || d.length > 13 ? `Informe um ${label} válido, com DDD.` : null;
  });

const intRangeMessage = (label: string, min: number, max: number) =>
  `"${label}" deve ser um número entre ${min} e ${max}.`;

const isIntInRange = (n: unknown, min: number, max: number) =>
  typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max;

export const IntInRange = (label: string, min: number, max: number) =>
  Field('intInRange', (v) => Number(v), (n) => (isIntInRange(n, min, max) ? null : intRangeMessage(label, min, max)));

export const OptionalIntInRange = (label: string, min: number, max: number) =>
  Field(
    'optionalIntInRange',
    (v) => (isEmpty(v) ? null : Number(v)),
    (n) => (n === null || isIntInRange(n, min, max) ? null : intRangeMessage(label, min, max)),
  );

export const Email = ({ checkFormat }: { checkFormat: boolean }) =>
  Field('email', (v) => (trimmed(v) as string).toLowerCase(), (v) => {
    const s = v as string;
    if (!s) return 'Preencha o campo "E-mail".';
    if (s.length > 160) return 'O campo "E-mail" é muito longo.';
    if (checkFormat && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'Informe um e-mail válido.';
    return null;
  });

export const Password = (minLength: number) =>
  Field('password', (v) => (typeof v === 'string' ? v : ''), (v) =>
    ((v as string).length < minLength ? `A senha deve ter pelo menos ${minLength} caracteres.` : null));

export const NonEmptyList = (message: string) =>
  Field('nonEmptyList', (v) => v, (v) => (Array.isArray(v) && v.length > 0 ? null : message));

export const Raw = (normalize: FieldNormalizer = (v) => v) => Field('raw', normalize);

export const asArray: FieldNormalizer = (v) => (Array.isArray(v) ? v : []);
