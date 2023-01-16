/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        "./src/contexts/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                "xs": "400px",
            },
        },
        boxShadow: {
            outline: "0 0 0 3px rgba(66, 153, 225, 0.6)"
        }
    },
    plugins: [],
};
