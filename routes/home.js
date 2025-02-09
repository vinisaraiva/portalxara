const express = require('express')
const router = express.Router()

// Simples estrutura de dados para armazenar notícias em memória.
// Em produção, você poderia mover isso para uma base de dados ou planilha externa.
let newsStore = [
  {
    id: 1,
    image: "/banner_rio.jpg",
    title: "Título da Notícia Inicial",
    excerpt: "Esse é um trecho inicial da notícia, visível na Home...",
    fullText: "Conteúdo completo da notícia. Ao clicar em 'Ler mais', o usuário é direcionado para uma página que exibe este conteúdo."
  }
]

// Página "Home" no Streamlit era basicamente um banner e um texto estático.
// Agora, adicionamos funcionalidades para cadastro e exibição de notícias.

router.get('/home', (req, res) => {
  // Retornamos lista de notícias (com excerpt), e algum banner inicial
  res.json({
    banner_image: "banner_rio.jpg",
    title: "Esse é o Rio Mutari",
    description: "Esse é o Rio Mutari, que fica na cidade de Santa Cruz Cabrália, ao lado de Porto Seguro. Em breve também será monitorado e estará na Tikatu.",
    cta: "Fique informado! Explore nosso conteúdo e expanda seu conhecimento sobre qualidade da água e sustentabilidade.",
    news: newsStore.map(n => ({
      id: n.id,
      image: n.image,
      title: n.title,
      excerpt: n.excerpt
    }))
  })
})

// "Ler mais": Retorna a notícia completa pelo ID
router.get('/home/news/:id', (req, res) => {
  const newsId = parseInt(req.params.id, 10)
  const selectedNews = newsStore.find(item => item.id === newsId)
  if (!selectedNews) {
    return res.status(404).json({ error: "Notícia não encontrada" })
  }
  res.json(selectedNews)
})

// Cadastro de nova notícia (exibida na Home)
// Espera-se receber um JSON com { title, image, excerpt, fullText }
router.post('/home/news', (req, res) => {
  const { title, image, excerpt, fullText } = req.body
  if (!title || !image || !excerpt || !fullText) {
    return res.status(400).json({
      error: "Campos obrigatórios: title, image, excerpt, fullText"
    })
  }
  const newId = newsStore.length ? Math.max(...newsStore.map(n => n.id)) + 1 : 1
  const newItem = {
    id: newId,
    image,
    title,
    excerpt,
    fullText
  }
  newsStore.push(newItem)
  res.json({
    message: "Notícia cadastrada com sucesso!",
    news: newItem
  })
})

module.exports = router
