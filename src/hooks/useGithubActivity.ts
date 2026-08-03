import { useMemo } from "react";
import {
  GITHUB_STATS,
  LANGUAGE_STATS,
  RECENT_ACTIVITY,
  generateContributions,
} from "@/data/github-activity";

interface UseGithubActivityResult {
  stats: typeof GITHUB_STATS;
  languages: typeof LANGUAGE_STATS;
  activity: typeof RECENT_ACTIVITY;
  contributions: ReturnType<typeof generateContributions>;
  isLoading: boolean;
}

/**
 * Backed by static mock data today; swap the return values for GitHub's
 * REST/GraphQL API (contribution calendar requires the GraphQL v4 API)
 * without changing what section components consume.
 */
export function useGithubActivity(): UseGithubActivityResult {
  const contributions = useMemo(() => generateContributions(52), []);

  return {
    stats: GITHUB_STATS,
    languages: LANGUAGE_STATS,
    activity: RECENT_ACTIVITY,
    contributions,
    isLoading: false,
  };
}
