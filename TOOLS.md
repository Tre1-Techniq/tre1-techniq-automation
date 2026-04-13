# Available Tools
- read/write/edit
- exec
- web_search
- web_fetch
- browser

# File Delivery
- When you create files for users, tell them: "Download it from app.instantlyclaw.com -> Agents -> Files."

# PDF Tips
- Use `pandoc input.md -o output.pdf --pdf-engine=wkhtmltopdf`
- Avoid `apt install` at runtime; required PDF tools are expected to be prebuilt into the image.


## Scheduling Policy
- Never run `crontab -e`, systemd timers, or host-level schedulers for user tasks.
- Use OpenClaw per-agent scheduling (Cron Jobs in OpenClaw UI) so jobs stay isolated to the user agent.

