import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('123456789QWERTYUPASDFGHJKZXCVBNM', 10);
export default (prisma: InstanceType<typeof PrismaClient>) => {
    return {
        async register(email: string, password: string) {
            return await prisma.user.create({
                data: {
                    email,
                    password,
                    userName: nanoid(),
                    head: ''
                }
            });
        }
    };
};
