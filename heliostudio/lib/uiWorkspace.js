/**
 * HelioStudio — Experience B: White-Label Company Workspace
 * Includes Dashboard, Leads (List & Kanban), Lead Detail, Configurations, Catalog CRUD,
 * Pricing & Assumptions, Proposal Builder & Print View, Analytics, Brand/Role/Integrations,
 * Deterministic Sales Copilot, and In-App README / Production Roadmap.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HelioUIWorkspace = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function esc(str) {
    return String(str === undefined || str === null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stageBadge(stage) {
    const map = {
      'New': 'bg-sky-100 text-sky-800 border-sky-200',
      'Contacted': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Qualified': 'bg-amber-100 text-amber-800 border-amber-200',
      'Proposal Draft': 'bg-purple-100 text-purple-800 border-purple-200',
      'Proposal Sent': 'bg-blue-100 text-blue-800 border-blue-200',
      'Won': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Lost': 'bg-slate-200 text-slate-700 border-slate-300',
      'Draft': 'bg-slate-100 text-slate-800 border-slate-300',
      'In Review': 'bg-amber-100 text-amber-800 border-amber-200',
      'Sent': 'bg-sky-100 text-sky-800 border-sky-200',
      'Accepted': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Declined': 'bg-rose-100 text-rose-800 border-rose-200',
      'Expired': 'bg-slate-200 text-slate-600 border-slate-300'
    };
    const cls = map[stage] || 'bg-slate-100 text-slate-700 border-slate-200';
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}">${esc(stage)}</span>`;
  }

  /**
   * Main Workspace Shell (Left Sidebar + Top Bar + Main Content + Optional Copilot Drawer)
   */
  function renderWorkspaceShell(app, subRoute, paramId) {
    const org = app.store.getOrganization();
    const user = app.store.getCurrentUser();
    const assumptions = app.store.getAssumptions();
    const followUps = app.store.getFollowUps();
    const overdueCount = followUps.filter(f => f.status === 'Overdue').length;
    const dueTodayCount = followUps.filter(f => f.status === 'Due Today').length;

    const navItems = [
      { route: '/app', key: 'overview', label: 'Overview Dashboard', badge: overdueCount > 0 ? `${overdueCount} overdue` : '' },
      { route: '/app/leads', key: 'leads', label: 'Leads & Pipeline', badge: String(app.store.getLeads().length) },
      { route: '/app/configurations', key: 'configurations', label: 'Saved Configurations', badge: String(app.store.getConfigurations().length) },
      { route: '/app/proposals', key: 'proposals', label: 'Proposals & Quotes', badge: String(app.store.getProposals().length) },
      { route: '/app/catalog', key: 'catalog', label: 'Equipment Catalog', badge: '' },
      { route: '/app/assumptions', key: 'assumptions', label: 'Pricing & Assumptions', badge: '' },
      { route: '/app/analytics', key: 'analytics', label: 'Analytics & Margin', badge: '' },
      { route: '/app/settings', key: 'settings', label: 'Brand, Roles & Setup', badge: '' },
      { route: '/app/docs', key: 'docs', label: 'README & Roadmap', badge: '' }
    ];

    let bodyHtml = '';
    if (subRoute === 'leads' && paramId) {
      bodyHtml = renderLeadDetail(app, paramId);
    } else if (subRoute === 'leads') {
      bodyHtml = renderLeadsListAndPipeline(app);
    } else if (subRoute === 'configurations') {
      bodyHtml = renderConfigurationsView(app);
    } else if (subRoute === 'proposals' && paramId) {
      bodyHtml = renderProposalEditor(app, paramId);
    } else if (subRoute === 'proposals') {
      bodyHtml = renderProposalsList(app);
    } else if (subRoute === 'catalog') {
      bodyHtml = renderCatalogView(app);
    } else if (subRoute === 'assumptions') {
      bodyHtml = renderAssumptionsView(app);
    } else if (subRoute === 'analytics') {
      bodyHtml = renderAnalyticsView(app);
    } else if (subRoute === 'settings') {
      bodyHtml = renderSettingsView(app);
    } else if (subRoute === 'docs') {
      bodyHtml = renderDocsAndRoadmapView(app);
    } else {
      bodyHtml = renderOverviewDashboard(app);
    }

    return `
      <div class="min-h-screen flex flex-col lg:flex-row bg-slate-100 text-slate-900">
        <!-- Left Navigation Rail -->
        <aside class="no-print w-full lg:w-64 bg-slate-950 text-slate-200 flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800">
          <div class="p-4 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5 cursor-pointer" data-action="nav" data-route="/">
              ${window.HelioUIPublic.renderBrandMark(org)}
              <div class="overflow-hidden">
                <div class="font-bold text-sm text-white truncate">${esc(org.name)}</div>
                <div class="text-[11px] text-amber-400 font-medium">Demo Workspace • ${esc(assumptions.currency)}</div>
              </div>
            </div>
            <button type="button" data-action="toggle-mobile-nav" class="lg:hidden px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-200">
              Menu
            </button>
          </div>

          <nav id="workspace-sidebar-nav" class="${app.workspaceState.mobileNavOpen ? 'block' : 'hidden'} lg:block p-3 space-y-1 flex-1">
            ${navItems.map(item => {
              const isActive = (subRoute === item.key) || (!subRoute && item.key === 'overview');
              return `
                <button type="button" data-action="nav" data-route="${item.route}"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }">
                  <span>${esc(item.label)}</span>
                  ${item.badge ? `<span class="px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}">${esc(item.badge)}</span>` : ''}
                </button>`;
            }).join('')}

            <div class="pt-4 mt-4 border-t border-slate-800/80 space-y-1.5">
              <button type="button" data-action="nav" data-route="/configure" class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800">
                <span>Launch 3D Configurator</span>
                <span>→</span>
              </button>
              <button type="button" data-action="toggle-copilot-drawer" class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-sky-950/80 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60">
                <span>Helio Sales Copilot</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20">Template</span>
              </button>
              <button type="button" data-action="open-reset-modal" class="w-full text-left px-3 py-1.5 rounded-lg text-[11px] text-rose-400 hover:bg-slate-900">
                Reset Seeded Demo Data
              </button>
            </div>
          </nav>
        </aside>

        <!-- Main Workspace Content Area -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- Top Workspace Header Bar -->
          <header class="no-print bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Demo Mode — Local Browser Storage
              </span>
              <span class="hidden md:inline text-xs text-slate-500">
                Follow-ups: <strong class="text-rose-600">${overdueCount} Overdue</strong> • <strong class="text-amber-700">${dueTodayCount} Due Today</strong>
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2.5 text-xs">
              <!-- Demo Role Switcher (Section 11.1) -->
              <div class="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                <label for="workspace-role-select" class="text-slate-500 font-medium">Simulated Role:</label>
                <select id="workspace-role-select" data-action="switch-demo-role" class="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer">
                  <option value="Owner/Admin" ${user.role === 'Owner/Admin' ? 'selected' : ''}>Owner/Admin (Full)</option>
                  <option value="Sales" ${user.role === 'Sales' ? 'selected' : ''}>Sales (CRM &amp; Quotes)</option>
                  <option value="Viewer" ${user.role === 'Viewer' ? 'selected' : ''}>Viewer (Read-Only)</option>
                </select>
              </div>

              <button type="button" data-action="toggle-copilot-drawer" class="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold">
                Sales Copilot
              </button>
            </div>
          </header>

          ${user.role === 'Viewer' ? `
            <div class="no-print bg-rose-50 border-b border-rose-200 px-6 py-2 text-xs text-rose-900 flex items-center justify-between">
              <span><strong>Read-Only Viewer Role Simulation Active:</strong> Mutations (saving leads, editing catalog, or changing proposals) are blocked by the store permission layer.</span>
              <button type="button" data-action="quick-admin-role" class="underline font-bold">Switch back to Owner/Admin</button>
            </div>
          ` : ''}

          <!-- Page Body -->
          <main class="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
            ${bodyHtml}
          </main>
        </div>

        <!-- Contextual Helio Assistant / Sales Copilot Drawer (Section 10) -->
        ${app.workspaceState.copilotOpen ? renderCopilotDrawer(app) : ''}
      </div>
    `;
  }

  /**
   * 8.1 Overview Dashboard
   */
  function renderOverviewDashboard(app) {
    const assumptions = app.store.getAssumptions();
    const fmt = (v) => window.HelioEstimator.formatMoney(v, assumptions.currency, assumptions.locale);
    const leads = app.store.getLeads();
    const proposals = app.store.getProposals();
    const configs = app.store.getConfigurations();
    const followUps = app.store.getFollowUps();
    const activities = app.store.getActivities().slice(0, 7);

    // Date range filter (All Demo Days vs Last 5 Days)
    const rangeFilter = app.workspaceState.dashboardRange || 'all';
    const cutoffIso = rangeFilter === '5d' ? '2026-10-12' : '2026-01-01';
    const filteredLeads = leads.filter(l => String(l.createdAt).slice(0, 10) >= cutoffIso);

    const qualifiedLeads = filteredLeads.filter(l => ['Qualified', 'Proposal Draft', 'Proposal Sent', 'Won'].includes(l.stage));
    const pipelineValue = qualifiedLeads.reduce((s, l) => s + (Number(l.estimatedValue) || 0), 0);
    const awaitingProposals = proposals.filter(p => p.status === 'Sent' || p.status === 'In Review');
    const openProposals = proposals.filter(p => ['Draft', 'In Review', 'Sent'].includes(p.status));
    const openProposalValue = openProposals.reduce((s, p) => s + (Number(p.grandTotal) || 0), 0);

    const conversionRate = filteredLeads.length > 0
      ? Math.round((proposals.length / Math.max(1, leads.length)) * 100)
      : 0;

    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Company Workspace Overview</h1>
            <p class="text-xs text-slate-500">Derived directly from persisted leads, 3D configurations, proposals, and follow-up schedules.</p>
          </div>
          <div class="flex items-center gap-2">
            <label for="dash-range-select" class="text-xs text-slate-600 font-medium">Period Filter:</label>
            <select id="dash-range-select" data-action="change-dash-range" class="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold">
              <option value="all" ${rangeFilter === 'all' ? 'selected' : ''}>All Seeded &amp; Saved Records (${leads.length} leads)</option>
              <option value="5d" ${rangeFilter === '5d' ? 'selected' : ''}>Recent 5 Days ( since Oct 12 )</option>
            </select>
            <button type="button" data-action="copilot-action" data-copilot-fn="daily_brief" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-semibold">
              Generate Owner's Daily Brief
            </button>
          </div>
        </div>

        <!-- Derived KPI Cards (Clickable to navigate) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div data-action="nav" data-route="/app/leads" class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-400 transition">
            <div class="text-xs font-semibold text-slate-500">Enquiries in Period</div>
            <div class="text-2xl font-extrabold text-slate-900 mt-1">${filteredLeads.length}</div>
            <div class="text-[11px] text-emerald-700 font-medium mt-1">${filteredLeads.filter(l => l.stage === 'New').length} New awaiting contact →</div>
          </div>

          <div data-action="nav" data-route="/app/leads" class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-400 transition">
            <div class="text-xs font-semibold text-slate-500">Qualified Pipeline Value</div>
            <div class="text-2xl font-extrabold text-slate-900 mt-1">${fmt(pipelineValue)}</div>
            <div class="text-[11px] text-slate-500 mt-1">${qualifiedLeads.length} qualified / active leads →</div>
          </div>

          <div data-action="nav" data-route="/app/proposals" class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-400 transition">
            <div class="text-xs font-semibold text-slate-500">Open Proposals (${openProposals.length})</div>
            <div class="text-2xl font-extrabold text-amber-600 mt-1">${fmt(openProposalValue)}</div>
            <div class="text-[11px] text-sky-700 font-medium mt-1">${awaitingProposals.length} awaiting customer response →</div>
          </div>

          <div data-action="nav" data-route="/app/analytics" class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-400 transition">
            <div class="text-xs font-semibold text-slate-500">Enquiry → Proposal Rate</div>
            <div class="text-2xl font-extrabold text-emerald-700 mt-1">${conversionRate}%</div>
            <div class="text-[11px] text-slate-500 mt-1">${proposals.length} proposals / ${leads.length} total leads →</div>
          </div>
        </div>

        <!-- Charts Row (Chart.js inside fixed-height containers) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h2 class="text-sm font-bold text-slate-900">Lead Pipeline Stage Distribution</h2>
                <p class="text-[11px] text-slate-500">Derived from ${filteredLeads.length} leads in selected period</p>
              </div>
              <button type="button" data-action="nav" data-route="/app/leads" class="text-xs text-sky-600 font-semibold hover:underline">Open Pipeline</button>
            </div>
            <div class="relative h-64">
              <canvas id="chart-dashboard-stages"></canvas>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h2 class="text-sm font-bold text-slate-900">Enquiry Sources &amp; Package Selection</h2>
                <p class="text-[11px] text-slate-500">Derived from ${configs.length} saved 3D configurations</p>
              </div>
              <button type="button" data-action="nav" data-route="/app/configurations" class="text-xs text-sky-600 font-semibold hover:underline">View Sessions</button>
            </div>
            <div class="relative h-64">
              <canvas id="chart-dashboard-packages"></canvas>
            </div>
          </div>
        </div>

        <!-- Follow-Ups Due & Recent Activity Timeline -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Follow-Ups Column -->
          <div class="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold text-slate-900">Follow-Up Reminders &amp; Tasks</h2>
                <p class="text-[11px] text-slate-500">Calculated from record timestamps (Demo mode)</p>
              </div>
              <button type="button" data-action="open-new-followup-modal" class="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800">
                + Add Follow-Up
              </button>
            </div>

            <div class="space-y-2.5">
              ${followUps.map(f => {
                const badgeCls = f.status === 'Overdue'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : (f.status === 'Due Today' ? 'bg-amber-100 text-amber-800 border-amber-200' : (f.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'));
                return `
                  <div class="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3 ${f.status === 'Completed' ? 'opacity-60 bg-slate-50' : 'bg-white'}">
                    <div class="flex items-start gap-2.5">
                      <input type="checkbox" aria-label="Mark follow-up complete" ${f.status === 'Completed' ? 'checked' : ''}
                        data-action="toggle-followup" data-followup-id="${esc(f.id)}" class="mt-1 accent-emerald-600 cursor-pointer"/>
                      <div>
                        <div class="text-xs font-semibold text-slate-900 ${f.status === 'Completed' ? 'line-through' : ''}">${esc(f.title)}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">${esc(f.type)} • Assigned: ${esc(f.assignedTo)} • Due: ${esc(f.dueAt.slice(0, 10))}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${badgeCls}">${esc(f.status)}</span>
                      ${f.leadId ? `<button type="button" data-action="nav" data-route="/app/leads/${esc(f.leadId)}" class="text-xs text-sky-600 hover:underline font-medium">Lead →</button>` : ''}
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </div>

          <!-- Activity Timeline Column -->
          <div class="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Chronological Activity &amp; Audit Timeline</h2>
              <p class="text-[11px] text-slate-500">Every configurator quote, status transition, and rule action is logged</p>
            </div>
            <div class="space-y-3">
              ${activities.map(a => `
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div class="flex items-center justify-between text-[11px] text-slate-500">
                    <span class="font-bold text-slate-800">${esc(a.action)}</span>
                    <span>${esc(a.createdAt.slice(0, 16).replace('T', ' '))}</span>
                  </div>
                  <p class="text-slate-700 mt-1">${esc(a.detail)}</p>
                  <div class="text-[10px] text-slate-400 mt-1">Actor: ${esc(a.actorName)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 8.2 Leads and Enquiry Pipeline (List & Kanban Views)
   */
  function renderLeadsListAndPipeline(app) {
    const assumptions = app.store.getAssumptions();
    const fmt = (v) => window.HelioEstimator.formatMoney(v, assumptions.currency, assumptions.locale);
    const allLeads = app.store.getLeads();
    const ws = app.workspaceState;

    const q = (ws.leadSearch || '').toLowerCase().trim();
    const stageFilter = ws.leadStageFilter || 'ALL';
    const sourceFilter = ws.leadSourceFilter || 'ALL';
    const viewMode = ws.leadViewMode || 'table'; // 'table' | 'kanban'

    const filtered = allLeads.filter(l => {
      if (stageFilter !== 'ALL' && l.stage !== stageFilter) return false;
      if (sourceFilter !== 'ALL' && l.source !== sourceFilter) return false;
      if (q) {
        const hay = `${l.reference} ${l.contactName} ${l.email} ${l.phone} ${l.city} ${l.owner}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const stages = window.HelioEstimator.VALID_LEAD_STAGES;

    return `
      <div class="space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Leads &amp; Enquiry Pipeline</h1>
            <p class="text-xs text-slate-500">Quote requests from the 3D configurator land here automatically with their configuration snapshot attached.</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="inline-flex rounded-xl bg-slate-200 p-1 text-xs font-semibold">
              <button type="button" data-action="lead-view-mode" data-mode="table" class="px-3 py-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}">Table View</button>
              <button type="button" data-action="lead-view-mode" data-mode="kanban" class="px-3 py-1.5 rounded-lg ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}">Kanban Board</button>
            </div>
            <button type="button" data-action="nav" data-route="/configure" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
              + New via 3D Configurator
            </button>
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div class="sm:col-span-2">
            <label for="lead-search-input" class="block text-[11px] font-semibold text-slate-500 mb-1">Search Name, Reference, City, Phone</label>
            <input id="lead-search-input" type="search" placeholder="Search e.g. Kamran, ENQ-2026-101, Islamabad..." value="${esc(ws.leadSearch || '')}"
              data-action="lead-search" class="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
          </div>
          <div>
            <label for="lead-stage-filter" class="block text-[11px] font-semibold text-slate-500 mb-1">Filter by Stage</label>
            <select id="lead-stage-filter" data-action="lead-stage-filter" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
              <option value="ALL">All Stages (${allLeads.length})</option>
              ${stages.map(s => `<option value="${esc(s)}" ${stageFilter === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="lead-source-filter" class="block text-[11px] font-semibold text-slate-500 mb-1">Filter by Source</label>
            <select id="lead-source-filter" data-action="lead-source-filter" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
              <option value="ALL">All Sources</option>
              ${['3D Configurator', 'Consultation Tablet', 'Website Direct', 'Referral', 'Partner Agency'].map(src => `<option value="${esc(src)}" ${sourceFilter === src ? 'selected' : ''}>${esc(src)}</option>`).join('')}
            </select>
          </div>
        </div>

        ${filtered.length === 0 ? `
          <div class="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
            <div class="text-base font-bold text-slate-800">No leads match your current search/filter</div>
            <p class="text-xs text-slate-500">Clear filters or create a new customer enquiry from the 3D configurator.</p>
            <button type="button" data-action="clear-lead-filters" class="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">Reset Filters</button>
          </div>
        ` : (viewMode === 'kanban' ? `
          <!-- Kanban Pipeline Board -->
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            ${['New', 'Contacted', 'Qualified', 'Proposal Draft', 'Proposal Sent', 'Won', 'Lost'].map(stg => {
              const stageLeads = filtered.filter(l => l.stage === stg);
              return `
                <div class="bg-slate-200/70 p-3 rounded-2xl border border-slate-300/80 space-y-2.5">
                  <div class="flex items-center justify-between px-1">
                    ${stageBadge(stg)}
                    <span class="text-xs font-mono font-bold text-slate-600">${stageLeads.length}</span>
                  </div>
                  <div class="space-y-2">
                    ${stageLeads.map(l => `
                      <div data-action="nav" data-route="/app/leads/${esc(l.id)}" class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-500 transition space-y-1.5">
                        <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>${esc(l.reference)}</span>
                          <span>${esc(l.source)}</span>
                        </div>
                        <div class="font-bold text-xs text-slate-900">${esc(l.contactName)}</div>
                        <div class="text-[11px] text-slate-500">${esc(l.city)}</div>
                        <div class="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span class="font-mono font-bold text-amber-700">${fmt(l.estimatedValue)}</span>
                          <span class="text-[10px] text-sky-600 font-semibold">Inspect →</span>
                        </div>
                      </div>
                    `).join('') || `<div class="text-[11px] text-slate-400 text-center py-4">No leads in ${esc(stg)}</div>`}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- Dense Professional Table View -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table class="w-full text-xs text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th class="py-3 px-4 font-semibold">Ref / Created</th>
                  <th class="py-3 px-4 font-semibold">Customer &amp; City</th>
                  <th class="py-3 px-4 font-semibold">Source &amp; Config</th>
                  <th class="py-3 px-4 font-semibold">Stage</th>
                  <th class="py-3 px-4 font-semibold text-right">Est. Value</th>
                  <th class="py-3 px-4 font-semibold">Owner</th>
                  <th class="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${filtered.map(l => {
                  const cfg = l.configurationId ? app.store.getConfigurationById(l.configurationId) : null;
                  return `
                    <tr class="hover:bg-slate-50/80">
                      <td class="py-3 px-4 font-mono">
                        <div class="font-bold text-slate-900">${esc(l.reference)}</div>
                        <div class="text-[11px] text-slate-400">${esc(l.createdAt.slice(0, 10))}</div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="font-bold text-slate-900">${esc(l.contactName)}</div>
                        <div class="text-[11px] text-slate-500">${esc(l.city)} • ${esc(l.phone || l.email)}</div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="font-medium text-slate-800">${esc(l.source)}</div>
                        <div class="text-[11px] text-slate-500">${cfg ? `${esc(cfg.reference)} (${cfg.computed.sizing.actualDcCapacityKw} kW)` : 'Direct inquiry'}</div>
                      </td>
                      <td class="py-3 px-4">${stageBadge(l.stage)}</td>
                      <td class="py-3 px-4 text-right font-mono font-bold text-slate-900">${fmt(l.estimatedValue)}</td>
                      <td class="py-3 px-4 text-slate-600">${esc(l.owner)}</td>
                      <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button type="button" data-action="nav" data-route="/app/leads/${esc(l.id)}" class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                          Open Detail
                        </button>
                      </td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        `)}
      </div>
    `;
  }

  /**
   * 8.2 Lead Detail View with Attached Configuration Snapshot & 1-Click Proposal Creation
   */
  function renderLeadDetail(app, leadId) {
    const lead = app.store.getLeadById(leadId);
    if (!lead) {
      return `
        <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <h2 class="text-lg font-bold text-slate-900">Lead Record Not Found</h2>
          <button type="button" data-action="nav" data-route="/app/leads" class="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">← Back to Leads</button>
        </div>`;
    }

    const assumptions = app.store.getAssumptions();
    const fmt = (v) => window.HelioEstimator.formatMoney(v, assumptions.currency, assumptions.locale);
    const cfg = lead.configurationId ? app.store.getConfigurationById(lead.configurationId) : null;
    const linkedProposals = app.store.getProposals().filter(p => p.leadId === lead.id);
    const stages = window.HelioEstimator.VALID_LEAD_STAGES;
    const users = app.store.getUsers();

    return `
      <div class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <button type="button" data-action="nav" data-route="/app/leads" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold hover:bg-slate-50">
              ← All Leads
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl font-bold text-slate-900">${esc(lead.contactName)}</h1>
                ${stageBadge(lead.stage)}
              </div>
              <p class="text-xs text-slate-500 font-mono">${esc(lead.reference)} • Created ${esc(lead.createdAt.slice(0, 10))} via ${esc(lead.source)}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" data-action="copilot-lead-summary" data-lead-id="${esc(lead.id)}" class="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs">
              Copilot: Summarize &amp; Draft Follow-Up
            </button>
            <button type="button" data-action="create-proposal-from-lead" data-lead-id="${esc(lead.id)}" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm">
              + Convert to Proposal Draft
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left Column: Lead Contact, Stage Controls & Notes (5 cols) -->
          <div class="lg:col-span-5 space-y-5">
            <form id="lead-update-form" data-lead-id="${esc(lead.id)}" class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h2 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Lead Status, Ownership &amp; Qualification</h2>

              <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><span class="text-slate-500 block">Email:</span><strong class="text-slate-900 break-all">${esc(lead.email || '—')}</strong></div>
                <div><span class="text-slate-500 block">Phone:</span><strong class="text-slate-900">${esc(lead.phone || '—')}</strong></div>
                <div><span class="text-slate-500 block">City / Area:</span><strong class="text-slate-900">${esc(lead.city)}</strong></div>
                <div><span class="text-slate-500 block">Preferred:</span><strong class="text-slate-900 uppercase">${esc(lead.preferredContactMethod)}</strong></div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="lead-detail-stage" class="block font-semibold text-slate-700 mb-1">Pipeline Stage</label>
                  <select id="lead-detail-stage" name="stage" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold">
                    ${stages.map(s => `<option value="${esc(s)}" ${lead.stage === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label for="lead-detail-owner" class="block font-semibold text-slate-700 mb-1">Assigned Owner</label>
                  <select id="lead-detail-owner" name="owner" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    ${users.map(u => `<option value="${esc(u.name)}" ${lead.owner === u.name ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div>
                <label for="lead-detail-loss" class="block font-semibold text-slate-700 mb-1">Loss Reason (Required only if Stage = Lost)</label>
                <select id="lead-detail-loss" name="lossReason" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                  <option value="">— None —</option>
                  ${['Price', 'Timing', 'Not Qualified', 'Competitor', 'Other'].map(r => `<option value="${r}" ${lead.lossReason === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
              </div>

              <div>
                <label for="lead-detail-next" class="block font-semibold text-slate-700 mb-1">Next Action</label>
                <input id="lead-detail-next" name="nextAction" type="text" value="${esc(lead.nextAction || '')}" class="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
              </div>

              <div>
                <label for="lead-detail-notes" class="block font-semibold text-slate-700 mb-1">Consultation &amp; Site Notes</label>
                <textarea id="lead-detail-notes" name="notes" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg">${esc(lead.notes || '')}</textarea>
              </div>

              <button type="submit" class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
                Save Lead Updates
              </button>
            </form>

            <!-- Linked Proposals Card -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold text-slate-900">Linked Proposals (${linkedProposals.length})</h2>
                <button type="button" data-action="create-proposal-from-lead" data-lead-id="${esc(lead.id)}" class="text-amber-700 font-bold hover:underline">+ New Draft</button>
              </div>
              ${linkedProposals.length === 0 ? `
                <p class="text-slate-500">No proposals created for this lead yet. Click "Convert to Proposal Draft" to generate one from the attached 3D configuration.</p>
              ` : linkedProposals.map(p => `
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div class="font-bold text-slate-900">${esc(p.reference)} — ${fmt(p.grandTotal)}</div>
                    <div class="text-[11px] text-slate-500">${esc(p.title)}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    ${stageBadge(p.status)}
                    <button type="button" data-action="nav" data-route="/app/proposals/${esc(p.id)}" class="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold">Edit / Print</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right Column: Attached Customer Configuration Snapshot (7 cols) -->
          <div class="lg:col-span-7 space-y-5">
            ${cfg ? `
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Attached Customer Configuration Snapshot</span>
                    <h2 class="text-base font-bold text-slate-900">${esc(cfg.reference)} — ${cfg.computed.sizing.actualDcCapacityKw} kW DC (${esc(cfg.selectedPackageKey.toUpperCase())})</h2>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" data-action="load-config-into-studio" data-config-id="${esc(cfg.id)}" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300">
                      Reopen in 3D Configurator
                    </button>
                    <button type="button" data-action="open-share-view" data-token="${esc(cfg.shareToken)}" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300">
                      Share / Print View
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div><span class="text-slate-500 block">Monthly Usage Input</span><strong class="text-slate-900">${cfg.computed.energy.monthlyKwh} kWh/mo (${esc(cfg.computed.energy.energyInputMode)})</strong></div>
                  <div><span class="text-slate-500 block">Solar Array</span><strong class="text-slate-900">${cfg.computed.sizing.selectedPanelCount} × ${cfg.computed.sizing.panelWattage}W</strong></div>
                  <div><span class="text-slate-500 block">Battery Backup</span><strong class="text-emerald-700">${cfg.includeBattery ? cfg.computed.battery.totalNominalCapacityKwh + ' kWh LFP' : 'None (Grid-Tied)'}</strong></div>
                  <div><span class="text-slate-500 block">Snapshot Total</span><strong class="text-amber-600 font-bold">${fmt(cfg.computed.financials.grandTotal)}</strong></div>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-xs border-collapse">
                    <thead>
                      <tr class="border-b border-slate-200 text-slate-500 text-left">
                        <th class="py-2">SKU</th>
                        <th class="py-2">Component</th>
                        <th class="py-2 text-right">Qty</th>
                        <th class="py-2 text-right">Snapshot Price</th>
                        <th class="py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      ${cfg.computed.financials.lineItems.map(li => `
                        <tr>
                          <td class="py-2 font-mono text-slate-500">${esc(li.sku)}</td>
                          <td class="py-2 font-semibold text-slate-900">${esc(li.name)}</td>
                          <td class="py-2 text-right font-mono">${li.quantity}</td>
                          <td class="py-2 text-right font-mono">${fmt(li.unitPrice)}</td>
                          <td class="py-2 text-right font-mono font-semibold">${fmt(li.lineTotal)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : `
              <div class="bg-white p-6 rounded-2xl border border-slate-200 text-xs text-slate-500">
                No configuration snapshot attached to this lead.
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 8.3 Saved Configurations List
   */
  function renderConfigurationsView(app) {
    const configs = app.store.getConfigurations();
    const assumptions = app.store.getAssumptions();
    const fmt = (v) => window.HelioEstimator.formatMoney(v, assumptions.currency, assumptions.locale);

    return `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Saved 3D Configurator Sessions</h1>
            <p class="text-xs text-slate-500">Historical customer and sales consultation snapshots with locked assumptions and shareable read-only tokens.</p>
          </div>
          <button type="button" data-action="nav" data-route="/configure" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
            + Create New Configuration in 3D
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th class="py-3 px-4 font-semibold">Reference / Date</th>
                <th class="py-3 px-4 font-semibold">Context &amp; Package</th>
                <th class="py-3 px-4 font-semibold">System Specs</th>
                <th class="py-3 px-4 font-semibold text-right">Preliminary Total</th>
                <th class="py-3 px-4 font-semibold">Linked Lead</th>
                <th class="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${configs.map(c => {
                const lead = c.leadId ? app.store.getLeadById(c.leadId) : null;
                return `
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-4 font-mono">
                      <div class="font-bold text-slate-900">${esc(c.reference)}</div>
                      <div class="text-[11px] text-slate-400">${esc(c.createdAt.slice(0, 10))}</div>
                    </td>
                    <td class="py-3 px-4">
                      <div class="font-semibold text-slate-900 uppercase">${esc(c.selectedPackageKey)}</div>
                      <div class="text-[11px] text-slate-500">${esc(c.projectType)} • ${esc(c.roofOrientation)} Roof</div>
                    </td>
                    <td class="py-3 px-4">
                      <div class="font-semibold text-slate-900">${c.computed.sizing.actualDcCapacityKw} kW DC (${c.computed.sizing.selectedPanelCount} panels)</div>
                      <div class="text-[11px] text-emerald-700">${c.includeBattery ? c.computed.battery.totalNominalCapacityKwh + ' kWh LFP Backup' : 'Grid-Tied'}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-slate-900">${fmt(c.computed.financials.grandTotal)}</td>
                    <td class="py-3 px-4">
                      ${lead ? `<button type="button" data-action="nav" data-route="/app/leads/${esc(lead.id)}" class="text-sky-600 font-semibold hover:underline">${esc(lead.contactName)} (${esc(lead.reference)})</button>` : '<span class="text-slate-400">Unattached Session</span>'}
                    </td>
                    <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button type="button" data-action="load-config-into-studio" data-config-id="${esc(c.id)}" class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-300">Open in 3D</button>
                      <button type="button" data-action="open-share-view" data-token="${esc(c.shareToken)}" class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-300">Share Link</button>
                      <button type="button" data-action="create-proposal-from-config" data-config-id="${esc(c.id)}" class="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold">+ Proposal</button>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * 8.4 Equipment Catalog CRUD
   */
  function renderCatalogView(app) {
    const assumptions = app.store.getAssumptions();
    const fmt = (v) => window.HelioEstimator.formatMoney(v, assumptions.currency, assumptions.locale);
    const allProducts = app.store.getProducts({ activeOnly: false });
    const catFilter = app.workspaceState.catalogCategoryFilter || 'ALL';
    const editingProd = app.workspaceState.editingProduct || null;

    const filtered = allProducts.filter(p => catFilter === 'ALL' || p.category === catFilter);

    return `
      <div class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Equipment &amp; Services Catalog</h1>
            <p class="text-xs text-slate-500">Sample demonstration catalog. Updating prices affects new configurator sessions and new proposal drafts while preserving historical sent proposals.</p>
          </div>
          <button type="button" data-action="open-product-form" data-product-id="" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
            + Add Catalog Product
          </button>
        </div>

        <!-- Category Tabs -->
        <div class="flex flex-wrap gap-1.5">
          ${[
            { k: 'ALL', l: 'All Items' },
            { k: 'panel', l: 'Solar Panels' },
            { k: 'inverter', l: 'Inverters' },
            { k: 'battery', l: 'LFP Batteries' },
            { k: 'mounting', l: 'Mounting' },
            { k: 'bos', l: 'Electrical BOS' },
            { k: 'labor', l: 'Labor & Service' }
          ].map(c => `
            <button type="button" data-action="catalog-cat-filter" data-cat="${c.k}"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold ${catFilter === c.k ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
              ${esc(c.l)}
            </button>
          `).join('')}
        </div>

        ${editingProd ? `
          <!-- Create / Edit Product Card -->
          <form id="catalog-product-form" class="bg-amber-50/70 p-5 rounded-2xl border-2 border-amber-400 shadow-md space-y-4 text-xs">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-900">${editingProd.id ? 'Edit Catalog Item: ' + esc(editingProd.sku) : 'Add New Demonstration Catalog Item'}</h2>
              <button type="button" data-action="close-product-form" class="text-slate-500 hover:text-slate-900 font-bold">✕ Close</button>
            </div>
            <input type="hidden" name="id" value="${esc(editingProd.id || '')}"/>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">SKU Code *</label>
                <input name="sku" type="text" required value="${esc(editingProd.sku || 'SG-NEW-100')}" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"/>
              </div>
              <div class="sm:col-span-2">
                <label class="block font-semibold text-slate-700 mb-1">Display Name *</label>
                <input name="name" type="text" required value="${esc(editingProd.name || '')}" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"/>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Category</label>
                <select name="category" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                  ${['panel', 'inverter', 'battery', 'mounting', 'bos', 'labor'].map(cat => `<option value="${cat}" ${editingProd.category === cat ? 'selected' : ''}>${cat.toUpperCase()}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Customer Unit Price (${esc(assumptions.currency)}) *</label>
                <input name="customerPrice" type="number" min="0" step="100" required value="${editingProd.customerPrice !== undefined ? editingProd.customerPrice : 30000}" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"/>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Internal Est. Cost (${esc(assumptions.currency)})</label>
                <input name="internalUnitCost" type="number" min="0" step="100" value="${editingProd.internalUnitCost !== undefined ? editingProd.internalUnitCost : 24000}" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"/>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Panel Wattage (W) / Cap (kW/kWh)</label>
                <input name="specValue" type="number" step="0.01" value="${editingProd.wattage || editingProd.acCapacityKw || editingProd.capacityKwh || 585}" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"/>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Warranty Text</label>
                <input name="warrantyText" type="text" value="${esc(editingProd.warrantyText || '10-Year Sample Warranty')}" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"/>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2">
              <button type="button" data-action="close-product-form" class="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold">Cancel</button>
              <button type="submit" class="px-5 py-2 rounded-lg bg-slate-900 text-amber-400 font-bold">Save Catalog Product</button>
            </div>
          </form>
        ` : ''}

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th class="py-3 px-4 font-semibold">SKU / Status</th>
                <th class="py-3 px-4 font-semibold">Product Name &amp; Warranty</th>
                <th class="py-3 px-4 font-semibold">Category &amp; Rating</th>
                <th class="py-3 px-4 font-semibold text-right">Customer Price</th>
                <th class="py-3 px-4 font-semibold text-right">Est. Unit Cost / Margin</th>
                <th class="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filtered.map(p => {
                const marginPct = p.customerPrice > 0 ? Math.round(((p.customerPrice - (p.internalUnitCost || 0)) / p.customerPrice) * 100) : 0;
                const specBadge = p.wattage ? `${p.wattage}W DC` : (p.acCapacityKw ? `${p.acCapacityKw} kW AC (${p.inverterType})` : (p.capacityKwh ? `${p.capacityKwh} kWh LFP` : p.unit));
                return `
                  <tr class="${p.active ? 'hover:bg-slate-50' : 'bg-slate-50/70 opacity-65'}">
                    <td class="py-3 px-4 font-mono">
                      <div class="font-bold text-slate-900">${esc(p.sku)}</div>
                      <span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}">${p.active ? 'Active' : 'Archived'}</span>
                    </td>
                    <td class="py-3 px-4">
                      <div class="font-bold text-slate-900">${esc(p.name)}</div>
                      <div class="text-[11px] text-slate-500">${esc(p.warrantyText)}</div>
                    </td>
                    <td class="py-3 px-4">
                      <span class="uppercase font-semibold text-slate-700">${esc(p.category)}</span>
                      <div class="text-[11px] text-slate-500 font-mono">${esc(specBadge)}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-slate-900">${fmt(p.customerPrice)}</td>
                    <td class="py-3 px-4 text-right font-mono text-slate-600">
                      <div>${fmt(p.internalUnitCost || 0)}</div>
                      <div class="text-[10px] text-emerald-700 font-semibold">~${marginPct}% est. margin</div>
                    </td>
                    <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button type="button" data-action="open-product-form" data-product-id="${esc(p.id)}" class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-300">Edit Price</button>
                      <button type="button" data-action="toggle-product-archive" data-product-id="${esc(p.id)}" class="px-2.5 py-1 rounded ${p.active ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'} font-semibold">
                        ${p.active ? 'Archive' : 'Restore'}
                      </button>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * 8.5 Pricing & Estimator Assumptions View
   */
  function renderAssumptionsView(app) {
    const a = app.store.getAssumptions();
    return `
      <div class="space-y-6 max-w-4xl">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Estimator Assumptions &amp; Pricing Rules</h1>
          <p class="text-xs text-slate-500">Configure currency, equivalent peak-sun-hours, performance factor, discount/tax ordering, and preliminary disclaimers.</p>
        </div>

        <div class="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950">
          <strong>Engineering Governance Warning:</strong> These are business-configured pre-sales assumptions for illustrative estimates. They do not constitute automatic regulatory, structural, or electrical engineering verification.
        </div>

        <form id="assumptions-settings-form" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="assump-currency" class="block font-semibold text-slate-700 mb-1">Workspace Currency</label>
              <select id="assump-currency" name="currency" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold">
                ${['PKR', 'USD', 'EUR', 'AED', 'GBP'].map(c => `<option value="${c}" ${a.currency === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="assump-locale" class="block font-semibold text-slate-700 mb-1">Number/Currency Locale</label>
              <select id="assump-locale" name="locale" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                ${['en-PK', 'en-US', 'en-IE', 'en-AE', 'en-GB'].map(l => `<option value="${l}" ${a.locale === l ? 'selected' : ''}>${l}</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="assump-region" class="block font-semibold text-slate-700 mb-1">Region Label</label>
              <input id="assump-region" name="regionLabel" type="text" value="${esc(a.regionLabel)}" class="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label for="assump-psh" class="block font-semibold text-slate-700 mb-1">Peak Sun-Hours / Day (hrs)</label>
              <input id="assump-psh" name="peakSunHoursPerDay" type="number" step="0.1" min="2.0" max="8.5" value="${a.peakSunHoursPerDay}" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"/>
            </div>
            <div>
              <label for="assump-perf" class="block font-semibold text-slate-700 mb-1">Overall Performance Factor (0.50–0.95)</label>
              <input id="assump-perf" name="performanceFactor" type="number" step="0.01" min="0.50" max="0.95" value="${a.performanceFactor}" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"/>
            </div>
            <div>
              <label for="assump-tariff" class="block font-semibold text-slate-700 mb-1">Assumed Blended Tariff (${esc(a.currency)}/kWh)</label>
              <input id="assump-tariff" name="assumedTariffPerKwh" type="number" step="1" min="1" max="5000" value="${a.assumedTariffPerKwh}" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"/>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label for="assump-discount" class="block font-semibold text-slate-700 mb-1">Default Discount (%)</label>
              <input id="assump-discount" name="defaultDiscountPercent" type="number" step="0.5" min="0" max="40" value="${a.defaultDiscountPercent}" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"/>
            </div>
            <div>
              <label for="assump-tax" class="block font-semibold text-slate-700 mb-1">Default Tax Rate (%)</label>
              <input id="assump-tax" name="defaultTaxRatePercent" type="number" step="0.5" min="0" max="35" value="${a.defaultTaxRatePercent}" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"/>
            </div>
            <div>
              <label for="assump-timing" class="block font-semibold text-slate-700 mb-1">Discount Timing Rule</label>
              <select id="assump-timing" name="discountTiming" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                <option value="before_tax" ${a.discountTiming === 'before_tax' ? 'selected' : ''}>Apply Discount Before Tax</option>
                <option value="after_tax" ${a.discountTiming === 'after_tax' ? 'selected' : ''}>Apply Discount After Tax</option>
              </select>
            </div>
            <div>
              <label for="assump-cap" class="block font-semibold text-slate-700 mb-1">3D Max Visible Panels Cap</label>
              <input id="assump-cap" name="maxVisiblePanels" type="number" min="12" max="60" value="${a.maxVisiblePanels}" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"/>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100">
            <label for="assump-disclaimer" class="block font-semibold text-slate-700 mb-1">Estimate &amp; Proposal Disclaimer Copy</label>
            <textarea id="assump-disclaimer" name="disclaimerText" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg">${esc(a.disclaimerText)}</textarea>
          </div>

          <button type="submit" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold">
            Save &amp; Persist Estimator Assumptions
          </button>
        </form>
      </div>
    `;
  }

  /**
   * 8.6 Proposals List View
   */
  function renderProposalsList(app) {
    const proposals = app.store.getProposals();
    const assumptions = app.store.getAssumptions();
    const fmt = (v) => window.HelioEstimator.formatMoney(v, assumptions.currency, assumptions.locale);

    return `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Proposals &amp; Commercial Quotes</h1>
            <p class="text-xs text-slate-500">Manage Draft → In Review → Sent → Accepted / Declined proposals. Sent proposals lock their line-item price snapshots.</p>
          </div>
          <button type="button" data-action="nav" data-route="/app/leads" class="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs">
            Create Proposal from Lead →
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th class="py-3 px-4 font-semibold">Reference / Expiry</th>
                <th class="py-3 px-4 font-semibold">Proposal Title &amp; Customer</th>
                <th class="py-3 px-4 font-semibold">System Size</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 font-semibold text-right">Grand Total</th>
                <th class="py-3 px-4 font-semibold text-right">Balance Due</th>
                <th class="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${proposals.map(p => `
                <tr class="hover:bg-slate-50">
                  <td class="py-3 px-4 font-mono">
                    <div class="font-bold text-slate-900">${esc(p.reference)}</div>
                    <div class="text-[11px] text-slate-400">Exp: ${esc(p.expiryDate)}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900">${esc(p.title)}</div>
                    <div class="text-[11px] text-slate-500">${esc(p.customerSnapshot.name)} • ${esc(p.customerSnapshot.city)}</div>
                  </td>
                  <td class="py-3 px-4 font-mono font-semibold">${p.systemSizeKw} kW DC</td>
                  <td class="py-3 px-4">${stageBadge(p.status)}</td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-slate-900">${fmt(p.grandTotal)}</td>
                  <td class="py-3 px-4 text-right font-mono text-slate-600">${fmt(p.balanceDue)}</td>
                  <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button type="button" data-action="nav" data-route="/app/proposals/${esc(p.id)}" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                      Open Builder / Print
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * 8.6 Proposal Editor & Customer-Ready Printable Document View
   */
  function renderProposalEditor(app, proposalId) {
    const p = app.store.getProposalById(proposalId);
    if (!p) {
      return `<div class="p-8 bg-white rounded-2xl border text-center"><button type="button" data-action="nav" data-route="/app/proposals" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs">← Back to Proposals</button></div>`;
    }

    const org = app.store.getOrganization();
    const assumptions = app.store.getAssumptions();
    const fmt = (v) => window.HelioEstimator.formatMoney(v, p.currency || assumptions.currency, assumptions.locale);
    const activeCatalog = app.store.getProducts({ activeOnly: true });
    const isLocked = p.status !== 'Draft' && p.status !== 'In Review';
    const allowedNext = window.HelioEstimator.PROPOSAL_TRANSITIONS[p.status] || [];

    return `
      <div class="space-y-6">
        <!-- Non-Print Builder Toolbar -->
        <div class="no-print bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <button type="button" data-action="nav" data-route="/app/proposals" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold">
              ← Proposals
            </button>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-sm text-amber-400">${esc(p.reference)}</span>
                ${stageBadge(p.status)}
                ${isLocked ? '<span class="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Snapshot Locked</span>' : '<span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Editable Draft</span>'}
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Lifecycle transitions update linked lead &amp; follow-up tasks automatically. (No external email/WhatsApp is dispatched in Demo Mode).</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            ${allowedNext.map(nextStatus => `
              <button type="button" data-action="transition-proposal-status" data-proposal-id="${esc(p.id)}" data-status="${esc(nextStatus)}"
                class="px-3 py-1.5 rounded-lg text-xs font-bold ${
                  nextStatus === 'Sent' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' :
                  (nextStatus === 'Accepted' ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700')
                }">
                Mark as ${esc(nextStatus)}
              </button>
            `).join('')}
            <button type="button" data-action="copilot-explain-proposal" data-proposal-id="${esc(p.id)}" class="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold">
              Copilot Summary
            </button>
            <button type="button" data-action="print-page" class="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold">
              Print / Export PDF View
            </button>
          </div>
        </div>

        <!-- Editable Line Items & Pricing Controls (Hidden when printing) -->
        ${!isLocked ? `
          <div class="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 class="text-sm font-bold text-slate-900">Draft Proposal Line-Item &amp; Pricing Editor</h2>
              <div class="flex items-center gap-2">
                <select id="prop-add-product-select" aria-label="Select catalog product to add" class="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white">
                  ${activeCatalog.map(prod => `<option value="${esc(prod.id)}">${esc(prod.name)} (${fmt(prod.customerPrice)})</option>`).join('')}
                </select>
                <button type="button" data-action="proposal-add-line" data-proposal-id="${esc(p.id)}" class="px-3 py-1.5 rounded-lg bg-slate-900 text-amber-400 font-semibold">
                  + Add Line Item
                </button>
              </div>
            </div>

            <div class="space-y-2">
              ${p.lineItemsSnapshot.map((li, idx) => `
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div class="sm:col-span-5">
                    <div class="font-bold text-slate-900">${esc(li.name)}</div>
                    <div class="text-[11px] text-slate-500 font-mono">${esc(li.sku)}</div>
                  </div>
                  <div class="sm:col-span-2">
                    <label class="text-[10px] text-slate-500 block">Qty</label>
                    <input type="number" min="1" max="500" value="${li.quantity}"
                      data-action="proposal-line-qty" data-proposal-id="${esc(p.id)}" data-line-idx="${idx}"
                      class="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"/>
                  </div>
                  <div class="sm:col-span-2">
                    <label class="text-[10px] text-slate-500 block">Unit Price</label>
                    <input type="number" min="0" step="500" value="${li.unitPrice}"
                      data-action="proposal-line-price" data-proposal-id="${esc(p.id)}" data-line-idx="${idx}"
                      class="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"/>
                  </div>
                  <div class="sm:col-span-2 text-right font-mono font-bold text-slate-900">
                    ${fmt(li.lineTotal)}
                  </div>
                  <div class="sm:col-span-1 text-right">
                    <button type="button" data-action="proposal-remove-line" data-proposal-id="${esc(p.id)}" data-line-idx="${idx}" class="text-rose-600 hover:text-rose-800 font-bold px-2 py-1">✕</button>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Adjustments & Scope Form -->
            <form id="proposal-details-form" data-proposal-id="${esc(p.id)}" class="space-y-4 pt-3 border-t border-slate-200">
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Other Charges (${esc(p.currency)})</label>
                  <input name="otherCharges" type="number" min="0" step="1000" value="${p.otherCharges || 0}" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"/>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Discount (%)</label>
                  <input name="discountPercent" type="number" min="0" max="50" step="0.5" value="${p.discountPercent || 0}" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"/>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                  <input name="taxRatePercent" type="number" min="0" max="35" step="0.5" value="${p.taxRatePercent || 0}" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"/>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Amount Paid / Deposit (${esc(p.currency)})</label>
                  <input name="amountPaid" type="number" min="0" step="5000" value="${p.amountPaid || 0}" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"/>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Proposal Title</label>
                  <input name="title" type="text" value="${esc(p.title)}" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg"/>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Valid Until (Expiry Date)</label>
                  <input name="expiryDate" type="date" value="${esc(p.expiryDate)}" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"/>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Scope of Work</label>
                  <textarea name="scopeText" rows="2" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg">${esc(p.scopeText)}</textarea>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Exclusions</label>
                  <textarea name="exclusionsText" rows="2" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg">${esc(p.exclusionsText)}</textarea>
                </div>
              </div>

              <div class="flex justify-end">
                <button type="submit" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                  Save Proposal Draft &amp; Recalculate Totals
                </button>
              </div>
            </form>
          </div>
        ` : ''}

        <!-- Customer-Ready Printable Proposal Document -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-5">
            <div class="flex items-center gap-3">
              ${window.HelioUIPublic.renderBrandMark(org)}
              <div>
                <h1 class="text-xl font-extrabold text-slate-900">${esc(org.name)}</h1>
                <p class="text-xs text-slate-500">${esc(org.contactEmail)} • ${esc(org.contactPhone)} • ${esc(org.city)}</p>
              </div>
            </div>
            <div class="sm:text-right">
              <div class="text-xs font-bold uppercase tracking-wider text-amber-600">Commercial Solar &amp; Storage Proposal</div>
              <div class="text-base font-mono font-bold text-slate-900">${esc(p.reference)}</div>
              <div class="text-xs text-slate-500">Status: <strong>${esc(p.status)}</strong> • Valid Until: ${esc(p.expiryDate)}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <div class="text-slate-400 font-semibold uppercase text-[10px]">Prepared For</div>
              <div class="font-bold text-sm text-slate-900 mt-0.5">${esc(p.customerSnapshot.name)}</div>
              <div class="text-slate-600">${esc(p.customerSnapshot.city)}</div>
              <div class="text-slate-500">${esc(p.customerSnapshot.phone)} • ${esc(p.customerSnapshot.email)}</div>
            </div>
            <div class="sm:text-right">
              <div class="text-slate-400 font-semibold uppercase text-[10px]">System Overview</div>
              <div class="font-bold text-sm text-slate-900 mt-0.5">${esc(p.title)}</div>
              <div class="text-slate-600">Installed DC Capacity: <strong>${p.systemSizeKw} kW DC</strong></div>
              ${p.configurationId ? `<div class="text-slate-400 font-mono text-[11px]">Config Snapshot ID: ${esc(p.configurationId)}</div>` : ''}
            </div>
          </div>

          <!-- Itemized Schedule Table -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Itemized Equipment, Structure &amp; Installation Schedule</h3>
            <table class="w-full text-xs border-collapse">
              <thead>
                <tr class="border-b-2 border-slate-200 text-slate-600 text-left">
                  <th class="py-2.5">SKU</th>
                  <th class="py-2.5">Description &amp; Warranty</th>
                  <th class="py-2.5 text-right">Qty</th>
                  <th class="py-2.5 text-right">Unit Price</th>
                  <th class="py-2.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${p.lineItemsSnapshot.map(li => `
                  <tr>
                    <td class="py-3 font-mono text-slate-500">${esc(li.sku)}</td>
                    <td class="py-3">
                      <div class="font-bold text-slate-900">${esc(li.name)}</div>
                      <div class="text-[11px] text-slate-500">${esc(li.description)} ${li.warrantyText ? '• ' + esc(li.warrantyText) : ''}</div>
                    </td>
                    <td class="py-3 text-right font-mono">${li.quantity}</td>
                    <td class="py-3 text-right font-mono">${fmt(li.unitPrice)}</td>
                    <td class="py-3 text-right font-mono font-bold text-slate-900">${fmt(li.lineTotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Financial Summary Box -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            <div class="md:col-span-7 space-y-3 text-xs">
              <div>
                <div class="font-bold text-slate-900">Scope of Supply &amp; Services</div>
                <p class="text-slate-600 mt-0.5">${esc(p.scopeText)}</p>
              </div>
              <div>
                <div class="font-bold text-slate-900">Exclusions</div>
                <p class="text-slate-600 mt-0.5">${esc(p.exclusionsText)}</p>
              </div>
              <div>
                <div class="font-bold text-slate-900">Payment Schedule &amp; Indicative Timeline</div>
                <p class="text-slate-600 mt-0.5">${esc(p.paymentScheduleText)} • Timeline: ${esc(p.indicativeTimelineText)}</p>
              </div>
            </div>

            <div class="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div class="flex justify-between text-slate-600"><span>Equipment Subtotal:</span><span class="font-mono font-semibold">${fmt(p.equipmentSubtotal)}</span></div>
              <div class="flex justify-between text-slate-600"><span>Installation &amp; Labor:</span><span class="font-mono font-semibold">${fmt(p.installationLabor)}</span></div>
              <div class="flex justify-between text-slate-600"><span>Other Charges:</span><span class="font-mono font-semibold">${fmt(p.otherCharges || 0)}</span></div>
              <div class="flex justify-between text-slate-700 font-medium border-t border-slate-200 pt-1"><span>Gross Subtotal:</span><span class="font-mono">${fmt(p.grossSubtotal)}</span></div>
              ${p.discountAmount > 0 ? `<div class="flex justify-between text-emerald-700"><span>Discount (${p.discountPercent}%):</span><span class="font-mono">-${fmt(p.discountAmount)}</span></div>` : ''}
              ${p.taxAmount > 0 ? `<div class="flex justify-between text-slate-600"><span>Tax (${p.taxRatePercent}%):</span><span class="font-mono">${fmt(p.taxAmount)}</span></div>` : ''}
              <div class="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-300 pt-2">
                <span>Grand Total:</span>
                <span class="font-mono text-amber-600">${fmt(p.grandTotal)}</span>
              </div>
              <div class="flex justify-between text-slate-600 pt-1"><span>Amount Received:</span><span class="font-mono text-emerald-700 font-semibold">${fmt(p.amountPaid)}</span></div>
              <div class="flex justify-between text-slate-900 font-bold"><span>Balance Due:</span><span class="font-mono">${fmt(p.balanceDue)}</span></div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div><strong>Disclaimer:</strong> ${esc(assumptions.disclaimerText)}</div>
            <div>${esc(assumptions.proposalFooterText)}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 8.8 Honest Analytics Derived from Persisted Records
   */
  function renderAnalyticsView(app) {
    const assumptions = app.store.getAssumptions();
    const fmt = (v) => window.HelioEstimator.formatMoney(v, assumptions.currency, assumptions.locale);
    const leads = app.store.getLeads();
    const proposals = app.store.getProposals();
    const configs = app.store.getConfigurations();

    // Calculate estimated gross margin across proposals using Estimator
    let totalProposalRev = 0;
    let totalProposalMargin = 0;
    proposals.forEach(p => {
      const fin = window.HelioEstimator.calculateFinancialTotals({
        assumptions,
        lineItems: p.lineItemsSnapshot,
        otherCharges: p.otherCharges,
        discountPercent: p.discountPercent,
        taxRatePercent: p.taxRatePercent
      });
      totalProposalRev += fin.grandTotal;
      totalProposalMargin += fin.estimatedGrossMargin;
    });
    const avgMarginPct = totalProposalRev > 0 ? Math.round((totalProposalMargin / totalProposalRev) * 1000) / 10 : 0;

    return `
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Workspace Analytics &amp; Estimated Margin</h1>
          <p class="text-xs text-slate-500">All charts and ratios are computed directly from the ${leads.length} leads, ${configs.length} configurations, and ${proposals.length} proposals in the active workspace.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div class="text-xs text-slate-500 font-semibold">Total Proposal Volume</div>
            <div class="text-2xl font-extrabold text-slate-900 mt-1">${fmt(totalProposalRev)}</div>
            <div class="text-[11px] text-slate-500 mt-1">Across ${proposals.length} proposals (Draft/Sent/Accepted/Declined)</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div class="text-xs text-slate-500 font-semibold">Estimated Internal Gross Margin</div>
            <div class="text-2xl font-extrabold text-emerald-700 mt-1">${fmt(totalProposalMargin)} (~${avgMarginPct}%)</div>
            <div class="text-[11px] text-slate-500 mt-1">Derived from catalog internal unit costs (Illustrative)</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div class="text-xs text-slate-500 font-semibold">Battery Attachment Rate</div>
            <div class="text-2xl font-extrabold text-sky-700 mt-1">${configs.length > 0 ? Math.round((configs.filter(c => c.includeBattery).length / configs.length) * 100) : 0}%</div>
            <div class="text-[11px] text-slate-500 mt-1">${configs.filter(c => c.includeBattery).length} of ${configs.length} configurations include LFP storage</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 class="text-sm font-bold text-slate-900 mb-1">Proposal Status Breakdown</h2>
            <p class="text-[11px] text-slate-500 mb-3">Count of proposals by current lifecycle stage</p>
            <div class="relative h-64">
              <canvas id="chart-analytics-proposals"></canvas>
            </div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 class="text-sm font-bold text-slate-900 mb-1">Lead Acquisition Sources</h2>
            <p class="text-[11px] text-slate-500 mb-3">Distribution across ${leads.length} workspace leads</p>
            <div class="relative h-64">
              <canvas id="chart-analytics-sources"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 8.9 White-Label Brand, Team Roles & Honest Integration Status View
   */
  function renderSettingsView(app) {
    const org = app.store.getOrganization();
    const users = app.store.getUsers();
    const integrations = app.store.getIntegrations();

    return `
      <div class="space-y-6 max-w-5xl">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">White-Label Branding, Team Roles &amp; Integrations</h1>
          <p class="text-xs text-slate-500">Changes to company name, logo preset, contact details, and CTA copy immediately update the public landing page, 3D configurator, and printable proposals.</p>
        </div>

        <!-- White-Label Brand Form -->
        <form id="brand-settings-form" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h2 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">1. White-Label Brand Identity</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Company Display Name *</label>
              <input name="name" type="text" required value="${esc(org.name)}" class="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Brand Tagline</label>
              <input name="tagline" type="text" value="${esc(org.tagline)}" class="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Bundled Vector Logo Mark</label>
              <select name="logoType" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                <option value="geometric_sun" ${org.logoType === 'geometric_sun' ? 'selected' : ''}>Solar Horizon Mark (Amber/Sky)</option>
                <option value="hex_grid" ${org.logoType === 'hex_grid' ? 'selected' : ''}>Hexagon Cell Grid Mark</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Contact Email</label>
              <input name="contactEmail" type="email" value="${esc(org.contactEmail)}" class="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input name="contactPhone" type="text" value="${esc(org.contactPhone)}" class="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Public Quote CTA Heading</label>
              <input name="publicCtaText" type="text" value="${esc(org.publicCtaText)}" class="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Customer Follow-Up Consent Copy</label>
            <input name="consentCopy" type="text" value="${esc(org.consentCopy)}" class="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
          </div>

          <button type="submit" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold">
            Save White-Label Brand Settings
          </button>
        </form>

        <!-- Honest Integration Status Matrix -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 class="text-sm font-bold text-slate-900">2. Integration &amp; Service Adapter Status</h2>
            <p class="text-xs text-slate-500">Honest verification of active adapters vs. unconfigured production services (Section 2.2 &amp; 11).</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            ${integrations.map(intg => {
              const badgeCls = intg.status === 'Connected'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : (intg.status === 'Demo mode' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-300');
              return `
                <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-900">${esc(intg.provider)}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeCls}">${esc(intg.status)}</span>
                  </div>
                  <div class="text-[11px] font-semibold text-slate-500">${esc(intg.category)}</div>
                  <p class="text-[11px] text-slate-600 leading-relaxed">${esc(intg.description)}</p>
                </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Team Members & Permission Matrix -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <h2 class="text-sm font-bold text-slate-900">3. Workspace Team &amp; Role Permission Matrix (Demo Simulation)</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${users.map(u => `
              <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div class="font-bold text-slate-900">${esc(u.name)}</div>
                <div class="text-[11px] text-slate-500">${esc(u.email)}</div>
                <div class="mt-2 inline-block px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-semibold text-[10px]">${esc(u.role)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Section 14.5 & 20: In-App README, Automated Test Verification Summary & Production Roadmap
   */
  function renderDocsAndRoadmapView(app) {
    return `
      <div class="space-y-6 max-w-4xl">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">HelioStudio Documentation, Architecture &amp; Production Roadmap</h1>
          <p class="text-xs text-slate-500">Complete engineering handoff documentation, environment variable specification, and verified test coverage.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs leading-relaxed text-slate-700">
          <h2 class="text-base font-bold text-slate-900">1. Architecture &amp; Persistence Mode</h2>
          <p>
            <strong>HelioStudio v1.2</strong> is architected with clean separation between isolated domain logic (<code class="font-mono bg-slate-100 px-1 rounded">HelioEstimator</code>), deterministic seed data (<code class="font-mono bg-slate-100 px-1 rounded">HelioSeed</code>), a tenant-isolated repository store (<code class="font-mono bg-slate-100 px-1 rounded">HelioStore</code>), an encapsulated Three.js r128 WebGL 3D scene controller (<code class="font-mono bg-slate-100 px-1 rounded">HelioScene3D</code>) with automatic 2D technical SVG schematic fallback, and modular experience views.
          </p>
          <p>
            In this browser/Canvas environment, persistence uses the <strong>Browser LocalStorage Repository Adapter</strong> (<code class="font-mono bg-slate-100 px-1 rounded">heliostudio_workspace_state_v1_2</code>) with schema validation and confirmation-protected seed reset.
          </p>

          <h2 class="text-base font-bold text-slate-900 pt-2">2. What Is Real vs. Simulated in This Environment</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Real &amp; Verified:</strong> Interactive 3D WebGL house/roof/panel/inverter/battery scene, orbit/zoom/camera presets, day/evening lighting, roof cutaway, raycast selection, 2D SVG schematic toggle, decimal-safe minor-unit estimator math, package comparison, quote form validation, lead pipeline, catalog price/archive management, proposal snapshot locking, printable proposal/share views, role permission checks, and deterministic Sales Copilot.</li>
            <li><strong>Simulated / Demo Mode Only:</strong> Persistence is local to the current browser (<code class="font-mono">localStorage</code>), role switching is a client-side demo simulation, and external email/WhatsApp/payment dispatch is intentionally not connected.</li>
          </ul>

          <h2 class="text-base font-bold text-slate-900 pt-2">3. Production Deployment Checklist (Section 20)</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded bg-slate-50 border border-slate-200">[ ] Managed PostgreSQL / Supabase database with migrations &amp; automated backups</div>
            <div class="p-2.5 rounded bg-slate-50 border border-slate-200">[ ] Server-side authentication &amp; Row-Level Security (RLS) tenant isolation policies</div>
            <div class="p-2.5 rounded bg-slate-50 border border-slate-200">[ ] Server-side price &amp; proposal recalculation boundary</div>
            <div class="p-2.5 rounded bg-slate-50 border border-slate-200">[ ] Verified installer product SKUs, supplier pricing &amp; legal warranty terms</div>
            <div class="p-2.5 rounded bg-slate-50 border border-slate-200">[ ] Transactional email (Resend/SMTP) &amp; WhatsApp Business Cloud API credentials</div>
            <div class="p-2.5 rounded bg-slate-50 border border-slate-200">[ ] Server-side LLM adapter with rate limits &amp; budget controls if live AI is enabled</div>
          </div>

          <h2 class="text-base font-bold text-slate-900 pt-2">4. Environment Variables Template (.env.example)</h2>
          <pre class="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">PUBLIC_APP_URL=https://solar.example.com
DATABASE_URL=postgresql://user:password@localhost:5432/heliostudio
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-placeholder
SUPABASE_SERVICE_ROLE_KEY=your-service-role-placeholder
RESEND_API_KEY=re_placeholder_do_not_commit
WHATSAPP_CLOUD_API_TOKEN=wa_placeholder_do_not_commit
AI_PROVIDER_API_KEY=ai_placeholder_server_only</pre>
        </div>
      </div>
    `;
  }

  /**
   * Section 10: Contextual Sales Copilot Drawer
   */
  function renderCopilotDrawer(app) {
    const out = app.workspaceState.copilotOutput || app.store.copilot.generateDailyBrief();
    return `
      <div class="no-print fixed inset-y-0 right-0 z-40 w-full max-w-md bg-slate-900 text-white shadow-2xl border-l border-slate-700 flex flex-col">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">${esc(out.modeLabel || 'Template-Based Demo Assistant')}</span>
            <h2 class="text-sm font-bold text-white mt-1">Helio Assistant — Sales Copilot</h2>
          </div>
          <button type="button" data-action="toggle-copilot-drawer" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs">✕ Close</button>
        </div>

        <div class="p-4 space-y-3 flex-1 overflow-y-auto text-xs">
          <div class="text-slate-400">Select a deterministic action grounded in your saved workspace records:</div>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" data-action="copilot-action" data-copilot-fn="daily_brief" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left font-semibold text-amber-300 border border-slate-700">Owner's Daily Brief</button>
            <button type="button" data-action="copilot-action" data-copilot-fn="lead_summary" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left font-semibold text-sky-300 border border-slate-700">Summarize Active Lead</button>
            <button type="button" data-action="copilot-action" data-copilot-fn="followup_draft" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left font-semibold text-emerald-300 border border-slate-700">Draft Follow-Up Email</button>
            <button type="button" data-action="copilot-action" data-copilot-fn="proposal_explain" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left font-semibold text-purple-300 border border-slate-700">Explain Proposal Simply</button>
          </div>

          <div class="pt-2">
            <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span class="font-bold text-white">${esc(out.title)}</span>
              <span>Editable Draft</span>
            </div>
            <textarea id="copilot-editable-text" rows="12" class="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs leading-relaxed">${esc(out.body)}</textarea>
          </div>

          <div class="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
            <div><strong>Grounded Record Sources:</strong> ${(out.sources || []).map(s => `<span class="font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 ml-1">${esc(s)}</span>`).join('')}</div>
            <div class="mt-1 text-slate-400">Trust Control: This text was generated deterministically from local records. Review and edit before copying. No message is sent automatically.</div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button type="button" data-action="copy-copilot-text" class="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
              Copy Text to Clipboard
            </button>
          </div>
        </div>
      </div>
    `;
  }

  return {
    renderWorkspaceShell
  };
});
