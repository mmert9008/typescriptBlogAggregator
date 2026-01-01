import { setUser, readConfig } from "./config.js";
import {
  createUser,
  getUserByName,
  deleteAllUsers,
  getUsers,
} from "./lib/db/queries/users.js";
import { fetchFeed } from "./lib/rss.js";
import {
  createFeed,
  getAllFeeds,
  getFeedByUrl,
  createFeedFollow,
  getFeedFollowsForUser,
} from "./lib/db/queries/feeds.js";
import type { Feed, User } from "./lib/db/schema.js";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type CommandsRegistry = Record<string, CommandHandler>;

const middlewareLoggedIn = (handler: UserCommandHandler): CommandHandler => {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const config = readConfig();
    if (!config.currentUserName) {
      throw new Error("no user is logged in");
    }

    const user = await getUserByName(config.currentUserName);
    if (!user) {
      throw new Error("current user not found");
    }

    await handler(cmdName, user, ...args);
  };
};

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
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length < 2) {
    throw new Error("name and url are required");
  }

  const name = args[0];
  const url = args[1];

  const feed = await createFeed(name, url, user.id);
  printFeed(feed, user);

  const feedFollow = await createFeedFollow(user.id, feed.id);
  console.log(`Following: ${feedFollow.feedName}`);
  console.log(`User: ${feedFollow.userName}`);
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

async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("url is required");
  }

  const url = args[0];

  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error("feed not found");
  }

  const feedFollow = await createFeedFollow(user.id, feed.id);
  console.log(`Following: ${feedFollow.feedName}`);
  console.log(`User: ${feedFollow.userName}`);
}

async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  const feedFollows = await getFeedFollowsForUser(user.id);

  for (const feedFollow of feedFollows) {
    console.log(`Feed: ${feedFollow.feedName}`);
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
  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(registry, "feeds", handlerFeeds);
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));

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
