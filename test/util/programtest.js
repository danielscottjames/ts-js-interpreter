"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interpreter_1 = require("../../interpreter");
var parser_1 = require("../../parser");
var util_1 = require("../../util");
function testProgram(name, program) {
    describe(name, function () {
        it('returns correct value', function () {
            var theirResult = eval(program);
            var ourResult = interpreter_1.execute(parser_1.parse(program));
            console.log(theirResult);
            console.log(ourResult);
            expect(typeof theirResult).toBe(ourResult.type.toLowerCase());
            expect(String(theirResult)).toBe(util_1.string(ourResult));
        });
    });
}
exports.testProgram = testProgram;
