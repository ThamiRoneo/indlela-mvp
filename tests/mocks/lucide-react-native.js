const React = require('react');

const IconMock = React.forwardRef((props, ref) => {
  return React.createElement('span', { ...props, ref }, props.children);
});

// Proxy that returns IconMock for any named export
const handler = {
  get(target, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return IconMock;
    return IconMock;
  },
};

module.exports = new Proxy({}, handler);