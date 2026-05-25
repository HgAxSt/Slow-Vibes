/* ── Nav scroll state ─────────────────────────────── */
const nav = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Scroll-reveal with IntersectionObserver ─────── */
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => observer.observe(el));

/* ── Smooth active link highlight ────────────────── */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((a) => {
          a.classList.toggle(
            'active',
            a.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((s) => sectionObserver.observe(s));

const sheetId = '19bVIlaZTeew5AHFyYy3oImLccdIvH38oiUAv4yqeKuk';
const sheetName = 'Página1';
const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

async function carregarAgenda() {
  try {
    const response = await fetch(sheetUrl);
    const data = await response.text();
    const rows = data.split('\n').slice(1);
    const container = document.getElementById('agenda-container');
    container.innerHTML = '';

    rows.forEach(row => {
      if (row.trim() === '') return;
      
      const cleanRow = row.replace(/^"|"$/g, '');
      const columns = cleanRow.split('","');
      
      if (columns.length >= 4) {
        const dataShow = columns[0].trim();
        const local = columns[1].trim();
        const horario = columns[2].trim();
        const status = columns[3].trim();

        const card = document.createElement('div');
        card.className = 'agenda-card';

        if (status.toLowerCase() === 'livre') {
          card.classList.add('status-livre');
        } else {
          card.classList.add('status-ocupado');
        }

        card.innerHTML = `
          <div class="agenda-data">${dataShow}</div>
          <div class="agenda-info">
            <h3 class="agenda-local">${local}</h3>
            <span class="agenda-horario">${horario}</span>
          </div>
          <div class="agenda-status">${status}</div>
        `;
        
        container.appendChild(card);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', carregarAgenda);