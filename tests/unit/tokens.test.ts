import { tokens } from '../../theme/tokens';

describe('T-SETUP-1', () => {
  it('Tokens match Section 7.1 exactly', () => {
    expect(tokens.color.primary).toBe('#1a73e8');
    expect(tokens.color.secondary).toBe('#34a853');
    expect(tokens.color.background).toBe('#ffffff');
    expect(tokens.color.surface).toBe('#f8f9fa');
    expect(tokens.color.text).toBe('#202124');
    expect(tokens.color.textSecondary).toBe('#5f6368');
    expect(tokens.color.error).toBe('#ea4335');
    expect(tokens.color.success).toBe('#34a853');
    expect(tokens.color.warning).toBe('#fbbc04');
    expect(tokens.color.border).toBe('#dadce0');
    expect(tokens.color.disabled).toBe('#bdc1c6');
    expect(tokens.font.h1.size).toBe(24);
    expect(tokens.font.h1.lineHeight).toBe(32);
    expect(tokens.font.body.size).toBe(14);
    expect(tokens.font.body.lineHeight).toBe(20);
    expect(tokens.space.xs).toBe(4);
    expect(tokens.space.sm).toBe(8);
    expect(tokens.space.md).toBe(16);
    expect(tokens.space.lg).toBe(24);
    expect(tokens.space.xl).toBe(32);
    expect(tokens.size.touchMin).toBe(48);
    expect(tokens.icon.size).toBe(24);
  });
});
