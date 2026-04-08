# Frontend - Gestao de Veiculos

Aplicacao Angular standalone (latest) com `signals`, componentes standalone e arquitetura em camadas para consumir a API Node.js do projeto `crud-veiculo`.

## Stack

- Angular 21 (standalone)
- Signals (`signal`, `computed`, `input`, `output`)
- Reactive Forms
- HttpClient + interceptor
- Proxy de desenvolvimento para backend Node (`/api`)

## Estrutura

```txt
src/app/
  core/
    models/
    ports/
    services/
    tokens/
    interceptors/
  features/vehicles/
    state/
    pages/
    components/
```

## Como executar

1. Inicie o backend Node em `../crud-veiculo`:

```bash
npm run build
npm start
```

2. Inicie o frontend Angular em `./frontend`:

```bash
npm start
```

A aplicacao abre em `http://localhost:4200`.

## Funcionalidades

- Listagem de veiculos
- Busca local por placa/chassi/renavam/modelo/marca
- Criacao de veiculo
- Edicao de veiculo
- Exclusao de veiculo
- Tratamento de erro de API com feedback na tela

## API alvo

As chamadas sao feitas para `/api/*` e redirecionadas pelo `proxy.conf.json` para `http://localhost:3000`.
## Recursos Seniores Utilizados

- Arquitetura por camadas (`core` e `features`) com separacao clara de responsabilidades.
- Aplicacao do principio DIP (SOLID) com `VehiclesRepositoryPort` (porta) + `HttpVehiclesRepositoryService` (adapter).
- Injecao de dependencias centralizada no `app.config.ts` com tokens (`API_BASE_URL`) para evitar acoplamento.
- Estado local orientado a `signals` (`signal`, `computed`) no `VehiclesStore`, com fluxo previsivel para `load/create/update/delete`.
- Uso intencional de operador RxJS (map) na funcao list() do repositório HTTP para normalizacao de dados e ordenacao deterministica por placa.
- Estrategia de performance com `ChangeDetectionStrategy.OnPush` nos componentes.
- Execucao em modo zoneless via `provideZonelessChangeDetection()` para reduzir overhead de deteccao de mudancas.
- Componentes `standalone` e roteamento standalone, sem NgModules.
- Tratamento transversal de erros HTTP com interceptor (`httpErrorInterceptor`), mantendo os componentes enxutos.
- Tipagem forte de dominio e contratos (`Vehicle`, `VehiclePayload`, portas) para maior seguranca de manutencao.
- Templates e estilos separados (`templateUrl` + arquivos `.scss`) para melhor legibilidade e organizacao.
- Estrutura de pastas por componente (`components/vehicle-form`, `components/vehicles-table`) para escalabilidade.
- Testes unitarios para componentes, pagina e store, cobrindo cenarios de sucesso e erro.


