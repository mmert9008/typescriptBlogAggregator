import { db } from "../index.js";
import { posts, feeds, feedFollows } from "../schema.js";
import { eq, desc } from "drizzle-orm";

export async function createPost(
  title: string,
  url: string,
  description: string | null,
  publishedAt: Date | null,
  feedId: string,
) {
  try {
    const [result] = await db
      .insert(posts)
      .values({
        title,
        url,
        description,
        publishedAt,
        feedId,
      })
      .returning();
    return result;
  } catch (error: any) {
    if (error?.code === "23505") {
      return null;
    }
    throw error;
  }
}

export async function getPostsForUser(userId: string, limit: number) {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .innerJoin(feedFollows, eq(feeds.id, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return result;
}
