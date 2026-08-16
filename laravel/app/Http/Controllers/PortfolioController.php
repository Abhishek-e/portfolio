<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\GitHubService;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Collection;

class PortfolioController extends Controller
{
    public function __construct(protected GitHubService $github) {}

    public function index(): View
    {
        $repos = collect($this->github->getRepos());

        $projects = $repos->isNotEmpty()
            ? $this->mapRepos($repos)
            : Project::orderBy('sort_order')->get();

        $user = $this->github->getUser();
        $repoCount = $user['public_repos'] ?? $projects->count();

        $commits = $this->github->getRecentCommits();

        return view('portfolio.index', [
            'projects' => $projects,
            'repoCount' => $repoCount,
            'commits' => $commits,
        ]);
    }

    protected function mapRepos(Collection $repos): Collection
    {
        return $repos->map(fn ($repo) => (object) [
            'name' => $repo['name'],
            'description' => $repo['description'] ?: 'No description provided.',
            'url' => $repo['html_url'],
            'language' => $repo['language'],
            'category' => $this->categoryFor($repo['language']),
            'stars' => $repo['stargazers_count'],
        ]);
    }

    protected function categoryFor(?string $language): string
    {
        return match (strtolower($language ?? '')) {
            'python' => 'python',
            'javascript', 'typescript' => 'javascript',
            'html', 'css' => 'web',
            default => 'other',
        };
    }
}
