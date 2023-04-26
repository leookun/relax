Examples

Create a migration from changes in Prisma schema, apply it to the database, trigger generators (e.g. Prisma Client)
$ prisma migrate dev

Reset your database and apply all migrations
$ prisma migrate reset

Apply pending migrations to the database in production/staging
$ prisma migrate deploy

Check the status of migrations in the production/staging database
$ prisma migrate status

Specify a schema
$ prisma migrate status --schema=./schema.prisma

Compare the database schema from two databases and render the diff as a SQL script
$ prisma migrate diff \
 --from-url "$DATABASE_URL" \
 --to-url "postgresql://login:password@localhost:5432/db" \
 --script
