const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configurações importantes
app.use(cors());
app.use(express.json());

// Banco de dados em memória
let estoque = [
    { id: 1, nome: "Produto A", quantidade: 10, preco: 15.99 },
    { id: 2, nome: "Produto B", quantidade: 5, preco: 20.50 }
];

// Middleware para garantir respostas JSON na API
app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Função para validar produto
function validarProduto(produto) {
    if (!produto.nome || typeof produto.nome !== 'string') {
        return { valido: false, erro: 'Nome inválido' };
    }
    if (!Number.isInteger(Number(produto.quantidade)) || Number(produto.quantidade) < 0) {
        return { valido: false, erro: 'Quantidade inválida' };
    }
    if (typeof produto.preco !== 'number' || produto.preco < 0) {
        return { valido: false, erro: 'Preço inválido' };
    }
    return { valido: true };
}

// Rota para listar todos produtos
app.get('/api/produtos', (req, res) => {
    res.json(estoque);
});

// Rota para pegar produto por id
app.get('/api/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const produto = estoque.find(p => p.id === id);

    if (!produto) {
        return res.status(404).json({ 
            success: false,
            error: 'Produto não encontrado' 
        });
    }

    res.json({
        success: true,
        data: produto
    });
});

// Criar produto
app.post('/api/produtos', (req, res) => {
    const validacao = validarProduto(req.body);
    if (!validacao.valido) {
        return res.status(400).json({ error: validacao.erro });
    }

    const novoId = estoque.length > 0 ? Math.max(...estoque.map(p => p.id)) + 1 : 1;
    const novoProduto = { id: novoId, ...req.body };

    estoque.push(novoProduto);
    res.status(201).json(novoProduto);
});

// Atualizar produto
app.put('/api/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = estoque.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const validacao = validarProduto(req.body);
    if (!validacao.valido) {
        return res.status(400).json({ error: validacao.erro });
    }

    estoque[index] = { 
        ...estoque[index],
        ...req.body,
        id: estoque[index].id // Mantém o ID original
    };

    res.json(estoque[index]);
});

// Deletar produto
app.delete('/api/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = estoque.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Produto não encontrado' });
    }

    estoque = estoque.filter(p => p.id !== id);
    res.status(204).send();
});

// Servir arquivos estáticos (DEVE vir depois das rotas da API)
app.use(express.static('public'));

// Rota fallback para SPA (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno no servidor' });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Endpoints disponíveis:');
    console.log(`- GET /api/produtos`);
    console.log(`- GET /api/produtos/:id`);
    console.log(`- POST /api/produtos`);
    console.log(`- PUT /api/produtos/:id`);
    console.log(`- DELETE /api/produtos/:id`);
});
