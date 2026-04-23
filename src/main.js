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

function renderSkills() {
  const container = document.getElementById('skills-container');
  container.innerHTML = '';

  // Remove existing deselect container if any
  const existingDeselect = document.querySelector('.deselect-container');
  if (existingDeselect) {
    existingDeselect.remove();
  }

  skills.forEach(skill => {
    const count = skillCounts[skill];
    const levelInfo = getSkillLevelInfo(count);

    const span = document.createElement('span');
    span.className = `skill-tag ${levelInfo.class}`;

    span.innerHTML = `${skill} <span class="skill-pie" title="${levelInfo.label}" style="background: conic-gradient(currentColor ${levelInfo.percentage}%, transparent 0);"></span>`;

    span.addEventListener('click', () => {
      if (selectedSkills.has(skill)) {
        selectedSkills.delete(skill);
        span.classList.remove('selected');
      } else {
        selectedSkills.add(skill);
        span.classList.add('selected');
      }
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
    card.style.animationDelay = `${index * 0.1}s`;

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
    observer.observe(card);
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
    observer.observe(card);
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

document.addEventListener('DOMContentLoaded', () => {
  fetch('/cv.json')
    .then(response => response.json())
    .then(data => {
      initData(data);
      renderSkills();
      renderProjects();
      renderOthers();
    })
    .catch(error => console.error('Error loading cv.json:', error));
});
