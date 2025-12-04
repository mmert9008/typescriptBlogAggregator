import { setUser, readConfig } from "../config.js";

function main() {
  setUser("Mike");
  const config = readConfig();
  console.log(config);
}

main();
