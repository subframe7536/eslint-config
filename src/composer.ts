import type { Awaitable, TypedFlatConfigItem } from './types'

export async function toConfigs(
  operations: Awaitable<TypedFlatConfigItem[]>[],
  renames?: Record<string, string>,
): Promise<TypedFlatConfigItem[]> {
  const original = (await Promise.all(operations.map(async op => (await op)))).flat()
  return renames
    ? renamePluginsInConfigs(
        original,
        renames,
      )
    : original
}

function renamePluginsInRules(rules: Record<string, any>, map: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(rules).map(([key, value]) => {
      for (const [from, to] of Object.entries(map)) {
        if (key.startsWith(`${from}/`))
          return [to + key.slice(from.length), value]
      }
      return [key, value]
    }),
  )
}
function renamePluginsInConfigs(configs: TypedFlatConfigItem[], map: Record<string, any>): TypedFlatConfigItem[] {
  return configs.map((i) => {
    const clone = { ...i }
    if (clone.rules)
      clone.rules = renamePluginsInRules(clone.rules, map) as any
    if (clone.plugins) {
      clone.plugins = Object.fromEntries(
        Object.entries(clone.plugins).map(([key, value]) => {
          if (key in map)
            return [map[key], value]
          return [key, value]
        }),
      )
    }
    return clone
  })
}
