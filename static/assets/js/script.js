'use strict';

// theme toggle (light / dark)
const themeToggleBtn = document.querySelector('[data-theme-toggle]');

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', function () {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  });
}

// sidebar toggle (mobile)
const sidebar = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');

if (sidebarBtn) {
  sidebarBtn.addEventListener('click', function () {
    sidebar.classList.toggle('active');
    this.classList.toggle('active');
  });
}

// page navigation
const navLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');

navLinks.forEach((link, index) => {
  link.addEventListener('click', function () {
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(nav => nav.classList.remove('active'));

    pages[index].classList.add('active');
    this.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// project filter (queries live, since the project list is filled in asynchronously)
const filterBtns = document.querySelectorAll('[data-filter-btn]');

function filterProjects(category) {
  document.querySelectorAll('[data-filter-item]').forEach(item => {
    const match = category === 'all' || item.dataset.category === category;
    item.classList.toggle('show', match);
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    filterProjects(this.dataset.filter);
  });
});

// contact form -> opens mail client with prefilled message
const form = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn = document.querySelector('[data-form-btn]');

if (form) {
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      formBtn.disabled = !form.checkValidity();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = form.fullname.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    const text = encodeURIComponent(
      `New portfolio message\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`
    );

    window.open(`https://wa.me/917749028081?text=${text}`, '_blank');
  });
}

// resume modal
const resumeModal = document.querySelector('[data-resume-modal]');
const resumeOpenBtns = document.querySelectorAll('[data-resume-open]');
const resumeCloseEls = document.querySelectorAll('[data-resume-close]');

function openResumeModal() {
  resumeModal.classList.add('active');
  resumeModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
  resumeModal.classList.remove('active');
  resumeModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (resumeModal) {
  resumeOpenBtns.forEach(btn => btn.addEventListener('click', openResumeModal));
  resumeCloseEls.forEach(el => el.addEventListener('click', closeResumeModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal.classList.contains('active')) closeResumeModal();
  });
}

// footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------------------------------------------
// Live GitHub data: repos (Projects tab) + recent commits (About tab)
// ---------------------------------------------
const GITHUB_USER = 'Abhishek-e';
const GH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function ghFetch(path, cacheKey) {
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const { data, ts } = JSON.parse(cached);
    if (Date.now() - ts < GH_CACHE_TTL) return data;
  }

  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (!res.ok) {
    if (cached) return JSON.parse(cached).data; // stale cache beats nothing
    throw new Error(res.status === 403 ? 'GitHub API rate limit reached' : `GitHub API error (${res.status})`);
  }

  const data = await res.json();
  sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
  return data;
}

function categoryForLanguage(language) {
  const lang = (language || '').toLowerCase();
  if (lang === 'python') return 'python';
  if (lang === 'javascript' || lang === 'typescript') return 'javascript';
  if (lang === 'html' || lang === 'css') return 'web';
  return 'other';
}

function langTagClass(language) {
  const lang = (language || '').toLowerCase();
  if (lang === 'python') return 'lang-python';
  if (lang === 'javascript' || lang === 'typescript') return 'lang-js';
  if (lang === 'html') return 'lang-html';
  if (lang === 'css') return 'lang-css';
  return 'lang-other';
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function renderProjectCard(repo) {
  const category = categoryForLanguage(repo.language);
  const langClass = langTagClass(repo.language);
  const desc = repo.description ? escapeHtml(repo.description) : 'No description provided.';

  return `
    <li class="project-item" data-filter-item data-category="${category}">
      <a href="${repo.html_url}" target="_blank">
        <div class="project-card">
          <div class="card-head">
            <i class='bx bx-git-repo-forked'></i>
            <span class="repo-name">${escapeHtml(repo.name)}</span>
            ${repo.language ? `<span class="lang-tag ${langClass}">${escapeHtml(repo.language)}</span>` : ''}
          </div>
          <p class="project-desc">${desc}</p>
          <div class="card-foot"><i class='bx bx-star'></i> ${repo.stargazers_count} &nbsp;&middot;&nbsp; <i class='bx bx-link-external'></i> view repository</div>
        </div>
      </a>
    </li>`;
}

async function loadProjects() {
  const list = document.querySelector('[data-project-list]');
  if (!list) return;

  try {
    const repos = await ghFetch(`/users/${GITHUB_USER}/repos?sort=updated&per_page=100`, 'gh_repos');

    const visible = repos
      .filter(r => !r.fork)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    if (!visible.length) {
      list.innerHTML = '<li class="project-loading">No public repositories found.</li>';
      return;
    }

    list.innerHTML = visible.map(renderProjectCard).join('');
    filterProjects(document.querySelector('[data-filter-btn].active')?.dataset.filter || 'all');
  } catch (err) {
    list.innerHTML = `<li class="projects-error"><i class='bx bx-error-circle'></i> Couldn't load live repos (${escapeHtml(err.message)}). <a href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank">View on GitHub &rarr;</a></li>`;
  }
}

async function loadRepoCount() {
  const targets = document.querySelectorAll('[data-repo-count], [data-repo-total]');
  if (!targets.length) return;

  try {
    const user = await ghFetch(`/users/${GITHUB_USER}`, 'gh_user');
    document.querySelectorAll('[data-repo-count]').forEach(el => {
      el.textContent = `${user.public_repos} public repos`;
    });
    document.querySelectorAll('[data-repo-total]').forEach(el => {
      el.textContent = user.public_repos;
    });
  } catch (err) {
    document.querySelectorAll('[data-repo-count]').forEach(el => { el.textContent = 'public repos'; });
    document.querySelectorAll('[data-repo-total]').forEach(el => { el.textContent = '—'; });
  }
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return 'just now';
}

async function loadRecentCommits() {
  const body = document.querySelector('[data-commit-log]');
  if (!body) return;

  try {
    const repos = await ghFetch(`/users/${GITHUB_USER}/repos?sort=updated&per_page=100`, 'gh_repos');
    const topRepos = repos
      .filter(r => !r.fork)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 5);

    const commitLists = await Promise.all(topRepos.map(async (repo) => {
      try {
        const commits = await ghFetch(`/repos/${GITHUB_USER}/${repo.name}/commits?per_page=3`, `gh_commits_${repo.name}`);
        return commits.map(c => ({
          sha: c.sha.slice(0, 7),
          message: c.commit.message.split('\n')[0],
          repo: repo.name,
          date: c.commit.author?.date || repo.pushed_at,
        }));
      } catch {
        return [];
      }
    }));

    const commits = commitLists.flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    if (!commits.length) {
      body.innerHTML = '<p class="terminal-loading">No recent public commit activity.</p>';
      return;
    }

    body.innerHTML = commits.map(c => `
      <p><span class="graph">*</span> <span class="hash">${escapeHtml(c.sha)}</span> ${escapeHtml(c.message)} <span class="commit-meta">(${escapeHtml(c.repo)}, ${timeAgo(c.date)})</span></p>
    `).join('');
  } catch (err) {
    body.innerHTML = `<p class="terminal-error"><span class="prompt">$</span> couldn't load live commits (${escapeHtml(err.message)})</p>`;
  }
}

loadProjects();
loadRepoCount();
loadRecentCommits();

// ---------------------------------------------
// Medium blog posts (Blog tab) — read from a JSON file kept in sync by
// .github/workflows/update-blog-feed.yml, which fetches the Medium RSS
// feed directly (server-side) and commits it. Avoids third-party
// RSS-to-JSON proxies, which cache the feed and go stale.
// ---------------------------------------------
const MEDIUM_USER = '@abhishek.mondal0202';
const BLOG_POSTS_URL = './assets/data/blog-posts.json';

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  tmp.querySelectorAll('figure, figcaption, style, script').forEach(el => el.remove());
  tmp.querySelectorAll('p, br, div, li, h1, h2, h3, h4, h5, h6').forEach(el => el.append(' '));
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

function truncate(str, max) {
  return str.length > max ? `${str.slice(0, max).trim()}…` : str;
}

function renderBlogCard(post) {
  const desc = truncate(stripHtml(post.description), 160) || 'Read the full post on Medium.';
  const date = post.pubDate ? new Date(post.pubDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  return `
    <li class="project-item show">
      <a class="project-card blog-card" href="${post.link}" target="_blank" rel="noopener">
        <div class="card-head">
          <i class='bx bxl-medium'></i>
          <span class="repo-name">${escapeHtml(post.title)}</span>
          <span class="lang-tag lang-other">Medium</span>
        </div>
        <p class="project-desc">${escapeHtml(desc)}</p>
        <div class="card-foot"><i class='bx bx-calendar'></i> ${escapeHtml(date)} &nbsp;&middot;&nbsp; <i class='bx bx-link-external'></i> read on Medium</div>
      </a>
    </li>`;
}

async function loadBlogPosts() {
  const list = document.querySelector('[data-blog-list]');
  if (!list) return;

  try {
    const res = await fetch(BLOG_POSTS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`couldn't load blog-posts.json (${res.status})`);

    const data = await res.json();
    if (!data.items?.length) throw new Error('no posts found');

    list.innerHTML = data.items.map(renderBlogCard).join('');
  } catch (err) {
    list.innerHTML = `<li class="projects-error"><i class='bx bx-error-circle'></i> Couldn't load posts (${escapeHtml(err.message)}). <a href="https://medium.com/${MEDIUM_USER}" target="_blank">View on Medium &rarr;</a></li>`;
  }
}

loadBlogPosts();
