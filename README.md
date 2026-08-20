# Enterprise AI Advisory & Analytics Platform

A portfolio-safe monorepo demonstrating an enterprise AI decision-support platform that combines:

- a multi-department AI advisory interface,
- a production-oriented Marketing Advisor implemented with n8n,
- a Supabase-backed business analytics dashboard,
- authentication, user roles and admin controls,
- dashboard-to-advisor context transfer,
- AI campaign analysis and recommendation workflows.

## Architecture

```text
                         Supabase
                   Auth + Business Data
                          /     \
                         /       \
                        v         v
            Analytics Dashboard  Advisory Platform
                    |                  |
                    |                  v
                    |                 n8n
                    |          Marketing AI Advisor
                    |             /         \
                    |        OpenAI      PostgreSQL
                    |                  Analytics Tool
                    |
                    +---- dashboard context ---->
```

## Repository Structure

```text
enterprise-ai-advisory-analytics-platform/
├── advisory-platform/
├── analytics-dashboard/
├── n8n-workflows/
│   └── marketing-advisor-backend.json
├── docs/
│   └── architecture.md
├── screenshots/
└── README.md
```

## Implementation Status

The platform UI was designed for multiple advisory domains such as Strategy, Marketing, Sales, Finance, Legal, Audit, Relations and Innovation.

The **Marketing Advisor** is the fully integrated reference implementation included in this public portfolio copy. Other advisor domains represent the extensible product architecture and were not all production-enabled before the original project was paused.

## Security & Privacy

This public repository is intentionally sanitized.

Excluded or replaced:
- Supabase production URLs and keys
- n8n production webhook URLs
- n8n credential references
- production datasets
- customer and employee data
- private IDs and emails
- generated build folders and local deployment artifacts
- proprietary production prompts and detailed internal business rules

Use the `.env.example` files with your own development credentials.
