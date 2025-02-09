const express = require('express')
const router = express.Router()

// Página "Admin" do app.py: apenas um placeholder simulando painel administrativo

router.get('/admin', (req, res) => {
  res.json({
    message: "Bem-vindo à área de administração. Aqui você pode cadastrar/gerenciar informações do sistema."
  })
})

module.exports = router
