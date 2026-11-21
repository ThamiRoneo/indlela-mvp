import { readFileSync } from 'fs';
import { join } from 'path';

describe('T-INT-5 View privacy policy', () => {
  it('returns static privacy policy content', async () => {
    const content = readFileSync(join(process.cwd(), 'app/privacy-policy.tsx'), 'utf8');

    expect(content).toContain('Privacy Policy');
    expect(content).toContain('Data we collect');
    expect(content).toContain('never shared');
    expect(content).toContain('18');
  });
});
