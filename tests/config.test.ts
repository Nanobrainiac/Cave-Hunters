import { describe, expect, it } from 'vitest';
import { RULES } from '../src/data/config';
describe('confirmed component counts', () => {
 it('contains 30 rooms plus a separate Exit', () => expect(Object.values(RULES.rooms).reduce((a,b)=>a+b,0 as number)).toBe(30));
 it('contains 54 tokens', () => expect(Object.values(RULES.tokens).reduce((a,b)=>a+b,0 as number)).toBe(54));
 it('uses the approved die and victory threshold', () => { expect(RULES.die).toEqual([0,0,1,1,2,2]); expect(RULES.relicsToWin).toBe(2); });
});
