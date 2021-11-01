#!/usr/bin/env node

import { execFile } from 'child_process';
import { globby } from 'globby';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const { argv } = yargs(hideBin(process.argv))
  .option('source', {
    string: true,
    alias: 's',
    describe: 'source path pattern specification',
  })
  .option('regex', {
    string: true,
    alias: 'r',
    describe: 'search regular expression',
  })
  .option('verbosity', {
    number: true,
    alias: 'v',
    describe: 'logging level (0 is quiet)',
  })
  .demandOption(['source', 'regex'], 'Please specify a source path pattern and a rearch regular expresion.')
  .default('verbosity', 1)
  .help();

const quietLogger = {
  errMessage(mess) {
    // eslint-disable-next-line no-console
    console.error(mess);
  },
  message() {},
  debugMessage() {},
};

const normalLogger = {

  ...quietLogger,
  message(mess) {
    // eslint-disable-next-line no-console
    console.log(mess);
  },
};

const verboseLogger = {

  ...normalLogger,
  debugMessage(mess) {
    // eslint-disable-next-line no-console
    console.log(mess);
  },
};

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

async function processFile(file, exp) {
  // eslint-disable-next-line no-unused-vars
  execFile('pdftotext', [file, '-'], { maxBuffer: 67108864 }, (error, stdout, stderr) => {
    if (error) {
      logger.errMessage(error);
    } else {
      const matched = stdout.matchAll(exp);
      if (matched) {
        const matchlist = Array.from(matched, (m) => m[0]).join('\n');
        logger.message(`${file} . . . .\n${matchlist}`);
      }
    }
  });
}

const main = async () => {
  const src = argv.source;
  const exp = new RegExp(argv.regex, 'g');
  logger.message(`Running with ${src} | ${exp}`);
  try {
    const pdfs = await globby([src, '!._*']);
    await Promise.all(pdfs.map((file) => processFile(file, exp)));
  } catch (error) {
    logger.errMessage(error);
    process.exit(1);
  }
};

main()
  .catch(
    (error) => {
      logger.errMessage(error);
      process.exit(1);
    },
  );
