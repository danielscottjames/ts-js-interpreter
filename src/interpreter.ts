import {
  ENV,
  VALUE,
  UNDEFINED,
  STATEMENT,
  NUMBER,
  STRING,
  FunctionReturnValue,
  BLOCK_STATEMENT,
  BOOLEAN,
  LAMBDA,
  OBJECT,
} from './types';
import { lookup, truthy, IncompleteSwitch } from './util';

export function execute(statements: STATEMENT[]): VALUE {
  // Setup global ENV
  const env = {
    bindings: new Map(),
  };

  // Returned value is result of last statement.
  let r: VALUE = UNDEFINED;
  statements.forEach(statement => (r = evaluate(statement, env)));
  return r;
}

function call(block: BLOCK_STATEMENT, env: ENV) {
  try {
    block.body.forEach(statement => evaluate(statement, env));
  } catch (e) {
    if (e instanceof FunctionReturnValue) {
      return e.value;
    } else {
      throw e;
    }
  }

  // Return value of a function call is `undefined` without explicit `return` statement
  return UNDEFINED;
}

function evaluate(statement: STATEMENT, env: ENV): VALUE {
  switch (statement.type) {
    case 'FUNCTION_DECLARATION': {
      env.bindings.set(
        statement.name,
        LAMBDA(statement.body, statement.params, env)
      );
      return UNDEFINED;
    }
    case 'FUNCTION': {
      return LAMBDA(statement.body, statement.params, env);
    }
    case 'VAR':
      env.bindings.set(statement.lhs, evaluate(statement.rhs, env));
      return UNDEFINED;
    case 'NUMBER_LITERAL':
      return NUMBER(statement.value);
    case 'STRING_LITERAL':
      return STRING(statement.value);
    case 'BOOLEAN_LITERAL':
      return BOOLEAN(statement.value);
    case 'OBJECT_LITERAL':
      const obj = OBJECT();
      statement.properties.forEach(([name, valueStatement]) => {
        obj.properties.set(name, evaluate(valueStatement, env));
      });
      return obj;
    case 'BINARY_EXPRESSION': {
      const rhsV = evaluate(statement.rhs, env);
      if (statement.operator === 'EQUALS') {
        if (statement.lhs.type === 'REFERENCE') {
          const lhsV = lookup(statement.lhs.label, env);
          if (lhsV.type !== 'ERROR') {
            Object.assign(lhsV, rhsV);
          } else {
            env.bindings.set(statement.lhs.label, rhsV);
          }
        }
        return UNDEFINED;
      }
      const lhsV = evaluate(statement.lhs, env);
      if (lhsV.type !== 'NUMBER' || rhsV.type !== 'NUMBER') {
        return {
          type: 'ERROR',
          message: 'Both LHS and RHS did not evaluate to a NUMBER',
        };
      }
      if (statement.operator === 'LESS_THAN') {
        return BOOLEAN(lhsV.value < rhsV.value);
      }

      if (statement.operator === 'ADD' || statement.operator === 'SUBTRACT') {
        if (statement.operator === 'SUBTRACT') {
          rhsV.value = rhsV.value * -1;
        }

        return {
          type: 'NUMBER',
          value: lhsV.value + rhsV.value,
        };
      }

      return UNDEFINED;
    }
    case 'CALL':
      const lambda = evaluate(statement.lhs, env);
      if (lambda.type !== 'LAMBDA') {
        return {
          type: 'ERROR',
          message: '__ is not a function',
        };
      }
      return call(lambda.body, {
        parent: lambda.env,
        bindings: new Map(
          lambda.params.map((arg, i): [string, VALUE] => [
            arg,
            evaluate(statement.args[i], env),
          ])
        ),
      });
    case 'RETURN':
      throw new FunctionReturnValue(
        statement.rhs ? evaluate(statement.rhs, env) : UNDEFINED
      );
    case 'REFERENCE':
      return lookup(statement.label, env);
    case 'BLOCK':
      statement.body.forEach(s => evaluate(s, env));
      return UNDEFINED;
    case 'IF':
      if (truthy(evaluate(statement.condition, env))) {
        return evaluate(statement.body, env);
      } else if (statement.else) {
        return evaluate(statement.else, env);
      }
      return UNDEFINED;
    case 'UNDEFINED':
      return UNDEFINED;
    default:
      // TypeScript should assert that this can never happen.
      throw new IncompleteSwitch(statement);
  }
}
