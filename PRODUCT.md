# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are residents who need to report a civic issue or check the progress of an existing grievance. A protected secondary workflow serves officers who review cases, filter records, export data, and update status.

## Product Purpose

JanSeva is an independent public-grievance portal prototype. It gives each submitted concern a durable reference ID, stores it in a cloud database, and makes the case history trackable without exposing citizen contact details publicly. Success means a resident can complete the right task with confidence and understand what happens next.

## Positioning

The portal joins submission, reference-based tracking, visible status history, and an officer workflow in one small deployment while clearly identifying itself as an independent prototype rather than an official government service.

## Operating Context

Residents may arrive on a phone while standing near an issue, or return later with a reference ID to check progress. Officers use a password-protected dashboard to review and update cases. The interface must remain clear with an empty database, long grievance text, failed requests, slow connections, and narrow screens.

## Capabilities and Constraints

- Submit a grievance with category, location, description, priority, and optional contact details.
- Track a grievance by its `JSV-` reference without revealing contact fields.
- Browse service-category guidance.
- Suggest a service category from the resident's issue text. The suggestion is transparent, optional, and runs locally without sending text to another provider.
- Save created or tracked references as device-only "My cases" shortcuts. This convenience is not an identity or account system.
- Authenticate an officer, search and filter cases, update status, remove records, and export CSV.
- Cloudflare Workers serves the application and API; Cloudflare D1 provides persistent storage.
- The current officer model uses one shared password. Named identities and role-based access remain a future production requirement.
- No copy or interface may imply government affiliation or real departmental delivery.

## Brand Commitments

Keep the name JanSeva. The voice is plain, respectful, calm, and action-oriented. Trust must come from clarity, visible state, and honest disclosure rather than institutional imitation.

## Evidence on Hand

The repository contains a working static web interface, a tested Worker API, D1 migrations, protected officer routes, privacy copy, deployment configuration, and live production hosting. There are no official-government endorsements, department partnerships, testimonials, or outcome claims; future work must not fabricate them.

## Product Principles

- Put the resident's next action before portal chrome.
- Make status and recovery visible at every step.
- Ask only for information the workflow genuinely uses.
- Protect personal contact data by default.
- State prototype limits wherever a user could mistake the service for an official channel.

## Accessibility & Inclusion

Core tasks must remain keyboard-operable, readable at mobile sizes, understandable without color alone, compatible with reduced motion, and built around at least 44px touch targets and visible focus states.
