# acttoze Memos customization (upstream v0.31.0)

Blank card clicks open Memos' native inline editor through React handlers. No
additionalScript or React fiber internals are required. Ownership/readonly rules,
interactive descendants, media, memo text selection and modified clicks remain
unchanged. Double-click text editing still follows the instance setting.

Tests (Node >=24; pnpm 11.0.1):

```sh
cd web
pnpm install --frozen-lockfile
NODE_OPTIONS=--no-experimental-webstorage pnpm test --maxWorkers=2
pnpm exec tsc --noEmit --skipLibCheck
pnpm release
cd ..
docker build -f scripts/Dockerfile.custom --build-arg COMMIT="$(git rev-parse HEAD)" -t acttoze/memos:custom .
```

`Dockerfile.custom` limits Go compiler parallelism and memory. Frontend assets
are compiled before the Docker build, as with the upstream Dockerfile. The image
has the same runtime entrypoint, UID, data directory and port as upstream.

Deployment must merge an **image-only** Compose override with the existing
Compose file. Keep the original data mount, environment, labels, networks,
ports and resource limits. Take a restricted stopped-container data backup before
replacement; never commit instance settings, database files or credentials.
Rollback by running the original Compose configuration with the prior image.

Native hook tests cover blank clicks, interactive/media controls, selection,
readonly and modifiers. Integration tests exercise the real MemoView article
and editor-loading path (dependencies mocked). Production asset/health checks
cannot substitute for authenticated UI testing when no login is available.
