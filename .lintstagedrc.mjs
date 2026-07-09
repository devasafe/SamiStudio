const config = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,mjs,json,css,md}": ["prettier --write"],
};

export default config;
