import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('schema contains gamification tables', () => {
    // lightweight smoke checks that schema file exists and contains key table names
    const fs = require('fs');
    const schema = fs.readFileSync('convex/schema.ts', 'utf8');
    expect(schema).toContain('userCurrencies');
    expect(schema).toContain('weeklySpinInventory');
    expect(schema).toContain('creatorQuests');
  });
});
