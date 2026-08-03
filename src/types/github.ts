export interface GithubStats {
  username: string;
  totalContributions: number;
  totalRepos: number;
  followers: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export type ActivityType = "commit" | "pr" | "issue" | "release";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  repo: string;
  message: string;
  date: string;
}
