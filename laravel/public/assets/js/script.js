'use strict';

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

// project filter
const filterBtns = document.querySelectorAll('[data-filter-btn]');
const projectItems = document.querySelectorAll('[data-filter-item]');

function filterProjects(category) {
  projectItems.forEach(item => {
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

filterProjects('all');

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
