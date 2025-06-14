const BAR_COLORS = [
  "#3370ff", "#7edfc7", "#ffcf57", "#b5d4cd", "#6f8a99", "#9bb7c8", "#f5f7fa", "#ffb996", "#0077b6"
];
const PIE_COLORS = [
  "#7edfc7", "#3370ff", "#ffcf57", "#b5d4cd", "#9bb7c8", "#ffb996", "#0077b6", "#6f8a99", "#f5f7fa"
];
let wasteTypeBarChart, eventTypePieChart, summaryLineChart;

function getChain() {
  return JSON.parse(localStorage.getItem('ecotrace_blockchain') || '[]');
}
function getWasteTypeStats(chain) {
  const stats = {};
  chain.forEach(b => {
    if (b.index === 0) return;
    if (!b.wasteType) return;
    stats[b.wasteType] = (stats[b.wasteType] || 0) + 1;
  });
  return stats;
}
function getEventTypeStats(chain) {
  const stats = {};
  chain.forEach(b => {
    if (b.index === 0) return;
    if (!b.eventType) return;
    stats[b.eventType] = (stats[b.eventType] || 0) + 1;
  });
  return stats;
}
function updateCharts() {
  const chain = getChain();
  // Waste Type Bar
  const wasteStats = getWasteTypeStats(chain);
  const wasteLabels = Object.keys(wasteStats);
  const wasteCounts = wasteLabels.map(l => wasteStats[l]);
  if (wasteTypeBarChart) wasteTypeBarChart.destroy();
  wasteTypeBarChart = new Chart(document.getElementById('wasteTypeBar').getContext('2d'), {
    type: 'bar',
    data: {
      labels: wasteLabels,
      datasets: [{
        label: 'Number of Events',
        data: wasteCounts,
        backgroundColor: BAR_COLORS,
        borderColor: "#181a1e",
        borderWidth: 2,
        borderRadius: 12,
        hoverBackgroundColor: PIE_COLORS,
        hoverBorderColor: "#3370ff",
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: 2,
      layout: { padding: { top: 12, bottom: 12, left: 18, right: 18 } },
      animation: {
        duration: 1400,
        easing: "easeOutQuart",
        animateScale: true,
        animateRotate: false,
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Waste Type Distribution",
          color: "#3370ff",
          font: { family: "League Spartan, Inter, Arial, sans-serif", size: 22, weight: "bold" }
        },
        tooltip: {
          backgroundColor: "#232a32",
          titleColor: "#3370ff",
          bodyColor: "#181a1e",
          borderColor: "#7edfc7",
          borderWidth: 2,
          titleFont: { family: "League Spartan, Inter, Arial, sans-serif", size: 16, weight: "bold" },
          bodyFont: { family: "Inter, Arial, sans-serif", size: 15 }
        }
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: "#3370ff", font: { size: 15 } }, grid: { color: "#232a3222" } },
        x: { ticks: { color: "#f5f7fa", font: { size: 15, family: "League Spartan, Inter, Arial, sans-serif" } }, grid: { color: "#232a3214" } }
      }
    }
  });

  // Event Type Pie
  const eventStats = getEventTypeStats(chain);
  const eventLabels = Object.keys(eventStats);
  const eventCounts = eventLabels.map(l => eventStats[l]);
  if (eventTypePieChart) eventTypePieChart.destroy();
  eventTypePieChart = new Chart(document.getElementById('eventTypePie').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: eventLabels,
      datasets: [{
        data: eventCounts,
        backgroundColor: PIE_COLORS,
        borderColor: "#181a1e",
        borderWidth: 5,
        hoverBorderColor: "#3370ff",
        hoverOffset: 24
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      devicePixelRatio: 2,
      layout: { padding: { top: 12, bottom: 12, left: 18, right: 18 } },
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1600,
        easing: "easeOutElastic"
      },
      plugins: {
        legend: { 
          display: true, 
          position: "bottom", 
          labels: { color: "#3370ff", font: { size: 17, family: "League Spartan, Inter, Arial, sans-serif" } }
        },
        title: {
          display: true,
          text: "Event Type Proportion",
          color: "#3370ff",
          font: { family: "League Spartan, Inter, Arial, sans-serif", size: 22, weight: "bold" }
        },
        tooltip: {
          backgroundColor: "#232a32",
          titleColor: "#3370ff",
          bodyColor: "#181a1e",
          borderColor: "#7edfc7",
          borderWidth: 2,
          titleFont: { family: "League Spartan, Inter, Arial, sans-serif", size: 16, weight: "bold" },
          bodyFont: { family: "Inter, Arial, sans-serif", size: 15 }
        }
      }
    }
  });
}

// --- Summary Line Chart for Event Activity ---
function getEventsPerDay(chain, days = 14) {
  // Return {labels: [...], data: [...]}, for the last `days` days
  const counts = {};
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const label = d.toISOString().slice(0, 10);
    counts[label] = 0;
  }
  chain.forEach(b => {
    if (b.index === 0) return;
    let dateStr;
    if (b.timestamp) {
      const d = new Date(b.timestamp);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().slice(0, 10);
      }
    }
    if (dateStr && (dateStr in counts)) {
      counts[dateStr]++;
    }
  });
  return {
    labels: Object.keys(counts),
    data: Object.values(counts)
  };
}

function updateSummaryLineChart() {
  const chain = getChain();
  const { labels, data } = getEventsPerDay(chain, 14);
  if (summaryLineChart) summaryLineChart.destroy();
  summaryLineChart = new Chart(document.getElementById('summaryLineChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Events per Day',
        data: data,
        fill: true,
        borderColor: '#3370ff',
        backgroundColor: 'rgba(51,112,255,0.10)',
        pointBackgroundColor: '#7edfc7',
        pointRadius: 6,
        borderWidth: 3.2,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: 2,
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          backgroundColor: "#232a32",
          titleColor: "#3370ff",
          bodyColor: "#181a1e",
          borderColor: "#7edfc7",
          borderWidth: 2,
          titleFont: { family: "League Spartan, Inter, Arial, sans-serif", size: 16, weight: "bold" },
          bodyFont: { family: "Inter, Arial, sans-serif", size: 15 }
        }
      },
      layout: { padding: { top: 6, bottom: 6, left: 6, right: 6 } },
      animation: {
        duration: 1200,
        easing: "easeOutCirc"
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: "#3370ff", font: { size: 15 } }, grid: { color: "#232a3222" } },
        x: { ticks: { color: "#f5f7fa", font: { size: 13 } }, grid: { color: "#232a3214" } }
      }
    }
  });
}

// --- Sustainability/Impact Widget Update ---
function updateImpactWidget() {
  const chain = getChain();
  let totalWaste = 0;
  let binSet = new Set();
  let events = 0;
  chain.forEach(b => {
    if (b.index === 0) return;
    events++;
    binSet.add(b.binId);
    if (b.weight && !isNaN(parseFloat(b.weight))) {
      totalWaste += parseFloat(b.weight);
    }
  });
  document.getElementById('impact-waste').textContent = totalWaste.toFixed(2);
  document.getElementById('impact-bins').textContent = binSet.size;
  document.getElementById('impact-events').textContent = events;
}

// Chart download
window.downloadChart = function(canvasId, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = document.getElementById(canvasId).toDataURL('image/png', 1.0);
  link.click();
};

// --- QR Code Scanning Logic ---
let qrReader;
let qrActive = false;
document.getElementById('scanBtn').onclick = function() {
  const qrDiv = document.getElementById('qr-reader');
  if (!qrActive) {
    qrDiv.classList.remove('hide');
    qrActive = true;
    qrReader = new Html5Qrcode("qr-reader");
    qrReader.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 200 },
      qrMsg => {
        document.getElementById('binId').value = qrMsg;
        document.getElementById('status').innerText = "QR scanned!";
        qrReader.stop();
        qrDiv.classList.add('hide');
        qrActive = false;
        document.getElementById('scanBtn').innerText = "Scan QR";
      },
      errorMsg => {}
    ).catch(err => {
      document.getElementById('status').innerText = "QR scanner error: " + err;
    });
    document.getElementById('scanBtn').innerText = "Stop Scan";
  } else {
    qrReader.stop();
    qrDiv.classList.add('hide');
    qrActive = false;
    document.getElementById('scanBtn').innerText = "Scan QR";
  }
};

// --- MetaMask signing logic ---
async function signWithMetaMask(message) {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask is not detected! Make sure your browser extension is installed, enabled, and you are in a standard browser tab (not VS Code preview).");
    return null;
  }
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const from = accounts[0];
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, from]
    });
    return { address: from, signature };
  } catch (err) {
    alert("MetaMask signature rejected or failed: " + err.message);
    return null;
  }
}

// --- Blockchain logic ---
async function sha256(msg) {
  const encoder = new TextEncoder();
  const data = encoder.encode(msg);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}
const STORAGE_KEY = 'ecotrace_blockchain';
function saveChain(chain) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chain));
}
async function ensureGenesis() {
  let chain = getChain();
  if (chain.length === 0) {
    const genesis = {
      index: 0,
      timestamp: new Date().toLocaleString(),
      binId: "GENESIS",
      eventType: "GENESIS",
      staffId: "system",
      wasteType: "",
      weight: "",
      address: "",
      signature: "",
      prevHash: "0",
      hash: await sha256("GENESIS" + Date.now()),
      certId: "GENESIS"
    };
    chain.push(genesis);
    saveChain(chain);
  }
}
function createCertId(block) {
  return sha256(
    block.index + "|" + block.timestamp + "|" + block.binId + "|" +
    block.eventType + "|" + block.staffId + "|" + block.wasteType + "|" + block.weight +
    "|" + block.address + "|" + block.signature
  );
}
async function addBlock(binId, eventType, staffId, wasteType, weight, address, signature) {
  const chain = getChain();
  const prevBlock = chain[chain.length - 1];
  const index = chain.length;
  const timestamp = new Date().toLocaleString();
  const prevHash = prevBlock.hash;
  const data = `${index}|${timestamp}|${binId}|${eventType}|${wasteType}|${weight}|${staffId}|${address}|${signature}|${prevHash}`;
  const hash = await sha256(data);
  const block = { index, timestamp, binId, eventType, wasteType, weight, staffId, address, signature, prevHash, hash, certId: "" };
  block.certId = await createCertId(block);
  chain.push(block);
  saveChain(chain);
  return block;
}

// --- FIXED: Always generate correct path for certificate.html ---
// If your certificate.html is in the same folder as your main page, this works everywhere.
async function updateTable() {
  await ensureGenesis();
  const chain = getChain();
  const tbody = document.getElementById('chainTable').querySelector('tbody');
  tbody.innerHTML = "";
  chain.forEach(async (b, idx) => {
    if (b.index === 0) return;
    // Robust: path to certificate.html in same folder as this page
    const basePath = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
    const certUrl = basePath + `certificate.html?cert=${b.certId}`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.index}</td>
      <td>${b.timestamp}</td>
      <td>${b.binId}</td>
      <td>${b.eventType}</td>
      <td>${b.wasteType}</td>
      <td>${b.weight}</td>
      <td>${b.staffId}</td>
      <td style="font-size:0.87em;word-break:break-all;">${b.address}</td>
      <td class="qr-cell"><canvas id="qr${b.certId}" width="48" height="48"></canvas><br>
        <a href="${certUrl}" target="_blank" style="font-size:.92em;">View</a>
      </td>
    `;
    tbody.appendChild(tr);
    setTimeout(() => {
      new QRious({
        element: document.getElementById(`qr${b.certId}`),
        value: certUrl,
        size: 48
      });
    }, 0);
  });
  updateCharts();
  updateSummaryLineChart();
  updateImpactWidget();
}

document.getElementById('logBtn').onclick = async function() {
  const binId = document.getElementById('binId').value;
  const eventType = document.getElementById('eventType').value;
  const staffId = document.getElementById('staffId').value.trim();
  const wasteType = document.getElementById('wasteType').value;
  const weight = document.getElementById('weight').value.trim();
  if (!binId || !staffId || !wasteType || !weight) {
    document.getElementById('status').innerText = "Please fill out all fields.";
    return;
  }
  const message = `EcoTrace Waste Log:
Bin ${binId}, Event ${eventType}, Staff ${staffId}, WasteType ${wasteType}, Weight ${weight}kg, Timestamp ${new Date().toLocaleString()}`;
  document.getElementById('status').innerText = "Waiting for MetaMask signature...";
  let result;
  try {
    result = await signWithMetaMask(message);
  } catch (e) {
    document.getElementById('status').innerText = "MetaMask signature failed.";
    return;
  }
  if (!result) {
    document.getElementById('status').innerText = "MetaMask signature failed.";
    return;
  }
  await addBlock(binId, eventType, staffId, wasteType, weight, result.address, result.signature);
  await updateTable();
  document.getElementById('status').innerText = "Block added and signed!";
  document.getElementById('binId').value = "";
  document.getElementById('staffId').value = "";
  document.getElementById('wasteType').selectedIndex = 0;
  document.getElementById('weight').value = "";
  setTimeout(() => document.getElementById('status').innerText = "", 1700);
};

window.exportCSV = function() {
  const chain = getChain();
  let csv = "Index,Timestamp,Bin ID,Event Type,Waste Type,Weight,Staff,MetaMask Address,Signature,Prev Hash,Hash,CertId\n";
  chain.forEach(b => {
    csv += `"${b.index}","${b.timestamp}","${b.binId}","${b.eventType}","${b.wasteType}","${b.weight}","${b.staffId}","${b.address}","${b.signature}","${b.prevHash}","${b.hash}","${b.certId}"\n`;
  });
  const blob = new Blob([csv], {type: 'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "ecotrace_blockchain.csv";
  a.click();
};
window.validateChain = async function() {
  const chain = getChain();
  let valid = true;
  for (let i = 1; i < chain.length; ++i) {
    const prev = chain[i-1];
    const curr = chain[i];
    const data = `${curr.index}|${curr.timestamp}|${curr.binId}|${curr.eventType}|${curr.wasteType}|${curr.weight}|${curr.staffId}|${curr.address}|${curr.signature}|${curr.prevHash}`;
    const realHash = await sha256(data);
    if (curr.prevHash !== prev.hash || curr.hash !== realHash) {
      valid = false;
      break;
    }
  }
  document.getElementById('chainStatus').innerHTML = valid
    ? '<span style="color:#7edfc7;">Blockchain is valid ✓</span>'
    : '<span class="invalid">Blockchain is INVALID ✗</span>';
};
// On load
ensureGenesis().then(() => {
  updateTable();
  updateCharts();
  updateSummaryLineChart();
  updateImpactWidget();
});