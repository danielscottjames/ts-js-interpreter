import {execute} from '../../src/interpreter';
import {parse} from '../../src/parser';
import {string} from '../../src/util';

export function testProgram(name: string, program: string) {
    describe(name, () => {
        it('returns correct value', () => {
            const theirResult = eval(program);
            const ourResult = execute(parse(program));
            console.log(theirResult);
            console.log(ourResult);
            expect(typeof theirResult).toBe(ourResult.type.toLowerCase());
            expect(String(theirResult)).toBe(string(ourResult))
        });
    });
}