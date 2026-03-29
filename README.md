# 🏛️ The Attendance API: A Backend Architecture Journey

> A strictly typed, transaction-safe REST API built to track student attendance. 

## 🤔 The Elephant in the Room: Why so much code?
If you are reading through this repository and wondering why a seemingly simple CRUD application has so many layers—service classes, explicit DTO boundary mappings, and rigorous transaction wrappers—that is entirely by design. 

This project was built to **relearn software design from the ground up**. 

Instead of reaching for an opinionated framework on day one, I deliberately chose to over-engineer the foundational layers. I wanted to feel the friction of doing things the "hard way" to genuinely understand and appreciate the problems that modern abstractions solve.

## 🚀 The Learning Path

### 1. The Raw Runtime Era (`Bun.serve`)
I started by building the HTTP routing completely from scratch using Bun's native `serve` method. 
* I manually parsed URLs, extracted parameters with Regex, and handled HTTP methods.
* **The Lesson:** I learned exactly how much boilerplate is required to safely parse JSON bodies, handle headers, and catch edge cases before the request even reaches the business logic.

### 2. The ElysiaJS Enlightenment
After experiencing the tedium of manual request parsing, I transitioned the routing layer to **ElysiaJS**. 
* **The Realization:** It was a revelation. Seeing Elysia's `TypeBox` automatically validate incoming JSON bodies and handle `422 Unprocessable Entity` rejections natively showed me exactly why frameworks exist. It allowed me to delete dozens of lines of defensive parsing code and focus purely on the domain logic.

### 3. Bulletproof Services & SQLite Traps
The data layer is powered by `bun:sqlite`. I learned that databases don't just "magically work" the way you expect them to.
* I encountered silent SQL failures, fought with raw `1` and `0` integers masquerading as booleans, and learned the hard way that `PRAGMA foreign_keys = ON;` is an absolute necessity. 
* To solve this, I built a strict **Service Layer** that translates crude database rows into pristine TypeScript Domain Models, wrapping multi-table operations (like reconciling running attendance totals) inside atomic `.transaction()` blocks.

### 4. Native Testing & Quality Assurance
I learned how to write integration and unit tests using Bun's native `bun:test` runner. 
* By spinning up transient `:memory:` SQLite databases for the test suites, I learned how to rigorously test API endpoints, validate status codes, and ensure that database math reconciles correctly without polluting production data.

### 5. Version Control & Branching
Throughout this rebuild, I implemented structured Git branching and version control practices, ensuring that chaotic refactors (like moving from raw Bun to Elysia) were contained, reviewable, and cleanly merged.

## 🗺️ What's Next (The Roadmap)

The backend foundation is solid, but the journey isn't over. The immediate next steps for this project are:

- [ ] **ORM Integration:** Replace the raw, synchronous `bun:sqlite` queries with a modern ORM (like Drizzle or Prisma). I want to learn how to manage migrations, schema generation, and asynchronous database queries at the service layer.
- [ ] **Frontend Integration:** Build a client interface (likely using Astro or React) to consume this API, handle CORS, and manage client-side state.

## 🙏 Gratitude
A massive appreciation for the modern JavaScript ecosystem. Building the raw HTTP plumbing by hand gave me a profound respect for the maintainers of tools like Elysia and Hono. You don't truly appreciate a good abstraction until you've tried to build it yourself.

---
*Built with 🦊 Bun, 🥟 Elysia, and 🪶 SQLite by Bhargav Deshpande.*
