import { execute } from './interpreter';
import { parse } from './parser';
import * as fs from 'fs';

// Either pass in a file name, or pipe the program via stdin (file descriptor 0)
const program = fs
  .readFileSync(process.argv[3] || process.argv[2] || 0)
  .toString();

// console.log(JSON.stringify(parse(program), undefined, 2));
console.log(execute(parse(program)));
