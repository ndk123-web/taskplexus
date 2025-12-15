# AI Features

Provider: Google Gemini

Endpoints:
- `POST /api/v1/ai-planner` → decomposes goals into tasks
- `POST /api/v1/ai-chat` → assistant chat (SSE streaming)

Notes:
- Token usage limits applied client-side
- Error handling for quota exceeded
- Caching of generated plans in MongoDB
