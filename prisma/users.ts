const users = [
    {
        id: "1",
        displayName: "illusion",
        username: "illusion",
        email: "illusion@twatter.social",
        password: "$2b$10$7X8hKyT2SCx2UEMdcPP6UOYjbYetWbAvzU1zGIcH2ftDjI7Gvb7L6",
        isAdmin: true,
        following: [
            { followingId: "2" },
            { followingId: "3" },
            { followingId: "4" },
            { followingId: "5" },
        ]
    },
    {
        id: "2",
        displayName: "randy",
        username: "randy",
        email: "randy@twatter.social",
        password: "$2b$10$7X8hKyT2SCx2UEMdcPP6UOYjbYetWbAvzU1zGIcH2ftDjI7Gvb7L6",
        isAdmin: false,
        following: [
            { followingId: "1" },
            { followingId: "3" },
            { followingId: "4" },
            { followingId: "5" },
        ]
    },
    {
        id: "3",
        displayName: "canny",
        username: "canny",
        email: "canny@twatter.social",
        password: "$2b$10$7X8hKyT2SCx2UEMdcPP6UOYjbYetWbAvzU1zGIcH2ftDjI7Gvb7L6",
        isAdmin: false,
        following: [
            { followingId: "1" },
            { followingId: "2" },
            { followingId: "4" },
            { followingId: "5" },
        ]
    },
    {
        id: "4",
        displayName: "zen",
        username: "zen",
        email: "zen@twatter.social",
        password: "$2b$10$7X8hKyT2SCx2UEMdcPP6UOYjbYetWbAvzU1zGIcH2ftDjI7Gvb7L6",
        isAdmin: false,
        following: [
            { followingId: "1" },
            { followingId: "2" },
            { followingId: "3" },
            { followingId: "5" },
        ]
    },
    {
        id: "5",
        displayName: "sv",
        username: "sv_",
        email: "sv@twatter.social",
        password: "$2b$10$7X8hKyT2SCx2UEMdcPP6UOYjbYetWbAvzU1zGIcH2ftDjI7Gvb7L6",
        isAdmin: false,
        following: [
            { followingId: "1" },
            { followingId: "2" },
            { followingId: "3" },
            { followingId: "4" },
        ]
    }
];

export default users;
