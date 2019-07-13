import { testProgram } from './util/programtest';

testProgram(
  'memoized fib',
  `
var times = 0;
var map = {
    1: 0,
    2: 1
};

function fib(a) {
    times = times + 1;

    if (map[a] == null) {
        map[a] = fib(a - 1) + fib(a - 2);
    }

    return map[a];
}
fib(7);
fib(7);
times;
`
);
