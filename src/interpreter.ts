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
  NULL,
  OBJECT_REFERENCE,
} from './types';
import { lookup, truthy, IncompleteSwitch, string, looseyEquals } from './util';

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
      if (statement.operator === 'EQUALSEQUALS') {
        const [lhsV, rhsV] = evaluateLhsRhs(statement, env);
        return BOOLEAN(looseyEquals(lhsV, rhsV));
      }

      if (statement.operator === 'EQUALS') {
        if (statement.lhs.type === 'OBJECT_REFERENCE') {
          const objectReference = statement.lhs;
          const lhsV = evaluate(objectReference.lhs, env);
          if (lhsV.type === 'OBJECT') {
            const propertyName = string(evaluate(objectReference.rhs, env));
            lhsV.properties.set(propertyName, evaluate(statement.rhs, env));
          }
          return UNDEFINED;
        }

        const [lhsV, rhsV] = evaluateLhsRhs(statement, env);

        if (lhsV.type === 'OBJECT') {
        } else if (
          lhsV.type === 'NUMBER' ||
          lhsV.type === 'STRING' ||
          lhsV.type === 'BOOLEAN'
        ) {
          Object.assign(lhsV, rhsV);
        }

        return UNDEFINED;
      }

      const [lhsV, rhsV] = evaluateLhsRhs(statement, env);
      if (lhsV.type !== 'NUMBER' || rhsV.type !== 'NUMBER') {
        return {
          type: 'ERROR',
          message: 'TODO: Both LHS and RHS did not evaluate to a NUMBER',
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
    case 'OBJECT_REFERENCE':
      const lhsV = evaluate(statement.lhs, env);
      if (lhsV.type === 'OBJECT') {
        const propertyName = string(evaluate(statement.rhs, env));
        return lhsV.properties.get(propertyName) || UNDEFINED;
      }
      return UNDEFINED;
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
    case 'NULL':
      return NULL;
    default:
      // TypeScript should assert that this can never happen.
      throw new IncompleteSwitch(statement);
  }
}

function evaluateLhsRhs(
  { lhs, rhs }: { lhs: STATEMENT; rhs: STATEMENT },
  env: ENV
): [VALUE, VALUE] {
  return [evaluate(lhs, env), evaluate(rhs, env)];
}
