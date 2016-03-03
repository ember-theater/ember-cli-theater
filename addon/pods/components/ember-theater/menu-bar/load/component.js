import layout from './template';
import MenuBarControl from 'ember-theater/pods/components/ember-theater/menu-bar/control/component';

export default MenuBarControl.extend({
  layout,
  type: 'load',
  componentPath: 'ember-theater/menu-bar/load/menu'
});
