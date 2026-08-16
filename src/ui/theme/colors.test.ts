import { appearanceOverride } from './colors';

describe('appearanceOverride', () => {
  it('follows the system when nothing is stored', () => {
    expect(appearanceOverride(undefined)).toBe('auto');
  });

  it('maps an explicit stored choice', () => {
    expect(appearanceOverride('light')).toBe('light');
    expect(appearanceOverride('dark')).toBe('dark');
  });

  it('treats unrecognised values as follow-system', () => {
    expect(appearanceOverride('auto')).toBe('auto');
    expect(appearanceOverride('')).toBe('auto');
  });
});
