import dotenv from 'dotenv';

dotenv.config({ path: "universal.env", override: true });
dotenv.config({ path: ".env", override: true });
if (process.env.NODE_ENV) {
  dotenv.config({ path: `${process.env.NODE_ENV}.env`, override: true });
}
