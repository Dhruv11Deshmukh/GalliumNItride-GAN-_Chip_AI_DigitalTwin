const vds = document.getElementById("vds");
const temp = document.getElementById("temp");
const freq = document.getElementById("freq");
const result = document.getElementById("result");
const predictBtn = document.getElementById("predictBtn");
const refreshMetricsBtn = document.getElementById("refreshMetricsBtn");

const chip = document.getElementById("chip");
const conductionBar = document.getElementById("conductionBar");
const thermalBar = document.getElementById("thermalBar");
const switchBar = document.getElementById("switchBar");
const insight = document.getElementById("insight");
const thermalMap = document.getElementById("thermalMap");
const thermalCtx = thermalMap.getContext("2d");
const chartCanvas = document.getElementById("idsChart");
const chartCtx = chartCanvas.getContext("2d");
const presetButtons = document.querySelectorAll(".preset-btn");
const opMap = document.getElementById("opMap");
const opCtx = opMap.getContext("2d");
const playground = document.getElementById("playground");
const metricsStatus = document.getElementById("metricsStatus");
const metricsTableWrap = document.getElementById("metricsTableWrap");
const graphToggles = document.querySelectorAll(".graph-toggle");

function clampPercent(value, min, max) {
  if (max <= min) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function updateLabels() {
  document.getElementById("vdsValue").textContent = `${vds.value} V`;
  document.getElementById("tempValue").textContent = `${temp.value} C`;
  document.getElementById("freqValue").textContent = `${Number(freq.value).toLocaleString()} Hz`;
}

function updateVisualEffects(idsPrediction) {
  const vNorm = clampPercent(Number(vds.value), 0, 600);
  const tNorm = clampPercent(Number(temp.value), 25, 150);
  const fNorm = clampPercent(Number(freq.value), 10000, 1000000);
  const idsNorm = clampPercent(idsPrediction, 0, 20000);

  conductionBar.style.width = `${Math.max(vNorm, idsNorm)}%`;
  thermalBar.style.width = `${tNorm}%`;
  switchBar.style.width = `${fNorm}%`;

  const glow = 0.2 + idsNorm / 45 + vNorm / 70;
  chip.style.boxShadow = `0 0 ${12 + glow * 8}px rgba(255, 255, 255, ${Math.min(glow, 0.95)})`;

  if (tNorm > 80) {
    insight.textContent = "High thermal stress detected. Cooling strategy should be reinforced.";
  } else if (fNorm > 75) {
    insight.textContent = "Switching intensity is high. Monitor efficiency and EMI conditions.";
  } else if (idsNorm > 70) {
    insight.textContent = "Conduction is strong. Chip operates in high current region.";
  } else {
    insight.textContent = "Operating in moderate zone with balanced electrical stress.";
  }

  drawThermalMap(vNorm, tNorm, fNorm);
  drawOperatingRegionMap(idsPrediction);
}

async function runPrediction() {
  result.textContent = "Ids: calculating...";
  const query = new URLSearchParams({
    vds: vds.value,
    temp: temp.value,
    freq: freq.value,
  });

  try {
    const response = await fetch(`/predict?${query.toString()}`);
    if (!response.ok) throw new Error("Prediction request failed.");
    const data = await response.json();
    const ids = Number(data.Ids_prediction);
    result.textContent = `Ids: ${ids.toFixed(4)} A`;
    updateVisualEffects(ids);
    await drawIdsSweepChart();
  } catch (_error) {
    result.textContent = "Ids: failed to calculate";
  }
}

function drawThermalMap(vNorm, tNorm, fNorm) {
  const w = thermalMap.width;
  const h = thermalMap.height;
  thermalCtx.clearRect(0, 0, w, h);

  for (let y = 0; y < h; y += 4) {
    for (let x = 0; x < w; x += 4) {
      const dx = (x - w / 2) / (w / 2);
      const dy = (y - h / 2) / (h / 2);
      const radial = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
      const stress = (0.5 * tNorm + 0.3 * vNorm + 0.2 * fNorm) / 100;
      const heat = Math.min(1, 0.15 + radial * 0.65 + stress * 0.7);
      const r = Math.floor(255);
      const g = Math.floor(220 - heat * 190);
      const b = Math.floor(70 - heat * 70);
      thermalCtx.fillStyle = `rgb(${r}, ${Math.max(25, g)}, ${Math.max(0, b)})`;
      thermalCtx.fillRect(x, y, 4, 4);
    }
  }

  thermalCtx.strokeStyle = "#f2f2f2";
  thermalCtx.lineWidth = 1;
  thermalCtx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

function drawChartAxes(maxY) {
  const w = chartCanvas.width;
  const h = chartCanvas.height;
  chartCtx.clearRect(0, 0, w, h);

  chartCtx.strokeStyle = "#5e5e5e";
  chartCtx.lineWidth = 1;
  chartCtx.beginPath();
  chartCtx.moveTo(40, 12);
  chartCtx.lineTo(40, h - 30);
  chartCtx.lineTo(w - 14, h - 30);
  chartCtx.stroke();

  chartCtx.fillStyle = "#cfcfcf";
  chartCtx.font = "12px Segoe UI";
  chartCtx.fillText("Ids (A)", 8, 18);
  chartCtx.fillText("Vds (V)", w - 62, h - 8);

  chartCtx.fillStyle = "#9b9b9b";
  for (let i = 0; i <= 4; i++) {
    const y = 12 + ((h - 42) / 4) * i;
    chartCtx.fillText(Math.round(maxY - (maxY / 4) * i).toString(), 2, y + 4);
    chartCtx.strokeStyle = "rgba(255,255,255,0.08)";
    chartCtx.beginPath();
    chartCtx.moveTo(40, y);
    chartCtx.lineTo(w - 14, y);
    chartCtx.stroke();
  }
}

function plotSeries(points, maxY) {
  const w = chartCanvas.width;
  const h = chartCanvas.height;
  const x0 = 40;
  const y0 = h - 30;
  const pw = w - 54;
  const ph = h - 42;

  chartCtx.strokeStyle = "#f5f5f5";
  chartCtx.lineWidth = 2;
  chartCtx.beginPath();

  points.forEach((p, idx) => {
    const x = x0 + (p.vds / 600) * pw;
    const y = y0 - (p.ids / maxY) * ph;
    if (idx === 0) chartCtx.moveTo(x, y);
    else chartCtx.lineTo(x, y);
  });
  chartCtx.stroke();

  const last = points[points.length - 1];
  const lx = x0 + (last.vds / 600) * pw;
  const ly = y0 - (last.ids / maxY) * ph;
  chartCtx.fillStyle = "#ffffff";
  chartCtx.beginPath();
  chartCtx.arc(lx, ly, 3.5, 0, Math.PI * 2);
  chartCtx.fill();
}

async function drawIdsSweepChart() {
  const tempVal = Number(temp.value);
  const freqVal = Number(freq.value);
  const sweepVds = [0, 100, 200, 300, 400, 500, 600];
  const points = [];

  for (const sweep of sweepVds) {
    const query = new URLSearchParams({ vds: sweep, temp: tempVal, freq: freqVal });
    const response = await fetch(`/predict?${query.toString()}`);
    const data = await response.json();
    points.push({ vds: sweep, ids: Number(data.Ids_prediction) });
  }

  const maxY = Math.max(1, ...points.map((p) => p.ids)) * 1.1;
  drawChartAxes(maxY);
  plotSeries(points, maxY);
}

function scoreOperatingPoint(vVal, tVal, fVal, idsVal) {
  const vPenalty = Math.abs(vVal - 280) / 280;
  const tPenalty = Math.max(0, (tVal - 85) / 65);
  const fPenalty = Math.max(0, (fVal - 350000) / 650000);
  const idPenalty = Math.max(0, (idsVal - 13000) / 11000);
  return 1 - (0.28 * vPenalty + 0.34 * tPenalty + 0.18 * fPenalty + 0.2 * idPenalty);
}

function classifyZone(score) {
  if (score >= 0.62) return "BEST";
  if (score >= 0.38) return "HIGH LOAD";
  return "UNDERPERFORMANCE";
}

function zoneColor(score) {
  // Stress map coloring: green (low) -> yellow (medium) -> red (high stress).
  if (score >= 0.62) return "#48c774";
  if (score >= 0.38) return "#ffdd57";
  return "#ff5c5c";
}

function drawOperatingRegionMap(idsPrediction) {
  const w = opMap.width;
  const h = opMap.height;
  const padLeft = 44;
  const padBottom = 30;
  const innerW = w - padLeft - 12;
  const innerH = h - 16 - padBottom;
  const tempVal = Number(temp.value);
  const freqVal = Number(freq.value);
  const vVal = Number(vds.value);

  opCtx.clearRect(0, 0, w, h);

  for (let xi = 0; xi < 20; xi++) {
    for (let yi = 0; yi < 12; yi++) {
      const vCell = (xi / 19) * 600;
      const tCell = 25 + (yi / 11) * 125;
      const estIds = (vCell / 600) * 14000 + (tCell - 25) * 18 + (freqVal / 1e6) * 2200;
      const score = scoreOperatingPoint(vCell, tCell, freqVal, estIds);
      opCtx.fillStyle = zoneColor(score);

      const x = padLeft + (xi / 20) * innerW;
      const y = 16 + (yi / 12) * innerH;
      opCtx.fillRect(x, y, innerW / 20 + 1, innerH / 12 + 1);
    }
  }

  opCtx.strokeStyle = "#7a7a7a";
  opCtx.lineWidth = 1;
  opCtx.strokeRect(padLeft, 16, innerW, innerH);

  opCtx.fillStyle = "#cdcdcd";
  opCtx.font = "12px Segoe UI";
  opCtx.fillText("Temp (C)", 6, 26);
  opCtx.fillText("Vds (V)", w - 56, h - 6);

  opCtx.fillStyle = "#a7a7a7";
  opCtx.fillText("150", 10, 24);
  opCtx.fillText("25", 16, h - padBottom + 2);
  opCtx.fillText("0", padLeft - 4, h - 8);
  opCtx.fillText("600", w - 20, h - 8);

  const markerX = padLeft + (vVal / 600) * innerW;
  const markerY = 16 + ((tempVal - 25) / 125) * innerH;
  const scoreNow = scoreOperatingPoint(vVal, tempVal, freqVal, idsPrediction);
  const zone = classifyZone(scoreNow);

  opCtx.beginPath();
  opCtx.arc(markerX, markerY, 5, 0, Math.PI * 2);
  opCtx.fillStyle = "#ffffff";
  opCtx.fill();
  opCtx.strokeStyle = "#101010";
  opCtx.stroke();

  opCtx.fillStyle = "#ffffff";
  opCtx.font = "bold 12px Segoe UI";
  opCtx.fillText(`Current point: ${zone}`, padLeft + 8, 14);
}

function setupGraphVisibilityToggles() {
  [...graphToggles].forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const target = toggle.dataset.target;
      const widget = playground.querySelector(`.widget[data-widget="${target}"]`);
      if (!widget) return;
      widget.style.display = toggle.checked ? "" : "none";
    });
  });
}

function renderMetricsTable(metricsData) {
  const rows = [
    ["R2", "r2"],
    ["RMSE", "rmse"],
    ["MSE", "mse"],
    ["MAE", "mae"],
    ["MAPE", "mape"],
    ["F1 (proxy)", "f1"],
    ["Accuracy (proxy)", "accuracy"],
  ];

  const models = ["mlp", "physics", "hybrid"];
  const header = `
    <tr>
      <th>Metric</th>
      <th>MLP</th>
      <th>Physics</th>
      <th>Hybrid</th>
    </tr>
  `;

  const body = rows
    .map(([label, key]) => {
      const values = models.map((modelKey) => {
        const model = metricsData.models[modelKey];
        const fromRegression = model.regression[key];
        const fromCls = model.classification_proxy[key];
        const value = fromRegression ?? fromCls ?? 0;
        return Number(value).toFixed(4);
      });
      return `<tr><td>${label}</td><td>${values[0]}</td><td>${values[1]}</td><td>${values[2]}</td></tr>`;
    })
    .join("");

  metricsTableWrap.innerHTML = `<table class="metrics-table"><thead>${header}</thead><tbody>${body}</tbody></table>`;
}

async function loadMetrics() {
  metricsStatus.textContent = "Loading metrics...";
  metricsTableWrap.innerHTML = "";
  try {
    const response = await fetch("/metrics");
    if (!response.ok) throw new Error("Metrics request failed");
    const data = await response.json();
    renderMetricsTable(data);
    const threshold = data.models.hybrid.classification_proxy.threshold;
    metricsStatus.textContent = `Loaded successfully. F1/Accuracy are proxy classification metrics at threshold ${Number(threshold).toFixed(2)}.`;
  } catch (_error) {
    metricsStatus.textContent = "Failed to load metrics.";
  }
}

function setupPlaygroundDragDrop() {
  let dragged = null;
  const widgets = playground.querySelectorAll(".widget");

  widgets.forEach((widget) => {
    const handle = widget.querySelector(".widget-handle");
    handle.addEventListener("mousedown", () => {
      widget.setAttribute("draggable", "true");
    });

    widget.addEventListener("dragstart", (event) => {
      dragged = widget;
      widget.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
    });

    widget.addEventListener("dragend", () => {
      widget.classList.remove("dragging");
      dragged = null;
    });

    widget.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!dragged || dragged === widget) return;
      const rect = widget.getBoundingClientRect();
      const shouldInsertBefore = event.clientY < rect.top + rect.height / 2;
      if (shouldInsertBefore) {
        playground.insertBefore(dragged, widget);
      } else {
        playground.insertBefore(dragged, widget.nextSibling);
      }
    });
  });
}

[...presetButtons].forEach((btn) => {
  btn.addEventListener("click", async () => {
    const preset = btn.dataset.preset;
    if (preset === "low_loss") {
      vds.value = 120;
      temp.value = 45;
      freq.value = 50000;
    } else if (preset === "high_stress") {
      vds.value = 540;
      temp.value = 140;
      freq.value = 800000;
    } else if (preset === "rf_mode") {
      vds.value = 260;
      temp.value = 90;
      freq.value = 950000;
    }
    updateLabels();
    await runPrediction();
  });
});

[vds, temp, freq].forEach((el) =>
  el.addEventListener("input", () => {
    updateLabels();
    updateVisualEffects(0);
  })
);

predictBtn.addEventListener("click", runPrediction);
refreshMetricsBtn.addEventListener("click", loadMetrics);

setupPlaygroundDragDrop();
setupGraphVisibilityToggles();
updateLabels();
loadMetrics();
runPrediction();
