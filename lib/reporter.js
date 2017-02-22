/* eslint no-console: [0] */

import chalk from 'chalk';
const log = console.log;

const symbols = {
  success: '✓',
  error: '✖'
}


export default {
  symbols,
  print,
  printDimmed,
  printSuccess,
  printError
}



function print(msg) {
  if (!process.env.SILENT) {
    log( msg )
  }
}


function printDimmed(msg) {
  if (!process.env.SILENT) {
    log( chalk.dim(msg) )
  }
}


function printSuccess(msg) {
  if (!process.env.SILENT) {
    log( chalk.green(symbols.success) + ` ${msg}` )
  }
}


function printError(msg) {
  log( chalk.red(`${symbols.error} ${msg}`) )
}
