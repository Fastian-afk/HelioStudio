/**
 * HelioStudio — Main Application Controller, Router, Event Delegation,
 * Chart.js Integration, 3D Scene Lifecycle, In-Page Modals & Toast Feedback
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HelioApp = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function initHelioStudioApp() {
    const store = window.HelioStore.createStore({ useBrowserStorage: true });

    const app = {
      store,
      currentRoute: '/',
      activeSceneController: null,
      activeCharts: [],
      configuratorState: {
        activeStep: 1,
        projectType: 'home_backup',
        selectedPackageKey: 'balanced',
        roofOrientation: 'South',
        roofPitchDeg: 22,
        energyInput: {
          energyInputMode: 'kwh',
          monthlyKwh: 950,
          monthlyBillAmount: 42000,
          customTariffPerKwh: 45,
          demoProfileKey: 'home_backup'
        },
        panelProductId: 'prod_panel_585',
        inverterProductId: 'prod_inv_8kw_hyb',
        batteryProductId: 'prod_bat_5kwh',
        includeBattery: true,
        manualPanelCount: 14,
        manualBatteryQuantity: 1,
        backupLoadKw: 1.8,
        targetRuntimeHours: 4,
        lightingMode: 'day',
        cutawayMode: false,
        use2DMode: false,
        selected3DPart: 'solar_array',
        quoteForm: {
          contactName: '',
          email: '',
          phone: '',
          preferredContactMethod: 'whatsapp',
          city: '',
          notes: '',
          consentAccepted: false
        },
        quoteErrors: {},
        submissionResult: null
      },
      workspaceState: {
        mobileNavOpen: false,
        dashboardRange: 'all',
        leadSearch: '',
        leadStageFilter: 'ALL',
        leadSourceFilter: 'ALL',
        leadViewMode: 'table',
        catalogCategoryFilter: 'ALL',
        editingProduct: null,
        copilotOpen: false,
        copilotOutput: null,
        activeModal: null // 'reset_demo' | 'new_followup' | null
      }
    };

    function showToast(message, type = 'success') {
      const container = document.getElementById('helio-toast-container');
      if (!container) return;
      const el = document.createElement('div');
      const colorCls = type === 'error'
        ? 'bg-rose-900 text-white border-rose-700'
        : (type === 'warning' ? 'bg-amber-900 text-amber-100 border-amber-700' : 'bg-slate-900 text-white border-slate-700');
      el.className = `px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold flex items-center justify-between gap-3 transition-all duration-200 ${colorCls}`;
      el.innerHTML = `
        <span>${window.HelioUIPublic.escapeHtml(message)}</span>
        <button type="button" class="text-slate-400 hover:text-white font-bold">✕</button>
      `;
      el.querySelector('button').addEventListener('click', () => el.remove());
      container.appendChild(el);
      setTimeout(() => {
        if (el.parentNode) el.remove();
      }, 4500);
    }

    function destroyActiveCharts() {
      app.activeCharts.forEach(c => {
        try { c.destroy(); } catch (e) {}
      });
      app.activeCharts = [];
    }

    function disposeActive3DScene() {
      if (app.activeSceneController) {
        try { app.activeSceneController.dispose(); } catch (e) {}
        app.activeSceneController = null;
      }
    }

    function sync3DSceneWithConfigurator() {
      if (!app.activeSceneController) return;
      const computed = app.store.buildConfigurationComputation(app.configuratorState);
      app.activeSceneController.updateConfiguration({
        visiblePanelCount: computed.sizing.visiblePanelCount,
        selectedPanelCount: computed.sizing.selectedPanelCount,
        actualDcCapacityKw: computed.sizing.actualDcCapacityKw,
        panelName: computed.panelProduct ? computed.panelProduct.name : 'Solar Module',
        inverterName: computed.inverterProduct ? computed.inverterProduct.name : 'Inverter',
        batteryName: computed.batteryProduct ? computed.batteryProduct.name : 'LFP Battery',
        includeBattery: computed.includeBattery,
        selectedBatteryQuantity: computed.battery.selectedBatteryQuantity,
        totalNominalCapacityKwh: computed.battery.totalNominalCapacityKwh,
        dcAcRatio: computed.sizing.dcAcRatio,
        projectType: app.configuratorState.projectType,
        roofOrientation: app.configuratorState.roofOrientation,
        lightingMode: app.configuratorState.lightingMode,
        cutawayMode: app.configuratorState.cutawayMode
      });
    }

    function mountChartsIfPresent() {
      destroyActiveCharts();
      if (typeof Chart === 'undefined') return;

      const leads = app.store.getLeads();
      const configs = app.store.getConfigurations();
      const proposals = app.store.getProposals();

      // 1. Dashboard Stages Chart
      const ctxStages = document.getElementById('chart-dashboard-stages');
      if (ctxStages) {
        const stageLabels = ['New', 'Contacted', 'Qualified', 'Proposal Draft', 'Proposal Sent', 'Won', 'Lost'];
        const counts = stageLabels.map(s => leads.filter(l => l.stage === s).length);
        const c1 = new Chart(ctxStages, {
          type: 'bar',
          data: {
            labels: stageLabels,
            datasets: [{
              label: 'Leads Count',
              data: counts,
              backgroundColor: ['#0284c7', '#6366f1', '#d97706', '#9333ea', '#2563eb', '#10b981', '#64748b'],
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
          }
        });
        app.activeCharts.push(c1);
      }

      // 2. Dashboard Packages Chart
      const ctxPkgs = document.getElementById('chart-dashboard-packages');
      if (ctxPkgs) {
        const pkgKeys = ['essential', 'balanced', 'backup_plus'];
        const pkgNames = ['Essential Grid-Tied', 'Balanced Hybrid', 'Backup Plus'];
        const pkgCounts = pkgKeys.map(k => configs.filter(c => c.selectedPackageKey === k).length);
        const c2 = new Chart(ctxPkgs, {
          type: 'doughnut',
          data: {
            labels: pkgNames,
            datasets: [{
              data: pkgCounts,
              backgroundColor: ['#0284c7', '#f59e0b', '#10b981']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
          }
        });
        app.activeCharts.push(c2);
      }

      // 3. Analytics Proposals Chart
      const ctxProp = document.getElementById('chart-analytics-proposals');
      if (ctxProp) {
        const pStatuses = ['Draft', 'In Review', 'Sent', 'Accepted', 'Declined'];
        const pCounts = pStatuses.map(s => proposals.filter(p => p.status === s).length);
        const c3 = new Chart(ctxProp, {
          type: 'bar',
          data: {
            labels: pStatuses,
            datasets: [{
              label: 'Proposals',
              data: pCounts,
              backgroundColor: ['#64748b', '#f59e0b', '#0284c7', '#10b981', '#e11d48'],
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
          }
        });
        app.activeCharts.push(c3);
      }

      // 4. Analytics Sources Chart
      const ctxSrc = document.getElementById('chart-analytics-sources');
      if (ctxSrc) {
        const srcLabels = ['3D Configurator', 'Consultation Tablet', 'Website Direct', 'Referral', 'Partner Agency'];
        const srcCounts = srcLabels.map(s => leads.filter(l => l.source === s).length);
        const c4 = new Chart(ctxSrc, {
          type: 'polarArea',
          data: {
            labels: srcLabels,
            datasets: [{
              data: srcCounts,
              backgroundColor: [
                'rgba(245, 158, 11, 0.75)',
                'rgba(2, 132, 199, 0.75)',
                'rgba(16, 185, 129, 0.75)',
                'rgba(99, 102, 241, 0.75)',
                'rgba(147, 51, 234, 0.75)'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
          }
        });
        app.activeCharts.push(c4);
      }
    }

    function renderActiveModal() {
      const modalRoot = document.getElementById('helio-modal-root');
      if (!modalRoot) return;
      const modalType = app.workspaceState.activeModal;
      if (!modalType) {
        modalRoot.innerHTML = '';
        return;
      }

      if (modalType === 'reset_demo') {
        modalRoot.innerHTML = `
          <div class="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Confirmation Required</span>
                <button type="button" data-action="close-modal" class="text-slate-400 hover:text-slate-700 font-bold">✕</button>
              </div>
              <h3 class="text-lg font-bold text-slate-900">Reset All Seeded Demo Data?</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                This will restore <strong>SunGrid Energy (Sample Demo)</strong> to its deterministic initial state (9 sample leads, 7 configurations, 12 catalog products, 4 proposals, and default PKR assumptions). Any custom leads or edits saved in this browser will be replaced.
              </p>
              <div class="flex items-center justify-end gap-2 pt-2">
                <button type="button" data-action="close-modal" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold">Cancel</button>
                <button type="button" data-action="confirm-reset-demo" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold">Yes, Restore Deterministic Seed Data</button>
              </div>
            </div>
          </div>`;
      } else if (modalType === 'new_followup') {
        const leads = app.store.getLeads();
        const users = app.store.getUsers();
        modalRoot.innerHTML = `
          <div class="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
            <form id="new-followup-form" class="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold text-slate-900">Schedule Follow-Up Reminder</h3>
                <button type="button" data-action="close-modal" class="text-slate-400 hover:text-slate-700 font-bold">✕</button>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input name="title" type="text" required placeholder="e.g. Call customer to confirm roof inspection time" class="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Task Type</label>
                  <select name="type" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    <option value="Follow-Up Call">Follow-Up Call</option>
                    <option value="Site Survey Scheduling">Site Survey Scheduling</option>
                    <option value="Proposal Review Call">Proposal Review Call</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input name="dueAt" type="date" value="2026-10-16" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"/>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Related Lead</label>
                  <select name="leadId" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    ${leads.map(l => `<option value="${l.id}">${window.HelioUIPublic.escapeHtml(l.contactName)} (${l.reference})</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Assigned To</label>
                  <select name="assignedTo" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    ${users.map(u => `<option value="${window.HelioUIPublic.escapeHtml(u.name)}">${window.HelioUIPublic.escapeHtml(u.name)}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button type="button" data-action="close-modal" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">Cancel</button>
                <button type="submit" class="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 font-bold">Save Follow-Up</button>
              </div>
            </form>
          </div>`;
      }
    }

    /**
     * Render the application for the current route
     */
    function renderApp(options = {}) {
      const rootEl = document.getElementById('heliostudio-app-root');
      if (!rootEl) return;

      const route = app.currentRoute || '/';

      // If only updating the right-hand controls of /configure while keeping 3D canvas alive
      if (options.preserve3D && route.startsWith('/configure') && app.activeSceneController) {
        sync3DSceneWithConfigurator();
      }

      disposeActive3DScene();
      destroyActiveCharts();

      if (route === '/' || route === '') {
        rootEl.innerHTML = window.HelioUIPublic.renderLandingPage(app);
        const heroEl = document.getElementById('hero-3d-viewport');
        if (heroEl) {
          app.activeSceneController = window.HelioScene3D.createSolarSceneController(heroEl);
          sync3DSceneWithConfigurator();
        }
      } else if (route.startsWith('/configure')) {
        const parts = route.split('/').filter(Boolean);
        if (parts[1]) {
          const saved = app.store.getConfigurationById(parts[1]);
          if (saved) {
            loadSavedConfigIntoState(saved);
          }
        }
        rootEl.innerHTML = window.HelioUIPublic.renderConfiguratorPage(app);
        const cfgViewport = document.getElementById('configurator-3d-viewport');
        if (cfgViewport) {
          app.activeSceneController = window.HelioScene3D.createSolarSceneController(cfgViewport, {
            onSelectComponent(partKey) {
              app.configuratorState.selected3DPart = partKey;
              renderApp();
            }
          });
          if (app.configuratorState.use2DMode) {
            app.activeSceneController.toggleRenderMode(true);
          }
          sync3DSceneWithConfigurator();
        }
      } else if (route.startsWith('/quote/')) {
        const token = route.replace('/quote/', '').trim();
        rootEl.innerHTML = window.HelioUIPublic.renderShareQuotePage(app, token);
      } else if (route.startsWith('/app')) {
        const parts = route.split('/').filter(Boolean); // ['app', subRoute, paramId]
        const subRoute = parts[1] || 'overview';
        const paramId = parts[2] || null;
        rootEl.innerHTML = window.HelioUIWorkspace.renderWorkspaceShell(app, subRoute, paramId);
        mountChartsIfPresent();
      } else {
        app.currentRoute = '/';
        renderApp();
        return;
      }

      renderActiveModal();
    }

    function loadSavedConfigIntoState(saved) {
      app.configuratorState.projectType = saved.projectType || 'home_backup';
      app.configuratorState.selectedPackageKey = saved.selectedPackageKey || 'balanced';
      app.configuratorState.roofOrientation = saved.roofOrientation || 'South';
      app.configuratorState.energyInput = Object.assign({}, saved.energyInput || { energyInputMode: 'kwh', monthlyKwh: 950 });
      app.configuratorState.panelProductId = saved.panelProductId;
      app.configuratorState.inverterProductId = saved.inverterProductId;
      app.configuratorState.batteryProductId = saved.batteryProductId;
      app.configuratorState.includeBattery = Boolean(saved.includeBattery);
      if (saved.computed && saved.computed.sizing) {
        app.configuratorState.manualPanelCount = saved.computed.sizing.selectedPanelCount;
      }
      if (saved.computed && saved.computed.battery) {
        app.configuratorState.manualBatteryQuantity = saved.computed.battery.selectedBatteryQuantity;
        app.configuratorState.backupLoadKw = saved.computed.battery.backupLoadKw;
      }
    }

    function navigate(route) {
      app.currentRoute = route || '/';
      app.workspaceState.mobileNavOpen = false;
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Global Click Delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');

      if (action === 'nav') {
        e.preventDefault();
        navigate(btn.getAttribute('data-route') || '/');
      } else if (action === 'start-preset-context') {
        app.configuratorState.projectType = btn.getAttribute('data-context') || 'home_backup';
        navigate('/configure');
      } else if (action === 'hero-cam' || action === 'cfg-cam') {
        if (app.activeSceneController) {
          app.activeSceneController.setCameraPreset(btn.getAttribute('data-preset') || 'overview');
        }
      } else if (action === 'hero-light-toggle' || action === 'cfg-toggle-lighting') {
        app.configuratorState.lightingMode = app.configuratorState.lightingMode === 'evening' ? 'day' : 'evening';
        if (app.currentRoute.startsWith('/configure')) {
          renderApp();
        } else {
          sync3DSceneWithConfigurator();
        }
      } else if (action === 'cfg-toggle-cutaway') {
        app.configuratorState.cutawayMode = !app.configuratorState.cutawayMode;
        renderApp();
      } else if (action === 'cfg-render-mode') {
        app.configuratorState.use2DMode = btn.getAttribute('data-mode') === '2d';
        renderApp();
      } else if (action === 'cfg-step') {
        app.configuratorState.activeStep = Number(btn.getAttribute('data-step')) || 1;
        renderApp();
      } else if (action === 'select-project-type') {
        const pt = btn.getAttribute('data-project-type') || 'home';
        app.configuratorState.projectType = pt;
        app.configuratorState.energyInput.demoProfileKey = pt;
        if (pt === 'home') {
          applyPackagePreset('essential');
        } else if (pt === 'small_business') {
          applyPackagePreset('backup_plus');
        } else {
          applyPackagePreset('balanced');
        }
        renderApp();
      } else if (action === 'set-energy-mode') {
        const mode = btn.getAttribute('data-mode') || 'kwh';
        app.configuratorState.energyInput.energyInputMode = mode;
        app.configuratorState.manualPanelCount = null; // Let sizing recalculate from energy demand
        renderApp();
      } else if (action === 'apply-demo-profile') {
        app.configuratorState.energyInput.energyInputMode = 'demo_profile';
        app.configuratorState.energyInput.demoProfileKey = app.configuratorState.projectType;
        app.configuratorState.manualPanelCount = null;
        showToast('Applied illustrative demonstration energy profile.');
        renderApp();
      } else if (action === 'select-package') {
        const pkgKey = btn.getAttribute('data-package-key');
        applyPackagePreset(pkgKey);
        showToast(`Switched to ${pkgKey.toUpperCase()} package preset.`);
        renderApp();
      } else if (action === 'save-config-only') {
        const res = app.store.saveConfigurationSnapshot(app.configuratorState, 'Saved Session');
        if (res.ok) {
          showToast(`Saved configuration ${res.configuration.reference}. Opening read-only share view.`);
          navigate(`/quote/${res.configuration.shareToken}`);
        }
      } else if (action === 'fill-sample-customer') {
        app.configuratorState.quoteForm = {
          contactName: 'Zainab & Omar Mansoor (Sample)',
          email: 'omar.mansoor.sample@example.com',
          phone: '+92 300 5550188',
          preferredContactMethod: 'whatsapp',
          city: 'F-8/3, Islamabad',
          notes: 'South-facing concrete roof, looking for hybrid backup for 3 bedrooms and home office.',
          consentAccepted: true
        };
        app.configuratorState.quoteErrors = {};
        renderApp();
        showToast('Populated sample customer details for quick testing.');
      } else if (action === 'open-lead-in-admin') {
        const lid = btn.getAttribute('data-lead-id');
        navigate(`/app/leads/${lid}`);
      } else if (action === 'open-share-view') {
        const tok = btn.getAttribute('data-token');
        navigate(`/quote/${tok}`);
      } else if (action === 'load-config-into-studio') {
        const cid = btn.getAttribute('data-config-id');
        navigate(`/configure/${cid}`);
      } else if (action === 'print-page') {
        window.print();
      } else if (action === 'toggle-mobile-nav') {
        app.workspaceState.mobileNavOpen = !app.workspaceState.mobileNavOpen;
        renderApp();
      } else if (action === 'toggle-copilot-drawer') {
        app.workspaceState.copilotOpen = !app.workspaceState.copilotOpen;
        renderApp();
      } else if (action === 'copilot-action') {
        const fn = btn.getAttribute('data-copilot-fn');
        if (fn === 'daily_brief') {
          app.workspaceState.copilotOutput = app.store.copilot.generateDailyBrief();
        } else if (fn === 'lead_summary') {
          app.workspaceState.copilotOutput = app.store.copilot.summarizeLead();
        } else if (fn === 'followup_draft') {
          app.workspaceState.copilotOutput = app.store.copilot.draftFollowUpMessage();
        } else if (fn === 'proposal_explain') {
          app.workspaceState.copilotOutput = app.store.copilot.explainProposalForCustomer();
        }
        app.workspaceState.copilotOpen = true;
        renderApp();
      } else if (action === 'copilot-lead-summary') {
        const lid = btn.getAttribute('data-lead-id');
        app.workspaceState.copilotOutput = app.store.copilot.summarizeLead(lid);
        app.workspaceState.copilotOpen = true;
        renderApp();
      } else if (action === 'copilot-explain-proposal') {
        const pid = btn.getAttribute('data-proposal-id');
        app.workspaceState.copilotOutput = app.store.copilot.explainProposalForCustomer(pid);
        app.workspaceState.copilotOpen = true;
        renderApp();
      } else if (action === 'copy-copilot-text') {
        const ta = document.getElementById('copilot-editable-text');
        if (ta) {
          ta.select();
          try {
            document.execCommand('copy');
            showToast('Copied Copilot draft to clipboard.');
          } catch (err) {
            showToast('Text selected — press Ctrl+C / Cmd+C to copy.');
          }
        }
      } else if (action === 'quick-admin-role') {
        app.store.setActiveRole('Owner/Admin');
        showToast('Switched active demo role back to Owner/Admin.');
        renderApp();
      } else if (action === 'lead-view-mode') {
        app.workspaceState.leadViewMode = btn.getAttribute('data-mode') || 'table';
        renderApp();
      } else if (action === 'clear-lead-filters') {
        app.workspaceState.leadSearch = '';
        app.workspaceState.leadStageFilter = 'ALL';
        app.workspaceState.leadSourceFilter = 'ALL';
        renderApp();
      } else if (action === 'create-proposal-from-lead') {
        const lid = btn.getAttribute('data-lead-id');
        const res = app.store.createProposalFromRecord({ leadId: lid });
        if (!res.ok) {
          showToast(res.error, 'error');
        } else {
          showToast(`Created proposal draft ${res.proposal.reference}.`);
          navigate(`/app/proposals/${res.proposal.id}`);
        }
      } else if (action === 'create-proposal-from-config') {
        const cid = btn.getAttribute('data-config-id');
        const res = app.store.createProposalFromRecord({ configurationId: cid });
        if (!res.ok) {
          showToast(res.error, 'error');
        } else {
          showToast(`Created proposal draft ${res.proposal.reference}.`);
          navigate(`/app/proposals/${res.proposal.id}`);
        }
      } else if (action === 'transition-proposal-status') {
        const pid = btn.getAttribute('data-proposal-id');
        const st = btn.getAttribute('data-status');
        const res = app.store.updateProposal(pid, { status: st });
        if (!res.ok) {
          showToast(res.error, 'error');
        } else {
          showToast(`Proposal ${res.proposal.reference} marked as ${st}.`);
          renderApp();
        }
      } else if (action === 'proposal-add-line') {
        const pid = btn.getAttribute('data-proposal-id');
        const prop = app.store.getProposalById(pid);
        const sel = document.getElementById('prop-add-product-select');
        if (prop && sel) {
          const prod = app.store.getProducts({ activeOnly: false }).find(p => p.id === sel.value);
          if (prod) {
            const updatedLines = [...prop.lineItemsSnapshot, {
              id: 'li_' + Date.now(),
              productId: prod.id,
              sku: prod.sku,
              name: prod.name,
              category: prod.category,
              description: prod.description,
              warrantyText: prod.warrantyText,
              quantity: 1,
              unitPrice: prod.customerPrice,
              unitCost: prod.internalUnitCost
            }];
            const res = app.store.updateProposal(pid, { lineItems: updatedLines });
            if (!res.ok) showToast(res.error, 'error');
            else {
              showToast(`Added ${prod.name} to proposal.`);
              renderApp();
            }
          }
        }
      } else if (action === 'proposal-remove-line') {
        const pid = btn.getAttribute('data-proposal-id');
        const idx = Number(btn.getAttribute('data-line-idx'));
        const prop = app.store.getProposalById(pid);
        if (prop && prop.lineItemsSnapshot.length > 1) {
          const updatedLines = prop.lineItemsSnapshot.filter((_, i) => i !== idx);
          const res = app.store.updateProposal(pid, { lineItems: updatedLines });
          if (!res.ok) showToast(res.error, 'error');
          else {
            showToast('Removed line item and recalculated proposal totals.');
            renderApp();
          }
        } else {
          showToast('A proposal must have at least one line item.', 'warning');
        }
      } else if (action === 'catalog-cat-filter') {
        app.workspaceState.catalogCategoryFilter = btn.getAttribute('data-cat') || 'ALL';
        renderApp();
      } else if (action === 'open-product-form') {
        const pid = btn.getAttribute('data-product-id');
        if (pid) {
          app.workspaceState.editingProduct = app.store.getProducts({ activeOnly: false }).find(p => p.id === pid) || {};
        } else {
          app.workspaceState.editingProduct = { category: 'panel', customerPrice: 32000, internalUnitCost: 25500, wattage: 600 };
        }
        renderApp();
      } else if (action === 'close-product-form') {
        app.workspaceState.editingProduct = null;
        renderApp();
      } else if (action === 'toggle-product-archive') {
        const pid = btn.getAttribute('data-product-id');
        const prod = app.store.getProducts({ activeOnly: false }).find(p => p.id === pid);
        if (prod) {
          const res = app.store.saveProduct(Object.assign({}, prod, { active: !prod.active }));
          if (!res.ok) showToast(res.error, 'error');
          else {
            showToast(`${prod.sku} ${res.product.active ? 'restored to active catalog' : 'archived (excluded from new configurations)'}.`);
            renderApp();
          }
        }
      } else if (action === 'toggle-followup') {
        const fid = btn.getAttribute('data-followup-id');
        const res = app.store.toggleFollowUpComplete(fid);
        if (!res.ok) showToast(res.error, 'error');
        else {
          showToast(`Follow-up marked ${res.followUp.status}.`);
          renderApp();
        }
      } else if (action === 'open-new-followup-modal') {
        app.workspaceState.activeModal = 'new_followup';
        renderActiveModal();
      } else if (action === 'open-reset-modal') {
        app.workspaceState.activeModal = 'reset_demo';
        renderActiveModal();
      } else if (action === 'close-modal') {
        app.workspaceState.activeModal = null;
        renderActiveModal();
      } else if (action === 'confirm-reset-demo') {
        app.store.resetToSeedData();
        app.workspaceState.activeModal = null;
        app.configuratorState.submissionResult = null;
        showToast('Restored deterministic seed data for SunGrid Energy.');
        renderApp();
      }
    });

    function applyPackagePreset(pkgKey) {
      const pkg = app.store.getPackages().find(p => p.key === pkgKey);
      if (!pkg) return;
      app.configuratorState.selectedPackageKey = pkg.key;
      app.configuratorState.panelProductId = pkg.panelProductId;
      app.configuratorState.inverterProductId = pkg.inverterProductId;
      app.configuratorState.batteryProductId = pkg.batteryProductId;
      app.configuratorState.includeBattery = Boolean(pkg.includeBattery);
      app.configuratorState.manualPanelCount = null;
      app.configuratorState.manualBatteryQuantity = pkg.defaultBatteryQty || 1;
    }

    // Global Input & Change Delegation
    document.addEventListener('change', (e) => {
      const el = e.target;
      const action = el.getAttribute('data-action');
      if (!action) return;

      if (action === 'input-monthly-kwh') {
        app.configuratorState.energyInput.monthlyKwh = Number(el.value) || 900;
        app.configuratorState.manualPanelCount = null;
        renderApp();
      } else if (action === 'input-monthly-bill') {
        app.configuratorState.energyInput.monthlyBillAmount = Number(el.value) || 42000;
        app.configuratorState.manualPanelCount = null;
        renderApp();
      } else if (action === 'input-assumed-tariff') {
        app.configuratorState.energyInput.customTariffPerKwh = Number(el.value) || 45;
        app.configuratorState.manualPanelCount = null;
        renderApp();
      } else if (action === 'change-panel-count') {
        app.configuratorState.manualPanelCount = Number(el.value) || 14;
        renderApp();
      } else if (action === 'change-panel-product') {
        app.configuratorState.panelProductId = el.value;
        renderApp();
      } else if (action === 'change-inverter-product') {
        app.configuratorState.inverterProductId = el.value;
        renderApp();
      } else if (action === 'toggle-include-battery') {
        app.configuratorState.includeBattery = Boolean(el.checked);
        if (el.checked && !app.configuratorState.batteryProductId) {
          const firstBat = app.store.getProducts({ activeOnly: true, category: 'battery' })[0];
          if (firstBat) app.configuratorState.batteryProductId = firstBat.id;
          app.configuratorState.manualBatteryQuantity = 1;
        }
        renderApp();
      } else if (action === 'change-battery-product') {
        app.configuratorState.batteryProductId = el.value;
        renderApp();
      } else if (action === 'change-battery-qty') {
        app.configuratorState.manualBatteryQuantity = Number(el.value) || 1;
        renderApp();
      } else if (action === 'change-backup-load') {
        app.configuratorState.backupLoadKw = Number(el.value) || 1.8;
        renderApp();
      } else if (action === 'change-roof-orientation') {
        app.configuratorState.roofOrientation = el.value;
        renderApp();
      } else if (action === 'switch-demo-role') {
        const res = app.store.setActiveRole(el.value);
        if (res.ok) {
          showToast(`Simulated role switched to ${res.user.role} (${res.user.name}).`);
          renderApp();
        }
      } else if (action === 'change-dash-range') {
        app.workspaceState.dashboardRange = el.value;
        renderApp();
      } else if (action === 'lead-stage-filter') {
        app.workspaceState.leadStageFilter = el.value;
        renderApp();
      } else if (action === 'lead-source-filter') {
        app.workspaceState.leadSourceFilter = el.value;
        renderApp();
      } else if (action === 'proposal-line-qty' || action === 'proposal-line-price') {
        const pid = el.getAttribute('data-proposal-id');
        const idx = Number(el.getAttribute('data-line-idx'));
        const prop = app.store.getProposalById(pid);
        if (prop && prop.lineItemsSnapshot[idx]) {
          const updatedLines = prop.lineItemsSnapshot.map((item, i) => {
            if (i !== idx) return item;
            return Object.assign({}, item, {
              quantity: action === 'proposal-line-qty' ? Math.max(1, Number(el.value) || 1) : item.quantity,
              unitPrice: action === 'proposal-line-price' ? Math.max(0, Number(el.value) || 0) : item.unitPrice
            });
          });
          const res = app.store.updateProposal(pid, { lineItems: updatedLines });
          if (!res.ok) showToast(res.error, 'error');
          else renderApp();
        }
      }
    });

    // Live search input handler for leads
    document.addEventListener('input', (e) => {
      const el = e.target;
      if (el.getAttribute('data-action') === 'lead-search') {
        app.workspaceState.leadSearch = el.value;
        renderApp();
        const inputAfter = document.getElementById('lead-search-input');
        if (inputAfter) {
          inputAfter.focus();
          inputAfter.setSelectionRange(inputAfter.value.length, inputAfter.value.length);
        }
      }
    });

    // Form Submissions Delegation
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (!form || !form.id) return;
      e.preventDefault();

      if (form.id === 'quote-request-form') {
        const fd = new FormData(form);
        const quoteData = {
          contactName: fd.get('contactName') || '',
          email: fd.get('email') || '',
          phone: fd.get('phone') || '',
          preferredContactMethod: fd.get('preferredContactMethod') || 'whatsapp',
          city: fd.get('city') || '',
          notes: fd.get('notes') || '',
          consentAccepted: form.querySelector('#q-consent') ? form.querySelector('#q-consent').checked : false
        };
        app.configuratorState.quoteForm = quoteData;
        const res = app.store.submitQuoteRequest(app.configuratorState, quoteData);
        if (!res.ok) {
          app.configuratorState.quoteErrors = res.errors || {};
          showToast('Please fix the highlighted validation fields before submitting.', 'error');
          renderApp();
        } else {
          app.configuratorState.quoteErrors = {};
          app.configuratorState.submissionResult = res;
          showToast(`Quote request ${res.lead.reference} saved and linked to ${res.configuration.reference}!`);
          renderApp();
        }
      } else if (form.id === 'lead-update-form') {
        const lid = form.getAttribute('data-lead-id');
        const fd = new FormData(form);
        const res = app.store.updateLead(lid, {
          stage: fd.get('stage'),
          owner: fd.get('owner'),
          lossReason: fd.get('lossReason'),
          nextAction: fd.get('nextAction'),
          notes: fd.get('notes')
        });
        if (!res.ok) showToast(res.error, 'error');
        else {
          showToast(`Saved updates for ${res.lead.reference}.`);
          renderApp();
        }
      } else if (form.id === 'catalog-product-form') {
        const fd = new FormData(form);
        const cat = fd.get('category') || 'panel';
        const specVal = Number(fd.get('specValue')) || 580;
        const res = app.store.saveProduct({
          id: fd.get('id') || undefined,
          sku: fd.get('sku'),
          name: fd.get('name'),
          category: cat,
          customerPrice: Number(fd.get('customerPrice')),
          internalUnitCost: Number(fd.get('internalUnitCost')),
          wattage: cat === 'panel' ? specVal : undefined,
          acCapacityKw: cat === 'inverter' ? specVal : undefined,
          capacityKwh: cat === 'battery' ? specVal : undefined,
          warrantyText: fd.get('warrantyText')
        });
        if (!res.ok) showToast(res.error, 'error');
        else {
          app.workspaceState.editingProduct = null;
          showToast(`Saved catalog product ${res.product.sku}.`);
          renderApp();
        }
      } else if (form.id === 'assumptions-settings-form') {
        const fd = new FormData(form);
        const res = app.store.updateAssumptions({
          currency: fd.get('currency'),
          locale: fd.get('locale'),
          regionLabel: fd.get('regionLabel'),
          peakSunHoursPerDay: Number(fd.get('peakSunHoursPerDay')),
          performanceFactor: Number(fd.get('performanceFactor')),
          assumedTariffPerKwh: Number(fd.get('assumedTariffPerKwh')),
          defaultDiscountPercent: Number(fd.get('defaultDiscountPercent')),
          defaultTaxRatePercent: Number(fd.get('defaultTaxRatePercent')),
          discountTiming: fd.get('discountTiming'),
          maxVisiblePanels: Number(fd.get('maxVisiblePanels')),
          disclaimerText: fd.get('disclaimerText')
        });
        if (!res.ok) showToast(res.error, 'error');
        else {
          showToast('Saved estimator assumptions & currency settings.');
          renderApp();
        }
      } else if (form.id === 'proposal-details-form') {
        const pid = form.getAttribute('data-proposal-id');
        const fd = new FormData(form);
        const res = app.store.updateProposal(pid, {
          otherCharges: Number(fd.get('otherCharges')),
          discountPercent: Number(fd.get('discountPercent')),
          taxRatePercent: Number(fd.get('taxRatePercent')),
          amountPaid: Number(fd.get('amountPaid')),
          title: fd.get('title'),
          expiryDate: fd.get('expiryDate'),
          scopeText: fd.get('scopeText'),
          exclusionsText: fd.get('exclusionsText')
        });
        if (!res.ok) showToast(res.error, 'error');
        else {
          showToast(`Saved draft changes for ${res.proposal.reference}.`);
          renderApp();
        }
      } else if (form.id === 'brand-settings-form') {
        const fd = new FormData(form);
        const res = app.store.updateOrganizationSettings({
          name: fd.get('name'),
          tagline: fd.get('tagline'),
          logoType: fd.get('logoType'),
          contactEmail: fd.get('contactEmail'),
          contactPhone: fd.get('contactPhone'),
          publicCtaText: fd.get('publicCtaText'),
          consentCopy: fd.get('consentCopy')
        });
        if (!res.ok) showToast(res.error, 'error');
        else {
          showToast(`Updated white-label brand settings for ${res.organization.name}.`);
          renderApp();
        }
      } else if (form.id === 'new-followup-form') {
        const fd = new FormData(form);
        const res = app.store.createFollowUp({
          title: fd.get('title'),
          type: fd.get('type'),
          dueAt: (fd.get('dueAt') || '2026-10-16') + 'T15:00:00Z',
          leadId: fd.get('leadId'),
          assignedTo: fd.get('assignedTo')
        });
        if (!res.ok) showToast(res.error, 'error');
        else {
          app.workspaceState.activeModal = null;
          showToast('Scheduled new follow-up task.');
          renderApp();
        }
      }
    });

    renderApp();
    return app;
  }

  return {
    initHelioStudioApp
  };
});
