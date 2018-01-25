it('test case', () => {
    const ex = require('./example');
    const { render } = require('react-dom');
    const { createElement } = require('react');

    const container = document.createElement('div');

    render(createElement(ex, {}, null), container);
})