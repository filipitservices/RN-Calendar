import { appearanceOverride } from './colors';

describe('appearanceOverride', () => {
  it('maps stored light/dark and treats anything else as follow-system', () => {
    expect(appearanceOverride(undefined)).toBe('auto');
    expect(appearanceOverride('light')).toBe('light');
    expect(appearanceOverride('dark')).toBe('dark');
    expect(appearanceOverride('auto')).toBe('auto');
    expect(appearanceOverride('')).toBe('auto');
  });
});
