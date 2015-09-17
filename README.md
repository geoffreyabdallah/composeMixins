# composeMixins
Function to compose mixins into higher order components in React

# Purpose
This function hopes to address some of the mixin issues with ES6 Class syntax. The idea was inspired by [this blog post](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) by Dan Abramov of Redux and React Router. The main idea of this function is to create higher order components out of Mixins that will nest the initial Component. For Example:

```javascript
var SomeComponent = React.createClass({

  mixins: [MixinOne, MixinTwo],
  
  render: function(){
    return <div />;
  }

});
```

conceptually becomes:

```javascript
class SomeComponent extends React.Component {

  render() {
    return (
      <MixinOne>
        <MixinTwo>
          <div />
        </MixinTwo>
      </MixinOne>
    );
  }
};
```

How is this acheived? The composeMixins function will take in a component to be wrapped and an array of Mixins. It then executes reduce on the Component and the mixins to return a nested component, where the mixins are transformed into react components - and all of their props/state/methods (non reserved React methods only) are passed down as props to the nested component (accessible by what is specified in the name key ie { name: 'mixinOne', mixin: MixinOne} would be accessed by this.props.mixinOne).

```javascript
class SomeComponent extends React.Component {

  render() {
    return <div />
  }
};

SomeComponent = composeMixins(SomeComponent, [{ name: 'mixinOne', mixin: MixinOne }, { name: 'mixinTwo', mixin: MixinTwo}]);
```

If a mixin requires a function or state, you can pass in a functions object that will pass the function to the mixin, as well as create a stateful component if necessary - which will then pass the state down to the nested component. An example of this would be a Mixin responsible for detecting if a component should be hidden or shown. We would initiliaze the state on the mixin, pass down a function meant to setState on the mixin as props to the component. The nested component would then call that function off of props with any changes necessary to send up the the Mixin state, the mixin would update and thus rerender the nested component.

```javascript
class SomeComponent extends React.Component {

  toggleOpenOrClose = () => {
    const { setLocalComponentState, localComponentState } = this.props.mixinTwo;
    setLocalComponentState({ open: !localComponentState.open });
  }

  render() {
    return <div onClick={this.toggleOpenOrClose} />
  }
};

SomeComponent = composeMixins(SomeComponent, [{ name: 'mixinOne', mixin: MixinOne }, { name: 'mixinTwo', mixin: MixinTwo, functions: {
  //For Stateful Components
  getInitialState: function() {
    var state = {
      localComponentState: {
        open: false
      }
    };
    if (MixinTwo.getInitialState) return Object.assign(state, { mixinState: MixinTwo.getInitialState()}) //merge states if necessary
    return state;
  },
  
  setLocalComponentState: function(update) {
    this.setState({ localComponentState: React.addons.update(this.state.localComponentState, { $merge: update })});
    //or if using immutable.js this.setState({ localComponentState: this.state.localComponentState.merge(update) });
    //getInitialState/setLocalComponentState - or whatever you want to call it, are not abstracted away to allow user full control of state implementation
  },
  
  foo: function() { //expected function of mixin
    this.setLocalComponentState({ open: false });
  }
}}]);
```

End Goals/Thoughts:

Is this the best solution? Probably not, but I figured it was a decent enough idea to get out there. So take it, mock it, destroy it, build it up again even better!
