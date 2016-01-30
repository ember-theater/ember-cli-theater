import Ember from 'ember';
import multitonService from 'ember-theater/macros/ember-theater/multiton-service';

import {
  keyDown,
  EKMixin,
  EKOnInsertMixin
} from 'ember-keyboard';

const {
  Component,
  K,
  get,
  isPresent,
  on,
  set
} = Ember;

export default Component.extend(EKMixin, EKOnInsertMixin, {
  keyboardFirstResponder: true,
  keyboardLaxPriority: true,
  classNames: ['et-menu-bar-control-icon'],
  tagName: 'button',

  config: multitonService('ember-theater/config', 'theaterId'),

  setupFocusKeystroke: on('init', function() {
    const type = get(this, 'type');
    const keys = get(this, `config.attrs.menuBar.${type}.keys.open`);

    keys.forEach((key) => this.on(keyDown(key), (event) => {
      this.toggleOpen();
      event.preventDefault();
    }));
  }),

  initializeFilter: on('init', function() {
    const theaterId = get(this, 'theaterId');
    const filter = get(this, 'container').lookupFactory('direction:filter').create({
      theaterId
    });

    set(this, 'filter', filter);
  }),

  toggleOpen: on('click', 'touchEnd', function() {
    const config = get(this, 'config.attrs.menuBar');

    this.toggleProperty('isOpen');

    const resolve = () => {
      get(this, 'filter').perform(K, get(config, 'innerEffect.effect'), {
        duration: get(config, 'innerEffect.duration'),
        iterations: 'infinite'
      });
    };

    get(this, 'filter').perform(resolve, get(config, 'transitionIn.effect'), {
      duration: get(config, 'transitionIn.duration')
    });
  }),

  startHovering: on('focusIn', 'mouseEnter', function() {
    if (isPresent(this.startHoverEffect)) {
      this.startHoverEffect();
    }
  }),

  stopHovering: on('focusOut', 'mouseLeave', function() {
    if (isPresent(this.stopHoverEffect)) {
      this.stopHoverEffect();
    }
  }),

  actions: {
    closeMenu() {
      const config = get(this, 'config.attrs.menuBar');

      set(this, 'isOpen', false);
      get(this, 'filter').perform(K, get(config, 'transitionOut.effect'), {
        duration: get(config, 'transitionOut.duration'),
        destroy: true
      });
    }
  }
});
