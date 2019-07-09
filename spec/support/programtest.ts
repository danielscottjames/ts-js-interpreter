import {execute} from '../../interpreter';
import {parse} from '../../parser';
import {string} from '../../util';

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