import './style.css'

let projects = [];
let skillCounts = {};
let skills = [];
let selectedSkills = new Set();
let othersData = {};

function getMonthsDiff(fromDateStr, toDateStr) {
  if (!fromDateStr) return 0;
  const start = new Date(fromDateStr);
  const end = toDateStr ? new Date(toDateStr) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months + 1);
}

function getSkillLevelInfo(months) {
  if (months > 24) return { label: 'Expert', percentage: 100, class: 'expert' };
  if (months >= 6) return { label: 'Middle', percentage: 66, class: 'middle' };
  return { label: 'Junior', percentage: 33, class: 'junior' };
}

function updateUrlParams() {
  const url = new URL(window.location);
  if (selectedSkills.size > 0) {
    url.searchParams.set('skills', Array.from(selectedSkills).join(','));
  } else {
    url.searchParams.delete('skills');
  }
  window.history.replaceState({}, '', url);
}

function renderSkills() {
  const container = document.getElementById('skills-container');
  const searchInput = document.getElementById('skill-search');
  const filter = searchInput ? searchInput.value.toLowerCase() : '';
  container.innerHTML = '';

  // Remove existing deselect container if any
  const existingDeselect = document.querySelector('.deselect-container');
  if (existingDeselect) {
    existingDeselect.remove();
  }

  skills.forEach(skill => {
    if (filter && !skill.toLowerCase().includes(filter)) return;
    const count = skillCounts[skill];
    const levelInfo = getSkillLevelInfo(count);

    const span = document.createElement('span');
    span.className = `skill-tag ${levelInfo.class}${selectedSkills.has(skill) ? ' selected' : ''}`;

    span.innerHTML = `${skill} <span class="skill-pie" title="${levelInfo.label}" style="background: conic-gradient(currentColor ${levelInfo.percentage}%, transparent 0);"></span>`;

    span.addEventListener('click', () => {
      if (selectedSkills.has(skill)) {
        selectedSkills.delete(skill);
        span.classList.remove('selected');
      } else {
        selectedSkills.add(skill);
        span.classList.add('selected');
      }
      updateUrlParams();
      renderProjects();
    });

    container.appendChild(span);
  });

  const deselectContainer = document.createElement('div');
  deselectContainer.className = 'deselect-container';

  const deselectBtn = document.createElement('button');
  deselectBtn.className = 'deselect-btn';
  deselectBtn.innerHTML = '&#10005;'; // Small cross
  deselectBtn.title = 'Deselect all skills';

  deselectBtn.addEventListener('click', () => {
    selectedSkills.clear();
    document.querySelectorAll('.skill-tag.selected').forEach(tag => {
      tag.classList.remove('selected');
    });
    updateUrlParams();
    renderProjects();
  });

  deselectContainer.appendChild(deselectBtn);
  container.parentNode.insertBefore(deselectContainer, container.nextSibling);
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}/${month}`;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function renderSelectedSkillsDetails() {
  const section = document.getElementById('selected-skills');
  const container = document.getElementById('selected-skills-container');

  if (!section || !container) return;

  if (selectedSkills.size === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = '';

  Array.from(selectedSkills).forEach(skill => {
    const skillProjects = projects.filter(p => p.tech.includes(skill));
    const projectCount = skillProjects.length;
    let months = 0;
    let latestDate = 0;
    let isCurrent = false;

    skillProjects.forEach(p => {
      months += getMonthsDiff(p.fromDate, p.toDate);
      if (!p.toDate) {
        isCurrent = true;
      } else {
        const pDate = new Date(p.toDate).getTime();
        if (pDate > latestDate) latestDate = pDate;
      }
    });

    let lastUsedStr = '';
    if (isCurrent) {
      lastUsedStr = 'Heute';
    } else if (latestDate > 0) {
      const d = new Date(latestDate);
      lastUsedStr = d.toLocaleDateString('de-DE', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const card = document.createElement('div');
    card.className = 'selected-skill-card';
    card.innerHTML = `
      <h3 class="selected-skill-title">${skill}</h3>
      <div class="selected-skill-stats">
        <div>Projekte: ${projectCount}</div>
        <div>Monate: ${months}</div>
        <div>Zuletzt: ${lastUsedStr}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderProjects() {
  renderSelectedSkillsDetails();

  const container = document.getElementById('projects-container');
  container.innerHTML = '';

  let projectsToRender = projects;
  const projectsTitle = document.getElementById('projects-title');

  if (selectedSkills.size > 0) {
    projectsToRender = projects.map(p => {
      const matchCount = p.tech.filter(t => selectedSkills.has(t)).length;
      return { ...p, matchCount };
    }).filter(p => p.matchCount > 0);

    if (projectsTitle) {
      projectsTitle.textContent = `Ausgewählte Projekte [${projectsToRender.length}/${projects.length}]`;
    }

    projectsToRender.sort((a, b) => {
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      const dateA = a.toDate ? new Date(a.toDate).getTime() : Infinity;
      const dateB = b.toDate ? new Date(b.toDate).getTime() : Infinity;
      return dateB - dateA;
    });
  } else {
    if (projectsTitle) projectsTitle.textContent = `Projekte [${projects.length}/${projects.length}]`;
  }

  projectsToRender.forEach((project, index) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    // Store year for scroll indicator
    const refDate = project.toDate || project.fromDate;
    if (refDate) card.dataset.year = new Date(refDate).getFullYear();

    let dateStr = '';
    if (project.fromDate) {
      dateStr = formatDate(project.fromDate);
      if (project.toDate) {
        dateStr += ` - ${formatDate(project.toDate)}`;
      } else {
        dateStr += ' - Heute';
      }
    }

    card.innerHTML = `
      <div class="project-header">
        <h3 class="project-title">${project.title}</h3>
        ${dateStr ? `<span class="project-date">${dateStr}</span>` : ''}
      </div>
      <div class="project-role">${project.role || ''}</div>
      <p class="project-desc">${project.description || ''}</p>
      <div class="project-tech">
        ${project.tech.map(tech => `<span class="tech-tag ${selectedSkills.has(tech) ? 'matched' : ''}">${tech}</span>`).join('')}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderOthers() {
  const container = document.getElementById('others-container');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(othersData).forEach(([key, value]) => {
    let contentHtml = '';
    if (Array.isArray(value)) {
      contentHtml = `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>`;
    } else {
      contentHtml = value;
    }

    const card = document.createElement('div');
    card.className = 'other-card';
    card.innerHTML = `
      <h3 class="other-title">${key}</h3>
      <div class="other-content">${contentHtml}</div>
    `;
    container.appendChild(card);
  });
}

function initData(data) {
  if (data.person) {
    const titleEl = document.querySelector('.title');
    if (titleEl) titleEl.textContent = data.person.name;
    const sloganEl = document.querySelector('.slogan');
    if (sloganEl) sloganEl.textContent = `"${data.person.motto}"`;
  }

  if (data.me) {
    othersData = data.me;
  }

  if (data.projects) {
    projects = data.projects.map(p => {
      let tech = [];
      if (p.skills) {
        tech = p.skills.map(s => typeof s === 'string' ? s : s.name);
      }
      return {
        title: p.name,
        role: p.role,
        description: p.description,
        tech: tech,
        fromDate: p.fromDate,
        toDate: p.toDate
      };
    });

    projects.sort((a, b) => {
      const dateA = a.toDate ? new Date(a.toDate).getTime() : Infinity;
      const dateB = b.toDate ? new Date(b.toDate).getTime() : Infinity;
      return dateB - dateA;
    });

    skillCounts = {};
    projects.forEach(p => {
      const months = getMonthsDiff(p.fromDate, p.toDate);
      p.tech.forEach(t => {
        skillCounts[t] = (skillCounts[t] || 0) + months;
      });
    });

    skills = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a] || a.localeCompare(b));
  }
}

const themes = ['theme-default', 'theme-business', 'theme-minimalist', 'theme-nerd', 'theme-robot', 'theme-kandinsky', 'theme-eco', 'theme-klingon'];

// ── Scroll Year Indicator ──────────────────────────────────────────────────
let scrollYearEl = null;
let scrollHideTimer = null;

function createScrollYearIndicator() {
  scrollYearEl = document.createElement('div');
  scrollYearEl.id = 'scroll-year-indicator';
  scrollYearEl.innerHTML = '<span class="syi-year">2026</span>';
  document.body.appendChild(scrollYearEl);
}

function updateScrollYearIndicator() {
  const projectsSection = document.getElementById('projects');
  if (!projectsSection || !scrollYearEl) return;

  const sectionRect = projectsSection.getBoundingClientRect();
  // Only active while projects section is in view
  if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) return;

  // Find the project card closest to the upper third of the viewport
  const cards = projectsSection.querySelectorAll('.project-card');
  let bestCard = null;
  let bestDist = Infinity;
  const targetY = window.innerHeight * 0.35;

  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const dist = Math.abs(rect.top - targetY);
    if (dist < bestDist) {
      bestDist = dist;
      bestCard = card;
    }
  });

  if (bestCard && bestCard.dataset.year) {
    scrollYearEl.querySelector('.syi-year').textContent = bestCard.dataset.year;
    scrollYearEl.classList.add('visible');
  }

  clearTimeout(scrollHideTimer);
  scrollHideTimer = setTimeout(() => {
    scrollYearEl.classList.remove('visible');
  }, 1000);
}

function applyTheme() {
  const mottos = {
    'theme-default': "Unus pro omnibus, omnes pro uno",
    'theme-business': "Präzision. Exzellenz. Innovation.",
    'theme-minimalist': "Einfachheit ist die höchste Stufe der Vollendung.",
    'theme-nerd': "10 types of people: those who understand binary, and those who don't.",
    'theme-robot': "Logik ist der Anfang der Weisheit, nicht das Ende.",
    'theme-kandinsky': "Farbe ist die Tastatur, die Augen sind die Hämmer.",
    'theme-eco': "Code im Einklang mit der Natur.",
    'theme-klingon': "Heghlu'meH QaQ jajvam (Heute ist ein guter Tag zum Sterben)"
  };

  const hash = window.location.hash.toLowerCase().replace('#', '');
  const now = Date.now();
  const lastTime = parseInt(sessionStorage.getItem('portfolio_theme_time') || '0');
  const lastTheme = sessionStorage.getItem('portfolio_theme_name');

  document.body.classList.remove(...themes);

  let activeTheme = 'theme-default';

  // 1. Priority: URL Hash
  if (['business', 'minimalist', 'nerd', 'robot', 'kandinsky', 'eco', 'klingon', 'default'].includes(hash)) {
    activeTheme = `theme-${hash}`;
    window.__activeTheme = activeTheme; // Cache for second call
  }
  // 2. Priority: Cached decision for this page load
  else if (window.__activeTheme) {
    activeTheme = window.__activeTheme;
  }
  // 3. Priority: Fast Reload Iteration
  else if (lastTheme && (now - lastTime < 10000)) {
    const currentIndex = themes.indexOf(lastTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    activeTheme = themes[nextIndex];
    window.__activeTheme = activeTheme;
    sessionStorage.setItem('portfolio_theme_time', now.toString());
    sessionStorage.setItem('portfolio_theme_name', activeTheme);
  }
  // 4. Fallback: Keep last theme or start with default
  else {
    activeTheme = lastTheme || 'theme-default';
    window.__activeTheme = activeTheme;
    sessionStorage.setItem('portfolio_theme_time', now.toString());
    sessionStorage.setItem('portfolio_theme_name', activeTheme);
  }

  if (activeTheme !== 'theme-default') {
    document.body.classList.add(activeTheme);
  }

  const avatarImage = document.querySelector('.avatar-image');
  if (avatarImage) {
    if (activeTheme === 'theme-business') {
      avatarImage.src = 'business.png';
    } else if (activeTheme === 'theme-minimalist') {
      avatarImage.src = 'minimalist.png';
    } else if (activeTheme === 'theme-nerd') {
      avatarImage.src = 'nerd.png';
    } else if (activeTheme === 'theme-robot') {
      avatarImage.src = 'robot.png';
    } else if (activeTheme === 'theme-kandinsky') {
      avatarImage.src = 'kandinsky.png';
    } else if (activeTheme === 'theme-eco') {
      avatarImage.src = 'eco.png';
    } else if (activeTheme === 'theme-klingon') {
      avatarImage.src = 'klingon.png';
    } else {
      avatarImage.src = 'default.png';
    }
  }

  const sloganEl = document.querySelector('.slogan');
  if (sloganEl) {
    const motto = mottos[activeTheme] || mottos['theme-default'];
    sloganEl.textContent = `"${motto}"`;
  }
}

window.addEventListener('hashchange', applyTheme);

document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  createScrollYearIndicator();
  window.addEventListener('scroll', updateScrollYearIndicator, { passive: true });

  // Pre-select skills from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const skillsParam = urlParams.get('skills');
  if (skillsParam) {
    skillsParam.split(',').forEach(s => {
      const trimmed = s.trim();
      if (trimmed) selectedSkills.add(trimmed);
    });
  }

  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.style.cursor = 'pointer';
    scrollIndicator.addEventListener('click', () => {
      const skillsTitle = document.querySelector('#skills .section-title');
      if (skillsTitle) {
        skillsTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  const searchInput = document.getElementById('skill-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderSkills();
    });
  }

  // Keyboard shortcut CMD/Ctrl + K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus({ preventScroll: true });
      }
      const skillsTitle = document.querySelector('#skills .section-title');
      if (skillsTitle) {
        skillsTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  fetch('cv.json')
    .then(response => response.json())
    .then(data => {
      initData(data);
      applyTheme(); // Ensure theme-specific content is applied
      renderSkills();
      renderProjects();
      renderOthers();
    })
    .catch(error => console.error('Error loading cv.json:', error));
});
