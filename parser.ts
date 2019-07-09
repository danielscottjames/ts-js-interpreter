import * as ts from "typescript";
import { STATEMENT, BLOCK_STATEMENT, EXPRESSION } from "./types";

export function parse(code: string): STATEMENT[] {
    const sourcefile = ts.createSourceFile('index.js', code, ts.ScriptTarget.ES5);
    return mapAndFilter(sourcefile.statements, parseNode);
}

function mapAndFilter<G extends ts.Node, H>(list: ts.NodeArray<G>, fn: (a: G) => H|undefined): H[] {
    return list.map(fn).filter(<H>(a: H|undefined|null): a is H => !!a);
}

function operatorTokenToOperator(token: ts.Token<ts.BinaryOperator>) {
    switch (token.kind) {
        case ts.SyntaxKind.PlusToken:
            return 'ADD';
        case ts.SyntaxKind.MinusToken:
            return 'SUBTRACT';
        case ts.SyntaxKind.LessThanToken:
            return 'LESS_THAN';
        default:
            throw new Error(`Unknown binary operator token ${token.kind}: ${token.getText()}`);
    }
}

function parseNode(node: ts.Node): STATEMENT|undefined {
    if (node.kind == ts.SyntaxKind.FunctionDeclaration) {
        const functionDeclaration = node as ts.FunctionDeclaration;
        return {
            type: 'FUNCTION_DECLARATION',
            name: functionDeclaration.name!.text,
            params: functionDeclaration.parameters.map(parameter => (parameter.name as ts.Identifier).text),
            body: parseNode(functionDeclaration.body!)! as BLOCK_STATEMENT
        }
    }
    if (node.kind == ts.SyntaxKind.Block) {
        const block = node as ts.Block;
        return {
            type: 'BLOCK',
            body: mapAndFilter(block.statements, parseNode),
        }
    }
    if (node.kind == ts.SyntaxKind.IfStatement) {
        const ifStatement = node as ts.IfStatement;
        return {
            type: 'IF',
            condition: parseNode(ifStatement.expression)! as EXPRESSION,
            body: parseNode(ifStatement.thenStatement)!,
            else: ifStatement.elseStatement ? parseNode(ifStatement.elseStatement) : undefined,
        }
    }
    if (node.kind == ts.SyntaxKind.Identifier) {
        return {
            type: 'REFERENCE',
            label: (node as ts.Identifier).text,
        }
    }
    if (node.kind == ts.SyntaxKind.ReturnStatement) {
        const returnStatement = node as ts.ReturnStatement;
        return {
            type: 'RETURN',
            rhs: returnStatement.expression ? parseNode(returnStatement.expression) as EXPRESSION : undefined,
        }
    }
    if (node.kind == ts.SyntaxKind.BinaryExpression) {
        const binaryExpression = node as ts.BinaryExpression;
        const lhs = parseNode(binaryExpression.left)! as EXPRESSION;
        const rhs = parseNode(binaryExpression.right)! as EXPRESSION;
        return {
            type: "BINARY_EXPRESSION",
            lhs, rhs,
            operator: operatorTokenToOperator(binaryExpression.operatorToken)
        }
    }
    if (node.kind == ts.SyntaxKind.CallExpression) {
        const callExpression = node as ts.CallExpression;
        return {
            type: "CALL",
            lhs: parseNode(callExpression.expression)! as EXPRESSION,
            args: mapAndFilter(callExpression.arguments, parseNode) as EXPRESSION[],
        }
    }
    if (node.kind == ts.SyntaxKind.NumericLiteral) {
        const numericLiteral = node as ts.NumericLiteral;
        return {
            type: "NUMBER_LITERAL",
            value: Number(numericLiteral.text)
        }
    }
    if (node.kind == ts.SyntaxKind.ExpressionStatement) {
        return parseNode((node as ts.ExpressionStatement).expression);
    }
    return undefined;
}