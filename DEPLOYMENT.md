# Railway + Vercel Deployment

This project is built for a MySQL database and already includes a full seed dump in [cainta_photography_mis.sql](cainta_photography_mis.sql).

## 1) Create MySQL database in Railway

1. Open Railway and create a new project.
2. Add a MySQL service.
3. Once created, copy these variables from the Railway dashboard:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

Then set the app environment variables in the same Railway service:

```bash
DB_HOST=$MYSQLHOST
DB_PORT=$MYSQLPORT
DB_USER=$MYSQLUSER
DB_PASSWORD=$MYSQLPASSWORD
DB_NAME=$MYSQLDATABASE
NODE_ENV=production
VERCEL=1
FRONTEND_ORIGINS=https://your-app.vercel.app
GEMINI_API_KEY=your_key_here
SMTP_EMAIL=your_email@gmail.com
SMTP_APP_PASSWORD=your_google_app_password
```

## 2) Import the SQL seed data

From the project root:

```bash
chmod +x scripts/import-db.sh
export DB_HOST="$MYSQLHOST"
export DB_PORT="$MYSQLPORT"
export DB_USER="$MYSQLUSER"
export DB_PASSWORD="$MYSQLPASSWORD"
export DB_NAME="$MYSQLDATABASE"
./scripts/import-db.sh cainta_photography_mis.sql
```

If you are importing from a local machine with mysql installed:

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < cainta_photography_mis.sql
```

This will load the pre-populated records already included in the dump.

## 3) Deploy to Railway

Use the project root as the app service and set the start command:

```bash
npm install
npm run build
npm start
```

Set the Railway start command to:

```bash
npm start
```

## 4) Deploy frontend to Vercel

From the project root:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Then add the same environment variables in Vercel:

```bash
DB_HOST=your_railway_db_host
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=cainta_photography_mis
VERCEL=1
NODE_ENV=production
FRONTEND_ORIGINS=https://your-app.vercel.app
GEMINI_API_KEY=your_key_here
```

## 5) Final check

After deployment, verify:

```bash
curl https://your-app.vercel.app/api/studios
```

It should return data from the imported SQL database.

## 6) Default admin login

The SQL dump includes seeded records for the system. Use the seeded admin/customer credentials created in the database and confirm the app loads with working data.
