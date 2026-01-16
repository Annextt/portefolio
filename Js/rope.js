// ============================================
// LIGHTBULB THEME TOGGLE 
// ============================================

const LightBulbToggle = {
  init() {
    this.toggleBtn = document.getElementById('toggle-theme');
    if (!this.toggleBtn) {
      console.error('Elemento #toggle-theme não encontrado!');
      return;
    }

    this.createLightBulb();
    this.setupRopePhysics();
    this.setupListeners();
    this.applyInitialTheme();
    this.startPhysicsLoop();
  },

  // --------------------------------------------
  // CRIAR SVG DA LÂMPADA
  // --------------------------------------------
  createLightBulb() {
    this.toggleBtn.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 200');
    svg.classList.add('lightbulb-svg');

    svg.innerHTML = `
      <!-- Defs para gradientes e efeitos -->
      <defs>
        <radialGradient id="glass-gradient-off" cx="45%" cy="35%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.2);stop-opacity:1" />
          <stop offset="70%" style="stop-color:rgba(255,255,255,0.05);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(200,200,200,0.1);stop-opacity:1" />
        </radialGradient>
        <radialGradient id="glass-gradient-on" cx="45%" cy="35%">
          <stop offset="0%" style="stop-color:rgba(255,255,220,1);stop-opacity:1" />
          <stop offset="50%" style="stop-color:rgba(255,240,180,0.95);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(255,220,150,0.8);stop-opacity:1" />
        </radialGradient>
        <linearGradient id="base-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#888;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#555;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#333;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Corpo da Lâmpada -->
      <g id="bulb-group">
        <!-- Brilho externo (quando acesa) -->
        <ellipse id="bulb-glow" cx="50" cy="50" rx="38" ry="42"
          fill="rgba(255,240,150,0)" opacity="0"/>
        
        <!-- Vidro principal -->
        <path id="bulb-glass" 
          d="M 50 20 
             C 35 20, 25 28, 25 42
             C 25 52, 28 58, 30 65
             Q 32 72, 35 78
             L 35 82
             C 35 84, 37 85, 40 85
             L 60 85
             C 63 85, 65 84, 65 82
             L 65 78
             Q 68 72, 70 65
             C 72 58, 75 52, 75 42
             C 75 28, 65 20, 50 20 Z"
          fill="url(#glass-gradient-off)" 
          stroke="#aaa" 
          stroke-width="1.5"/>
        
        <!-- Reflexo superior -->
        <ellipse cx="40" cy="32" rx="10" ry="14"
          fill="rgba(255,255,255,0.4)" opacity="0.7"/>
        
        <!-- Reflexo lateral -->
        <ellipse cx="32" cy="48" rx="4" ry="8"
          fill="rgba(255,255,255,0.3)" opacity="0.5"/>
        
        <!-- Filamento realista -->
        <g id="filament" opacity="0.3">
          <path d="M 47 45 L 47 65" stroke="#333" stroke-width="0.8" fill="none"/>
          <path d="M 53 45 L 53 65" stroke="#333" stroke-width="0.8" fill="none"/>
          <path d="M 47 48 Q 50 46 53 48" stroke="#333" stroke-width="1" fill="none"/>
          <path d="M 47 52 Q 50 50 53 52" stroke="#333" stroke-width="1" fill="none"/>
          <path d="M 47 56 Q 50 54 53 56" stroke="#333" stroke-width="1" fill="none"/>
          <path d="M 47 60 Q 50 58 53 60" stroke="#333" stroke-width="1" fill="none"/>
        </g>
        
        <!-- Base roscada (rosca Edison) -->
        <g id="bulb-base">
          <rect x="38" y="85" width="24" height="4" rx="1" fill="url(#base-gradient)"/>
          <rect x="36" y="89" width="28" height="2.5" rx="0.5" fill="#666"/>
          <rect x="38" y="91.5" width="24" height="2.5" rx="0.5" fill="#555"/>
          <rect x="36" y="94" width="28" height="2.5" rx="0.5" fill="#666"/>
          <rect x="38" y="96.5" width="24" height="2.5" rx="0.5" fill="#555"/>
          <rect x="36" y="99" width="28" height="2.5" rx="0.5" fill="#666"/>
          <circle cx="50" cy="102.5" r="15" fill="#444"/>
          <circle cx="50" cy="103" r="13" fill="#333"/>
        </g>
      </g>

      <!-- Corda (desenhada dinamicamente) -->
      <path id="rope-path"
        fill="none" stroke="#8B7355" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Puxador de madeira -->
      <g id="pull-handle-group">
        <ellipse id="pull-handle" cx="50" cy="145" rx="6" ry="5" 
          fill="#8B6F47" stroke="#654321" stroke-width="1"/>
        <ellipse cx="50" cy="144" rx="5" ry="3.5" 
          fill="#A0826D" opacity="0.6"/>
        <line x1="50" y1="142" x2="50" y2="148" 
          stroke="#654321" stroke-width="0.5" opacity="0.3"/>
      </g>
    `;

    this.toggleBtn.appendChild(svg);

    this.ropePath = svg.querySelector('#rope-path');
    this.pullHandle = svg.querySelector('#pull-handle');
    this.pullHandleGroup = svg.querySelector('#pull-handle-group');
    this.bulbGlass = svg.querySelector('#bulb-glass');
    this.bulbGlow = svg.querySelector('#bulb-glow');
    this.filament = svg.querySelector('#filament');
    this.bulbGroup = svg.querySelector('#bulb-group');
  },

  // --------------------------------------------
  // CONFIGURAR FÍSICA DA CORDA 
  // --------------------------------------------
  setupRopePhysics() {
    const segmentCount = 12;
    const segmentLength = 40 / segmentCount;
    
    this.rope = {
      points: [],
      isDragging: false,
      dragPoint: null,
      constraints: [],
      gravity: 0.4,
      friction: 0.98,
      stiffness: 0.8,
      damping: 0.95
    };

    const startY = 105;
    for (let i = 0; i <= segmentCount; i++) {
      this.rope.points.push({
        x: 50,
        y: startY + (i * segmentLength),
        px: 50,
        py: startY + (i * segmentLength),
        vx: 0,
        vy: 0,
        pinned: i === 0,
        mass: 1
      });
    }

    for (let i = 0; i < segmentCount; i++) {
      this.rope.constraints.push({
        p1: i,
        p2: i + 1,
        length: segmentLength
      });
    }

    this.lastPoint = this.rope.points[this.rope.points.length - 1];
    
    this.pullTracking = {
      startY: 0,
      maxY: 0,
      startTime: 0,
      isPulling: false
    };
    this.ropeRestY = this.lastPoint.y;
  },

  // --------------------------------------------
  // EVENTOS DE INTERAÇÃO 
  // --------------------------------------------
  setupListeners() {
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const onStart = (e) => {
      const rect = this.toggleBtn.getBoundingClientRect();
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
      
      const svgX = ((clientX - rect.left) / rect.width) * 100;
      const svgY = ((clientY - rect.top) / rect.height) * 200;

      if (svgY <= 105) {
        console.log('❌ Clique na lâmpada ignorado. Clique na cordinha!');
        return; 
      }

      const lastPoint = this.lastPoint;
      dragOffsetX = svgX - lastPoint.x;
      dragOffsetY = svgY - lastPoint.y;

      const distanceToHandle = Math.sqrt(
        Math.pow(svgX - lastPoint.x, 2) + 
        Math.pow(svgY - lastPoint.y, 2)
      );

      let nearRope = distanceToHandle < 35;
      
      if (!nearRope) {
        for (let i = 1; i < this.rope.points.length; i++) {
          const p = this.rope.points[i];
          const dist = Math.sqrt(
            Math.pow(svgX - p.x, 2) + 
            Math.pow(svgY - p.y, 2)
          );
          if (dist < 20) { 
            nearRope = true;
            dragOffsetX = 0;
            dragOffsetY = 0;
            console.log('✅ Clique detectado na corda');
            break;
          }
        }
      } else {
        console.log('✅ Clique detectado no puxador');
      }

      if (!nearRope) {
        console.log('❌ Clique fora da cordinha');
        return;
      }

      isDragging = true;
      this.rope.isDragging = true;
      this.toggleBtn.style.cursor = 'grabbing';
      document.body.style.cursor = 'grabbing';
      
      this.pullTracking.startY = lastPoint.y;
      this.pullTracking.maxY = lastPoint.y;
      this.pullTracking.startTime = Date.now();
      this.pullTracking.isPulling = true;
      
      console.log('🎯 Drag iniciado na cordinha');
      
      e.preventDefault();
      e.stopPropagation();
    };

    const onMove = (e) => {
      if (!isDragging) return;

      const rect = this.toggleBtn.getBoundingClientRect();
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
      
      const svgX = ((clientX - rect.left) / rect.width) * 100;
      const svgY = ((clientY - rect.top) / rect.height) * 200;

      const point = this.lastPoint;
      point.px = point.x;
      point.py = point.y;
      point.x = svgX - dragOffsetX;
      point.y = Math.max(105, Math.min(svgY - dragOffsetY, 200));

      if (this.pullTracking.isPulling && point.y > this.pullTracking.maxY) {
        this.pullTracking.maxY = point.y;
        console.log('📊 Puxando... Y:', point.y.toFixed(1));
      }

      e.preventDefault();
      e.stopPropagation();
    };

    const onEnd = (e) => {
      if (!isDragging) return;
      
      isDragging = false;
      this.rope.isDragging = false;
      this.toggleBtn.style.cursor = 'grab';
      document.body.style.cursor = '';

      if (this.pullTracking.isPulling) {
        const pullDistance = this.pullTracking.maxY - this.pullTracking.startY;
        const pullTime = Date.now() - this.pullTracking.startTime;
        const pullSpeed = pullDistance / pullTime;
        
        const didPullHard = pullDistance > 10 ||  
                           pullSpeed > 0.05 ||    
                           this.pullTracking.maxY > 155; 
        
        console.log('🎯 Pull stats:', {
          distance: pullDistance.toFixed(2) + 'px',
          speed: pullSpeed.toFixed(4),
          maxY: this.pullTracking.maxY.toFixed(2),
          willToggle: didPullHard ? '✅ SIM' : '❌ NÃO'
        });
        
        if (didPullHard) {
          console.log('💡 ALTERNANDO TEMA!');
          this.toggle();
        }
        
        this.pullTracking.isPulling = false;
        this.pullTracking.startY = 0;
        this.pullTracking.maxY = 0;
      }

      e.preventDefault();
      e.stopPropagation();
    };

    this.toggleBtn.addEventListener('mousedown', onStart);
    this.toggleBtn.addEventListener('touchstart', onStart, { passive: false });
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);

    this.toggleBtn.addEventListener('selectstart', (e) => e.preventDefault());
    
    this.toggleBtn.addEventListener('mousemove', (e) => {
      if (isDragging) return;
      
      const rect = this.toggleBtn.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * 100;
      const svgY = ((e.clientY - rect.top) / rect.height) * 200;

      if (svgY <= 105) {
        this.toggleBtn.style.cursor = 'default';
        return;
      }

      let nearRope = false;
      
      const lastPoint = this.lastPoint;
      const distToHandle = Math.sqrt(
        Math.pow(svgX - lastPoint.x, 2) + 
        Math.pow(svgY - lastPoint.y, 2)
      );
      
      if (distToHandle < 35) {
        nearRope = true;
      } else {
        for (let i = 1; i < this.rope.points.length; i++) {
          const p = this.rope.points[i];
          const dist = Math.sqrt(
            Math.pow(svgX - p.x, 2) + 
            Math.pow(svgY - p.y, 2)
          );
          if (dist < 20) {
            nearRope = true;
            break;
          }
        }
      }
      
      this.toggleBtn.style.cursor = nearRope ? 'grab' : 'default';
    });
  },

  // --------------------------------------------
  // LOOP DE FÍSICA
  // --------------------------------------------
  startPhysicsLoop() {
    const simulate = () => {
      this.updateRopePhysics();
      this.renderRope();
      requestAnimationFrame(simulate);
    };
    simulate();
  },

  updateRopePhysics() {
    const rope = this.rope;
    const points = rope.points;

    points.forEach((point, i) => {
      if (point.pinned || (rope.isDragging && i === points.length - 1)) return;

      const vx = (point.x - point.px) * rope.friction;
      const vy = (point.y - point.py) * rope.friction;

      point.px = point.x;
      point.py = point.y;

      point.x += vx;
      point.y += vy + rope.gravity;

      const distanceFromTop = i / points.length;
      const maxHorizontalOffset = 15 + (distanceFromTop * 20);
      
      const minX = 50 - maxHorizontalOffset;
      const maxX = 50 + maxHorizontalOffset;
      
      point.x = Math.max(minX, Math.min(point.x, maxX));
      point.y = Math.max(105, Math.min(point.y, 180));
    });

    for (let iter = 0; iter < 5; iter++) {
      rope.constraints.forEach(constraint => {
        const p1 = points[constraint.p1];
        const p2 = points[constraint.p2];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const difference = constraint.length - distance;
        const percent = (difference / distance) * rope.stiffness;

        const offsetX = dx * percent * 0.5;
        const offsetY = dy * percent * 0.5;

        if (!p1.pinned) {
          p1.x -= offsetX;
          p1.y -= offsetY;
        }
        if (!p2.pinned && !(rope.isDragging && constraint.p2 === points.length - 1)) {
          p2.x += offsetX;
          p2.y += offsetY;
        }
      });
    }

    points.forEach((point, i) => {
      if (point.pinned) return;
      
      const distanceFromTop = i / points.length;
      const maxHorizontalOffset = 15 + (distanceFromTop * 20);
      
      const minX = 50 - maxHorizontalOffset;
      const maxX = 50 + maxHorizontalOffset;
      
      point.x = Math.max(minX, Math.min(point.x, maxX));
    });
  },

  renderRope() {
    const points = this.rope.points;
    
    let pathData = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      const prevP = points[i - 1];
      const cpX = (prevP.x + p.x) / 2;
      const cpY = (prevP.y + p.y) / 2;
      pathData += ` Q ${prevP.x} ${prevP.y} ${cpX} ${cpY}`;
    }
    
    const lastP = points[points.length - 1];
    pathData += ` L ${lastP.x} ${lastP.y}`;
    
    this.ropePath.setAttribute('d', pathData);

    this.pullHandle.setAttribute('cx', lastP.x);
    this.pullHandle.setAttribute('cy', lastP.y);
    this.pullHandleGroup.setAttribute('transform', `translate(${lastP.x - 50}, ${lastP.y - 145})`);

    const topPoints = points.slice(0, 4);
    const avgAngle = topPoints.reduce((sum, p, i) => {
      if (i === 0) return 0;
      const dx = p.x - topPoints[i - 1].x;
      return sum + dx;
    }, 0) / 3;

    this.bulbGroup.style.transform = `rotate(${avgAngle * 0.3}deg)`;
    this.bulbGroup.style.transformOrigin = '50px 105px';
  },

  // 🔊 AQUI É ONDE O SOM TOCA!
  toggle() {
    const current = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = current === 'light' ? 'dark' : 'light';

    this.apply(newTheme);
    localStorage.setItem('theme', newTheme);

    // 🔊 Tocar som quando puxa a corda
    SoundSystem.toggle();

    this.bulbGroup.style.animation = 'bulb-shake 0.3s ease';
    setTimeout(() => {
      this.bulbGroup.style.animation = '';
    }, 300);
  },

  apply(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      this.lightOn();
    } else {
      document.body.classList.remove('light-theme');
      this.lightOff();
    }
  },

  lightOn() {
    this.bulbGlass.style.fill = 'url(#glass-gradient-on)';
    this.bulbGlass.style.filter = 'drop-shadow(0 0 20px rgba(255, 220, 100, 0.8))';
    this.bulbGlow.style.fill = 'rgba(255, 240, 150, 0.3)';
    this.bulbGlow.style.opacity = '1';
    this.bulbGlow.style.filter = 'url(#glow)';
    this.filament.style.opacity = '1';
    this.filament.querySelectorAll('path').forEach(path => {
      path.style.stroke = '#ff6b00';
      path.style.filter = 'drop-shadow(0 0 3px #ff6b00)';
    });
  },

  lightOff() {
    this.bulbGlass.style.fill = 'url(#glass-gradient-off)';
    this.bulbGlass.style.filter = 'none';
    this.bulbGlow.style.opacity = '0';
    this.bulbGlow.style.filter = 'none';
    this.filament.style.opacity = '0.3';
    this.filament.querySelectorAll('path').forEach(path => {
      path.style.stroke = '#333';
      path.style.filter = 'none';
    });
  },

  applyInitialTheme() {
    const saved = localStorage.getItem('theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.apply(saved || system);
  }
};

// =========================
// SISTEMA DE ÁUDIO (LAMPINHA)
// =========================
const SoundSystem = {
  audio: null,
  isPlaying: false,

  init() {
    this.audio = new Audio('assets/sound/aud2.mpeg');
    this.audio.volume = 0.3;
    
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Erro ao carregar áudio:', e);
    });
  },

  toggle() {
    if (!this.audio) {
      console.warn('Áudio não inicializado.');
      return;
    }

    if (this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
    } else {
      this.audio.play().catch((err) => {
        console.error('Erro ao tocar áudio:', err);
      });
    }

    this.isPlaying = !this.isPlaying;
  }
};

// =========================
// INICIALIZAÇÃO ÚNICA
// =========================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    SoundSystem.init();
    LightBulbToggle.init();
  });
} else {
  SoundSystem.init();
  LightBulbToggle.init();
}