#!/usr/bin/env node

import { globby } from 'globby';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

yargs(hideBin(process.argv))
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
})(yargs.verbosity);

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