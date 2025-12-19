import { PluginObj } from "@babel/core";
import * as t from "@babel/types";

/* ------------------ helpers ------------------ */

function extractBlock(
  callback: t.ArrowFunctionExpression
): t.BlockStatement {
  return t.isBlockStatement(callback.body)
    ? callback.body
    : t.blockStatement([t.expressionStatement(callback.body)]);
}

function getSiblingStatements(path: any): t.Statement[] | null {
  const stmt = path.parentPath;
  if (!stmt?.isExpressionStatement()) return null;

  const block = stmt.parentPath;
  if (!block?.isBlockStatement() && !block?.isProgram()) return null;

  return block.node.body as t.Statement[];
}

/* ------------------ aliases ------------------ */

const ALIASES: Record<string, t.MemberExpression> = {
  print: t.memberExpression(t.identifier("console"), t.identifier("log")),
  yap: t.memberExpression(t.identifier("console"), t.identifier("warn")),
  panic: t.memberExpression(t.identifier("console"), t.identifier("error")),
};

/* ------------------ plugin ------------------ */

export default function syntaxAliasPlugin(): PluginObj {
  return {
    name: "basedjs",

    visitor: {
      /* ---------- console aliases ---------- */
      Identifier(path) {
        const replacement = ALIASES[path.node.name];
        if (!replacement) return;

        if (
          path.parentPath.isMemberExpression() ||
          path.parentPath.isObjectProperty() ||
          path.parentPath.isImportSpecifier()
        ) {
          return;
        }

        path.replaceWith(t.cloneNode(replacement));
      },

      /* ---------- call expressions ---------- */
      CallExpression(path) {
        const { callee } = path.node;
        if (!t.isIdentifier(callee)) return;

        /* --- boolean helpers --- */
        if (callee.name === "sus") {
          const [arg] = path.node.arguments;
          if (!t.isExpression(arg)) return;
          path.replaceWith(t.unaryExpression("!", arg));
          return;
        }

        if (callee.name === "lowkey" || callee.name === "highkey") {
          const [a, b] = path.node.arguments;
          if (!t.isExpression(a) || !t.isExpression(b)) return;
          path.replaceWith(
            t.logicalExpression(
              callee.name === "lowkey" ? "&&" : "||",
              a,
              b
            )
          );
          return;
        }

        /* ---------- deadass / bet / orNah ---------- */
        if (callee.name === "deadass") {
          const [condition, callback] = path.node.arguments;
          if (!t.isExpression(condition) || !t.isArrowFunctionExpression(callback)) return;

          const siblings = getSiblingStatements(path);
          if (!siblings) return;

         const parentStmt = path.parentPath;
         if (!parentStmt.isExpressionStatement()) return;

         const stmt = parentStmt.node; // ✅ now typed as ExpressionStatement
         const index = siblings.indexOf(stmt);

          let alternate: t.Statement | null = null;

          let i = index + 1;
          while (i < siblings.length) {
            const next = siblings[i];
            if (!t.isExpressionStatement(next)) break;

            const expr = next.expression;
            if (!t.isCallExpression(expr) || !t.isIdentifier(expr.callee)) break;

            /* bet */
            if (expr.callee.name === "bet") {
              const [cond, cb] = expr.arguments;
              if (!t.isExpression(cond) || !t.isArrowFunctionExpression(cb)) break;

              alternate = t.ifStatement(cond, extractBlock(cb), alternate);
              siblings.splice(i, 1);
              continue;
            }

            /* orNah */
            if (expr.callee.name === "orNah") {
              const [cb] = expr.arguments;
              if (!t.isArrowFunctionExpression(cb)) break;

              alternate = extractBlock(cb);
              siblings.splice(i, 1);
              break;
            }

            break;
          }

          path.parentPath.replaceWith(
            t.ifStatement(condition, extractBlock(callback), alternate)
          );
          return;
        }

        /* ---------- loops ---------- */
        if (callee.name === "runItBack") {
          const [condition, callback] = path.node.arguments;
          if (!t.isExpression(condition) || !t.isArrowFunctionExpression(callback)) return;

          path.replaceWith(
            t.whileStatement(condition, extractBlock(callback))
          );
          return;
        }

        if (callee.name === "spinBack") {
          const [count, callback] = path.node.arguments;
          if (!t.isNumericLiteral(count) || !t.isArrowFunctionExpression(callback)) return;

          const index =
            callback.params[0] && t.isIdentifier(callback.params[0])
              ? callback.params[0]
              : t.identifier("i");

          path.replaceWith(
            t.forStatement(
              t.variableDeclaration("let", [
                t.variableDeclarator(index, t.numericLiteral(0)),
              ]),
              t.binaryExpression("<", index, count),
              t.updateExpression("++", index),
              extractBlock(callback)
            )
          );
          return;
        }

        /* ---------- IIFEs ---------- */
        if (callee.name === "weUp" || callee.name === "asyncAF") {
          const [callback] = path.node.arguments;
          if (!t.isArrowFunctionExpression(callback)) return;

          if (callee.name === "asyncAF") callback.async = true;

          path.replaceWith(
            t.callExpression(t.parenthesizedExpression(callback), [])
          );
          return;
        }

        /* ---------- return ---------- */
        if (callee.name === "itsGiving") {
          const [value] = path.node.arguments;
          if (!t.isExpression(value)) return;
          path.replaceWith(t.returnStatement(value));
          return;
        }

        /* ---------- try / catch / finally ---------- */
        if (callee.name === "vibeCheck") {
          const [tryFn, catchFn] = path.node.arguments;
          if (
            !t.isArrowFunctionExpression(tryFn) ||
            !t.isArrowFunctionExpression(catchFn)
          )
            return;

          const siblings = getSiblingStatements(path);
          if (!siblings) return;

          const parentStmt = path.parentPath;
          if (!parentStmt.isExpressionStatement()) return;

          const stmt = parentStmt.node;
          const index = siblings.indexOf(stmt);

          let finalizer: t.BlockStatement | null = null;

          const next = siblings[index + 1];
          if (
            next &&
            t.isExpressionStatement(next) &&
            t.isCallExpression(next.expression) &&
            t.isIdentifier(next.expression.callee, { name: "sayLess" })
          ) {
            const [cb] = next.expression.arguments;
            if (t.isArrowFunctionExpression(cb)) {
              finalizer = extractBlock(cb);
              siblings.splice(index + 1, 1);
            }
          }

          const catchParam =
            catchFn.params[0] && t.isIdentifier(catchFn.params[0])
              ? catchFn.params[0]
              : t.identifier("err");

          path.parentPath.replaceWith(
            t.tryStatement(
              extractBlock(tryFn),
              t.catchClause(catchParam, extractBlock(catchFn)),
              finalizer
            )
          );
          return;
        }

        /* ---------- await helpers ---------- */
        if (callee.name === "chill") {
          const [ms] = path.node.arguments;
          if (!t.isExpression(ms)) return;

          const func = path.getFunctionParent();
          if (func?.node && "async" in func.node) {
            func.node.async = true;
          }

          path.replaceWith(
            t.awaitExpression(
              t.newExpression(t.identifier("Promise"), [
                t.arrowFunctionExpression(
                  [t.identifier("resolve")],
                  t.callExpression(t.identifier("setTimeout"), [
                    t.identifier("resolve"),
                    ms,
                  ])
                ),
              ])
            )
          );
          return;
        }

        /* ---------- throw ---------- */
        if (callee.name === "onGod") {
          const [value] = path.node.arguments;
          if (!t.isExpression(value)) return;
          path.replaceWith(t.throwStatement(value));
          return;
        }

        /* ---------- entry ---------- */
        if (callee.name === "mainCharacter") {
          const [callback] = path.node.arguments;
          if (!t.isArrowFunctionExpression(callback)) return;
          if (!path.parentPath.isExpressionStatement()) return;
          if (!path.parentPath.parentPath.isProgram()) return;

          path.replaceWith(
            t.callExpression(t.parenthesizedExpression(callback), [])
          );
        }
      },
    },
  };
}
