import { execute } from '../../src/interpreter';
import { parse } from '../../src/parser';
import { string } from '../../src/util';

export function testProgram(name: string, program: string) {
  describe(name, () => {
    it('returns correct value', () => {
      const theirResult = eval(program);
      const ourResult = execute(parse(program));
      expect(ourResult.type.toLowerCase())
        .withContext(JSON.stringify(ourResult, undefined, 2))
        .toBe(typeof theirResult);
      expect(string(ourResult)).toBe(String(theirResult));
    });
  });
}
