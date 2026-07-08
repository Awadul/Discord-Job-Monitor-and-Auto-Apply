# Memory: Discord Job Search Bot

## Active Architectural Decisions
- Discord Selfbot using `discord.js-selfbot-v13` to monitor servers and threads for job postings matching configured keywords.
- Dynamic challenge-response solving for `duck.ai` using a sandboxed `JSDOM` VM context to emulate browser layout properties (bypassing anti-bot heuristic validation).
- Transitioned default model to `mistral-small-2603` with a client-side generated RSA key `durableStream` to satisfy current API contracts.
- Fixed keyword filtering: loops over keywords using a `for...of` loop. The AI pitch is dynamically generated, logged, and sent only if the thread starter message matches a keyword.
- Standardized logging: all pipeline exceptions (AI, Discord API, reporting channel) are logged in a uniform format, and skipped threads (where no keywords matched) are explicitly logged to the console for tracking.
- Customized AI prompt: updated the pitch prompt to use a structured layout tailored for Awais (focusing on TS stack, NUST education, specific projects, and strict formatting rules).
- Fixed skip reporting ReferenceError: moved the skip reporting block out of the unmonitored server `else` scope (where variables like `threadName` and `body` are out of scope/undefined) into the matched check `if (!matched)` scope, and corrected property accessor from `config.notAccountedPostsChannel` to `config['not-accounted-posts']`.


## Current Feature State
- **Bot Monitoring, Keyword Matching, and Pitch Posting**: `Complete`
- **Duck.ai API Migration & Challenge Solving**: `Complete`

## Breaking Changes / Critical Dependency Notes
- Added `jsdom` package to emulate browser environments for security challenges.

## Recent Schema Migrations / Query Changes
- None (No database in use).
