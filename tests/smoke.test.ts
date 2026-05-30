import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';

describe('smoke', () => {
  it('schema contains gamification tables', () => {
    const fs = require('fs');
    const schema = fs.readFileSync('convex/schema.ts', 'utf8');
    expect(schema).toContain('userCurrencies');
    expect(schema).toContain('weeklySpinInventory');
    expect(schema).toContain('creatorQuests');
  });
});
