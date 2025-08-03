#!/usr/bin/env node
/**
 * Lightweight validator for `.codexmeta` ensuring covenant compliance.
 * Avoids external dependencies for portability.
 */
const fs = require('fs');

const schema = JSON.parse(fs.readFileSync('codexmeta.schema.json', 'utf-8'));
const data = JSON.parse(fs.readFileSync('.codexmeta', 'utf-8'));

const errors = [];

// Verify required keys
const required = schema.required;
for (const key of required) {
  if (!(key in data)) {
    errors.push(`missing required property: ${key}`);
  }
}

// Check constant values
if (data.blessed_by !== schema.properties.blessed_by.const) {
  errors.push(`blessed_by must be '${schema.properties.blessed_by.const}'`);
}
if (data.codex_guardian !== schema.properties.codex_guardian.const) {
  errors.push(
    `codex_guardian must be '${schema.properties.codex_guardian.const}'`
  );
}

// Validate part_of array contents
if (!Array.isArray(data.part_of)) {
  errors.push('part_of must be an array');
} else {
  const requiredParts = schema.properties.part_of.allOf.map(
    (rule) => rule.contains.const
  );
  for (const part of requiredParts) {
    if (!data.part_of.includes(part)) {
      errors.push(`part_of must include '${part}'`);
    }
  }
}

// Validate covenant_bound
if (data.covenant_bound !== schema.properties.covenant_bound.const) {
  errors.push('covenant_bound must be true');
}

// Ensure no additional properties
const allowedKeys = Object.keys(schema.properties);
for (const key of Object.keys(data)) {
  if (!allowedKeys.includes(key)) {
    errors.push(`unexpected property: ${key}`);
  }
}

if (errors.length) {
  console.error('codexmeta validation failed:\n - ' + errors.join('\n - '));
  process.exit(1);
}

console.log('codexmeta validation passed');
