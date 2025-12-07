import { setUser, readConfig } from "./config.js";
import { createUser, getUserByName } from "./lib/db/queries/users.js";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

type CommandsRegistry = Record<string, CommandHandler>;

async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
  if (args.length === 0) {
    throw new Error("username is required");
  }
  const username = args[0];

  const user = await getUserByName(username);
  if (!user) {
    throw new Error("user does not exist");
  }

  setUser(username);
  console.log(`User has been set to ${username}`);
}

async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("username is required");
  }
  const username = args[0];

  try {
    const user = await createUser(username);
    setUser(username);
    console.log(`User created successfully:`);
    console.log(user);
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      throw new Error("user already exists");
    }
    throw error;
  }
}

function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
): void {
  registry[cmdName] = handler;
}

async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`Command '${cmdName}' not found`);
  }
  await handler(cmdName, ...args);
}

async function main() {
  const registry: CommandsRegistry = {};

  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Error: not enough arguments provided");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
