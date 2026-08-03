import { createSeededRandom } from "@/lib/utils";
import type { ActivityItem, ContributionDay, GithubStats, LanguageStat } from "@/types/github";

export const GITHUB_STATS: GithubStats = {
  username: "shubhamdhiman",
  totalContributions: 1284,
  totalRepos: 34,
  followers: 186,
  currentStreak: 12,
  longestStreak: 47,
};

export const LANGUAGE_STATS: LanguageStat[] = [
  { name: "PHP", percentage: 38, color: "#4F5D95" },
  { name: "TypeScript", percentage: 32, color: "#3178c6" },
  { name: "JavaScript", percentage: 14, color: "#f1e05a" },
  { name: "Blade", percentage: 9, color: "#f7523f" },
  { name: "Shell", percentage: 4, color: "#89e051" },
  { name: "Other", percentage: 3, color: "#8b8b92" },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    type: "release",
    repo: "rag-starter",
    message: "Published v2.1.0 - streaming responses over WebSockets",
    date: "2026-07-18",
  },
  {
    id: "2",
    type: "commit",
    repo: "sessionora",
    message: "Add Redis slot-locking to prevent booking race conditions",
    date: "2026-07-15",
  },
  {
    id: "3",
    type: "pr",
    repo: "pg-slot-lock",
    message: "Merged: support composite resource keys",
    date: "2026-07-11",
  },
  {
    id: "4",
    type: "issue",
    repo: "laravel-tenant-kit",
    message: "Closed #42 - row-level security policy example for teams",
    date: "2026-07-04",
  },
  {
    id: "5",
    type: "commit",
    repo: "reverb-presence",
    message: "Fix reconnect race condition on tab visibility change",
    date: "2026-06-27",
  },
];

function levelFromCount(count: number): ContributionDay["level"] {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

export function generateContributions(weeks = 52, referenceDate = new Date()): ContributionDay[] {
  const random = createSeededRandom(2024);
  const days: ContributionDay[] = [];
  const today = referenceDate;
  const totalDays = weeks * 7;

  for (let i = totalDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const roll = random();
    const count = roll > 0.32 ? Math.floor(random() * 12) : 0;
    days.push({
      date: date.toISOString().slice(0, 10),
      count,
      level: levelFromCount(count),
    });
  }

  return days;
}
