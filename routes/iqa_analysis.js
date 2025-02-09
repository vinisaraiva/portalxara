const express = require('express')
const router = express.Router()
const axios = require('axios')

// Mesma lógica simplificada do app.py (IQA Analysis)
// URLs de planilha
const SHEETDB_DADOS_API_URL = "https://sheetdb.io/api/v1/85u4y2iziptre"
const SHEETDB_RIOCHAMAGUNGA_API_URL = "https://sheetdb.io/api/v1/vlop1cs9uqewu"

// Função para carregar dados
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

// Pesos (simplificados) do IQA no app.py
const PESOS = {
  'OD': 0.17,
  'COLIFORMES': 0.15,
  'DBO': 0.10,
  'NITROGENIO_TOTAL': 0.10,
  'FOSFORO_TOTAL': 0.10,
  'TURBIDEZ (NTU)': 0.08,
  'TDS': 0.08,
  'pH': 0.12,
  'TEMPERATURA': 0.10
}

// Conversão de valor -> qi (simplificada)
function converterParaQi(param, valor) {
  const conversaoQi = {
    'OD': valor >= 6 ? 80 : 50,
    'COLIFORMES': valor >= 1000 ? 30 : 70,
    'DBO': valor <= 5 ? 60 : 30,
    'NITROGENIO_TOTAL': valor <= 10 ? 70 : 40,
    'FOSFORO_TOTAL': valor <= 0.1 ? 90 : 50,
    'TURBIDEZ (NTU)': valor <= 10 ? 85 : 40,
    'TDS': valor <= 500 ? 75 : 50,
    'pH': (valor >= 6.5 && valor <= 8.5) ? 90 : 60,
    'TEMPERATURA': valor <= 25 ? 70 : 50
  }
  return conversaoQi[param] || 50
}

// GET /iqa-analysis?river_name=CHAMAGUNGA&collection_point=PONTO_1
router.get('/iqa-analysis', async (req, res) => {
  const riverName = req.query.river_name || "CHAMAGUNGA"
  const collectionPoint = req.query.collection_point || null

  try {
    const { rioChamagunga } = await loadData()

    // Filtrar por rio
    let filtradoRio = rioChamagunga.filter(item => {
      return String(item.RIO || "").toUpperCase() === String(riverName).toUpperCase()
    })

    if (!filtradoRio.length) {
      return res.status(404).json({
        status: "error",
        message: `Não foram encontrados dados para o rio ${riverName}`
      })
    }

    if (collectionPoint) {
      filtradoRio = filtradoRio.filter(item => {
        return (String(item.PONTOS || "") === String(collectionPoint))
      })
      if (!filtradoRio.length) {
        return res.status(404).json({
          status: "error",
          message: `Nenhum dado encontrado para o ponto ${collectionPoint} no rio ${riverName}`
        })
      }
    }

    // Calcular IQA
    let iqaList = []

    filtradoRio.forEach(row => {
      // Montamos um dicionário com os parâmetros deste "row"
      let valoresParam = {}
      Object.keys(PESOS).forEach(param => {
        let val = row[param]
        if (val !== undefined && val !== null) {
          // Remover vírgulas e forçar float
          val = String(val).replace(",", ".")
          let numericVal = parseFloat(val)
          if (!isNaN(numericVal)) {
            valoresParam[param] = numericVal
          } else {
            valoresParam[param] = null
          }
        } else {
          valoresParam[param] = null
        }
      })

      if (Object.values(valoresParam).some(v => v === null || Number.isNaN(v))) {
        // Parâmetros incompletos, ignorar
        return
      }

      let valoresQi = {}
      let soma = 0
      let pesoTotal = 0

      Object.keys(PESOS).forEach(param => {
        const qi = converterParaQi(param, valoresParam[param])
        valoresQi[param] = qi
        soma += (qi * PESOS[param])
        pesoTotal += PESOS[param]
      })

      let iqaVal = soma / pesoTotal
      iqaList.push(iqaVal)
    })

    if (!iqaList.length) {
      return res.json({
        status: "incomplete",
        message: "Não foi possível calcular o IQA pois parâmetros estão incompletos nos dados filtrados."
      })
    }

    let mediaIqa = iqaList.reduce((acc, val) => acc + val, 0) / iqaList.length

    return res.json({
      river: riverName,
      collection_point: collectionPoint || "Todos",
      average_IQA: Number(mediaIqa.toFixed(2)),
      data_count: iqaList.length,
      status: "success",
      info: "Valores de IQA calculados a partir de parâmetros disponíveis."
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
