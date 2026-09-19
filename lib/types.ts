export type GitHubUser = {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  public_repos: number;
};

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  updated_at: string;
  pushed_at: string | null;
  default_branch: string;
  open_issues_count: number;
  topics: string[];
  license: { key: string; name: string; spdx_id: string } | null;
  owner: { login: string; avatar_url: string };
};

export type VisibilityFilter = 'all' | 'public' | 'private';
export type SortOption = 'updated' | 'stars' | 'name';
