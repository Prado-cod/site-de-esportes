// script.js

// ** 1. CONFIGURAÇÃO DA API **
const API_KEY = "3fbce8b198404caf9c2d57d96b07b597"; 
const API_URL_BASE = "https://api.football-data.org/v4/competitions/PL"; 
const HEADERS = {
    'X-Auth-Token': API_KEY, 
    'Content-Type': 'application/json',
};

const TABELA_CONTAINER = document.getElementById('tabela-classificacao');
const JOGOS_CONTAINER = document.getElementById('lista-jogos');


// ------------------------------------------------------------------
// ## FUNÇÕES DE UTILIDADE
// ------------------------------------------------------------------

function formatarData(utcDate) {
    const data = new Date(utcDate);
    // Configurações para formatar para o horário de Brasília (BRT/BRST)
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    };
    
    return data.toLocaleString('pt-BR', options).replace(',', ' - ');
}

// ------------------------------------------------------------------
// ## 1. BUSCAR E RENDERIZAR TABELA (CLASSIFICAÇÃO)
// ------------------------------------------------------------------

async function buscarEExibirTabela() {
    const url = `${API_URL_BASE}/standings`;
    try {
        const resposta = await fetch(url, { headers: HEADERS });
        if (!resposta.ok) {
            throw new Error(`Erro API: ${resposta.status} - Verifique sua chave ou limites.`);
        }
        const dados = await resposta.json();
        renderizarTabela(dados); 

    } catch (erro) {
        console.error("Erro ao buscar tabela:", erro);
        TABELA_CONTAINER.innerHTML = `<p class="erro">Erro ao carregar classificação. ${erro.message}</p>`;
    }
}

function renderizarTabela(dados) {
    // A tabela de classificação está em standings[0].table
    const classificacao = dados.standings[0].table;
    
    let tabelaHTML = '<table>';
    
    // Cabeçalho da Tabela (P, J, V, E, D, GC, SG, %...)
    tabelaHTML += `
        <thead>
            <tr>
                <th>#</th>
                <th colspan="2">CLUBE</th>
                <th>P</th>
                <th>J</th>
                <th>V</th>
                <th>E</th>
                <th>D</th>
                <th>GP</th>
                <th>GC</th>
                <th>SG</th>
                </tr>
        </thead>
        <tbody>
    `;

    // Linhas da Tabela
    classificacao.forEach(item => {
        const time = item.team;
        // P: Pontos (points), J: Jogos (playedGames), V: Vitórias (won), etc.
        tabelaHTML += `
            <tr>
                <td style="font-weight: bold;">${item.position}</td>
                <td><img src="${time.crest}" alt="${time.name} Logo" class="logo-time"></td>
                <td style="text-align: left;">${time.shortName || time.name}</td>
                <td style="font-weight: bold;">${item.points}</td>
                <td>${item.playedGames}</td>
                <td>${item.won}</td>
                <td>${item.draw}</td>
                <td>${item.lost}</td>
                <td>${item.goalsFor}</td>
                <td>${item.goalsAgainst}</td>
                <td>${item.goalDifference}</td>
                </tr>
        `;
    });

    tabelaHTML += '</tbody></table>';
    TABELA_CONTAINER.innerHTML = tabelaHTML;
}


// ------------------------------------------------------------------
// ## 2. BUSCAR E RENDERIZAR JOGOS (PRÓXIMAS PARTIDAS)
// ------------------------------------------------------------------

async function buscarEExibirJogos() {
    // Busca os próximos 5 jogos (ou o quanto a API permitir)
    const url = `${API_URL_BASE}/matches?status=SCHEDULED&limit=5`; 
    try {
        const resposta = await fetch(url, { headers: HEADERS });
        if (!resposta.ok) {
            throw new Error(`Erro API: ${resposta.status} - Verifique sua chave ou limites.`);
        }
        const dados = await resposta.json();
        renderizarJogos(dados); 

    } catch (erro) {
        console.error("Erro ao buscar jogos:", erro);
        JOGOS_CONTAINER.innerHTML = `<p class="erro">Erro ao carregar jogos. ${erro.message}</p>`;
    }
}

function renderizarJogos(dados) {
    const partidas = dados.matches;

    if (partidas.length === 0) {
        JOGOS_CONTAINER.innerHTML = `<p>Nenhum jogo futuro encontrado.</p>`;
        return;
    }

    let jogosHTML = '';
    
    // Vamos agrupar os jogos por rodada, se houver o campo 'matchday'
    partidas.forEach(partida => {
        const dataHora = formatarData(partida.utcDate);
        const [data, hora] = dataHora.split(' - ');
        
        jogosHTML += `
            <div class="partida">
                <div class="partida-times">
                    <span class="time-nome">${partida.homeTeam.shortName || partida.homeTeam.name}</span>
                    <img src="${partida.homeTeam.crest}" alt="${partida.homeTeam.name} Logo" class="time-logo">
                    
                    <span class="vs">X</span>
                    
                    <img src="${partida.awayTeam.crest}" alt="${partida.awayTeam.name} Logo" class="time-logo">
                    <span class="time-nome" style="text-align: left;">${partida.awayTeam.shortName || partida.awayTeam.name}</span>
                </div>
                
                <div style="text-align: right;">
                    <div class="partida-info">${data}</div>
                    <div class="partida-info">${hora}</div>
                </div>
            </div>
        `;
    });

    JOGOS_CONTAINER.innerHTML = jogosHTML;
}

// ------------------------------------------------------------------
// ## INICIA O PROCESSO DE BUSCA
// ------------------------------------------------------------------

buscarEExibirTabela();
buscarEExibirJogos();