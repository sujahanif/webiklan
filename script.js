/* =============================================
   1. NAVBAR SCROLL BEHAVIOR
============================================= */
(function() {
  const navbar = document.getElementById('navbar');
  const backTop = document.getElementById('back-top');

  function onScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
      backTop.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      backTop.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  backTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* =============================================
   2. DARK / LIGHT MODE TOGGLE
============================================= */
(function() {
  const toggle = document.getElementById('themeToggle');
  const html = document.documentElement;
 const savedTheme = localStorage.getItem('macsus-theme') || 'light';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    toggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    localStorage.setItem('macsus-theme', theme);
  }

  applyTheme(savedTheme);

  toggle.addEventListener('click', function() {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();

/* =============================================
   3. MOBILE MENU
============================================= */
(function() {
  const toggle = document.getElementById('mobileMenuToggle');
  const mobileNav = document.getElementById('mobileNav');
  let open = false;

  toggle.addEventListener('click', function() {
    open = !open;
    mobileNav.style.display = open ? 'flex' : 'none';
    toggle.setAttribute('aria-expanded', String(open));
  });

  mobileNav.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      open = false;
      mobileNav.style.display = 'none';
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* =============================================
   4. SCROLL ANIMATION (IntersectionObserver)
============================================= */
(function() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, index) {
      if (entry.isIntersecting) {
        // stagger delay based on sibling index within same parent
        const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
        let delay = 0;
        siblings.forEach(function(sib, i) {
          if (sib === entry.target) delay = i * 80;
        });
        setTimeout(function() {
          entry.target.classList.add('in-view');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(function(el) { observer.observe(el); });
})();

/* =============================================
   5. COUNTER ANIMATION
============================================= */
(function() {
  function animateCounter(el, target) {
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      const suffix = target === 98 ? '%' : (target === 2000 ? '+' : '');
      el.textContent = current.toLocaleString('id-ID') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counters = [
    { id: 'counter-1', target: 2000 },
    { id: 'counter-2', target: 98 },
    { id: 'counter-3', target: 6 }
  ];

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        counters.forEach(function(c) {
          const el = document.getElementById(c.id);
          if (el) animateCounter(el, c.target);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsPanel = document.querySelector('.stats-panel');
  if (statsPanel) observer.observe(statsPanel);
})();

/* =============================================
   6. THREE.JS — INTERACTIVE 3D LAPTOP MODEL
============================================= */
(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0.8, 4.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Color palette
  function getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
      base: isDark ? 0x1C2333 : 0xE2E8F0,
      baseBorder: isDark ? 0x3182CE : 0x2B6CB0,
      screen: isDark ? 0x0D1117 : 0x1A202C,
      screenGlow: isDark ? 0x3182CE : 0x2B6CB0,
      wireframe: isDark ? 0x3182CE : 0x2B6CB0,
      emissive: isDark ? 0x1a3a5c : 0x0D2040,
      keyboard: isDark ? 0x21262D : 0xCBD5E1,
      keyText: isDark ? 0x4299E1 : 0x2B6CB0,
    };
  }

  let c = getColors();
  const group = new THREE.Group();
  scene.add(group);

  // Materials
  const baseMat = new THREE.MeshPhongMaterial({
    color: c.base,
    emissive: 0x111827,
    shininess: 60,
  });
  const lidMat = new THREE.MeshPhongMaterial({
    color: c.base,
    emissive: 0x111827,
    shininess: 60,
  });
  const screenMat = new THREE.MeshPhongMaterial({
    color: c.screen,
    emissive: c.emissive,
    emissiveIntensity: 0.6,
    shininess: 100,
  });
  const edgeMat = new THREE.MeshPhongMaterial({
    color: c.wireframe,
    emissive: c.wireframe,
    emissiveIntensity: 0.4,
  });
  const keyMat = new THREE.MeshPhongMaterial({
    color: c.keyboard,
    shininess: 40,
  });

  // === LAPTOP BASE ===
  const baseGeo = new THREE.BoxGeometry(3.2, 0.14, 2.2);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(0, 0, 0);
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Base edge highlight
  const edgesBase = new THREE.EdgesGeometry(baseGeo);
  const baseEdge = new THREE.LineSegments(edgesBase, new THREE.LineBasicMaterial({ color: c.wireframe, transparent: true, opacity: 0.5 }));
  base.add(baseEdge);

  // === KEYBOARD KEYS (simplified grid) ===
  const keyGeo = new THREE.BoxGeometry(0.22, 0.03, 0.22);
  const keyRows = [
    { z: -0.7, count: 10 },
    { z: -0.38, count: 9 },
    { z: -0.06, count: 9 },
    { z: 0.26, count: 8 },
  ];

  keyRows.forEach(function(row) {
    const startX = -(row.count - 1) * 0.265 / 2;
    for (let i = 0; i < row.count; i++) {
      const key = new THREE.Mesh(keyGeo, keyMat);
      key.position.set(startX + i * 0.265, 0.09, row.z);
      group.add(key);
    }
  });

  // Spacebar
  const spaceGeo = new THREE.BoxGeometry(1.1, 0.03, 0.22);
  const space = new THREE.Mesh(spaceGeo, keyMat);
  space.position.set(0, 0.09, 0.58);
  group.add(space);

  // Touchpad
  const touchpadGeo = new THREE.BoxGeometry(0.9, 0.01, 0.58);
  const touchpadMat = new THREE.MeshPhongMaterial({ color: c.keyboard, shininess: 80 });
  const touchpad = new THREE.Mesh(touchpadGeo, touchpadMat);
  touchpad.position.set(0, 0.075, 0.82);
  group.add(touchpad);

  // === LID / SCREEN ASSEMBLY ===
  const lid = new THREE.Group();
  lid.position.set(0, 0.07, -1.1);
  group.add(lid);

  // Lid outer
  const lidGeo = new THREE.BoxGeometry(3.2, 0.1, 2.15);
  const lidMesh = new THREE.Mesh(lidGeo, lidMat);
  lid.add(lidMesh);

  const edgesLid = new THREE.EdgesGeometry(lidGeo);
  const lidEdge = new THREE.LineSegments(edgesLid, new THREE.LineBasicMaterial({ color: c.wireframe, transparent: true, opacity: 0.4 }));
  lidMesh.add(lidEdge);

  // Screen bezel inside
  const bezelGeo = new THREE.BoxGeometry(2.95, 0.11, 1.9);
  const bezelMat = new THREE.MeshPhongMaterial({ color: 0x090d15, shininess: 40 });
  const bezel = new THREE.Mesh(bezelGeo, bezelMat);
  bezel.position.set(0, 0.05, 0.05);
  lid.add(bezel);

  // Screen display
  const screenGeo = new THREE.BoxGeometry(2.65, 0.06, 1.62);
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.09, 0.05);
  lid.add(screen);

  // Screen scanlines effect (thin lines on screen)
  const lineCount = 12;
  for (let i = 0; i < lineCount; i++) {
    const lineGeo = new THREE.BoxGeometry(2.5, 0.005, 0.015);
    const lineMat = new THREE.MeshBasicMaterial({
      color: c.wireframe,
      transparent: true,
      opacity: 0.12
    });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.set(0, 0.13, -0.75 + i * 0.135);
    lid.add(line);
  }

  // Screen glow elements (pseudo UI)
  // Top bar
  const topBarGeo = new THREE.BoxGeometry(2.5, 0.015, 0.14);
  const topBar = new THREE.Mesh(topBarGeo, new THREE.MeshBasicMaterial({ color: c.wireframe, transparent: true, opacity: 0.35 }));
  topBar.position.set(0, 0.13, -0.68);
  lid.add(topBar);

  // Content blocks on screen
  const contentPositions = [
    { x: -0.9, z: -0.3, w: 0.6, h: 0.36 },
    { x: 0.1, z: -0.3, w: 0.8, h: 0.22 },
    { x: 0.1, z: 0.05, w: 0.8, h: 0.14 },
    { x: -0.9, z: 0.1, w: 0.6, h: 0.18 },
    { x: -0.1, z: 0.4, w: 1.6, h: 0.1 },
  ];

  contentPositions.forEach(function(pos) {
    const cGeo = new THREE.BoxGeometry(pos.w, 0.015, pos.h);
    const cMat = new THREE.MeshBasicMaterial({ color: c.wireframe, transparent: true, opacity: 0.2 });
    const cMesh = new THREE.Mesh(cGeo, cMat);
    cMesh.position.set(pos.x, 0.13, pos.z);
    lid.add(cMesh);
  });

  // Open lid at an angle
  lid.rotation.x = -Math.PI * 0.62;

  // === HINGE DETAIL ===
  const hingeGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.0, 16);
  const hingeMat = new THREE.MeshPhongMaterial({ color: c.wireframe, emissive: c.wireframe, emissiveIntensity: 0.2 });
  const hinge = new THREE.Mesh(hingeGeo, hingeMat);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.07, -1.1);
  group.add(hinge);

  // === LIGHTS ===
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x7ab7ff, 1.2);
  keyLight.position.set(3, 5, 3);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x3182CE, 0.6);
  fillLight.position.set(-3, 2, -2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(0, -2, -4);
  scene.add(rimLight);

  // Screen point light (glow effect)
  const screenLight = new THREE.PointLight(0x3182CE, 1.0, 4);
  screenLight.position.set(0, 1.2, -1.5);
  scene.add(screenLight);

  // === PARTICLE SYSTEM (floating tech dots) ===
  const particleCount = 60;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    velocities.push({
      x: (Math.random() - 0.5) * 0.004,
      y: (Math.random() - 0.5) * 0.004,
      z: (Math.random() - 0.5) * 0.004
    });
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x3182CE,
    size: 0.035,
    transparent: true,
    opacity: 0.6
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // === MOUSE INTERACTION ===
  let mouseX = 0, mouseY = 0;
  let targetRotX = 0, targetRotY = 0;
  let isDragging = false;
  let lastMouse = { x: 0, y: 0 };
  let autoRotate = true;

  canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    autoRotate = false;
    lastMouse = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('mousemove', function(e) {
    if (isDragging) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      targetRotY += dx * 0.008;
      targetRotX += dy * 0.005;
      targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX));
      lastMouse = { x: e.clientX, y: e.clientY };
    } else {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.3;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.2;
    }
  });

  canvas.addEventListener('mouseup', function() { isDragging = false; });
  canvas.addEventListener('mouseleave', function() { isDragging = false; });

  // Touch support
  let lastTouch = null;
  canvas.addEventListener('touchstart', function(e) {
    autoRotate = false;
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  canvas.addEventListener('touchmove', function(e) {
    if (!lastTouch) return;
    const dx = e.touches[0].clientX - lastTouch.x;
    const dy = e.touches[0].clientY - lastTouch.y;
    targetRotY += dx * 0.008;
    targetRotX += dy * 0.005;
    targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX));
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  canvas.addEventListener('touchend', function() { lastTouch = null; });

  // Scroll to zoom
  canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    camera.position.z = Math.max(2.5, Math.min(7, camera.position.z + e.deltaY * 0.005));
  }, { passive: false });

  // === RESIZE ===
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  // === ANIMATION LOOP ===
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Auto-rotate when not interacting
    if (autoRotate) {
      targetRotY += 0.003;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.03;
      group.rotation.x += (Math.sin(time * 0.3) * 0.08 - group.rotation.x) * 0.03;
    } else {
      group.rotation.y += (targetRotY - group.rotation.y) * 0.08;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.08;
    }

    // Mouse parallax (when not dragging)
    if (!isDragging) {
      group.rotation.y += (mouseX - group.rotation.y * 0.1) * 0.01;
    }

    // Subtle float
    group.position.y = Math.sin(time * 0.7) * 0.06;

    // Screen glow pulse
    screenLight.intensity = 0.8 + Math.sin(time * 1.5) * 0.25;
    screenMat.emissiveIntensity = 0.5 + Math.sin(time * 1.5) * 0.15;

    // Particle animation
    const pos = particles.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      pos.array[i * 3] += velocities[i].x;
      pos.array[i * 3 + 1] += velocities[i].y;
      pos.array[i * 3 + 2] += velocities[i].z;

      if (Math.abs(pos.array[i * 3]) > 4) velocities[i].x *= -1;
      if (Math.abs(pos.array[i * 3 + 1]) > 3) velocities[i].y *= -1;
      if (Math.abs(pos.array[i * 3 + 2]) > 3) velocities[i].z *= -1;
    }
    pos.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  // Update colors when theme changes
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      setTimeout(function() {
        c = getColors();
        baseMat.color.setHex(c.base);
        lidMat.color.setHex(c.base);
        screenMat.color.setHex(c.screen);
        screenMat.emissive.setHex(c.emissive);
        edgeMat.color.setHex(c.wireframe);
        keyMat.color.setHex(c.keyboard);
        particleMat.color.setHex(c.wireframe);
      }, 50);
    });
  }
})();

/* =============================================
   7. SMOOTH INTERNAL LINK SCROLL
============================================= */
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = document.getElementById('navbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
});

/* =============================================
   8. SERVICE TAGS INTERACTION (DYNAMIC TABS & IMAGES)
============================================= */
(function() {
  // 1. Mencari tombol, kotak teks, dan kotak gambar
  const serviceTags = document.querySelectorAll('.service-tags .service-tag');
  const explContents = document.querySelectorAll('.expl-content');
  const visualContents = document.querySelectorAll('.visual-content'); // Ini yang baru!

  serviceTags.forEach(function(tag) {
    tag.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target'); // contoh: "penjelasan-thermal"

      if (targetId) {
        // 2. Matikan efek menyala pada tombol
        serviceTags.forEach(function(t) { t.classList.remove('highlight'); });
        
        // 3. Sembunyikan semua teks
        explContents.forEach(function(content) { content.classList.remove('active'); });

        // 4. Sembunyikan semua gambar
        visualContents.forEach(function(visual) { visual.classList.remove('active'); });

        // 5. Nyalakan tombol yang diklik
        this.classList.add('highlight');

        // 6. Munculkan teks yang sesuai
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.classList.add('active');
        }

        // 7. Munculkan gambar yang sesuai (Ubah "penjelasan-..." jadi "visual-...")
        const visualId = targetId.replace('penjelasan-', 'visual-'); // contoh: "visual-thermal"
        const targetVisual = document.getElementById(visualId);
        if (targetVisual) {
          targetVisual.classList.add('active');
        }
      }
    });
  });
})();

/* =============================================
   9. IMAGE COMPARISON SLIDER LOGIC
============================================= */
(function() {
  // Mencari semua area slider di dalam website
  const sliders = document.querySelectorAll('.comparison-slider');

  sliders.forEach(function(container) {
    const sliderInput = container.querySelector('.slider');
    const imgBefore = container.querySelector('.img-before');
    const sliderLine = container.querySelector('.slider-line');

    // Mendengarkan setiap gerakan (input) pada slider
    sliderInput.addEventListener('input', function(e) {
      const pergerakan = e.target.value; // Mendapatkan nilai angka 0-100
      
      // Mengubah lebar gambar 'Before' agar mengikuti angka slider
      imgBefore.style.width = pergerakan + "%";
      // Memindahkan garis putih pembatas agar selalu di tengah slider
      sliderLine.style.left = pergerakan + "%";
    });
  });
})();

/* =============================================
   8. SERVICE TAGS INTERACTION (DYNAMIC TABS)
============================================= */
(function() {
  // 1. Mencari semua tombol tag dan semua isi penjelasan
  const serviceTags = document.querySelectorAll('.service-tags .service-tag');
  const explContents = document.querySelectorAll('.expl-content');

  // 2. Memberikan perintah pada setiap tombol
  serviceTags.forEach(function(tag) {
    tag.addEventListener('click', function() {
      // Mengambil identitas target dari tombol yang diklik
      const targetId = this.getAttribute('data-target');

      // Pastikan tombol yang diklik memiliki target penjelasan
      if (targetId) {
        
        // 3. Matikan efek menyala (highlight) dari semua tombol tag
        serviceTags.forEach(function(t) { 
          t.classList.remove('highlight'); 
        });
        
        // 4. Sembunyikan semua teks penjelasan yang sedang terbuka
        explContents.forEach(function(content) { 
          content.classList.remove('active'); 
        });

        // 5. Nyalakan efek (highlight) khusus pada tombol yang baru saja diklik
        this.classList.add('highlight');

        // 6. Munculkan teks penjelasan yang sesuai dengan ID tombolnya
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.classList.add('active');
        }
      }
    });
  });
})();