#!/usr/bin/env node

'use strict'

const fsPromises = require('fs').promises;
const path = require('path');
const globby = require('globby')
const argv = require('yargs/yargs')(process.argv.slice(2))
  .default('verbosity', 1, 'logging detail (0 is quiet)')
  .argv;

const quietLogger = {
  message() {},
  debugMessage() {},
};

const normalLogger = Object.assign(
  {},
  quietLogger,
  {
    message(mess) {
      // eslint-disable-next-line no-console
      console.log(mess);
    },
  },
);

const verboseLogger = Object.assign(
  {},
  normalLogger,
  {
    debugMessage(mess) {
      // eslint-disable-next-line no-console
      console.log(mess);
    },
  },
);

const logger = ((level) => {
  switch (level) {
    case 2:
      return verboseLogger;
    case 0:
      return quietLogger;
    default:
      return normalLogger;
  }
})(argv.verbosity);

const main = async () => {
  logger.message('Running')
}

main()
  .catch(
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error)
      process.exit(1)
    }
  );