# Architecture

## 1. Advisory Platform
Next.js application with Supabase authentication, user profiles, admin controls, conversation history and advisor selection.

## 2. Marketing AI Backend
n8n workflow:

```text
Webhook
  -> Marketing Advisor Agent
       -> OpenAI Chat Model
       -> Conversation Memory
       -> PostgreSQL Analytics Tool
  -> Webhook Response
```

The public workflow preserves the orchestration pattern but removes production credentials and proprietary prompt logic.

## 3. Analytics Dashboard
TanStack/React dashboard connected to Supabase for operational and business intelligence. Dashboard context can be passed into the advisory application so AI analysis uses the user's active filters.

## 4. Shared Data Layer
Both applications use the same logical Supabase data layer. Production data is not included in this repository.
