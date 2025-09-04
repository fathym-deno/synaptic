# Synaptic Runtimes

Runtime packages built on Synaptic can leverage the fluent circuit builders to load and execute EaC-defined circuits.

- Start with the [Fluent Quick Start](../docs/fluent/quick-start.mdx) to learn the builder patterns.
- See the [Migration Guide](../docs/fluent/migration-guide.mdx) to convert existing JSON circuits.

Runtimes should accept EaC fragments (e.g., `Circuits: { id: { Details: ... } }`) produced by Synaptic and apply runtime-specific concerns like persistence, tooling, and I/O surfaces.
