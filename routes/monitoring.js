const express = require('express')
const router = express.Router()
const axios = require('axios')

// Parâmetros típicos vindos do app.py
const parameterRanges = {
  'pH': [6, 9],
  'CONDUTIVIDADE': [115, 300],
  'TURBIDEZ (NTU)': [0, 100],
  'TEMPERATURA': [0, 40],
  'SALINIDADE': [0, 35]
}

// As URLs das SheetDB, iguais ao app.py
const SHEETDB_DADOS_API_URL = "https://sheetdb.io/api/v1/85u4y2iziptre"
const SHEETDB_RIOCHAMAGUNGA_API_URL = "https://sheetdb.io/api/v1/vlop1cs9uqewu"

// Simula a função load_data() do app.py
async function loadData() {
  try {
    const [dadosResp, rioResp] = await Promise.all([
      axios.get(SHEETDB_DADOS_API_URL),
      axios.get(SHEETDB_RIOCHAMAGUNGA_API_URL)
    ])

    if (dadosResp.status !== 200) {
      throw new Error(`Erro ao carregar dados de usuários. Código: ${dadosResp.status}`)
    }
    if (rioResp.status !== 200) {
      throw new Error(`Erro ao carregar dados de rios. Código: ${rioResp.status}`)
    }

    return {
      dadosUsuarios: dadosResp.data,
      rioChamagunga: rioResp.data
    }
  } catch (err) {
    throw new Error(err.message)
  }
}

// Equivalente ao endpoint "/monitoring" do app.py
router.get('/monitoring', async (req, res) => {
  try {
    const { dadosUsuarios, rioChamagunga } = await loadData()

    // Monta a resposta com a descrição dos parâmetros e uma amostra dos dados
    const allParameters = []
    Object.keys(parameterRanges).forEach(param => {
      allParameters.push({
        parameter: param,
        min_limit: parameterRanges[param][0],
        max_limit: parameterRanges[param][1]
      })
    })

    // Pega um pedaço (5 primeiros) das entradas de “rioChamagunga” para exibir
    const sampleRioData = rioChamagunga.slice(0, 5)

    res.json({
      parameters_description: allParameters,
      sample_rio_data: sampleRioData,
      info: "Simulando a lógica da aba Monitoring: exibindo parâmetros configurados, limites e dados de exemplo."
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Nova rota POST para gerar análise via OpenAI (ou similar)
router.post('/monitoring/generate', async (req, res) => {
  try {
    // Exemplo: front-end envia { prompt, filteredData }
    const { prompt, filteredData } = req.body

    // Simulação de chamada ao OpenAI, substitua por axios para API real
    // A ideia é mesclar 'prompt' e 'filteredData' para compor a mensagem
    // e retornar a resposta do modelo.
    // Abaixo apenas simulamos a resposta.
    const simulatedResponse = `
      Análise da seção Monitoring com base nos seguintes dados filtrados:
      ${JSON.stringify(filteredData, null, 2)}

      Prompt adicional fornecido: ${prompt}

      [Simulação de chamado ao OpenAI e resposta gerada]
    `
    return res.json({
      analysis_text: simulatedResponse,
      message: "Análise de Monitoring gerada com base nos dados e prompt fornecidos."
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

module.exports = router
