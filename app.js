const monthKey = "prod-jan-2026"; // podes mudar o ano se quiseres
const days = Array.from({length: 31}, (_,i)=>i+1);

const rows = [
  { group: "Rotina", label: "Acordar antes das 09:00 (hora)", type: "time" },
  { group: "Rotina", label: "Peso (kg)", type: "number" },
  { group: "Rotina", label: "Chegar ao escritório até às 09:30 (hora)", type: "time" },

  { group: "Trabalho", label: "Trabalho (principal)", type: "check" },
  { group: "Trabalho", label: "Side Hustle", type: "check" },
  { group: "Trabalho", label: "Estudei Direito", type: "check" },

  { group: "Saúde", label: "Ginásio", type: "check" },
  { group: "Saúde", label: "Contagem de calorias", type: "check" },
  { group: "Saúde", label: "Proteína (g)", type: "number" },
  { group: "Saúde", label: "Hidratos (g)", type: "number" },
  { group: "Saúde", label: "Gordura (g)", type: "number" },

  { group: "Hábitos", label: "Fumar", type: "check" },
  { group: "Hábitos", label: "Bebi álcool", type: "check" },
  { group: "Hábitos", label: "Tomei suplementos", type: "check" },
  { group: "Hábitos", label: "Escrevi no journal", type: "check" },
  { group: "Hábitos", label: "Joguei Playstation", type: "check" },
];

function loadData(){
  try { return JSON.parse(localStorage.getItem(monthKey) || "{}"); }
  catch { return {}; }
}
function saveData(data){
  localStorage.setItem(monthKey, JSON.stringify(data));
  const el = document.getElementById("status");
  el.textContent = `Guardado: ${new Date().toLocaleString()}`;
}

function cellId(r, d){ return `${r}__${d}`; }

function render(){
  const data = loadData();
  const table = document.getElementById("grid");
  table.innerHTML = "";

  // header
  const thead = document.createElement("thead");
  const hr = document.createElement("tr");
  const h0 = document.createElement("th");
  h0.textContent = "Atividade";
  h0.className = "sticky";
  hr.appendChild(h0);
  for (const d of days){
    const th = document.createElement("th");
    th.textContent = d;
    hr.appendChild(th);
  }
  thead.appendChild(hr);
  table.appendChild(thead);

  // body
  const tbody = document.createElement("tbody");
  let lastGroup = null;

  rows.forEach((row, rIndex) => {
    if (row.group !== lastGroup){
      const gr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = days.length + 1;
      td.style.textAlign = "left";
      td.style.background = "#0f0f11";
      td.style.fontWeight = "600";
      td.textContent = row.group;
      gr.appendChild(td);
      tbody.appendChild(gr);
      lastGroup = row.group;
    }

    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = row.label;
    name.className = "sticky";
    tr.appendChild(name);

    for (const d of days){
      const td = document.createElement("td");
      const id = cellId(rIndex, d);
      const value = data[id];

      let input;
      if (row.type === "check"){
        input = document.createElement("input");
        input.type = "checkbox";
        input.checked = !!value;
        input.addEventListener("change", () => {
          const nd = loadData();
          nd[id] = input.checked ? 1 : 0;
          saveData(nd);
        });
      } else if (row.type === "time"){
        input = document.createElement("input");
        input.type = "time";
        input.value = value || "";
        input.addEventListener("input", () => {
          const nd = loadData();
          nd[id] = input.value;
          saveData(nd);
        });
      } else {
        input = document.createElement("input");
        input.type = "number";
        input.inputMode = "decimal";
        input.value = (value ?? "");
        input.addEventListener("input", () => {
          const nd = loadData();
          nd[id] = input.value;
          saveData(nd);
        });
      }

      td.appendChild(input);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
}

function exportCSV(){
  const data = loadData();
  const lines = [];
  lines.push(["Atividade", ...days.map(String)].join(","));

  rows.forEach((row, rIndex) => {
    const vals = days.map(d => {
      const v = data[cellId(rIndex, d)];
      if (row.type === "check") return v ? "1" : "0";
      return (v ?? "").toString().replaceAll('"','""');
    });
    lines.push([`"${row.label.replaceAll('"','""')}"`, ...vals].join(","));
  });

  const blob = new Blob([lines.join("\n")], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "produtividade_janeiro.csv";
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("exportCsv").addEventListener("click", exportCSV);
document.getElementById("reset").addEventListener("click", () => {
  if (confirm("Tens a certeza que queres apagar os dados de Janeiro?")){
    localStorage.removeItem(monthKey);
    render();
    document.getElementById("status").textContent = "Apagado.";
  }
});

// register service worker (offline)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(()=>{});
}

render();
