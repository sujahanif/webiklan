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
   6. THREE.JS — INTERACTIVE 3D LAPTOP FBX MODEL
============================================= */
(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined' || typeof THREE.FBXLoader === 'undefined') return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.5, 6); // Posisi kamera agak dijauhkan

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);

  const group = new THREE.Group();
  scene.add(group);

  // === PENCAHAYAAN (LIGHTS) ===
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);
  const blueLight = new THREE.PointLight(0x00E5FF, 1, 10);
  blueLight.position.set(-2, 2, 2);
  scene.add(blueLight);

  // === MEMUAT MODEL FBX & TEKSTUR ===
  const textureLoader = new THREE.TextureLoader();
  const fbxLoader = new THREE.FBXLoader();

  // Load tekstur dari folder model
  const baseMap = textureLoader.load('model/Laptop_BaseMap.png');
  const normalMap = textureLoader.load('model/Laptop_Normal.png');

  // Load file FBX
  fbxLoader.load('model/Laptop.fbx', function(object) {
    object.traverse(function(child) {
      if (child.isMesh) {
        // Memasang tekstur ke bodi laptop
        child.material = new THREE.MeshStandardMaterial({
          map: baseMap,
          normalMap: normalMap,
          roughness: 0.4,
          metalness: 0.8
        });
      }
    });

    // PENTING: Atur ukuran (scale) dan posisi. 
    // Jika laptop terlalu besar/kecil, ubah angka 0.05 di bawah ini
    object.scale.set(0.10, 0.10, 0.10); 
    object.position.set(0, 0.5, 0); 
    
    group.add(object);
  }, 
  function(xhr) { console.log((xhr.loaded / xhr.total * 100) + '% model ter-load'); }, 
  function(error) { console.error("Gagal memuat model:", error); });

  // === EFEK PARTIKEL BIRU MENGAMBANG ===
  const particleCount = 60;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    velocities.push({ x: (Math.random() - 0.5) * 0.004, y: (Math.random() - 0.5) * 0.004, z: (Math.random() - 0.5) * 0.004 });
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0x00E5FF, size: 0.035, transparent: true, opacity: 0.6 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // === MOUSE INTERACTION & ANIMASI ===
  let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  let isDragging = false, lastMouse = { x: 0, y: 0 }, autoRotate = true;

  canvas.addEventListener('mousedown', e => { isDragging = true; autoRotate = false; lastMouse = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('mousemove', e => {
    if (isDragging) {
      targetRotY += (e.clientX - lastMouse.x) * 0.008;
      targetRotX += (e.clientY - lastMouse.y) * 0.005;
      targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX));
      lastMouse = { x: e.clientX, y: e.clientY };
    } else {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.3;
    }
  });
  canvas.addEventListener('mouseup', () => isDragging = false);
  canvas.addEventListener('mouseleave', () => isDragging = false);
  canvas.addEventListener('wheel', e => { e.preventDefault(); camera.position.z = Math.max(3, Math.min(10, camera.position.z + e.deltaY * 0.005)); }, { passive: false });

  window.addEventListener('resize', () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  });

  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    if (autoRotate) {
      targetRotY += 0.003;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.03;
      group.rotation.x += (Math.sin(time * 0.3) * 0.08 - group.rotation.x) * 0.03;
    } else {
      group.rotation.y += (targetRotY - group.rotation.y) * 0.08;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.08;
    }
    if (!isDragging) group.rotation.y += (mouseX - group.rotation.y * 0.1) * 0.01;
    group.position.y = Math.sin(time * 0.7) * 0.06;

    // Animasi partikel
    const pos = particles.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      pos.array[i * 3] += velocities[i].x; pos.array[i * 3 + 1] += velocities[i].y; pos.array[i * 3 + 2] += velocities[i].z;
      if (Math.abs(pos.array[i * 3]) > 4) velocities[i].x *= -1;
      if (Math.abs(pos.array[i * 3 + 1]) > 3) velocities[i].y *= -1;
      if (Math.abs(pos.array[i * 3 + 2]) > 3) velocities[i].z *= -1;
    }
    pos.needsUpdate = true;
    renderer.render(scene, camera);
  }
  animate();
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

/* =============================================
   20. MENGAMBIL SEMUA FOTO DARI SUPABASE OTOMATIS
============================================= */
// A. Inisialisasi Supabase (Ganti dengan URL dan Key milikmu)
const supabaseUrl = 'https://fcecobrpwwepyztdvyle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZWNvYnJwd3dlcHl6dGR2eWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjMzMjAsImV4cCI6MjA5MzQzOTMyMH0.YCTIY5dXTL4dWsJl-i02xwVNuZaYATjFBSlXOSh1DO4';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// B. Fungsi pintar untuk memuat semua foto sekaligus
async function loadSemuaFotoDariSupabase() {
  try {
    // 1. Minta Supabase mengirimkan semua daftar nama bagian dan URL gambarnya
    const { data, error } = await supabaseClient
      .from('site_images')
      .select('section_name, image_url');

    if (error) {
      console.warn("Info: Gagal memuat foto dari Supabase, menggunakan foto bawaan.", error.message);
      return; 
    }

    // 2. Jika datanya ada, mari kita proses satu per satu (Looping)
    if (data && data.length > 0) {
      data.forEach(function(item) {
        // item.section_name berisi nama seperti 'layanan-thermal', 'portfolio-1-after'
        // Kita cari elemen di HTML yang ID-nya sama persis dengan nama tersebut
        const elemenGambar = document.getElementById(item.section_name);
        
        // 3. Jika elemennya ketemu di halaman HTML, otomatis ganti URL gambarnya (src)
        if (elemenGambar) {
          elemenGambar.src = item.image_url;
        }
      });
    }
  } catch (err) {
    console.error("Terjadi kesalahan sistem saat memuat gambar:", err);
  }
}

// C. Jalankan fungsi secara otomatis saat website dibuka
document.addEventListener('DOMContentLoaded', loadSemuaFotoDariSupabase);