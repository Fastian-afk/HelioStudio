/**
 * HelioStudio — Repository Store, Tenant Isolation, Permission Matrix,
 * Workflow Automation & Deterministic Sales Copilot
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Estimator = require('./estimator.js');
    const Seed = require('./seedData.js');
    module.exports = factory(Estimator, Seed);
  } else {
    root.HelioStore = factory(root.HelioEstimator, root.HelioSeed);
  }
})(typeof self !== 'undefined' ? self : this, function (Estimator, Seed) {
  'use strict';

  const STORAGE_KEY = 'heliostudio_workspace_state_v1_2';
  const EXPECTED_SCHEMA = 'heliostudio_v1.2';

  const ROLE_PERMISSIONS = {
    'Owner/Admin': {
      canEditLeads: true,
      canEditProposals: true,
      canEditFollowUps: true,
      canEditCatalog: true,
      canEditAssumptions: true,
      canEditSettings: true
    },
    'Sales': {
      canEditLeads: true,
      canEditProposals: true,
      canEditFollowUps: true,
      canEditCatalog: false,
      canEditAssumptions: false,
      canEditSettings: false
    },
    'Viewer': {
      canEditLeads: false,
      canEditProposals: false,
      canEditFollowUps: false,
      canEditCatalog: false,
      canEditAssumptions: false,
      canEditSettings: false
    }
  };

  function generateToken(prefix = 'sh') {
    const chars = '0123456789abcdef';
    let out = prefix + '_';
    for (let i = 0; i < 20; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  function createStore(options = {}) {
    let canUseLocalStorage = false;
    if (options.useBrowserStorage !== false && typeof window !== 'undefined') {
      try {
        canUseLocalStorage = typeof window.localStorage !== 'undefined' && window.localStorage !== null;
      } catch (err) {
        canUseLocalStorage = false;
      }
    }
    const useBrowserStorage = canUseLocalStorage;
    let state = null;

    function loadState() {
      if (useBrowserStorage) {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.schemaVersion === EXPECTED_SCHEMA && Array.isArray(parsed.leads) && Array.isArray(parsed.products)) {
              state = parsed;
              refreshFollowUpUrgency();
              return state;
            }
          }
        } catch (err) {
          // Graceful recovery from corrupt or blocked localStorage
        }
      }
      state = Seed.createInitialSeedData();
      persistState();
      return state;
    }

    function persistState() {
      if (useBrowserStorage && state) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (err) {
          // Ignore storage quota or sandbox errors
        }
      }
    }

    function resetToSeedData() {
      state = Seed.createInitialSeedData();
      persistState();
      return state;
    }

    // Initialize immediately
    loadState();

    function getCurrentOrgId() {
      return state.currentOrganizationId || 'org_sungrid_demo';
    }

    function getCurrentUser() {
      const orgId = getCurrentOrgId();
      const user = state.users.find(u => u.id === state.currentUserId && u.organizationId === orgId);
      return user || state.users.find(u => u.organizationId === orgId) || {
        id: 'usr_demo_fallback',
        organizationId: orgId,
        name: 'Demo User',
        role: 'Owner/Admin'
      };
    }

    function checkPermission(permissionKey) {
      const user = getCurrentUser();
      const perms = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS['Viewer'];
      if (!perms[permissionKey]) {
        return {
          ok: false,
          code: 'FORBIDDEN',
          error: `Permission denied: Your active demo role (${user.role}) does not have "${permissionKey}" access. Switch to Owner/Admin or Sales in the top bar to perform this action.`
        };
      }
      return { ok: true, user };
    }

    function setActiveRole(roleName) {
      const orgId = getCurrentOrgId();
      const matchingUser = state.users.find(u => u.organizationId === orgId && u.role === roleName);
      if (matchingUser) {
        state.currentUserId = matchingUser.id;
        persistState();
        return { ok: true, user: matchingUser };
      }
      return { ok: false, error: 'Role user not found in current organization.' };
    }

    function logActivity(entityType, entityId, action, detail, customActorName) {
      const orgId = getCurrentOrgId();
      const actor = customActorName || getCurrentUser().name;
      const evt = {
        id: 'act_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        organizationId: orgId,
        actorName: actor,
        entityType,
        entityId,
        action,
        detail,
        createdAt: new Date().toISOString()
      };
      state.activities.unshift(evt);
      return evt;
    }

    /**
     * Workflow Rule 4: Automatically evaluate follow-up urgency against reference date
     */
    function refreshFollowUpUrgency(referenceIsoDate) {
      const nowStr = (referenceIsoDate || '2026-10-16T19:41:30Z').slice(0, 10);
      state.followUps.forEach(f => {
        if (f.status === 'Completed' || f.completedAt) {
          f.status = 'Completed';
          return;
        }
        const dueDay = String(f.dueAt || '').slice(0, 10);
        if (dueDay < nowStr) {
          f.status = 'Overdue';
        } else if (dueDay === nowStr) {
          f.status = 'Due Today';
        } else {
          f.status = 'Upcoming';
        }
      });
    }

    // Tenant-isolated getters
    function getOrganization(orgIdOverride) {
      const targetOrgId = orgIdOverride || getCurrentOrgId();
      if (targetOrgId !== getCurrentOrgId()) {
        return null; // Tenant isolation boundary enforced
      }
      return state.organizations.find(o => o.id === targetOrgId) || state.organizations[0];
    }

    function getAssumptions() {
      const orgId = getCurrentOrgId();
      return state.assumptions && state.assumptions.organizationId === orgId
        ? state.assumptions
        : Object.assign({}, Estimator.DEFAULT_ASSUMPTIONS, { organizationId: orgId });
    }

    function getProducts(options = {}) {
      const orgId = getCurrentOrgId();
      return state.products.filter(p => {
        if (p.organizationId !== orgId) return false;
        if (options.activeOnly && !p.active) return false;
        if (options.category && p.category !== options.category) return false;
        return true;
      });
    }

    function getPackages() {
      const orgId = getCurrentOrgId();
      return state.packages.filter(pkg => pkg.organizationId === orgId);
    }

    function getConfigurations() {
      const orgId = getCurrentOrgId();
      return state.configurations.filter(c => c.organizationId === orgId);
    }

    function getConfigurationById(configId) {
      const orgId = getCurrentOrgId();
      return state.configurations.find(c => c.id === configId && c.organizationId === orgId) || null;
    }

    function getConfigurationByShareToken(shareToken) {
      if (!shareToken || typeof shareToken !== 'string' || shareToken.length < 10) return null;
      return state.configurations.find(c => c.shareToken === shareToken) || null;
    }

    function getLeads() {
      const orgId = getCurrentOrgId();
      return state.leads.filter(l => l.organizationId === orgId);
    }

    function getLeadById(leadId, requestedOrgId) {
      const orgId = getCurrentOrgId();
      if (requestedOrgId && requestedOrgId !== orgId) {
        return null; // Prevent cross-tenant read
      }
      return state.leads.find(l => l.id === leadId && l.organizationId === orgId) || null;
    }

    function getProposals() {
      const orgId = getCurrentOrgId();
      return state.proposals.filter(p => p.organizationId === orgId);
    }

    function getProposalById(proposalId) {
      const orgId = getCurrentOrgId();
      return state.proposals.find(p => p.id === proposalId && p.organizationId === orgId) || null;
    }

    function getFollowUps() {
      const orgId = getCurrentOrgId();
      refreshFollowUpUrgency();
      return state.followUps.filter(f => f.organizationId === orgId);
    }

    function getActivities() {
      const orgId = getCurrentOrgId();
      return state.activities.filter(a => a.organizationId === orgId);
    }

    function getIntegrations() {
      const orgId = getCurrentOrgId();
      return state.integrations.filter(i => i.organizationId === orgId);
    }

    function getUsers() {
      const orgId = getCurrentOrgId();
      return state.users.filter(u => u.organizationId === orgId);
    }

    /**
     * Build a live configuration object from user selections and active catalog
     */
    function buildConfigurationComputation(configParams) {
      const assumptions = getAssumptions();
      const allProducts = getProducts({ activeOnly: false });
      const activePanels = getProducts({ activeOnly: true, category: 'panel' });
      const activeInverters = getProducts({ activeOnly: true, category: 'inverter' });
      const activeBatteries = getProducts({ activeOnly: true, category: 'battery' });

      const panelProd = allProducts.find(p => p.id === configParams.panelProductId && p.active) || activePanels[0] || allProducts[0];
      const invProd = allProducts.find(p => p.id === configParams.inverterProductId && p.active) || activeInverters[0] || allProducts[3];
      const includeBattery = Boolean(configParams.includeBattery);
      const batProd = includeBattery
        ? (allProducts.find(p => p.id === configParams.batteryProductId && p.active) || activeBatteries[0] || allProducts[6])
        : null;

      const mountProd = allProducts.find(p => p.category === 'mounting' && p.active);
      const bosProd = allProducts.find(p => p.category === 'bos' && p.active);
      const laborProd = allProducts.find(p => p.category === 'labor' && p.active);

      const energy = Estimator.calculateEnergyAndTargetKw(configParams.energyInput || {}, assumptions);
      const sizing = Estimator.calculatePanelAndInverterSizing({
        assumptions,
        preliminaryDcTargetKw: energy.preliminaryDcTargetKw,
        panelProduct: panelProd,
        inverterProduct: invProd,
        includeBattery,
        manualPanelCount: configParams.manualPanelCount,
        inverterQuantity: configParams.inverterQuantity || 1
      });

      const battery = Estimator.calculateBatteryEstimate({
        assumptions,
        includeBattery,
        backupLoadKw: configParams.backupLoadKw,
        targetRuntimeHours: configParams.targetRuntimeHours,
        batteryProduct: batProd,
        manualBatteryQuantity: configParams.manualBatteryQuantity
      });

      const lineItems = [];
      if (panelProd) {
        lineItems.push({
          id: 'li_panel',
          productId: panelProd.id,
          sku: panelProd.sku,
          name: panelProd.name,
          category: 'panel',
          description: `${sizing.selectedPanelCount} × ${panelProd.wattage}W (${sizing.actualDcCapacityKw} kW DC array)`,
          warrantyText: panelProd.warrantyText,
          quantity: sizing.selectedPanelCount,
          unitPrice: panelProd.customerPrice,
          unitCost: panelProd.internalUnitCost
        });
      }
      if (invProd) {
        lineItems.push({
          id: 'li_inv',
          productId: invProd.id,
          sku: invProd.sku,
          name: invProd.name,
          category: 'inverter',
          description: `${invProd.acCapacityKw} kW AC (${invProd.inverterType === 'hybrid' ? 'Hybrid' : 'Grid-Tied'})`,
          warrantyText: invProd.warrantyText,
          quantity: sizing.inverterQuantity,
          unitPrice: invProd.customerPrice,
          unitCost: invProd.internalUnitCost
        });
      }
      if (includeBattery && batProd && battery.selectedBatteryQuantity > 0) {
        lineItems.push({
          id: 'li_bat',
          productId: batProd.id,
          sku: batProd.sku,
          name: batProd.name,
          category: 'battery',
          description: `${battery.totalNominalCapacityKwh} kWh nominal (${battery.totalUsableCapacityKwh} kWh usable)`,
          warrantyText: batProd.warrantyText,
          quantity: battery.selectedBatteryQuantity,
          unitPrice: batProd.customerPrice,
          unitCost: batProd.internalUnitCost
        });
      }
      if (mountProd) {
        lineItems.push({
          id: 'li_mount',
          productId: mountProd.id,
          sku: mountProd.sku,
          name: mountProd.name,
          category: 'mounting',
          description: `Roof mounting rails & clamps for ${sizing.selectedPanelCount} modules`,
          warrantyText: mountProd.warrantyText,
          quantity: sizing.selectedPanelCount,
          unitPrice: mountProd.customerPrice,
          unitCost: mountProd.internalUnitCost
        });
      }
      if (bosProd) {
        lineItems.push({
          id: 'li_bos',
          productId: bosProd.id,
          sku: bosProd.sku,
          name: bosProd.name,
          category: 'bos',
          description: bosProd.description,
          warrantyText: bosProd.warrantyText,
          quantity: 1,
          unitPrice: bosProd.customerPrice,
          unitCost: bosProd.internalUnitCost
        });
      }
      if (laborProd) {
        lineItems.push({
          id: 'li_labor',
          productId: laborProd.id,
          sku: laborProd.sku,
          name: laborProd.name,
          category: 'labor',
          description: laborProd.description,
          warrantyText: laborProd.warrantyText,
          quantity: 1,
          unitPrice: laborProd.customerPrice,
          unitCost: laborProd.internalUnitCost
        });
      }

      const financials = Estimator.calculateFinancialTotals({
        assumptions,
        lineItems,
        discountPercent: configParams.discountPercent !== undefined ? configParams.discountPercent : assumptions.defaultDiscountPercent,
        taxRatePercent: configParams.taxRatePercent !== undefined ? configParams.taxRatePercent : assumptions.defaultTaxRatePercent,
        discountTiming: assumptions.discountTiming
      });

      const payback = Estimator.calculateIllustrativePayback({
        assumptions,
        estimatedMonthlyGenerationKwh: sizing.estimatedMonthlyGenerationKwh,
        monthlyKwh: energy.monthlyKwh,
        grandTotal: financials.grandTotal,
        includeBattery,
        assumedTariffPerKwh: energy.assumedTariffPerKwh
      });

      return {
        panelProduct: panelProd,
        inverterProduct: invProd,
        batteryProduct: batProd,
        energy,
        sizing,
        battery,
        financials,
        payback,
        assumptions
      };
    }

    /**
     * Save a customer configuration snapshot (public or internal)
     */
    function saveConfigurationSnapshot(configParams, statusLabel = 'Saved Session') {
      const orgId = getCurrentOrgId();
      const computed = buildConfigurationComputation(configParams);
      const seqNum = 100 + state.configurations.length + 1;
      const nowIso = new Date().toISOString();

      const newConfig = {
        id: 'cfg_' + Date.now() + '_' + Math.floor(Math.random() * 100),
        reference: `CFG-2026-${seqNum}`,
        organizationId: orgId,
        leadId: configParams.leadId || null,
        shareToken: generateToken('sh'),
        source: configParams.source || '3D Configurator',
        projectType: configParams.projectType || 'home_backup',
        selectedPackageKey: configParams.selectedPackageKey || 'balanced',
        roofOrientation: configParams.roofOrientation || 'South',
        roofPitchDeg: Number(configParams.roofPitchDeg) || 22,
        energyInput: Object.assign({}, configParams.energyInput || {}),
        panelProductId: computed.panelProduct ? computed.panelProduct.id : null,
        inverterProductId: computed.inverterProduct ? computed.inverterProduct.id : null,
        batteryProductId: computed.batteryProduct ? computed.batteryProduct.id : null,
        includeBattery: Boolean(configParams.includeBattery),
        backupLoadKw: computed.battery.backupLoadKw,
        targetRuntimeHours: computed.battery.targetRuntimeHours,
        computed: {
          energy: computed.energy,
          sizing: computed.sizing,
          battery: computed.battery,
          financials: computed.financials,
          payback: computed.payback
        },
        currency: computed.assumptions.currency,
        disclaimerSnapshot: computed.assumptions.disclaimerText,
        assumptionsVersion: computed.assumptions.name || 'Standard v2.4',
        status: statusLabel,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      state.configurations.unshift(newConfig);
      logActivity(
        'configuration',
        newConfig.id,
        'Configuration Saved',
        `Saved ${newConfig.reference} (${computed.sizing.actualDcCapacityKw} kW DC, ${Estimator.formatMoney(computed.financials.grandTotal, newConfig.currency)}).`,
        configParams.actorName || 'Customer (3D Configurator)'
      );
      persistState();
      return { ok: true, configuration: newConfig };
    }

    /**
     * Submit a Customer Quote Request (Section 6.6 & Workflow Rule 1)
     */
    function submitQuoteRequest(configParams, quoteForm) {
      const validation = Estimator.validateQuoteRequest(quoteForm);
      if (!validation.valid) {
        return { ok: false, code: 'VALIDATION_ERROR', errors: validation.errors };
      }

      const orgId = getCurrentOrgId();
      const cfgResult = saveConfigurationSnapshot(configParams, 'Attached to Lead');
      const savedCfg = cfgResult.configuration;

      const leadSeq = 100 + state.leads.length + 1;
      const nowIso = new Date().toISOString();
      const newLead = {
        id: 'lead_' + Date.now() + '_' + Math.floor(Math.random() * 100),
        organizationId: orgId,
        reference: `ENQ-2026-${leadSeq}`,
        contactName: String(quoteForm.contactName).trim(),
        email: String(quoteForm.email || '').trim(),
        phone: String(quoteForm.phone || '').trim(),
        preferredContactMethod: String(quoteForm.preferredContactMethod || 'phone').trim(),
        city: String(quoteForm.city).trim(),
        source: '3D Configurator',
        projectType: quoteForm.projectType || configParams.projectType || 'home_backup',
        stage: 'New',
        owner: 'Bilal Mahmood (Demo Sales)',
        configurationId: savedCfg.id,
        estimatedValue: savedCfg.computed.financials.grandTotal,
        notes: String(quoteForm.notes || 'Submitted via interactive 3D configurator.').trim(),
        lossReason: null,
        consentTimestamp: nowIso,
        nextAction: 'Initial discovery & site survey scheduling call',
        createdAt: nowIso,
        updatedAt: nowIso
      };

      savedCfg.leadId = newLead.id;
      state.leads.unshift(newLead);

      // Workflow Rule 1: Automatically create an initial follow-up suggestion for the sales team
      const dueTomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const autoFollowUp = {
        id: 'fup_' + Date.now() + '_' + Math.floor(Math.random() * 100),
        organizationId: orgId,
        leadId: newLead.id,
        proposalId: null,
        title: `Qualify new 3D configurator enquiry ${newLead.reference} (${newLead.contactName})`,
        type: 'Lead Qualification',
        dueAt: dueTomorrow,
        status: 'Upcoming',
        assignedTo: newLead.owner,
        completedAt: null,
        createdAt: nowIso
      };
      state.followUps.unshift(autoFollowUp);

      logActivity(
        'lead',
        newLead.id,
        'Quote Request Submitted',
        `${newLead.contactName} submitted enquiry ${newLead.reference} linked to ${savedCfg.reference} (${savedCfg.computed.sizing.actualDcCapacityKw} kW DC). Auto-created follow-up task.`,
        'Customer (3D Configurator)'
      );

      persistState();
      return {
        ok: true,
        lead: newLead,
        configuration: savedCfg,
        followUp: autoFollowUp,
        demoNotice: 'Demo Mode: Your enquiry and 3D configuration snapshot were saved to the browser workspace. No external email or WhatsApp message was sent.'
      };
    }

    /**
     * Update Lead Stage, Owner, or Notes (Section 8.2)
     */
    function updateLead(leadId, updates) {
      const perm = checkPermission('canEditLeads');
      if (!perm.ok) return perm;

      const lead = getLeadById(leadId);
      if (!lead) return { ok: false, code: 'NOT_FOUND', error: 'Lead not found in current organization.' };

      const prevStage = lead.stage;
      if (updates.stage && Estimator.VALID_LEAD_STAGES.includes(updates.stage)) {
        if (updates.stage === 'Lost' && !updates.lossReason && !lead.lossReason) {
          return { ok: false, code: 'VALIDATION_ERROR', error: 'Please select a loss reason (e.g. Price, Timing, Not Qualified, Competitor) when marking a lead Lost.' };
        }
        lead.stage = updates.stage;
      }
      if (updates.lossReason !== undefined) lead.lossReason = updates.lossReason;
      if (updates.owner !== undefined) lead.owner = String(updates.owner).trim();
      if (updates.notes !== undefined) lead.notes = String(updates.notes).trim();
      if (updates.nextAction !== undefined) lead.nextAction = String(updates.nextAction).trim();
      lead.updatedAt = new Date().toISOString();

      if (updates.stage && updates.stage !== prevStage) {
        logActivity(
          'lead',
          lead.id,
          'Lead Stage Updated',
          `${lead.reference} (${lead.contactName}) moved from ${prevStage} to ${lead.stage}${lead.stage === 'Lost' ? ' (Reason: ' + lead.lossReason + ')' : ''}.`
        );
      } else {
        logActivity('lead', lead.id, 'Lead Updated', `Updated details/notes on ${lead.reference}.`);
      }

      persistState();
      return { ok: true, lead };
    }

    /**
     * Create a Proposal Draft from a Lead or Saved Configuration (Section 8.6)
     * Uses current active catalog prices for new drafts, while preserving inactive product warning if needed.
     */
    function createProposalFromRecord({ leadId, configurationId }) {
      const perm = checkPermission('canEditProposals');
      if (!perm.ok) return perm;

      const orgId = getCurrentOrgId();
      const lead = leadId ? getLeadById(leadId) : null;
      const cfg = getConfigurationById(configurationId || (lead && lead.configurationId));

      if (!lead && !cfg) {
        return { ok: false, code: 'NOT_FOUND', error: 'A valid Lead or Saved Configuration is required to create a proposal.' };
      }

      const assumptions = getAssumptions();
      const allProducts = getProducts({ activeOnly: false });

      // Refresh line item prices from current active catalog for a new draft (Section 7.6 & 9.4 rule)
      let baseLines = [];
      if (cfg && cfg.computed && Array.isArray(cfg.computed.financials.lineItems)) {
        baseLines = cfg.computed.financials.lineItems.map(item => {
          const catalogProd = allProducts.find(p => p.id === item.productId);
          // If product is still active in catalog, use current catalog price for the new draft
          const unitPrice = (catalogProd && catalogProd.active) ? catalogProd.customerPrice : item.unitPrice;
          const unitCost = (catalogProd && catalogProd.active) ? catalogProd.internalUnitCost : item.unitCost;
          return Object.assign({}, item, {
            unitPrice,
            unitCost,
            lineTotal: item.quantity * unitPrice
          });
        });
      }

      const financials = Estimator.calculateFinancialTotals({
        assumptions,
        lineItems: baseLines,
        discountPercent: assumptions.defaultDiscountPercent,
        taxRatePercent: assumptions.defaultTaxRatePercent,
        discountTiming: assumptions.discountTiming
      });

      const propSeq = 200 + state.proposals.length + 1;
      const nowIso = new Date().toISOString();
      const expiryDate = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
      const sysSizeKw = cfg ? cfg.computed.sizing.actualDcCapacityKw : 8.19;

      const newProposal = {
        id: 'prop_' + Date.now() + '_' + Math.floor(Math.random() * 100),
        organizationId: orgId,
        leadId: lead ? lead.id : (cfg ? cfg.leadId : null),
        configurationId: cfg ? cfg.id : null,
        reference: `PROP-2026-${propSeq}`,
        title: `${sysSizeKw} kW Solar & Storage Proposal — ${lead ? lead.contactName : (cfg ? cfg.reference : 'Customer')}`,
        status: 'Draft',
        customerSnapshot: {
          name: lead ? lead.contactName : 'Prospective Customer',
          email: lead ? lead.email : '',
          phone: lead ? lead.phone : '',
          city: lead ? lead.city : 'Islamabad'
        },
        systemSizeKw: sysSizeKw,
        currency: assumptions.currency,
        lineItemsSnapshot: financials.lineItems,
        equipmentSubtotal: financials.equipmentSubtotal,
        installationLabor: financials.installationLabor,
        otherCharges: financials.otherCharges,
        grossSubtotal: financials.grossSubtotal,
        discountPercent: financials.discountPercent,
        discountTiming: financials.discountTiming,
        discountAmount: financials.discountAmount,
        taxRatePercent: financials.taxRatePercent,
        taxAmount: financials.taxAmount,
        grandTotal: financials.grandTotal,
        amountPaid: 0,
        balanceDue: financials.grandTotal,
        scopeText: 'Supply, rooftop mounting structure, DC/AC cabling (up to 25m standard run), inverter commissioning, and safety earthing.',
        exclusionsText: 'Civil roof modifications, utility statutory fees, and cable runs over 25 meters.',
        paymentScheduleText: '50% mobilization advance • 40% upon equipment delivery • 10% upon commissioning.',
        indicativeTimelineText: '7–10 working days from advance payment and site readiness.',
        warrantyText: 'Manufacturer product warranties as specified per line item • 2-Year installation workmanship support.',
        expiryDate,
        sentAt: null,
        acceptedAt: null,
        notes: 'Draft generated from saved configuration snapshot.',
        createdAt: nowIso,
        updatedAt: nowIso
      };

      state.proposals.unshift(newProposal);

      if (lead && (lead.stage === 'New' || lead.stage === 'Contacted' || lead.stage === 'Qualified')) {
        lead.stage = 'Proposal Draft';
        lead.estimatedValue = newProposal.grandTotal;
        lead.updatedAt = nowIso;
      }
      if (cfg) {
        cfg.status = 'Converted to Proposal';
      }

      logActivity(
        'proposal',
        newProposal.id,
        'Proposal Draft Created',
        `Created ${newProposal.reference} (${Estimator.formatMoney(newProposal.grandTotal, newProposal.currency)}) from ${cfg ? cfg.reference : lead.reference}.`
      );

      persistState();
      return { ok: true, proposal: newProposal };
    }

    /**
     * Update Proposal Line Items, Pricing Adjustments, Scope, or Lifecycle Status (Section 8.6 & Workflow Rules 2 & 3)
     */
    function updateProposal(proposalId, updates) {
      const perm = checkPermission('canEditProposals');
      if (!perm.ok) return perm;

      const proposal = getProposalById(proposalId);
      if (!proposal) return { ok: false, code: 'NOT_FOUND', error: 'Proposal not found.' };

      const assumptions = getAssumptions();
      const nowIso = new Date().toISOString();

      // If transitioning status, validate lifecycle
      if (updates.status && updates.status !== proposal.status) {
        if (!Estimator.canTransitionProposal(proposal.status, updates.status)) {
          return {
            ok: false,
            code: 'INVALID_TRANSITION',
            error: `Cannot transition proposal directly from "${proposal.status}" to "${updates.status}".`
          };
        }
      }

      // Only recalculate line items if proposal is in Draft or In Review (or being reopened to Draft)
      const isEditableFinancials = proposal.status === 'Draft' || proposal.status === 'In Review' || updates.status === 'Draft';
      if (isEditableFinancials && (updates.lineItems || updates.otherCharges !== undefined || updates.discountPercent !== undefined || updates.taxRatePercent !== undefined || updates.amountPaid !== undefined || updates.discountTiming !== undefined)) {
        const linesToUse = Array.isArray(updates.lineItems) ? updates.lineItems : proposal.lineItemsSnapshot;

        // Workflow Rule 5: Check that no newly added product is inactive
        if (Array.isArray(updates.lineItems)) {
          const existingIds = new Set(proposal.lineItemsSnapshot.map(l => l.productId).filter(Boolean));
          for (const li of updates.lineItems) {
            if (li.productId && !existingIds.has(li.productId)) {
              const prod = state.products.find(p => p.id === li.productId);
              if (prod && !prod.active) {
                return {
                  ok: false,
                  code: 'INACTIVE_PRODUCT',
                  error: `Cannot add archived product "${prod.name}" to a proposal.`
                };
              }
            }
          }
        }

        const fin = Estimator.calculateFinancialTotals({
          assumptions,
          lineItems: linesToUse,
          otherCharges: updates.otherCharges !== undefined ? updates.otherCharges : proposal.otherCharges,
          discountPercent: updates.discountPercent !== undefined ? updates.discountPercent : proposal.discountPercent,
          discountTiming: updates.discountTiming !== undefined ? updates.discountTiming : proposal.discountTiming,
          taxRatePercent: updates.taxRatePercent !== undefined ? updates.taxRatePercent : proposal.taxRatePercent,
          amountPaid: updates.amountPaid !== undefined ? updates.amountPaid : proposal.amountPaid
        });

        proposal.lineItemsSnapshot = fin.lineItems;
        proposal.equipmentSubtotal = fin.equipmentSubtotal;
        proposal.installationLabor = fin.installationLabor;
        proposal.otherCharges = fin.otherCharges;
        proposal.grossSubtotal = fin.grossSubtotal;
        proposal.discountPercent = fin.discountPercent;
        proposal.discountTiming = fin.discountTiming;
        proposal.discountAmount = fin.discountAmount;
        proposal.taxRatePercent = fin.taxRatePercent;
        proposal.taxAmount = fin.taxAmount;
        proposal.grandTotal = fin.grandTotal;
        proposal.amountPaid = fin.amountPaid;
        proposal.balanceDue = fin.balanceDue;
      } else if (updates.amountPaid !== undefined) {
        // Allow updating amountPaid on Sent/Accepted proposals
        const fin = Estimator.calculateFinancialTotals({
          assumptions,
          lineItems: proposal.lineItemsSnapshot,
          otherCharges: proposal.otherCharges,
          discountPercent: proposal.discountPercent,
          discountTiming: proposal.discountTiming,
          taxRatePercent: proposal.taxRatePercent,
          amountPaid: updates.amountPaid
        });
        proposal.amountPaid = fin.amountPaid;
        proposal.balanceDue = fin.balanceDue;
      }

      if (updates.title !== undefined) proposal.title = String(updates.title).trim();
      if (updates.scopeText !== undefined) proposal.scopeText = String(updates.scopeText).trim();
      if (updates.exclusionsText !== undefined) proposal.exclusionsText = String(updates.exclusionsText).trim();
      if (updates.paymentScheduleText !== undefined) proposal.paymentScheduleText = String(updates.paymentScheduleText).trim();
      if (updates.indicativeTimelineText !== undefined) proposal.indicativeTimelineText = String(updates.indicativeTimelineText).trim();
      if (updates.warrantyText !== undefined) proposal.warrantyText = String(updates.warrantyText).trim();
      if (updates.expiryDate !== undefined) proposal.expiryDate = String(updates.expiryDate).trim();
      if (updates.notes !== undefined) proposal.notes = String(updates.notes).trim();

      const prevStatus = proposal.status;
      if (updates.status && updates.status !== prevStatus) {
        proposal.status = updates.status;
        const linkedLead = proposal.leadId ? getLeadById(proposal.leadId) : null;

        // Workflow Rule 2: When a proposal is marked Sent, lock snapshot & create follow-up due after configurable days
        if (updates.status === 'Sent') {
          proposal.sentAt = nowIso;
          if (linkedLead && linkedLead.stage !== 'Won') {
            linkedLead.stage = 'Proposal Sent';
            linkedLead.estimatedValue = proposal.grandTotal;
            linkedLead.updatedAt = nowIso;
          }
          const followUpDays = Estimator.clampNumber(assumptions.proposalFollowUpDays, 1, 30, 3);
          const dueDate = new Date(Date.now() + followUpDays * 24 * 3600 * 1000).toISOString();
          state.followUps.unshift({
            id: 'fup_' + Date.now() + '_' + Math.floor(Math.random() * 100),
            organizationId: getCurrentOrgId(),
            leadId: proposal.leadId,
            proposalId: proposal.id,
            title: `Follow up on sent proposal ${proposal.reference} (${proposal.customerSnapshot.name})`,
            type: 'Proposal Review Call',
            dueAt: dueDate,
            status: 'Upcoming',
            assignedTo: linkedLead ? linkedLead.owner : getCurrentUser().name,
            completedAt: null,
            createdAt: nowIso
          });
          logActivity(
            'proposal',
            proposal.id,
            'Proposal Marked Sent (Demo Mode)',
            `${proposal.reference} marked Sent (${Estimator.formatMoney(proposal.grandTotal, proposal.currency)}). Snapshot locked; follow-up scheduled in ${followUpDays} days. (No real email/WhatsApp dispatched in Demo Mode).`
          );
        } else if (updates.status === 'Accepted') {
          // Workflow Rule 3: When a proposal is Accepted, update linked lead stage to Won and log event
          proposal.acceptedAt = nowIso;
          if (linkedLead) {
            linkedLead.stage = 'Won';
            linkedLead.estimatedValue = proposal.grandTotal;
            linkedLead.nextAction = 'Schedule site installation & net-metering documentation';
            linkedLead.updatedAt = nowIso;
          }
          logActivity(
            'proposal',
            proposal.id,
            'Proposal Accepted & Lead Won',
            `${proposal.reference} accepted by ${proposal.customerSnapshot.name}. Linked lead moved to Won.`
          );
        } else {
          logActivity(
            'proposal',
            proposal.id,
            `Proposal Status -> ${updates.status}`,
            `${proposal.reference} transitioned from ${prevStatus} to ${updates.status}.`
          );
        }
      } else {
        logActivity('proposal', proposal.id, 'Proposal Edited', `Saved changes to ${proposal.reference}.`);
      }

      proposal.updatedAt = nowIso;
      persistState();
      return { ok: true, proposal };
    }

    /**
     * Create or Update Catalog Product (Section 8.4)
     */
    function saveProduct(productData) {
      const perm = checkPermission('canEditCatalog');
      if (!perm.ok) return perm;

      const name = String(productData.name || '').trim();
      const sku = String(productData.sku || '').trim();
      const category = String(productData.category || 'panel').trim();
      const customerPrice = Number(productData.customerPrice);
      const internalUnitCost = Number(productData.internalUnitCost !== undefined ? productData.internalUnitCost : customerPrice * 0.8);

      if (!name || !sku) {
        return { ok: false, code: 'VALIDATION_ERROR', error: 'Product SKU and display name are required.' };
      }
      if (!Number.isFinite(customerPrice) || customerPrice < 0) {
        return { ok: false, code: 'VALIDATION_ERROR', error: 'Customer unit price must be a non-negative number.' };
      }

      const orgId = getCurrentOrgId();
      const nowIso = new Date().toISOString();

      if (productData.id) {
        const existing = state.products.find(p => p.id === productData.id && p.organizationId === orgId);
        if (!existing) return { ok: false, code: 'NOT_FOUND', error: 'Product not found.' };

        existing.sku = sku;
        existing.name = name;
        existing.category = category;
        existing.description = String(productData.description || existing.description || '').trim();
        existing.manufacturer = String(productData.manufacturer || existing.manufacturer || '').trim();
        existing.customerPrice = customerPrice;
        existing.internalUnitCost = Number.isFinite(internalUnitCost) && internalUnitCost >= 0 ? internalUnitCost : existing.internalUnitCost;
        existing.warrantyText = String(productData.warrantyText || existing.warrantyText || '').trim();
        if (productData.wattage !== undefined) existing.wattage = Number(productData.wattage) || existing.wattage;
        if (productData.acCapacityKw !== undefined) existing.acCapacityKw = Number(productData.acCapacityKw) || existing.acCapacityKw;
        if (productData.inverterType !== undefined) existing.inverterType = productData.inverterType;
        if (productData.capacityKwh !== undefined) existing.capacityKwh = Number(productData.capacityKwh) || existing.capacityKwh;
        if (productData.active !== undefined) existing.active = Boolean(productData.active);
        existing.updatedAt = nowIso;

        logActivity(
          'product',
          existing.id,
          existing.active ? 'Catalog Product Updated' : 'Catalog Product Archived',
          `Updated ${existing.sku} (${existing.name}) — Price: ${Estimator.formatMoney(existing.customerPrice, getAssumptions().currency)}. Historical sent proposals remain unchanged.`
        );
        persistState();
        return { ok: true, product: existing };
      } else {
        const newProd = {
          id: 'prod_' + Date.now() + '_' + Math.floor(Math.random() * 100),
          organizationId: orgId,
          sku,
          name,
          category,
          description: String(productData.description || 'Sample demonstration product.').trim(),
          manufacturer: String(productData.manufacturer || 'SunGrid Demo Catalog').trim(),
          wattage: category === 'panel' ? (Number(productData.wattage) || 580) : undefined,
          acCapacityKw: category === 'inverter' ? (Number(productData.acCapacityKw) || 8) : undefined,
          inverterType: category === 'inverter' ? (productData.inverterType || 'hybrid') : undefined,
          capacityKwh: category === 'battery' ? (Number(productData.capacityKwh) || 5.12) : undefined,
          unit: productData.unit || 'unit',
          customerPrice,
          internalUnitCost: Number.isFinite(internalUnitCost) && internalUnitCost >= 0 ? internalUnitCost : Math.round(customerPrice * 0.8),
          warrantyText: String(productData.warrantyText || 'Standard Demo Warranty').trim(),
          active: productData.active !== false,
          createdAt: nowIso,
          updatedAt: nowIso
        };
        state.products.unshift(newProd);
        logActivity('product', newProd.id, 'Catalog Product Created', `Added ${newProd.sku} (${newProd.name}) to catalog.`);
        persistState();
        return { ok: true, product: newProd };
      }
    }

    /**
     * Update Pricing & Estimator Assumptions (Section 8.5)
     */
    function updateAssumptions(updates) {
      const perm = checkPermission('canEditAssumptions');
      if (!perm.ok) return perm;

      const a = getAssumptions();
      if (updates.currency) a.currency = String(updates.currency).trim();
      if (updates.locale) a.locale = String(updates.locale).trim();
      if (updates.regionLabel) a.regionLabel = String(updates.regionLabel).trim();
      if (updates.peakSunHoursPerDay !== undefined) {
        a.peakSunHoursPerDay = Estimator.clampNumber(updates.peakSunHoursPerDay, 1.5, 9.0, a.peakSunHoursPerDay);
      }
      if (updates.performanceFactor !== undefined) {
        a.performanceFactor = Estimator.clampNumber(updates.performanceFactor, 0.50, 0.95, a.performanceFactor);
      }
      if (updates.assumedTariffPerKwh !== undefined) {
        a.assumedTariffPerKwh = Estimator.clampNumber(updates.assumedTariffPerKwh, 1, 5000, a.assumedTariffPerKwh);
      }
      if (updates.exportCreditPerKwh !== undefined) {
        a.exportCreditPerKwh = Estimator.clampNumber(updates.exportCreditPerKwh, 0, 5000, a.exportCreditPerKwh);
      }
      if (updates.usableDodFraction !== undefined) {
        a.usableDodFraction = Estimator.clampNumber(updates.usableDodFraction, 0.50, 1.0, a.usableDodFraction);
      }
      if (updates.defaultDiscountPercent !== undefined) {
        a.defaultDiscountPercent = Estimator.clampNumber(updates.defaultDiscountPercent, 0, 50, a.defaultDiscountPercent);
      }
      if (updates.defaultTaxRatePercent !== undefined) {
        a.defaultTaxRatePercent = Estimator.clampNumber(updates.defaultTaxRatePercent, 0, 50, a.defaultTaxRatePercent);
      }
      if (updates.discountTiming === 'before_tax' || updates.discountTiming === 'after_tax') {
        a.discountTiming = updates.discountTiming;
      }
      if (updates.maxVisiblePanels !== undefined) {
        a.maxVisiblePanels = Estimator.clampNumber(updates.maxVisiblePanels, 8, 60, a.maxVisiblePanels);
      }
      if (updates.disclaimerText !== undefined) {
        a.disclaimerText = String(updates.disclaimerText).trim();
      }
      a.updatedAt = new Date().toISOString();

      const org = getOrganization();
      if (org && updates.currency) org.defaultCurrency = a.currency;
      if (org && updates.locale) org.locale = a.locale;

      logActivity('assumptions', a.id, 'Pricing & Estimator Assumptions Updated', `Updated estimator parameters (PSH: ${a.peakSunHoursPerDay}h, Perf: ${a.performanceFactor}, Currency: ${a.currency}).`);
      persistState();
      return { ok: true, assumptions: a };
    }

    /**
     * Update White-Label Organization Brand Settings (Section 8.9)
     */
    function updateOrganizationSettings(updates) {
      const perm = checkPermission('canEditSettings');
      if (!perm.ok) return perm;

      const org = getOrganization();
      if (!org) return { ok: false, error: 'Organization not found.' };

      if (updates.name && String(updates.name).trim().length >= 2) org.name = String(updates.name).trim();
      if (updates.tagline !== undefined) org.tagline = String(updates.tagline).trim();
      if (updates.primaryColor) org.primaryColor = String(updates.primaryColor).trim();
      if (updates.secondaryColor) org.secondaryColor = String(updates.secondaryColor).trim();
      if (updates.logoType) org.logoType = String(updates.logoType).trim();
      if (updates.logoUrl !== undefined) org.logoUrl = String(updates.logoUrl).trim();
      if (updates.contactEmail !== undefined) org.contactEmail = String(updates.contactEmail).trim();
      if (updates.contactPhone !== undefined) org.contactPhone = String(updates.contactPhone).trim();
      if (updates.city !== undefined) org.city = String(updates.city).trim();
      if (updates.publicCtaText !== undefined) org.publicCtaText = String(updates.publicCtaText).trim();
      if (updates.consentCopy !== undefined) org.consentCopy = String(updates.consentCopy).trim();
      if (updates.defaultCurrency) {
        org.defaultCurrency = String(updates.defaultCurrency).trim();
        state.assumptions.currency = org.defaultCurrency;
      }
      if (updates.locale) {
        org.locale = String(updates.locale).trim();
        state.assumptions.locale = org.locale;
      }
      org.updatedAt = new Date().toISOString();

      logActivity('organization', org.id, 'White-Label Brand Settings Updated', `Updated brand identity for ${org.name}.`);
      persistState();
      return { ok: true, organization: org };
    }

    /**
     * Create or Complete Follow-up Reminder (Section 8.7)
     */
    function createFollowUp(data) {
      const perm = checkPermission('canEditFollowUps');
      if (!perm.ok) return perm;

      const title = String(data.title || '').trim();
      if (!title) return { ok: false, error: 'Follow-up title is required.' };

      const fup = {
        id: 'fup_' + Date.now() + '_' + Math.floor(Math.random() * 100),
        organizationId: getCurrentOrgId(),
        leadId: data.leadId || null,
        proposalId: data.proposalId || null,
        title,
        type: data.type || 'Follow-Up Call',
        dueAt: data.dueAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        status: 'Upcoming',
        assignedTo: data.assignedTo || getCurrentUser().name,
        completedAt: null,
        createdAt: new Date().toISOString()
      };
      state.followUps.unshift(fup);
      refreshFollowUpUrgency();
      logActivity('followup', fup.id, 'Follow-Up Scheduled', `Scheduled "${fup.title}" due ${fup.dueAt.slice(0, 10)}.`);
      persistState();
      return { ok: true, followUp: fup };
    }

    function toggleFollowUpComplete(followUpId) {
      const perm = checkPermission('canEditFollowUps');
      if (!perm.ok) return perm;

      const fup = state.followUps.find(f => f.id === followUpId && f.organizationId === getCurrentOrgId());
      if (!fup) return { ok: false, error: 'Follow-up not found.' };

      if (fup.status === 'Completed') {
        fup.completedAt = null;
        fup.status = 'Upcoming';
        refreshFollowUpUrgency();
        logActivity('followup', fup.id, 'Follow-Up Reopened', `Reopened follow-up "${fup.title}".`);
      } else {
        fup.completedAt = new Date().toISOString();
        fup.status = 'Completed';
        logActivity('followup', fup.id, 'Follow-Up Completed', `Completed follow-up "${fup.title}".`);
      }
      persistState();
      return { ok: true, followUp: fup };
    }

    /**
     * Section 10: Deterministic Sales Copilot (Template-Based Assistant)
     * Honest, grounded in saved records, no fake remote LLM streaming.
     */
    const copilot = {
      summarizeLead(leadId) {
        const lead = getLeadById(leadId) || getLeads()[0];
        if (!lead) return { title: 'No Lead Selected', body: 'Select a lead to generate a grounded summary.', sources: [] };
        const cfg = lead.configurationId ? getConfigurationById(lead.configurationId) : null;
        const props = getProposals().filter(p => p.leadId === lead.id);
        const fups = getFollowUps().filter(f => f.leadId === lead.id && f.status !== 'Completed');
        const currency = getAssumptions().currency;

        const lines = [
          `Lead Summary: ${lead.contactName} (${lead.reference})`,
          `• Current Stage: ${lead.stage} | Assigned Owner: ${lead.owner}`,
          `• Location & Source: ${lead.city} via ${lead.source} (Preferred contact: ${lead.preferredContactMethod.toUpperCase()})`,
          cfg
            ? `• Attached Configuration (${cfg.reference}): ${cfg.computed.sizing.actualDcCapacityKw} kW DC (${cfg.computed.sizing.selectedPanelCount} panels), ${cfg.includeBattery ? cfg.computed.battery.totalNominalCapacityKwh + ' kWh LFP backup' : 'Grid-tied (no battery)'} — Preliminary total ${Estimator.formatMoney(cfg.computed.financials.grandTotal, currency)}.`
            : `• Estimated Pipeline Value: ${Estimator.formatMoney(lead.estimatedValue, currency)}.`,
          props.length > 0
            ? `• Linked Proposals: ${props.map(p => `${p.reference} (${p.status} — ${Estimator.formatMoney(p.grandTotal, p.currency)})`).join(', ')}.`
            : `• Linked Proposals: None created yet.`,
          `• Recorded Notes: "${lead.notes || 'No notes entered.'}"`,
          `• Recommended Next Action: ${fups.length > 0 ? fups[0].title + ' (' + fups[0].status + ')' : lead.nextAction}`
        ];

        return {
          modeLabel: 'Template-Based Demo Assistant (Deterministic)',
          title: `Lead Brief — ${lead.reference}`,
          body: lines.join('\n'),
          sources: [lead.reference, cfg ? cfg.reference : null, ...props.map(p => p.reference)].filter(Boolean)
        };
      },

      draftFollowUpMessage(leadId) {
        const lead = getLeadById(leadId) || getLeads()[0];
        if (!lead) return { title: 'No Lead Selected', body: '', sources: [] };
        const org = getOrganization();
        const cfg = lead.configurationId ? getConfigurationById(lead.configurationId) : null;
        const prop = getProposals().find(p => p.leadId === lead.id);
        const currency = getAssumptions().currency;

        const systemDesc = cfg
          ? `${cfg.computed.sizing.actualDcCapacityKw} kW solar setup${cfg.includeBattery ? ' with ' + cfg.computed.battery.totalNominalCapacityKwh + ' kWh battery backup' : ''}`
          : 'preliminary solar configuration';

        const totalDesc = prop
          ? `${Estimator.formatMoney(prop.grandTotal, prop.currency)} (Proposal ${prop.reference})`
          : (cfg ? `${Estimator.formatMoney(cfg.computed.financials.grandTotal, currency)} (${cfg.reference})` : Estimator.formatMoney(lead.estimatedValue, currency));

        const draft = [
          `Subject: Next steps for your ${systemDesc} — ${org.name}`,
          ``,
          `Dear ${lead.contactName.replace(/\s*\(Sample\)/i, '')},`,
          ``,
          `Thank you for exploring your ${systemDesc} with ${org.name} for your property in ${lead.city}.`,
          ``,
          `Based on the assumptions in your saved snapshot (${totalDesc} preliminary estimate), the next step before confirming a final engineering layout and firm price is a brief on-site roof and electrical panel check.`,
          ``,
          `Would you have 20 minutes this week for our technical surveyor to inspect the roof orientation, shading, and cable routing? You can reply directly or reach us at ${org.contactPhone}.`,
          ``,
          `Warm regards,`,
          `${lead.owner}`,
          `${org.name}`
        ].join('\n');

        return {
          modeLabel: 'Template-Based Demo Assistant (Deterministic)',
          title: `Follow-Up Draft for ${lead.contactName}`,
          body: draft,
          sources: [lead.reference, cfg ? cfg.reference : null, prop ? prop.reference : null].filter(Boolean)
        };
      },

      explainProposalForCustomer(proposalId) {
        const prop = getProposalById(proposalId) || getProposals()[0];
        if (!prop) return { title: 'No Proposal Found', body: '', sources: [] };
        const itemSummary = prop.lineItemsSnapshot
          .map(li => `  - ${li.quantity} × ${li.name}: ${Estimator.formatMoney(li.lineTotal, prop.currency)}`)
          .join('\n');

        const body = [
          `Customer-Friendly Proposal Summary (${prop.reference})`,
          `• System Size: ${prop.systemSizeKw} kW DC Solar Installation`,
          `• Status: ${prop.status} | Valid Until: ${prop.expiryDate}`,
          `• Included Equipment & Services:`,
          itemSummary,
          `• Financial Summary: Subtotal ${Estimator.formatMoney(prop.grossSubtotal, prop.currency)}${prop.discountAmount > 0 ? ' minus ' + Estimator.formatMoney(prop.discountAmount, prop.currency) + ' discount' : ''} = Grand Total ${Estimator.formatMoney(prop.grandTotal, prop.currency)} (Paid: ${Estimator.formatMoney(prop.amountPaid, prop.currency)} | Balance Due: ${Estimator.formatMoney(prop.balanceDue, prop.currency)}).`,
          `• What Is Included: ${prop.scopeText}`,
          `• What Is Excluded: ${prop.exclusionsText}`,
          `• Important Note: Final engineering, cable sizing, and energy production depend on physical site verification.`
        ].join('\n');

        return {
          modeLabel: 'Template-Based Demo Assistant (Deterministic)',
          title: `Plain-Language Proposal Explanation (${prop.reference})`,
          body,
          sources: [prop.reference, prop.configurationId, prop.leadId].filter(Boolean)
        };
      },

      generateDailyBrief() {
        const leads = getLeads();
        const proposals = getProposals();
        const followUps = getFollowUps();
        const currency = getAssumptions().currency;

        const overdue = followUps.filter(f => f.status === 'Overdue');
        const dueToday = followUps.filter(f => f.status === 'Due Today');
        const openProposals = proposals.filter(p => p.status === 'Sent' || p.status === 'Draft' || p.status === 'In Review');
        const openValue = openProposals.reduce((s, p) => s + p.grandTotal, 0);
        const newLeads = leads.filter(l => l.stage === 'New');

        const body = [
          `Owner's Daily Workspace Brief (${getOrganization().name})`,
          `• Pipeline Snapshot: ${leads.length} total leads (${newLeads.length} in 'New' stage awaiting first contact).`,
          `• Active Proposals: ${openProposals.length} open proposals totaling ${Estimator.formatMoney(openValue, currency)}.`,
          `• Urgent Follow-Ups (${overdue.length} Overdue, ${dueToday.length} Due Today):`,
          ...overdue.map(f => `  [OVERDUE] ${f.title} (Assigned: ${f.assignedTo})`),
          ...dueToday.map(f => `  [DUE TODAY] ${f.title} (Assigned: ${f.assignedTo})`),
          `• Priority Recommendation: Contact ${overdue[0] ? overdue[0].title : 'new configurator enquiries'} first, then finalize Draft proposal PROP-2026-203.`
        ].join('\n');

        return {
          modeLabel: 'Template-Based Demo Assistant (Deterministic)',
          title: `Owner's Daily Brief — Grounded in Workspace Records`,
          body,
          sources: [`${leads.length} Leads`, `${proposals.length} Proposals`, `${followUps.length} Follow-Ups`]
        };
      }
    };

    return {
      getState: () => state,
      resetToSeedData,
      getCurrentOrgId,
      getCurrentUser,
      setActiveRole,
      checkPermission,
      getOrganization,
      getAssumptions,
      getProducts,
      getPackages,
      getConfigurations,
      getConfigurationById,
      getConfigurationByShareToken,
      getLeads,
      getLeadById,
      getProposals,
      getProposalById,
      getFollowUps,
      getActivities,
      getIntegrations,
      getUsers,
      buildConfigurationComputation,
      saveConfigurationSnapshot,
      submitQuoteRequest,
      updateLead,
      createProposalFromRecord,
      updateProposal,
      saveProduct,
      updateAssumptions,
      updateOrganizationSettings,
      createFollowUp,
      toggleFollowUpComplete,
      copilot
    };
  }

  return {
    ROLE_PERMISSIONS,
    createStore
  };
});
