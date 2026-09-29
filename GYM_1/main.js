document.addEventListener('DOMContentLoaded', () => {

  // 1. 3D Tilt Effect on Cards
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.querySelector('.card-content').style.transform = `translateZ(30px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.boxShadow = `${-rotateY}px ${rotateX}px 20px rgba(124, 58, 237, 0.2)`;
    });

    card.addEventListener('mouseleave', () => {
      card.querySelector('.card-content').style.transform = `translateZ(30px) rotateX(0) rotateY(0)`;
      card.style.boxShadow = `none`;
    });
  });

  // 2. Navbar Scroll Effect
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // 3. Fitness Calculators (tools.html)
  initCalculators();

  // 4. Three.js Hero Scene
  const canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer && typeof THREE !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initThreeJS(canvasContainer);
  }

  // 5. FAQ Accordion (faq.html)
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // 6. Testimonial 3D Carousel (testimonials.html)
  initCarousel();

  // 7. Gallery Lightbox (gallery.html)
  initGallery();

  // 8. Scroll Reveal
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  }
});

/* ---------------- Calculators ---------------- */
function initCalculators() {
  const bmiForm = document.getElementById('bmi-form');
  if (bmiForm) {
    bmiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const h = parseFloat(document.getElementById('height').value) / 100;
      const w = parseFloat(document.getElementById('weight').value);
      const bmi = (w / (h * h)).toFixed(1);
      let status = "Normal";
      if (bmi < 18.5) status = "Underweight";
      else if (bmi > 25) status = "Overweight";
      document.getElementById('bmi-result').innerHTML = `<h3 class="gradient-text">Your BMI: ${bmi}</h3><p>Status: ${status}</p>`;
    });
  }

  const bmrForm = document.getElementById('bmr-form');
  if (bmrForm) {
    bmrForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const gender = document.getElementById('bmr-gender').value;
      const age = parseFloat(document.getElementById('bmr-age').value);
      const h = parseFloat(document.getElementById('bmr-height').value);
      const w = parseFloat(document.getElementById('bmr-weight').value);
      const activity = parseFloat(document.getElementById('bmr-activity').value);
      let bmr = gender === 'male'
        ? 10 * w + 6.25 * h - 5 * age + 5
        : 10 * w + 6.25 * h - 5 * age - 161;
      const tdee = Math.round(bmr * activity);
      document.getElementById('bmr-result').innerHTML =
        `<h3 class="gradient-text">BMR: ${Math.round(bmr)} kcal</h3><p>Daily Maintenance (TDEE): ${tdee} kcal</p>`;
    });
  }

  const macroForm = document.getElementById('macro-form');
  if (macroForm) {
    macroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const calories = parseFloat(document.getElementById('macro-calories').value);
      const goal = document.getElementById('macro-goal').value;
      let split = { protein: 0.3, carbs: 0.4, fat: 0.3 };
      if (goal === 'cut') split = { protein: 0.4, carbs: 0.3, fat: 0.3 };
      if (goal === 'bulk') split = { protein: 0.3, carbs: 0.5, fat: 0.2 };
      const proteinG = Math.round((calories * split.protein) / 4);
      const carbsG = Math.round((calories * split.carbs) / 4);
      const fatG = Math.round((calories * split.fat) / 9);
      document.getElementById('macro-result').innerHTML = `
        <h3 class="gradient-text">Daily Macro Split</h3>
        <p>Protein: ${proteinG}g &nbsp;|&nbsp; Carbs: ${carbsG}g &nbsp;|&nbsp; Fat: ${fatG}g</p>`;
    });
  }
}

/* ---------------- Testimonial 3D Carousel ---------------- */
function initCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;
  const cards = Array.from(track.children);
  const dotsWrap = document.querySelector('.carousel-nav');
  let current = 0;

  cards.forEach((_, i) => {
    if (dotsWrap) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => { current = i; render(); });
      dotsWrap.appendChild(dot);
    }
  });
  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

  function render() {
    const total = cards.length;
    cards.forEach((card, i) => {
      let offset = i - current;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      const abs = Math.abs(offset);
      const x = offset * 260;
      const z = -abs * 220;
      const rotY = offset * -35;
      card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg)`;
      card.style.opacity = abs > 2 ? '0' : `${1 - abs * 0.3}`;
      card.style.filter = abs === 0 ? 'blur(0)' : `blur(${abs}px)`;
      card.style.zIndex = `${total - abs}`;
      card.style.pointerEvents = abs === 0 ? 'auto' : 'none';
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  document.querySelectorAll('.carousel-arrow.next').forEach(btn =>
    btn.addEventListener('click', () => { current = (current + 1) % cards.length; render(); }));
  document.querySelectorAll('.carousel-arrow.prev').forEach(btn =>
    btn.addEventListener('click', () => { current = (current - 1 + cards.length) % cards.length; render(); }));

  render();
  setInterval(() => { current = (current + 1) % cards.length; render(); }, 6000);
}

/* ---------------- Gallery Lightbox ---------------- */
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.gallery-lightbox');
  if (!items.length || !lightbox) return;
  const content = lightbox.querySelector('.gallery-lightbox-content');

  items.forEach(item => {
    item.addEventListener('click', () => {
      content.innerHTML = item.querySelector('.gallery-media').innerHTML;
      content.style.background = item.querySelector('.gallery-media').style.background;
      lightbox.classList.add('active');
    });
  });

  lightbox.addEventListener('click', () => lightbox.classList.remove('active'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('active'); });
}

/* ---------------- Three.js Hero Scenes ---------------- */
function initThreeJS(container) {
  const sceneType = container.dataset.scene || 'icosahedron';
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xEC4899, 2);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);
  const rimLight = new THREE.PointLight(0x22D3EE, 1.8, 20);
  rimLight.position.set(-5, -2, 4);
  scene.add(rimLight);

  const group = new THREE.Group();
  scene.add(group);

  const builders = {
    icosahedron: buildIcosahedron,
    dumbbell: buildDumbbell,
    kettlebell: buildKettlebell,
    barbell: buildBarbell,
    plates: buildPlates,
    torusknot: buildTorusKnot,
    particles: buildParticleField,
  };
  (builders[sceneType] || buildIcosahedron)(group);

  camera.position.z = 8;
  const sideOffset = window.innerWidth > 900 ? 3 : 0;
  group.position.x = sideOffset;

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  let scrollFactor = 0;
  window.addEventListener('scroll', () => {
    scrollFactor = Math.min(window.scrollY / 800, 1);
  });

  function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.004;
    group.rotation.x += 0.0012;
    group.position.x += (sideOffset - mouseX * 1.2 - group.position.x) * 0.05;
    group.position.y += (mouseY * 0.8 - scrollFactor * 3 - group.position.y) * 0.05;
    camera.position.z = 8 - scrollFactor * 2;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    group.position.x = window.innerWidth > 900 ? 3 : 0;
  });
}

function buildIcosahedron(group) {
  const geometry = new THREE.IcosahedronGeometry(2, 1);
  const material = new THREE.MeshPhysicalMaterial({ color: 0x7C3AED, metalness: 0.9, roughness: 0.1, wireframe: true });
  group.add(new THREE.Mesh(geometry, material));
}

function buildTorusKnot(group) {
  const geometry = new THREE.TorusKnotGeometry(1.4, 0.35, 128, 16);
  const material = new THREE.MeshPhysicalMaterial({ color: 0xEC4899, metalness: 0.8, roughness: 0.2, wireframe: true });
  group.add(new THREE.Mesh(geometry, material));
}

function buildParticleField(group) {
  const count = 600;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x22D3EE, size: 0.05, transparent: true, opacity: 0.8 });
  group.add(new THREE.Points(geometry, material));
}

function metalMaterial(color) {
  return new THREE.MeshPhysicalMaterial({ color, metalness: 0.85, roughness: 0.25, clearcoat: 0.4 });
}

function buildDumbbell(group) {
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 20), metalMaterial(0x94A3B8));
  bar.rotation.z = Math.PI / 2;
  group.add(bar);

  [-1.2, 1.2].forEach((x) => {
    const weight = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.6, 32), metalMaterial(0x7C3AED));
    weight.rotation.z = Math.PI / 2;
    weight.position.x = x;
    group.add(weight);
  });
  group.scale.set(1.1, 1.1, 1.1);
}

function buildBarbell(group) {
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 20), metalMaterial(0xF8FAFC));
  bar.rotation.z = Math.PI / 2;
  group.add(bar);

  [-2.1, -1.75, 1.75, 2.1].forEach((x, i) => {
    const isOuter = i === 0 || i === 3;
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(isOuter ? 0.75 : 0.6, isOuter ? 0.75 : 0.6, 0.2, 32),
      metalMaterial(isOuter ? 0xEC4899 : 0x22D3EE)
    );
    plate.rotation.z = Math.PI / 2;
    plate.position.x = x;
    group.add(plate);
  });
  group.scale.set(0.85, 0.85, 0.85);
}

function buildPlates(group) {
  const colors = [0xF97316, 0xEC4899, 0x7C3AED, 0x22D3EE];
  colors.forEach((color, i) => {
    const plate = new THREE.Mesh(new THREE.TorusGeometry(0.9 - i * 0.08, 0.22, 16, 48), metalMaterial(color));
    plate.position.z = i * 0.35 - 0.5;
    group.add(plate);
  });
}

function buildKettlebell(group) {
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 32), metalMaterial(0x0F172A));
  body.position.y = -0.3;
  group.add(body);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 16, 32, Math.PI), metalMaterial(0x94A3B8));
  handle.position.y = 0.85;
  handle.rotation.x = Math.PI;
  group.add(handle);
}
