import { setUser, readConfig } from "./config.js";
import {
  createUser,
  getUserByName,
  deleteAllUsers,
  getUsers,
} from "./lib/db/queries/users.js";
import { fetchFeed } from "./lib/rss.js";
import { createFeed, getAllFeeds } from "./lib/db/queries/feeds.js";
import type { Feed, User } from "./lib/db/schema.js";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

type CommandsRegistry = Record<string, CommandHandler>;

function printFeed(feed: Feed, user: User): void {
  console.log(`Feed: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}

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

async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
  await deleteAllUsers();
  console.log("Database reset successfully");
}

async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
  const config = readConfig();
  const allUsers = await getUsers();

  for (const user of allUsers) {
    if (user.name === config.currentUserName) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}

async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
  console.log(JSON.stringify(feed, null, 2));
}

async function handlerAddFeed(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length < 2) {
    throw new Error("name and url are required");
  }

  const name = args[0];
  const url = args[1];

  const config = readConfig();
  if (!config.currentUserName) {
    throw new Error("no user is logged in");
  }

  const user = await getUserByName(config.currentUserName);
  if (!user) {
    throw new Error("current user not found");
  }

  const feed = await createFeed(name, url, user.id);
  printFeed(feed, user);
}

async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void> {
  const allFeeds = await getAllFeeds();

  for (const feed of allFeeds) {
    console.log(`Feed: ${feed.feedName}`);
    console.log(`URL: ${feed.feedUrl}`);
    console.log(`User: ${feed.userName}`);
    console.log();
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
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "addfeed", handlerAddFeed);
  registerCommand(registry, "feeds", handlerFeeds);

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
