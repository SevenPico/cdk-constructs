import { MonorepoTsProject } from "@aws/pdk/monorepo";
import { AwsCdkConstructLibrary } from "projen/lib/awscdk";
import { NodePackageManager } from "projen/lib/javascript";

const monorepo = new MonorepoTsProject({
  name: "sevenpico-cdk-constructs",
  packageManager: NodePackageManager.NPM,
  defaultReleaseBranch: "main",
  minNodeVersion: "22.0.0",
  devDeps: ["@aws/pdk", "projen@^0.99.27", "jsii-rosetta@~5.9.0"],
  gitIgnoreOptions: {
    ignorePatterns: [".env", "*.js.map", ".claude", ".vscode", "cdk.out"],
  },
  tsconfigDev: {
    compilerOptions: {
      types: ["jest", "node"],
    },
  },
});

// Ensure workspace packages compile in dependency order — without this, nx
// runs all compile targets in parallel and packages that import
// @sevenpico/cdk-context fail because lib/index.js doesn't exist yet.
monorepo.nx.file.addOverride("targetDefaults.compile", {
  dependsOn: ["^compile"],
});

// VS Code discovers tsconfig.json (not tsconfig.dev.json) for type checking.
// The root tsconfig.json covers **/*.ts which includes all package test files.
// Adding jest/node types here lets VS Code resolve expect, describe, etc. in all tests.
monorepo.tsconfig?.file?.addOverride("compilerOptions.types", ["jest", "node"]);

// ── JSII language target helpers ──────────────────────────────────────────────
// Derive JSII target names from a package slug like 'cdk-context' or
// 'cdk-construct-kms-key'.  All targets follow SevenPico naming conventions.
//
// Python: distName sevenpico.<slug-with-underscores>
//         module   sevenpico.<slug_with_underscores>
// Java:   groupId com.sevenpico, artifactId <slug>
// .NET:   namespace SevenPico.<PascalCase>, packageId SevenPico.<PascalCase>
// Go:     moduleName github.com/sevenpico/cdk-constructs
//         packageName derived from slug (underscores, no hyphens)

const toPascalCase = (slug: string): string =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

const jsiiTargets = (slug: string) => {
  const pyModule = `sevenpico.${slug.replace(/-/g, "_")}`;
  const pascal = toPascalCase(slug);
  return {
    publishToPypi: {
      distName: pyModule,
      module: pyModule,
    },
    publishToMaven: {
      javaPackage: `com.sevenpico.${slug.replace(/-/g, ".")}`,
      mavenGroupId: "com.sevenpico",
      mavenArtifactId: slug,
    },
    publishToNuget: {
      dotNetNamespace: `SevenPico.${pascal}`,
      packageId: `SevenPico.${pascal}`,
    },
    publishToGo: {
      moduleName: "github.com/sevenpico/cdk-constructs",
      packageName: slug.replace(/-/g, ""),
    },
  };
};

// ── Shared helper ─────────────────────────────────────────────────────────────
const pkg = (name: string, outdir: string, opts: any = {}) => {
  const p = new AwsCdkConstructLibrary({
    parent: monorepo,
    name: `@sevenpico/${name}`,
    outdir: `packages/${outdir ?? name}`,
    author: "SevenPico",
    authorAddress: "https://sevenpico.com",
    repositoryUrl: "https://github.com/SevenPico/cdk-constructs",
    cdkVersion: "2.258.0",
    constructsVersion: "10.6.0",
    defaultReleaseBranch: "main",
    jsiiVersion: "~5.9.0",
    minNodeVersion: "22.0.0",
    packageManager: NodePackageManager.NPM,
    tsconfigDev: {
      compilerOptions: {
        types: ["jest", "node"],
      },
    },
    devDeps: ["jest-cucumber"],
    ...jsiiTargets(name),
    ...opts,
  });
  // Workaround for aws/aws-pdk#902: replace npm ci with npm install
  p.tasks.tryFind("install:ci")?.reset("npm install");
  return p;
};

// ── Foundation packages ───────────────────────────────────────────────────────
// cdk-context is a pure TypeScript library; aws-cdk-lib is a peer dep only.
// jsii-docgen searches for assemblies only within the package directory, so we
// symlink the workspace-hoisted aws-cdk-lib before every compile so docgen can
// find it.  The symlink target is relative to packages/cdk-context/node_modules/.
const cdkContext = pkg("cdk-context", "cdk-context", {
  cdkVersion: "2.258.0",
  deps: [],
});
cdkContext.preCompileTask.exec("mkdir -p node_modules");
cdkContext.preCompileTask.exec(
  "ln -sf ../../../node_modules/aws-cdk-lib node_modules/aws-cdk-lib 2>/dev/null || true",
);
cdkContext.preCompileTask.exec(
  "ln -sf ../../../node_modules/constructs node_modules/constructs 2>/dev/null || true",
);
pkg("cdk-bridge", "cdk-bridge", { peerDeps: ["@sevenpico/cdk-context"] });

// ── Construct packages ────────────────────────────────────────────────────────
const ctx = ["@sevenpico/cdk-context"];

pkg("cdk-construct-kms-key", "cdk-construct-kms-key", { peerDeps: ctx });
pkg("cdk-construct-s3-bucket", "cdk-construct-s3-bucket", { peerDeps: ctx });
pkg("cdk-construct-s3-log-storage", "cdk-construct-s3-log-storage", {
  peerDeps: [...ctx, "@sevenpico/cdk-construct-s3-bucket"],
});
pkg("cdk-construct-s3-website", "cdk-construct-s3-website", { peerDeps: ctx });
pkg("cdk-construct-secret", "cdk-construct-secret", { peerDeps: ctx });
pkg("cdk-construct-iam-role", "cdk-construct-iam-role", { peerDeps: ctx });
pkg("cdk-construct-iam-policy", "cdk-construct-iam-policy", { peerDeps: ctx });
pkg("cdk-construct-iam-user", "cdk-construct-iam-user", { peerDeps: ctx });
pkg("cdk-construct-lambda-function", "cdk-construct-lambda-function", {
  peerDeps: ctx,
});
pkg(
  "cdk-construct-lambda-error-notification",
  "cdk-construct-lambda-error-notification",
  { peerDeps: ctx, deps: ["@sevenpico/cdk-construct-sqs-queue"] },
);
pkg("cdk-construct-step-functions", "cdk-construct-step-functions", {
  peerDeps: ctx,
  deps: ["@sevenpico/cdk-construct-iam-role"],
});
pkg(
  "cdk-construct-sfn-error-notification",
  "cdk-construct-sfn-error-notification",
  { peerDeps: ctx, deps: ["@sevenpico/cdk-construct-sqs-queue"] },
);
pkg(
  "cdk-construct-express-sfn-error-notification",
  "cdk-construct-express-sfn-error-notification",
  { peerDeps: ctx, deps: ["@sevenpico/cdk-construct-sqs-queue"] },
);
pkg("cdk-construct-sqs-queue", "cdk-construct-sqs-queue", { peerDeps: ctx });
pkg("cdk-construct-sns", "cdk-construct-sns", { peerDeps: ctx });
pkg("cdk-construct-kinesis-stream", "cdk-construct-kinesis-stream", {
  peerDeps: ctx,
});
pkg("cdk-construct-eventbridge", "cdk-construct-eventbridge", {
  peerDeps: ctx,
});
pkg("cdk-construct-eventbridge-rule", "cdk-construct-eventbridge-rule", {
  peerDeps: ctx,
});
pkg("cdk-construct-dynamodb", "cdk-construct-dynamodb", { peerDeps: ctx });
pkg("cdk-construct-redshift-cluster", "cdk-construct-redshift-cluster", {
  peerDeps: ctx,
});
pkg("cdk-construct-ses", "cdk-construct-ses", { peerDeps: ctx });
pkg("cdk-construct-http-api-gateway", "cdk-construct-http-api-gateway", {
  peerDeps: ctx,
});
pkg("cdk-construct-slackbot", "cdk-construct-slackbot", {
  peerDeps: ctx,
  deps: [
    "@sevenpico/cdk-construct-sns",
    "@sevenpico/cdk-construct-lambda-function",
  ],
});
pkg("cdk-construct-cloudtrail", "cdk-construct-cloudtrail", { peerDeps: ctx });
pkg(
  "cdk-construct-cloudtrail-cloudwatch-alarms",
  "cdk-construct-cloudtrail-cloudwatch-alarms",
  { peerDeps: ctx },
);
pkg("cdk-construct-cloudwatch-events", "cdk-construct-cloudwatch-events", {
  peerDeps: ctx,
});
pkg(
  "cdk-construct-cloudwatch-flow-logs",
  "cdk-construct-cloudwatch-flow-logs",
  { peerDeps: ctx },
);

// ── Workaround: replace npm ci with npm install (aws/aws-pdk#902) ────────────
// @aws/pdk bundles @pnpm/git-utils which uses npm aliases for deps. npm ci
// requires those aliased bundled entries in the lock file, but npm install
// doesn't write them. Revert to npm install until @aws/pdk ships the fix.
const ciTask = monorepo.tasks.tryFind("install:ci");
if (ciTask) {
  ciTask.reset("npm install");
  ciTask.exec("npx nx run-many --target=install:ci --output-style=stream --nx-bail", { receiveArgs: true });
}

// ── Security overrides for vulnerable transitive dependencies ─────────────────
// PDK-managed overrides are preserved here so they survive re-synths.
// Scoped minimatch overrides target each consumer's major version to avoid
// forcing cross-major API breaks. fast-uri/brace-expansion in aws-cdk-lib and
// yaml in projen are bundled — only fixable by upgrading those packages.
// lodash in @aws/pdk has no upstream fix available.
// uuid (<11.1.1) is left unfixed — forcing v11 breaks jest-cucumber's API.
monorepo.addTask("package-all", {
  description:
    "Packages artifacts for all target languages across all projects",
  steps: [
    {
      exec: "npx nx run-many --target=package-all --output-style=stream --nx-bail",
      receiveArgs: true,
    },
  ],
});

monorepo.package.addField("overrides", {
  "@types/babel__traverse": "7.18.2", // PDK-managed, keep
  "wrap-ansi": "^7.0.0", // PDK-managed, keep
  "brace-expansion": "^2.0.3", // v2.0.0–2.0.2 also vulnerable; non-bundled instances
  "js-yaml": "^4.1.1", // safe: targets packages already on v4
  "diff": "^4.0.4", // GHSA-73rr-hh4g-fpgx DoS; safe same-major bump
  "flatted": "^3.4.2", // GHSA-25h7-pfq9-p65f, GHSA-rf6f-7fwh-wjgh
  "nx": {
    "minimatch": "^9.0.7", // nx@19 uses minimatch@9; 9.0.0–9.0.6 vulnerable
  },
  "syncpack": {
    "minimatch": "^9.0.7", // syncpack ships minimatch@9; same fix
  },
  // Note: @aws/pdk minimatch@10.0.1 is bundled (inBundle:true) — override has no effect
});

monorepo.synth();
