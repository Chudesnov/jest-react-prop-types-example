const react = require('react');
const propTypes = require('prop-types');

class Component extends react.Component {
    render() {
        return react.createElement('div');
    }
}

Component.propTypes = {
    test: propTypes.bool.isRequired
}

module.exports = function() { return react.createElement(Component, {}, null) };