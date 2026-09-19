import type { GitHubRepo, GitHubUser } from './types';

const API_BASE = 'https://api.github.com';

export class GitHubApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

async function githubFetch<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `Błąd GitHub API (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    if (res.status === 401) {
      message = 'Nieprawidłowy lub wygasły token. Zaloguj się ponownie.';
    } else if (res.status === 403) {
      message = 'Brak uprawnień lub przekroczono limit API.';
    } else if (res.status === 404) {
      message = 'Nie znaleziono zasobu.';
    }
    throw new GitHubApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function validateToken(token: string): Promise<GitHubUser> {
  return githubFetch<GitHubUser>('/user', token);
}

export async function fetchAllUserRepos(token: string): Promise<GitHubRepo[]> {
  const perPage = 100;
  let page = 1;
  const all: GitHubRepo[] = [];

  while (true) {
    const batch = await githubFetch<GitHubRepo[]>(
      `/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
      token
    );
    all.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
    if (page > 50) break; // safety cap
  }

  return all;
}

export async function fetchRepo(
  token: string,
  owner: string,
  name: string
): Promise<GitHubRepo> {
  return githubFetch<GitHubRepo>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
    token
  );
}

export async function fetchReadme(
  token: string,
  owner: string,
  name: string
): Promise<string | null> {
  const res = await fetch(
    `${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/readme`,
    {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GitHubApiError(`Nie udało się pobrać README (${res.status})`, res.status);
  }
  return res.text();
}
