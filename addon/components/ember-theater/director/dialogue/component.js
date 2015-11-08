import Ember from 'ember';
import layout from './template';
import animate from 'ember-theater/utils/animate';

const {
  computed,
  get,
  inject,
  on
} = Ember;

export default Ember.Component.extend({
  classNameBindings: ['line.class'],
  classNames: ['et-dialogue'],
  currentText: Ember.A(),
  emberTheaterTranslate: inject.service(),
  layout: layout,
  store: inject.service(),

  handleautoResolve: on('didInitAttrs', function() {
    if (this.get('autoResolve')) {
      this.resolveLine();
    }
  }),

  resolveLine() {
    Ember.$('body').off('.speak');
    this.get('line.resolve')();
    this.attrs.destroyDirectable();
  },

  character: computed('line.character', {
    get() {
      return this.get('store').peekRecord('ember-theater-character', this.get('line.character'));
    }
  }).readOnly(),

  displayName: computed('line.displayName', {
    get() {
      const displayName = this.get('line.displayName');

      return this.get('emberTheaterTranslate').translate(displayName);
    }
  }).readOnly(),

  name: computed('character.name', 'displayName', {
    get() {
      const displayName = this.get('displayName');

      if (displayName) { return displayName; }

      return this.get('emberTheaterTranslate').translate(
        this.get('character.name'),
        `characters.${this.get('line.character')}`
      );
    }
  }).readOnly(),

  text: computed('line.text', {
    get() {
      const line = this.get('line');
      const text = get(line, 'text');

      return this.get('emberTheaterTranslate').translate(
        text,
        line
      );
    }
  }).readOnly(),

  textSpeed: computed('rapidText', 'line.speed', 'character.textSpeed', {
    get() {
      if (this.get('rapidText')) { return 0; }

      const lineSpeed = this.get('line.speed');
      if (lineSpeed) { return lineSpeed; }

      const characterSpeed = this.get('character.textSpeed');
      if (characterSpeed) { return characterSpeed; }

      return 30;
    }
  }).readOnly(),

  actions: {
    completePage() {
      this.set('pageCompleted', true);
    },

    completeText() {
      animate(this.element, { opacity: 0 }, { duration: 100 }).then(() => {
        this.resolveLine();
      });
    },

    turnPage() {
      this.set('triggerPageTurn', false);
    }
  }
});