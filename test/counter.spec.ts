import { testProgram } from './util/programtest';

testProgram(
  'counter',
  `
function makeCounter() {
    var count = 0;
    return function() {
        count = count + 1;
        return count;
    }
}
var counter = makeCounter();
counter();
counter();
`
);
