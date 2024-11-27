const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Configuração da conexão com o banco de dados
const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Usuário padrão do MySQL no XAMPP
  password: '', // Senha padrão do MySQL no XAMPP
  database: 'arritmias' // Nome do banco de dados
});

// Conecta ao banco de dados
dbConnection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    process.exit(1); // Encerra o processo em caso de erro crítico
  }
  console.log('Conectado ao banco de dados MySQL.');
});

// Variável para rastrear a linha atual
let currentLineIndex = 0;

// Configura o diretório de arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para obter dados de ECG da tabela
app.get('/ecg', (req, res) => {
  // Consulta ao banco de dados para obter todos os valores da coluna "value"
  const query = 'SELECT value FROM ECG';

  dbConnection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err.message);
      res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
      return;
    }

    // Extrai os valores da coluna 'value'
    const ecgData = results.map(row => row.value);

    if (currentLineIndex < ecgData.length) {
      const value = ecgData[currentLineIndex]; // Obtém o valor da linha atual
      currentLineIndex++; // Incrementa o índice para a próxima linha
      res.json([value]); // Envia o valor como um array de um elemento
    } else {
      res.json([]); // Retorna um array vazio se não houver mais dados
    }
  });
});

// Rota para a página inicial HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
