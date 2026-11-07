import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { or, eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../db/schema";

export async function authRoutes(app: FastifyInstance) {
    app.post("/register", async (req, res) => {
        const { email, username, password } = req.body as {
            email?: string;
            username?: string;
            password?: string;
        };

        if (!email || !username || !password) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        if (username.length < 3) {
            return res.status(400).send({ error: "Username must be at least 3 characters long" });
        }
        if (username.length > 20) {
            return res.status(400).send({ error: "Username must be at most 20 characters long" });
        }
        if (!username.match(/^[a-zA-Z0-9_-]+$/)) {
            return res.status(400).send({ error: "Username must contain only letters, numbers, underscores and hyphens" });
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
            return res.status(400).send({
                error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character",
            });
        }

        const [existingUser] = await db
            .select()
            .from(users)
            .where(or(eq(users.email, email), eq(users.username, username)))
            .limit(1);

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).send({ error: "Email already exists" });
            }
            if (existingUser.username === username) {
                return res.status(409).send({ error: "Username already exists" });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [user] = await db
            .insert(users)
            .values({
                email,
                username,
                passwordHash,
            })
            .returning();

        const token = app.jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        });

        return res.status(201).send({
            token,
            user: { id: user.id, email: user.email, username: user.username, role: user.role },
        });
    });

    app.post("/login", async (req, res) => {
        const { email, password } = req.body as { email?: string; password?: string };
        if (!email || !password) {
            return res.status(400).send({ error: "Email and password are required" });
        }

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            return res.status(401).send({ error: "Invalid email or password" });
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).send({ error: "Invalid email or password" });
        }

        const token = app.jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        });

        return res.status(200).send({
            token,
            user: { id: user.id, email: user.email, username: user.username, role: user.role },
        });
    });

    app.get("/me", async (req, res) => {
        await req.jwtVerify();
        const user = req.user as { id: string; email: string; username: string; role: string };
        return res.status(200).send({
            user: { id: user.id, email: user.email, username: user.username, role: user.role },
        });
    });
}
