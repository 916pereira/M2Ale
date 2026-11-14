
const API_CHAMADOS = "http://localhost:3001/api/chamados";
let chamadoSelecionadoId = null;

async function carregarChamados() {
  const tabela = document.getElementById("tabelaChamados");
  const status = document.getElementById("filtroStatus").value;
  const prioridade = document.getElementById("filtroPrioridade").value;

  const parametros = new URLSearchParams();

  if (status) {
    parametros.append("status", status);
  }

  if (prioridade) {
    parametros.append("prioridade", prioridade);
  }

  const url = parametros.toString()
    ? `${API_CHAMADOS}?${parametros.toString()}`
    : API_CHAMADOS;

  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os chamados");
    }

    const chamados = await resposta.json();

    console.log("Chamados recebidos da API:", chamados);

        tabela.innerHTML = "";

    if (chamados.length === 0) {
      const linha = document.createElement("tr");
      const celula = document.createElement("td");

      celula.colSpan = 8;
      celula.textContent = "Nenhum chamado encontrado.";

      linha.appendChild(celula);
      tabela.appendChild(linha);

      return;
    }

    chamados.forEach((chamado) => {
      const linha = document.createElement("tr");

        const valores = [
        chamado.id,
        chamado.titulo,
        chamado.tipo,
        chamado.prioridade,
        chamado.status,
        chamado.solicitante,
        chamado.criadoEm
          ? new Date(chamado.criadoEm).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo"
            })
          : "-"
      ];

      
      valores.forEach((valor, indice) => {
        const celula = document.createElement("td");

        if (indice === 3 || indice === 4) {
          const etiqueta = document.createElement("span");

          etiqueta.classList.add("etiqueta");
          etiqueta.classList.add(
            indice === 3
              ? `prioridade-${String(valor).toLowerCase()}`
              : `status-${String(valor).toLowerCase()}`
          );

          etiqueta.textContent = String(valor ?? "-").replaceAll("_", " ");
          celula.appendChild(etiqueta);
        } else {
          celula.textContent = valor ?? "-";
        }

        linha.appendChild(celula);
      });

      const celulaAcoes = document.createElement("td");
      const botaoDetalhes = document.createElement("button");

      botaoDetalhes.type = "button";
      botaoDetalhes.className = "btn-detalhes";
      botaoDetalhes.textContent = "Ver detalhes";

      
      botaoDetalhes.addEventListener("click", async () => {
                chamadoSelecionadoId = chamado.id;

        document.getElementById("novoStatus").value = "";
        document.getElementById("consideracaoTecnica").value = "";
        document.getElementById("mensagemStatus").textContent = "";
        const modal = document.getElementById("modalDetalhes");
        const conteudo = document.getElementById("conteudoDetalhes");

        modal.classList.add("ativo");
        conteudo.textContent = "Carregando informações...";

        try {
          const resposta = await fetch(`${API_CHAMADOS}/${chamado.id}`);

          if (!resposta.ok) {
            throw new Error("Não foi possível carregar os detalhes");
          }

          const detalhes = await resposta.json();

          console.log("Detalhes do chamado:", detalhes);

          const respostaHistorico = await fetch(
            `${API_CHAMADOS}/${chamado.id}/historico`
          );

          if (!respostaHistorico.ok) {
            throw new Error("Não foi possível carregar o histórico");
          }

          const historico = await respostaHistorico.json();

          console.log("Histórico do chamado:", historico);


          conteudo.innerHTML = "";

          const campos = [
            ["ID", detalhes.id],
            ["Título", detalhes.titulo],
            ["Descrição", detalhes.descricao],
            ["Tipo", detalhes.tipo],
            ["Prioridade", detalhes.prioridade],
            ["Status", detalhes.status],
            ["Solicitante", detalhes.solicitante],
            ["Técnico", detalhes.tecnico],
            ["Data de abertura", detalhes.criadoEm]
          ];

          campos.forEach(([nome, valor]) => {
            const paragrafo = document.createElement("p");
            const titulo = document.createElement("strong");

            titulo.textContent = `${nome}: `;
            paragrafo.appendChild(titulo);
            paragrafo.appendChild(
              document.createTextNode(String(valor ?? "-"))
            );

            paragrafo.style.marginBottom = "12px";
            conteudo.appendChild(paragrafo);
          });

          const tituloHistorico = document.createElement("h3");
          tituloHistorico.textContent = "Histórico de alterações";
          tituloHistorico.style.marginTop = "24px";
          tituloHistorico.style.marginBottom = "16px";

          conteudo.appendChild(tituloHistorico);

          if (historico.length === 0) {
            const mensagem = document.createElement("p");
            mensagem.textContent = "Nenhuma alteração registrada.";
            conteudo.appendChild(mensagem);
          } else {
            historico.forEach((registro) => {
              const item = document.createElement("div");
              item.className = "historico-item";

              
              const nomesCampos = {
                usuario: "Responsável",
                statusAnterior: "Status anterior",
                statusNovo: "Novo status",
                consideracaoTecnica: "Consideração técnica",
                criadoEm: "Data da alteração"
              };

              Object.entries(registro).forEach(([campo, valor]) => {
                if (!nomesCampos[campo]) {
                  return;
                }

                const linha = document.createElement("p");
                const nomeCampo = document.createElement("strong");

                nomeCampo.textContent = `${nomesCampos[campo]}: `;

                let valorFormatado = valor ?? "-";

                if (campo === "criadoEm" && valor) {
                  valorFormatado = new Date(valor).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo"
                  });
                }

                if (
                  (campo === "statusAnterior" || campo === "statusNovo") &&
                  valor
                ) {
                  valorFormatado = String(valor).replaceAll("_", " ");
                }

                linha.appendChild(nomeCampo);
                linha.appendChild(
                  document.createTextNode(String(valorFormatado))
                );

                item.appendChild(linha);
              });


              conteudo.appendChild(item);
            });
          }

        } catch (error) {
          console.error("Erro ao buscar detalhes:", error);
          conteudo.textContent = "Erro ao carregar os detalhes do chamado.";
        }
      });


      celulaAcoes.appendChild(botaoDetalhes);
      linha.appendChild(celulaAcoes);
    
      tabela.appendChild(linha);
    });
  } catch (error) {
    console.error("Erro ao carregar chamados:", error);

    tabela.innerHTML = `
      <tr>
        <td colspan="7">Erro ao carregar os chamados.</td>
      </tr>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarChamados();

  document.getElementById("btnFiltrar").addEventListener("click", carregarChamados);
  document.getElementById("btnFecharModal").addEventListener("click", () => {
  document.getElementById("modalDetalhes").classList.remove("ativo");
});

document.getElementById("btnSalvarStatus").addEventListener("click", async () => {
  const novoStatus = document.getElementById("novoStatus").value;
  const consideracaoTecnica = document.getElementById("consideracaoTecnica").value.trim();
  const mensagem = document.getElementById("mensagemStatus");
  const botao = document.getElementById("btnSalvarStatus");

  if (!chamadoSelecionadoId) {
    mensagem.textContent = "Nenhum chamado selecionado.";
    mensagem.style.color = "#dc2626";
    return;
  }

  if (!novoStatus) {
    mensagem.textContent = "Selecione um novo status.";
    mensagem.style.color = "#dc2626";
    return;
  }

  if (!consideracaoTecnica) {
    mensagem.textContent = "Informe a consideração técnica.";
    mensagem.style.color = "#dc2626";
    return;
  }

  botao.disabled = true;
  mensagem.textContent = "Salvando alteração...";
  mensagem.style.color = "#475569";

  try {
    const resposta = await fetch(
      `${API_CHAMADOS}/${chamadoSelecionadoId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
        status: novoStatus,
        usuarioId: 1,
        consideracaoTecnica: consideracaoTecnica
        })
      }
    );

    const resultado = await resposta.json();
    console.log("Resposta do PATCH:", resultado);

    
    if (!resposta.ok) {
      console.error("Status HTTP:", resposta.status);
      console.error("Resposta da API:", resultado);

      throw new Error(
        resultado.erro ||
        resultado.message ||
        resultado.mensagem ||
        "Erro ao atualizar status."
      );
    }


    
    await carregarChamados();

    const botaoDetalhesAtualizado = Array.from(
      document.querySelectorAll(".btn-detalhes")
    ).find((botaoDetalhes) => {
      const linha = botaoDetalhes.closest("tr");
      return Number(linha.cells[0].textContent) === chamadoSelecionadoId;
    });

    if (botaoDetalhesAtualizado) {
      await botaoDetalhesAtualizado.click();
    }

    mensagem.textContent = "Status atualizado com sucesso!";
    mensagem.style.color = "#15803d";

  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    mensagem.textContent = error.message;
    mensagem.style.color = "#dc2626";
  } finally {
    botao.disabled = false;
  }
});

});
