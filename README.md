# Monorepo: Estrutura e Navegacao

Este repositorio tem **2 projetos independentes**:

```text
Teste/
|-- frontend/      # Aplicacao Angular
`-- crud-veiculo/  # API Node.js (TypeScript + Express)
```

Cada pasta tem seu proprio `package.json`, dependencias e scripts.

## Como navegar para cada projeto

No terminal, partindo da raiz `Teste`:

```powershell
cd .\frontend
```

ou

```powershell
cd .\crud-veiculo
```

Para voltar para a raiz:

```powershell
cd ..
```

## Comandos principais por projeto

### Frontend (`frontend`)

```powershell
cd .\frontend
npm install
npm start      # sobe o Angular
npm test       # testes
```

### Backend (`crud-veiculo`)

```powershell
cd .\crud-veiculo
npm install
npm run dev    # sobe em modo dev (ts-node)
npm test       # testes Mocha
```

## Resumo rapido

1. Entre na pasta do projeto (`frontend` ou `crud-veiculo`).
2. Rode comandos `npm` dentro dessa pasta.
3. Volte com `cd ..` para trocar de projeto.
