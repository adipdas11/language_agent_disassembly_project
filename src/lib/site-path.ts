/** Resolve public assets beneath the deployment base while preserving external URLs. */
export function sitePath(path: string) {
  return path.startsWith('/') && !path.startsWith('//')
    ? `${import.meta.env.BASE_URL}${path.slice(1)}`
    : path
}
