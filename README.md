# Abhishek Mondal — Portfolio

Git-themed personal portfolio site, built two ways:

- **[`static/`](./static)** — plain HTML, CSS, and vanilla JS. No build step; open `index.html` or serve the folder with any static file server. Projects, recent commits, and repo counts are fetched live from the GitHub API on page load.
- **[`laravel/`](./laravel)** — the same site rebuilt on Laravel, with projects/commits fetched server-side via a cached `GitHubService` and rendered through Blade.

Both pull live data from [github.com/Abhishek-e](https://github.com/Abhishek-e) — no manual updates needed when new repos or commits are pushed.

## Running the static site

```bash
cd static
python3 -m http.server 8000
```

## Running the Laravel app

```bash
cd laravel
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve
```
