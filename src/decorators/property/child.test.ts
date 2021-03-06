import * as React from 'react';
import { child as childDecorator } from './children';

class TestComponent extends React.Component<{ children? }> {
  myChild;
}

describe('@child', () => {
  let Component: typeof TestComponent;

  beforeEach(() => {
    Component = class extends TestComponent {};
  });

  describe('single child', () => {
    beforeEach(() => {
      childDecorator(Component.prototype, 'myChild');
    });

    it('gets child', () => {
      const component = new Component({ children: 'myChild' });
      expect(component.myChild).toBe('myChild');
    });

    it('gets child from array', () => {
      const component = new Component({ children: ['myChild'] });
      expect(component.myChild).toBe('myChild');
    });

    it('gets no child', () => {
      const component = new Component({});
      expect(component.myChild).toBeUndefined();
    });
  });

  it('works without findChild', () => {
    childDecorator<TestComponent>()(Component.prototype, 'myChild');
  });

  it('parameter findChild must be a function', () => {
    expect(() =>
      childDecorator<TestComponent>(false as any)(
        Component.prototype,
        'myChild'
      )
    ).toThrow('parameter findChild must be a function');
  });

  describe('find child', () => {
    beforeEach(() => {
      childDecorator<TestComponent>(c => c === 'myChild')(
        Component.prototype,
        'myChild'
      );
    });

    it('finds child from array', () => {
      const component = new Component({
        children: ['myOtherChild', 'myChild']
      });
      expect(component.myChild).toBe('myChild');
    });

    it('finds no child from array', () => {
      const component = new Component({ children: ['myOtherChild'] });
      expect(component.myChild).toBeUndefined();
    });
  });
});
