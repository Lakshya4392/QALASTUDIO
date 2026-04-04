module.exports = {
  '**/*.ts': ['eslint --fix', 'prettier --write'],
  '**/*.json': ['prettier --write'],
  '**/*.{md,yml,yaml}': ['prettier --write'],
};
