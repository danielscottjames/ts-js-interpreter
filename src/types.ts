declare interface STRING_LITERAL {
  type: 'STRING_LITERAL';
  value: string;
}
declare interface NUMBER_LITERAL {
  type: 'NUMBER_LITERAL';
  value: number;
}
declare interface BOOLEAN_LITERAL {
  type: 'BOOLEAN_LITERAL';
  value: boolean;
}
declare interface UNDEFINED_LITERAL {
  type: 'UNDEFINED';
}
declare interface NULL_LITERAL {
  type: 'NULL';
}
declare interface OBJECT_LITERAL {
  type: 'OBJECT_LITERAL';
  properties: Array<[string, EXPRESSION]>;
}
export declare type LITERAL =
  | STRING_LITERAL
  | NUMBER_LITERAL
  | BOOLEAN_LITERAL
  | UNDEFINED_LITERAL
  | NULL_LITERAL
  | OBJECT_LITERAL;

declare interface REFERENCE {
  type: 'REFERENCE';
  label: string;
}
export declare interface OBJECT_REFERENCE {
  // Also, arrays and stuff like that
  type: 'OBJECT_REFERENCE';
  lhs: EXPRESSION;
  rhs: EXPRESSION;
}
declare interface FUNCTION {
  type: 'FUNCTION';
  name?: string;
  params: string[];
  body: BLOCK_STATEMENT;
}
declare interface BINARY_EXPRESSION {
  type: 'BINARY_EXPRESSION';
  operator: 'ADD' | 'SUBTRACT' | 'LESS_THAN' | 'EQUALS' | 'EQUALSEQUALS';
  lhs: EXPRESSION;
  rhs: EXPRESSION;
}
declare interface CALL {
  type: 'CALL';
  lhs: EXPRESSION;
  args: EXPRESSION[];
  this?: never;
}

export declare type EXPRESSION =
  | CALL
  | BINARY_EXPRESSION
  | REFERENCE
  | OBJECT_REFERENCE
  | LITERAL
  | FUNCTION;

declare interface RETURN {
  type: 'RETURN';
  rhs?: EXPRESSION;
}
declare interface IF {
  type: 'IF';
  condition: EXPRESSION;
  body: STATEMENT;
  else?: IF | STATEMENT;
}
declare interface VAR {
  type: 'VAR';
  lhs: string;
  rhs: EXPRESSION;
}
declare interface FUNCTION_DECLARATION {
  type: 'FUNCTION_DECLARATION';
  name: string;
  params: string[];
  body: BLOCK_STATEMENT;
}
export declare interface BLOCK_STATEMENT {
  type: 'BLOCK';
  body: STATEMENT[];
}
export const BLOCK = (body: STATEMENT[]): BLOCK_STATEMENT => ({
  type: 'BLOCK',
  body,
});

export declare type STATEMENT =
  | RETURN
  | FUNCTION_DECLARATION
  | VAR
  | IF
  | BLOCK_STATEMENT
  | EXPRESSION;

declare interface NUMBER {
  type: 'NUMBER';
  value: number;
}
declare interface BOOLEAN {
  type: 'BOOLEAN';
  value: boolean;
}
declare interface STRING {
  type: 'STRING';
  value: string;
}
declare interface UNDEFINED {
  type: 'UNDEFINED';
}
declare interface NULL {
  type: 'NULL';
}
declare interface ERROR {
  // TODO, technically, not a value.
  type: 'ERROR';
  message: string;
}
declare interface LAMBDA {
  type: 'LAMBDA';
  body: BLOCK_STATEMENT;
  env: ENV;
  params: string[];
  properties: Map<string, VALUE>; // because there is no god
}
declare interface OBJECT {
  type: 'OBJECT';
  // prototype: ...
  properties: Map<string, VALUE>;
}
export declare type VALUE =
  | NUMBER
  | BOOLEAN
  | STRING
  | UNDEFINED
  | NULL
  | LAMBDA
  | ERROR
  | OBJECT;

export declare interface ENV {
  parent?: ENV;
  bindings: Map<string, VALUE>;
}

export const UNDEFINED: UNDEFINED = { type: 'UNDEFINED' };
export const NULL: NULL = { type: 'NULL' };
export const LAMBDA = (
  body: BLOCK_STATEMENT,
  params: string[],
  env: ENV
): LAMBDA => {
  return { type: 'LAMBDA', body, params, env, properties: new Map() };
};
export const OBJECT = (): OBJECT => ({ type: 'OBJECT', properties: new Map() });
export const NUMBER = (value: number): NUMBER => ({ type: 'NUMBER', value });
export const BOOLEAN = (value: boolean): BOOLEAN => ({
  type: 'BOOLEAN',
  value,
});
export const STRING = (value: string): STRING => ({ type: 'STRING', value });

// Use errors for exceptional control flow
export class FunctionReturnValue {
  constructor(readonly value: VALUE) {}
}
export class ThrowValue {
  constructor(readonly value: VALUE) {
    // TODO: Uncaught value.toString()
  }
}
