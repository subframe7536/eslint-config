import type { OptionsStylistic, TypedFlatConfigItem } from '../types'
import type { TSESLint } from '@typescript-eslint/utils'

import { TSESTree } from '@typescript-eslint/utils'

import { interopDefault } from '../utils'

export function getValue(node: TSESTree.Identifier | TSESTree.StringLiteral): string {
  switch (node.type) {
    case TSESTree.AST_NODE_TYPES.Identifier: {
      return node.name
    }
    case TSESTree.AST_NODE_TYPES.Literal: {
      return node.value
    }
    default: {
      throw new Error(`Unsupported node type: ${(node as TSESTree.Node).type}`)
    }
  }
}

function isComma(token: TSESTree.Token): token is TSESTree.PunctuatorToken {
  return token.type === 'Punctuator' && token.value === ','
}

function removeSpecifiers(
  fixes: TSESLint.RuleFix[],
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  specifiers: TSESTree.ImportSpecifier[],
): void {
  for (const specifier of specifiers) {
    // remove the trailing comma
    const token = sourceCode.getTokenAfter(specifier)
    if (token && isComma(token)) {
      fixes.push(fixer.remove(token))
    }
    fixes.push(fixer.remove(specifier))
  }
}

function getImportText(
  node: TSESTree.ImportDeclaration,
  sourceCode: Readonly<TSESLint.SourceCode>,
  specifiers: TSESTree.ImportSpecifier[],
  kind: 'type' | 'typeof',
): string {
  const sourceString = sourceCode.getText(node.source)
  if (specifiers.length === 0) {
    return ''
  }

  const names = specifiers.map((s) => {
    const importedName = getValue(s.imported)
    if (importedName === s.local.name) {
      return importedName
    }
    return `${importedName} as ${s.local.name}`
  })
  // insert a fresh top-level import
  return `import ${kind} {${names.join(', ')}} from ${sourceString};`
}

type MessageIds = 'inline' | 'topLevel'
type Options = ['prefer-inline' | 'prefer-top-level'] | []

const consistentTypeSpecifierStyle: TSESLint.RuleModule<MessageIds, Options> = {
  create(context) {
    const { sourceCode } = context

    if (context.options[0] === 'prefer-inline') {
      return {
        ImportDeclaration(node) {
          if (node.importKind === 'value' || node.importKind == null) {
            // top-level value / unknown is valid
            return
          }

          if (
            // no specifiers (import type {} from '') have no specifiers to mark as inline
            node.specifiers.length === 0
            || (node.specifiers.length === 1
              // default imports are both "inline" and "top-level"
              && (node.specifiers[0].type === 'ImportDefaultSpecifier'
                // namespace imports are both "inline" and "top-level"
                || node.specifiers[0].type === 'ImportNamespaceSpecifier'))
          ) {
            return
          }

          context.report({
            data: {
              kind: node.importKind,
            },
            fix(fixer) {
              const kindToken = sourceCode.getFirstToken(node, { skip: 1 })

              return [
                kindToken ? fixer.remove(kindToken) : [],
                node.specifiers.map(specifier =>
                  fixer.insertTextBefore(specifier, `${node.importKind} `),
                ),
              ].flat()
            },
            messageId: 'inline',
            node,
          })
        },
      }
    }

    // prefer-top-level
    return {
      ImportDeclaration(node) {
        if (
          // already top-level is valid
          node.importKind === 'type'
          // @ts-expect-error flow
          || node.importKind === 'typeof'
          // no specifiers (import {} from '') cannot have inline - so is valid
          || node.specifiers.length === 0
          || (node.specifiers.length === 1
            // default imports are both "inline" and "top-level"
            && (node.specifiers[0].type === 'ImportDefaultSpecifier'
              // namespace imports are both "inline" and "top-level"
              || node.specifiers[0].type === 'ImportNamespaceSpecifier'))
        ) {
          return
        }

        const typeSpecifiers: TSESTree.ImportSpecifier[] = []
        const typeofSpecifiers: TSESTree.ImportSpecifier[] = []
        const valueSpecifiers: TSESTree.ImportSpecifier[] = []

        let defaultSpecifier: TSESTree.ImportDefaultSpecifier | null = null

        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportDefaultSpecifier') {
            defaultSpecifier = specifier
            continue
          }

          if (!('importKind' in specifier)) {
            continue
          }

          if (specifier.importKind === 'type') {
            typeSpecifiers.push(specifier)
          } else if (
            // @ts-expect-error flow
            specifier.importKind === 'typeof'
          ) {
            typeofSpecifiers.push(specifier)
          } else if (
            specifier.importKind === 'value'
            || specifier.importKind == null
          ) {
            valueSpecifiers.push(specifier)
          }
        }

        const typeImport = getImportText(
          node,
          sourceCode,
          typeSpecifiers,
          'type',
        )
        const typeofImport = getImportText(
          node,
          sourceCode,
          typeofSpecifiers,
          'typeof',
        )
        const newImports = `${typeImport}\n${typeofImport}`.trim()

        if (
          typeSpecifiers.length + typeofSpecifiers.length
          === node.specifiers.length
        ) {
          // all specifiers have inline specifiers - so we replace the entire import
          const kind = [
            typeSpecifiers.length > 0 ? ('type' as const) : [],
            typeofSpecifiers.length > 0 ? ('typeof' as const) : [],
          ].flat()

          context.report({
            data: {
              kind: kind.join('/'),
            },
            fix(fixer) {
              return fixer.replaceText(node, newImports)
            },
            messageId: 'topLevel',
            node,
          })
        } else {
          // remove specific specifiers and insert new imports for them
          for (const specifier of [...typeSpecifiers, ...typeofSpecifiers]) {
            context.report({
              data: {
                kind: specifier.importKind,
              },
              fix(fixer) {
                const fixes: TSESLint.RuleFix[] = []

                // if there are no value specifiers, then the other report fixer will be called, not this one

                if (valueSpecifiers.length > 0) {
                  // import { Value, type Type } from 'mod';

                  // we can just remove the type specifiers
                  removeSpecifiers(fixes, fixer, sourceCode, typeSpecifiers)
                  removeSpecifiers(fixes, fixer, sourceCode, typeofSpecifiers)

                  // make the import nicely formatted by also removing the trailing comma after the last value import
                  // eg
                  // import { Value, type Type } from 'mod';
                  // to
                  // import { Value  } from 'mod';
                  // not
                  // import { Value,  } from 'mod';
                  const maybeComma = sourceCode.getTokenAfter(
                    valueSpecifiers[valueSpecifiers.length - 1],
                  )!
                  if (isComma(maybeComma)) {
                    fixes.push(fixer.remove(maybeComma))
                  }
                } else if (defaultSpecifier) {
                  // import Default, { type Type } from 'mod';

                  // remove the entire curly block so we don't leave an empty one behind
                  // NOTE - the default specifier *must* be the first specifier always!
                  //        so a comma exists that we also have to clean up or else it's bad syntax
                  const comma = sourceCode.getTokenAfter(
                    defaultSpecifier,
                    isComma,
                  )
                  const closingBrace = sourceCode.getTokenAfter(
                    node.specifiers[node.specifiers.length - 1],
                    token => token.type === 'Punctuator' && token.value === '}',
                  )
                  fixes.push(
                    fixer.removeRange([
                      comma!.range[0],
                      closingBrace!.range[1],
                    ]),
                  )
                }

                return [
                  ...fixes,
                  // insert the new imports after the old declaration
                  fixer.insertTextAfter(node, `\n${newImports}`),
                ]
              },
              messageId: 'topLevel',
              node: specifier,
            })
          }
        }
      },
    }
  },
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'Enforce or ban the use of inline type-only markers for named imports.',
    },
    fixable: 'code',
    messages: {
      inline:
        'Prefer using inline {{kind}} specifiers instead of a top-level {{kind}}-only import.',
      topLevel:
        'Prefer using a top-level {{kind}}-only import instead of inline {{kind}} specifiers.',
    },
    schema: [
      {
        default: 'prefer-top-level',
        enum: ['prefer-top-level', 'prefer-inline'],
        type: 'string',
      },
    ],
    type: 'suggestion',
  },
}

export async function imports(_options: OptionsStylistic = {}): Promise<TypedFlatConfigItem[]> {
  return [
    {
      name: 'antfu/imports/rules',
      plugins: {
        antfu: await interopDefault(import('eslint-plugin-antfu')),
        import: {
          meta: {
            name: 'import-subf',
            version: '0.1.0',
          },
          rules: {
            'consistent-type-specifier-style': consistentTypeSpecifierStyle,
          },
        } satisfies TSESLint.Linter.Plugin,
      },
      rules: {
        'antfu/import-dedupe': 'error',
        'antfu/no-import-dist': 'error',
        'antfu/no-import-node-modules-by-path': 'error',
        'subf/consistent-type-specifier-style': ['error'],
      },
    },
  ]
}
