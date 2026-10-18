const test = require('node:test');
const assert = require('node:assert/strict');
const Estimator = require('../lib/estimator.js');
const Seed = require('../lib/seedData.js');
const Store = require('../lib/store.js');

test('1. Known monthly kWh input produces expected daily consumption and preliminary DC target', () => {
  const res = Estimator.calculateEnergyAndTargetKw(
    { energyInputMode: 'kwh', monthlyKwh: 900 },
    { daysInMonth: 30, peakSunHoursPerDay: 5.0, performanceFactor: 0.80 }
  );
  assert.equal(res.dailyEnergyKwh, 30);
  // 30 kWh / (5.0 * 0.80 = 4.0) = 7.5 kW
  assert.equal(res.preliminaryDcTargetKw, 7.5);
  assert.equal(res.warnings.length, 0);
});

test('2. Monthly-bill estimate shows assumed tariff and derives approximate consumption', () => {
  const res = Estimator.calculateEnergyAndTargetKw(
    { energyInputMode: 'bill', monthlyBillAmount: 45000, customTariffPerKwh: 45 },
    { daysInMonth: 30, peakSunHoursPerDay: 4.8, performanceFactor: 0.80 }
  );
  assert.equal(res.assumedTariffPerKwh, 45);
  assert.equal(res.monthlyKwh, 1000);
  assert.equal(res.dailyEnergyKwh, 33.33);
});

test('3. Panel count rounds upward and actual DC capacity matches panel count × wattage', () => {
  const sizing = Estimator.calculatePanelAndInverterSizing({
    preliminaryDcTargetKw: 7.5,
    panelProduct: { wattage: 585, name: '585W Module' },
    inverterProduct: { acCapacityKw: 8, inverterType: 'hybrid', name: '8kW Hybrid' },
    includeBattery: true
  });
  // ceil(7.5 / 0.585) = ceil(12.82) = 13 panels
  assert.equal(sizing.recommendedPanelCount, 13);
  assert.equal(sizing.selectedPanelCount, 13);
  assert.equal(sizing.actualDcCapacityKw, 7.61); // 13 * 0.585 = 7.605 -> 7.61
});

test('4. Battery estimate calculates nominal/usable capacity and runtime with known test values', () => {
  const bat = Estimator.calculateBatteryEstimate({
    includeBattery: true,
    backupLoadKw: 2.0,
    targetRuntimeHours: 4,
    assumptions: { usableDodFraction: 0.80, batteryEfficiencyFraction: 0.90 },
    batteryProduct: { capacityKwh: 5.12, name: '5.12 kWh LFP' }
  });
  // Required = (2.0 * 4) / (0.80 * 0.90) = 8 / 0.72 = 11.11 kWh
  assert.equal(bat.requiredNominalCapacityKwh, 11.11);
  // ceil(11.11 / 5.12) = 3 packs
  assert.equal(bat.recommendedBatteryQuantity, 3);
  assert.equal(bat.totalNominalCapacityKwh, 15.36);
});

test('5. Empty, zero, negative, or excessively large inputs are safely bounded without NaN/Infinity', () => {
  const negEnergy = Estimator.calculateEnergyAndTargetKw({ energyInputMode: 'kwh', monthlyKwh: -500 });
  assert.equal(negEnergy.monthlyKwh, 0);
  assert.equal(negEnergy.preliminaryDcTargetKw, 0);
  assert.ok(negEnergy.warnings.length > 0);

  const hugeEnergy = Estimator.calculateEnergyAndTargetKw({ energyInputMode: 'kwh', monthlyKwh: 99999999 });
  assert.equal(hugeEnergy.monthlyKwh, 50000);
  assert.ok(Number.isFinite(hugeEnergy.preliminaryDcTargetKw));

  const hugePanels = Estimator.calculatePanelAndInverterSizing({
    preliminaryDcTargetKw: 500,
    panelProduct: { wattage: 550 },
    inverterProduct: { acCapacityKw: 10, inverterType: 'hybrid' },
    manualPanelCount: 5000
  });
  assert.equal(hugePanels.selectedPanelCount, 80); // Capped at maxPanels
  assert.equal(hugePanels.visiblePanelCount, 36); // Capped at maxVisiblePanels
  assert.equal(hugePanels.isVisualizationCapped, true);
});

test('6. Decimal/money rounding, discount/tax ordering (before_tax vs after_tax), and partial payments', () => {
  const lineItems = [
    { id: '1', name: 'Panel', category: 'panel', quantity: 10, unitPrice: 31000.55 },
    { id: '2', name: 'Labor', category: 'labor', quantity: 1, unitPrice: 50000 }
  ];

  // Before tax: Gross = 310005.50 + 50000 = 360005.50
  // 10% discount = 36000.55 -> Taxable = 324004.95 -> 10% tax = 32400.50 -> Total = 356405.45
  const beforeTax = Estimator.calculateFinancialTotals({
    lineItems,
    discountPercent: 10,
    taxRatePercent: 10,
    discountTiming: 'before_tax',
    amountPaid: 100000
  });
  assert.equal(beforeTax.grossSubtotal, 360005.5);
  assert.equal(beforeTax.discountAmount, 36000.55);
  assert.equal(beforeTax.taxableAmount, 324004.95);
  assert.equal(beforeTax.taxAmount, 32400.5);
  assert.equal(beforeTax.grandTotal, 356405.45);
  assert.equal(beforeTax.balanceDue, 256405.45);

  // After tax: Gross = 360005.50 -> 10% tax = 36000.55 -> Pre-discount = 396006.05 -> Discount = 36000.55 -> Total = 360005.50
  const afterTax = Estimator.calculateFinancialTotals({
    lineItems,
    discountPercent: 10,
    taxRatePercent: 10,
    discountTiming: 'after_tax'
  });
  assert.equal(afterTax.taxAmount, 36000.55);
  assert.equal(afterTax.grandTotal, 360005.5);
});

test('7. Quote form input validation rejects invalid contact/consent and accepts valid submission', () => {
  const invalidRes = Estimator.validateQuoteRequest({
    contactName: 'A',
    email: 'invalid-email',
    phone: '',
    city: '',
    consentAccepted: false
  });
  assert.equal(invalidRes.valid, false);
  assert.ok(invalidRes.errors.contactName);
  assert.ok(invalidRes.errors.email);
  assert.ok(invalidRes.errors.city);
  assert.ok(invalidRes.errors.consentAccepted);

  const validRes = Estimator.validateQuoteRequest({
    contactName: 'Amina Zahid',
    email: 'amina@example.com',
    phone: '+92 300 1234567',
    preferredContactMethod: 'whatsapp',
    city: 'Islamabad',
    consentAccepted: true
  });
  assert.equal(validRes.valid, true);
});

test('8. Updating catalog price updates new proposal drafts while historical Sent proposals retain snapshot', () => {
  const store = Store.createStore({ useBrowserStorage: false });
  const sentProposalBefore = store.getProposalById('prop_201');
  const originalSentTotal = sentProposalBefore.grandTotal;
  const originalSentPanelPrice = sentProposalBefore.lineItemsSnapshot[0].unitPrice;

  // Update catalog price of 620W panel from 34,500 to 40,000
  const updateRes = store.saveProduct({
    id: 'prod_panel_620',
    sku: 'SG-PV-620C',
    name: 'HelioPro 620W Commercial High-Density Module (Sample)',
    category: 'panel',
    customerPrice: 40000,
    internalUnitCost: 31000
  });
  assert.equal(updateRes.ok, true);

  // Verify historical Sent proposal prop_201 did NOT change
  const sentProposalAfter = store.getProposalById('prop_201');
  assert.equal(sentProposalAfter.grandTotal, originalSentTotal);
  assert.equal(sentProposalAfter.lineItemsSnapshot[0].unitPrice, originalSentPanelPrice);

  // Verify a newly created proposal draft from cfg_102 uses the updated 40,000 price
  const newDraftRes = store.createProposalFromRecord({ configurationId: 'cfg_102' });
  assert.equal(newDraftRes.ok, true);
  assert.equal(newDraftRes.proposal.lineItemsSnapshot[0].unitPrice, 40000);
  assert.ok(newDraftRes.proposal.grandTotal > originalSentTotal);
});

test('9. Catalog archive rules, role permissions, tenant isolation, and E2E Quote -> Lead -> Proposal lifecycle', () => {
  const store = Store.createStore({ useBrowserStorage: false });

  // Tenant isolation check: cannot read Tenant B lead or org
  assert.equal(store.getOrganization('org_solarpeak_secondary'), null);
  const activeProducts = store.getProducts({ activeOnly: true });
  assert.equal(activeProducts.some(p => p.organizationId === 'org_solarpeak_secondary'), false);
  // Archived product prod_panel_legacy_450 is excluded from active catalog
  assert.equal(activeProducts.some(p => p.id === 'prod_panel_legacy_450'), false);

  // End-to-End Customer Quote Request -> Saved Configuration -> Lead -> Proposal -> Sent -> Accepted
  const submitRes = store.submitQuoteRequest(
    {
      projectType: 'home_backup',
      selectedPackageKey: 'balanced',
      energyInput: { energyInputMode: 'kwh', monthlyKwh: 950 },
      panelProductId: 'prod_panel_585',
      inverterProductId: 'prod_inv_8kw_hyb',
      batteryProductId: 'prod_bat_5kwh',
      includeBattery: true,
      manualPanelCount: 14,
      manualBatteryQuantity: 1
    },
    {
      contactName: 'Zafar Iqbal (E2E Test)',
      email: 'zafar.e2e@example.com',
      phone: '+92 300 9988776',
      preferredContactMethod: 'whatsapp',
      city: 'F-10, Islamabad',
      consentAccepted: true
    }
  );
  assert.equal(submitRes.ok, true);
  assert.ok(submitRes.lead.id);
  assert.ok(submitRes.configuration.id);
  assert.equal(submitRes.lead.configurationId, submitRes.configuration.id);

  // Create proposal from newly created lead
  const propRes = store.createProposalFromRecord({ leadId: submitRes.lead.id });
  assert.equal(propRes.ok, true);
  const propId = propRes.proposal.id;

  // Transition Draft -> Sent -> Accepted
  const sentRes = store.updateProposal(propId, { status: 'Sent' });
  assert.equal(sentRes.ok, true);
  assert.equal(store.getLeadById(submitRes.lead.id).stage, 'Proposal Sent');

  const acceptRes = store.updateProposal(propId, { status: 'Accepted' });
  assert.equal(acceptRes.ok, true);
  assert.equal(store.getLeadById(submitRes.lead.id).stage, 'Won');

  // Role permission check: Viewer cannot mutate catalog or leads
  store.setActiveRole('Viewer');
  const forbiddenRes = store.saveProduct({ sku: 'X', name: 'Y', category: 'panel', customerPrice: 100 });
  assert.equal(forbiddenRes.ok, false);
  assert.equal(forbiddenRes.code, 'FORBIDDEN');
});
