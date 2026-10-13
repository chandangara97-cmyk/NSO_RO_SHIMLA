# Scheme Hub 2026 (Survey Indices Dashboard)

A static dashboard of indices from central and state government field surveys. **Unofficial** independent project. Not an official website and not affiliated with any government body.

- `data/indices.js` – survey catalogue and index values (edit `observations`, with a `source_url` for each value)
- `data/sources.json` – pages the daily checker scans for new releases
- `data/pinned.json` – fixed links and upcoming release dates
- `scripts/update_reports.py` + `.github/workflows/update-reports.yml` – daily release check (needs GitHub Actions enabled)

Observation format: `{"key":"ur","period":"2026-08","value":5.1,"source_url":"https://..."}`

## Landing page
`index.html` + `landing.css` + `landing.js`. The tool directory on the landing page is built from `tools/assets/tools.js`, so a new tool shows up there, in `tools/index.html` and in the floating quick-nav after one registry entry. The hero terrain map is illustrative, not real survey data.

## Field tools
Private working tools live in `tools/` (open `tools/index.html`), plus `editor_template.html` and `baddi_old_vs_new_dual.html` at the root.
They still contain office-related town and sub-office names as working data. If the repo is public, move `tools/` to a private repo.

`tools/gis_property_survey.html` is the GIS Property Survey Tool (ward outlines for 67 urban bodies are embedded in the file). It shows a town sign-in screen and can sync town data through Firebase, so check the credentials inside it before the repo is made public.
