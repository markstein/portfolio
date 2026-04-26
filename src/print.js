document.addEventListener('DOMContentLoaded', () => {
  const baseUrl = import.meta.env.BASE_URL || '/';

  fetch(`${baseUrl}cv.json`)
    .then(response => {
      if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
        return fetch('cv.json');
      }
      return response;
    })
    .then(response => response.json())
    .then(data => {
      renderCV(data);
      initActions();
    })
    .catch(error => console.error('Error loading CV data:', error));
});

function renderCV(data) {
  // 1. Header Info
  document.getElementById('name').textContent = data.person.name;
  document.getElementById('motto').textContent = data.person.motto;

  // 2. Sidebar Info (Bio, Ausbildung, etc.)
  renderSidebar(data.me);

  // 3. Projects
  renderProjects(data.projects);
}

function renderSidebar(me) {
  const container = document.getElementById('sidebar-content');
  container.innerHTML = '';

  const sections = ['Bio', 'Ausbildung', 'Schulungen', 'Kontakt'];

  sections.forEach(key => {
    if (me[key]) {
      const section = document.createElement('div');
      section.className = 'sidebar-section';

      const title = document.createElement('h3');
      title.className = 'sidebar-title';
      title.textContent = key;

      const content = document.createElement('div');
      content.className = 'sidebar-content';

      if (Array.isArray(me[key])) {
        const ul = document.createElement('ul');
        me[key].forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = item; // Use innerHTML to support links if any
          ul.appendChild(li);
        });
        content.appendChild(ul);
      } else {
        content.textContent = me[key];
      }

      section.appendChild(title);
      section.appendChild(content);
      container.appendChild(section);
    }
  });
}

function renderProjects(projects) {
  const container = document.getElementById('projects-list');
  container.innerHTML = '';

  // Sort projects descending by date (newest first)
  const sortedProjects = [...projects].sort((a, b) => {
    const dateA = a.toDate ? new Date(a.toDate) : new Date();
    const dateB = b.toDate ? new Date(b.toDate) : new Date();
    return dateB - dateA;
  });

  sortedProjects.forEach(project => {
    const div = document.createElement('div');
    div.className = 'project-item';

    const dateStr = `${formatDate(project.fromDate)} — ${project.toDate ? formatDate(project.toDate) : 'Heute'}`;

    // Skills as minimalist comma separated list
    const skillsText = project.skills ? project.skills.map(s => typeof s === 'string' ? s : s.name).join(', ') : '';

    div.innerHTML = `
      <div class="project-header">
        <span class="project-name">${project.name}</span>
        <span class="project-date">${dateStr}</span>
      </div>
      <div class="project-role-customer">${project.role}${project.customer ? ` @ ${project.customer}` : ''}</div>
      <div class="project-description">${project.description}</div>
      ${skillsText ? `<div class="project-skills">${skillsText}</div>` : ''}
    `;

    container.appendChild(div);
  });
}


function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
}

function initActions() {
  const printBtn = document.getElementById('print-btn');
  const pdfBtn = document.getElementById('pdf-btn');

  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
      const element = document.body;
      const opt = {
        margin: [20, 10, 20, 10], // 20mm top/bottom, 10mm left/right
        filename: 'Mark_Stein_CV.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate PDF using local html2pdf
      html2pdf().set(opt).from(element).save();
    });
  }
}
