/**
 * Three.js 3D Engine for Tadiwa "DOC" IT Specialist
 * 1. Global Background 3D Galaxy & Floating Geometry
 * 2. Dedicated Hero 3D Interactive Cyber Workstation & Holographic Software Badges
 */

(function () {
  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') return;

  // =========================================================================
  // 1. GLOBAL BACKGROUND 3D CANVAS (#webgl-canvas)
  // =========================================================================
  const bgCanvas = document.getElementById('webgl-canvas');
  if (bgCanvas) {
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    bgCamera.position.z = 40;

    const bgRenderer = new THREE.WebGLRenderer({
      canvas: bgCanvas,
      alpha: true,
      antialias: true
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Cloud
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x00f2fe);
    const c2 = new THREE.Color(0x8a2be2);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 140;
      positions[i + 1] = (Math.random() - 0.5) * 140;
      positions[i + 2] = (Math.random() - 0.5) * 80;

      const c = Math.random() > 0.5 ? c1 : c2;
      colors[i] = c.r;
      colors[i + 1] = c.g;
      colors[i + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    bgScene.add(particles);

    // Subtle background floaters
    const bgIcoGeo = new THREE.IcosahedronGeometry(12, 1);
    const bgIcoMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.12 });
    const bgIco = new THREE.Mesh(bgIcoGeo, bgIcoMat);
    bgIco.position.set(-25, -10, -20);
    bgScene.add(bgIco);

    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    window.addEventListener('resize', () => {
      bgCamera.aspect = window.innerWidth / window.innerHeight;
      bgCamera.updateProjectionMatrix();
      bgRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    function renderBg() {
      requestAnimationFrame(renderBg);
      particles.rotation.y += 0.0006;
      particles.rotation.x += 0.0003;
      bgIco.rotation.x += 0.002;
      bgIco.rotation.y += 0.003;
      bgScene.position.y = scrollY * 0.01;
      bgRenderer.render(bgScene, bgCamera);
    }
    renderBg();
  }

  // =========================================================================
  // 2. HERO INTERACTIVE 3D STAGE (#hero-3d-viewport)
  // =========================================================================
  const viewport = document.getElementById('hero-3d-viewport');
  if (!viewport) return;

  const stageScene = new THREE.Scene();
  const stageCamera = new THREE.PerspectiveCamera(45, viewport.clientWidth / viewport.clientHeight, 0.1, 100);
  stageCamera.position.set(0, 4, 14);
  stageCamera.lookAt(0, 0, 0);

  const stageRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  stageRenderer.setSize(viewport.clientWidth, viewport.clientHeight);
  stageRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stageRenderer.shadowMap.enabled = true;
  viewport.appendChild(stageRenderer.domElement);

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 1.2);
  stageScene.add(hemiLight);

  const blueLight = new THREE.PointLight(0x00f2fe, 3, 20);
  blueLight.position.set(5, 6, 5);
  stageScene.add(blueLight);

  const purpleLight = new THREE.PointLight(0xa855f7, 2.5, 20);
  purpleLight.position.set(-5, -3, 3);
  stageScene.add(purpleLight);

  // Master Group for 360 rotation
  const workstationGroup = new THREE.Group();
  stageScene.add(workstationGroup);

  // Helper: Create Texture with 2D Canvas
  function createTextTexture(text, subtext, bgColor, textColor, badge = '') {
    const cvs = document.createElement('canvas');
    cvs.width = 512;
    cvs.height = 512;
    const ctx = cvs.getContext('2d');

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 512);

    // Glowing border
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 492, 492);

    // Corner Accents
    ctx.fillStyle = textColor;
    ctx.fillRect(20, 20, 30, 8);
    ctx.fillRect(20, 20, 8, 30);
    ctx.fillRect(462, 20, 30, 8);
    ctx.fillRect(484, 20, 8, 30);

    // Badge
    if (badge) {
      ctx.font = 'bold 130px Outfit, sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badge, 256, 200);
    }

    // Title text
    ctx.font = 'bold 44px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, badge ? 320 : 220);

    // Subtext
    if (subtext) {
      ctx.font = '500 28px Outfit, sans-serif';
      ctx.fillStyle = textColor;
      ctx.fillText(subtext, 256, badge ? 380 : 300);
    }

    const texture = new THREE.CanvasTexture(cvs);
    texture.needsUpdate = true;
    return texture;
  }

  // Animated Screen Texture for Laptop
  const screenCvs = document.createElement('canvas');
  screenCvs.width = 512;
  screenCvs.height = 320;
  const screenCtx = screenCvs.getContext('2d');
  const screenTexture = new THREE.CanvasTexture(screenCvs);

  function updateScreenCanvas(time) {
    screenCtx.fillStyle = '#050914';
    screenCtx.fillRect(0, 0, 512, 320);

    // Header bar
    screenCtx.fillStyle = '#0f172a';
    screenCtx.fillRect(0, 0, 512, 45);
    screenCtx.fillStyle = '#00f2fe';
    screenCtx.font = 'bold 18px monospace';
    screenCtx.fillText('● DOC_TERMINAL_OS // v2.6.4 [ONLINE]', 20, 28);

    // Code & System Status lines
    screenCtx.font = '16px monospace';
    screenCtx.fillStyle = '#38bdf8';
    screenCtx.fillText('> Initializing Genuine Activation Engine...', 25, 80);
    screenCtx.fillStyle = '#4ade80';
    screenCtx.fillText('✔ Windows 11 Digital License: PERMANENT', 25, 115);
    screenCtx.fillText('✔ Microsoft Office 365: ACTIVATED', 25, 150);
    screenCtx.fillStyle = '#a78bfa';
    screenCtx.fillText('✔ Adobe Suite: Photoshop 2024 & Illustrator OK', 25, 185);

    // Animated Pulsing Progress Bar
    const progress = (Math.sin(time * 3) + 1) / 2;
    screenCtx.fillStyle = '#1e293b';
    screenCtx.fillRect(25, 230, 460, 20);
    screenCtx.fillStyle = '#00f2fe';
    screenCtx.fillRect(25, 230, 460 * progress, 20);

    screenCtx.fillStyle = '#ffffff';
    screenCtx.font = '14px monospace';
    screenCtx.fillText(`SYSTEM STABILITY: 100% | ACTIVE CLIENTS CONNECTED`, 25, 280);

    screenTexture.needsUpdate = true;
  }

  // ==========================================
  // BUILD 3D CYBER LAPTOP
  // ==========================================
  const laptopGroup = new THREE.Group();
  laptopGroup.position.set(0, -1.2, 0);
  workstationGroup.add(laptopGroup);

  // Metallic Materials
  const metalBodyMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.3,
    metalness: 0.8
  });

  const glowingBorderMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    wireframe: false
  });

  // Base / Keyboard Deck
  const baseGeo = new THREE.BoxGeometry(5.2, 0.25, 3.6);
  const baseMesh = new THREE.Mesh(baseGeo, metalBodyMat);
  laptopGroup.add(baseMesh);

  // Neon Edge Trim for Base
  const baseEdgeGeo = new THREE.BoxGeometry(5.24, 0.05, 3.64);
  const baseEdgeMesh = new THREE.Mesh(baseEdgeGeo, glowingBorderMat);
  baseEdgeMesh.position.y = 0.12;
  laptopGroup.add(baseEdgeMesh);

  // Keyboard inset
  const kbGeo = new THREE.BoxGeometry(4.4, 0.05, 2.0);
  const kbMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.6 });
  const kbMesh = new THREE.Mesh(kbGeo, kbMat);
  kbMesh.position.set(0, 0.14, 0.4);
  laptopGroup.add(kbMesh);

  // Trackpad
  const trackpadGeo = new THREE.BoxGeometry(1.6, 0.03, 1.0);
  const trackpadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });
  const trackpadMesh = new THREE.Mesh(trackpadGeo, trackpadMat);
  trackpadMesh.position.set(0, 0.14, -1.1);
  laptopGroup.add(trackpadMesh);

  // Screen Lid Group (hinged)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.12, -1.75);
  lidGroup.rotation.x = -Math.PI / 10; // angled backwards
  laptopGroup.add(lidGroup);

  // Screen Frame
  const screenFrameGeo = new THREE.BoxGeometry(5.2, 3.4, 0.15);
  const screenFrameMesh = new THREE.Mesh(screenFrameGeo, metalBodyMat);
  screenFrameMesh.position.set(0, 1.7, 0);
  lidGroup.add(screenFrameMesh);

  // Illuminated Display Surface
  const screenDisplayGeo = new THREE.PlaneGeometry(4.8, 3.0);
  const screenDisplayMat = new THREE.MeshBasicMaterial({ map: screenTexture });
  const screenDisplayMesh = new THREE.Mesh(screenDisplayGeo, screenDisplayMat);
  screenDisplayMesh.position.set(0, 1.7, 0.09);
  lidGroup.add(screenDisplayMesh);

  // Glowing Hologram Disc under Laptop
  const holoRingGeo = new THREE.RingGeometry(3.6, 4.2, 32);
  const holoRingMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
    wireframe: true
  });
  const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
  holoRing.rotation.x = Math.PI / 2;
  holoRing.position.y = -0.15;
  laptopGroup.add(holoRing);

  // ==========================================
  // BUILD 4 INTERACTIVE HOLOGRAPHIC BADGES
  // ==========================================
  const badges = [];

  function createBadge(id, title, desc, texture, posX, posY, posZ, colorHex) {
    const group = new THREE.Group();
    group.position.set(posX, posY, posZ);

    // Outer Crystal Cube (Glass)
    const cubeGeo = new THREE.BoxGeometry(1.6, 1.6, 0.4);
    const cubeMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.1,
      metalness: 0.6,
      transparent: true,
      opacity: 0.95
    });

    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    group.add(cube);

    // Glowing Wireframe Outline
    const wireGeo = new THREE.BoxGeometry(1.68, 1.68, 0.48);
    const wireMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    group.add(wire);

    // Floating Ring
    const ringGeo = new THREE.TorusGeometry(1.2, 0.04, 16, 40);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    group.userData = {
      id: id,
      title: title,
      desc: desc,
      initialY: posY,
      initialAngle: Math.atan2(posZ, posX),
      radius: Math.sqrt(posX * posX + posZ * posZ),
      ring: ring,
      cube: cube,
      color: colorHex
    };

    workstationGroup.add(group);
    badges.push(group);
    return group;
  }

  // 1. Windows Badge
  const winTex = createTextTexture('Windows 11', 'Lifetime Pro', '#03254c', '#00a4ef', '🪟');
  createBadge(
    'windows',
    'Windows 11 / 10 Pro',
    'Permanent Genuine Digital License • No Watermark • Official Updates',
    winTex,
    -4.2, 1.6, 1.8,
    0x00a4ef
  );

  // 2. Microsoft Office Badge
  const offTex = createTextTexture('Office 365', 'Full Suite 2024', '#3d1308', '#eb3c00', '📄');
  createBadge(
    'office',
    'Microsoft Office 365 / 2024',
    'Word, Excel, PowerPoint, Outlook & Access • Lifetime Activation',
    offTex,
    4.2, 1.8, 1.5,
    0xeb3c00
  );

  // 3. Adobe Photoshop Badge
  const psTex = createTextTexture('Photoshop', 'Adobe 2024', '#001e36', '#31a8ff', 'Ps');
  createBadge(
    'photoshop',
    'Adobe Photoshop 2024',
    'Full Version Pre-Activated • Generative AI & Camera Raw Supported',
    psTex,
    -3.8, 3.4, -1.8,
    0x31a8ff
  );

  // 4. Adobe Illustrator Badge
  const aiTex = createTextTexture('Illustrator', 'Adobe 2024', '#331a00', '#ff9a00', 'Ai');
  createBadge(
    'illustrator',
    'Adobe Illustrator 2024',
    'Vector Graphics Pro • Pre-Activated Lifetime Version',
    aiTex,
    3.8, 3.2, -2.0,
    0xff9a00
  );

  // ==========================================
  // INTERACTION: MOUSE DRAG ROTATION (360°)
  // ==========================================
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let targetRotationY = 0;
  let targetRotationX = 0;
  let autoRotate = true;

  viewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  viewport.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.005;

      // Limit pitch
      targetRotationX = Math.max(-0.4, Math.min(0.6, targetRotationX));

      prevMousePos = { x: e.clientX, y: e.clientY };
    }
  });

  // Touch Support for Mobile
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  viewport.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.005;
      targetRotationX = Math.max(-0.4, Math.min(0.6, targetRotationX));

      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  // ==========================================
  // RAYCASTER: CLICK & HOVER ON BADGES
  // ==========================================
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function selectSoftware(id) {
    const badge = badges.find(b => b.userData.id === id);
    if (!badge) return;

    // Update HUD
    const hudTitle = document.getElementById('hudTitle');
    const hudDesc = document.getElementById('hudDesc');
    const hudAction = document.getElementById('hudAction');

    if (hudTitle) hudTitle.textContent = badge.userData.title;
    if (hudDesc) hudDesc.textContent = badge.userData.desc;
    if (hudAction) {
      const encodedMsg = encodeURIComponent(`Hi DOC, I want ${badge.userData.title} service!`);
      hudAction.href = `https://wa.me/263771617226?text=${encodedMsg}`;
    }

    // Update buttons
    const stageButtons = document.querySelectorAll('.stage-btn[data-target]');
    stageButtons.forEach(btn => {
      if (btn.dataset.target === id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Smoothly rotate to face selected badge
    const angle = badge.userData.initialAngle;
    targetRotationY = -angle + 0.3;
    targetRotationX = 0.1;
  }

  // Button clicks on the 3D Stage Switcher
  const stageBtns = document.querySelectorAll('.stage-btn[data-target]');
  stageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectSoftware(btn.dataset.target);
    });
  });

  // Toggle Auto Rotate Button
  const toggleBtn = document.getElementById('toggleAutoRotate');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      autoRotate = !autoRotate;
      toggleBtn.classList.toggle('active', autoRotate);
    });
  }

  // Raycast click
  viewport.addEventListener('click', (e) => {
    const rect = viewport.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, stageCamera);
    const meshes = badges.map(b => b.userData.cube);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const parentGroup = intersects[0].object.parent;
      if (parentGroup && parentGroup.userData.id) {
        selectSoftware(parentGroup.userData.id);
      }
    }
  });

  // Resize handler
  window.addEventListener('resize', () => {
    stageCamera.aspect = viewport.clientWidth / viewport.clientHeight;
    stageCamera.updateProjectionMatrix();
    stageRenderer.setSize(viewport.clientWidth, viewport.clientHeight);
  });

  // ==========================================
  // ANIMATION LOOP
  // ==========================================
  const clock = new THREE.Clock();

  function animateStage() {
    requestAnimationFrame(animateStage);
    const time = clock.getElapsedTime();

    // Update dynamic screen canvas
    updateScreenCanvas(time);

    // Auto rotation if not dragging
    if (autoRotate && !isDragging) {
      targetRotationY += 0.003;
    }

    // Smooth inertia interpolation
    workstationGroup.rotation.y += (targetRotationY - workstationGroup.rotation.y) * 0.08;
    workstationGroup.rotation.x += (targetRotationX - workstationGroup.rotation.x) * 0.08;

    // Animate Badges: float & self-spin
    badges.forEach((b, i) => {
      // Bobbing floating motion
      b.position.y = b.userData.initialY + Math.sin(time * 2 + i * 1.5) * 0.2;
      // Self rotation
      b.rotation.y = Math.sin(time + i) * 0.3;
      b.rotation.x = Math.cos(time * 0.8 + i) * 0.15;
      // Orbiting ring
      b.userData.ring.rotation.z += 0.02;
      b.userData.ring.rotation.x += 0.01;
    });

    // Hologram disc rotation under laptop
    holoRing.rotation.z += 0.01;

    stageRenderer.render(stageScene, stageCamera);
  }

  animateStage();

})();
