<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GitHubService
{
    protected string $username;

    protected int $ttlMinutes = 10;

    public function __construct()
    {
        $this->username = config('services.github.username', 'Abhishek-e');
    }

    public function getUser(): ?array
    {
        return Cache::remember("github_user_{$this->username}", now()->addMinutes($this->ttlMinutes), function () {
            $response = Http::withHeaders(['Accept' => 'application/vnd.github+json'])
                ->get("https://api.github.com/users/{$this->username}");

            return $response->successful() ? $response->json() : null;
        });
    }

    /**
     * Non-fork repos for this user, sorted by most recently pushed.
     */
    public function getRepos(): array
    {
        return Cache::remember("github_repos_{$this->username}", now()->addMinutes($this->ttlMinutes), function () {
            $response = Http::withHeaders(['Accept' => 'application/vnd.github+json'])
                ->get("https://api.github.com/users/{$this->username}/repos", [
                    'sort' => 'updated',
                    'per_page' => 100,
                ]);

            if (! $response->successful()) {
                return [];
            }

            return collect($response->json())
                ->reject(fn ($repo) => $repo['fork'])
                ->sortByDesc('pushed_at')
                ->values()
                ->all();
        });
    }

    /**
     * Most recent commits across the user's most recently pushed repos.
     */
    public function getRecentCommits(int $repoLimit = 5, int $commitLimit = 6): array
    {
        return Cache::remember("github_commits_{$this->username}", now()->addMinutes($this->ttlMinutes), function () use ($repoLimit, $commitLimit) {
            $repos = collect($this->getRepos())->take($repoLimit);

            $commits = $repos->flatMap(function ($repo) {
                $response = Http::withHeaders(['Accept' => 'application/vnd.github+json'])
                    ->get("https://api.github.com/repos/{$this->username}/{$repo['name']}/commits", [
                        'per_page' => 3,
                    ]);

                if (! $response->successful()) {
                    return collect();
                }

                return collect($response->json())->map(fn ($commit) => [
                    'sha' => substr($commit['sha'], 0, 7),
                    'message' => strtok($commit['commit']['message'], "\n"),
                    'repo' => $repo['name'],
                    'date' => $commit['commit']['author']['date'] ?? $repo['pushed_at'],
                ]);
            });

            return $commits->sortByDesc('date')->take($commitLimit)->values()->all();
        });
    }
}
