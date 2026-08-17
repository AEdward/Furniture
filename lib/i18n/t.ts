export type Dictionary = Record<string, string>;
export type TranslateVars = Record<string, string | number>;
export type TFunction = (key: string, vars?: TranslateVars) => string;

// Shared by both server components (which call createT(dict) directly
// after awaiting getDictionary()) and client components (which get it
// from useT() in lib/i18n/context.tsx) — one implementation, no
// hooks-in-server-components problem.
export function createT(dict: Dictionary): TFunction {
  return function t(key: string, vars?: TranslateVars): string {
    let result = dict[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        result = result.split(`{${name}}`).join(String(value));
      }
    }
    return result;
  };
}
