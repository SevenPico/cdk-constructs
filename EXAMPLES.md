# Running Examples Locally

This document describes how to build and consume SevenPico CDK construct packages
locally — before they are published to public registries — so that examples in
Python, Java, Go, and .NET can be tested on a developer machine.

---

## Overview

Each construct package is a JSII library. JSII compiles TypeScript source into
language-specific artifacts via `jsii-pacmak`. The general flow is:

1. Compile the TypeScript source with `npx jsii` inside the package directory.
2. Generate language artifacts with `npx jsii-pacmak` (outputs to `dist/`).
3. Install the generated artifact into the example app using the language's
   native toolchain.

---

## Prerequisites

| Tool | Minimum version | Purpose |
|------|----------------|---------|
| Node.js | 18+ | Build all packages |
| Python 3 + pip | 3.9+ | Python examples |
| Java + Maven | JDK 11+, Maven 3.8+ | Java examples |
| .NET SDK | 6+ | C# examples |
| Go | 1.21+ | Go examples |

---

## Step 1 — Install monorepo dependencies

From the repository root:

```bash
npm install
```

---

## Step 2 — Build the construct package

Run from the **package directory** you want to consume (e.g.
`packages/cdk-construct-kms-key`):

```bash
cd packages/cdk-construct-kms-key

# Compile TypeScript → lib/
../../node_modules/.bin/jsii --silence-warnings reserved-word

# Generate multi-language artifacts → dist/
../../node_modules/.bin/jsii-pacmak
```

The `dist/` directory will contain:
- `dist/js/`     — npm tarball (JavaScript/TypeScript)
- `dist/python/` — Python wheel (`.whl`)
- `dist/java/`   — Maven JAR and POM
- `dist/dotnet/` — NuGet package (`.nupkg`)
- `dist/go/`     — Go module source

---

## Step 3 — Install the artifact into your example app

### TypeScript / JavaScript

```bash
npm install ../../../packages/cdk-construct-kms-key/dist/js/*.tgz
```

### Python

```bash
pip install ../../../packages/cdk-construct-kms-key/dist/python/*.whl
```

If the construct depends on other SevenPico packages, install those wheels first
in dependency order (e.g. install `cdk-context` before `cdk-construct-kms-key`).

### Java (Maven)

Install the JAR into your local Maven repository:

```bash
mvn install:install-file \
  -Dfile=../../../packages/cdk-construct-kms-key/dist/java/*.jar \
  -DpomFile=../../../packages/cdk-construct-kms-key/dist/java/*.pom
```

Then reference it in `pom.xml`:

```xml
<dependency>
  <groupId>com.sevenpico</groupId>
  <artifactId>cdk-construct-kms-key</artifactId>
  <version>0.0.0</version>
</dependency>
```

### .NET (NuGet)

Add a local NuGet source pointing to the `dist/dotnet/` directory:

```bash
dotnet nuget add source \
  $(realpath ../../../packages/cdk-construct-kms-key/dist/dotnet) \
  --name sevenpico-local

dotnet add package SevenPico.CdkConstructKmsKey --version 0.0.0
```

### Go

Copy the generated Go module into your local module cache or use a `replace`
directive in your `go.mod`:

```
replace github.com/sevenpico/cdk-constructs/cdkconstructkmskey => \
  ../../../packages/cdk-construct-kms-key/dist/go/github.com/sevenpico/cdk-constructs/cdkconstructkmskey@v0.0.0
```

---

## Convenience script

A helper script is available at `scripts/build-example-deps.sh`. It accepts a
package slug and builds all transitive dependencies in order before generating
the artifacts:

```bash
# Build cdk-construct-kms-key and its dependencies
./scripts/build-example-deps.sh cdk-construct-kms-key
```

---

## CDK Bridge JSON fixture

All examples share a common CDK context fixture that provides realistic-looking
placeholder values for cross-stack references (VPC IDs, KMS key ARNs, etc.).

See [examples/fixtures/README.md](examples/fixtures/README.md) for details on
how to use the fixture.

---

## Adding a new example

Each construct's examples live under `packages/<name>/examples/`. The directory
structure for a complete example is:

```
packages/cdk-construct-kms-key/
  examples/
    complete/
      typescript/   app.ts, cdk.json, package.json
      python/       app.py, requirements.txt, cdk.json
      java/         src/main/java/.../App.java, pom.xml, cdk.json
      dotnet/       src/App.cs, App.csproj, cdk.json
      go/           main.go, go.mod, cdk.json
```

Each language variant is a standalone CDK app that synthesizes a stack using the
construct and the shared Bridge JSON fixture.
