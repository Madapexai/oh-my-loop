import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "skills", "oh-my-loop");

test("Agent Skill has standard metadata and resolvable progressive references", () => {
  const skill = readFileSync(join(root, "SKILL.md"), "utf8");
  assert.match(skill, /^---\nname: oh-my-loop\ndescription: [^\n]+\n---\n/);
  const references = [...skill.matchAll(/\]\((references\/[^)]+)\)/g)].map((match) => match[1]);
  assert.ok(references.length >= 6);
  for (const reference of references) assert.equal(existsSync(join(root, reference)), true, reference);

  const metadata = readFileSync(join(root, "agents", "openai.yaml"), "utf8");
  assert.match(metadata, /display_name: "Oh My Loop"/);
  assert.match(metadata, /default_prompt: ".*\$oh-my-loop/);
  assert.equal(existsSync(join(root, "scripts", "doctor.mjs")), true);
});
