import { db } from "./db";
import { userSettings } from "./db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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
  try {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (!settings) {
      return getDefaultProviders();
    }

    let list: ProviderName[] = [];
    if (settings.enabledProviders) {
      list = settings.enabledProviders as ProviderName[];
    } else {
      list = await getDefaultProviders();
    }

    // Add Adult if adultEnabled is true
    if (settings.adultEnabled) {
      if (!list.includes("Adult")) {
        list.push("Adult");
      }
    } else {
      list = list.filter((p) => p !== "Adult");
    }

    return list.filter((p) => ALL_PROVIDERS.includes(p));
  } catch (e) {
    console.error("Error reading user enabled providers:", e);
    return getDefaultProviders();
  }
}

export async function isProviderEnabled(
  userId: string,
  provider: string
): Promise<boolean> {
  const enabled = await getUserEnabledProviders(userId);
  return enabled.includes(provider as ProviderName);
}

export async function updateUserProviders(
  userId: string,
  providers: ProviderName[]
): Promise<void> {
  try {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    const hasAdult = providers.includes("Adult");
    const nonAdultProviders = providers.filter((p) => p !== "Adult");

    if (settings) {
      await db
        .update(userSettings)
        .set({
          enabledProviders: nonAdultProviders,
          adultEnabled: hasAdult,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.id, settings.id));
    } else {
      await db
        .insert(userSettings)
        .values({
          id: crypto.randomUUID(),
          userId,
          enabledProviders: nonAdultProviders,
          adultEnabled: hasAdult,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    }
  } catch (e) {
    console.error("Error updating user providers:", e);
  }
}

export async function invalidateUserProviderCache(userId: string): Promise<void> {
  // no-op (database-backed settings require no local cache invalidation)
}

export async function getDefaultProviders(): Promise<ProviderName[]> {
  // Exclude "Adult" from default providers to ensure standard safety unless explicitly opted-in
  return ALL_PROVIDERS.filter((p) => p !== "Adult") as ProviderName[];
}
