# Agent Guidance

## Local development safety

Do not run the `Abyss.Web` backend locally with production configuration or secrets. Starting the application also starts the production-facing Discord bot and background services, including cleanup, reminders, scheduled posts, TeamSpeak integration, and other external clients.

For frontend-only work, run the Angular application independently:

```powershell
cd Abyss.Web/ClientApp
yarn start
```

Open <http://localhost:34564>. Static routes work without the backend; API and authentication requests failing locally is expected. Verify full-stack behavior against the deployed application instead of starting another production-connected backend instance.
