import { prisma } from "../server/database/client";
import { users, follows } from "./users";
import posts from "./posts";

const run = async () => {
    await Promise.all([await seedUsers(), seedFollows(), seedPosts()]);
};

run()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

async function seedUsers() {
    return await Promise.all(users.map((user) => {
        return prisma.user.upsert({
            where: {
                id: user.id
            },
            update: {},
            create: {
                id: user.id,
                displayName: user.displayName,
                username: user.username,
                email: user.email,
                password: user.password,
                isAdmin: user.isAdmin,
                settings: {
                    create: {}
                },
            }
        });
    }));
}

async function seedFollows() {
    return await Promise.all(follows.map((follow) => {
        return prisma.follow.upsert({
            where: {
                followerId_followingId: {
                    followerId: follow.followerId,
                    followingId: follow.followingId
                }
            },
            update: {},
            create: {
                followerId: follow.followerId,
                followingId: follow.followingId
            }
        });
    }));
}

async function seedPosts() {
    return await Promise.all(posts.map((post) => {
        return prisma.post.upsert({
            where: {
                id: post.id
            },
            update: {},
            create: {
                id: post.id,
                content: post.content,
                authorId: post.authorId
            }
        });
    }));
}
