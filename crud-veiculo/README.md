# CRUD de Veiculos (Node.js + TypeScript + Clean Architecture)

Projeto backend para cadastro de veiculos com persistencia em arquivo JSON, organizacao em camadas e testes automatizados com Mocha.

## Requisitos implementados

- Backend em Node.js com TypeScript
- CRUD de veiculos com atributos:
  - `id`
  - `placa`
  - `chassi`
  - `renavam`
  - `modelo`
  - `marca`
  - `ano`
- Persistencia em `data/vehicles.json`
- Recursos REST para acesso aos dados
- Testes automatizados com Mocha cobrindo dominio, casos de uso, repositorio e HTTP
- Cobertura de codigo com `c8`

## Estrutura de pastas

```txt
src/
  application/
    ports/
    use-cases/
  domain/
    entities/
    errors/
  infrastructure/
    repositories/
  interfaces/
    http/
      controllers/
      middlewares/
      routes/
  app.ts
  server.ts
data/
  vehicles.json
test/
  app/
  domain/
  infrastructure/
  interfaces/
    http/
  support/
  use-cases/
```

## Separacao de camadas (clean architecture)

- `domain`: regras de negocio puras (entidade `Vehicle` e erros de dominio).
- `application`: casos de uso (`create`, `read`, `update`, `delete`) sem dependencia de framework.
- `infrastructure`: implementacao concreta de persistencia em JSON.
- `interfaces/http`: controller, rotas e middleware HTTP.

## Endpoints REST

Base URL: `http://localhost:3000/api`

- `POST /vehicles` - cria um veiculo
- `GET /vehicles` - lista veiculos
- `GET /vehicles/:id` - busca por id
- `PUT /vehicles/:id` - atualiza veiculo
- `DELETE /vehicles/:id` - remove veiculo
- `GET /health` - health check

Respostas esperadas:
- `201` para criacao
- `200` para leitura/atualizacao
- `204` para remocao
- `400` para erro de validacao
- `404` para nao encontrado
- `409` para conflito de unicidade (`placa`, `chassi`, `renavam`)

### Exemplo de payload (`POST`/`PUT`)

```json
{
  "placa": "ABC1D23",
  "chassi": "9BWZZZ377VT004251",
  "renavam": "12345678901",
  "modelo": "Civic",
  "marca": "Honda",
  "ano": 2023
}
```

## Dados iniciais (mocks)

O arquivo `data/vehicles.json` ja possui 10 veiculos mockados para facilitar testes manuais com `GET /api/vehicles`.

## Como executar

```bash
npm install
npm run build
npm start
```

Para desenvolvimento:

```bash
npm run dev
```

## Como testar

```bash
npm test
```

Os testes sao executados com **Mocha** e incluem cenarios de sucesso e erro.

## Cobertura de testes

```bash
npm run test:coverage
```

Estado atual da cobertura (src, excluindo bootstrap de `server.ts`):
- `100%` statements
- `100%` branches
- `100%` functions
- `100%` lines
