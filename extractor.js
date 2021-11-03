#!/usr/bin/env node

import { execFile } from 'child_process';
import util from 'util';
import { globby } from 'globby';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const aExecFile = util.promisify(execFile);

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
  .demandOption(['source', 'regex'], 'Please specify a source path pattern and a search regular expresion.')
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
  const { stdout } = await aExecFile('pdftotext', [file, '-'], { maxBuffer: 67108864 });
  const matched = stdout.matchAll(exp);
  if (matched) {
    const matchlist = Array.from(matched, (m) => m[0]).join('\n');
    logger.message(`${file} . . . .\n${matchlist}`);
  } else {
    logger.debugMessage(`  (No matches in ${file})`);
  }
}

const main = async () => {
  const src = argv.source;
  const exp = new RegExp(argv.regex, 'g');
  logger.debugMessage(`Running with ${src} | ${exp}`);
  try {
    const pdfs = await globby([src, '!._*']);
    logger.debugMessage('Starting search------------------');
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
