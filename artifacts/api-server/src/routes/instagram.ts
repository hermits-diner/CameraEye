import { Router, type IRouter } from "express";
import type { InstagramPost } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/**
 * Instagram Graph API proxy. Keeps the access token server-side and caches
 * results to stay well within rate limits. Returns an empty list when no
 * token is configured so the frontend can degrade gracefully.
 *
 * Env: INSTAGRAM_ACCESS_TOKEN (long-lived user token for the Basic Display /
 * Graph API `me/media` endpoint).
 */

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { posts: InstagramPost[]; fetchedAt: number } | null = null;

interface InstagramMediaItem {
  id: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
}

router.get("/instagram/feed", async (_req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    res.json({ posts: [] });
    return;
  }

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    res.json({ posts: cache.posts });
    return;
  }

  try {
    const url =
      "https://graph.instagram.com/me/media" +
      "?fields=id,media_type,media_url,thumbnail_url,permalink,caption&limit=12" +
      `&access_token=${encodeURIComponent(token)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Instagram API ${response.status}`);
    const data = (await response.json()) as { data?: InstagramMediaItem[] };

    const posts: InstagramPost[] = (data.data ?? [])
      .map((item) => ({
        id: item.id,
        mediaUrl:
          item.media_type === "VIDEO"
            ? (item.thumbnail_url ?? "")
            : (item.media_url ?? ""),
        permalink: item.permalink,
        ...(item.caption ? { caption: item.caption } : {}),
      }))
      .filter((p) => p.mediaUrl)
      .slice(0, 8);

    cache = { posts, fetchedAt: Date.now() };
    res.json({ posts });
  } catch (err) {
    logger.warn({ err }, "Instagram feed fetch failed");
    // Serve stale cache if we have one; otherwise degrade to empty.
    res.json({ posts: cache?.posts ?? [] });
  }
});

export default router;
