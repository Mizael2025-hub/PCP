import http from "k6/http"
import { check, sleep } from "k6"

// Observação:
// - Para rodar contra Supabase com Auth/RLS, o ideal é usar um token JWT válido.
// - Este script é um esqueleto para você plugar o endpoint e o header Authorization.

export const options = {
  vus: 5,
  duration: "30s"
}

export default function () {
  const res = http.get(__ENV.TARGET_URL ?? "http://localhost:3000/login")

  check(res, {
    "status 200": (r) => r.status === 200
  })

  sleep(1)
}

