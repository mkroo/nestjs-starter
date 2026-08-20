# NestJS Starter

[English](README.md) | [한국어](README.ko.md)

API 중심 사이드 프로젝트를 위한 명확한 기술 선택과 운영 환경을 고려한 NestJS 스타터입니다.

성급한 분산 아키텍처나 범용 리포지터리 추상화 대신, 작은 모듈러 모놀리스와 명시적인 모듈
인터페이스, PostgreSQL, 투명한 SQL을 지향합니다.

## 기본 제공 기능

버전은 [`package.json`](package.json)에 정의되어 있습니다. 아래 표는 각 의존성을 사용하는
이유와 스타터가 기본으로 구성하는 범위를 설명합니다.

| 구분                    | 라이브러리                                                                                                                                                     | 스타터가 제공하는 기능                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 런타임                  | [Node.js](https://github.com/nodejs/node), [TypeScript](https://github.com/microsoft/TypeScript), [pnpm](https://github.com/pnpm/pnpm)                         | Node.js 24, TypeScript 6, native ESM 및 고정된 패키지 매니저 버전            |
| 애플리케이션 프레임워크 | [NestJS](https://github.com/nestjs/nest)                                                                                                                       | 모듈러 모놀리스로 구성된 단일 API 컴포지션 루트                              |
| 설정                    | [NestJS Config](https://github.com/nestjs/config), [Zod](https://github.com/colinhacks/zod)                                                                    | 오류가 있으면 시작 즉시 실패하는 타입 기반 환경변수 파싱                     |
| HTTP 검증               | [class-validator](https://github.com/typestack/class-validator), [class-transformer](https://github.com/typestack/class-transformer)                           | 알 수 없는 필드를 거부하고 요청 DTO를 변환하는 전역 `ValidationPipe`         |
| 데이터베이스 접근       | [PostgreSQL](https://github.com/postgres/postgres), [node-postgres](https://github.com/brianc/node-postgres)                                                   | PostgreSQL 18 연결 풀과 생명주기 관리                                        |
| SQL 및 마이그레이션     | [Drizzle ORM and Drizzle Kit](https://github.com/drizzle-team/drizzle-orm)                                                                                     | 타입 안전한 SQL, 모듈별 스키마 소유권 및 저장소에 커밋되는 마이그레이션      |
| 구조화 로깅             | [Pino](https://github.com/pinojs/pino), [pino-http](https://github.com/pinojs/pino-http), [nestjs-pino](https://github.com/iamolegga/nestjs-pino)              | 운영 환경의 JSON 요청 로그와 로컬 개발 환경의 읽기 쉬운 로그 출력            |
| 분산 추적               | [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js), [OpenTelemetry JS Contrib](https://github.com/open-telemetry/opentelemetry-js-contrib) | HTTP, NestJS, PostgreSQL 및 Pino 트레이스 연결과 벤더 중립적인 OTLP 내보내기 |
| API 문서                | [NestJS Swagger](https://github.com/nestjs/swagger)                                                                                                            | Swagger UI와 변경 누락을 검사하는 커밋된 OpenAPI 문서                        |
| 단위 및 통합 테스트     | [Vitest](https://github.com/vitest-dev/vitest)                                                                                                                 | 단위 테스트, 설정 테스트 및 Nest 의존성 주입 스모크 테스트                   |
| HTTP E2E 테스트         | [Supertest](https://github.com/ladjs/supertest)                                                                                                                | 실제 NestJS HTTP 애플리케이션과 PostgreSQL을 사용하는 E2E 테스트             |
| 정적 분석               | [ESLint](https://github.com/eslint/eslint), [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)                                        | 경고를 허용하지 않는 타입 기반 린트 검사                                     |
| 포맷팅                  | [Prettier](https://github.com/prettier/prettier)                                                                                                               | CI에서 확인하는 일관된 코드 포맷                                             |
| 아키텍처 검사           | [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)                                                                                           | 순환 의존성, 내부 경로 직접 import 및 모듈 경계 위반 검사                    |
| 미사용 코드 검사        | [Knip](https://github.com/webpro-nl/knip)                                                                                                                      | 사용하지 않는 운영 코드 파일, export 및 의존성 탐지                          |
| 중복 로직 검토          | [TypeScript Compiler API](https://github.com/microsoft/TypeScript), [Codex skills](https://learn.chatgpt.com/docs/build-skills)                                | AST 비교와 명시적인 재사용 또는 의도적 분리 결정                             |

운영 이미지는 [Docker](https://github.com/docker)로 패키징하며, 저장소 검증은
[GitHub Actions](https://github.com/features/actions)에서 실행합니다.

특정 PostgreSQL 제공자 전용 SDK는 의도적으로 포함하지 않았습니다. `DATABASE_URL`을 사용해
PostgreSQL 호환 데이터베이스를 설정할 수 있습니다.

## 빠른 시작

Node.js 24, Docker, Corepack이 필요합니다.

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm dev
```

API는 `http://localhost:3000/api`에서 시작합니다. Swagger UI는
`http://localhost:3000/docs`에서 확인할 수 있습니다.

```bash
curl http://localhost:3000/api/health/live

curl -X POST http://localhost:3000/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Ship the starter"}'

curl http://localhost:3000/api/tasks
```

## 프로젝트 구조

```text
.agents/skills/         # 저장소에서 제공하는 에이전트 워크플로
src/
├── composition/          # 애플리케이션 컴포지션 루트
├── config/               # 시작 시 검증하는 환경변수 파싱
├── modules/
│   ├── health/
│   └── tasks/            # 예제 vertical slice
└── platform/
    ├── database/         # pg 연결 풀과 Drizzle 생명주기
    ├── logging/          # Pino 구조화 로깅
    └── telemetry/        # OpenTelemetry tracing 및 OTLP 내보내기
drizzle/                  # 생성된 SQL 마이그레이션
openapi/                  # 생성된 OpenAPI 문서
test/e2e/                 # PostgreSQL 기반 HTTP 테스트
```

기능을 추가하기 전에 [docs/architecture.md](docs/architecture.md)를 읽어주세요.

## 모듈 규칙

- 기능 모듈은 `src/modules/<feature>/index.ts`를 통해 비즈니스 인터페이스를 공개합니다.
- 애플리케이션 컴포지션 루트는 `src/modules/<feature>/composition/index.ts`를 통해 Nest 모듈을
  가져옵니다.
- 모듈 내부 경로를 직접 import하거나 순환 의존성이 있으면 `pnpm architecture`가 실패합니다.
- 테이블 스키마와 쿼리 어댑터는 해당 데이터를 소유하는 기능 모듈 안에 둡니다.
- 기능 모듈의 공개 인터페이스에 Drizzle 타입을 노출하지 않습니다.
- 리포지터리 인터페이스는 테스트나 구현 교체를 위한 실질적인 경계가 있을 때만 추가합니다.

## 명령어

| 명령어                    | 설명                                         |
| ------------------------- | -------------------------------------------- |
| `pnpm dev`                | watch mode로 API 실행                        |
| `pnpm build`              | 운영용 JavaScript 빌드                       |
| `pnpm db:generate`        | 기능 모듈의 스키마에서 SQL 마이그레이션 생성 |
| `pnpm db:migrate`         | 커밋된 마이그레이션 적용                     |
| `pnpm db:studio`          | Drizzle Studio 실행                          |
| `pnpm test`               | 단위 테스트와 DI 스모크 테스트 실행          |
| `pnpm test:e2e`           | PostgreSQL 기반 HTTP 테스트 실행             |
| `pnpm analyze:duplicates` | 구조적으로 중복된 운영 로직 탐색             |
| `pnpm architecture`       | 모듈 인터페이스와 순환 의존성 검사           |
| `pnpm deadcode`           | 사용하지 않는 운영 코드와 의존성 검사        |
| `pnpm openapi:generate`   | `openapi/openapi.json` 다시 생성             |
| `pnpm verify`             | 로컬에서 전체 CI 파이프라인 실행             |

`pnpm verify`를 실행하려면 PostgreSQL이 실행 중이어야 하고 `DATABASE_URL`이 설정되어야
합니다. 가장 빠른 방법은 `cp .env.example .env && pnpm db:up`입니다.

## 중복 로직 검토

아키텍처, 프레임워크의 관례와 클린 코드 방법론은 응집도를 높이고 결합도를 낮춰, 더 적은 우발적
복잡성으로 더 많은 동작을 표현하려는 수단입니다. 이때 최소화해야 하는 대상은 코드 줄 수가 아니라
중복된 지식과 독립적인 변경 지점입니다. 비슷하게 생긴 코드가 서로 다른 도메인 규칙, 소유자 또는
변경 이유를 가진다면 잘못된 추상화 하나보다 명확하게 분리된 구현 두 개가 더 낫습니다.

이 저장소는 이러한 철학을 다음과 같은 명시적인 검토 과정으로 제공합니다.

- [`AGENTS.md`](AGENTS.md)는 운영 TypeScript 동작을 변경한 후 중복 로직을 검토하게 하고,
  유사도 점수만으로 자동 리팩터링하지 못하게 합니다.
- [`review-duplicate-logic`](.agents/skills/review-duplicate-logic/SKILL.md) skill은 후보의 문맥과
  근거를 검토하고, 중복된 지식을 재사용할지, 의도적으로 분리할지, 결정을 보류할지 사용자에게
  묻는 워크플로를 정의합니다.
- [`decision-rubric.md`](.agents/skills/review-duplicate-logic/references/decision-rubric.md)는
  도메인 소유권, 불변식, 트랜잭션 경계, 의존성과 변경 주기를 기준으로 중복된 지식과 우연히 비슷한
  구조를 구분합니다.
- [`duplicate-analyzer.ts`](.agents/skills/review-duplicate-logic/scripts/duplicate-analyzer.ts)는
  TypeScript AST를 결정적으로 정규화하고 구조를 비교합니다. 아키텍처 결론이 아닌 검토 후보만
  생성합니다.
- [`.duplicate-logic-decisions.json`](.duplicate-logic-decisions.json)은 의도적 분리와 보류
  결정을 기록합니다. 후보의 fingerprint가 바뀌지 않은 동안만 해당 결정을 유효하게 봅니다.

에이전트를 사용하지 않을 때도 분석기를 직접 실행할 수 있습니다.

```bash
pnpm analyze:duplicates -- --changed
```

분석기는 코드를 자동으로 리팩터링하지 않으며 후보가 있다는 이유로 실패하지도 않습니다. CI는
결정적인 분석 보고서만 생성하고, 상호작용이 필요한 결정은 사용자에게 남깁니다.

## 관측성

OpenTelemetry tracing은 항상 활성화됩니다. Pino 요청 로그에는 `trace_id`와 `span_id`가
포함되며, 지원되는 호출 사이에서 W3C trace context가 전파됩니다. 기본적으로 트레이스는 외부로
전송하지 않습니다.

```env
OTEL_SERVICE_NAME=nestjs-starter
OTEL_TRACES_EXPORTER=none
```

OTLP/HTTP를 지원하는 관측성 도구로 트레이스를 전송하려면 표준 exporter와 endpoint를
설정합니다. 인증 헤더와 샘플링에는 표준 OpenTelemetry 환경변수를 사용합니다.

```env
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-endpoint.example.com
OTEL_EXPORTER_OTLP_HEADERS=authorization=your-token
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

특정 관측성 도구의 SDK는 포함하지 않습니다. 애플리케이션의 tracing 코드를 변경하지 않고
Grafana, Datadog, Sentry, New Relic, 셀프호스트 SigNoz 또는 OpenTelemetry Collector를 선택할
수 있습니다. 애플리케이션은 `x-request-id`를 생성하거나 반환하지 않으며, `trace_id`를 기본
상관관계 식별자로 사용합니다.

## 의도적으로 포함하지 않은 기능

인증, queue, scheduler, object storage, cache 및 여러 애플리케이션 진입점은 기본
스타터에 포함하지 않습니다. 모든 프로젝트에서 복잡성 비용을 부담하는 대신 실제로 필요한
시점에 추가합니다.

## 라이선스

[MIT](LICENSE)
