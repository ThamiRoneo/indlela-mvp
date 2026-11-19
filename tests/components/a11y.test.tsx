import renderer from 'react-test-renderer';
import { act } from 'react';
import React from 'react';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Toggle } from '../../components/Toggle';
import { FilterChip } from '../../components/FilterChip';
import { ListItem } from '../../components/ListItem';
import { BottomNav } from '../../components/BottomNav';
import { TopAppBar } from '../../components/TopAppBar';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { Card } from '../../components/Card';

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function linearize(c: number): number {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const lin = { r: linearize(r), g: linearize(g), b: linearize(b) };
  return 0.2126 * lin.r + 0.7152 * lin.g + 0.0722 * lin.b;
}

function contrastRatio(a: string, b: string): number {
  const L1 = luminance(a);
  const L2 = luminance(b);
  const light = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

// Collect every host (string-type) element that has an onPress/onClick handler (a touch target).
function collectTouchTargets(tree: any): any[] {
  return tree.root.findAll((node: any) => {
    const p = node.props || {};
    return typeof node.type === 'string' && (!!p.onPress || !!p.onClick);
  });
}

function render(element: React.ReactElement): any {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
}

function mount(element: React.ReactElement): any {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
}

function styleDimension(style: any): number | null {
  if (!style) return null;
  const arr = Array.isArray(style) ? style : [style];
  for (const s of arr) {
    if (!s || typeof s !== 'object') continue;
    if (s.minHeight != null) return s.minHeight;
    if (s.minWidth != null) return s.minWidth;
    if (s.height != null) return s.height;
    if (s.width != null) return s.width;
  }
  return null;
}

const touchMin = tokens.size.touchMin; // 48

describe('T-NFR-4 Color contrast (WCAG AA >= 4.5:1)', () => {
  it('primary body text on background meets contrast', () => {
    expect(contrastRatio(tokens.color.text, tokens.color.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('secondary body text on background meets contrast', () => {
    expect(contrastRatio(tokens.color.textSecondary, tokens.color.background)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('T-NFR-5 Tappable targets minimum 48x48px', () => {
  it('Button touch target is at least 48px', () => {
    const tree = render(<Button onPress={() => {}}>Press me</Button>);
    const targets = collectTouchTargets(tree);
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) {
      const dim = styleDimension((t.props as any).style);
      expect(dim).toBeGreaterThanOrEqual(touchMin);
    }
  });

  it('Toggle touch target is at least 48px', () => {
    const tree = render(<Toggle value={false} onChange={() => {}} />);
    const targets = collectTouchTargets(tree);
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) {
      const dim = styleDimension((t.props as any).style);
      expect(dim).toBeGreaterThanOrEqual(touchMin);
    }
  });

  it('FilterChip touch target is at least 48px', () => {
    const tree = render(<FilterChip selected={false} label="Chip" onPress={() => {}} />);
    const targets = collectTouchTargets(tree);
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) {
      const dim = styleDimension((t.props as any).style);
      expect(dim).toBeGreaterThanOrEqual(touchMin);
    }
  });

  it('ListItem touch target is at least 48px', () => {
    const tree = render(<ListItem label="Item" onPress={() => {}} />);
    const targets = collectTouchTargets(tree);
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) {
      const dim = styleDimension((t.props as any).style);
      expect(dim).toBeGreaterThanOrEqual(touchMin);
    }
  });

  it('BottomNav tabs are at least 48px', () => {
    const tree = render(<BottomNav activeTab="Home" onTabPress={() => {}} />);
    const targets = collectTouchTargets(tree);
    expect(targets.length).toBe(5);
    for (const t of targets) {
      const dim = styleDimension((t.props as any).style);
      expect(dim).toBeGreaterThanOrEqual(touchMin);
    }
  });

  it('TopAppBar back button is at least 48px', () => {
    const tree = render(<TopAppBar title="Title" onBack={() => {}} />);
    const targets = collectTouchTargets(tree);
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) {
      const dim = styleDimension((t.props as any).style);
      expect(dim).toBeGreaterThanOrEqual(touchMin);
    }
  });

  it('Modal buttons are at least 48px', () => {
    const tree = render(
      <Modal title="T" text="x" buttons={[{ label: 'Ok', onPress: () => { } }]} />,
    );
    const targets = collectTouchTargets(tree);
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) {
      const dim = styleDimension((t.props as any).style);
      expect(dim).toBeGreaterThanOrEqual(touchMin);
    }
  });

  it('EmptyState action button is at least 48px', () => {
    const tree = render(<EmptyState text="t" actionLabel="Act" onAction={() => {}} />);
    const targets = collectTouchTargets(tree);
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) {
      const dim = styleDimension((t.props as any).style);
      expect(dim).toBeGreaterThanOrEqual(touchMin);
    }
  });
});

describe('T-NFR-6 Labels on all inputs; body text minimum 14px', () => {
  it('TextInput has an accessibility label', () => {
    const tree = mount(<TextInput placeholder="Email" />);
    const inputs = tree.root.findAllByType('input') as any[];
    expect(inputs.length).toBe(1);
    expect(inputs[0].props.accessibilityLabel).toBeDefined();
    expect(String(inputs[0].props.accessibilityLabel).length).toBeGreaterThan(0);
  });

  it('Body text font size is at least 14px', () => {
    const tree = mount(
      <Card title="Job" company="Co" wage={150} transportCost={90} netGain={60} />,
    );
    const texts = tree.root.findAllByType('span') as any[];
    const styled = texts.filter((t) => (t.props as any).style?.fontSize != null);
    for (const t of styled) {
      const sz = (t.props as any).style.fontSize;
      if (sz === tokens.font.caption.size) continue; // caption size (12px) is allowed by design
      expect(sz).toBeGreaterThanOrEqual(tokens.font.body.size);
    }
  });
});
