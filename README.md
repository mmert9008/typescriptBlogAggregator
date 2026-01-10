# TypeScript Blog Aggregator

This is the [Build a Blog Aggregator in TypeScript project](https://www.boot.dev/lessons/4d624835-9830-4ca6-bfbb-280112f64baf) from [Boot.dev](https://www.boot.dev).

## Gator

A command-line RSS feed aggregator that allows you to follow and read posts from your favorite blogs, news sites, and podcasts, all from your terminal.

### Features

- Subscribe to RSS feeds from across the internet
- Multi-user support on a single device
- Automatic feed aggregation in the background
- Browse posts from feeds you follow
- Store posts in PostgreSQL for offline reading
- Follow/unfollow specific feeds

### Prerequisites

Before running Gator, you'll need:

- **Node.js v22.15.0+** - Install via [NVM](https://github.com/nvm-sh/nvm)
- **PostgreSQL 16+** - [Download here](https://www.postgresql.org/download/)
- **npm** - Comes with Node.js

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mmert9008/typescriptBlogAggregator
   cd gator
   ```

2. **Install Node.js with NVM**
   ```bash
   nvm use
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up PostgreSQL**
   
   Start PostgreSQL on macOS:
   ```bash
   brew services start postgresql@16
   ```
   
   Start PostgreSQL on Linux:
   ```bash
   sudo service postgresql start
   ```
   
   Create the database on macOS:
   ```bash
   psql postgres
   ```
   
   Create the database on Linux:
   ```bash
   sudo -u postgres psql
   ```
   
   In psql:
   ```sql
   CREATE DATABASE gator;
   \q
   ```

5. **Create the config file**
   
   Create `~/.gatorconfig.json` in your home directory:
   ```json
   {
     "db_url": "postgres://username:password@localhost:5432/gator?sslmode=disable"
   }
   ```
   
   Replace `username` and `password` with your PostgreSQL credentials.
   
   Example for macOS (no password):
   ```json
   {
     "db_url": "postgres://yourusername:@localhost:5432/gator?sslmode=disable"
   }
   ```
   
   Example for Linux:
   ```json
   {
     "db_url": "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable"
   }
   ```

6. **Run database migrations**
   ```bash
   npm run generate
   npm run migrate
   ```

### Usage

#### User Management

**Register a new user**
```bash
npm run start register <username>
```

**Login as a user**
```bash
npm run start login <username>
```

**List all users**
```bash
npm run start users
```

#### Feed Management

**Add a new feed**
```bash
npm run start addfeed "<feed-name>" "<feed-url>"
```

Example:
```bash
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
```

**List all feeds**
```bash
npm run start feeds
```

**Follow a feed**
```bash
npm run start follow "<feed-url>"
```

**Unfollow a feed**
```bash
npm run start unfollow "<feed-url>"
```

**List feeds you're following**
```bash
npm run start following
```

#### Reading Posts

**Browse posts from feeds you follow**
```bash
npm run start browse [limit]
```

Examples:
```bash
npm run start browse
npm run start browse 10
```

#### Feed Aggregation

**Run the aggregator (background service)**
```bash
npm run start agg <time-between-requests>
```

The aggregator continuously fetches new posts from all feeds in the database.

Time format examples:
- `1s` - every second
- `30s` - every 30 seconds
- `1m` - every minute
- `5m` - every 5 minutes
- `1h` - every hour

Example:
```bash
npm run start agg 1m
```

Press `Ctrl+C` to stop the aggregator.

**Note:** Be respectful of servers - don't set the interval too low. A reasonable interval is 1-5 minutes.

#### Utility Commands

**Reset the database**
```bash
npm run start reset
```

This deletes all users, feeds, and posts.

### Example Workflow

```bash
npm run start register alice

npm run start addfeed "TechCrunch" "https://techcrunch.com/feed/"
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
npm run start addfeed "Boot.dev Blog" "https://blog.boot.dev/index.xml"

npm run start agg 1m

npm run start browse 5

npm run start feeds
npm run start follow "<feed-url>"

npm run start following
```

### Recommended RSS Feeds

Here are some feeds to get started:

- **Tech News**
  - TechCrunch: `https://techcrunch.com/feed/`
  - Hacker News: `https://news.ycombinator.com/rss`
  - The Verge: `https://www.theverge.com/rss/index.xml`

- **Programming**
  - Boot.dev Blog: `https://blog.boot.dev/index.xml`
  - Dev.to: `https://dev.to/feed`
  
- **General News**
  - BBC News: `https://feeds.bbci.co.uk/news/rss.xml`
  - NPR: `https://feeds.npr.org/1001/rss.xml`

### Project Structure

```
gator/
├── src/
│   ├── index.ts              # Main CLI entry point
│   ├── config.ts             # Config file management
│   ├── lib/
│   │   ├── rss.ts            # RSS feed parser
│   │   └── db/
│   │       ├── index.ts      # Database connection
│   │       ├── schema.ts     # Database schema
│   │       ├── queries/
│   │       │   ├── users.ts  # User queries
│   │       │   ├── feeds.ts  # Feed queries
│   │       │   └── posts.ts  # Post queries
│   │       └── migrations/   # Database migrations
├── drizzle.config.ts         # Drizzle ORM config
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── .gatorconfig.json         # User config (in home directory)
```

### Technologies Used

- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **Drizzle ORM** - Lightweight TypeScript ORM
- **fast-xml-parser** - RSS feed parsing
- **Node.js** - Runtime environment

### Troubleshooting

**Database connection errors**
- Verify PostgreSQL is running
- Check your connection string in `~/.gatorconfig.json`
- Ensure the database exists

**Migration errors**
- Run `npm run generate` to create migration files
- Run `npm run migrate` to apply them

**No posts showing up**
- Make sure the aggregator is running: `npm run start agg 1m`
- Wait a minute for it to fetch posts
- Ensure you're following feeds: `npm run start following`
