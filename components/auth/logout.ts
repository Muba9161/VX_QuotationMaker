const CLIENT_AUTH_KEYS = [
  "vorldx_org_auth",
  "vorldx_admin_auth",
  "vorldx_user_role",
  "vorldx_signer_name",
] as const;

export async function logoutAndRedirect(): Promise<void> {
  for (const key of CLIENT_AUTH_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Unable to clear local authentication state for ${key}.`, error);
    }
  }

  try {
    const response = await fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Logout request failed with status ${response.status}.`);
    }
  } catch (error) {
    console.error("The server could not confirm logout.", error);
    window.alert("The server could not confirm logout. Your browser will return to the login page.");
  }

  window.location.replace("/login");
}
