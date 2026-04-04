import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Seed command as a string
    seed: "tsx ./src/utils/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
