/* eslint no-console: [0] */

'use strict';

const chalk = require('chalk');
const log = console.log;

const symbols = {
  success: '✓',
  error: '✖'
}


module.exports = {
  symbols,
  print,
  printDimmed,
  printSuccess,
  printError
}



function print(msg) {
  log( msg )
}


function printDimmed(msg) {
  log( chalk.dim(msg) )
}


function printSuccess(msg) {
  log( chalk.green(symbols.success) + ` ${msg}` )
}


function printError(msg) {
  log( chalk.red(`${symbols.error} ${msg}`) )
}
