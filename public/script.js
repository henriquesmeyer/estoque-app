document.addEventListener('DOMContentLoaded', () => {
    const produtoForm = document.getElementById('produtoForm');
    const btnCancelar = document.getElementById('btnCancelar');
    const tabelaProdutos = document.querySelector('#tabelaProdutos tbody');
    
    let editando = false;
    let produtoEditando = null;
    
    // Carregar produtos ao iniciar
    carregarProdutos();

    produtoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const produto = {
            nome: document.getElementById('nome').value.trim(),
            quantidade: parseInt(document.getElementById('quantidade').value),
            preco: parseFloat(document.getElementById('preco').value)
        };
        
        try {
            if (editando) {
                produto.id = produtoEditando;
                await atualizarProduto(produto);
            } else {
                await adicionarProduto(produto);
            }
            
            limparFormulario();
            carregarProdutos();
        } catch (error) {
            console.error('Erro:', error);
            alert(`Erro ao salvar: ${error.message}`);
        }
    });
    
    btnCancelar.addEventListener('click', () => {
        limparFormulario();
    });
    
    async function carregarProdutos() {
        try {
            const response = await fetch('/api/produtos');
            
            if (!response.ok) throw new Error('Erro ao buscar produtos');
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta não é JSON');
            }
            
            const produtos = await response.json();
            
            tabelaProdutos.innerHTML = '';
            
            produtos.forEach(produto => {
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td>${produto.id}</td>
                    <td>${produto.nome}</td>
                    <td>${produto.quantidade}</td>
                    <td>R$ ${produto.preco.toFixed(2)}</td>
                    <td class="actions">
                        <button class="btn btn-primary editar" data-id="${produto.id}">Editar</button>
                        <button class="btn btn-danger excluir" data-id="${produto.id}">Excluir</button>
                    </td>
                `;
                
                tabelaProdutos.appendChild(tr);
            });
            
            // Eventos
            document.querySelectorAll('.editar').forEach(btn => {
                btn.addEventListener('click', editarProduto);
            });
            
            document.querySelectorAll('.excluir').forEach(btn => {
                btn.addEventListener('click', excluirProduto);
            });
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            alert('Erro ao carregar produtos. Verifique o console.');
        }
    }
    
    async function adicionarProduto(produto) {
        const response = await fetch('/api/produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar produto');
        }
    }
    
    async function atualizarProduto(produto) {
        const response = await fetch(`/api/produtos/${produto.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar produto');
        }
    }
    
    async function excluirProduto(e) {
        const id = e.target.getAttribute('data-id');
        
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                const response = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Erro ao excluir produto');
                }
                
                carregarProdutos();
            } catch (error) {
                console.error('Erro ao excluir produto:', error);
                alert(`Erro ao excluir: ${error.message}`);
            }
        }
    }
    
    async function editarProduto(e) {
        const id = parseInt(e.target.getAttribute('data-id'));
        
        try {
            const response = await fetch(`/api/produtos/${id}`);
            
            if (!response.ok) throw new Error('Produto não encontrado');
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta não é JSON');
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Erro ao carregar produto');
            }
            
            const produto = result.data;
            
            document.getElementById('produtoId').value = produto.id || '';
            document.getElementById('nome').value = produto.nome;
            document.getElementById('quantidade').value = produto.quantidade;
            document.getElementById('preco').value = produto.preco;
            
            editando = true;
            produtoEditando = produto.id;
            
            document.querySelector('#produtoForm button[type="submit"]').textContent = 'Atualizar';
            
            document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Erro ao editar:', error);
            alert(`Erro: ${error.message}`);
        }
    }
    
    function limparFormulario() {
        produtoForm.reset();
        document.getElementById('produtoId').value = '';
        editando = false;
        produtoEditando = null;
        document.querySelector('#produtoForm button[type="submit"]').textContent = 'Salvar';
    }
});
