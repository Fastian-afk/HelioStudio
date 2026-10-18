/**
 * HelioStudio — Isolated Deterministic Solar, Battery & Financial Estimator
 * All calculations use explicit units and decimal-safe integer minor units (1/100th of currency).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HelioEstimator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULT_ASSUMPTIONS = {
    currency: 'PKR',
    locale: 'en-PK',
    timezone: 'Asia/Karachi',
    regionLabel: 'Islamabad / Rawalpindi Metro (Demo Region)',
    daysInMonth: 30,
    peakSunHoursPerDay: 4.8,
    performanceFactor: 0.80,
    assumedTariffPerKwh: 45,
    exportCreditPerKwh: 19,
    selfConsumptionGridTied: 0.65,
    selfConsumptionBattery: 0.85,
    usableDodFraction: 0.90,
    batteryEfficiencyFraction: 0.92,
    minDcAcRatio: 0.80,
    maxDcAcRatio: 1.35,
    minPanels: 4,
    maxPanels: 80,
    maxVisiblePanels: 36,
    minMonthlyKwh: 50,
    maxMonthlyKwh: 50000,
    defaultInstallationPerKw: 18000,
    defaultFixedInstallation: 45000,
    defaultBosAllowance: 35000,
    defaultDiscountPercent: 0,
    defaultTaxRatePercent: 0,
    discountTiming: 'before_tax', // 'before_tax' | 'after_tax'
    annualDegradationPercent: 0.5,
    systemLifeYears: 25,
    proposalFollowUpDays: 3,
    disclaimerText: 'Preliminary estimate — subject to physical site assessment, structural roof review, shading analysis, and professional electrical engineering design. Displayed energy generation and payback figures are illustrative and do not guarantee real-world output or utility bill savings.',
    proposalFooterText: 'SunGrid Energy (Demo Workspace) • Preliminary Solar & Storage Proposal • Prices valid until expiry date subject to on-site technical survey.'
  };

  /**
   * Convert major currency units to integer minor units (e.g. PKR -> paisas, USD -> cents)
   */
  function toMinorUnits(amountMajor) {
    const num = Number(amountMajor);
    if (!Number.isFinite(num)) return 0;
    return Math.round(num * 100);
  }

  /**
   * Convert integer minor units back to rounded major units (2 decimal places max)
   */
  function fromMinorUnits(amountMinor) {
    const num = Number(amountMinor);
    if (!Number.isFinite(num)) return 0;
    return Math.round(num) / 100;
  }

  /**
   * Clamp a numeric value safely between min and max
   */
  function clampNumber(val, min, max, fallback) {
    const num = Number(val);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
  }

  /**
   * Format currency cleanly using locale and currency settings
   */
  function formatMoney(amountMajor, currency = 'PKR', locale = 'en-PK') {
    const safeAmount = Number.isFinite(Number(amountMajor)) ? Number(amountMajor) : 0;
    try {
      const hasFraction = Math.abs(safeAmount - Math.round(safeAmount)) > 0.005;
      return new Intl.NumberFormat(locale || 'en-PK', {
        style: 'currency',
        currency: currency || 'PKR',
        minimumFractionDigits: hasFraction ? 2 : 0,
        maximumFractionDigits: hasFraction ? 2 : 0
      }).format(safeAmount);
    } catch (e) {
      return (currency || 'PKR') + ' ' + Math.round(safeAmount).toLocaleString();
    }
  }

  /**
   * Step 7.1: Calculate daily energy demand and preliminary DC system target in kW
   */
  function calculateEnergyAndTargetKw(input, assumptionsInput) {
    const a = Object.assign({}, DEFAULT_ASSUMPTIONS, assumptionsInput || {});
    const daysInMonth = clampNumber(a.daysInMonth, 28, 31, 30);
    const peakSunHours = clampNumber(a.peakSunHoursPerDay, 1.0, 10.0, 4.8);
    const perfFactor = clampNumber(a.performanceFactor, 0.40, 0.95, 0.80);
    const tariff = clampNumber(
      input && input.customTariffPerKwh !== undefined ? input.customTariffPerKwh : a.assumedTariffPerKwh,
      1,
      10000,
      45
    );

    const mode = (input && input.energyInputMode) || 'kwh'; // 'kwh' | 'bill' | 'demo_profile'
    let monthlyKwh = 0;
    let rawMonthlyBill = 0;
    const warnings = [];

    if (mode === 'bill') {
      const billVal = Number(input && input.monthlyBillAmount);
      if (!Number.isFinite(billVal) || billVal <= 0) {
        rawMonthlyBill = 0;
        monthlyKwh = 0;
        warnings.push('Enter a positive monthly bill amount to estimate consumption.');
      } else {
        rawMonthlyBill = Math.min(billVal, 100000000);
        monthlyKwh = rawMonthlyBill / tariff;
      }
    } else if (mode === 'demo_profile') {
      const profileKey = (input && input.demoProfileKey) || 'home';
      const profiles = {
        home: 900,
        small_business: 1650,
        home_backup: 1100
      };
      monthlyKwh = profiles[profileKey] || 900;
      rawMonthlyBill = monthlyKwh * tariff;
    } else {
      const kwhVal = Number(input && input.monthlyKwh);
      if (!Number.isFinite(kwhVal) || kwhVal <= 0) {
        monthlyKwh = 0;
        warnings.push('Enter a positive monthly kWh consumption value.');
      } else {
        monthlyKwh = clampNumber(kwhVal, 0, a.maxMonthlyKwh * 2, 0);
        if (kwhVal > a.maxMonthlyKwh) {
          warnings.push(`Monthly consumption exceeds standard configurator bound (${a.maxMonthlyKwh.toLocaleString()} kWh). Capped for preliminary sizing.`);
          monthlyKwh = a.maxMonthlyKwh;
        }
      }
      rawMonthlyBill = monthlyKwh * tariff;
    }

    const dailyEnergyKwh = monthlyKwh > 0 ? monthlyKwh / daysInMonth : 0;
    const effectiveYieldPerKwDay = peakSunHours * perfFactor;
    const preliminaryDcTargetKw = effectiveYieldPerKwDay > 0 ? dailyEnergyKwh / effectiveYieldPerKwDay : 0;

    return {
      energyInputMode: mode,
      monthlyKwh: Math.round(monthlyKwh * 10) / 10,
      rawMonthlyBill: Math.round(rawMonthlyBill),
      assumedTariffPerKwh: tariff,
      daysInMonth,
      dailyEnergyKwh: Math.round(dailyEnergyKwh * 100) / 100,
      peakSunHoursPerDay: peakSunHours,
      performanceFactor: perfFactor,
      preliminaryDcTargetKw: Math.round(preliminaryDcTargetKw * 100) / 100,
      warnings
    };
  }

  /**
   * Step 7.2: Panel and Inverter Sizing
   */
  function calculatePanelAndInverterSizing(params) {
    const a = Object.assign({}, DEFAULT_ASSUMPTIONS, (params && params.assumptions) || {});
    const targetKw = Math.max(0, Number(params && params.preliminaryDcTargetKw) || 0);
    const panelProduct = (params && params.panelProduct) || { wattage: 580, name: '580W Bifacial Module' };
    const inverterProduct = (params && params.inverterProduct) || { acCapacityKw: 8, inverterType: 'hybrid', name: '8kW Hybrid Inverter' };
    const panelWattage = clampNumber(panelProduct && panelProduct.wattage, 100, 1200, 580);
    const inverterAcKw = clampNumber(inverterProduct && inverterProduct.acCapacityKw, 1, 250, 8);
    const includeBattery = Boolean(params && params.includeBattery);

    const minPanels = clampNumber(a.minPanels, 1, 50, 4);
    const maxPanels = clampNumber(a.maxPanels, minPanels, 500, 80);
    const maxVisiblePanels = clampNumber(a.maxVisiblePanels, 4, 100, 36);

    // Recommended panel quantity from target kW: ceiling(preliminary DC target kW / (panel wattage / 1000))
    const rawRecommendedPanels = targetKw > 0
      ? Math.ceil(targetKw / (panelWattage / 1000))
      : minPanels;

    const recommendedPanelCount = clampNumber(rawRecommendedPanels, minPanels, maxPanels, minPanels);

    let selectedPanelCount = recommendedPanelCount;
    if (params && params.manualPanelCount !== undefined && params.manualPanelCount !== null && params.manualPanelCount !== '') {
      const manual = Number(params.manualPanelCount);
      if (Number.isFinite(manual) && manual > 0) {
        selectedPanelCount = clampNumber(Math.round(manual), minPanels, maxPanels, recommendedPanelCount);
      }
    }

    const actualDcCapacityKw = Math.round(((selectedPanelCount * panelWattage) / 1000) * 100) / 100;
    const visiblePanelCount = Math.min(selectedPanelCount, maxVisiblePanels);
    const isVisualizationCapped = selectedPanelCount > maxVisiblePanels;

    // Inverter quantity or ratio check
    const inverterQuantity = clampNumber(params && params.inverterQuantity, 1, 10, 1);
    const totalInverterAcKw = Math.round(inverterAcKw * inverterQuantity * 100) / 100;
    const dcAcRatio = totalInverterAcKw > 0 ? Math.round((actualDcCapacityKw / totalInverterAcKw) * 100) / 100 : 0;

    const compatibilityWarnings = [];
    if (dcAcRatio > a.maxDcAcRatio) {
      compatibilityWarnings.push(
        `Preliminary DC/AC ratio (${dcAcRatio.toFixed(2)}) exceeds typical upper guideline (${a.maxDcAcRatio.toFixed(2)}). Consider a higher-capacity inverter or fewer panels during professional review.`
      );
    } else if (dcAcRatio > 0 && dcAcRatio < a.minDcAcRatio) {
      compatibilityWarnings.push(
        `Preliminary DC/AC ratio (${dcAcRatio.toFixed(2)}) is below typical guideline (${a.minDcAcRatio.toFixed(2)}). The inverter is oversized relative to the current array.`
      );
    }

    if (includeBattery && inverterProduct && inverterProduct.inverterType === 'grid_tied') {
      compatibilityWarnings.push(
        `Battery storage is selected with a Grid-Tied inverter (${inverterProduct.name}). A Hybrid inverter or AC-coupled battery controller is required for backup operation.`
      );
    }

    if (isVisualizationCapped) {
      compatibilityWarnings.push(
        `3D roof preview caps displayed modules at ${maxVisiblePanels} panels for visual clarity, while the commercial estimate prices all ${selectedPanelCount} panels (${actualDcCapacityKw} kW DC).`
      );
    }

    const estimatedDailyGenerationKwh = Math.round(
      actualDcCapacityKw * a.peakSunHoursPerDay * a.performanceFactor * 10
    ) / 10;
    const estimatedMonthlyGenerationKwh = Math.round(estimatedDailyGenerationKwh * a.daysInMonth);

    return {
      panelWattage,
      rawRecommendedPanels,
      recommendedPanelCount,
      selectedPanelCount,
      visiblePanelCount,
      maxVisiblePanels,
      isVisualizationCapped,
      actualDcCapacityKw,
      inverterAcKw,
      inverterQuantity,
      totalInverterAcKw,
      dcAcRatio,
      estimatedDailyGenerationKwh,
      estimatedMonthlyGenerationKwh,
      compatibilityWarnings
    };
  }

  /**
   * Step 7.3: Battery Sizing Estimate
   */
  function calculateBatteryEstimate(params) {
    const a = Object.assign({}, DEFAULT_ASSUMPTIONS, (params && params.assumptions) || {});
    const includeBattery = Boolean(params && params.includeBattery);
    if (!includeBattery) {
      return {
        includeBattery: false,
        backupLoadKw: 0,
        targetRuntimeHours: 0,
        requiredNominalCapacityKwh: 0,
        usableDodFraction: a.usableDodFraction,
        batteryEfficiencyFraction: a.batteryEfficiencyFraction,
        batteryUnitCapacityKwh: 0,
        recommendedBatteryQuantity: 0,
        selectedBatteryQuantity: 0,
        totalNominalCapacityKwh: 0,
        totalUsableCapacityKwh: 0,
        estimatedRuntimeHours: 0,
        limitationsNote: 'No battery storage included. Grid-tied systems shut down automatically during grid outages for safety (anti-islanding).'
      };
    }

    const backupLoadKw = clampNumber(params && params.backupLoadKw, 0.2, 50, 1.8);
    const targetRuntimeHours = clampNumber(params && params.targetRuntimeHours, 1, 48, 4);
    const dod = clampNumber(a.usableDodFraction, 0.5, 1.0, 0.90);
    const eff = clampNumber(a.batteryEfficiencyFraction, 0.6, 1.0, 0.92);

    // Formula from Section 7.3:
    // required load power (kW) * desired runtime (hours) / (usable DoD * system efficiency)
    const requiredNominalCapacityKwh = Math.round(((backupLoadKw * targetRuntimeHours) / (dod * eff)) * 100) / 100;

    const batteryProduct = (params && params.batteryProduct) || { capacityKwh: 5.12, name: '5.12 kWh LFP Battery' };
    const unitCapacityKwh = clampNumber(batteryProduct && batteryProduct.capacityKwh, 1.0, 100.0, 5.12);

    const recommendedBatteryQuantity = clampNumber(
      Math.ceil(requiredNominalCapacityKwh / unitCapacityKwh),
      1,
      12,
      1
    );

    let selectedBatteryQuantity = recommendedBatteryQuantity;
    if (params && params.manualBatteryQuantity !== undefined && params.manualBatteryQuantity !== null && params.manualBatteryQuantity !== '') {
      const manualQty = Number(params.manualBatteryQuantity);
      if (Number.isFinite(manualQty) && manualQty >= 1) {
        selectedBatteryQuantity = clampNumber(Math.round(manualQty), 1, 12, recommendedBatteryQuantity);
      }
    }

    const totalNominalCapacityKwh = Math.round(selectedBatteryQuantity * unitCapacityKwh * 100) / 100;
    const totalUsableCapacityKwh = Math.round(totalNominalCapacityKwh * dod * eff * 100) / 100;
    const estimatedRuntimeHours = backupLoadKw > 0
      ? Math.round((totalUsableCapacityKwh / backupLoadKw) * 10) / 10
      : 0;

    return {
      includeBattery: true,
      backupLoadKw,
      targetRuntimeHours,
      requiredNominalCapacityKwh,
      usableDodFraction: dod,
      batteryEfficiencyFraction: eff,
      batteryUnitCapacityKwh: unitCapacityKwh,
      recommendedBatteryQuantity,
      selectedBatteryQuantity,
      totalNominalCapacityKwh,
      totalUsableCapacityKwh,
      estimatedRuntimeHours,
      limitationsNote: `Assumes ${backupLoadKw} kW continuous essential load (~${estimatedRuntimeHours} hrs runtime from ${totalUsableCapacityKwh} kWh usable / ${totalNominalCapacityKwh} kWh nominal capacity at ${Math.round(dod * 100)}% DoD & ${Math.round(eff * 100)}% efficiency). Does not support whole-home heavy AC/heating loads unless sized accordingly.`
    };
  }

  /**
   * Step 7.4: Decimal-safe Cost & Margin Calculation
   */
  function calculateFinancialTotals(params) {
    const a = Object.assign({}, DEFAULT_ASSUMPTIONS, (params && params.assumptions) || {});
    const rawLineItems = Array.isArray(params && params.lineItems) ? params.lineItems : [];

    const computedLines = rawLineItems.map((item, idx) => {
      const qty = Math.max(0, Math.round(Number(item.quantity) || 0));
      const unitPriceMajor = Math.max(0, Number(item.unitPrice) || 0);
      const unitCostMajor = Math.max(0, Number(item.unitCost !== undefined ? item.unitCost : unitPriceMajor * 0.78) || 0);

      const unitPriceMinor = toMinorUnits(unitPriceMajor);
      const unitCostMinor = toMinorUnits(unitCostMajor);
      const lineTotalMinor = qty * unitPriceMinor;
      const lineCostMinor = qty * unitCostMinor;

      return {
        id: item.id || `line_${idx + 1}`,
        productId: item.productId || null,
        sku: item.sku || `ITEM-${idx + 1}`,
        name: item.name || 'Equipment / Service Item',
        category: item.category || 'other',
        description: item.description || '',
        warrantyText: item.warrantyText || '',
        quantity: qty,
        unitPrice: fromMinorUnits(unitPriceMinor),
        unitCost: fromMinorUnits(unitCostMinor),
        lineTotal: fromMinorUnits(lineTotalMinor),
        lineCost: fromMinorUnits(lineCostMinor),
        _lineTotalMinor: lineTotalMinor,
        _lineCostMinor: lineCostMinor
      };
    }).filter(line => line.quantity > 0);

    const equipmentSubtotalMinor = computedLines
      .filter(l => l.category !== 'labor' && l.category !== 'service')
      .reduce((acc, l) => acc + l._lineTotalMinor, 0);

    const catalogLaborMinor = computedLines
      .filter(l => l.category === 'labor' || l.category === 'service')
      .reduce((acc, l) => acc + l._lineTotalMinor, 0);

    const extraInstallationMajor = params && params.installationAllowance !== undefined
      ? Math.max(0, Number(params.installationAllowance) || 0)
      : 0;
    const extraOtherChargesMajor = params && params.otherCharges !== undefined
      ? Math.max(0, Number(params.otherCharges) || 0)
      : 0;

    const installationLaborMinor = catalogLaborMinor + toMinorUnits(extraInstallationMajor);
    const otherChargesMinor = toMinorUnits(extraOtherChargesMajor);

    const grossSubtotalMinor = equipmentSubtotalMinor + installationLaborMinor + otherChargesMinor;
    const totalInternalCostMinor = computedLines.reduce((acc, l) => acc + l._lineCostMinor, 0) +
      Math.round(toMinorUnits(extraInstallationMajor + extraOtherChargesMajor) * 0.75);

    // Discount calculation
    const discountPercent = clampNumber(
      params && params.discountPercent !== undefined ? params.discountPercent : a.defaultDiscountPercent,
      0,
      100,
      0
    );
    const fixedDiscountMajor = Math.max(0, Number(params && params.discountAmount) || 0);
    const discountFromPercentMinor = Math.round(grossSubtotalMinor * (discountPercent / 100));
    const requestedDiscountMinor = fixedDiscountMajor > 0 ? toMinorUnits(fixedDiscountMajor) : discountFromPercentMinor;

    const discountTiming = (params && params.discountTiming) || a.discountTiming || 'before_tax';
    const taxRatePercent = clampNumber(
      params && params.taxRatePercent !== undefined ? params.taxRatePercent : a.defaultTaxRatePercent,
      0,
      100,
      0
    );

    let discountMinor = 0;
    let taxableAmountMinor = 0;
    let taxMinor = 0;
    let grandTotalMinor = 0;

    if (discountTiming === 'after_tax') {
      taxableAmountMinor = grossSubtotalMinor;
      taxMinor = Math.round(taxableAmountMinor * (taxRatePercent / 100));
      const preDiscountTotalMinor = grossSubtotalMinor + taxMinor;
      discountMinor = Math.min(preDiscountTotalMinor, requestedDiscountMinor);
      grandTotalMinor = Math.max(0, preDiscountTotalMinor - discountMinor);
    } else {
      // Default: 'before_tax'
      discountMinor = Math.min(grossSubtotalMinor, requestedDiscountMinor);
      taxableAmountMinor = Math.max(0, grossSubtotalMinor - discountMinor);
      taxMinor = Math.round(taxableAmountMinor * (taxRatePercent / 100));
      grandTotalMinor = taxableAmountMinor + taxMinor;
    }

    const amountPaidMajor = Math.max(0, Number(params && params.amountPaid) || 0);
    const amountPaidMinor = Math.min(grandTotalMinor, toMinorUnits(amountPaidMajor));
    const balanceDueMinor = Math.max(0, grandTotalMinor - amountPaidMinor);

    const netRevenueBeforeTaxMinor = Math.max(0, grossSubtotalMinor - discountMinor);
    const estimatedGrossMarginMinor = netRevenueBeforeTaxMinor - totalInternalCostMinor;
    const estimatedGrossMarginPercent = netRevenueBeforeTaxMinor > 0
      ? Math.round((estimatedGrossMarginMinor / netRevenueBeforeTaxMinor) * 1000) / 10
      : 0;

    // Strip internal minor fields for clean public output while preserving exact major values
    const cleanLines = computedLines.map(l => ({
      id: l.id,
      productId: l.productId,
      sku: l.sku,
      name: l.name,
      category: l.category,
      description: l.description,
      warrantyText: l.warrantyText,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      unitCost: l.unitCost,
      lineTotal: l.lineTotal,
      lineCost: l.lineCost
    }));

    return {
      currency: a.currency || 'PKR',
      lineItems: cleanLines,
      equipmentSubtotal: fromMinorUnits(equipmentSubtotalMinor),
      installationLabor: fromMinorUnits(installationLaborMinor),
      otherCharges: fromMinorUnits(otherChargesMinor),
      grossSubtotal: fromMinorUnits(grossSubtotalMinor),
      discountPercent,
      discountTiming,
      discountAmount: fromMinorUnits(discountMinor),
      taxableAmount: fromMinorUnits(taxableAmountMinor),
      taxRatePercent,
      taxAmount: fromMinorUnits(taxMinor),
      grandTotal: fromMinorUnits(grandTotalMinor),
      amountPaid: fromMinorUnits(amountPaidMinor),
      balanceDue: fromMinorUnits(balanceDueMinor),
      estimatedInternalCost: fromMinorUnits(totalInternalCostMinor),
      estimatedGrossMargin: fromMinorUnits(estimatedGrossMarginMinor),
      estimatedGrossMarginPercent
    };
  }

  /**
   * Step 7.5: Illustrative Savings and Payback (only if inputs are present)
   */
  function calculateIllustrativePayback(params) {
    const a = Object.assign({}, DEFAULT_ASSUMPTIONS, (params && params.assumptions) || {});
    const monthlyGenerationKwh = Number(params && params.estimatedMonthlyGenerationKwh) || 0;
    const monthlyConsumptionKwh = Number(params && params.monthlyKwh) || 0;
    const grandTotal = Number(params && params.grandTotal) || 0;
    const includeBattery = Boolean(params && params.includeBattery);

    if (monthlyGenerationKwh <= 0 || monthlyConsumptionKwh <= 0 || grandTotal <= 0) {
      return {
        available: false,
        reason: 'Enter monthly electricity consumption or bill details to view illustrative bill offset and payback.',
        selfConsumptionFraction: 0,
        assumedTariffPerKwh: a.assumedTariffPerKwh,
        exportCreditPerKwh: a.exportCreditPerKwh,
        estimatedMonthlyValue: 0,
        estimatedAnnualValue: 0,
        illustrativePaybackYears: null
      };
    }

    const selfConsumptionFraction = includeBattery
      ? clampNumber(a.selfConsumptionBattery, 0.2, 0.98, 0.85)
      : clampNumber(a.selfConsumptionGridTied, 0.2, 0.95, 0.65);

    const tariff = clampNumber(params.assumedTariffPerKwh || a.assumedTariffPerKwh, 1, 10000, 45);
    const exportRate = clampNumber(a.exportCreditPerKwh, 0, tariff, 19);

    const selfConsumedKwh = Math.min(monthlyConsumptionKwh, monthlyGenerationKwh * selfConsumptionFraction);
    const exportedKwh = Math.max(0, monthlyGenerationKwh - selfConsumedKwh);

    const monthlyValue = (selfConsumedKwh * tariff) + (exportedKwh * exportRate);
    const annualValue = monthlyValue * 12;
    const paybackYears = annualValue > 0 ? Math.round((grandTotal / annualValue) * 10) / 10 : null;

    return {
      available: true,
      selfConsumptionFraction,
      assumedTariffPerKwh: tariff,
      exportCreditPerKwh: exportRate,
      annualDegradationPercent: a.annualDegradationPercent,
      systemLifeYears: a.systemLifeYears,
      estimatedMonthlyValue: Math.round(monthlyValue),
      estimatedAnnualValue: Math.round(annualValue),
      illustrativePaybackYears: paybackYears,
      disclaimer: 'Illustrative simple payback based on static tariff & self-consumption assumptions. Not a financial guarantee.'
    };
  }

  /**
   * Validate Quote Request Form Inputs (Section 6.6 & 11.2)
   */
  function validateQuoteRequest(form) {
    const errors = {};
    const name = String((form && form.contactName) || '').trim();
    const email = String((form && form.email) || '').trim();
    const phone = String((form && form.phone) || '').trim();
    const city = String((form && form.city) || '').trim();
    const preferredMethod = String((form && form.preferredContactMethod) || 'phone').trim();
    const consent = Boolean(form && form.consentAccepted);

    if (!name || name.length < 2) {
      errors.contactName = 'Please enter your full name (at least 2 characters).';
    } else if (name.length > 100) {
      errors.contactName = 'Name must be under 100 characters.';
    }

    const hasValidEmail = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const hasValidPhone = phone.length > 0 && /^[+\d\s\-()]{7,20}$/.test(phone);

    if (!email && !phone) {
      errors.contact = 'Please provide at least an email address or a phone number.';
    } else {
      if (email && !hasValidEmail) {
        errors.email = 'Please enter a valid email address (e.g. name@example.com).';
      }
      if (phone && !hasValidPhone) {
        errors.phone = 'Please enter a valid phone number (7–20 digits).';
      }
    }

    if (preferredMethod === 'email' && !hasValidEmail) {
      errors.email = 'An email address is required when Email is selected as your preferred contact method.';
    }
    if ((preferredMethod === 'phone' || preferredMethod === 'whatsapp') && !hasValidPhone) {
      errors.phone = 'A valid phone number is required when Phone/WhatsApp is selected as your preferred contact method.';
    }

    if (!city || city.length < 2) {
      errors.city = 'Please enter your city or service area.';
    }

    if (!consent) {
      errors.consentAccepted = 'Please acknowledge that this is a preliminary estimate and consent to follow-up.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate Lead & Proposal Status Transitions (Section 8.2 & 8.6)
   */
  const VALID_LEAD_STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Draft', 'Proposal Sent', 'Won', 'Lost'];
  const PROPOSAL_TRANSITIONS = {
    'Draft': ['In Review', 'Sent'],
    'In Review': ['Draft', 'Sent'],
    'Sent': ['Accepted', 'Declined', 'Expired', 'Draft'],
    'Accepted': [],
    'Declined': ['Draft'],
    'Expired': ['Draft']
  };

  function canTransitionProposal(fromStatus, toStatus) {
    if (fromStatus === toStatus) return true;
    const allowed = PROPOSAL_TRANSITIONS[fromStatus] || [];
    return allowed.includes(toStatus);
  }

  return {
    DEFAULT_ASSUMPTIONS,
    VALID_LEAD_STAGES,
    PROPOSAL_TRANSITIONS,
    toMinorUnits,
    fromMinorUnits,
    clampNumber,
    formatMoney,
    calculateEnergyAndTargetKw,
    calculatePanelAndInverterSizing,
    calculateBatteryEstimate,
    calculateFinancialTotals,
    calculateIllustrativePayback,
    validateQuoteRequest,
    canTransitionProposal
  };
});
