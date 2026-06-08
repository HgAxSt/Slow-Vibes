const nav = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

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

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

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

function parseDataBR(dataStr) {
  const partes = dataStr.split('/');
  if (partes.length < 3) {
    const fallback = new Date();
    return { dataObj: fallback, mesStr: 'Indefinido', ano: fallback.getFullYear() };
  }
  
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);
  const dataObj = new Date(ano, mes, dia);

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return {
    dataObj,
    mesStr: nomesMeses[mes],
    ano
  };
}

async function carregarAgenda() {
  try {
    const response = await fetch(sheetUrl);
    const data = await response.text();
    const rows = data.split('\n').slice(1);
    const container = document.getElementById('agenda-container');
    container.innerHTML = '';

    const showsAgrupados = {};
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    rows.forEach(row => {
      if (row.trim() === '') return;
      
      const cleanRow = row.replace(/^"|"$/g, '');
      const columns = cleanRow.split('","');
      
      if (columns.length >= 4) {
        const dataShow = columns[0].trim();
        const local = columns[1].trim();
        const horario = columns[2].trim();
        let status = columns[3].trim();
        const linkVideo = columns[4] ? columns[4].trim() : null;

        const { dataObj, mesStr, ano } = parseDataBR(dataShow);
        const chaveGrupo = `${mesStr} ${ano}`;

        if (dataObj < hoje && status.toLowerCase() !== 'livre') {
          status = 'Concluído';
        }

        if (!showsAgrupados[chaveGrupo]) {
          showsAgrupados[chaveGrupo] = [];
        }

        showsAgrupados[chaveGrupo].push({
          dataShow,
          local,
          horario,
          status,
          linkVideo
        });
      }
    });

    for (const chave in showsAgrupados) {
      const grupoDiv = document.createElement('div');
      grupoDiv.className = 'agenda-month-group reveal visible';

      const tituloMes = document.createElement('h3');
      tituloMes.className = 'agenda-month-title';
      tituloMes.textContent = chave;
      grupoDiv.appendChild(tituloMes);

      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'agenda-cards-container';

      showsAgrupados[chave].forEach(show => {
        const card = document.createElement('div');
        card.className = 'agenda-card';

        if (show.status.toLowerCase() === 'livre') {
          card.classList.add('status-livre');
        } else if (show.status.toLowerCase() === 'concluído' || show.status.toLowerCase() === 'concluido') {
          card.classList.add('status-concluido');
        } else {
          card.classList.add('status-ocupado');
        }

        let videoHtml = '';
        if (show.linkVideo) {
          videoHtml = `<a href="${show.linkVideo}" target="_blank" rel="noopener noreferrer" class="btn-video">Assistir Show</a>`;
        }

        card.innerHTML = `
          <div class="agenda-data">${show.dataShow}</div>
          <div class="agenda-info">
            <h3 class="agenda-local">${show.local}</h3>
            <span class="agenda-horario">${show.horario}</span>
            ${videoHtml}
          </div>
          <div class="agenda-status">${show.status}</div>
        `;
        
        cardsContainer.appendChild(card);
      });

      grupoDiv.appendChild(cardsContainer);
      container.appendChild(grupoDiv);
    }
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', carregarAgenda);