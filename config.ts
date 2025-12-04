import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  const configPath = getConfigFilePath();
  const jsonData = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };
  fs.writeFileSync(configPath, JSON.stringify(jsonData), { encoding: "utf-8" });
}

function validateConfig(rawConfig: any): Config {
  if (typeof rawConfig !== "object" || rawConfig === null) {
    throw new Error("Invalid config: not an object");
  }

  if (typeof rawConfig.db_url !== "string") {
    throw new Error("Invalid config: db_url must be a string");
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}

export function readConfig(): Config {
  const configPath = getConfigFilePath();
  const fileContents = fs.readFileSync(configPath, { encoding: "utf-8" });
  const rawConfig = JSON.parse(fileContents);
  return validateConfig(rawConfig);
}

export function setUser(username: string): void {
  const cfg = readConfig();
  cfg.currentUserName = username;
  writeConfig(cfg);
}
