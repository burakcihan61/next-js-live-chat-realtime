/** @type {import('prettier').Config} */
module.exports = {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    printWidth: 100,
    trailingComma: 'es5',
    plugins: ['prettier-plugin-tailwindcss'],
    tailwindConfig: './tailwind.config.ts',
};
