import Ember from 'ember';
import DirectableComponentMixin from 'ember-theater/mixins/ember-theater/director/directable-component';
import TransitionMixin from 'ember-theater/mixins/ember-theater/director/transition';
import TransitionObserverMixin from 'ember-theater/mixins/ember-theater/director/transition-observer';
import multitonService from 'ember-theater/macros/ember-theater/multiton-service';
import configurable, { deepConfigurable, deepArrayConfigurable } from 'ember-theater/macros/ember-theater/configurable';
import { HookMixin } from 'ember-hook';

const {
  Component,
  computed,
  get,
  observer,
  on
} = Ember;

const { inject: { service } } = Ember;
const { Handlebars: { SafeString } } = Ember;

const configurablePriority = [
  'directable.attrs',
  'directable.attrs.fixture',
  'config.attrs.director.backdrop',
  'config.attrs.globals'
];

export default Component.extend(DirectableComponentMixin, HookMixin, TransitionMixin, TransitionObserverMixin, {
  attributeBindings: ['captionTranslation:alt'],
  classNames: ['et-backdrop'],
  hook: 'backdrop-direction',
  tagName: 'img',

  translator: service('ember-theater/translator'),

  config: multitonService('ember-theater/config', 'theaterId'),

  caption: configurable(configurablePriority, 'caption'),
  src: configurable(configurablePriority, 'src'),
  transitions: deepArrayConfigurable(configurablePriority, 'directable.attrs.transitions', 'transition'),

  captionTranslation: computed('fixture.id', 'caption', {
    get() {
      const translation = get(this, 'caption') || `backdrops.${get(this, 'fixture.id')}`;

      return get(this, 'translator').translate(translation);
    }
  }).readOnly(),

  styles: computed('src', {
    get() {
      return [`background-image: url("${get(this, 'src')}");`];
    }
  }).readOnly()
});
