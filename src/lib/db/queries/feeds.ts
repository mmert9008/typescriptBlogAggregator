import { db } from "../index.js";
import { feeds, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({ name, url, userId })
    .returning();
  return result;
}

export async function getAllFeeds() {
  const result = await db
    .select({
      feedId: feeds.id,
      feedName: feeds.name,
      feedUrl: feeds.url,
      feedCreatedAt: feeds.createdAt,
      feedUpdatedAt: feeds.updatedAt,
      userId: users.id,
      userName: users.name,
      userCreatedAt: users.createdAt,
      userUpdatedAt: users.updatedAt,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
  return result;
}
