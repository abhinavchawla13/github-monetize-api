



# GitHub: Monetize Documentation - Backend
### UI code is available at: [https://github.com/abhinavchawla13/github-monetize-ui](https://github.com/abhinavchawla13/github-monetize-ui)
#### Backend server for BeTheHope hosted at [https://github-monetize.herokuapp.com/](https://github-monetize.herokuapp.com/)
#### API Documentation published on [Postman](https://documenter.getpostman.com/view/1085264/SztG46GP)
---

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) (v12+, npm v6+) installed.

```sh
git clone https://github.com/abhinavchawla13/github-monetize-api.git
cd github-monetize-api
npm install
npm run start
```
[https://github-monetize.herokuapp.com/]: https://github-monetize.herokuapp.com/ "https://github-monetize.herokuapp.com/"

## Environment Variables
Add a `.env` file in the root folder (you should setup your MongoDb, Stripe, Firebase and Twilio accounts):
```
NODE_ENV=
PORT=8000
MONGODB_URI=


FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_DATABASE_URL=

BASE_URL=https://github-monetize.web.app/

BASE_NAME=documento
```

## Deployment
Heroku pipeline is set to auto deploy `master` branch currently.
