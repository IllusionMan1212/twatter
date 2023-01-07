import { prisma } from "../server/database/client";

const run = async () => {
    await prepareDb();
};

run()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

async function prepareDb() {
    const user = await prisma.user.findUnique({ where: { id: "1" } });
    if (!user) {
        await prisma.user.create({
            data: {
                id: "1",
                displayName: "name",
                username: "username",
                email: "email",
                password: "password",
            }
        });
    }
}

