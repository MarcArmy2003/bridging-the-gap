export function buildBtgLogoutUrl(idToken?: string) {
  const endpoint = process.env.BTG_OIDC_LOGOUT_URL;
  if (!endpoint) return null;

  const postLogoutRedirectUri =
    process.env.BTG_OIDC_POST_LOGOUT_REDIRECT_URI || process.env.NEXTAUTH_URL;
  if (!postLogoutRedirectUri) return endpoint;

  const url = new URL(endpoint);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
  if (idToken) {
    url.searchParams.set("id_token_hint", idToken);
  }
  return url.toString();
}
