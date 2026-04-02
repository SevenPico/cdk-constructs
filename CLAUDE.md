# SevenPico CDK Constructs — Claude Code Guidelines

## Cost Control: Model Usage

**Always use Sonnet, never Opus, for agent spawns.**

- `settings.local.json` pins the orchestrator session to `claude-sonnet-4-6`
- When spawning agents via the `Agent` tool, always pass `"model": "sonnet"` explicitly — do not rely on inheritance alone
- Never pass `"model": "opus"` unless there is an explicit user request for a specific task

This project runs long orchestration sessions with many agent spawns. Opus costs ~15x Sonnet at scale.

## NanoClip Agent Team

Agents are defined in `.nanoclip/agents/`. All agents specify `claude-sonnet-4-6` in their JSON.

The pipeline for each construct: resource-specialist/pattern-specialist → code-reviewer → qa-engineer → lead-engineer merges.

Short-lived agents (code-reviewer, qa-engineer, resource-specialist, pattern-specialist) are spawned fresh per task/PR and shut down after completing their role. lead-engineer is the long-running coordinator.
