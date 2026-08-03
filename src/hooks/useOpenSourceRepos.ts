import { OPEN_SOURCE_REPOS } from "@/data/open-source";
import type { OpenSourceRepo } from "@/types/open-source";

interface UseOpenSourceReposResult {
  repos: OpenSourceRepo[];
  isLoading: boolean;
  error: null;
}

/**
 * Returns open-source repository data. Currently backed by static mock data;
 * swap the body for a GitHub REST/GraphQL fetch (e.g. `/users/:username/repos`)
 * without changing the consumer-facing shape.
 */
export function useOpenSourceRepos(): UseOpenSourceReposResult {
  return { repos: OPEN_SOURCE_REPOS, isLoading: false, error: null };
}
