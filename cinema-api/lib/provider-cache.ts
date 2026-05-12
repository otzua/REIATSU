export const ALL_PROVIDERS = [
  "4kHDHub",
  "HDHub4u",
  "Movies4u",
  "Drive",
  "Vega",
  "ZeeFliz",
  "ZinkMovies",
  "DesireMovies",
  "NetMirror",
  "AnimeSalt",
  "KMMovies",
  "UhdMovies",
  "Moviesmod",
  "Adult",
  "Watchmode",
] as const;

export type ProviderName = typeof ALL_PROVIDERS[number];

export async function getUserEnabledProviders(userId: string): Promise<ProviderName[]> {
  return getDefaultProviders();
}

export async function isProviderEnabled(
  userId: string,
  provider: string
): Promise<boolean> {
  return true;
}

export async function updateUserProviders(
  userId: string,
  providers: ProviderName[]
): Promise<void> {
  // no-op
}

export async function invalidateUserProviderCache(userId: string): Promise<void> {
  // no-op
}

export async function getDefaultProviders(): Promise<ProviderName[]> {
  return [...ALL_PROVIDERS];
}
