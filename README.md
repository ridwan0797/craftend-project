# Craftend

> A CLI to browse and install AI skills crafted specifically for frontend work.

Craftend is a registry of AI skills (component scaffolding, a11y audits, CSS refactoring, and more) that you can install straight into your project with a single command — no repo cloning, no manual copy-pasting.

```bash
npx craftend install
```

---

## Table of contents

- [Usage](#usage)
- [Commands](#commands)
- [Skill catalog](#skill-catalog)
- [How it works](#how-it-works)
- [Adding a new skill](#adding-a-new-skill)
- [Contributing](#contributing)
- [License](#license)

---

## Usage

No permanent install required:

```bash
npx craftend list        # see all available skills
npx craftend install     # pick & install interactively
```

Or install specific skills directly, skipping the interactive picker:

```bash
npx craftend install a11y-audit css-refactor
```

Selected skills are downloaded into `./skills` in your project, ready to be used by your AI assistant of choice.

## Commands

| Command | Description |
|---|---|
| `craftend list` | List all skills available in the registry |
| `craftend install` | Open an interactive checkbox picker to install skills |
| `craftend install <id...>` | Install specific skills directly by id |
| `craftend install --dir <path>` | Set the install destination folder (default: `./skills`) |

## Skill catalog

> ⚠️ The catalog below is still being finalized. This README will be updated once all skills are published to the registry.

| Skill | Description | Status |
|---|---|---|
| `component-scaffold` | React/Vue component boilerplate matching your project's conventions | 🚧 |
| `a11y-audit` | Accessibility audit with concrete WCAG fix suggestions | 🚧 |
| `css-refactor` | Clean up messy CSS/Tailwind without changing the final output | 🚧 |
| `figma-to-code` | Convert Figma designs into component code | 🚧 |
| `perf-audit` | Analyze render performance and bundle size | 🚧 |
| `storybook-writer` | Generate Storybook stories from existing components | 🚧 |

See the full, up-to-date catalog at [craftend.dev](#) or run `npx craftend list`.

## How it works

1. **Browse the catalog** — `craftend list` shows every skill in the registry.
2. **Pick & install** — `craftend install` opens an interactive checkbox picker.
3. **Start using it** — skills are downloaded into `./skills` in your project.

The registry is fetched *live* on every run, so new skills show up for everyone instantly without requiring a CLI update.

## Adding a new skill

1. Create a new folder at `skills/skill-name/` containing a `SKILL.md` plus any supporting files.
2. Add an entry to `registry/index.json`:

```json
{
  "id": "skill-name",
  "name": "Skill Name",
  "description": "Short description",
  "category": "category",
  "version": "1.0.0",
  "source": {
    "type": "github",
    "owner": "OWNER",
    "repo": "REPO",
    "ref": "main",
    "path": "skills/skill-name"
  }
}
```

3. Push to `main`. The skill will automatically appear in `craftend list` for every user.

## Contributing

New skills and CLI improvements are both welcome:

1. Fork this repo
2. Create a branch: `git checkout -b skill/skill-name`
3. Add your skill following the format above
4. Open a pull request

## License

MIT — free to use for personal or team projects.
