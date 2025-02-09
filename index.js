const express = require('express')
const app = express()
const homeRouter = require('./routes/home')
const monitoringRouter = require('./routes/monitoring')
const registrationRouter = require('./routes/registration')
const makeAnalysisRouter = require('./routes/make_analysis')
const iqaAnalysisRouter = require('./routes/iqa_analysis')
const adminRouter = require('./routes/admin')

// Para que possamos receber JSON no body das requisições POST/PUT
app.use(express.json())

// Registrar as rotas
app.use('/', homeRouter)
app.use('/', monitoringRouter)
app.use('/', registrationRouter)
app.use('/', makeAnalysisRouter)
app.use('/', iqaAnalysisRouter)
app.use('/', adminRouter)

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: "API Node.js/Express convertida. Rotas de Home, Monitoring, Registration, MakeYourAnalysis, IQAAnalysis e Admin disponíveis!"
  })
})

// Inicializar servidor
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Servidor Node rodando na porta ${PORT}...`)
})
