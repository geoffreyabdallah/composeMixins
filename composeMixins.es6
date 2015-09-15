import { createClass } from 'react';

export function composeMixins(Component, mixins) {
  
  const reactReserved = {
    componentDidMount: 'componentDidMount',
    getInitialState: 'getInitialState',
    componentWillMount: 'componentWillMount',
    componentWillReceiveProps: 'componentWillReceiveProps',
    shouldComponentUpdate: 'shouldComponentUpdate',
    componentWillUpdate: 'componentWillUpdate',
    componentDidUpdate: 'componentDidUpdate',
    componentWillUnmount: 'componentWillUnmount',
    getChildContext: 'getChildContext',
    childContextTypes: 'childContextTypes',
    contextTypes: 'contextTypes',
    propTypes: 'propTypes',
    defaultProps: 'defaultProps'
  };

  const ComposedComponent = mixins.reduce((PreviousComponent, mixinInfo, index) => {
    const { name, mixin, functions } = mixinInfo;
    return createClass(Object.assign({

      render: function() {
        const { localComponentState, mixinState } = this.state || {};
        const properties = functions ? Object.keys(mixin).concat(Object.keys(functions)) : Object.keys(mixin);
        const props = {
          [name] : properties.reduce((propsToReturn, key) => {
            if(!reactReserved[key]){
              let value = mixin[key] || functions[key];
              if (value) propsToReturn[key] = typeof value === 'function' ? value.bind(this) : value;
            }
            return propsToReturn;
        }, { localComponentState, mixinState}) }

        return <PreviousComponent {...this.props} {...props} />
      }

    }, mixin, functions));

  }, Component);

  return ComposedComponent;
};