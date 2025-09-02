# Knowledge Sharing Platform — React + Vite + Bootstrap

Frontend wired to API documented in API_DOCUMENTATION.md (base: http://localhost:3000/api).

## Run locally

```bash
npm install
npm run dev
```

Vite dev server proxies `/api` to `http://localhost:3000` by default.

## Auth with Cookies

- Login/Register endpoints are called with `credentials: 'include'` so the JWT cookie (Set-Cookie) is stored by the browser.
- Subsequent **private** API calls automatically include cookies.
- For compatibility with backends that still expect `Authorization: Bearer <token>`, if the login/register response also returns `token` in JSON, it's kept in `localStorage` and added as a header on protected calls.

## Notes

The frontend expects endpoints exactly as in API_DOCUMENTATION.md. If responses use different shape, adjust parsing in page components.
