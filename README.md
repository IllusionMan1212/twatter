# Twatter 2.0

## How to run
### Requirements
- NodeJS >= 18
- PostgreSQL >= 14

### Development
1- Clone the repository
2- Copy the .env.example file to a .env file in the root directory of the project and fill in the missing values
3- Run `yarn install` to install the dependencies
4- Run `npx prisma migrate deploy` to create the database tables
5- Run `yarn run dev` to start the server

### Production
1- Follow all the steps in the development section except for step 5
2- Run `yarn run build` to build the app
4- Run `tsc --project tsconfig.server.json` to build the server
3- Run `yarn run start` to start the server which will serve the built app

