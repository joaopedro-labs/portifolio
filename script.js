document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const copyEmailBtns = document.querySelectorAll('.copy-email-btn');
  const toast = document.getElementById('toast');
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const currentYearEl = document.getElementById('currentYear');
  const githubReposGrid = document.getElementById('githubReposGrid');

  // Atualiza ano atual no rodapé
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // 1. Alternância de Tema (Escuro / Claro)
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
  }

  themeToggle?.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', nextTheme);
    localStorage.setItem('portfolio-theme', nextTheme);
  });

  // 2. Menu Mobile
  mobileMenuBtn?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks?.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    });
  });

  // 3. Filtro de Projetos por Categoria
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-filter');

      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      projectCards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // 4. Copiar E-mail com Notificação Toast
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  copyEmailBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-email');
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        showToast(`E-mail "${email}" copiado!`);
      } catch {
        showToast(`Copie manualmente: ${email}`);
      }
    });
  });

  // 5. Envio do Formulário de Contato
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const nome = formData.get('nome');
    const email = formData.get('email');
    const assunto = formData.get('assunto');
    const mensagem = formData.get('mensagem');

    const mailtoLink = `mailto:joaopedroaraujo953@gmail.com?subject=${encodeURIComponent(
      `[Portfólio - ${assunto}] Contato de ${nome}`
    )}&body=${encodeURIComponent(
      `Nome/Empresa: ${nome}\nE-mail de retorno: ${email}\nOportunidade: ${assunto}\n\nMensagem:\n${mensagem}`
    )}`;

    window.location.href = mailtoLink;

    if (formFeedback) {
      formFeedback.textContent = 'Obrigado! Seu cliente de e-mail foi aberto com a mensagem pronta.';
    }
    contactForm.reset();
  });

  // 6. Integração Automática com a API do GitHub (@joaopedro-labs)
  async function carregarRepositoriosGitHub() {
    try {
      const response = await fetch('https://api.github.com/users/joaopedro-labs/repos?sort=updated&per_page=15');
      if (!response.ok) throw new Error('Falha ao consultar GitHub API');
      const repos = await response.json();

      if (!Array.isArray(repos)) return;

      // 6.1 Vincula automaticamente os links dos cards principais ao nome exato do repositório no GitHub
      projectCards.forEach((card) => {
        const keywordsAttr = card.getAttribute('data-repo-keywords');
        const linkEl = card.querySelector('.repo-dynamic-link');
        if (!keywordsAttr || !linkEl) return;

        const keywords = keywordsAttr.toLowerCase().split(',');
        const matchedRepo = repos.find((r) => {
          const repoName = (r.name || '').toLowerCase();
          return keywords.some((kw) => repoName.includes(kw.trim()));
        });

        if (matchedRepo && matchedRepo.html_url) {
          linkEl.setAttribute('href', matchedRepo.html_url);
        }
      });

      // 6.2 Renderiza os repositórios públicos na grade ao vivo (mantendo apenas o Anna-Bella-Oficial)
      if (githubReposGrid) {
        const reposOcultos = ['joaopedro-labs', 'anna-bella', 'anna-bella2'];
        const reposFiltrados = repos.filter((r) => !reposOcultos.includes((r.name || '').toLowerCase()));
        if (reposFiltrados.length === 0) {
          githubReposGrid.innerHTML = '<p class="github-loading">Nenhum repositório público adicional encontrado.</p>';
          return;
        }

        githubReposGrid.innerHTML = reposFiltrados
          .slice(0, 8)
          .map((repo) => {
            const dataAtualizacao = new Date(repo.updated_at).toLocaleDateString('pt-BR');
            const linguagem = repo.language || 'Código / Docs';
            const descricao =
              repo.description || 'Repositório público desenvolvido por João Pedro (@joaopedro-labs).';

            return `
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="github-repo-mini-card">
                <div>
                  <div class="github-repo-name">📁 ${repo.name}</div>
                  <p class="github-repo-desc">${descricao}</p>
                </div>
                <div class="github-repo-meta">
                  <span class="github-lang-badge">● ${linguagem}</span>
                  <span>Atualizado em ${dataAtualizacao} ↗</span>
                </div>
              </a>
            `;
          })
          .join('');
      }
    } catch {
      if (githubReposGrid) {
        githubReposGrid.innerHTML = `
          <p class="github-loading">
            Veja todos os repositórios diretamente em 
            <a href="https://github.com/joaopedro-labs?tab=repositories" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary); font-weight: 600;">
              github.com/joaopedro-labs ↗
            </a>
          </p>
        `;
      }
    }
  }

  carregarRepositoriosGitHub();
});
