import Ember from 'ember';
import gatherModules from 'ember-theater/utils/gather-modules';

const { get } = Ember;
const { String: { camelize } } = Ember;

export function initialize(container, application) {
  const directions = gatherModules('ember-theater\/directions');

  directions.forEach((direction, directionName) => {
    application.register(`direction:${directionName}`, direction, { singleton: false });
    registerDirectionProxy(application, directionName);
  });
}

function registerDirectionProxy(application, directionName) {
  const directionProxy = function directionProxy(...args) {
    // the scene is the context here 
    const factory = get(this, 'container').lookupFactory(`direction:${directionName}`);

    return this.proxyDirection(directionName, factory, args);
  };

  application.register(`direction:${directionName}-proxy`, directionProxy, { instantiate: false });
  application.inject('scene', camelize(directionName), `direction:${directionName}-proxy`);
};

export default {
  name: 'register-directions',
  initialize: initialize
};