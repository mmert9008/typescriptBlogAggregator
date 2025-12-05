import { setUser } from "./config.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = {
  [cmdName: string]: CommandHandler;
};

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
): void {
  registry[cmdName] = handler;
}

export function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): void {
  const commandHandler = registry[cmdName];

  if (!commandHandler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  commandHandler(cmdName, ...args);
}

export function handlerLogin(cmdName: string, ...args: string[]): void {
  if (args.length === 0) {
    throw new Error("Username is required for login");
  }

  const username = args[0];

  setUser(username);

  console.log(`Logged in as ${username}`);
}
