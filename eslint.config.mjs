import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
