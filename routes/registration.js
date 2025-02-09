const express = require('express')
const router = express.Router()
const axios = require('axios')
const { DateTime } = require('luxon')

// A URL da planilha, igual à do app.py
const SHEETDB_DADOS_API_URL = "https://sheetdb.io/api/v1/85u4y2iziptre"

// Função para carregar dados (similar ao load_data do app.py)
async function loadData() {
  try {
    const response = await axios.get(SHEETDB_DADOS_API_URL)
    if (response.status !== 200) {
      throw new Error(`Erro ao carregar dados de usuários. Código: ${response.status}`)
    }
    return response.data
  } catch (err) {
    throw new Error(err.message)
  }
}

// Equivalente a "cadastro_e_simulacao" (GET) e "register_user" (POST)

router.get('/registration', async (req, res) => {
  try {
    const dadosDf = await loadData()
    // Pegar um subset (ex: 5 primeiros)
    const sample_users = dadosDf.slice(0, 5)
    res.json({
      info: "Equivalente à página Registration. Aqui estariam as funcionalidades de cadastro e simulação.",
      sample_users
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/registration', async (req, res) => {
  try {
    const { name, email, selected_river } = req.body

    // Precisamos carregar os dados existentes para obter o ID
    const dadosDf = await loadData()
    const newId = dadosDf.length + 1
    const currentDate = DateTime.now().setZone('America/Bahia').toFormat('dd/LL/yyyy')

    const newData = [{
      "ID": newId,
      "NOME": name,
      "EMAIL": email,
      "RIOS SELECIONADOS": selected_river,
      "DATA DE CADASTRO": currentDate
    }]

    // Enviamos para a planilha
    const response = await axios.post(SHEETDB_DADOS_API_URL, { data: newData })
    if (response.status === 201) {
      res.json({ status: "success", message: "Usuário cadastrado com sucesso!" })
    } else {
      throw new Error(`Erro ao cadastrar usuário: ${response.status}`)
    }

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
