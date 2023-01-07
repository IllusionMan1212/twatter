/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        "./src/contexts/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
        },
        screens: {
            "xs": "400px",
        },
    },
    plugins: [],
};
