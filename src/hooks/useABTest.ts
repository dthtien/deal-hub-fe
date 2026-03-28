export function useABTest(experiment: string, variants: string[]): string {
  const key = `ozvfy_ab_${experiment}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored && variants.includes(stored)) return stored;
    const assigned = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem(key, assigned);
    return assigned;
  } catch {
    return variants[0];
  }
}
