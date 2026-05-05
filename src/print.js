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
  const wordBtn = document.getElementById('word-btn');

  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
      const element = document.querySelector('.cv-container');
      const opt = {
        margin: [20, 10, 20, 10],
        filename: `${new Date().toISOString().split('T')[0]}-Mark-Stein-CV.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      document.body.classList.add('is-generating-pdf');
      html2pdf().set(opt).from(element).save().then(() => {
        document.body.classList.remove('is-generating-pdf');
      });
    });
  }

  if (wordBtn) {
    wordBtn.addEventListener('click', async () => {
      // Get base64 of the image for embedding, cropped to circle via Canvas
      const img = document.querySelector('.avatar-image');
      let imgBase64 = '';
      if (img) {
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const bitmap = await createImageBitmap(blob);
          
          const canvas = document.createElement('canvas');
          const size = Math.min(bitmap.width, bitmap.height);
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          
          // Draw circular mask
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          // Draw image centered
          ctx.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, size, size);
          
          imgBase64 = canvas.toDataURL('image/png');
        } catch (e) {
          console.error('Could not load or crop image for Word:', e);
        }
      }

      // Get content and wrap in a table for Word compatibility (best way for 2 columns)
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');
      
      if (!sidebar || !mainContent) return;

      // Clone nodes to manipulate them without affecting the page
      const sidebarClone = sidebar.cloneNode(true);
      const mainClone = mainContent.cloneNode(true);

      // Inject base64 image into clone and force size/style
      const cloneImg = sidebarClone.querySelector('.avatar-image');
      if (cloneImg && imgBase64) {
        cloneImg.src = imgBase64;
        // Word respects attributes more than CSS sometimes
        cloneImg.setAttribute('width', '130');
        cloneImg.setAttribute('height', '130');
        cloneImg.style.width = '100pt';
        cloneImg.style.height = '100pt';
        cloneImg.style.borderRadius = '50pt';
        cloneImg.style.border = '3pt solid #0f4c81';
      }

      const content = `
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 25%; vertical-align: top; padding-right: 15pt; border-right: 1px solid #eeeeee;">
              ${sidebarClone.innerHTML}
            </td>
            <td style="width: 75%; vertical-align: top; padding-left: 20pt;">
              ${mainClone.innerHTML}
            </td>
          </tr>
        </table>
      `;
      
      const styles = `
        <style>
          @page { size: A4; margin: 1.5cm; }
          body { font-family: 'Arial', sans-serif; font-size: 10pt; color: #1a1a1a; }
          h1 { color: #1a1a1a; font-size: 26pt; margin-bottom: 2pt; font-weight: bold; }
          .title { color: #0f4c81; font-size: 13pt; text-transform: uppercase; letter-spacing: 1.5pt; margin-bottom: 5pt; font-weight: bold; }
          .motto { font-style: italic; color: #666666; margin-bottom: 15pt; font-size: 9pt; }
          h2 { color: #1a1a1a; border-bottom: 1.5pt solid #dddddd; font-size: 15pt; margin-top: 15pt; margin-bottom: 8pt; font-weight: bold; }
          h3 { color: #0f4c81; font-size: 10.5pt; text-transform: uppercase; border-bottom: 1pt solid #0f4c81; margin-bottom: 6pt; margin-top: 12pt; font-weight: bold; }
          .project-item { margin-bottom: 12pt; }
          .project-header { font-weight: bold; margin-bottom: 1pt; }
          .project-date { color: #666666; font-family: 'Courier New', monospace; font-size: 8.5pt; }
          .project-role-customer { font-style: italic; color: #0f4c81; margin-bottom: 3pt; font-size: 9.5pt; }
          .project-description { text-align: justify; color: #333333; margin-top: 2pt; font-size: 9.5pt; line-height: 1.3; }
          .project-skills { font-size: 8pt; color: #666666; font-style: italic; margin-top: 3pt; }
          .avatar-container { text-align: center; margin-bottom: 15pt; }
          ul { list-style-type: none; padding-left: 0; margin: 0; }
          li { margin-bottom: 3pt; font-size: 9pt; }
          .sidebar-section { margin-bottom: 15pt; }
          /* Help Word with image circle */
          img { border-radius: 50pt; }
        </style>
      `;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            ${styles}
          </head>
          <body>
            ${content}
          </body>
        </html>
      `;

      const converted = htmlDocx.asBlob(html, { orientation: 'portrait' });
      const today = new Date().toISOString().split('T')[0];
      saveAs(converted, `${today}-Mark-Stein-CV.docx`);
    });
  }
}
