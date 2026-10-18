/**
 * HelioStudio — Interactive 3D Solar Scene (Three.js r128) + 2D Technical SVG Fallback
 * Encapsulated component with orbit/zoom controls, camera presets, day/evening lighting,
 * roof cutaway toggle, raycast component selection, and deterministic roof-grid panel placement.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HelioScene3D = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Generate a procedural solar cell texture using an offscreen HTML5 canvas
   */
  function createSolarPanelTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Deep monocrystalline silicon base gradient
    const grad = ctx.createLinearGradient(0, 0, 256, 512);
    grad.addColorStop(0, '#0a192f');
    grad.addColorStop(0.5, '#0f294a');
    grad.addColorStop(1, '#081426');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // Outer aluminum frame border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 246, 502);

    // Cell grid (6 columns x 12 half-cut rows)
    const cols = 6;
    const rows = 12;
    const pad = 12;
    const cellW = (256 - pad * 2) / cols;
    const cellH = (512 - pad * 2) / rows;

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.38)';
    ctx.lineWidth = 1.5;

    for (let c = 1; c < cols; c++) {
      const x = pad + c * cellW;
      ctx.beginPath();
      ctx.moveTo(x, pad);
      ctx.lineTo(x, 512 - pad);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      const y = pad + r * cellH;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(256 - pad, y);
      ctx.stroke();
    }

    // Center half-cut busbar line
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pad, 256);
    ctx.lineTo(256 - pad, 256);
    ctx.stroke();

    // Subtle cell diamond intersections
    ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
    for (let c = 1; c < cols; c++) {
      for (let r = 1; r < rows; r++) {
        const cx = pad + c * cellW;
        const cy = pad + r * cellH;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (typeof THREE !== 'undefined') {
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }
    return null;
  }

  /**
   * Render a crisp, interactive 2D Isometric/Technical SVG diagram when WebGL is unavailable
   * or when the user toggles "2D Technical Schematic" mode (Section 5.5 & 12.1).
   */
  function render2DSchematicSVG(container, configState, onSelectComponent) {
    if (!container) return;
    const visiblePanels = Math.min(configState.visiblePanelCount || 14, 36);
    const totalPanels = configState.selectedPanelCount || visiblePanels;
    const dcKw = configState.actualDcCapacityKw || 8.19;
    const panelName = configState.panelName || '585W Bifacial Module';
    const inverterName = configState.inverterName || '8kW Hybrid Inverter';
    const includeBattery = Boolean(configState.includeBattery);
    const batteryQty = configState.selectedBatteryQuantity || 0;
    const batteryKwh = configState.totalNominalCapacityKwh || 0;
    const isNight = configState.lightingMode === 'evening';
    const orientation = configState.roofOrientation || 'South';

    const cols = 6;
    const rows = Math.ceil(visiblePanels / cols);
    let panelsSvg = '';
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (count >= visiblePanels) break;
        const px = 115 + c * 42;
        const py = 72 + r * 26;
        panelsSvg += `
          <g class="cursor-pointer" data-part="solar_array">
            <rect x="${px}" y="${py}" width="36" height="21" rx="2" fill="#0f294a" stroke="#93c5fd" stroke-width="1.2"/>
            <line x1="${px + 12}" y1="${py}" x2="${px + 12}" y2="${py + 21}" stroke="#60a5fa" stroke-width="0.5" stroke-opacity="0.5"/>
            <line x1="${px + 24}" y1="${py}" x2="${px + 24}" y2="${py + 21}" stroke="#60a5fa" stroke-width="0.5" stroke-opacity="0.5"/>
            <line x1="${px}" y1="${py + 10.5}" x2="${px + 36}" y2="${py + 10.5}" stroke="#cbd5e1" stroke-width="0.6" stroke-opacity="0.6"/>
          </g>`;
        count++;
      }
    }

    let batterySvg = '';
    if (includeBattery && batteryQty > 0) {
      for (let b = 0; b < Math.min(batteryQty, 3); b++) {
        const bx = 435 + b * 46;
        batterySvg += `
          <g class="cursor-pointer" data-part="battery_bank">
            <rect x="${bx}" y="195" width="38" height="58" rx="4" fill="#f8fafc" stroke="#10b981" stroke-width="2"/>
            <rect x="${bx + 6}" y="203" width="26" height="6" rx="2" fill="#10b981"/>
            <text x="${bx + 19}" y="228" font-size="8" font-weight="700" text-anchor="middle" fill="#0f172a">LFP</text>
            <text x="${bx + 19}" y="241" font-size="7" text-anchor="middle" fill="#047857">PACK ${b + 1}</text>
          </g>`;
      }
    } else {
      batterySvg = `
        <g data-part="battery_bank">
          <rect x="435" y="198" width="110" height="52" rx="5" fill="none" stroke="#64748b" stroke-dasharray="4 3" stroke-width="1.5"/>
          <text x="490" y="222" font-size="9" font-weight="600" text-anchor="middle" fill="#94a3b8">No Battery Selected</text>
          <text x="490" y="236" font-size="8" text-anchor="middle" fill="#64748b">(Grid-Tied Mode)</text>
        </g>`;
    }

    const bgFill = isNight ? '#091122' : '#0f172a';
    const roofFill = isNight ? '#1e293b' : '#334155';

    container.innerHTML = `
      <div class="w-full h-full flex flex-col justify-between p-3 select-none" style="background:${bgFill}; color:#f8fafc;">
        <div class="flex items-center justify-between text-xs px-2 py-1 rounded bg-slate-800/80 border border-slate-700">
          <span class="font-semibold text-amber-400">2D Technical Roof & Single-Line Schematic (${orientation} Pitch)</span>
          <span class="text-slate-300">${totalPanels} Panels (${dcKw} kW DC) • ${includeBattery ? batteryKwh + ' kWh Storage' : 'Grid-Tied'}</span>
        </div>
        <svg viewBox="0 0 600 310" class="w-full h-full max-h-[340px] mx-auto">
          <defs>
            <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="${isNight ? '#38bdf8' : '#fbbf24'}" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="580" height="290" rx="10" fill="url(#sunGlow)"/>
          <!-- Sun / Moon -->
          <circle cx="55" cy="52" r="20" fill="${isNight ? '#bae6fd' : '#f59e0b'}" opacity="0.9"/>
          <!-- Pitched Roof Plane -->
          <g class="cursor-pointer" data-part="roof_structure">
            <polygon points="85,55 390,55 415,245 60,245" fill="${roofFill}" stroke="#64748b" stroke-width="2"/>
            <text x="235" y="46" font-size="10" font-weight="600" text-anchor="middle" fill="#cbd5e1">Roof Plane (${orientation} Azimuth • 22° Pitch) — Displaying ${visiblePanels} of ${totalPanels} Modules</text>
          </g>
          <!-- Solar Modules Grid -->
          ${panelsSvg}
          <!-- DC Conduit Line to Inverter -->
          <path d="M 380 140 L 460 140" stroke="#f59e0b" stroke-width="3" stroke-dasharray="5 3" fill="none"/>
          <text x="420" y="132" font-size="8" font-weight="700" text-anchor="middle" fill="#fbbf24">DC STRING</text>
          <!-- Inverter Box -->
          <g class="cursor-pointer" data-part="inverter_unit">
            <rect x="455" y="105" width="95" height="65" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
            <circle cx="470" cy="120" r="4" fill="#10b981"/>
            <text x="502" y="128" font-size="9.5" font-weight="700" text-anchor="middle" fill="#f8fafc">INVERTER</text>
            <text x="502" y="142" font-size="8" text-anchor="middle" fill="#fcd34d">${inverterName.slice(0, 22)}</text>
            <text x="502" y="156" font-size="7.5" text-anchor="middle" fill="#94a3b8">DC/AC Ratio: ${configState.dcAcRatio || '1.02'}</text>
          </g>
          <!-- Conduit from Inverter to Battery -->
          <path d="M 495 170 L 495 195" stroke="${includeBattery ? '#10b981' : '#475569'}" stroke-width="2.5" fill="none"/>
          <!-- Battery Storage Bank -->
          ${batterySvg}
          <!-- Footer Legend -->
          <text x="300" y="285" font-size="9.5" text-anchor="middle" fill="#94a3b8">Click any component (Solar Array, Inverter, Battery Bank, or Roof Structure) to inspect specifications</text>
        </svg>
      </div>
    `;

    container.querySelectorAll('[data-part]').forEach(el => {
      el.addEventListener('click', () => {
        const part = el.getAttribute('data-part');
        if (typeof onSelectComponent === 'function') {
          onSelectComponent(part);
        }
      });
    });
  }

  /**
   * Create and manage the interactive Three.js 3D Solar Configurator Scene
   */
  function createSolarSceneController(containerEl, options = {}) {
    let renderer = null;
    let scene = null;
    let camera = null;
    let animFrameId = null;
    let isDisposed = false;
    let webglSupported = false;
    let force2DMode = false;

    // Scene object groups
    let propertyGroup = null;
    let roofStructureGroup = null;
    let panelsGroup = null;
    let inverterGroup = null;
    let batteryGroup = null;
    let windowMeshes = [];
    let sunLight = null;
    let ambientLight = null;
    let hemiLight = null;
    let sunOrb = null;
    let panelTexture = null;

    // Camera spherical orbit state
    const camState = {
      theta: 0.62,      // horizontal angle (radians)
      phi: 1.02,        // vertical angle from top (radians)
      radius: 21.5,
      target: { x: 0, y: 2.3, z: 0 },
      goalTheta: 0.62,
      goalPhi: 1.02,
      goalRadius: 21.5,
      goalTarget: { x: 0, y: 2.3, z: 0 }
    };

    let currentConfig = {
      visiblePanelCount: 14,
      selectedPanelCount: 14,
      actualDcCapacityKw: 8.19,
      panelName: 'HelioMax 585W Bifacial',
      inverterName: 'VoltStream 8kW Hybrid',
      batteryName: 'CoreVault 5.12 kWh LFP',
      includeBattery: true,
      selectedBatteryQuantity: 1,
      totalNominalCapacityKwh: 5.12,
      dcAcRatio: 1.02,
      projectType: 'home_backup',
      roofOrientation: 'South',
      lightingMode: 'day', // 'day' | 'evening'
      cutawayMode: false
    };

    const onSelectComponent = options.onSelectComponent || function () {};

    function checkWebGLAvailable() {
      if (typeof window === 'undefined' || typeof THREE === 'undefined') return false;
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        return Boolean(gl);
      } catch (e) {
        return false;
      }
    }

    function disposeHierarchy(group) {
      if (!group) return;
      while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        if (child.children && child.children.length > 0) {
          disposeHierarchy(child);
        }
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m && m.dispose && m.dispose());
          } else if (child.material.dispose) {
            child.material.dispose();
          }
        }
      }
    }

    function buildBaseArchitecture() {
      disposeHierarchy(propertyGroup);
      windowMeshes = [];

      const isCommercial = currentConfig.projectType === 'small_business';

      // 1. Ground pad / lawn / stone driveway
      const groundGeo = new THREE.CylinderGeometry(18, 18.5, 0.5, 48);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92, metalness: 0.05 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.y = -0.25;
      ground.receiveShadow = true;
      propertyGroup.add(ground);

      const lawnGeo = new THREE.BoxGeometry(18, 0.12, 14);
      const lawnMat = new THREE.MeshStandardMaterial({ color: 0x2d4a3e, roughness: 0.9 });
      const lawn = new THREE.Mesh(lawnGeo, lawnMat);
      lawn.position.set(0, 0.04, 0);
      lawn.receiveShadow = true;
      propertyGroup.add(lawn);

      // Paved driveway & walkway
      const driveGeo = new THREE.BoxGeometry(4.6, 0.14, 6.5);
      const driveMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
      const drive = new THREE.Mesh(driveGeo, driveMat);
      drive.position.set(3.4, 0.05, 4.2);
      drive.receiveShadow = true;
      propertyGroup.add(drive);

      // 2. Main House / Compact Commercial Building Walls
      const wallColor = isCommercial ? 0xe2e8f0 : 0xf8fafc;
      const accentWallColor = isCommercial ? 0x334155 : 0xcbd5e1;

      const mainWallsGeo = new THREE.BoxGeometry(9.6, 3.8, 7.0);
      const mainWallsMat = new THREE.MeshStandardMaterial({
        color: wallColor,
        roughness: 0.75,
        transparent: currentConfig.cutawayMode,
        opacity: currentConfig.cutawayMode ? 0.55 : 1.0
      });
      const mainWalls = new THREE.Mesh(mainWallsGeo, mainWallsMat);
      mainWalls.position.set(-0.6, 1.9, 0);
      mainWalls.castShadow = true;
      mainWalls.receiveShadow = true;
      mainWalls.userData = { componentKey: 'roof_structure' };
      propertyGroup.add(mainWalls);

      // Side Wing / Garage or Utility Bay (where Inverter & Battery mount on exterior wall)
      const wingGeo = new THREE.BoxGeometry(3.8, 3.1, 5.8);
      const wingMat = new THREE.MeshStandardMaterial({
        color: accentWallColor,
        roughness: 0.78
      });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(4.5, 1.55, 0.3);
      wing.castShadow = true;
      wing.receiveShadow = true;
      propertyGroup.add(wing);

      // Architectural windows (glow warm in Evening mode)
      const winMat = new THREE.MeshStandardMaterial({
        color: currentConfig.lightingMode === 'evening' ? 0xfde68a : 0x38bdf8,
        emissive: currentConfig.lightingMode === 'evening' ? 0xf59e0b : 0x0284c7,
        emissiveIntensity: currentConfig.lightingMode === 'evening' ? 0.85 : 0.15,
        roughness: 0.2,
        metalness: 0.6
      });
      windowMeshes.push(winMat);

      const windowPositions = [
        [-3.2, 2.1, 3.52, 1.6, 1.3],
        [-0.4, 2.1, 3.52, 1.6, 1.3],
        [-3.2, 2.1, -3.52, 1.6, 1.3],
        [0.8, 2.1, -3.52, 1.6, 1.3]
      ];
      windowPositions.forEach(([wx, wy, wz, ww, wh]) => {
        const wGeo = new THREE.BoxGeometry(ww, wh, 0.08);
        const wMesh = new THREE.Mesh(wGeo, winMat);
        wMesh.position.set(wx, wy, wz);
        propertyGroup.add(wMesh);
      });

      // Front door & timber garage door
      const doorGeo = new THREE.BoxGeometry(1.05, 2.2, 0.1);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(1.6, 1.1, 3.52);
      propertyGroup.add(door);

      const garageGeo = new THREE.BoxGeometry(2.8, 2.3, 0.1);
      const garageMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.3 });
      const garage = new THREE.Mesh(garageGeo, garageMat);
      garage.position.set(4.5, 1.15, 3.22);
      propertyGroup.add(garage);

      // Stylized trees for architectural depth
      const treePositions = [
        [-6.8, 0, 3.2, 1.1],
        [-7.2, 0, -2.5, 1.35],
        [7.4, 0, -3.2, 1.15]
      ];
      treePositions.forEach(([tx, ty, tz, scale]) => {
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16 * scale, 0.22 * scale, 1.2 * scale, 8),
          new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 })
        );
        trunk.position.set(tx, 0.6 * scale, tz);
        trunk.castShadow = true;
        propertyGroup.add(trunk);

        const foliage = new THREE.Mesh(
          new THREE.SphereGeometry(0.95 * scale, 14, 12),
          new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 })
        );
        foliage.position.set(tx, 1.8 * scale, tz);
        foliage.castShadow = true;
        propertyGroup.add(foliage);
      });

      // 3. Pitched Roof Planes (Main Roof + Side Wing Flat/Low-Slope Deck)
      roofStructureGroup = new THREE.Group();
      const roofOpacity = currentConfig.cutawayMode ? 0.32 : 1.0;
      const roofMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.65,
        metalness: 0.15,
        transparent: currentConfig.cutawayMode,
        opacity: roofOpacity
      });

      // South-facing pitched roof slope (tilted +22 degrees toward +Z)
      const pitchRad = (22 * Math.PI) / 180;
      const slopeLength = 4.15;
      const roofWidth = 10.2;

      const southSlopeGeo = new THREE.BoxGeometry(roofWidth, 0.18, slopeLength);
      const southSlope = new THREE.Mesh(southSlopeGeo, roofMat);
      southSlope.position.set(-0.6, 4.48, 1.82);
      southSlope.rotation.x = pitchRad;
      southSlope.castShadow = true;
      southSlope.receiveShadow = true;
      southSlope.userData = { componentKey: 'roof_structure' };
      roofStructureGroup.add(southSlope);

      // North-facing pitched roof slope (tilted -22 degrees toward -Z)
      const northSlope = new THREE.Mesh(southSlopeGeo, roofMat);
      northSlope.position.set(-0.6, 4.48, -1.82);
      northSlope.rotation.x = -pitchRad;
      northSlope.castShadow = true;
      northSlope.receiveShadow = true;
      northSlope.userData = { componentKey: 'roof_structure' };
      roofStructureGroup.add(northSlope);

      // Gable triangles under the pitched roof
      const gableShape = new THREE.Shape();
      gableShape.moveTo(-3.5, 0);
      gableShape.lineTo(3.5, 0);
      gableShape.lineTo(0, 1.48);
      gableShape.closePath();
      const gableExtrude = new THREE.ExtrudeGeometry(gableShape, { depth: 9.55, bevelEnabled: false });
      const gableMesh = new THREE.Mesh(gableExtrude, mainWallsMat);
      gableMesh.rotation.y = Math.PI / 2;
      gableMesh.position.set(-5.38, 3.8, 0);
      roofStructureGroup.add(gableMesh);

      // Side Wing Flat Parapet Roof
      const wingRoofGeo = new THREE.BoxGeometry(4.1, 0.2, 6.1);
      const wingRoof = new THREE.Mesh(wingRoofGeo, roofMat);
      wingRoof.position.set(4.5, 3.15, 0.3);
      wingRoof.receiveShadow = true;
      wingRoof.userData = { componentKey: 'roof_structure' };
      roofStructureGroup.add(wingRoof);

      propertyGroup.add(roofStructureGroup);
    }

    /**
     * Rebuild solar panel modules, inverter, and LFP battery storage bank based on config
     */
    function rebuildSolarAndEquipment() {
      if (!scene) return;
      disposeHierarchy(panelsGroup);
      disposeHierarchy(inverterGroup);
      disposeHierarchy(batteryGroup);

      if (!panelTexture) {
        panelTexture = createSolarPanelTexture();
      }

      const pitchRad = (22 * Math.PI) / 180;
      const visibleCount = Math.max(0, Math.min(36, Number(currentConfig.visiblePanelCount) || 14));

      // Materials for solar modules
      const frameMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.3 });
      const cellMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: panelTexture || null,
        metalness: 0.45,
        roughness: 0.18
      });
      const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });

      const modW = 1.02;
      const modH = 0.05;
      const modD = 1.62;
      const gapX = 0.10;
      const gapZ = 0.14;

      // Place up to 18 panels on the primary South slope (2 rows of 9)
      // Place panels 19..30 on the North/Secondary slope, and 31..36 on the side wing roof
      let placed = 0;

      // Helper to place a sloped array
      function placeSlopeArray(maxModules, cols, rowCount, baseCenter, slopeSign) {
        const slopeModules = Math.min(maxModules, visibleCount - placed);
        if (slopeModules <= 0) return;

        // Add mounting rails
        const activeRows = Math.ceil(slopeModules / cols);
        for (let r = 0; r < activeRows; r++) {
          const colsInThisRow = Math.min(cols, slopeModules - r * cols);
          const railWidth = colsInThisRow * (modW + gapX) - gapX + 0.2;
          const localZ = (r - (rowCount - 1) / 2) * (modD + gapZ);
          const worldZ = baseCenter.z + localZ * Math.cos(pitchRad);
          const worldY = baseCenter.y - slopeSign * localZ * Math.sin(pitchRad);

          const railGeo = new THREE.BoxGeometry(railWidth, 0.04, 0.06);
          const railMesh = new THREE.Mesh(railGeo, railMat);
          const xOffset = -((cols - colsInThisRow) * (modW + gapX)) / 2;
          railMesh.position.set(baseCenter.x + xOffset, worldY - 0.03, worldZ);
          railMesh.rotation.x = slopeSign * pitchRad;
          panelsGroup.add(railMesh);
        }

        for (let i = 0; i < slopeModules; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const localX = (c - (cols - 1) / 2) * (modW + gapX);
          const localZ = (r - (rowCount - 1) / 2) * (modD + gapZ);

          const worldX = baseCenter.x + localX;
          const worldZ = baseCenter.z + localZ * Math.cos(pitchRad);
          const worldY = baseCenter.y - slopeSign * localZ * Math.sin(pitchRad);

          const modGroup = new THREE.Group();
          modGroup.position.set(worldX, worldY, worldZ);
          modGroup.rotation.x = slopeSign * pitchRad;

          const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(modW, modH, modD), frameMat);
          frameMesh.castShadow = true;
          frameMesh.receiveShadow = true;
          frameMesh.userData = { componentKey: 'solar_array' };
          modGroup.add(frameMesh);

          const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(modW - 0.05, 0.015, modD - 0.05), cellMat);
          glassMesh.position.y = modH / 2 + 0.005;
          glassMesh.userData = { componentKey: 'solar_array' };
          modGroup.add(glassMesh);

          panelsGroup.add(modGroup);
          placed++;
        }
      }

      // 1. Primary South Slope (up to 16 modules: 2 rows x 8 cols)
      placeSlopeArray(16, 8, 2, { x: -0.6, y: 4.66, z: 1.82 }, +1);

      // 2. Secondary Slope (up to 16 modules: 2 rows x 8 cols)
      if (placed < visibleCount) {
        placeSlopeArray(16, 8, 2, { x: -0.6, y: 4.66, z: -1.82 }, -1);
      }

      // 3. Side Wing Roof Tilt Frames (remaining up to 4 modules)
      if (placed < visibleCount) {
        const extra = visibleCount - placed;
        for (let k = 0; k < Math.min(extra, 4); k++) {
          const r = Math.floor(k / 2);
          const c = k % 2;
          const wx = 3.85 + c * 1.3;
          const wz = -0.8 + r * 1.9;
          const wy = 3.38;

          const modGroup = new THREE.Group();
          modGroup.position.set(wx, wy, wz);
          modGroup.rotation.x = (15 * Math.PI) / 180;

          const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(modW, modH, modD), frameMat);
          frameMesh.castShadow = true;
          frameMesh.userData = { componentKey: 'solar_array' };
          modGroup.add(frameMesh);

          const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(modW - 0.05, 0.015, modD - 0.05), cellMat);
          glassMesh.position.y = modH / 2 + 0.005;
          glassMesh.userData = { componentKey: 'solar_array' };
          modGroup.add(glassMesh);

          panelsGroup.add(modGroup);
          placed++;
        }
      }

      // 4. Exterior Wall Inverter + BOS Protection Box (Mounted on Right Side Wall x = 6.45)
      const invWallX = 6.42;
      const isHybrid = currentConfig.includeBattery || String(currentConfig.inverterName).toLowerCase().includes('hybrid');

      // Inverter Chassis
      const invChassisGeo = new THREE.BoxGeometry(0.28, 0.85, 0.62);
      const invChassisMat = new THREE.MeshStandardMaterial({
        color: isHybrid ? 0xf8fafc : 0xe2e8f0,
        metalness: 0.35,
        roughness: 0.3
      });
      const invChassis = new THREE.Mesh(invChassisGeo, invChassisMat);
      invChassis.position.set(invWallX, 1.85, 1.35);
      invChassis.castShadow = true;
      invChassis.userData = { componentKey: 'inverter_unit' };
      inverterGroup.add(invChassis);

      // Inverter Top Accent / Display Bar
      const invAccentGeo = new THREE.BoxGeometry(0.30, 0.16, 0.56);
      const invAccentMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: isHybrid ? 0xf59e0b : 0x38bdf8,
        emissiveIntensity: 0.45
      });
      const invAccent = new THREE.Mesh(invAccentGeo, invAccentMat);
      invAccent.position.set(invWallX + 0.01, 2.02, 1.35);
      invAccent.userData = { componentKey: 'inverter_unit' };
      inverterGroup.add(invAccent);

      // DC/AC BOS Protection Box next to inverter
      const bosGeo = new THREE.BoxGeometry(0.20, 0.48, 0.38);
      const bosMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.4, roughness: 0.5 });
      const bosBox = new THREE.Mesh(bosGeo, bosMat);
      bosBox.position.set(invWallX, 1.82, 2.02);
      bosBox.userData = { componentKey: 'inverter_unit' };
      inverterGroup.add(bosBox);

      // Vertical conduit pipe from roof to inverter
      const conduitGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.35, 8);
      const conduitMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });
      const conduit = new THREE.Mesh(conduitGeo, conduitMat);
      conduit.position.set(invWallX - 0.02, 2.65, 1.35);
      inverterGroup.add(conduit);

      // 5. Optional LiFePO4 Battery Storage Units (Positioned on utility wall pad next to inverter)
      if (currentConfig.includeBattery && currentConfig.selectedBatteryQuantity > 0) {
        const displayPacks = Math.min(4, Math.max(1, Number(currentConfig.selectedBatteryQuantity) || 1));

        // Concrete Equipment Pad
        const padGeo = new THREE.BoxGeometry(0.9, 0.12, 3.2);
        const padMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.set(invWallX + 0.25, 0.08, -0.55);
        batteryGroup.add(pad);

        for (let b = 0; b < displayPacks; b++) {
          const bz = 0.45 - b * 0.72;
          const packGroup = new THREE.Group();
          packGroup.position.set(invWallX + 0.18, 0.78, bz);

          const bodyGeo = new THREE.BoxGeometry(0.34, 1.25, 0.58);
          const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            metalness: 0.25,
            roughness: 0.35
          });
          const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
          bodyMesh.castShadow = true;
          bodyMesh.userData = { componentKey: 'battery_bank' };
          packGroup.add(bodyMesh);

          // Emerald State-of-Charge LED Strip
          const ledGeo = new THREE.BoxGeometry(0.36, 0.08, 0.42);
          const ledMat = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x10b981,
            emissiveIntensity: currentConfig.lightingMode === 'evening' ? 0.95 : 0.55
          });
          const ledMesh = new THREE.Mesh(ledGeo, ledMat);
          ledMesh.position.set(0.01, 0.42, 0);
          ledMesh.userData = { componentKey: 'battery_bank' };
          packGroup.add(ledMesh);

          // Dark front faceplate trim
          const trimGeo = new THREE.BoxGeometry(0.35, 0.75, 0.46);
          const trimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
          const trimMesh = new THREE.Mesh(trimGeo, trimMat);
          trimMesh.position.set(0.005, -0.08, 0);
          trimMesh.userData = { componentKey: 'battery_bank' };
          packGroup.add(trimMesh);

          batteryGroup.add(packGroup);
        }
      }
    }

    function applyLightingAndOrientation() {
      if (!scene) return;
      const isNight = currentConfig.lightingMode === 'evening';
      scene.background = new THREE.Color(isNight ? 0x070d19 : 0x0f172a);
      scene.fog = new THREE.FogExp2(isNight ? 0x070d19 : 0x0f172a, 0.015);

      if (ambientLight) {
        ambientLight.intensity = isNight ? 0.35 : 0.65;
        ambientLight.color.setHex(isNight ? 0x93c5fd : 0xffffff);
      }
      if (hemiLight) {
        hemiLight.intensity = isNight ? 0.28 : 0.55;
      }
      if (sunLight) {
        sunLight.intensity = isNight ? 0.35 : 1.15;
        sunLight.color.setHex(isNight ? 0x60a5fa : 0xfffbeb);
        sunLight.position.set(isNight ? -10 : 12, isNight ? 11 : 16, isNight ? -8 : 11);
      }
      if (sunOrb) {
        sunOrb.position.set(isNight ? -13 : 14, isNight ? 11 : 14, isNight ? -10 : 10);
        sunOrb.material.color.setHex(isNight ? 0xe0f2fe : 0xfbbf24);
      }

      // Rotate property slightly based on roof orientation preset
      const orientationAngles = {
        'South': 0,
        'South-West': 0.38,
        'South-East': -0.38,
        'West': 0.78
      };
      const rotY = orientationAngles[currentConfig.roofOrientation] || 0;
      if (propertyGroup) propertyGroup.rotation.y = rotY;
      if (panelsGroup) panelsGroup.rotation.y = rotY;
      if (inverterGroup) inverterGroup.rotation.y = rotY;
      if (batteryGroup) batteryGroup.rotation.y = rotY;

      windowMeshes.forEach(mat => {
        mat.color.setHex(isNight ? 0xfde68a : 0x38bdf8);
        mat.emissive.setHex(isNight ? 0xf59e0b : 0x0284c7);
        mat.emissiveIntensity = isNight ? 0.9 : 0.15;
      });
    }

    function updateCameraPositionFromSpherical() {
      if (!camera) return;
      // Smooth damping toward goal
      camState.theta += (camState.goalTheta - camState.theta) * 0.16;
      camState.phi += (camState.goalPhi - camState.phi) * 0.16;
      camState.radius += (camState.goalRadius - camState.radius) * 0.16;
      camState.target.x += (camState.goalTarget.x - camState.target.x) * 0.16;
      camState.target.y += (camState.goalTarget.y - camState.target.y) * 0.16;
      camState.target.z += (camState.goalTarget.z - camState.target.z) * 0.16;

      const sinPhi = Math.sin(camState.phi);
      const x = camState.target.x + camState.radius * sinPhi * Math.sin(camState.theta);
      const y = camState.target.y + camState.radius * Math.cos(camState.phi);
      const z = camState.target.z + camState.radius * sinPhi * Math.cos(camState.theta);

      camera.position.set(x, Math.max(1.2, y), z);
      camera.lookAt(camState.target.x, camState.target.y, camState.target.z);
    }

    function initWebGLScene() {
      if (!containerEl) return false;
      webglSupported = checkWebGLAvailable();
      if (!webglSupported || force2DMode) {
        render2DSchematicSVG(containerEl, currentConfig, onSelectComponent);
        return false;
      }

      try {
        containerEl.innerHTML = '';
        const width = Math.max(300, containerEl.clientWidth || 640);
        const height = Math.max(260, containerEl.clientHeight || 400);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 120);

        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.touchAction = 'pan-y';
        containerEl.appendChild(renderer.domElement);

        // Lighting
        ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        scene.add(ambientLight);

        hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.55);
        scene.add(hemiLight);

        sunLight = new THREE.DirectionalLight(0xfffbeb, 1.15);
        sunLight.position.set(12, 16, 11);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = 2;
        sunLight.shadow.camera.far = 45;
        const d = 12;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        sunLight.shadow.bias = -0.0008;
        scene.add(sunLight);

        // Visual Sun/Moon Orb
        sunOrb = new THREE.Mesh(
          new THREE.SphereGeometry(0.85, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
        );
        sunOrb.position.set(14, 14, 10);
        scene.add(sunOrb);

        propertyGroup = new THREE.Group();
        panelsGroup = new THREE.Group();
        inverterGroup = new THREE.Group();
        batteryGroup = new THREE.Group();

        scene.add(propertyGroup);
        scene.add(panelsGroup);
        scene.add(inverterGroup);
        scene.add(batteryGroup);

        buildBaseArchitecture();
        rebuildSolarAndEquipment();
        applyLightingAndOrientation();
        updateCameraPositionFromSpherical();

        // Pointer / Touch / Wheel Interaction + Raycast Selection
        let isDragging = false;
        let pointerDownPos = { x: 0, y: 0 };
        let lastPos = { x: 0, y: 0 };
        let pinchStartDist = 0;

        const dom = renderer.domElement;

        dom.addEventListener('mousedown', (e) => {
          isDragging = true;
          pointerDownPos = { x: e.clientX, y: e.clientY };
          lastPos = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          const dx = e.clientX - lastPos.x;
          const dy = e.clientY - lastPos.y;
          lastPos = { x: e.clientX, y: e.clientY };
          camState.goalTheta -= dx * 0.0075;
          camState.goalPhi = Math.max(0.28, Math.min(1.42, camState.goalPhi - dy * 0.0065));
        });

        window.addEventListener('mouseup', (e) => {
          if (!isDragging) return;
          isDragging = false;
          const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
          if (dist < 6) {
            handleRaycastClick(e.clientX, e.clientY);
          }
        });

        dom.addEventListener('wheel', (e) => {
          e.preventDefault();
          camState.goalRadius = Math.max(9.5, Math.min(34, camState.goalRadius + e.deltaY * 0.012));
        }, { passive: false });

        dom.addEventListener('touchstart', (e) => {
          if (e.touches.length === 1) {
            isDragging = true;
            pointerDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          } else if (e.touches.length === 2) {
            isDragging = false;
            pinchStartDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
          }
        }, { passive: true });

        dom.addEventListener('touchmove', (e) => {
          if (e.touches.length === 1 && isDragging) {
            const dx = e.touches[0].clientX - lastPos.x;
            const dy = e.touches[0].clientY - lastPos.y;
            if (Math.abs(dx) > Math.abs(dy)) {
              e.preventDefault();
            }
            lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            camState.goalTheta -= dx * 0.008;
            camState.goalPhi = Math.max(0.28, Math.min(1.42, camState.goalPhi - dy * 0.006));
          } else if (e.touches.length === 2 && pinchStartDist > 0) {
            e.preventDefault();
            const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = pinchStartDist - dist;
            camState.goalRadius = Math.max(9.5, Math.min(34, camState.goalRadius + delta * 0.04));
            pinchStartDist = dist;
          }
        }, { passive: false });

        dom.addEventListener('touchend', () => {
          isDragging = false;
          pinchStartDist = 0;
        }, { passive: true });

        function handleRaycastClick(clientX, clientY) {
          if (!renderer || !camera || !scene) return;
          const rect = renderer.domElement.getBoundingClientRect();
          const mouse = new THREE.Vector2(
            ((clientX - rect.left) / rect.width) * 2 - 1,
            -((clientY - rect.top) / rect.height) * 2 + 1
          );
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);
          const targets = [
            ...panelsGroup.children,
            ...inverterGroup.children,
            ...batteryGroup.children,
            ...roofStructureGroup.children
          ];
          const intersects = raycaster.intersectObjects(targets, true);
          if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj && (!obj.userData || !obj.userData.componentKey) && obj.parent) {
              obj = obj.parent;
            }
            if (obj && obj.userData && obj.userData.componentKey) {
              onSelectComponent(obj.userData.componentKey);
            }
          }
        }

        function animate() {
          if (isDisposed) return;
          animFrameId = requestAnimationFrame(animate);
          if (!force2DMode && renderer && scene && camera) {
            updateCameraPositionFromSpherical();
            renderer.render(scene, camera);
          }
        }
        if (animFrameId) cancelAnimationFrame(animFrameId);
        animate();
        return true;
      } catch (err) {
        webglSupported = false;
        render2DSchematicSVG(containerEl, currentConfig, onSelectComponent);
        return false;
      }
    }

    function setCameraPreset(presetName) {
      if (presetName === 'roof') {
        camState.goalTheta = 0.05;
        camState.goalPhi = 0.42;
        camState.goalRadius = 15.5;
        camState.goalTarget = { x: -0.5, y: 3.8, z: 0.4 };
      } else if (presetName === 'equipment') {
        camState.goalTheta = 1.32;
        camState.goalPhi = 1.18;
        camState.goalRadius = 11.2;
        camState.goalTarget = { x: 5.5, y: 1.5, z: 0.4 };
      } else {
        // 'overview' or 'reset'
        camState.goalTheta = 0.62;
        camState.goalPhi = 1.02;
        camState.goalRadius = 21.5;
        camState.goalTarget = { x: 0, y: 2.3, z: 0 };
      }
    }

    function updateConfiguration(newCfg) {
      const prevCutaway = currentConfig.cutawayMode;
      const prevProjectType = currentConfig.projectType;
      Object.assign(currentConfig, newCfg || {});

      if (!webglSupported || force2DMode || !renderer) {
        render2DSchematicSVG(containerEl, currentConfig, onSelectComponent);
        return;
      }

      if (prevCutaway !== currentConfig.cutawayMode || prevProjectType !== currentConfig.projectType) {
        buildBaseArchitecture();
      }
      rebuildSolarAndEquipment();
      applyLightingAndOrientation();
    }

    function toggleRenderMode(use2D) {
      force2DMode = Boolean(use2D);
      if (force2DMode) {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        render2DSchematicSVG(containerEl, currentConfig, onSelectComponent);
      } else {
        initWebGLScene();
      }
      return force2DMode ? '2d' : (webglSupported ? '3d' : '2d');
    }

    function handleResize() {
      if (!containerEl || !renderer || !camera || force2DMode || !webglSupported) return;
      const w = Math.max(280, containerEl.clientWidth || 600);
      const h = Math.max(240, containerEl.clientHeight || 380);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    function dispose() {
      isDisposed = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      disposeHierarchy(propertyGroup);
      disposeHierarchy(panelsGroup);
      disposeHierarchy(inverterGroup);
      disposeHierarchy(batteryGroup);
      if (panelTexture && panelTexture.dispose) panelTexture.dispose();
      if (renderer && renderer.dispose) renderer.dispose();
    }

    // Initialize on creation
    initWebGLScene();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    return {
      updateConfiguration,
      setCameraPreset,
      toggleRenderMode,
      handleResize,
      dispose,
      isWebGLActive: () => webglSupported && !force2DMode
    };
  }

  return {
    createSolarSceneController,
    render2DSchematicSVG
  };
});
