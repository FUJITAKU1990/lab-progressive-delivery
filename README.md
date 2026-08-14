# Feature Flags and Weighted Routing Lab

This repository contains the starter services and deterministic tooling for
Lab 6. Open it in the provided devcontainer and follow the tasks on the course
website.

The devcontainer starts a local stack with:

* The stable app at <http://localhost:3000>
* The canary app at <http://localhost:3001>
* Traefik at <http://localhost:8080>
* Unleash at <http://localhost:4242>

Run this command to show the generated local Unleash login:

```console
./scripts/show-credentials
```

Establish the expected failing baseline before making changes:

```console
./scripts/check-lab
```

After changing `src/flag.js`, restart the canary so it loads the new code:

```console
docker compose restart canary
```

Traefik watches `lab06/traefik.yml` and reloads valid changes automatically.
Sample the currently configured route with:

```console
./scripts/sample-routing 20
```

If the stack is stopped, run `./scripts/start-lab`. To discard all local state,
generate new local credentials, and restore the supplied disabled flag, run
`./scripts/reset-lab`.

The only student-owned deliverables are `src/flag.js` and
`lab06/traefik.yml`. Do not commit `.env`, `.env.lab`, or generated service
data.
