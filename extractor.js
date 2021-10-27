#!/usr/bin/env node

import { globby } from 'globby';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

yargs(hideBin(process.argv))
  .option('source', {
    alias: 's',
    describe: 'source path pattern specification' 
  })
  .option('regex', {
    alias: 'r',
    describe: 'search regular expression'
  })
  .option('verbosity', {
    alias: 'v',
    describe: 'logging level (0 is quiet)'
  })
  .demandOption(['source', 'regex'], 'Please specify a source path pattern and a rearch regular expresion.')
  .default('verbosity', 1)
  .help()
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