export function buildLoginRedirect(pathname: string): string {
  const safePath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const redirect = encodeURIComponent(safePath);
  return `/login?redirect=${redirect}`;
}
