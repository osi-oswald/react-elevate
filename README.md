# react-elevate

Elevate state and props to form a unified viewmodel for a stateless component render function. Update/Read the elevated state synchronously (no need to use `this.setState()`).

## Example

```jsx
// --- Counter.jsx ---

@Render(vm => (
  <div>
    <p>Count: {vm.count}</p>
    <button onClick={() => vm.increment()}>
      Increment by {vm.amount}
    </button>
  </div>
))
export class Counter extends React.Component {
  @prop amount = 1; // getter for this.props.amount, setter for Counter.defaultProps.amount
  @state count = 0; // access this.state.count in a synchronous manner

  increment() {
    this.count += this.amount;
    // this.count is updated synchronously
    // calls setState() internally, therefore triggering a rerender
    // this.state.count might still be unchanged by the async nature of setState()
  }
}
```

### As separate files

```jsx
// --- CounterRender.jsx ---

export const CounterRender = vm =>
  <div>
    <p>Count: {vm.count}</p>
    <button onClick={() => vm.increment()}>
      Increment by {vm.amount}
    </button>
  </div>
```

```jsx
// --- Counter.js ---
import { CounterRender } from './CounterRender';

@Render(CounterRender)
class Counter extends React.Component {
  @prop amount = 1;
  @state count = 0;

  increment() {
    this.count += this.amount;
  }
}
```

### Tip
Use `React.PureComponent` instead of `React.Component` for instant performance gains.

### Testing

```jsx
test('Counter render', () => {
  expect(CounterRender({ count: 0, amount: 1 })).toMatchSnapshot();
  // can also use Counter.Render set by @Render
});

test('Counter as viewmodel', () => {
  const counter = new Counter({});
  counter.increment();
  expect(counter.count).toBe(1);
});
```

## @state

Elevate `this.state.someState` to `this.someState` and access it synchronously. Will call `this.setState()` to update `this.state.someState` and trigger a rerender. Changes to `this.state` from other sources will be synchronized back on `componentWillUpdate`.

```js
class MyComponent extends React.Component {
  @state myPrimitive = 'myInitialState';
  @state myObject = {name: 'Alice', age: 30};
  @state myArray = [0, 1, 2];

  updateMyPrimitive() {
    this.myPrimitive = 'newValue';
  }

  updateMyObject() {
    // update object in an immutable manner (especially for React.PureComponent)
    this.myObject = {...this.myObject, name: 'Bob'};

    // avoid:
    // mutate object directly -> will not trigger setState() and therefore not rerender
    this.myObject.name = 'Bob';
  }

  updateMyArray() {
    // update array in an immutable manner (especially for React.PureComponent)
    this.myArray = [...this.myArray, 3];

    // avoid:
    // mutate array directly -> will not trigger setState() and therefore not rerender
    this.myArray.push(3);

    // checkout:
    // https://vincent.billey.me/pure-javascript-immutable-array/
  }

  // note: use React.PureComponent instead
  shouldComponentUpdate(nextProps, nextState) {
    // use this.myState to access next rendered state (equal to nextState.myState)
    // use this.state.myState to access current rendered state
    return this.myState !== this.state.myState;
  }

  componentWillUpdate(nextProps, nextState) {
    // same as in shouldComponentUpdate()
  }

  componentDidUpdate(prevProps, prevState) {
    // use this.myState to access current rendered state (equal to this.state.myState)
  }
}

```

## @prop

Elevate `this.props.someProp` to `this.someProp` and set its default value if necessary.

```js
class MyComponent extends React.Component {
  @prop myProp;
  @prop myPropWithDefault = 'myDefaultValue';
  
  componentWillReceiveProps(nextProps) {
    // use this.myProp to access current prop (equal to this.props.myProp)
  }
  
  // note: use React.PureComponent instead
  shouldComponentUpdate(nextProps, nextState) {
    // use this.myProp to access current prop (equal to this.props.myProp)
    return this.myProp !== nextProps.myProp;
  }
  
  componentWillUpdate(nextProps, nextState) {
    // same as in shouldComponentUpdate()
  }
  
  componentDidUpdate(prevProps, prevState) {
    // use this.myProp to access current prop (equal to this.props.myProp)
  }
}
```

Note: When using `@prop` to set a default value, always use `this.myProp` because `this.props.myProp` will not receive the default value set by `@prop` until after the first render.

## @Render

Sets `this.render` (and `MyComponent.Render`) as stateless render function with the component instance as input / viewmodel.

```js
@Render(MyComponentRender)
class MyComponent extends React.Component {
  /* ... */

  // set by @Render
  render() {
    return MyComponentRender(this);
  }

  // set by @Render
  static Render = MyComponentRender;
}
```

## @child / @children
```js
class MyComponent extends React.Component {
  @child myChild; // getter for `React.Children.toArray(this.props.children)[0]`
  @children allMyChildren; // getter for `React.Children.toArray(this.props.children)`
  
  @child(findChild) mySpecialChild; // getter for `React.Children.toArray(this.props.children).find(findChild)`
  @children(filterChildren) allMySpecialChildren; // getter for `React.Children.toArray(this.props.children).filter(filterChildren)`
}
```