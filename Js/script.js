// Utility Functions
const Utils = {
  // Debounce para performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle para scroll
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // localStorage com fallback
  storage: {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
  },

  // Query selector seguro
  $(selector) {
    return document.querySelector(selector);
  },

  $$(selector) {
    return document.querySelectorAll(selector);
  }
};

// ============================================
// Theme Manager 
// ============================================

const ThemeManager = {
  init() {
    this.toggleBtn = Utils.$('#toggle-theme');

  },

};

// ============================================
// Mobile Menu - Menu Mobile
// ============================================
const MobileMenu = {
  init() {
    this.toggle = Utils.$('#mobile-toggle');
    this.menu = Utils.$('#nav-menu');
    this.links = Utils.$$('.nav-link');
    
    if (!this.toggle || !this.menu) return;

    this.setupListeners();
  },

  setupListeners() {
    this.toggle.addEventListener('click', () => this.toggleMenu());
    
    // Fecha ao clicar em link
    this.links.forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      if (this.menu.classList.contains('active') && 
          !this.menu.contains(e.target) && 
          !this.toggle.contains(e.target)) {
        this.close();
      }
    });
  },

  toggleMenu() {
    const isActive = this.menu.classList.toggle('active');
    this.toggle.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
  },

  close() {
    this.menu.classList.remove('active');
    this.toggle.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ============================================
// Skills Animation 
// ============================================
const SkillsAnimation = {
  init() {
    this.bars = Utils.$$('.barra-skill .barra div');
    if (!this.bars.length) return;

    this.setupObserver();
  },

  setupObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => this.animateBar(entry.target), index * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.bars.forEach(bar => observer.observe(bar));
  },

  animateBar(bar) {
    const targetWidth = bar.dataset.skill || bar.style.width;
    bar.style.width = '0%';
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        bar.style.width = targetWidth;
      }, 50);
    });
  }
};

// ============================================
// Projects Interaction 
// ============================================
const ProjectsInteraction = {
  init() {
    this.projects = Utils.$$('.projeto');
    if (!this.projects.length) return;

    this.setupListeners();
  },

  setupListeners() {
    this.projects.forEach(project => {
      project.addEventListener('click', (e) => this.handleClick(e, project));
    });
  },

  handleClick(e, project) {
    // Não expande se clicou no link
    if (e.target.closest('a')) return;

    const isActive = project.classList.contains('projeto-active');
    
    // Remove active de todos
    this.projects.forEach(p => p.classList.remove('projeto-active'));
    
    // Toggle este
    if (!isActive) {
      project.classList.add('projeto-active');
      project.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
};

// ============================================
// Active Menu Link 
// ============================================
const ActiveMenuLink = {
  init() {
    this.sections = Utils.$$('section[id]');
    this.navLinks = Utils.$$('.nav-link');
    
    if (!this.sections.length) return;

    this.setupListener();
  },

  setupListener() {
    window.addEventListener('scroll', Utils.throttle(() => {
      this.update();
    }, 100));
  },

  update() {
    const scrollY = window.pageYOffset;

    this.sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        this.navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
};

// ============================================
// Header Scroll 
// ============================================
const HeaderScroll = {
  init() {
    this.header = Utils.$('header');
    this.lastScroll = 0;
    
    if (!this.header) return;

    this.setupListener();
  },

  setupListener() {
    window.addEventListener('scroll', Utils.throttle(() => {
      this.update();
    }, 100));
  },

  update() {
    const currentScroll = window.pageYOffset;

    // Adiciona classe scrolled
    this.header.classList.toggle('scrolled', currentScroll > 100);

    // Auto-hide (opcional - remova se não quiser)
    if (currentScroll > this.lastScroll && currentScroll > 300) {
      this.header.style.transform = 'translateY(-100%)';
    } else {
      this.header.style.transform = 'translateY(0)';
    }

    this.lastScroll = currentScroll;
  }
};



// ============================================
// Micro Interactions - Micro Interações
// ============================================
const MicroInteractions = {
  init() {
    this.addClickFeedback();
    this.addHoverEffects();
  },

  addClickFeedback() {
    const clickables = Utils.$$('a, button, .cartao, .projeto');
    
    clickables.forEach(el => {
      el.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.98)';
      });
      
      el.addEventListener('mouseup', function() {
        this.style.transform = '';
      });
    });
  },

  addHoverEffects() {
    const socialIcons = Utils.$$('.social-icons a');
    
    socialIcons.forEach(icon => {
      icon.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.1)';
      });
      
      icon.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  }
};

// ============================================
// Lazy Loading 
// ============================================
const LazyLoad = {
  init() {
    this.images = Utils.$$('img[loading="lazy"]');
    
    if (!this.images.length || !('IntersectionObserver' in window)) return;

    this.setupObserver();
  },

  setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    this.images.forEach(img => observer.observe(img));
  }
};

// ============================================
// App Initializer - Inicializador
// ============================================
const App = {
  init() {
    console.log('%c🚀 Salvee, Como um foguete, estou sempre em constante evolução, apontando para o high', 'font-size: 20px; color: #fcfcfc; font-weight: bold;');
    
    // Inicializa todos os módulos
    ThemeManager.init();
    TranslationSystem.init();
    MobileMenu.init();
    SkillsAnimation.init();
    ProjectsInteraction.init();
    ActiveMenuLink.init();
    HeaderScroll.init();
    FormHandler.init();
    MicroInteractions.init();
    LazyLoad.init();

    // Inicializa AOS 
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 100
      });
    }

    this.initParticles();
  },

  initParticles() {
    if (typeof particlesJS === 'undefined') return;

    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#5d05ff' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#ffffff',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          out_mode: 'out'
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        },
        modes: {
          grab: { distance: 140, line_linked: { opacity: 1 } },
          push: { particles_nb: 4 }
        }
      },
      retina_detect: true
    });
  }
};

// ============================================
// Initialize when DOM is ready
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Export para uso em módulos 
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App, ThemeManager, FormHandler };
}

// Sistema de Tradução PT/EN
const TranslationSystem = {
  translations: {
    'pt-BR': {
      'nav-about': 'Sobre', 'nav-services': 'Serviços', 'nav-solutions': 'Soluções',
      'nav-projects': 'Projetos', 'nav-skills': 'Habilidades', 'nav-contact': 'Contato',
      'btn-hire': 'Contrate-me', 'hero-greeting': 'Olá, eu sou',
      'hero-title': 'Desenvolvedor Web & Designer UX',
      'hero-description': 'Resolvo problemas complexos de experiência do usuário com soluções focadas em integridade que conectam milhares de pessoas através de designs inovadores e código limpo.',
      'services-title': 'Serviços', 'service-brand-title': 'Design de Marca',
      'service-brand-desc': 'Criação de identidade visual completa com soluções criativas e eficazes que fortalecem a presença da sua marca no mercado digital.',
      'service-web-title': 'Desenvolvimento Web',
      'service-web-desc': 'Sites modernos, responsivos e otimizados com foco na performance e experiência do usuário utilizando tecnologias atuais.',
      'service-ui-title': 'UI/UX Design',
      'service-ui-desc': 'Interfaces intuitivas e agradáveis com foco no usuário, criando experiências memoráveis e conversões efetivas.',
      'solutions-title': 'O que eu resolvo',
      'solutions-subtitle': 'Transformo desafios técnicos em soluções elegantes que impactam usuários reais',
      'solution-performance-title': 'Performance & Otimização',
      'solution-performance-problem': 'Sites lentos afastam usuários e reduzem conversões',
      'solution-performance-1': 'Redução de tempo de carregamento em até 70%',
      'solution-performance-2': 'Lazy loading e code splitting inteligente',
      'solution-performance-3': 'Otimização de imagens e recursos',
      'solution-performance-4': 'Implementação de cache estratégico',
      'solution-ux-title': 'Experiência do Usuário',
      'solution-ux-problem': 'Interfaces confusas levam à frustração e abandono',
      'solution-ux-1': 'Design centrado no usuário e testes de usabilidade',
      'solution-ux-2': 'Fluxos intuitivos que aumentam conversão',
      'solution-ux-3': 'Acessibilidade (WCAG 2.1) para todos os públicos',
      'solution-ux-4': 'Micro-interações que encantam',
      'solution-desktop-title': 'Aplicações Desktop',
      'solution-desktop-problem': 'Necessidade de apps nativas multiplataforma',
      'solution-desktop-1': 'Electron apps para Windows, Mac e Linux',
      'solution-desktop-2': 'Performance nativa com tecnologias web',
      'solution-desktop-3': 'Integração com APIs e sistemas locais',
      'solution-desktop-4': 'Auto-update e distribuição simplificada',
      'solution-api-title': 'Integração de APIs',
      'solution-api-problem': 'Sistemas isolados que não conversam entre si',
      'solution-api-1': 'Consumo e criação de APIs RESTful',
      'solution-api-2': 'Integração com serviços terceiros',
      'solution-api-3': 'Webhooks e comunicação em tempo real',
      'solution-api-4': 'Tratamento robusto de erros',
      'cta-title': 'Tem um desafio semelhante?',
      'cta-button': 'Vamos conversar',
      'projects-title': 'Meus Projetos',
      'project-link': 'Ver Projeto',
      'project-recorder-desc': 'Aplicação de gravação de tela desenvolvida com HTML, CSS e JavaScript, focada em simplicidade e performance.',
      'project-sound-desc': 'Reprodutor de música moderno, desenvolvido com HTML, CSS e JavaScript.',
      'skills-title': 'Habilidades',
      'contact-title': 'Vamos trabalhar juntos!',
      'form-name': 'Nome completo', 'form-email': 'Seu e-mail',
      'form-subject': 'Assunto', 'form-message': 'Sua mensagem',
      'form-submit': 'Enviar Mensagem',
      'contact-info-title': 'Informações de Contato',
      'contact-phone': 'Telefone:', 'contact-location': 'Localização:',
      'contact-availability': 'Disponibilidade:',
      'contact-schedule': 'Segunda a Sexta, 9h às 18h',
      'footer-rights': 'Todos os direitos reservados.',
      'footer-made': 'Feito com', 'footer-code': 'e muito código'
    },
    'en-US': {
      'nav-about': 'About', 'nav-services': 'Services', 'nav-solutions': 'Solutions',
      'nav-projects': 'Projects', 'nav-skills': 'Skills', 'nav-contact': 'Contact',
      'btn-hire': 'Hire me', 'hero-greeting': 'Hello, I am',
      'hero-title': 'Web Developer & UX Designer',
      'hero-description': 'I solve complex user experience problems with integrity-focused solutions that connect thousands of people through innovative designs and clean code.',
      'services-title': 'Services', 'service-brand-title': 'Brand Design',
      'service-brand-desc': 'Complete visual identity creation with creative and effective solutions that strengthen your brand presence in the digital market.',
      'service-web-title': 'Web Development',
      'service-web-desc': 'Modern, responsive and optimized websites focused on performance and user experience using current technologies.',
      'service-ui-title': 'UI/UX Design',
      'service-ui-desc': 'Intuitive and pleasant interfaces focused on the user, creating memorable experiences and effective conversions.',
      'solutions-title': 'What I Solve',
      'solutions-subtitle': 'I transform technical challenges into elegant solutions that impact real users',
      'solution-performance-title': 'Performance & Optimization',
      'solution-performance-problem': 'Slow websites drive users away and reduce conversions',
      'solution-performance-1': 'Reduction of loading time by up to 70%',
      'solution-performance-2': 'Smart lazy loading and code splitting',
      'solution-performance-3': 'Image and resource optimization',
      'solution-performance-4': 'Strategic cache implementation',
      'solution-ux-title': 'User Experience',
      'solution-ux-problem': 'Confusing interfaces lead to frustration and abandonment',
      'solution-ux-1': 'User-centered design and usability testing',
      'solution-ux-2': 'Intuitive flows that increase conversion',
      'solution-ux-3': 'Accessibility (WCAG 2.1) for all audiences',
      'solution-ux-4': 'Delightful micro-interactions',
      'solution-desktop-title': 'Desktop Applications',
      'solution-desktop-problem': 'Need for native multiplatform apps',
      'solution-desktop-1': 'Electron apps for Windows, Mac and Linux',
      'solution-desktop-2': 'Native performance with web technologies',
      'solution-desktop-3': 'Integration with APIs and local systems',
      'solution-desktop-4': 'Simplified auto-update and distribution',
      'solution-api-title': 'API Integration',
      'solution-api-problem': 'Isolated systems that don\'t communicate with each other',
      'solution-api-1': 'RESTful API consumption and creation',
      'solution-api-2': 'Third-party service integration',
      'solution-api-3': 'Webhooks and real-time communication',
      'solution-api-4': 'Robust error handling',
      'cta-title': 'Have a similar challenge?',
      'cta-button': 'Let\'s talk',
      'projects-title': 'My Projects',
      'project-link': 'View Project',
      'project-recorder-desc': 'Screen recording application developed with HTML, CSS and JavaScript, focused on simplicity and performance.',
      'project-sound-desc': 'Modern music player, developed with HTML, CSS and JavaScript.',
      'skills-title': 'Skills',
      'contact-title': 'Let\'s work together!',
      'form-name': 'Full name', 'form-email': 'Your email',
      'form-subject': 'Subject', 'form-message': 'Your message',
      'form-submit': 'Send Message',
      'contact-info-title': 'Contact Information',
      'contact-phone': 'Phone:', 'contact-location': 'Location:',
      'contact-availability': 'Availability:',
      'contact-schedule': 'Monday to Friday, 9am to 6pm',
      'footer-rights': 'All rights reserved.',
      'footer-made': 'Made with', 'footer-code': 'and lots of code'
    }
  },
  
  currentLang: 'pt-BR',
  
  init() {
    this.btn = document.getElementById('languageToggle');
    this.flag = document.querySelector('.flag-icon');
    this.text = document.querySelector('.lang-text');
    if (!this.btn) return;
    
    this.btn.addEventListener('click', () => this.toggle());
    this.loadSaved();
  },
  
  toggle() {
    this.currentLang = this.currentLang === 'pt-BR' ? 'en-US' : 'pt-BR';
    this.apply();
    localStorage.setItem('lang', this.currentLang);
    this.btn.style.transform = 'scale(0.9)';
    setTimeout(() => this.btn.style.transform = 'scale(1)', 150);
  },
  
  apply() {
    const lang = this.translations[this.currentLang];
    this.flag.textContent = this.currentLang === 'pt-BR' ? '🇧🇷' : '🇺🇸';
    this.text.textContent = this.currentLang === 'pt-BR' ? 'PT' : 'EN';
    document.documentElement.lang = this.currentLang;
    
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.dataset.translate;
      if (lang[key]) el.textContent = lang[key];
    });
    
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
      const key = el.dataset.translatePlaceholder;
      if (lang[key]) el.placeholder = lang[key];
    });
  },
  
  
  loadSaved() {
    const saved = localStorage.getItem('lang');
    if (saved) {
      this.currentLang = saved;
      this.apply();
    }
  }
  
};







