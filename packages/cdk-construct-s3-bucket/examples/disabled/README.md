# S3Bucket — Disabled Example

Demonstrates the zero-resources pattern: when `enabled` is `false` in the context,
`S3Bucket` creates no AWS resources.

See [EXAMPLES.md](../../../../EXAMPLES.md) for the full local build workflow.

## Usage

```bash
cd typescript && npx ts-node app.ts
```

## Expected Output

`cdk synth` produces a template with no S3 buckets.
