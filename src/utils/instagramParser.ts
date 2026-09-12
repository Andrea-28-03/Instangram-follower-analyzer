import { InstagramProfile } from "../types";

export function parseInstagramData(rawContent: string, fileName?: string): InstagramProfile[] {
  const profiles: InstagramProfile[] = [];
  const seenUsernames = new Set<string>();

  const addProfile = (rawUsername: string, url?: string, timestamp?: number, title?: string) => {
    let username = rawUsername.trim().replace(/^@/, "").replace(/\/$/, "");
    // Extract username if full URL was provided
    if (username.includes("instagram.com/")) {
      const match = username.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (match && match[1]) {
        username = match[1];
      }
    }

    // Clean username from query parameters or trailing paths
    username = username.split("?")[0].split("/")[0].toLowerCase().trim();

    // Validate Instagram username format (1-30 characters, alphanumeric, dots, underscores)
    if (!username || !/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
      return;
    }

    // Skip special meta routes
    if (["p", "reel", "stories", "explore", "direct", "tv"].includes(username)) {
      return;
    }

    if (seenUsernames.has(username)) {
      return;
    }
    seenUsernames.add(username);

    let followedAt: string | undefined = undefined;
    if (timestamp) {
      try {
        followedAt = new Date(timestamp * 1000).toISOString();
      } catch {
        // ignore
      }
    }

    profiles.push({
      id: `${username}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username,
      displayName: title && title !== username ? title : undefined,
      profileUrl: url || `https://www.instagram.com/${username}/`,
      followedAt,
      isAnalyzed: false,
      isFavorite: false,
    });
  };

  const trimmed = rawContent.trim();

  // 1. Try parsing as JSON (Meta official export)
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const json = JSON.parse(trimmed);

      // Format A: { relationships_following: [ { title: "", string_list_data: [{ href, value, timestamp }] } ] }
      const followingList = json.relationships_following || json.following || (Array.isArray(json) ? json : null);

      if (Array.isArray(followingList)) {
        for (const item of followingList) {
          if (item && Array.isArray(item.string_list_data) && item.string_list_data.length > 0) {
            const data = item.string_list_data[0];
            const value = data.value || item.title || "";
            addProfile(value, data.href, data.timestamp, item.title);
          } else if (typeof item === "string") {
            addProfile(item);
          } else if (item && typeof item === "object") {
            const val = item.username || item.value || item.title || item.name;
            if (val) addProfile(String(val), item.href || item.url);
          }
        }
        if (profiles.length > 0) {
          return profiles;
        }
      }
    } catch {
      // Not valid JSON, proceed to HTML/Text parsing
    }
  }

  // 2. Try parsing as HTML (Meta HTML export)
  if (trimmed.includes("<html") || trimmed.includes("<a ") || fileName?.endsWith(".html")) {
    const linkRegex = /href=["']https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?["']/gi;
    let match;
    while ((match = linkRegex.exec(trimmed)) !== null) {
      if (match[1]) {
        addProfile(match[1], `https://www.instagram.com/${match[1]}/`);
      }
    }
    if (profiles.length > 0) {
      return profiles;
    }
  }

  // 3. Fallback: Parse plain text / CSV / list of handles
  const lines = trimmed.split(/[\r\n,;]+/);
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    // Detect words or urls
    const parts = cleanLine.split(/\s+/);
    for (const part of parts) {
      if (part.startsWith("@") || part.includes("instagram.com") || /^[a-zA-Z0-9._]{2,30}$/.test(part)) {
        addProfile(part);
      }
    }
  }

  return profiles;
}
