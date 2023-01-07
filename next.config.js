const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
    async rewrites() {
        return [
            {
                source: "/@:username",
                destination: "/u/:username"
            },
            {
                source: "/@:username/:postId",
                destination: "/u/:username/:postId"
            }
        ];
    }
});
