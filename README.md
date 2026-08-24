## Sezzle Full-Stack Calculator :computer: 


A full-stack calculator application built with React/TypeScript
and Go. The application exposes a REST API for arithmetic
operations and provides a responsive web interface.

Please visit the live demo at the link below. The application is responsive and can be accessed from both desktop and mobile devices.
https://calculatorapp-production-132d.up.railway.app/

## Architecture

The application follows a simple layered architecture:

React UI > REST API > HTTP Handler > Calculator Service

The calculator logic is kept independent from HTTP concerns,
which allows the core functionality to be unit tested without
starting the server.

## Technologies

### Frontend
- React
- TypeScript
- Vite
- Vitest
- React Testing Library

### Backend
- Go
- net/http
- encoding/json
- Go testing package

## Getting Started

### Backend

Requirements: Go 1.24+ (the `go.mod` toolchain directive will download a matching Go release automatically if needed).

```bash
cd backend
go run ./cmd/server
```

The API will be available at `http://localhost:8080`. Run the backend test suite with:

```bash
go test ./...
```

### Frontend

Requirements: Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in a browser. Other useful scripts:

```bash
npm test              # run the Vitest suite (component, API mock, and validation tests)
npm run test:coverage # run the suite with a coverage report
npm run build          # type-check and produce a production build in frontend/dist
```

> The frontend and backend run as two separate processes/ports in development, so `VITE_API_URL` must point at the backend explicitly (there is no dev proxy).

## API

### POST /api/v1/calculate

Performs one arithmetic operation on two operands.

**Request body**

| Field       | Type                                          | Required |
|-------------|-----------------------------------------------|----------|
| `operation` | `"add"` \| `"subtract"` \| `"multiply"` \| `"divide"` \| `"exponent"` | yes |
| `a`         | number                                        | yes      |
| `b`         | number                                        | yes      |

**Success response** — `200 OK`

```json
{ "result": 15 }
```

**Examples**

```bash
# Addition
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","a":10,"b":5}'
# => {"result":15}

# Division
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"divide","a":10,"b":4}'
# => {"result":2.5}

# Exponent (a^b)
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"exponent","a":2,"b":10}'
# => {"result":1024}

# Division by zero -> 400 Bad Request
curl -i -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"divide","a":10,"b":0}'
# => 400 Bad Request
# => division by zero

# Missing operand -> 400 Bad Request
curl -i -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","a":10}'
# => 400 Bad Request
# => both operands are required
```

## Testing

**Backend** (`cd backend && go test ./...`)
- `internal/calculator`: pure arithmetic logic — all five operations (add,
  subtract, multiply, divide, exponent), negative
  numbers, zero operands, division by (positive and negative) zero, unknown
  operations, missing operands, and floating-point precision using a tolerance
  comparison instead of exact equality.
- `internal/handler`: HTTP status codes for each scenario above, CORS preflight
  and allowed-origin headers, and JSON edge cases (empty body, wrong field
  types, `null` values, duplicate keys, out-of-range numbers, trailing data
  after a valid JSON value).

**Frontend** (`cd frontend && npm test`)
- Component tests (`Calculator.test.tsx`): rendering, submitting the form,
  switching operations, displaying results/errors, and the loading state.
- API mock tests (`calculatorApi.test.ts`): the `calculate()` client against a
  mocked `fetch`, covering success, JSON error bodies, plain-text error
  bodies, empty bodies, and network failures.
- Validation tests (`validation.test.tsx`): client-side guards against
  empty/missing operands, and acceptance of negative, decimal, and zero
  values.

### Coverage

Generate coverage locally with `go test ./... -cover` (backend) and
`npm run test:coverage` (frontend, writes an HTML report to
`frontend/coverage/index.html`, committed to the repo for reference).

| Package/File                | Statements | Branches |
|------------------------------|-----------:|---------:|
| `backend/internal/calculator`| 100%       | —        |
| `backend/internal/handler`   | 79.2%      | —        |
| `backend/cmd/server`         | 0%¹        | —        |
| `frontend/src` (overall)     | 100%       | 87.0%    |

¹ `cmd/server` only wires up configuration and `ListenAndServe`; it is
exercised indirectly by running the server, not by unit tests.

## Design Decisions

- **Stateless backend**: no database is used, since calculator operations
  don't require persistence.
- **Single calculation endpoint**: one endpoint keeps the operation explicit
  in the request instead of duplicating HTTP handling logic per operator.
- **Calculator logic is a standalone Go package** (`internal/calculator`) with
  no dependency on `net/http`, so the arithmetic can be unit tested in
  isolation and reused outside the HTTP layer.
- **Operands are `*float64`** in `MathRequest` rather than `float64`, so the
  handler can distinguish an omitted field (`nil`) from an explicit `0`.
- **CORS is a small custom middleware** rather than a third-party library,
  defaulting to `http://localhost:5173` and configurable via `ALLOWED_ORIGIN`
  so the frontend and backend can be deployed as separate origins.
- **The frontend talks to the backend via an absolute `VITE_API_URL`**
  instead of relative paths, because the Vite dev server and the Go server
  run on different ports with no dev proxy configured.
- **The backend can optionally serve the built frontend as static files**
  (`STATIC_DIR`/`spaHandler`) for a single-container production deployment
  (see `Dockerfile`), while still running standalone against the API in
  local development.

## Assumptions

- The application is single-user and stateless — no authentication,
  persistence, or rate limiting is in scope for this assessment.
- Error messages returned by the API are safe to display to end users as-is
  (they don't leak internal details).
- Local development runs the frontend and backend as two separate processes
  on different ports; Docker packages them into a single container image for
  a more production-like same-origin setup.

## AI Usage

Used prompts:

- review the error handling for this …
- Identify edge cases
- Review this React component for a responsive design
- Suggest unit tests..
- review the project’s deploy
- Review this readme


...
