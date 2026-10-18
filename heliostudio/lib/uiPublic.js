/**
 * HelioStudio — Experience A: Public Landing Page, 6-Step Customer 3D Configurator,
 * and Shareable / Print-Ready Configuration & Quote View
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HelioUIPublic = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function escapeHtml(str) {
    return String(str === undefined || str === null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderBrandMark(org) {
    if (org && org.logoUrl && (org.logoUrl.startsWith('data:image/') || org.logoUrl.startsWith('https://'))) {
      return `<img src="${escapeHtml(org.logoUrl)}" alt="${escapeHtml(org.name)}" class="w-8 h-8 rounded object-contain bg-slate-900 p-0.5"/>`;
    }
    const primary = (org && org.primaryColor) || '#d97706';
    if (org && org.logoType === 'hex_grid') {
      return `
        <svg class="w-8 h-8 flex-shrink-0" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="8" fill="#0f172a"/>
          <polygon points="18,6 28,12 28,24 18,30 8,24 8,12" stroke="${escapeHtml(primary)}" stroke-width="2.4" fill="rgba(217,119,6,0.18)"/>
          <line x1="8" y1="18" x2="28" y2="18" stroke="#38bdf8" stroke-width="1.5"/>
          <line x1="18" y1="6" x2="18" y2="30" stroke="#38bdf8" stroke-width="1.5"/>
        </svg>`;
    }
    return `
      <svg class="w-8 h-8 flex-shrink-0" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="8" fill="#0f172a"/>
        <circle cx="18" cy="14" r="6" fill="${escapeHtml(primary)}"/>
        <path d="M7 26L13 19H23L29 26H7Z" fill="#38bdf8" fill-opacity="0.85"/>
        <line x1="12" y1="22.5" x2="24" y2="22.5" stroke="#0f172a" stroke-width="1.2"/>
        <line x1="18" y1="19" x2="18" y2="26" stroke="#0f172a" stroke-width="1.2"/>
      </svg>`;
  }

  /**
   * Render Public Landing Page (Route: /)
   */
  function renderLandingPage(app) {
    const org = app.store.getOrganization();
    const assumptions = app.store.getAssumptions();
    const packages = app.store.getPackages();
    const fmt = (v) => window.HelioEstimator.formatMoney(v, assumptions.currency, assumptions.locale);

    return `
      <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <!-- Top Demo Banner -->
        <div class="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
          <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">DEMO MODE</span>
              <span>Interactive White-Label Solar Sales Configurator &amp; SaaS Workspace • Data stored locally in this browser.</span>
            </div>
            <div class="flex items-center gap-3">
              <button type="button" data-action="nav" data-route="/configure" class="text-amber-400 hover:text-amber-300 font-medium underline">Try Customer Configurator</button>
              <span class="text-slate-600">|</span>
              <button type="button" data-action="nav" data-route="/app" class="text-sky-400 hover:text-sky-300 font-medium underline">Open Company Workspace</button>
            </div>
          </div>
        </div>

        <!-- Public Header -->
        <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3 cursor-pointer" data-action="nav" data-route="/">
              ${renderBrandMark(org)}
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-lg tracking-tight text-slate-900">${escapeHtml(org.name)}</span>
                  <span class="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">Powered by HelioStudio</span>
                </div>
                <p class="text-xs text-slate-500">${escapeHtml(org.tagline || 'Solar, made tangible.')}</p>
              </div>
            </div>
            <nav class="flex items-center gap-2 sm:gap-3">
              <button type="button" data-action="nav" data-route="/configure" class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-sm">
                Build a Solar Setup
              </button>
              <button type="button" data-action="nav" data-route="/app" class="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-200">
                Installer Workspace
              </button>
            </nav>
          </div>
        </header>

        <!-- Hero Section with Live Embedded 3D Preview -->
        <section class="bg-slate-950 text-white py-12 lg:py-16 border-b border-slate-800">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div class="lg:col-span-6 space-y-5">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <span>Show the system. Explain the estimate. Capture the opportunity.</span>
                </div>
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Explore your rooftop solar &amp; battery system in <span class="text-amber-400">interactive 3D</span>.
                </h1>
                <p class="text-slate-300 text-base sm:text-lg leading-relaxed">
                  Compare grid-tied, hybrid, and battery-backup packages visually. Understand every equipment line item and sizing assumption before requesting a professional site assessment.
                </p>
                <div class="flex flex-wrap items-center gap-3 pt-2">
                  <button type="button" data-action="nav" data-route="/configure" class="px-6 py-3 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-lg text-base">
                    Build a Solar Setup →
                  </button>
                  <button type="button" data-action="start-preset-context" data-context="home_backup" class="px-4 py-3 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-sm">
                    Explore Home + Backup Demo
                  </button>
                  <button type="button" data-action="nav" data-route="/app" class="px-4 py-3 rounded-xl font-semibold text-sky-300 hover:text-sky-200 bg-sky-950/60 border border-sky-800/60 transition text-sm">
                    Open Demo Workspace
                  </button>
                </div>
                <div class="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-400">
                  <div>
                    <div class="font-bold text-white text-sm">Interactive 3D</div>
                    <div>Real-time module, inverter &amp; LFP battery layout</div>
                  </div>
                  <div>
                    <div class="font-bold text-white text-sm">Transparent Math</div>
                    <div>Explicit kWh, sun-hours, DoD &amp; tariff assumptions</div>
                  </div>
                  <div>
                    <div class="font-bold text-white text-sm">Connected CRM</div>
                    <div>Saved snapshots flow directly into installer proposals</div>
                  </div>
                </div>
              </div>

              <!-- Live Interactive 3D Hero Preview Card -->
              <div class="lg:col-span-6">
                <div class="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                  <div class="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span class="font-semibold text-slate-200">Live 3D Preview — 8.19 kW Hybrid + 5.12 kWh LFP</span>
                    </div>
                    <span class="text-slate-400">Drag to rotate • Scroll to zoom</span>
                  </div>
                  <div id="hero-3d-viewport" class="w-full h-[340px] sm:h-[380px] relative bg-slate-950"></div>
                  <div class="p-3.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div class="flex items-center gap-2">
                      <button type="button" data-action="hero-cam" data-preset="overview" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium">Overview</button>
                      <button type="button" data-action="hero-cam" data-preset="roof" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium">Roof Array</button>
                      <button type="button" data-action="hero-cam" data-preset="equipment" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium">Inverter &amp; Battery</button>
                      <button type="button" data-action="hero-light-toggle" class="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium">Day / Evening</button>
                    </div>
                    <button type="button" data-action="nav" data-route="/configure" class="text-amber-400 hover:text-amber-300 font-semibold">
                      Customize in Full 3D Studio →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Three-Step Flow Section -->
        <section class="py-12 bg-white border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="max-w-3xl">
              <span class="text-xs font-bold uppercase tracking-wider text-amber-600">How HelioStudio Works</span>
              <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">From monthly electricity usage to a visual preliminary system in 3 steps</h2>
              <p class="text-sm text-slate-600 mt-2">Designed to make technical solar options clear without replacing a professional on-site engineering survey.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div class="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div class="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-700 font-bold flex items-center justify-center text-sm mb-4">01</div>
                  <h3 class="font-bold text-lg text-slate-900">1. Explore &amp; Size</h3>
                  <p class="text-sm text-slate-600 mt-2">Select your property context (Home, Small Business, or Backup Power) and enter either monthly kWh consumption, monthly utility bill, or an illustrative sample profile.</p>
                </div>
                <button type="button" data-action="nav" data-route="/configure" class="mt-4 text-xs font-semibold text-amber-700 hover:text-amber-800 text-left">Start Step 1 in Configurator →</button>
              </div>

              <div class="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div class="w-9 h-9 rounded-lg bg-sky-500/15 text-sky-700 font-bold flex items-center justify-center text-sm mb-4">02</div>
                  <h3 class="font-bold text-lg text-slate-900">2. Compare in 3D</h3>
                  <p class="text-sm text-slate-600 mt-2">See solar modules, inverters, and LFP battery packs update live on the 3D property. Compare Essential, Balanced, and Backup Plus packages side by side with full assumption disclosure.</p>
                </div>
                <button type="button" data-action="nav" data-route="/configure" class="mt-4 text-xs font-semibold text-sky-700 hover:text-sky-800 text-left">Compare Packages →</button>
              </div>

              <div class="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div class="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4">03</div>
                  <h3 class="font-bold text-lg text-slate-900">3. Request Site Survey &amp; Quote</h3>
                  <p class="text-sm text-slate-600 mt-2">Save a read-only shareable snapshot or submit an enquiry. Your exact configuration flows directly into the installer's CRM pipeline and proposal builder.</p>
                </div>
                <button type="button" data-action="nav" data-route="/configure" class="mt-4 text-xs font-semibold text-emerald-700 hover:text-emerald-800 text-left">Review Estimate &amp; Request Quote →</button>
              </div>
            </div>
          </div>
        </section>

        <!-- For Solar Installers & Agencies (White-Label SaaS Overview) -->
        <section class="py-12 bg-slate-100 border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div class="lg:col-span-7 space-y-4">
                <span class="text-xs font-bold uppercase tracking-wider text-sky-700">For Solar Installers, Retailers &amp; Agencies</span>
                <h2 class="text-2xl sm:text-3xl font-bold text-slate-900">Connected White-Label Sales Workspace</h2>
                <p class="text-sm sm:text-base text-slate-600">
                  Every quote request submitted in Experience A automatically attaches its full 3D configuration snapshot, BOM, and assumptions to a lead in Experience B — eliminating manual spreadsheet re-entry.
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
                  <div class="p-3.5 rounded-lg bg-white border border-slate-200">
                    <div class="font-semibold text-slate-900">Lead &amp; Proposal Pipeline</div>
                    <p class="text-xs text-slate-600 mt-1">Kanban &amp; table views, status validation, follow-up reminders, and 1-click conversion from saved configuration to customer-ready PDF/print proposal.</p>
                  </div>
                  <div class="p-3.5 rounded-lg bg-white border border-slate-200">
                    <div class="font-semibold text-slate-900">Catalog &amp; Snapshot Integrity</div>
                    <p class="text-xs text-slate-600 mt-1">Manage panels, inverters, batteries, and BOS pricing. Sent proposals preserve historical price snapshots even when catalog prices change later.</p>
                  </div>
                  <div class="p-3.5 rounded-lg bg-white border border-slate-200">
                    <div class="font-semibold text-slate-900">White-Label Brand &amp; Locale Controls</div>
                    <p class="text-xs text-slate-600 mt-1">Configure company name, logo, colors, currency (PKR, USD, EUR, AED, GBP), sun-hours, performance factor, and disclaimers from one central panel.</p>
                  </div>
                  <div class="p-3.5 rounded-lg bg-white border border-slate-200">
                    <div class="font-semibold text-slate-900">Grounded Sales Copilot</div>
                    <p class="text-xs text-slate-600 mt-1">Template-based deterministic assistant summarizes lead timelines, drafts follow-up messages, and generates owner daily briefs without hallucinating customer data.</p>
                  </div>
                </div>
                <div class="pt-2 flex flex-wrap gap-3">
                  <button type="button" data-action="nav" data-route="/app" class="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition">
                    Open Company Workspace (/app)
                  </button>
                  <button type="button" data-action="nav" data-route="/app/catalog" class="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium transition">
                    Inspect Equipment Catalog
                  </button>
                  <button type="button" data-action="nav" data-route="/app/proposals" class="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium transition">
                    View Sample Proposals
                  </button>
                </div>
              </div>

              <!-- Transparent Engineering Boundary Card -->
              <div class="lg:col-span-5">
                <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">Transparency &amp; Boundaries</span>
                    <span class="text-xs text-slate-500">Region: ${escapeHtml(assumptions.regionLabel)}</span>
                  </div>
                  <h3 class="font-bold text-slate-900 text-base">Preliminary Pre-Sales Estimator — Not a Final Engineering Certification</h3>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    ${escapeHtml(assumptions.disclaimerText)}
                  </p>
                  <div class="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div class="font-semibold text-slate-800">Active Workspace Defaults (${escapeHtml(org.name)}):</div>
                    <div class="flex justify-between text-slate-600"><span>Equivalent Peak Sun-Hours:</span><span class="font-mono font-semibold text-slate-900">${assumptions.peakSunHoursPerDay} hrs/day</span></div>
                    <div class="flex justify-between text-slate-600"><span>Overall Performance Factor:</span><span class="font-mono font-semibold text-slate-900">${Math.round(assumptions.performanceFactor * 100)}% (${assumptions.performanceFactor})</span></div>
                    <div class="flex justify-between text-slate-600"><span>Assumed Blended Tariff:</span><span class="font-mono font-semibold text-slate-900">${fmt(assumptions.assumedTariffPerKwh)} / kWh</span></div>
                    <div class="flex justify-between text-slate-600"><span>Battery Usable DoD × Efficiency:</span><span class="font-mono font-semibold text-slate-900">${Math.round(assumptions.usableDodFraction * 100)}% × ${Math.round(assumptions.batteryEfficiencyFraction * 100)}%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="bg-slate-900 text-slate-400 text-xs py-8 mt-auto">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div class="font-bold text-white text-sm">${escapeHtml(org.name)} — Powered by HelioStudio v1.2</div>
              <div class="mt-1">Demo Contact Placeholder: ${escapeHtml(org.contactEmail)} • ${escapeHtml(org.contactPhone)} • ${escapeHtml(org.city)}</div>
              <div class="mt-1 text-slate-500">All products, brands, and customer records in this workspace are synthetic demonstration data.</div>
            </div>
            <div class="flex flex-wrap gap-4">
              <button type="button" data-action="nav" data-route="/" class="hover:text-white">Home</button>
              <button type="button" data-action="nav" data-route="/configure" class="hover:text-white">3D Configurator</button>
              <button type="button" data-action="nav" data-route="/app" class="hover:text-white">Company Workspace</button>
              <button type="button" data-action="nav" data-route="/app/docs" class="hover:text-white">README &amp; Architecture</button>
              <button type="button" data-action="open-reset-modal" class="text-rose-400 hover:text-rose-300">Reset Demo Data</button>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  /**
   * Render 6-Step Interactive Customer Configurator (Route: /configure or /configure/:id)
   */
  function renderConfiguratorPage(app) {
    const org = app.store.getOrganization();
    const assumptions = app.store.getAssumptions();
    const cfgState = app.configuratorState;
    const computed = app.store.buildConfigurationComputation(cfgState);
    const fmt = (v) => window.HelioEstimator.formatMoney(v, assumptions.currency, assumptions.locale);

    const activePanels = app.store.getProducts({ activeOnly: true, category: 'panel' });
    const activeInverters = app.store.getProducts({ activeOnly: true, category: 'inverter' });
    const activeBatteries = app.store.getProducts({ activeOnly: true, category: 'battery' });
    const packages = app.store.getPackages();

    const stepLabels = [
      { num: 1, title: '1. Context' },
      { num: 2, title: '2. Energy Use' },
      { num: 3, title: '3. 3D System' },
      { num: 4, title: '4. Packages' },
      { num: 5, title: '5. Estimate' },
      { num: 6, title: '6. Request Quote' }
    ];

    // Inspect component info
    const selectedPart = cfgState.selected3DPart || 'solar_array';
    const partDescriptions = {
      solar_array: {
        label: 'Rooftop Solar PV Array',
        title: computed.panelProduct ? computed.panelProduct.name : 'Solar Array',
        detail: `${computed.sizing.selectedPanelCount} modules × ${computed.sizing.panelWattage}W = ${computed.sizing.actualDcCapacityKw} kW DC total capacity (${computed.sizing.visiblePanelCount} shown on 3D roof).`
      },
      inverter_unit: {
        label: 'Power Conversion & MPPT Inverter',
        title: computed.inverterProduct ? computed.inverterProduct.name : 'Inverter',
        detail: `${computed.sizing.totalInverterAcKw} kW AC output • Preliminary DC/AC ratio: ${computed.sizing.dcAcRatio.toFixed(2)}.`
      },
      battery_bank: {
        label: 'LiFePO4 Storage Bank',
        title: computed.includeBattery && computed.batteryProduct ? computed.batteryProduct.name : 'No Battery Selected (Grid-Tied)',
        detail: computed.includeBattery
          ? `${computed.battery.selectedBatteryQuantity} pack(s) • ${computed.battery.totalNominalCapacityKwh} kWh nominal (${computed.battery.totalUsableCapacityKwh} kWh usable) • ~${computed.battery.estimatedRuntimeHours} hrs at ${computed.battery.backupLoadKw} kW load.`
          : 'Toggle "Include Battery Storage" or select Balanced / Backup Plus package to add backup power.'
      },
      roof_structure: {
        label: 'Roof Plane & Mounting Structure',
        title: `${cfgState.roofOrientation || 'South'} Azimuth • 22° Pitched Roof`,
        detail: `Anodized aluminum L2 mounting rails for ${computed.sizing.selectedPanelCount} modules. Subject to physical structural & shading verification.`
      }
    };
    const activePartInfo = partDescriptions[selectedPart] || partDescriptions.solar_array;

    return `
      <div class="min-h-screen flex flex-col bg-slate-100 text-slate-900">
        <!-- Top Bar -->
        <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <button type="button" data-action="nav" data-route="/" class="text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1">
                ← Landing
              </button>
              <span class="text-slate-700">|</span>
              <div class="flex items-center gap-2">
                ${renderBrandMark(org)}
                <span class="font-bold text-sm sm:text-base">${escapeHtml(org.name)}</span>
                <span class="hidden md:inline-block text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Interactive 3D Configurator</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" data-action="save-config-only" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                Save &amp; Share Link
              </button>
              <button type="button" data-action="nav" data-route="/app" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white">
                Open Admin Workspace
              </button>
            </div>
          </div>
        </header>

        <!-- Step Progress Bar -->
        <div class="bg-white border-b border-slate-200 shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between overflow-x-auto gap-2">
            <div class="flex items-center gap-1.5 sm:gap-2">
              ${stepLabels.map(s => {
                const isActive = cfgState.activeStep === s.num;
                return `
                  <button type="button" data-action="cfg-step" data-step="${s.num}"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? 'bg-slate-900 text-amber-400 shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }">
                    ${escapeHtml(s.title)}
                  </button>`;
              }).join('')}
            </div>
            <div class="hidden lg:flex items-center gap-4 text-xs">
              <div><span class="text-slate-500">System:</span> <strong class="text-slate-900">${computed.sizing.actualDcCapacityKw} kW DC (${computed.sizing.selectedPanelCount} panels)</strong></div>
              <div><span class="text-slate-500">Preliminary Total:</span> <strong class="text-amber-600 font-bold">${fmt(computed.financials.grandTotal)}</strong></div>
            </div>
          </div>
        </div>

        <!-- Main Two-Column Configurator Layout -->
        <main class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 flex-1">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            <!-- LEFT / TOP COLUMN: Sticky 3D Solar Viewport & Live System Summary (7 cols on desktop) -->
            <div class="lg:col-span-7 space-y-4 lg:sticky lg:top-20">
              <div class="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
                <!-- Viewport Header Controls -->
                <div class="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span class="font-semibold">${computed.sizing.selectedPanelCount} Panels (${computed.sizing.actualDcCapacityKw} kW)</span>
                    <span class="text-slate-500">•</span>
                    <span class="text-emerald-400 font-medium">${computed.includeBattery ? computed.battery.totalNominalCapacityKwh + ' kWh LFP Backup' : 'Grid-Tied (No Battery)'}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button type="button" data-action="cfg-render-mode" data-mode="3d" class="px-2 py-1 rounded ${!cfgState.use2DMode ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}">3D WebGL</button>
                    <button type="button" data-action="cfg-render-mode" data-mode="2d" class="px-2 py-1 rounded ${cfgState.use2DMode ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}">2D Schematic</button>
                  </div>
                </div>

                <!-- 3D Canvas Container -->
                <div id="configurator-3d-viewport" class="w-full h-[320px] sm:h-[390px] relative bg-slate-950"></div>

                <!-- Camera & Scene Toolbar -->
                <div class="px-3.5 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-slate-400 mr-1">Camera:</span>
                    <button type="button" data-action="cfg-cam" data-preset="overview" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Overview</button>
                    <button type="button" data-action="cfg-cam" data-preset="roof" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Roof</button>
                    <button type="button" data-action="cfg-cam" data-preset="equipment" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Equipment</button>
                    <button type="button" data-action="cfg-cam" data-preset="reset" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300">Reset View</button>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button type="button" data-action="cfg-toggle-cutaway" class="px-2.5 py-1 rounded ${cfgState.cutawayMode ? 'bg-sky-500/30 text-sky-200 border border-sky-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
                      Roof Cutaway
                    </button>
                    <button type="button" data-action="cfg-toggle-lighting" class="px-2.5 py-1 rounded ${cfgState.lightingMode === 'evening' ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40' : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'}">
                      ${cfgState.lightingMode === 'evening' ? 'Evening Demo' : 'Daylight Demo'}
                    </button>
                  </div>
                </div>

                <!-- Selected 3D Component Inspector Bar -->
                <div class="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span class="text-amber-400 font-semibold uppercase tracking-wider text-[10px]">${escapeHtml(activePartInfo.label)}:</span>
                    <span class="text-white font-semibold ml-1">${escapeHtml(activePartInfo.title)}</span>
                    <p class="text-slate-400 text-[11px] mt-0.5">${escapeHtml(activePartInfo.detail)}</p>
                  </div>
                  <div class="text-[11px] text-slate-400 whitespace-nowrap">Drag to rotate • Scroll to zoom</div>
                </div>
              </div>

              <!-- Compact KPI & Warnings Strip below 3D Scene -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div class="text-[11px] text-slate-500 font-medium">Installed DC Size</div>
                  <div class="text-lg font-extrabold text-slate-900 mt-0.5">${computed.sizing.actualDcCapacityKw} kW</div>
                  <div class="text-[11px] text-slate-500">${computed.sizing.selectedPanelCount} × ${computed.sizing.panelWattage}W (Target: ${computed.energy.preliminaryDcTargetKw} kW)</div>
                </div>
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div class="text-[11px] text-slate-500 font-medium">Illustrative Output</div>
                  <div class="text-lg font-extrabold text-sky-700 mt-0.5">~${computed.sizing.estimatedMonthlyGenerationKwh.toLocaleString()} kWh/mo</div>
                  <div class="text-[11px] text-slate-500">~${computed.sizing.estimatedDailyGenerationKwh} kWh/day (${assumptions.peakSunHoursPerDay}h PSH)</div>
                </div>
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div class="text-[11px] text-slate-500 font-medium">Battery Backup</div>
                  <div class="text-lg font-extrabold text-emerald-700 mt-0.5">${computed.includeBattery ? computed.battery.totalNominalCapacityKwh + ' kWh' : 'None'}</div>
                  <div class="text-[11px] text-slate-500">${computed.includeBattery ? `~${computed.battery.estimatedRuntimeHours} hrs @ ${computed.battery.backupLoadKw} kW` : 'Grid-tied daytime only'}</div>
                </div>
                <div class="bg-white p-3 rounded-xl border border-amber-300 bg-amber-50/40 shadow-sm">
                  <div class="text-[11px] text-amber-800 font-semibold">Preliminary Estimate</div>
                  <div class="text-lg font-extrabold text-slate-900 mt-0.5">${fmt(computed.financials.grandTotal)}</div>
                  <div class="text-[11px] text-amber-700">Subject to site survey</div>
                </div>
              </div>

              ${computed.sizing.compatibilityWarnings.length > 0 ? `
                <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-1">
                  <div class="font-bold flex items-center gap-1.5"><span>⚠️ Engineering &amp; Visualization Notes:</span></div>
                  ${computed.sizing.compatibilityWarnings.map(w => `<div>• ${escapeHtml(w)}</div>`).join('')}
                </div>
              ` : ''}
            </div>

            <!-- RIGHT / BOTTOM COLUMN: Step-by-Step Interactive Controls (5 cols on desktop) -->
            <div class="lg:col-span-5 space-y-5">

              ${cfgState.submissionResult ? `
                <!-- Quote Confirmation Banner when submitted -->
                <div class="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-700 shadow-lg space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Quote Request Saved</span>
                    <span class="font-mono text-xs text-emerald-300">${escapeHtml(cfgState.submissionResult.lead.reference)}</span>
                  </div>
                  <h3 class="text-lg font-bold">Thank you, ${escapeHtml(cfgState.submissionResult.lead.contactName)}!</h3>
                  <p class="text-xs text-emerald-100 leading-relaxed">
                    Your preliminary configuration snapshot (<strong>${escapeHtml(cfgState.submissionResult.configuration.reference)}</strong> — ${computed.sizing.actualDcCapacityKw} kW DC, ${fmt(computed.financials.grandTotal)}) has been attached to enquiry <strong>${escapeHtml(cfgState.submissionResult.lead.reference)}</strong>.
                  </p>
                  <div class="p-3 rounded-lg bg-emerald-900/60 border border-emerald-800 text-xs text-emerald-200">
                    <strong>Demo Mode Notice:</strong> ${escapeHtml(cfgState.submissionResult.demoNotice)}
                  </div>
                  <div class="flex flex-wrap gap-2 pt-1">
                    <button type="button" data-action="open-lead-in-admin" data-lead-id="${escapeHtml(cfgState.submissionResult.lead.id)}" class="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
                      Inspect This Lead in Admin Workspace →
                    </button>
                    <button type="button" data-action="open-share-view" data-token="${escapeHtml(cfgState.submissionResult.configuration.shareToken)}" class="px-3 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs">
                      Open Printable Share Page
                    </button>
                  </div>
                </div>
              ` : ''}

              <!-- STEP 1 & 2: Project Context & Energy Information -->
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">Steps 1 &amp; 2</span>
                    <h2 class="text-base font-bold text-slate-900">Property Context &amp; Monthly Energy Use</h2>
                  </div>
                  <button type="button" data-action="apply-demo-profile" class="text-xs font-semibold text-sky-600 hover:text-sky-700 underline">
                    I don't know my usage (Use Demo Profile)
                  </button>
                </div>

                <!-- Step 1: Project Context Cards -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-2">1. Choose Property Context (Illustrative Presets)</label>
                  <div class="grid grid-cols-3 gap-2.5">
                    ${[
                      { key: 'home', label: 'Home', desc: 'Daytime offset' },
                      { key: 'home_backup', label: 'Home + Backup', desc: 'Solar + LFP storage' },
                      { key: 'small_business', label: 'Small Business', desc: 'Commercial daytime' }
                    ].map(ctx => `
                      <button type="button" data-action="select-project-type" data-project-type="${ctx.key}"
                        class="p-2.5 rounded-xl border text-left transition ${
                          cfgState.projectType === ctx.key
                            ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }">
                        <div class="font-bold text-xs text-slate-900">${escapeHtml(ctx.label)}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(ctx.desc)}</div>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Step 2: Energy Input Mode Selector -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-2">2. How would you like to enter your electricity demand?</label>
                  <div class="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    <button type="button" data-action="set-energy-mode" data-mode="kwh"
                      class="py-1.5 px-2 rounded-lg transition ${cfgState.energyInput.energyInputMode === 'kwh' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}">
                      Monthly kWh
                    </button>
                    <button type="button" data-action="set-energy-mode" data-mode="bill"
                      class="py-1.5 px-2 rounded-lg transition ${cfgState.energyInput.energyInputMode === 'bill' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}">
                      Monthly Bill (${escapeHtml(assumptions.currency)})
                    </button>
                    <button type="button" data-action="set-energy-mode" data-mode="demo_profile"
                      class="py-1.5 px-2 rounded-lg transition ${cfgState.energyInput.energyInputMode === 'demo_profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}">
                      Example Profile
                    </button>
                  </div>

                  ${cfgState.energyInput.energyInputMode === 'kwh' ? `
                    <div class="mt-3 space-y-2">
                      <div class="flex items-center justify-between">
                        <label for="input-monthly-kwh" class="text-xs font-medium text-slate-700">Monthly Electricity Consumption (kWh/month)</label>
                        <span class="text-xs font-mono font-bold text-slate-900">${computed.energy.monthlyKwh} kWh/mo</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <input id="input-monthly-kwh" type="range" min="150" max="5000" step="50" value="${Math.min(5000, Math.max(150, computed.energy.monthlyKwh || 900))}"
                          data-action="input-monthly-kwh" class="w-full accent-amber-500"/>
                        <input id="input-monthly-kwh-num" aria-label="Monthly kWh number" type="number" min="50" max="50000" step="50" value="${computed.energy.monthlyKwh}"
                          data-action="input-monthly-kwh" class="w-24 px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"/>
                      </div>
                      <p class="text-[11px] text-slate-500">Derived daily demand: <strong>${computed.energy.dailyEnergyKwh} kWh/day</strong> (${assumptions.daysInMonth}-day month) → Preliminary target: <strong>${computed.energy.preliminaryDcTargetKw} kW DC</strong>.</p>
                    </div>
                  ` : ''}

                  ${cfgState.energyInput.energyInputMode === 'bill' ? `
                    <div class="mt-3 space-y-3">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label for="input-monthly-bill" class="block text-xs font-medium text-slate-700 mb-1">Monthly Utility Bill (${escapeHtml(assumptions.currency)})</label>
                          <input id="input-monthly-bill" type="number" min="1000" max="5000000" step="1000" value="${cfgState.energyInput.monthlyBillAmount || 42000}"
                            data-action="input-monthly-bill" class="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"/>
                        </div>
                        <div>
                          <label for="input-assumed-tariff" class="block text-xs font-medium text-slate-700 mb-1">Assumed Blended Rate (${escapeHtml(assumptions.currency)}/kWh)</label>
                          <input id="input-assumed-tariff" type="number" min="1" max="5000" step="1" value="${computed.energy.assumedTariffPerKwh}"
                            data-action="input-assumed-tariff" class="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"/>
                        </div>
                      </div>
                      <div class="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                        <strong>Rate Assumption Disclosure:</strong> Dividing ${fmt(computed.energy.rawMonthlyBill)} by ${fmt(computed.energy.assumedTariffPerKwh)}/kWh yields ~<strong>${computed.energy.monthlyKwh} kWh/month</strong> (${computed.energy.dailyEnergyKwh} kWh/day). Fixed charges, peak/off-peak slabs, and taxes can make bill-based estimates approximate.
                      </div>
                    </div>
                  ` : ''}

                  ${cfgState.energyInput.energyInputMode === 'demo_profile' ? `
                    <div class="mt-3 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-2">
                      <div class="font-bold">Illustrative Demonstration Profile Active</div>
                      <p class="text-[11px] text-sky-800">Using sample benchmark for <strong>${escapeHtml(cfgState.projectType)}</strong>: <strong>${computed.energy.monthlyKwh} kWh/month</strong> (${computed.energy.dailyEnergyKwh} kWh/day → ${computed.energy.preliminaryDcTargetKw} kW DC target). Clearly labelled as an example, not a personalized audit.</p>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- STEP 3 & 4: Compare Packages & Fine-Tune 3D System -->
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">Steps 3 &amp; 4</span>
                    <h2 class="text-base font-bold text-slate-900">Compare Packages &amp; Customize Equipment</h2>
                  </div>
                  <span class="text-[11px] text-slate-500">Updates 3D scene live</span>
                </div>

                <!-- 3 Package Comparison Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  ${packages.map(pkg => {
                    const isSelected = cfgState.selectedPackageKey === pkg.key;
                    return `
                      <button type="button" data-action="select-package" data-package-key="${escapeHtml(pkg.key)}"
                        class="p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                        }">
                        <div>
                          <div class="flex items-center justify-between gap-1">
                            <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'}">${escapeHtml(pkg.badge)}</span>
                          </div>
                          <div class="font-bold text-xs text-slate-900 mt-1.5">${escapeHtml(pkg.name)}</div>
                          <p class="text-[11px] text-slate-600 mt-1 line-clamp-3">${escapeHtml(pkg.summary)}</p>
                        </div>
                        <div class="mt-2 pt-2 border-t border-slate-200/70 text-[10px] text-slate-500 font-medium">
                          ${escapeHtml(pkg.warrantyHighlight)}
                        </div>
                      </button>`;
                  }).join('')}
                </div>

                <!-- Equipment & Array Controls -->
                <div class="space-y-3 pt-2">
                  <div>
                    <div class="flex items-center justify-between text-xs mb-1">
                      <label for="cfg-panel-count" class="font-semibold text-slate-700">Solar Panel Count (Bounds: ${assumptions.minPanels}–${assumptions.maxPanels} modules)</label>
                      <span class="font-mono font-bold text-slate-900">${computed.sizing.selectedPanelCount} panels (${computed.sizing.actualDcCapacityKw} kW DC)</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <input id="cfg-panel-count" type="range" min="${assumptions.minPanels}" max="48" step="1" value="${Math.min(48, computed.sizing.selectedPanelCount)}"
                        data-action="change-panel-count" class="w-full accent-amber-500"/>
                      <input id="cfg-panel-count-num" aria-label="Panel count number" type="number" min="${assumptions.minPanels}" max="${assumptions.maxPanels}" value="${computed.sizing.selectedPanelCount}"
                        data-action="change-panel-count" class="w-20 px-2 py-1 text-xs font-mono border border-slate-300 rounded-lg"/>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label for="cfg-panel-product" class="block text-xs font-semibold text-slate-700 mb-1">Solar Module Model</label>
                      <select id="cfg-panel-product" data-action="change-panel-product" class="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white">
                        ${activePanels.map(p => `
                          <option value="${escapeHtml(p.id)}" ${computed.panelProduct && computed.panelProduct.id === p.id ? 'selected' : ''}>
                            ${escapeHtml(p.name)} (${p.wattage}W — ${fmt(p.customerPrice)})
                          </option>
                        `).join('')}
                      </select>
                    </div>
                    <div>
                      <label for="cfg-inverter-product" class="block text-xs font-semibold text-slate-700 mb-1">Inverter Model</label>
                      <select id="cfg-inverter-product" data-action="change-inverter-product" class="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white">
                        ${activeInverters.map(p => `
                          <option value="${escapeHtml(p.id)}" ${computed.inverterProduct && computed.inverterProduct.id === p.id ? 'selected' : ''}>
                            ${escapeHtml(p.name)} (${p.acCapacityKw}kW — ${fmt(p.customerPrice)})
                          </option>
                        `).join('')}
                      </select>
                    </div>
                  </div>

                  <!-- Battery Backup Toggle & Controls -->
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <label for="cfg-include-battery" class="text-xs font-bold text-slate-900">Include LiFePO4 Battery Backup Storage</label>
                        <p class="text-[11px] text-slate-500">Adds wall/stack battery units to 3D scene and backup sizing estimator</p>
                      </div>
                      <input id="cfg-include-battery" type="checkbox" ${computed.includeBattery ? 'checked' : ''}
                        data-action="toggle-include-battery" class="w-4 h-4 accent-amber-500 rounded cursor-pointer"/>
                    </div>

                    ${computed.includeBattery ? `
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <div class="sm:col-span-2">
                          <label for="cfg-battery-product" class="block text-[11px] font-semibold text-slate-700 mb-1">Battery SKU</label>
                          <select id="cfg-battery-product" data-action="change-battery-product" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white">
                            ${activeBatteries.map(b => `
                              <option value="${escapeHtml(b.id)}" ${computed.batteryProduct && computed.batteryProduct.id === b.id ? 'selected' : ''}>
                                ${escapeHtml(b.name)} (${b.capacityKwh} kWh — ${fmt(b.customerPrice)})
                              </option>
                            `).join('')}
                          </select>
                        </div>
                        <div>
                          <label for="cfg-battery-qty" class="block text-[11px] font-semibold text-slate-700 mb-1">Pack Count</label>
                          <input id="cfg-battery-qty" type="number" min="1" max="8" value="${computed.battery.selectedBatteryQuantity}"
                            data-action="change-battery-qty" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"/>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-2.5">
                        <div>
                          <label for="cfg-backup-load" class="block text-[11px] font-medium text-slate-600 mb-1">Essential Load (kW)</label>
                          <input id="cfg-backup-load" type="number" min="0.5" max="15" step="0.2" value="${computed.battery.backupLoadKw}"
                            data-action="change-backup-load" class="w-full px-2.5 py-1 text-xs font-mono border border-slate-300 rounded-lg bg-white"/>
                        </div>
                        <div>
                          <label for="cfg-roof-orient" class="block text-[11px] font-medium text-slate-600 mb-1">Roof Azimuth Preset</label>
                          <select id="cfg-roof-orient" data-action="change-roof-orientation" class="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white">
                            ${['South', 'South-West', 'South-East', 'West'].map(o => `<option value="${o}" ${cfgState.roofOrientation === o ? 'selected' : ''}>${o}</option>`).join('')}
                          </select>
                        </div>
                      </div>
                      <p class="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                        ${escapeHtml(computed.battery.limitationsNote)}
                      </p>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- STEP 5: Transparent Itemized Preliminary Estimate & Assumptions -->
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">Step 5</span>
                    <h2 class="text-base font-bold text-slate-900">Transparent Itemized Preliminary Estimate</h2>
                  </div>
                  <span class="text-[11px] font-medium text-slate-500">As of ${new Date().toISOString().slice(0, 10)}</span>
                </div>

                <!-- Line Items Table -->
                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr class="border-b border-slate-200 text-slate-500">
                        <th class="py-2 pr-2 font-semibold">Component / Service</th>
                        <th class="py-2 px-2 font-semibold text-right">Qty</th>
                        <th class="py-2 pl-2 font-semibold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      ${computed.financials.lineItems.map(li => `
                        <tr>
                          <td class="py-2 pr-2">
                            <div class="font-semibold text-slate-900">${escapeHtml(li.name)}</div>
                            <div class="text-[11px] text-slate-500">${escapeHtml(li.description)}</div>
                          </td>
                          <td class="py-2 px-2 text-right font-mono text-slate-700">${li.quantity}</td>
                          <td class="py-2 pl-2 text-right font-mono font-semibold text-slate-900">${fmt(li.lineTotal)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>

                <!-- Subtotals & Grand Total -->
                <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div class="flex justify-between text-slate-600">
                    <span>Equipment Subtotal:</span>
                    <span class="font-mono font-semibold text-slate-900">${fmt(computed.financials.equipmentSubtotal)}</span>
                  </div>
                  <div class="flex justify-between text-slate-600">
                    <span>Installation &amp; Labor Allowance:</span>
                    <span class="font-mono font-semibold text-slate-900">${fmt(computed.financials.installationLabor)}</span>
                  </div>
                  ${computed.financials.discountAmount > 0 ? `
                    <div class="flex justify-between text-emerald-700">
                      <span>Discount (${computed.financials.discountPercent}% — applied ${computed.financials.discountTiming === 'before_tax' ? 'before tax' : 'after tax'}):</span>
                      <span class="font-mono font-semibold">-${fmt(computed.financials.discountAmount)}</span>
                    </div>
                  ` : ''}
                  <div class="flex justify-between text-slate-600">
                    <span>Configured Tax (${computed.financials.taxRatePercent}% illustrative):</span>
                    <span class="font-mono font-semibold text-slate-900">${fmt(computed.financials.taxAmount)}</span>
                  </div>
                  <div class="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span class="font-bold text-slate-900 text-sm">Preliminary Grand Total (${escapeHtml(assumptions.currency)}):</span>
                    <span class="font-mono font-extrabold text-lg text-amber-600">${fmt(computed.financials.grandTotal)}</span>
                  </div>
                </div>

                <!-- Illustrative Payback & "What this estimate assumes" Panel -->
                ${computed.payback.available ? `
                  <div class="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-xs space-y-1">
                    <div class="flex justify-between font-semibold text-sky-950">
                      <span>Illustrative Bill Offset &amp; Simple Payback:</span>
                      <span>~${computed.payback.illustrativePaybackYears} Years</span>
                    </div>
                    <p class="text-[11px] text-sky-800">
                      Estimated monthly value: <strong>${fmt(computed.payback.estimatedMonthlyValue)}/mo</strong> (assumes ${Math.round(computed.payback.selfConsumptionFraction * 100)}% self-consumption at ${fmt(computed.payback.assumedTariffPerKwh)}/kWh and ${fmt(computed.payback.exportCreditPerKwh)}/kWh export credit). ${escapeHtml(computed.payback.disclaimer)}
                    </p>
                  </div>
                ` : ''}

                <details class="group rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs">
                  <summary class="font-bold text-slate-800 cursor-pointer flex items-center justify-between">
                    <span>What this preliminary estimate assumes (Click to inspect)</span>
                    <span class="text-slate-400 group-open:rotate-180 transition">▼</span>
                  </summary>
                  <div class="mt-2.5 pt-2.5 border-t border-slate-200 space-y-1 text-[11px] text-slate-600">
                    <div>• <strong>Status:</strong> Preliminary estimate — subject to site assessment and professional design.</div>
                    <div>• <strong>Solar Yield Formula:</strong> Capacity (${computed.sizing.actualDcCapacityKw} kW) × ${assumptions.peakSunHoursPerDay} peak sun-hours/day × ${assumptions.performanceFactor} performance factor.</div>
                    <div>• <strong>Battery Formula:</strong> Load (${computed.battery.backupLoadKw} kW) × Runtime / (${assumptions.usableDodFraction} DoD × ${assumptions.batteryEfficiencyFraction} efficiency).</div>
                    <div>• <strong>Exclusions:</strong> Civil structural work, net-metering statutory fee, and cable runs beyond standard allowance.</div>
                  </div>
                </details>
              </div>

              <!-- STEP 6: Request a Formal Quote & Site Survey -->
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">Step 6</span>
                  <h2 class="text-base font-bold text-slate-900">${escapeHtml(org.publicCtaText || 'Request Site Assessment & Formal Quote')}</h2>
                  <p class="text-xs text-slate-500 mt-0.5">Saves your 3D configuration snapshot and creates an enquiry directly in the company workspace.</p>
                </div>

                <form id="quote-request-form" class="space-y-3" novalidate>
                  <div>
                    <label for="q-name" class="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input id="q-name" name="contactName" type="text" required placeholder="e.g. Tariq Mehmood" value="${escapeHtml(cfgState.quoteForm.contactName || '')}"
                      class="w-full px-3 py-2 text-xs border ${cfgState.quoteErrors.contactName ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'} rounded-lg"/>
                    ${cfgState.quoteErrors.contactName ? `<p class="text-[11px] text-rose-600 mt-1">${escapeHtml(cfgState.quoteErrors.contactName)}</p>` : ''}
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label for="q-email" class="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input id="q-email" name="email" type="email" placeholder="name@example.com" value="${escapeHtml(cfgState.quoteForm.email || '')}"
                        class="w-full px-3 py-2 text-xs border ${cfgState.quoteErrors.email || cfgState.quoteErrors.contact ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'} rounded-lg"/>
                      ${cfgState.quoteErrors.email ? `<p class="text-[11px] text-rose-600 mt-1">${escapeHtml(cfgState.quoteErrors.email)}</p>` : ''}
                    </div>
                    <div>
                      <label for="q-phone" class="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                      <input id="q-phone" name="phone" type="tel" placeholder="+92 300 5550199" value="${escapeHtml(cfgState.quoteForm.phone || '')}"
                        class="w-full px-3 py-2 text-xs border ${cfgState.quoteErrors.phone || cfgState.quoteErrors.contact ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'} rounded-lg"/>
                      ${cfgState.quoteErrors.phone ? `<p class="text-[11px] text-rose-600 mt-1">${escapeHtml(cfgState.quoteErrors.phone)}</p>` : ''}
                    </div>
                  </div>
                  ${cfgState.quoteErrors.contact ? `<p class="text-[11px] text-rose-600">${escapeHtml(cfgState.quoteErrors.contact)}</p>` : ''}

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label for="q-preferred" class="block text-xs font-semibold text-slate-700 mb-1">Preferred Contact Method</label>
                      <select id="q-preferred" name="preferredContactMethod" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white">
                        <option value="whatsapp" ${cfgState.quoteForm.preferredContactMethod === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                        <option value="phone" ${cfgState.quoteForm.preferredContactMethod === 'phone' ? 'selected' : ''}>Phone Call</option>
                        <option value="email" ${cfgState.quoteForm.preferredContactMethod === 'email' ? 'selected' : ''}>Email</option>
                      </select>
                    </div>
                    <div>
                      <label for="q-city" class="block text-xs font-semibold text-slate-700 mb-1">City / Neighbourhood *</label>
                      <input id="q-city" name="city" type="text" required placeholder="e.g. F-8, Islamabad" value="${escapeHtml(cfgState.quoteForm.city || '')}"
                        class="w-full px-3 py-2 text-xs border ${cfgState.quoteErrors.city ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'} rounded-lg"/>
                      ${cfgState.quoteErrors.city ? `<p class="text-[11px] text-rose-600 mt-1">${escapeHtml(cfgState.quoteErrors.city)}</p>` : ''}
                    </div>
                  </div>

                  <div>
                    <label for="q-notes" class="block text-xs font-semibold text-slate-700 mb-1">Optional Roof / Site Notes</label>
                    <textarea id="q-notes" name="notes" rows="2" placeholder="e.g. Flat concrete roof, 3-phase meter installed, prefer morning call..."
                      class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg">${escapeHtml(cfgState.quoteForm.notes || '')}</textarea>
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 border ${cfgState.quoteErrors.consentAccepted ? 'border-rose-500' : 'border-slate-200'}">
                    <label class="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                      <input id="q-consent" name="consentAccepted" type="checkbox" ${cfgState.quoteForm.consentAccepted ? 'checked' : ''} class="mt-0.5 accent-amber-500 rounded"/>
                      <span>${escapeHtml(org.consentCopy)}</span>
                    </label>
                    ${cfgState.quoteErrors.consentAccepted ? `<p class="text-[11px] text-rose-600 mt-1">${escapeHtml(cfgState.quoteErrors.consentAccepted)}</p>` : ''}
                  </div>

                  <div class="flex flex-wrap items-center gap-2.5 pt-1">
                    <button type="submit" class="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition">
                      Submit Quote Request &amp; Save Configuration
                    </button>
                    <button type="button" data-action="fill-sample-customer" class="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300">
                      Auto-Fill Demo Customer
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </main>
      </div>
    `;
  }

  /**
   * Render Public / Controlled Read-Only Share & Print View (Route: /quote/:shareToken)
   */
  function renderShareQuotePage(app, shareToken) {
    const org = app.store.getOrganization();
    const cfg = app.store.getConfigurationByShareToken(shareToken) || app.store.getConfigurations()[0];
    if (!cfg) {
      return `
        <div class="min-h-screen flex items-center justify-center bg-slate-100 p-6">
          <div class="bg-white p-8 rounded-2xl border border-slate-200 max-w-md text-center space-y-4">
            <h1 class="text-xl font-bold text-slate-900">Configuration Share Token Not Found</h1>
            <p class="text-xs text-slate-600">This share link may have expired or been reset.</p>
            <button type="button" data-action="nav" data-route="/configure" class="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">Open 3D Configurator</button>
          </div>
        </div>`;
    }

    const fmt = (v) => window.HelioEstimator.formatMoney(v, cfg.currency);

    return `
      <div class="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
        <div class="max-w-4xl mx-auto space-y-4">
          <!-- Non-Print Action Bar -->
          <div class="no-print bg-slate-900 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2 text-xs">
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">Read-Only Share Token</span>
              <span class="font-mono text-slate-300">/quote/${escapeHtml(cfg.shareToken)}</span>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" data-action="print-page" class="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
                Print / Save as PDF
              </button>
              <button type="button" data-action="load-config-into-studio" data-config-id="${escapeHtml(cfg.id)}" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold">
                Open in 3D Configurator
              </button>
              <button type="button" data-action="nav" data-route="/app/configurations" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold">
                Back to Workspace
              </button>
            </div>
          </div>

          <!-- Printable Configuration Sheet -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div class="flex items-center gap-3">
                ${renderBrandMark(org)}
                <div>
                  <h1 class="text-xl font-bold text-slate-900">${escapeHtml(org.name)}</h1>
                  <p class="text-xs text-slate-500">${escapeHtml(org.contactEmail)} • ${escapeHtml(org.contactPhone)}</p>
                </div>
              </div>
              <div class="sm:text-right">
                <span class="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Preliminary Configuration Snapshot</span>
                <div class="text-xs font-mono text-slate-600 mt-1">Ref: ${escapeHtml(cfg.reference)} • Created: ${escapeHtml(cfg.createdAt.slice(0, 10))}</div>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <div class="text-slate-500">System Capacity</div>
                <div class="font-bold text-base text-slate-900">${cfg.computed.sizing.actualDcCapacityKw} kW DC</div>
                <div class="text-slate-500">${cfg.computed.sizing.selectedPanelCount} × ${cfg.computed.sizing.panelWattage}W Modules</div>
              </div>
              <div>
                <div class="text-slate-500">Inverter Sizing</div>
                <div class="font-bold text-base text-slate-900">${cfg.computed.sizing.totalInverterAcKw} kW AC</div>
                <div class="text-slate-500">DC/AC Ratio: ${cfg.computed.sizing.dcAcRatio}</div>
              </div>
              <div>
                <div class="text-slate-500">Battery Storage</div>
                <div class="font-bold text-base text-emerald-700">${cfg.includeBattery ? cfg.computed.battery.totalNominalCapacityKwh + ' kWh' : 'None'}</div>
                <div class="text-slate-500">${cfg.includeBattery ? `~${cfg.computed.battery.estimatedRuntimeHours} hrs @ ${cfg.computed.battery.backupLoadKw} kW` : 'Grid-Tied'}</div>
              </div>
              <div>
                <div class="text-slate-500">Preliminary Total</div>
                <div class="font-bold text-base text-amber-600">${fmt(cfg.computed.financials.grandTotal)}</div>
                <div class="text-slate-500">Illustrative Estimate</div>
              </div>
            </div>

            <div>
              <h2 class="text-sm font-bold text-slate-900 mb-2">Itemized Bill of Materials &amp; Preliminary Pricing</h2>
              <table class="w-full text-xs border-collapse">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500 text-left">
                    <th class="py-2">SKU</th>
                    <th class="py-2">Item &amp; Specification</th>
                    <th class="py-2 text-right">Qty</th>
                    <th class="py-2 text-right">Unit Price</th>
                    <th class="py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${cfg.computed.financials.lineItems.map(li => `
                    <tr>
                      <td class="py-2.5 font-mono text-slate-500">${escapeHtml(li.sku)}</td>
                      <td class="py-2.5">
                        <div class="font-semibold text-slate-900">${escapeHtml(li.name)}</div>
                        <div class="text-[11px] text-slate-500">${escapeHtml(li.description)} • ${escapeHtml(li.warrantyText)}</div>
                      </td>
                      <td class="py-2.5 text-right font-mono">${li.quantity}</td>
                      <td class="py-2.5 text-right font-mono">${fmt(li.unitPrice)}</td>
                      <td class="py-2.5 text-right font-mono font-semibold">${fmt(li.lineTotal)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
              <div class="font-bold">Important Engineering &amp; Commercial Disclaimer</div>
              <p>${escapeHtml(cfg.disclaimerSnapshot)}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return {
    escapeHtml,
    renderBrandMark,
    renderLandingPage,
    renderConfiguratorPage,
    renderShareQuotePage
  };
});
