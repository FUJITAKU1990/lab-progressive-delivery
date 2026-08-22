# Feature Flags Lab

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

The supplied Traefik route exposes both versions so you can observe which
requests reach the flag-aware canary. Sample it with:

```console
./scripts/sample-routing 20
```

If the stack is stopped, run `./scripts/start-lab`. To discard all local state,
generate new local credentials, and restore the supplied disabled flag, run
`./scripts/reset-lab`.

The only student-owned deliverable is `src/flag.js`.
Do not commit `.env`, `.env.lab`, or generated service data.
