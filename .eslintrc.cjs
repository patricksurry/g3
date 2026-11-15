module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
        "@typescript-eslint/no-unused-expressions": ["error", { "allowTaggedTemplates": true }],
        "@typescript-eslint/no-this-alias": "off"
    },
    "overrides": [
        {
            "files": ["*.cjs", "scripts/**/*.js"],
            "rules": {
                "@typescript-eslint/no-var-requires": "off"
            }
        }
    ]
};


