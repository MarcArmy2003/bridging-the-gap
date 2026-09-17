# Bridging the Gap

A school-community support and concern-reporting application project.
The source lives in [saving-grace-website/](saving-grace-website/); that directory
retains an earlier internal project name.

This is an independent project, not a VeteranIntel or Rangelight component.

## Repository map

| Path | Purpose |
|---|---|
| `saving-grace-website/` | Next.js application and package scripts |
| `branding_kit_and_design_plan.md` | Design record |
| `implementation_plan.md` | Implementation planning record |
| `.github/workflows/nextjs.yml` | GitHub Pages build and deployment workflow |

Planning documents describe intent and may contain historical work status.
They are not evidence that a feature has passed production acceptance.

## Development

Run the package scripts from `saving-grace-website/`, not the repository root:

```sh
cd saving-grace-website
npm install
npm run dev
npm run build
```

The package also defines `start` and `lint`. These commands were inspected,
not executed during this README review.

## Deployment and privacy

The checked-in Pages workflow runs on pushes to main, including README-only
changes, and publishes the application's static export. The previously documented
site address is [Bridging the Gap on GitHub Pages](https://marcarmy2003.github.io/bridging-the-gap/);
availability was not verified by this source review.

Before real student or family information is accepted, validate the actual
authentication, authorization, retention, escalation, and handling arrangements.
This README does not certify legal or regulatory compliance.

Reviewed September 17, 2026.
