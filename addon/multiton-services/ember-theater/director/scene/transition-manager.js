import Ember from 'ember';
import animate from 'ember-theater/utils/ember-theater/animate';
import multitonService from 'ember-theater/macros/ember-theater/multiton-service';
import TheaterIdMixin from 'ember-theater/mixins/ember-theater/theater-id';

const {
  get,
  getOwner,
  isPresent
} = Ember;

const { run: { later } } = Ember;

export default Ember.Object.extend(TheaterIdMixin, {
  config: multitonService('ember-theater/config', 'theaterId'),
  layerManager: multitonService('ember-theater/director/layer-manager', 'theaterId'),
  saveStateManager: multitonService('ember-theater/save-state-manager', 'theaterId'),
  sceneManager: multitonService('ember-theater/director/scene-manager', 'theaterId'),
  stageManager: multitonService('ember-theater/director/stage-manager', 'theaterId'),

  toScene(id, options) {
    this._abortPreviousScene();

    const $director = Ember.$('.et-director');
    const duration = get(options, 'transitionOut.duration') || get(this, 'config.attrs.director.scene.transitionOut.duration');
    const effect = get(options, 'transitionOut.effect') || get(this, 'config.attrs.director.scene.transitionOut.effect');

    animate($director, effect, { duration }).then(() => {
      this._transitionScene(id, options);

      later(() => $director.removeAttr('style'));
    });
  },

  _abortPreviousScene() {
    const script = get(this, 'sceneManager.script');

    if (isPresent(script)) { script.abort(); }
  },

  _transitionScene(id, options) {
    const scene = this._buildScene(id, options);
    const script = getOwner(this).lookup('script:main').create({ theaterId: get(this, 'theaterId') });

    this._clearStage();
    this._setSceneManager(scene, script, options);
    this._updateAutosave(scene, options);

    scene.start(script);
  },

  _buildScene(id, options) {
    const factory = getOwner(this).lookup(`scene:${id}`);
    const theaterId = get(this, 'theaterId');

    return factory.create({
      id,
      options,
      theaterId
    });
  },

  _clearStage() {
    get(this, 'stageManager').clearDirectables();
    get(this, 'layerManager').clearFilters();
  },

  _setSceneManager(scene, script, options) {
    const sceneManager = get(this, 'sceneManager');
    const isLoading = get(options, 'isLoading');

    sceneManager.setScene(scene, script);
    sceneManager.setIsLoading(isLoading);
    sceneManager.resetSceneRecord(isLoading);
  },

  _updateAutosave: async function(scene, options) {
    if (get(options, 'autosave') === false || get(this, 'config.attrs.director.scene.autosave') === false) { return; }

    const saveStateManager = get(this, 'saveStateManager');
    const autosave = await get(saveStateManager, 'autosave');

    saveStateManager.appendActiveState({
      sceneId: get(scene, 'id'),
      sceneName: get(scene, 'name') || get(scene, 'id')
    });

    saveStateManager.updateRecord(autosave);
  }
});
