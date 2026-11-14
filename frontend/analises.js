
const API_ANALISES = "http://localhost:3001/api/dashboard";
let graficoAnalisePeriodo = null;

let graficoResolvidosPeriodo = null;


async function analisarPeriodo() {
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;
  const botao = document.getElementById("btnAnalisar");

  if (!dataInicio || !dataFim) {
    alert("Selecione a data inicial e a data final.");
    return;
  }

  if (dataInicio > dataFim) {
    alert("A data inicial não pode ser maior que a data final.");
    return;
  }

  const parametros = new URLSearchParams({
    dataInicio,
    dataFim
  });

  botao.disabled = true;
  botao.textContent = "Analisando...";

  try {
    const resposta = await fetch(
      `${API_ANALISES}/por-periodo?${parametros.toString()}`
    );

    if (!resposta.ok) {
      throw new Error("Não foi possível consultar o período.");
    }

    const dados = await resposta.json();

    console.log("Resultado da análise por período:", dados);

    const totalPeriodo = dados.reduce(
      (total, item) => total + Number(item.quantidade),
      0
    );

    const inicio = new Date(`${dataInicio}T00:00:00Z`);
    const fim = new Date(`${dataFim}T00:00:00Z`);

    const quantidadeDias = Math.round(
      (fim - inicio) / 86400000
    ) + 1;

    const mediaDiaria = totalPeriodo / quantidadeDias;

    document.getElementById("totalPeriodo").textContent =
      totalPeriodo;

    document.getElementById("mediaPeriodo").textContent =
      mediaDiaria.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });


    const datas = dados.map((item) => {
      const [ano, mes, dia] = item.data.split("-");
      return `${dia}/${mes}`;
    });

    const quantidades = dados.map((item) => item.quantidade);

    const canvas = document.getElementById("graficoAnalisePeriodo");

    if (graficoAnalisePeriodo) {
      graficoAnalisePeriodo.destroy();
    }

    graficoAnalisePeriodo = new Chart(canvas, {
      type: "bar",
      data: {
        labels: datas,
        datasets: [
          {
            label: "Chamados registrados",
            data: quantidades,
            backgroundColor: "#2563eb",
            borderRadius: 6,
            maxBarThickness: 45
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

    const respostaResolvidos = await fetch(
      `${API_ANALISES}/resolvidos-por-periodo?${parametros.toString()}`
    );

    if (!respostaResolvidos.ok) {
      throw new Error("Não foi possível consultar os chamados resolvidos.");
    }

    const dadosResolvidos = await respostaResolvidos.json();

    const datasResolvidos = dadosResolvidos.map(item => {
      const [ano, mes, dia] = item.data.split("-");
      return `${dia}/${mes}`;
    });

    const quantidadesResolvidos = dadosResolvidos.map(
      item => Number(item.quantidade)
    );

    const canvasResolvidos = document.getElementById(
      "graficoResolvidosPeriodo"
    );

    if (graficoResolvidosPeriodo) {
      graficoResolvidosPeriodo.destroy();
    }

    graficoResolvidosPeriodo = new Chart(canvasResolvidos, {
      type: "bar",
      data: {
        labels: datasResolvidos,
        datasets: [
          {
            label: "Chamados resolvidos",
            data: quantidadesResolvidos,
            backgroundColor: "#16a34a",
            borderRadius: 6,
            maxBarThickness: 45
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
    console.error("Erro na análise por período:", error);
    alert("Erro ao consultar os dados. Verifique se o backend está funcionando.");
  } finally {
    botao.disabled = false;
    botao.textContent = "Analisar";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnAnalisar").addEventListener("click", analisarPeriodo);
});
