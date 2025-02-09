const express = require('express')
const router = express.Router()
const textwrap = require('word-wrap')

// Página "Make Your Analysis" no Streamlit recebia parâmetros de água
// e chamava GPT ou similar. Aqui retornamos JSON com um texto de análise simulado.

router.post('/make-analysis', (req, res) => {
  // Recebemos vários parâmetros no corpo da requisição
  const {
    ph,
    condutividade,
    turbidez,
    od,
    temperatura,
    local_coleta,
    tipo_corpo_agua,
    condicoes_climaticas,
    atividades_humanas,
    utilizacao,
    data_coleta,
    hora_coleta,
    localizacao
  } = req.body

  // Montar texto de forma simples
  let analysisText = `
    Análise de água coletada em um(a) ${local_coleta} em ${data_coleta} às ${hora_coleta}.
    Tipo de corpo d'água: ${tipo_corpo_agua}.
    Condições climáticas recentes: ${condicoes_climaticas}.
    Atividades humanas próximas: ${atividades_humanas}.
    Uso pretendido da água: ${utilizacao}.
    Localização: ${localizacao}.

    Parâmetros Físico-Químicos:
    - pH: ${ph}
    - Condutividade: ${condutividade} µS/cm
    - Turbidez: ${turbidez} NTU
    - Oxigênio Dissolvido (OD): ${od} mg/L
    - Temperatura: ${temperatura} °C

    ANÁLISE SIMPLIFICADA:
    Os parâmetros acima indicam valores gerais para avaliar a qualidade da água.
    Caso algum deles esteja fora do limite indicado pelas normas, recomenda-se maior investigação
    e/ou monitoramento contínuo para detectar potenciais riscos.
  `

  // Usamos word-wrap para formatar
  analysisText = textwrap(analysisText, { width: 80 })

  res.json({
    analysis_text: analysisText.trim(),
    message: "Simulação da análise gerada com base nos parâmetros informados."
  })
})

module.exports = router
