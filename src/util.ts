import { ENV, VALUE } from './types';

export function lookup(label: string, env: ENV): VALUE {
  if (env.bindings.has(label)) {
    return env.bindings.get(label)!;
  } else if (env.parent) {
    return lookup(label, env.parent);
  } else {
    return {
      type: 'ERROR',
      message: `ReferenceError: ${label} is not defined`,
    };
  }
}

export function typeOf(value: VALUE): string {
  return value.type.toLowerCase();
}

export function string(value: VALUE) {
  switch (value.type) {
    case 'UNDEFINED':
    case 'NULL':
      return value.type.toLowerCase();
    case 'OBJECT':
      return '[object Object]';
    case 'LAMBDA':
      return 'function';
    case 'ERROR':
      return `ERROR: ${value.message}`;
    case 'NUMBER':
    case 'STRING':
    case 'BOOLEAN':
      return value.value.toString();
    default:
      throw new IncompleteSwitch(value);
  }
}

export function truthy(value: VALUE): boolean {
  switch (value.type) {
    case 'BOOLEAN':
      return value.value;
    case 'UNDEFINED':
    case 'NULL':
      return false;
    case 'OBJECT':
    case 'LAMBDA':
    case 'ERROR':
      return true;
    case 'NUMBER':
    case 'STRING':
      return value.value ? true : false;
    default:
      throw new IncompleteSwitch(value);
  }
}

export class IncompleteSwitch extends Error {
  constructor(val: never) {
    super(`Incomplete Switch: ${val}`);
  }
}
