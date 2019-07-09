import {testProgram} from './support/programtest';

testProgram('fib', `
function fib(a) {
    if (a < 2) {
        return a;
    }

    return fib(a - 1) + fib(a - 2);
}
fib(7);`);