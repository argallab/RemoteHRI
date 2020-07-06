# Server

Express server using nodus-ponens to generate experiments.

## Installation

```bash
cd server
npm install
node server.js
```

Entry point for looking at the code is [nodus-ponens/index.js](server/nodus-ponens/index.js) as well as [server.js](server/server.js).

Data from incompleted experiments is found in server/data/incomplete and data from completed experiments is found in server/data.

## Usage

# Admin

Front-end application built using React that allows researchers to set up experiments.

## Installation

```bash
cd admin
npm install
npm start
```

See [the admin application's README.md](admin/README.md) for more options.


# Client

Front-end application built using React that renders experiments to present to the subjects.

Calls server for experiment data to dynamically render different types of stimuli to the subjects.

In order to view the front-end application, you must also have the server running (see above).

## Installation

```bash
cd client
npm install
npm start
```

