declare interface STRING_LITERAL {
    type: 'STRING_LITERAL',
    value: string,
}
declare interface NUMBER_LITERAL {
    type: 'NUMBER_LITERAL',
    value: number,
}
declare interface BOOLEAN_LITERAL {
    type: 'BOOLEAN_LITERAL',
    value: boolean,
}
declare interface OBJECT_LITERAL {
    type: 'OBJECT_LITERAL',
    properties: [string, EXPRESSION][],
}
declare interface REFERENCE {
    type: 'REFERENCE',
    label: string,
}
declare interface VAR {
    type: 'VAR',
    lhs: string,
    rhs: EXPRESSION,
}
declare interface FUNCTION_DECLARATION {
    type: 'FUNCTION_DECLARATION',
    name: string,
    params: string[],
    body: BLOCK_STATEMENT,
}
declare interface FUNCTION {
    type: 'FUNCTION',
    name?: string,
    params: string[],
    body: BLOCK_STATEMENT,
}
declare interface RETURN {
    type: 'RETURN'
    rhs?: EXPRESSION
}
declare interface BINARY_EXPRESSION {
    type: 'BINARY_EXPRESSION',
    operator: 'ADD' | 'SUBTRACT' | 'LESS_THAN',
    lhs: EXPRESSION,
    rhs: EXPRESSION
}
declare interface CALL {
    type: 'CALL',
    lhs: EXPRESSION,
    args: EXPRESSION[],
    this?: never,
}
declare interface IF {
    type: 'IF',
    condition: EXPRESSION,
    body: STATEMENT,
    else?: IF | STATEMENT
}
export declare interface BLOCK_STATEMENT {
    type: 'BLOCK',
    body: STATEMENT[],
}
export const BLOCK = (body: STATEMENT[]): BLOCK_STATEMENT => { return { type: 'BLOCK', body } }

export declare type LITERAL = STRING_LITERAL | NUMBER_LITERAL | BOOLEAN_LITERAL | OBJECT_LITERAL;
export declare type EXPRESSION = CALL | BINARY_EXPRESSION | REFERENCE | LITERAL | FUNCTION;
export declare type STATEMENT = RETURN | FUNCTION_DECLARATION | VAR | EXPRESSION | IF | BLOCK_STATEMENT;



declare interface NUMBER {
    type: 'NUMBER',
    value: number,
}
declare interface BOOLEAN {
    type: 'BOOLEAN',
    value: boolean,
}
declare interface STRING {
    type: 'STRING',
    value: string,
}
declare interface UNDEFINED {
    type: 'UNDEFINED',
}
declare interface NULL {
    type: 'NULL',
}
declare interface ERROR {
    type: 'ERROR',
    message: string,
}
declare interface LAMBDA {
    type: 'LAMBDA',
    body: BLOCK_STATEMENT,
    env: ENV,
    params: string[],
    properties: Map<string, VALUE>, // because there is no god
}
declare interface OBJECT {
    type: 'OBJECT',
    // prototype: ...
    properties: Map<string, VALUE>,
}
export declare type VALUE = NUMBER | BOOLEAN | STRING | UNDEFINED | NULL | LAMBDA | ERROR | OBJECT;

export declare interface ENV {
    parent?: ENV,
    bindings: Map<string, VALUE>,
}

export const UNDEFINED: UNDEFINED = { type: 'UNDEFINED' };
export const NULL: NULL = { type: 'NULL' };
export const LAMBDA = (body: BLOCK_STATEMENT, params: string[], env: ENV): LAMBDA => { 
    return { type: 'LAMBDA', body, params, env, properties: new Map() };
}
export const OBJECT = (): OBJECT => {return { type: 'OBJECT', properties: new Map()}}
export const NUMBER = (value: number): NUMBER => { return { type: 'NUMBER', value } };
export const BOOLEAN = (value: boolean): BOOLEAN => { return { type: 'BOOLEAN', value } };
export const STRING = (value: string): STRING => { return { type: 'STRING', value } };


// Use errors for exceptional control flow
export class FunctionReturnValue {
    constructor(public readonly value: VALUE) {
    }
}
export class ThrowValue {
    constructor(public readonly value: VALUE) {
        // TODO: Uncaught value.toString()
    }
}