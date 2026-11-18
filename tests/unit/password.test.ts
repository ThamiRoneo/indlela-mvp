import { isValidPassword } from '../../lib/rules/password';

describe('T-AUTH-1 Password validation', () => {
  it('passes a valid password with 8+ chars and a number', () => {
    expect(isValidPassword('abcdefg1')).toBe(true);
  });

  it('fails a password with no number', () => {
    expect(isValidPassword('abcdefgh')).toBe(false);
  });

  it('fails a password that is too short', () => {
    expect(isValidPassword('abc1')).toBe(false);
  });
});
