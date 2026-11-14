
const API_DASHBOARD = "http://localhost:3001/api/dashboard";

async function carregarIndicadores() {
  try {
    const resposta = await fetch(`${API_DASHBOARD}/indicadores`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os indicadores.");
    }

    const dados = await resposta.json();

    console.log("Indicadores recebidos:", dados);

    document.getElementById("totalChamados").textContent = dados.totalChamados ?? 0;
    document.getElementById("chamadosAbertos").textContent = dados.abertos ?? 0;
    document.getElementById("chamadosAndamento").textContent = dados.emAndamento ?? 0;
    document.getElementById("chamadosAguardando").textContent = dados.aguardando ?? 0;
    document.getElementById("chamadosResolvidos").textContent = dados.resolvidos ?? 0;
    document.getElementById("chamadosCancelados").textContent = dados.cancelados ?? 0;
  } catch (error) {
    console.error("Erro ao carregar indicadores:", error);
  }
}


let graficoPeriodo = null;

async function carregarGraficoPeriodo() {
  try {
    const resposta = await fetch(`${API_DASHBOARD}/por-periodo`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os dados por período.");
    }

    const dados = await resposta.json();

    const datas = dados.map((item) => {
      const [ano, mes, dia] = item.data.split("-");
      return `${dia}/${mes}`;
    });

    const quantidades = dados.map((item) => item.quantidade);

    const canvas = document.getElementById("graficoPeriodo");

    if (graficoPeriodo) {
      graficoPeriodo.destroy();
    }

    graficoPeriodo = new Chart(canvas, {
      type: "line",
      data: {
        labels: datas,
        datasets: [
          {
            label: "Chamados registrados",
            data: quantidades,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.12)",
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: "#2563eb"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Erro ao carregar gráfico por período:", error);
  }
}


let graficoTipos = null;

async function carregarGraficoTipos() {
  try {
    const resposta = await fetch(`${API_DASHBOARD}/ranking-tipos`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar o ranking de tipos.");
    }

    const dados = await resposta.json();

    const tipos = dados.map((item) => item.tipo);
    const quantidades = dados.map((item) => item.quantidade);

    const canvas = document.getElementById("graficoTipos");

    if (graficoTipos) {
      graficoTipos.destroy();
    }

    graficoTipos = new Chart(canvas, {
      type: "bar",
      data: {
        labels: tipos,
        datasets: [
          {
            label: "Quantidade de chamados",
            data: quantidades,
            backgroundColor: "#2563eb",
            borderRadius: 6,
            barThickness: 18
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              autoSkip: false,
              font: {
                size: 10
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Erro ao carregar gráfico de tipos:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarIndicadores();
  carregarGraficoPeriodo();
  carregarGraficoTipos();

  document.getElementById("btnAtualizar").addEventListener("click", () => {
    carregarIndicadores();
    carregarGraficoPeriodo();
    carregarGraficoTipos();
  });
});


