import * as ts from 'typescript';
import {
  STATEMENT,
  BLOCK_STATEMENT,
  EXPRESSION,
  UNDEFINED,
  LITERAL,
} from './types';

const UNDEFINED_LITERAL = {
  type: 'UNDEFINED',
} as LITERAL;

let sourceFile: ts.SourceFile;
export function parse(code: string): STATEMENT[] {
  sourceFile = ts.createSourceFile('index.js', code, ts.ScriptTarget.ES5);
  return sourceFile.statements.map(parseNode);
}

function getNodeText(node: ts.Node) {
  return sourceFile.text.substring(node.pos, node.end);
}

function operatorTokenToOperator(token: ts.Token<ts.BinaryOperator>) {
  switch (token.kind) {
    case ts.SyntaxKind.PlusToken:
      return 'ADD';
    case ts.SyntaxKind.MinusToken:
      return 'SUBTRACT';
    case ts.SyntaxKind.LessThanToken:
      return 'LESS_THAN';
    case ts.SyntaxKind.EqualsToken:
      return 'EQUALS';
    default:
      throw new Error(
        `Unknown binary operator token ${token.kind}: ${getNodeText(token)}`
      );
  }
}

function parseNode(node: ts.Node): STATEMENT {
  if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
    const functionDeclaration = node as ts.FunctionDeclaration;
    return {
      type: 'FUNCTION_DECLARATION',
      name: functionDeclaration.name!.text,
      params: functionDeclaration.parameters.map(
        parameter => (parameter.name as ts.Identifier).text
      ),
      body: parseNode(functionDeclaration.body!) as BLOCK_STATEMENT,
    };
  }
  if (node.kind === ts.SyntaxKind.Block) {
    const block = node as ts.Block;
    return {
      type: 'BLOCK',
      body: block.statements.map(parseNode),
    };
  }
  if (node.kind === ts.SyntaxKind.IfStatement) {
    const ifStatement = node as ts.IfStatement;
    return {
      type: 'IF',
      condition: parseNode(ifStatement.expression) as EXPRESSION,
      body: parseNode(ifStatement.thenStatement),
      else: ifStatement.elseStatement
        ? parseNode(ifStatement.elseStatement)
        : undefined,
    };
  }
  if (node.kind === ts.SyntaxKind.Identifier) {
    return {
      type: 'REFERENCE',
      label: (node as ts.Identifier).text,
    };
  }
  if (node.kind === ts.SyntaxKind.ReturnStatement) {
    const returnStatement = node as ts.ReturnStatement;
    return {
      type: 'RETURN',
      rhs: returnStatement.expression
        ? (parseNode(returnStatement.expression) as EXPRESSION)
        : undefined,
    };
  }
  if (node.kind === ts.SyntaxKind.BinaryExpression) {
    const binaryExpression = node as ts.BinaryExpression;
    const lhs = parseNode(binaryExpression.left) as EXPRESSION;
    const rhs = parseNode(binaryExpression.right) as EXPRESSION;
    return {
      type: 'BINARY_EXPRESSION',
      lhs,
      rhs,
      operator: operatorTokenToOperator(binaryExpression.operatorToken),
    };
  }
  if (node.kind === ts.SyntaxKind.CallExpression) {
    const callExpression = node as ts.CallExpression;
    return {
      type: 'CALL',
      lhs: parseNode(callExpression.expression) as EXPRESSION,
      args: callExpression.arguments.map(parseNode) as EXPRESSION[],
    };
  }
  if (node.kind === ts.SyntaxKind.NumericLiteral) {
    const numericLiteral = node as ts.NumericLiteral;
    return {
      type: 'NUMBER_LITERAL',
      value: Number(numericLiteral.text),
    };
  }
  if (node.kind === ts.SyntaxKind.VariableStatement) {
    const varStatement = node as ts.VariableStatement;
    // TODO: not really a block
    return {
      type: 'BLOCK',
      body: varStatement.declarationList.declarations.map(declaration => {
        return {
          type: 'VAR',
          lhs: (declaration.name as ts.Identifier).text,
          rhs: declaration.initializer
            ? parseNode(declaration.initializer)
            : UNDEFINED_LITERAL,
        } as STATEMENT;
      }),
    };
  }
  if (ts.isFunctionExpression(node)) {
    return {
      type: 'FUNCTION',
      name: node.name ? node.name.text : undefined,
      params: node.parameters.map(
        parameter => (parameter.name as ts.Identifier).text
      ),
      body: parseNode(node.body!) as BLOCK_STATEMENT,
    };
  }
  if (node.kind === ts.SyntaxKind.ExpressionStatement) {
    return parseNode((node as ts.ExpressionStatement).expression);
  }

  throw new Error(`Unknown node ${node.kind}: ${getNodeText(node)}`);
}
