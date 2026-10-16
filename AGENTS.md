# Gym project instructions

## Project skills

The skills below are bundled with this repository. Before relevant work, read the full corresponding SKILL.md and follow its instructions, subject to the user's request and these project instructions. Do this even if the skill is absent from the chat skill picker or the runtime skill catalog. Announce the skill used briefly. Do not claim registration in the chat picker.

| Task | Skill file relative to this directory |
| --- | --- |
| Interface design, mobile layout, interaction, visual reviews | `.agents/skills/ui-ux-pro-max/SKILL.md` |
| Browser testing, screenshots, UI behavior verification | `.agents/skills/webapp-testing/SKILL.md` |
| Accessibility, labels, focus, touch targets, contrast | `.agents/skills/accessibility/SKILL.md` |
| Native SwiftUI views and iOS integration | `.agents/skills/swiftui-expert-skill/SKILL.md` |
| Finding or installing additional skills | `.agents/skills/find-skills/SKILL.md` |

Resolve supporting files relative to each installed skill directory. For UI UX Pro Max, use the actual installed path `.agents/skills/ui-ux-pro-max/scripts/search.py`; do not assume CLAUDE_PLUGIN_ROOT is defined. Python 3 is available. Read supporting references only when relevant.

Keep the existing app architecture and the user's design decisions. Skills are development guidance, not app runtime dependencies. Do not add a framework, Tailwind, Python Playwright, dependencies, or features solely because a skill's example uses them. Prefer the project's existing JavaScript Playwright tests and commands. Match verification to the change. iOS builds and physical device behavior require a Mac/iPhone; report cloud verification limits accurately.

For PWA work, preserve training data, cache ownership and the existing deliberate update lifecycle. Do not delete unrelated caches or stored user data, force worker activation, or change scope solely to follow generic guidance. Inspect the current implementation and relevant tests first.
