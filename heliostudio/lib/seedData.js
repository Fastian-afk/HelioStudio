/**
 * HelioStudio — Deterministic Seed Data for SunGrid Energy (Sample Demo Organization)
 * All brands, SKUs, customer names, and prices are fictional demonstration data.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Estimator = require('./estimator.js');
    module.exports = factory(Estimator);
  } else {
    root.HelioSeed = factory(root.HelioEstimator);
  }
})(typeof self !== 'undefined' ? self : this, function (Estimator) {
  'use strict';

  function createInitialSeedData() {
    const orgId = 'org_sungrid_demo';
    const secondaryOrgId = 'org_solarpeak_secondary';

    const organizations = [
      {
        id: orgId,
        name: 'SunGrid Energy (Sample Demo)',
        slug: 'sungrid-energy',
        tagline: 'Solar, made tangible.',
        active: true,
        isDemo: true,
        defaultCurrency: 'PKR',
        locale: 'en-PK',
        timezone: 'Asia/Karachi',
        primaryColor: '#d97706', // Solar Amber
        secondaryColor: '#0f172a', // Midnight Slate
        logoType: 'geometric_sun',
        logoUrl: '',
        contactEmail: 'demo-sales@sungrid-sample.example',
        contactPhone: '+92 51 555 0199 (Demo)',
        city: 'Islamabad, Pakistan',
        publicCtaText: 'Request Site Assessment & Formal Quote',
        consentCopy: 'I understand this is an illustrative preliminary estimate and consent to follow-up from SunGrid Energy (Demo Workspace) regarding a site assessment.',
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-16T08:00:00Z'
      },
      {
        id: secondaryOrgId,
        name: 'HelioNordic Commercial (Tenant B Isolation Test)',
        slug: 'helionordic-commercial',
        tagline: 'Commercial clean energy configurator.',
        active: true,
        isDemo: true,
        defaultCurrency: 'EUR',
        locale: 'en-IE',
        timezone: 'Europe/Dublin',
        primaryColor: '#0284c7',
        secondaryColor: '#0f172a',
        logoType: 'hex_grid',
        logoUrl: '',
        contactEmail: 'info@helionordic-sample.example',
        contactPhone: '+353 1 555 0140 (Demo)',
        city: 'Dublin, Ireland',
        publicCtaText: 'Request Commercial Quote',
        consentCopy: 'I acknowledge this preliminary estimate is subject to engineering survey.',
        createdAt: '2026-09-15T10:00:00Z',
        updatedAt: '2026-10-15T12:00:00Z'
      }
    ];

    const users = [
      {
        id: 'usr_admin_1',
        organizationId: orgId,
        name: 'Zainab Tariq (Demo Admin)',
        email: 'zainab.demo@sungrid-sample.example',
        role: 'Owner/Admin',
        status: 'Active',
        createdAt: '2026-09-01T09:00:00Z'
      },
      {
        id: 'usr_sales_1',
        organizationId: orgId,
        name: 'Bilal Mahmood (Demo Sales)',
        email: 'bilal.demo@sungrid-sample.example',
        role: 'Sales',
        status: 'Active',
        createdAt: '2026-09-02T10:00:00Z'
      },
      {
        id: 'usr_sales_2',
        organizationId: orgId,
        name: 'Ayesha Siddiqui (Demo Sales)',
        email: 'ayesha.demo@sungrid-sample.example',
        role: 'Sales',
        status: 'Active',
        createdAt: '2026-09-03T11:00:00Z'
      },
      {
        id: 'usr_viewer_1',
        organizationId: orgId,
        name: 'Omar Farooq (Demo Viewer)',
        email: 'omar.demo@sungrid-sample.example',
        role: 'Viewer',
        status: 'Active',
        createdAt: '2026-09-05T14:00:00Z'
      }
    ];

    const assumptions = Object.assign({}, Estimator.DEFAULT_ASSUMPTIONS, {
      id: 'assump_sungrid_v1',
      organizationId: orgId,
      name: 'Pakistan Metro Standard v2.4 (Sample)',
      updatedAt: '2026-10-15T14:00:00Z'
    });

    const products = [
      // Panels
      {
        id: 'prod_panel_550',
        organizationId: orgId,
        sku: 'SG-PV-550M',
        name: 'HelioCell 550W Mono PERC Module (Sample)',
        category: 'panel',
        description: 'High-efficiency half-cut monocrystalline module with anodized aluminum frame (Fictional Demo SKU).',
        manufacturer: 'HelioCell Demo Labs',
        wattage: 550,
        unit: 'panel',
        customerPrice: 27500,
        internalUnitCost: 22500,
        warrantyText: '12-Year Product / 25-Year Linear Output (Illustrative)',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'prod_panel_585',
        organizationId: orgId,
        sku: 'SG-PV-585B',
        name: 'HelioMax 585W N-Type Bifacial Dual-Glass (Sample)',
        category: 'panel',
        description: 'N-Type TOPCon bifacial module with dual tempered glass and anti-reflective coating (Fictional Demo SKU).',
        manufacturer: 'HelioCell Demo Labs',
        wattage: 585,
        unit: 'panel',
        customerPrice: 31000,
        internalUnitCost: 25200,
        warrantyText: '15-Year Product / 30-Year Linear Output (Illustrative)',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'prod_panel_620',
        organizationId: orgId,
        sku: 'SG-PV-620C',
        name: 'HelioPro 620W Commercial High-Density Module (Sample)',
        category: 'panel',
        description: 'Large-format high-density module for spacious residential and light commercial roofs (Fictional Demo SKU).',
        manufacturer: 'AuroraSolar Fictional Corp',
        wattage: 620,
        unit: 'panel',
        customerPrice: 34500,
        internalUnitCost: 28000,
        warrantyText: '15-Year Product / 30-Year Linear Output (Illustrative)',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      // Inverters
      {
        id: 'prod_inv_6kw_gt',
        organizationId: orgId,
        sku: 'SG-INV-6GT',
        name: 'VoltStream 6kW Three-Phase Grid-Tied Inverter (Sample)',
        category: 'inverter',
        description: 'Dual-MPPT grid-tied string inverter with IP65 enclosure for daytime bill offset (Fictional Demo SKU).',
        manufacturer: 'VoltStream Demo Electronics',
        acCapacityKw: 6,
        inverterType: 'grid_tied',
        unit: 'unit',
        customerPrice: 185000,
        internalUnitCost: 148000,
        warrantyText: '5-Year Standard Replacement Warranty (Illustrative)',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'prod_inv_8kw_hyb',
        organizationId: orgId,
        sku: 'SG-INV-8HYB',
        name: 'VoltStream 8kW Smart Hybrid Inverter (Sample)',
        category: 'inverter',
        description: 'Hybrid solar & battery inverter supporting essential-load backup and smart net-metering export (Fictional Demo SKU).',
        manufacturer: 'VoltStream Demo Electronics',
        acCapacityKw: 8,
        inverterType: 'hybrid',
        unit: 'unit',
        customerPrice: 345000,
        internalUnitCost: 278000,
        warrantyText: '5-Year Comprehensive Warranty (Illustrative)',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'prod_inv_12kw_hyb',
        organizationId: orgId,
        sku: 'SG-INV-12HYB',
        name: 'VoltStream 12kW Three-Phase Heavy Hybrid Inverter (Sample)',
        category: 'inverter',
        description: 'High-capacity 3-phase hybrid inverter for large homes and small commercial offices (Fictional Demo SKU).',
        manufacturer: 'VoltStream Demo Electronics',
        acCapacityKw: 12,
        inverterType: 'hybrid',
        unit: 'unit',
        customerPrice: 465000,
        internalUnitCost: 375000,
        warrantyText: '7-Year Comprehensive Warranty (Illustrative)',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      // Batteries
      {
        id: 'prod_bat_5kwh',
        organizationId: orgId,
        sku: 'SG-BAT-5LFP',
        name: 'CoreVault 5.12 kWh LiFePO4 Wall Battery (Sample)',
        category: 'battery',
        description: 'Modular lithium iron phosphate (LFP) wall-mounted storage pack with integrated BMS (Fictional Demo SKU).',
        manufacturer: 'CoreVault Storage Demo',
        capacityKwh: 5.12,
        unit: 'pack',
        customerPrice: 360000,
        internalUnitCost: 292000,
        warrantyText: '7-Year / 6,000 Cycle Warranty (Illustrative)',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'prod_bat_10kwh',
        organizationId: orgId,
        sku: 'SG-BAT-10LFP',
        name: 'CoreVault Pro 10.24 kWh High-Density LFP Stack (Sample)',
        category: 'battery',
        description: 'Dual-module LFP floor/wall battery bank for extended backup runtime (Fictional Demo SKU).',
        manufacturer: 'CoreVault Storage Demo',
        capacityKwh: 10.24,
        unit: 'stack',
        customerPrice: 685000,
        internalUnitCost: 555000,
        warrantyText: '10-Year / 6,000 Cycle Warranty (Illustrative)',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      // Mounting & Electrical BOS & Labor
      {
        id: 'prod_mount_std',
        organizationId: orgId,
        sku: 'SG-MNT-ALU',
        name: 'Anodized Aluminum Roof Rail & Clamp Kit (Per Panel)',
        category: 'mounting',
        description: 'Corrosion-resistant L2/pitched roof rail structure with stainless steel fasteners (Sample Data).',
        manufacturer: 'SunGrid Structure Works',
        unit: 'per_panel',
        customerPrice: 4800,
        internalUnitCost: 3500,
        warrantyText: '10-Year Structural Material Warranty (Illustrative)',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'prod_bos_std',
        organizationId: orgId,
        sku: 'SG-BOS-PRO',
        name: 'DC/AC Protection Box, Surge Arrestors & Earthing Kit',
        category: 'bos',
        description: 'Complete balance-of-system protection enclosure, DC isolators, AC breakers, and copper earthing rod (Sample Data).',
        manufacturer: 'SunGrid Electrical Demo',
        unit: 'kit',
        customerPrice: 65000,
        internalUnitCost: 48000,
        warrantyText: '2-Year Workmanship & Component Warranty (Illustrative)',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'prod_labor_inst',
        organizationId: orgId,
        sku: 'SG-SVC-INST',
        name: 'Standard Mechanical & Electrical Installation Service',
        category: 'labor',
        description: 'Preliminary installation, commissioning, and safety testing allowance (subject to site survey).',
        manufacturer: 'SunGrid Field Engineering',
        unit: 'job',
        customerPrice: 85000,
        internalUnitCost: 58000,
        warrantyText: '2-Year Installation Workmanship Support',
        active: true,
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'prod_panel_legacy_450',
        organizationId: orgId,
        sku: 'SG-PV-450L-OLD',
        name: 'Legacy 450W Poly-Si Module (Archived Sample)',
        category: 'panel',
        description: 'Discontinued 450W module retained for historical proposal snapshot integrity testing.',
        manufacturer: 'HelioCell Demo Labs',
        wattage: 450,
        unit: 'panel',
        customerPrice: 21000,
        internalUnitCost: 17500,
        warrantyText: '10-Year Product Warranty (Archived)',
        active: false, // Archived!
        createdAt: '2026-06-01T09:00:00Z',
        updatedAt: '2026-08-15T09:00:00Z'
      },
      // Secondary Org product for tenant isolation test
      {
        id: 'prod_tenant_b_1',
        organizationId: secondaryOrgId,
        sku: 'HN-PV-600',
        name: 'NordicSolar 600W Bifacial Module',
        category: 'panel',
        description: 'Tenant B exclusive catalog item.',
        manufacturer: 'NordicSolar',
        wattage: 600,
        unit: 'panel',
        customerPrice: 210,
        internalUnitCost: 160,
        warrantyText: '25 Years',
        active: true,
        createdAt: '2026-09-15T10:00:00Z',
        updatedAt: '2026-09-15T10:00:00Z'
      }
    ];

    const packages = [
      {
        id: 'pkg_essential',
        organizationId: orgId,
        key: 'essential',
        name: 'Essential Grid-Tied',
        badge: 'Daytime Offset',
        useCase: 'grid_tied',
        summary: 'Streamlined daytime solar generation designed to offset daytime electricity usage with minimal equipment footprint.',
        panelProductId: 'prod_panel_550',
        inverterProductId: 'prod_inv_6kw_gt',
        batteryProductId: null,
        includeBattery: false,
        defaultBatteryQty: 0,
        mountingProductId: 'prod_mount_std',
        bosProductId: 'prod_bos_std',
        laborProductId: 'prod_labor_inst',
        warrantyHighlight: '12-Yr Module / 5-Yr Grid Inverter (Illustrative)',
        recommendedFor: 'Homes or offices with steady daytime occupancy and stable grid supply.'
      },
      {
        id: 'pkg_balanced',
        organizationId: orgId,
        key: 'balanced',
        name: 'Balanced Hybrid Ready',
        badge: 'Demo Default',
        isDefault: true,
        useCase: 'hybrid',
        summary: 'Pairs high-efficiency N-Type 585W bifacial panels with a smart hybrid inverter and a 5.12 kWh LFP backup pack for essential circuits.',
        panelProductId: 'prod_panel_585',
        inverterProductId: 'prod_inv_8kw_hyb',
        batteryProductId: 'prod_bat_5kwh',
        includeBattery: true,
        defaultBatteryQty: 1,
        mountingProductId: 'prod_mount_std',
        bosProductId: 'prod_bos_std',
        laborProductId: 'prod_labor_inst',
        warrantyHighlight: '15-Yr Bifacial Module / 5-Yr Hybrid / 7-Yr LFP Battery',
        recommendedFor: 'Households seeking both monthly bill reduction and seamless backup for lights, fans, Wi-Fi, and refrigeration.'
      },
      {
        id: 'pkg_backup_plus',
        organizationId: orgId,
        key: 'backup_plus',
        name: 'Backup Plus Endurance',
        badge: 'Extended Storage',
        useCase: 'hybrid_backup',
        summary: 'High-capacity 620W modules, 12kW 3-phase hybrid inverter, and 10.24 kWh LFP storage bank for longer outage endurance.',
        panelProductId: 'prod_panel_620',
        inverterProductId: 'prod_inv_12kw_hyb',
        batteryProductId: 'prod_bat_10kwh',
        includeBattery: true,
        defaultBatteryQty: 1,
        mountingProductId: 'prod_mount_std',
        bosProductId: 'prod_bos_std',
        laborProductId: 'prod_labor_inst',
        warrantyHighlight: '15-Yr Module / 7-Yr Heavy Hybrid / 10-Yr LFP Stack',
        recommendedFor: 'Larger residences or small clinics/offices requiring multi-hour backup runtime.'
      }
    ];

    // Helper to build a normalized configuration snapshot
    function buildSeedConfig(cfgInput) {
      const energy = Estimator.calculateEnergyAndTargetKw(cfgInput.energyInput, assumptions);
      const panelProd = products.find(p => p.id === cfgInput.panelProductId) || products[1];
      const invProd = products.find(p => p.id === cfgInput.inverterProductId) || products[4];
      const batProd = cfgInput.includeBattery
        ? (products.find(p => p.id === cfgInput.batteryProductId) || products[6])
        : null;
      const mountProd = products.find(p => p.id === 'prod_mount_std');
      const bosProd = products.find(p => p.id === 'prod_bos_std');
      const laborProd = products.find(p => p.id === 'prod_labor_inst');

      const sizing = Estimator.calculatePanelAndInverterSizing({
        assumptions,
        preliminaryDcTargetKw: energy.preliminaryDcTargetKw,
        panelProduct: panelProd,
        inverterProduct: invProd,
        includeBattery: cfgInput.includeBattery,
        manualPanelCount: cfgInput.manualPanelCount
      });

      const battery = Estimator.calculateBatteryEstimate({
        assumptions,
        includeBattery: cfgInput.includeBattery,
        backupLoadKw: cfgInput.backupLoadKw || 1.8,
        targetRuntimeHours: cfgInput.targetRuntimeHours || 4,
        batteryProduct: batProd,
        manualBatteryQuantity: cfgInput.manualBatteryQuantity
      });

      const lineItems = [
        {
          id: 'li_panel',
          productId: panelProd.id,
          sku: panelProd.sku,
          name: panelProd.name,
          category: 'panel',
          description: `${sizing.selectedPanelCount} × ${panelProd.wattage}W (${sizing.actualDcCapacityKw} kW DC total)`,
          warrantyText: panelProd.warrantyText,
          quantity: sizing.selectedPanelCount,
          unitPrice: panelProd.customerPrice,
          unitCost: panelProd.internalUnitCost
        },
        {
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
        }
      ];

      if (cfgInput.includeBattery && batProd && battery.selectedBatteryQuantity > 0) {
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
          description: `Structure & rails for ${sizing.selectedPanelCount} modules`,
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
        discountPercent: cfgInput.discountPercent || 0,
        taxRatePercent: cfgInput.taxRatePercent || 0
      });

      const payback = Estimator.calculateIllustrativePayback({
        assumptions,
        estimatedMonthlyGenerationKwh: sizing.estimatedMonthlyGenerationKwh,
        monthlyKwh: energy.monthlyKwh,
        grandTotal: financials.grandTotal,
        includeBattery: cfgInput.includeBattery,
        assumedTariffPerKwh: energy.assumedTariffPerKwh
      });

      return {
        id: cfgInput.id,
        reference: cfgInput.reference,
        organizationId: orgId,
        leadId: cfgInput.leadId || null,
        shareToken: cfgInput.shareToken,
        source: cfgInput.source || '3D Configurator',
        projectType: cfgInput.projectType || 'home',
        selectedPackageKey: cfgInput.selectedPackageKey || 'balanced',
        roofOrientation: cfgInput.roofOrientation || 'South',
        roofPitchDeg: cfgInput.roofPitchDeg || 22,
        energyInput: cfgInput.energyInput,
        panelProductId: panelProd.id,
        inverterProductId: invProd.id,
        batteryProductId: batProd ? batProd.id : null,
        includeBattery: Boolean(cfgInput.includeBattery),
        backupLoadKw: battery.backupLoadKw,
        targetRuntimeHours: battery.targetRuntimeHours,
        computed: {
          energy,
          sizing,
          battery,
          financials,
          payback
        },
        currency: assumptions.currency,
        disclaimerSnapshot: assumptions.disclaimerText,
        assumptionsVersion: assumptions.name,
        status: cfgInput.status || 'Saved',
        createdAt: cfgInput.createdAt,
        updatedAt: cfgInput.createdAt
      };
    }

    const configurations = [
      buildSeedConfig({
        id: 'cfg_101',
        reference: 'CFG-2026-101',
        leadId: 'lead_101',
        shareToken: 'sh_9f8a7b6c5d4e3f2a1b0c',
        source: '3D Configurator',
        projectType: 'home_backup',
        selectedPackageKey: 'balanced',
        roofOrientation: 'South',
        energyInput: { energyInputMode: 'kwh', monthlyKwh: 950 },
        panelProductId: 'prod_panel_585',
        inverterProductId: 'prod_inv_8kw_hyb',
        batteryProductId: 'prod_bat_5kwh',
        includeBattery: true,
        manualPanelCount: 14,
        manualBatteryQuantity: 1,
        backupLoadKw: 1.8,
        targetRuntimeHours: 4,
        status: 'Attached to Lead',
        createdAt: '2026-10-10T11:20:00Z'
      }),
      buildSeedConfig({
        id: 'cfg_102',
        reference: 'CFG-2026-102',
        leadId: 'lead_102',
        shareToken: 'sh_1a2b3c4d5e6f7a8b9c0d',
        source: '3D Configurator',
        projectType: 'small_business',
        selectedPackageKey: 'backup_plus',
        roofOrientation: 'South-West',
        energyInput: { energyInputMode: 'bill', monthlyBillAmount: 85500, customTariffPerKwh: 45 },
        panelProductId: 'prod_panel_620',
        inverterProductId: 'prod_inv_12kw_hyb',
        batteryProductId: 'prod_bat_10kwh',
        includeBattery: true,
        manualPanelCount: 24,
        manualBatteryQuantity: 1,
        backupLoadKw: 3.2,
        targetRuntimeHours: 3,
        status: 'Converted to Proposal',
        createdAt: '2026-10-11T14:15:00Z'
      }),
      buildSeedConfig({
        id: 'cfg_103',
        reference: 'CFG-2026-103',
        leadId: 'lead_103',
        shareToken: 'sh_2b3c4d5e6f7a8b9c0d1e',
        source: 'Consultation Tablet',
        projectType: 'home',
        selectedPackageKey: 'essential',
        roofOrientation: 'South',
        energyInput: { energyInputMode: 'kwh', monthlyKwh: 650 },
        panelProductId: 'prod_panel_550',
        inverterProductId: 'prod_inv_6kw_gt',
        batteryProductId: null,
        includeBattery: false,
        manualPanelCount: 10,
        status: 'Converted to Proposal',
        createdAt: '2026-10-12T09:45:00Z'
      }),
      buildSeedConfig({
        id: 'cfg_104',
        reference: 'CFG-2026-104',
        leadId: 'lead_104',
        shareToken: 'sh_3c4d5e6f7a8b9c0d1e2f',
        source: '3D Configurator',
        projectType: 'home_backup',
        selectedPackageKey: 'backup_plus',
        roofOrientation: 'South-East',
        energyInput: { energyInputMode: 'kwh', monthlyKwh: 1350 },
        panelProductId: 'prod_panel_620',
        inverterProductId: 'prod_inv_12kw_hyb',
        batteryProductId: 'prod_bat_10kwh',
        includeBattery: true,
        manualPanelCount: 20,
        manualBatteryQuantity: 1,
        backupLoadKw: 2.5,
        targetRuntimeHours: 4,
        status: 'Converted to Proposal',
        createdAt: '2026-10-13T16:10:00Z'
      }),
      buildSeedConfig({
        id: 'cfg_105',
        reference: 'CFG-2026-105',
        leadId: 'lead_105',
        shareToken: 'sh_4d5e6f7a8b9c0d1e2f3a',
        source: '3D Configurator',
        projectType: 'home_backup',
        selectedPackageKey: 'balanced',
        roofOrientation: 'South',
        energyInput: { energyInputMode: 'bill', monthlyBillAmount: 42000, customTariffPerKwh: 45 },
        panelProductId: 'prod_panel_585',
        inverterProductId: 'prod_inv_8kw_hyb',
        batteryProductId: 'prod_bat_5kwh',
        includeBattery: true,
        manualPanelCount: 14,
        manualBatteryQuantity: 1,
        status: 'Attached to Lead',
        createdAt: '2026-10-14T11:30:00Z'
      }),
      buildSeedConfig({
        id: 'cfg_106',
        reference: 'CFG-2026-106',
        leadId: null,
        shareToken: 'sh_5e6f7a8b9c0d1e2f3a4b',
        source: '3D Configurator',
        projectType: 'home',
        selectedPackageKey: 'essential',
        roofOrientation: 'West',
        energyInput: { energyInputMode: 'demo_profile', demoProfileKey: 'home' },
        panelProductId: 'prod_panel_550',
        inverterProductId: 'prod_inv_6kw_gt',
        batteryProductId: null,
        includeBattery: false,
        manualPanelCount: 12,
        status: 'Saved Session',
        createdAt: '2026-10-15T17:20:00Z'
      }),
      buildSeedConfig({
        id: 'cfg_107',
        reference: 'CFG-2026-107',
        leadId: 'lead_108',
        shareToken: 'sh_6f7a8b9c0d1e2f3a4b5c',
        source: 'Partner Agency',
        projectType: 'small_business',
        selectedPackageKey: 'balanced',
        roofOrientation: 'South',
        energyInput: { energyInputMode: 'kwh', monthlyKwh: 1100 },
        panelProductId: 'prod_panel_585',
        inverterProductId: 'prod_inv_8kw_hyb',
        batteryProductId: 'prod_bat_5kwh',
        includeBattery: true,
        manualPanelCount: 16,
        manualBatteryQuantity: 2,
        status: 'Attached to Lead',
        createdAt: '2026-10-16T07:30:00Z'
      })
    ];

    const leads = [
      {
        id: 'lead_101',
        organizationId: orgId,
        reference: 'ENQ-2026-101',
        contactName: 'Kamran Ahmed Siddiqui (Sample)',
        email: 'kamran.sample@example.com',
        phone: '+92 300 5550101',
        preferredContactMethod: 'whatsapp',
        city: 'F-7/2, Islamabad',
        source: '3D Configurator',
        projectType: 'home_backup',
        stage: 'New',
        owner: 'Bilal Mahmood (Demo Sales)',
        configurationId: 'cfg_101',
        estimatedValue: configurations[0].computed.financials.grandTotal,
        notes: 'Interested in 8.19 kW hybrid setup with 5.12 kWh LFP backup for evening load shedding. Requested roof inspection next Tuesday.',
        lossReason: null,
        consentTimestamp: '2026-10-15T11:20:00Z',
        nextAction: 'Call to confirm Tuesday roof survey slot',
        createdAt: '2026-10-15T11:20:00Z',
        updatedAt: '2026-10-15T11:20:00Z'
      },
      {
        id: 'lead_102',
        organizationId: orgId,
        reference: 'ENQ-2026-102',
        contactName: 'Dr. Sana Malik — Apex Dental Clinic (Sample)',
        email: 'sana.clinic.sample@example.com',
        phone: '+92 321 5550102',
        preferredContactMethod: 'email',
        city: 'Blue Area, Islamabad',
        source: '3D Configurator',
        projectType: 'small_business',
        stage: 'Proposal Sent',
        owner: 'Ayesha Siddiqui (Demo Sales)',
        configurationId: 'cfg_102',
        estimatedValue: configurations[1].computed.financials.grandTotal,
        notes: 'Dental clinic requiring reliable daytime solar plus 10.24 kWh battery backup for dental chairs and sterilization autoclaves.',
        lossReason: null,
        consentTimestamp: '2026-10-11T14:15:00Z',
        nextAction: 'Follow up on sent proposal PROP-2026-201',
        createdAt: '2026-10-11T14:15:00Z',
        updatedAt: '2026-10-13T10:00:00Z'
      },
      {
        id: 'lead_103',
        organizationId: orgId,
        reference: 'ENQ-2026-103',
        contactName: 'Tariq Mehmood Awan (Sample)',
        email: 'tariq.awan.sample@example.com',
        phone: '+92 333 5550103',
        preferredContactMethod: 'phone',
        city: 'Bahria Town Phase 4, Rawalpindi',
        source: 'Consultation Tablet',
        projectType: 'home',
        stage: 'Won',
        owner: 'Bilal Mahmood (Demo Sales)',
        configurationId: 'cfg_103',
        estimatedValue: configurations[2].computed.financials.grandTotal,
        notes: 'Accepted Essential 5.5 kW Grid-Tied package after site verification. Net-metering application initiated.',
        lossReason: null,
        consentTimestamp: '2026-10-04T09:45:00Z',
        nextAction: 'Schedule mechanical mounting team dispatch',
        createdAt: '2026-10-04T09:45:00Z',
        updatedAt: '2026-10-09T15:30:00Z'
      },
      {
        id: 'lead_104',
        organizationId: orgId,
        reference: 'ENQ-2026-104',
        contactName: 'Haris Javed Qureshi (Sample)',
        email: 'haris.q.sample@example.com',
        phone: '+92 301 5550104',
        preferredContactMethod: 'whatsapp',
        city: 'DHA Phase 2, Islamabad',
        source: '3D Configurator',
        projectType: 'home_backup',
        stage: 'Proposal Draft',
        owner: 'Ayesha Siddiqui (Demo Sales)',
        configurationId: 'cfg_104',
        estimatedValue: configurations[3].computed.financials.grandTotal,
        notes: 'Large corner house with flat + pitched roof section. Wants Backup Plus 12.4 kW system. Draft proposal ready for internal margin check.',
        lossReason: null,
        consentTimestamp: '2026-10-13T16:10:00Z',
        nextAction: 'Finalize custom cable run allowance in draft proposal',
        createdAt: '2026-10-13T16:10:00Z',
        updatedAt: '2026-10-14T12:00:00Z'
      },
      {
        id: 'lead_105',
        organizationId: orgId,
        reference: 'ENQ-2026-105',
        contactName: 'Nadia Mansoor (Sample)',
        email: 'nadia.m.sample@example.com',
        phone: '+92 345 5550105',
        preferredContactMethod: 'phone',
        city: 'E-11/3, Islamabad',
        source: '3D Configurator',
        projectType: 'home_backup',
        stage: 'Qualified',
        owner: 'Bilal Mahmood (Demo Sales)',
        configurationId: 'cfg_105',
        estimatedValue: configurations[4].computed.financials.grandTotal,
        notes: 'Three-phase meter already installed. Shade-free south roof verified via preliminary photos. Ready to generate proposal.',
        lossReason: null,
        consentTimestamp: '2026-10-14T11:30:00Z',
        nextAction: 'Generate formal proposal from CFG-2026-105',
        createdAt: '2026-10-14T11:30:00Z',
        updatedAt: '2026-10-15T09:15:00Z'
      },
      {
        id: 'lead_106',
        organizationId: orgId,
        reference: 'ENQ-2026-106',
        contactName: 'Faisal Raza Khan (Sample)',
        email: 'faisal.rk.sample@example.com',
        phone: '+92 312 5550106',
        preferredContactMethod: 'email',
        city: 'Chaklala Scheme 3, Rawalpindi',
        source: 'Website Direct',
        projectType: 'home',
        stage: 'Contacted',
        owner: 'Ayesha Siddiqui (Demo Sales)',
        configurationId: 'cfg_101',
        estimatedValue: 965000,
        notes: 'Left initial contact inquiry. Sent configurator link; waiting for latest electricity bill copy.',
        lossReason: null,
        consentTimestamp: '2026-10-12T13:00:00Z',
        nextAction: 'Request September utility bill snapshot',
        createdAt: '2026-10-12T13:00:00Z',
        updatedAt: '2026-10-13T11:00:00Z'
      },
      {
        id: 'lead_107',
        organizationId: orgId,
        reference: 'ENQ-2026-107',
        contactName: 'Usman Ghani Fabrics (Sample)',
        email: 'usman.fabrics.sample@example.com',
        phone: '+92 300 5550107',
        preferredContactMethod: 'phone',
        city: 'Saddar, Rawalpindi',
        source: 'Referral',
        projectType: 'small_business',
        stage: 'Lost',
        owner: 'Bilal Mahmood (Demo Sales)',
        configurationId: 'cfg_103',
        estimatedValue: 1120000,
        notes: 'Rented rooftop without landlord NOC for structural mounting.',
        lossReason: 'Not Qualified',
        consentTimestamp: '2026-10-02T10:00:00Z',
        nextAction: 'Archived — revisit if relocating premises',
        createdAt: '2026-10-02T10:00:00Z',
        updatedAt: '2026-10-06T16:00:00Z'
      },
      {
        id: 'lead_108',
        organizationId: orgId,
        reference: 'ENQ-2026-108',
        contactName: 'Hina & Salman Baig (Sample)',
        email: 'salman.baig.sample@example.com',
        phone: '+92 334 5550108',
        preferredContactMethod: 'whatsapp',
        city: 'Gulberg Greens, Islamabad',
        source: 'Partner Agency',
        projectType: 'small_business',
        stage: 'New',
        owner: 'Ayesha Siddiqui (Demo Sales)',
        configurationId: 'cfg_107',
        estimatedValue: configurations[6].computed.financials.grandTotal,
        notes: 'Submitted via Partner Agency campaign. Exploring 9.36 kW system with dual 5.12 kWh batteries (10.24 kWh total).',
        lossReason: null,
        consentTimestamp: '2026-10-16T07:30:00Z',
        nextAction: 'Initial discovery call within 24 hours',
        createdAt: '2026-10-16T07:30:00Z',
        updatedAt: '2026-10-16T07:30:00Z'
      },
      {
        id: 'lead_109',
        organizationId: orgId,
        reference: 'ENQ-2026-109',
        contactName: 'Brig. (R) Khalid محمود (Sample)',
        email: 'khalid.m.sample@example.com',
        phone: '+92 302 5550109',
        preferredContactMethod: 'phone',
        city: 'Askari 14, Rawalpindi',
        source: 'Referral',
        projectType: 'home_backup',
        stage: 'Lost',
        owner: 'Bilal Mahmood (Demo Sales)',
        configurationId: 'cfg_105',
        estimatedValue: 1380000,
        notes: 'Postponed home renovation project until Q2 next year.',
        lossReason: 'Timing',
        consentTimestamp: '2026-10-05T08:30:00Z',
        nextAction: 'Check back in Spring',
        createdAt: '2026-10-05T08:30:00Z',
        updatedAt: '2026-10-08T14:00:00Z'
      }
    ];

    // Proposals spanning Draft, In Review, Sent, Accepted, Declined
    const proposals = [
      {
        id: 'prop_201',
        organizationId: orgId,
        leadId: 'lead_102',
        configurationId: 'cfg_102',
        reference: 'PROP-2026-201',
        title: '14.88 kW Hybrid Solar + 10.24 kWh LFP Backup — Apex Dental Clinic',
        status: 'Sent',
        customerSnapshot: {
          name: 'Dr. Sana Malik — Apex Dental Clinic (Sample)',
          email: 'sana.clinic.sample@example.com',
          phone: '+92 321 5550102',
          city: 'Blue Area, Islamabad'
        },
        systemSizeKw: configurations[1].computed.sizing.actualDcCapacityKw,
        currency: 'PKR',
        lineItemsSnapshot: JSON.parse(JSON.stringify(configurations[1].computed.financials.lineItems)),
        equipmentSubtotal: configurations[1].computed.financials.equipmentSubtotal,
        installationLabor: configurations[1].computed.financials.installationLabor,
        otherCharges: 0,
        grossSubtotal: configurations[1].computed.financials.grossSubtotal,
        discountPercent: 0,
        discountTiming: 'before_tax',
        discountAmount: 0,
        taxRatePercent: 0,
        taxAmount: 0,
        grandTotal: configurations[1].computed.financials.grandTotal,
        amountPaid: 0,
        balanceDue: configurations[1].computed.financials.grandTotal,
        scopeText: 'Supply, rooftop mounting, DC/AC cabling (up to 25m standard run), 12kW 3-phase hybrid inverter commissioning, and 10.24 kWh LFP battery sub-panel integration.',
        exclusionsText: 'Civil roof waterproofing repairs, transformer upgrades, utility net-metering statutory fee, and cable runs exceeding 25 meters.',
        paymentScheduleText: '50% mobilization advance upon order confirmation • 40% upon panel & inverter delivery on site • 10% upon testing & commissioning.',
        indicativeTimelineText: '7–10 working days from mobilization advance (subject to roof readiness).',
        warrantyText: '15-Year Module Product Warranty • 7-Year Hybrid Inverter Warranty • 10-Year LFP Battery Stack Warranty • 2-Year Workmanship.',
        expiryDate: '2026-10-30',
        sentAt: '2026-10-13T10:00:00Z',
        acceptedAt: null,
        notes: 'Sent PDF print summary via email after preliminary site walkthrough.',
        createdAt: '2026-10-12T15:00:00Z',
        updatedAt: '2026-10-13T10:00:00Z'
      },
      {
        id: 'prop_202',
        organizationId: orgId,
        leadId: 'lead_103',
        configurationId: 'cfg_103',
        reference: 'PROP-2026-202',
        title: '5.50 kW Essential Grid-Tied System — Bahria Town Residence',
        status: 'Accepted',
        customerSnapshot: {
          name: 'Tariq Mehmood Awan (Sample)',
          email: 'tariq.awan.sample@example.com',
          phone: '+92 333 5550103',
          city: 'Bahria Town Phase 4, Rawalpindi'
        },
        systemSizeKw: configurations[2].computed.sizing.actualDcCapacityKw,
        currency: 'PKR',
        lineItemsSnapshot: JSON.parse(JSON.stringify(configurations[2].computed.financials.lineItems)),
        equipmentSubtotal: configurations[2].computed.financials.equipmentSubtotal,
        installationLabor: configurations[2].computed.financials.installationLabor,
        otherCharges: 0,
        grossSubtotal: configurations[2].computed.financials.grossSubtotal,
        discountPercent: 2,
        discountTiming: 'before_tax',
        discountAmount: Math.round(configurations[2].computed.financials.grossSubtotal * 0.02),
        taxRatePercent: 0,
        taxAmount: 0,
        grandTotal: configurations[2].computed.financials.grossSubtotal - Math.round(configurations[2].computed.financials.grossSubtotal * 0.02),
        amountPaid: 300000,
        balanceDue: (configurations[2].computed.financials.grossSubtotal - Math.round(configurations[2].computed.financials.grossSubtotal * 0.02)) - 300000,
        scopeText: 'Turnkey 5.5 kW grid-tied solar installation with anodized aluminum roof structure, 6kW string inverter, and AC/DC surge protection.',
        exclusionsText: 'Battery storage not included (grid-tied anti-islanding operation only).',
        paymentScheduleText: '50% advance received • 50% upon commissioning.',
        indicativeTimelineText: '5 working days.',
        warrantyText: '12-Year Module Warranty • 5-Year Grid-Tied Inverter Warranty • 2-Year Workmanship.',
        expiryDate: '2026-10-20',
        sentAt: '2026-10-06T11:00:00Z',
        acceptedAt: '2026-10-09T15:30:00Z',
        notes: 'Customer approved proposal and paid PKR 300,000 mobilization deposit.',
        createdAt: '2026-10-05T14:00:00Z',
        updatedAt: '2026-10-09T15:30:00Z'
      },
      {
        id: 'prop_203',
        organizationId: orgId,
        leadId: 'lead_104',
        configurationId: 'cfg_104',
        reference: 'PROP-2026-203',
        title: '12.40 kW Backup Plus Hybrid System — DHA Phase 2 Residence',
        status: 'Draft',
        customerSnapshot: {
          name: 'Haris Javed Qureshi (Sample)',
          email: 'haris.q.sample@example.com',
          phone: '+92 301 5550104',
          city: 'DHA Phase 2, Islamabad'
        },
        systemSizeKw: configurations[3].computed.sizing.actualDcCapacityKw,
        currency: 'PKR',
        lineItemsSnapshot: JSON.parse(JSON.stringify(configurations[3].computed.financials.lineItems)),
        equipmentSubtotal: configurations[3].computed.financials.equipmentSubtotal,
        installationLabor: configurations[3].computed.financials.installationLabor,
        otherCharges: 15000,
        grossSubtotal: configurations[3].computed.financials.grossSubtotal + 15000,
        discountPercent: 0,
        discountTiming: 'before_tax',
        discountAmount: 0,
        taxRatePercent: 0,
        taxAmount: 0,
        grandTotal: configurations[3].computed.financials.grossSubtotal + 15000,
        amountPaid: 0,
        balanceDue: configurations[3].computed.financials.grossSubtotal + 15000,
        scopeText: '12.40 kW N-Type array (20 × 620W), 12kW 3-Phase Hybrid Inverter, 10.24 kWh LFP Battery Stack, elevated structure, and protection kit.',
        exclusionsText: 'Custom pergola painting and civil masonry works.',
        paymentScheduleText: '50% advance • 40% on delivery • 10% on commissioning.',
        indicativeTimelineText: '8–10 working days.',
        warrantyText: '15-Year Module • 7-Year Hybrid Inverter • 10-Year Battery Stack.',
        expiryDate: '2026-11-01',
        sentAt: null,
        acceptedAt: null,
        notes: 'Added PKR 15,000 other charges for extra 15m armored AC cable run.',
        createdAt: '2026-10-14T12:00:00Z',
        updatedAt: '2026-10-14T12:00:00Z'
      },
      {
        id: 'prop_204',
        organizationId: orgId,
        leadId: 'lead_109',
        configurationId: 'cfg_105',
        reference: 'PROP-2026-204',
        title: '8.19 kW Balanced Hybrid Package — Askari 14 Residence',
        status: 'Declined',
        customerSnapshot: {
          name: 'Brig. (R) Khalid محمود (Sample)',
          email: 'khalid.m.sample@example.com',
          phone: '+92 302 5550109',
          city: 'Askari 14, Rawalpindi'
        },
        systemSizeKw: configurations[4].computed.sizing.actualDcCapacityKw,
        currency: 'PKR',
        lineItemsSnapshot: JSON.parse(JSON.stringify(configurations[4].computed.financials.lineItems)),
        equipmentSubtotal: configurations[4].computed.financials.equipmentSubtotal,
        installationLabor: configurations[4].computed.financials.installationLabor,
        otherCharges: 0,
        grossSubtotal: configurations[4].computed.financials.grossSubtotal,
        discountPercent: 0,
        discountTiming: 'before_tax',
        discountAmount: 0,
        taxRatePercent: 0,
        taxAmount: 0,
        grandTotal: configurations[4].computed.financials.grossSubtotal,
        amountPaid: 0,
        balanceDue: configurations[4].computed.financials.grossSubtotal,
        scopeText: 'Standard 8.19 kW Hybrid installation with 5.12 kWh LFP battery pack.',
        exclusionsText: 'Standard exclusions apply.',
        paymentScheduleText: '50% / 40% / 10%.',
        indicativeTimelineText: '7 working days.',
        warrantyText: 'Standard manufacturer warranties.',
        expiryDate: '2026-10-12',
        sentAt: '2026-10-06T09:00:00Z',
        acceptedAt: null,
        notes: 'Customer deferred installation to Spring due to home renovation schedule.',
        createdAt: '2026-10-05T16:00:00Z',
        updatedAt: '2026-10-08T14:00:00Z'
      }
    ];

    const followUps = [
      {
        id: 'fup_301',
        organizationId: orgId,
        leadId: 'lead_102',
        proposalId: 'prop_201',
        title: 'Follow up with Dr. Sana Malik on sent proposal PROP-2026-201',
        type: 'Proposal Review Call',
        dueAt: '2026-10-14T14:00:00Z', // Overdue relative to 2026-10-16!
        status: 'Overdue',
        assignedTo: 'Ayesha Siddiqui (Demo Sales)',
        completedAt: null,
        createdAt: '2026-10-13T10:00:00Z'
      },
      {
        id: 'fup_302',
        organizationId: orgId,
        leadId: 'lead_101',
        proposalId: null,
        title: 'Confirm roof survey appointment with Kamran Ahmed (F-7/2)',
        type: 'Site Survey Scheduling',
        dueAt: '2026-10-16T16:00:00Z', // Due Today!
        status: 'Due Today',
        assignedTo: 'Bilal Mahmood (Demo Sales)',
        completedAt: null,
        createdAt: '2026-10-15T11:25:00Z'
      },
      {
        id: 'fup_303',
        organizationId: orgId,
        leadId: 'lead_104',
        proposalId: 'prop_203',
        title: 'Send finalized Backup Plus proposal to Haris Javed Qureshi',
        type: 'Proposal Dispatch',
        dueAt: '2026-10-16T18:00:00Z', // Due Today!
        status: 'Due Today',
        assignedTo: 'Ayesha Siddiqui (Demo Sales)',
        completedAt: null,
        createdAt: '2026-10-14T12:10:00Z'
      },
      {
        id: 'fup_304',
        organizationId: orgId,
        leadId: 'lead_108',
        proposalId: null,
        title: 'Initial qualification call with Hina & Salman Baig (Gulberg Greens)',
        type: 'Lead Qualification',
        dueAt: '2026-10-17T11:00:00Z', // Upcoming
        status: 'Upcoming',
        assignedTo: 'Ayesha Siddiqui (Demo Sales)',
        completedAt: null,
        createdAt: '2026-10-16T07:30:00Z'
      },
      {
        id: 'fup_305',
        organizationId: orgId,
        leadId: 'lead_103',
        proposalId: 'prop_202',
        title: 'Verify net-metering file submission for Tariq Mehmood Awan',
        type: 'Post-Sale Handover',
        dueAt: '2026-10-10T12:00:00Z',
        status: 'Completed',
        assignedTo: 'Bilal Mahmood (Demo Sales)',
        completedAt: '2026-10-10T11:40:00Z',
        createdAt: '2026-10-09T15:35:00Z'
      }
    ];

    const activities = [
      {
        id: 'act_1',
        organizationId: orgId,
        actorName: 'Customer (3D Configurator)',
        entityType: 'lead',
        entityId: 'lead_108',
        action: 'Quote Request Submitted',
        detail: 'Hina & Salman Baig submitted ENQ-2026-108 with configuration CFG-2026-107 (9.36 kW Balanced Hybrid + 10.24 kWh LFP).',
        createdAt: '2026-10-16T07:30:00Z'
      },
      {
        id: 'act_2',
        organizationId: orgId,
        actorName: 'Workflow Rules Engine (Demo)',
        entityType: 'followup',
        entityId: 'fup_304',
        action: 'Auto-Scheduled Follow-Up',
        detail: 'Created initial qualification task for ENQ-2026-108 due Oct 17.',
        createdAt: '2026-10-16T07:30:05Z'
      },
      {
        id: 'act_3',
        organizationId: orgId,
        actorName: 'Customer (3D Configurator)',
        entityType: 'lead',
        entityId: 'lead_101',
        action: 'Quote Request Submitted',
        detail: 'Kamran Ahmed Siddiqui submitted ENQ-2026-101 with 8.19 kW Balanced Hybrid configuration (CFG-2026-101).',
        createdAt: '2026-10-15T11:20:00Z'
      },
      {
        id: 'act_4',
        organizationId: orgId,
        actorName: 'Ayesha Siddiqui (Demo Sales)',
        entityType: 'proposal',
        entityId: 'prop_203',
        action: 'Proposal Draft Created',
        detail: 'Created draft proposal PROP-2026-203 (12.40 kW Backup Plus) for Haris Javed Qureshi.',
        createdAt: '2026-10-14T12:00:00Z'
      },
      {
        id: 'act_5',
        organizationId: orgId,
        actorName: 'Ayesha Siddiqui (Demo Sales)',
        entityType: 'proposal',
        entityId: 'prop_201',
        action: 'Proposal Marked Sent (Demo Mode)',
        detail: 'Marked PROP-2026-201 as Sent externally (PKR 2,213,200). Snapshot locked; 3-day follow-up reminder created.',
        createdAt: '2026-10-13T10:00:00Z'
      },
      {
        id: 'act_6',
        organizationId: orgId,
        actorName: 'Bilal Mahmood (Demo Sales)',
        entityType: 'proposal',
        entityId: 'prop_202',
        action: 'Proposal Accepted & Lead Won',
        detail: 'Tariq Mehmood Awan accepted PROP-2026-202 (5.50 kW Essential Grid-Tied). Lead ENQ-2026-103 moved to Won.',
        createdAt: '2026-10-09T15:30:00Z'
      }
    ];

    const integrations = [
      {
        id: 'int_storage',
        organizationId: orgId,
        provider: 'Browser LocalStorage Repository Adapter',
        category: 'Persistence & Database',
        status: 'Demo mode',
        enabled: true,
        verified: true,
        description: 'Persists leads, configurations, catalog, proposals, and brand settings locally in this browser with schema version checking. Replaceable with Supabase/PostgreSQL RLS adapter for production.'
      },
      {
        id: 'int_copilot',
        organizationId: orgId,
        provider: 'Deterministic Sales Copilot (Template Engine)',
        category: 'AI Assistance',
        status: 'Demo mode',
        enabled: true,
        verified: true,
        description: 'Generates grounded lead summaries, follow-up drafts, estimate explanations, and daily briefs directly from structured workspace records without requiring external LLM API keys.'
      },
      {
        id: 'int_email',
        organizationId: orgId,
        provider: 'Transactional Email (Resend / SMTP Adapter)',
        category: 'Messaging & Notifications',
        status: 'Not configured',
        enabled: false,
        verified: false,
        description: 'No SMTP or transactional email API key is configured in this browser environment. Quote confirmations and proposals are recorded locally without dispatching real emails.'
      },
      {
        id: 'int_whatsapp',
        organizationId: orgId,
        provider: 'WhatsApp Business Cloud API',
        category: 'Messaging & Notifications',
        status: 'Not configured',
        enabled: false,
        verified: false,
        description: 'Requires Meta WhatsApp Business API credentials on a server boundary. Copilot can draft messages for manual copy-and-send.'
      },
      {
        id: 'int_payments',
        organizationId: orgId,
        provider: 'Online Deposit & Billing Gateway',
        category: 'Payments & Subscriptions',
        status: 'Not configured',
        enabled: false,
        verified: false,
        description: 'Online payment collection is intentionally disabled in Demo Mode. Partial payments on proposals are recorded manually as bookkeeping entries.'
      }
    ];

    return {
      schemaVersion: 'heliostudio_v1.2',
      currentOrganizationId: orgId,
      currentUserId: 'usr_admin_1',
      organizations,
      users,
      assumptions,
      products,
      packages,
      configurations,
      leads,
      proposals,
      followUps,
      activities,
      integrations
    };
  }

  return {
    createInitialSeedData
  };
});
