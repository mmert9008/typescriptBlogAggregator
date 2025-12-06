import { defineConfig } from "drizzle-kit";
import fs from "fs";
import os from "os";
import path from "path";

const configPath = path.join(os.homedir(), ".gatorconfig.json");
const configFile = fs.readFileSync(configPath, { encoding: "utf-8" });
const config = JSON.parse(configFile);

export default defineConfig({
  schema: "src/lib/db/schema.ts",
  out: "src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: config.db_url,
  },
});
