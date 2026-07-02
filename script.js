"use strict";

/* ═══════════════════════════════════════════════════════════
   CONFIG — edit before deploying
   WHATSAPP_NUMBER must be in international format, digits only, no leading +, no spaces.
   ═══════════════════════════════════════════════════════════ */
const WHATSAPP_NUMBER = "256766845860"; // TODO: replace with real NexUp WhatsApp business number

const WA_MESSAGES = {
  header: "Hi NexUp, I'd like to find out more about your products.",
  hero: "Hi NexUp, I'd like to start a consultation.",
  calculator: "Hi NexUp, I ran your ROI calculator and want to talk through the numbers.",
  path1: "Hi NexUp, I'd like a quick chat to see if there's a fit.",
  path2: "Hi NexUp, I'd like a quote for a scoped project.",
  path3: "Hi NexUp, I'd like to discuss an ongoing retainer.",
  footer: "Hi NexUp, I'd like to get in touch."
};

function buildWaLink(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

function wireWhatsAppLinks() {
  const map = [
    ["waHeaderLink", WA_MESSAGES.header],
    ["waHeroLink", WA_MESSAGES.hero],
    ["waCalcLink", WA_MESSAGES.calculator],
    ["waPath1", WA_MESSAGES.path1],
    ["waPath2", WA_MESSAGES.path2],
    ["waPath3", WA_MESSAGES.path3],
    ["waFooterLink", WA_MESSAGES.footer]
  ];

  map.forEach(([id, message]) => {
    const el = document.getElementById(id);
    if (el) el.href = buildWaLink(message);
  });
}

/* ───────── USSD device hero animation ───────── */
const USSD_SCREENS = [
  { code: "*165*4#", menu: "1. Check Balance\n2. Pay School Fees\n3. Send Money\n4. Track Delivery" },
  { code: "*165*4*2#", menu: "SchoolBridge\nPay fees for:\n1. Term 1 - Balance\n2. Term 2 - Full" },
  { code: "*165*4*4#", menu: "RightRoute\nParcel #4471\nStatus: Out for delivery\nETA: 18 min" },
  { code: "*165*4*1#", menu: "NextGoal Wallet\nBalance: UGX 148,000\n1. Top Up\n2. History" }
];

function startUssdCycle() {
  const codeEl = document.getElementById("ussdCode");
  const menuEl = document.getElementById("ussdMenu");
  if (!codeEl || !menuEl) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;

  const render = () => {
    const screen = USSD_SCREENS[index];
    codeEl.textContent = screen.code;
    menuEl.textContent = screen.menu;
  };

  render();
  if (prefersReducedMotion) return;

  setInterval(() => {
    index = (index + 1) % USSD_SCREENS.length;
    render();
  }, 3200);
}

/* ───────── ROI calculator ───────── */
// Native currency formatter for cleanly isolated UGX presentation
const ugxFormatter = new Intl.NumberFormat("en-UG", {
  style: "currency",
  currency: "UGX",
  maximumFractionDigits: 0
});

function formatUgx(amount) {
  const rounded = Math.round(amount / 1000) * 1000;
  return ugxFormatter.format(rounded);
}

function initCalculator() {
  const inputOrders = document.getElementById("inputOrders");
  const inputMinutes = document.getElementById("inputMinutes");
  const inputCost = document.getElementById("inputCost");
  const inputAutomation = document.getElementById("inputAutomation");
  
  const automationPctLabel = document.getElementById("automationPct");
  const resultHours = document.getElementById("resultHours");
  const resultMoney = document.getElementById("resultMoney");
  const summaryOrders = document.getElementById("summaryOrders");
  const summaryMinutes = document.getElementById("summaryMinutes");
  const summaryPct = document.getElementById("summaryPct");

  // Structural Guard Check: Ensure ALL targets exist before binding listeners
  if (
    !inputOrders || !inputMinutes || !inputCost || !inputAutomation ||
    !automationPctLabel || !resultHours || !resultMoney || 
    !summaryOrders || !summaryMinutes || !summaryPct
  ) return;

  const clampNonNegative = (val) => (Number.isFinite(val) && val > 0 ? val : 0);

  function recalculate() {
    // Sanitize blank/partial input typing with inline '|| 0' fallback loops
    const orders = clampNonNegative(parseFloat(inputOrders.value) || 0);
    const minutes = clampNonNegative(parseFloat(inputMinutes.value) || 0);
    const hourlyCost = clampNonNegative(parseFloat(inputCost.value) || 0);
    const automationShare = clampNonNegative(parseFloat(inputAutomation.value) || 0) / 100;

    const dailyMinutesSaved = orders * minutes * automationShare;
    const monthlyHoursSaved = (dailyMinutesSaved * 30) / 60;
    const monthlyMoneySaved = monthlyHoursSaved * hourlyCost;

    // UI Updates
    resultHours.textContent = Math.round(monthlyHoursSaved).toLocaleString("en-UG");
    resultMoney.textContent = formatUgx(monthlyMoneySaved);
    
    const pctString = `${inputAutomation.value || 0}%`;
    automationPctLabel.textContent = pctString;
    summaryOrders.textContent = orders.toLocaleString("en-UG");
    summaryMinutes.textContent = minutes.toLocaleString("en-UG");
    summaryPct.textContent = pctString;
  }

  [inputOrders, inputMinutes, inputCost, inputAutomation].forEach((el) => {
    el.addEventListener("input", recalculate);
  });

  recalculate();
}

/* ───────── footer year ───────── */
function setFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
}

/* ───────── initialization loop ───────── */
document.addEventListener("DOMContentLoaded", () => {
  wireWhatsAppLinks();
  startUssdCycle();
  initCalculator();
  setFooterYear();
});
