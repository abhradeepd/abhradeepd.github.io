# abhradeepd.github.io

**Live site → [abhradeepd.github.io](https://abhradeepd.github.io)**

Personal portfolio of **Abhradeep Das** — Analytics Engineer. I build tested, documented data models in dbt and SQL on warehouses like Snowflake and BigQuery, and deliver them as governed, self-service Power BI and Tableau dashboards. Previously at **The World Bank** and **The George Washington University**.

## About the site

A hand-built static site — no frameworks, no build step, zero dependencies. Plain HTML, CSS and JavaScript, hosted free on GitHub Pages.

Design highlights:

- **Dark liquid-glass UI** — translucent frosted panels over a field of color, with a two-tier glass system: darker readable panes for content, brighter thin glass for controls
- **Physically-motivated interactions** — panels tilt under the cursor with an inertia law scaled to their area (small panes swing, large slabs resist), and a local specular highlight disperses through the spectrum where the pointer touches the glass
- **An animated data pipeline** in the hero (raw sources → ingest → warehouse → dbt tests → BI) and a metric board with live count-ups and sparklines
- **Apple system typography** — SF Pro / SF Mono on Apple devices, graceful fallbacks elsewhere
- A terminal-style loader, scroll-driven section reveals with a nav scrollspy, and a few details for those who look closely
- Full `prefers-reduced-motion` support

## Repository layout

```
index.html    → the site (single page)
style.css     → all styling
main.js       → loader, reveals, scrollspy, optics engine
assets/       → avatar + resume PDF
```

## Running locally

Clone or download, then open `index.html` in a browser. That's it — no install, no server needed.

## Contact

**abhradeep.das@gwu.edu** · [LinkedIn](https://www.linkedin.com/in/abhradeep-das-ds09ji3/) · [GitHub](https://github.com/abhradeepd)

---
