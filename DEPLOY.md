# Same Repo Deploy Guide

## Frontend on Cloudflare

- Deploy the repo root as the Cloudflare project.
- Publish directory: `public`
- Deploy command: `npx wrangler deploy`
- Custom domain: point the frontend to your main domain, for example `contacts.example.com` or `example.com`

## Backend on Render

- Create a `Web Service`
- Branch: `main`
- Build command: `bash build.sh`
- Start command: `cd src && gunicorn mysite.wsgi:application`

### Render environment variables

- `ALLOWED_HOSTS=your-render-host.onrender.com,api.yourdomain.com`
- `CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
- `SECRET_KEY=<strong-random-secret>`
- Optional: `DATABASE_URL=<postgres-url>`

## DNS

- Frontend: your Cloudflare Pages/Workers host on the main domain
- Backend: `api.yourdomain.com` CNAME to Render

## Notes

- If `DATABASE_URL` is not set, Django falls back to SQLite.
- For production persistence, attach a real database on Render.
