import EventEmitter from 'EventEmitter';
import { THREE } from 'expo-three';

class VoxelMine extends EventEmitter {
  constructor(game, opts) {
    super();

    this.game = game;
    // this.registry = game.plugins.get('voxel-registry');
    // this.hotbar = game.plugins.get('voxel-inventory-hotbar');
    this.reach = game.plugins.get('voxel-reach');
    if (!this.reach)
      throw new Error('voxel-mine requires "voxel-reach" plugin');
    // this.decals = game.plugins.get('voxel-decals');
    // this.stitch = game.plugins.get('voxel-stitch');

    // continuous (non-discrete) firing is required to mine
    // if (this.game.controls) {
    // if (this.game.controls.needs_discrete_fire !== false) {
    //   throw new Error('voxel-mine requires discreteFire:false,fireRate:100 in voxel-control options (or voxel-engine controls discreteFire:false,fireRate:100)');
    // }
    // TODO: can we just set needs_discrete_fire and fire_rate ourselves?
    this.secondsPerFire = this.game.controls.fire_rate / 1000; // ms -> s
    // } else {
    //   // server-side, game.controls unavailable, assume 100 ms TODO
    //   this.secondsPerFire = 100.0 / 1000.0;
    // }

    if (!opts) opts = {};
    if (opts.instaMine === undefined) opts.instaMine = false; // instantly mine? (if true, ignores timeToMine)
    if (opts.timeToMine === undefined) opts.timeToMine = undefined; // callback to get how long it should take to completely mine this block
    if (opts.progressTexturesPrefix === undefined)
      opts.progressTexturesPrefix = undefined; // prefix for damage overlay texture filenames; can be undefined to disable the overlay
    if (opts.progressTexturesCount === undefined)
      opts.progressTexturesCount = 10; // number of damage textures, cycles 0 to N-1, name = progressTexturesPrefix + #

    if (opts.applyTextureParams === undefined) {
      opts.applyTextureParams = texture => {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;
      };
    }

    if (opts.defaultTextureURL === undefined)
      opts.defaultTextureURL =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAARElEQVQ4y62TMQoAMAgD8/9PX7cuhYLmnAQTQZMkCdkXT7Mhb5YwHkwwNOQfkOZJNDI1MncLsO5XFFA8oLhQyYGSxMs9lwAf4Z8BoD8AAAAASUVORK5CYII=';

    this.opts = opts;

    this.instaMine = opts.instaMine;
    this.progress = 0;

    // texture overlays require three.js and textures, or voxel-decals with game.shell

    // this.texturesEnabled = !this.opts.disableOverlay && this.opts.progressTexturesPrefix !== undefined;
    // if (this.texturesEnabled && this.game.shell && !this.decals) {
    //     throw new Error('voxel-mine with game-shell requires voxel-decals to enable textures');
    // }

    this.overlay = null;
    this.setupTextures();

    this.enable();
  }

  timeToMine(target) {
    if (this.opts.timeToMine !== undefined) {
      // custom callback
      return this.opts.timeToMine(target);
    }

    // if no registry, can't lookup per-block hardness, use same for all
    if (!this.registry || !this.registry.getBlockName) return 9;

    //  from registry, get the innate difficulty of mining this block
    const blockID = this.game.getBlock(target.voxel);
    const blockName = this.registry.getBlockName(blockID);
    let hardness = this.registry.getProp(blockName, 'hardness');
    if (hardness === undefined) hardness = 1.0; // seconds

    let effectiveTool = this.registry.getProp(blockName, 'effectiveTool');
    if (effectiveTool === undefined) effectiveTool = 'pickaxe';

    // if no held item concept, just use registry hardness
    if (!this.hotbar) return hardness;

    // if hotbar is available - factor in effectiveness of currently held tool, shortens mining time
    const heldItem = this.hotbar.held();
    const toolClass = this.registry.getProp(
      heldItem !== undefined ? heldItem.item : heldItem,
      'toolClass',
    );

    let speed = 1.0;

    if (toolClass === effectiveTool) {
      //  this tool is effective against this block, so it mines faster
      speed = this.registry.getProp(
        heldItem !== undefined ? heldItem.item : heldItem,
        'speed',
      );
      if (speed === undefined) speed = 1.0;
      // TODO: if wrong tool, deal double damage?
    }

    const finalTimeToMine = Math.max(hardness / speed, 0);
    // TODO: more complex mining 'classes', e.g. shovel against dirt, axe against wood

    return finalTimeToMine;
  }

  enable() {
    this.reach.addListener(
      'mining',
      (this.onMining = target => {
        if (!target) {
          console.log('no block mined');
          return;
        }

        this.progress += 1; // incremented each fire (this.secondsPerFire)
        const progressSeconds = this.progress * this.secondsPerFire; // how long they've been mining

        const hardness = this.timeToMine(target);
        if (this.instaMine || progressSeconds >= hardness) {
          this.progress = 0;
          this.reach.emit('stop mining', target);
          this.emit('break', target);
        }

        this.updateForStage(progressSeconds, hardness);
      }),
    );

    this.reach.addListener(
      'start mining',
      (this.onStartMining = target => {
        if (!target) {
          return;
        }

        this.createOverlay(target);
      }),
    );

    this.reach.addListener(
      'stop mining',
      (this.onStopMining = target => {
        if (!target) {
          return;
        }

        // Reset this.progress if mouse released
        this.destroyOverlay();
        this.progress = 0;
      }),
    );
  }

  disable() {
    this.reach.removeListener('mining', this.onMining);
    this.reach.removeListener('start mining', this.onStartMining);
    this.reach.removeListener('stop mining', this.onStopMining);
  }

  setupTextures() {
    if (!this.texturesEnabled) {
      return;
    }

    this.progressTextures = []; // TODO: placeholders until loaded?

    this.registry.onTexturesReady(() => this.refreshTextures());
    if (this.game.materials.artPacks) {
      this.game.materials.artPacks.on('refresh', () => this.refreshTextures());
    }

    if (this.decals) {
      // add to atlas
      for (let i = 0; i < this.opts.progressTexturesCount; ++i) {
        const name = this.opts.progressTexturesPrefix + i;

        this.stitch.preloadTexture(name);

        this.progressTextures.push(name);
      }
    }
  }

  refreshTextures() {
    if (this.decals) {
    } else {
      this.progressTextures = [];
      for (let i = 0; i < this.opts.progressTexturesCount; ++i) {
        let path = this.registry.getTextureURL(
          this.opts.progressTexturesPrefix + i,
        );
        if (path === undefined) {
          // fallback to default texture if missing
          if (this.defaultTextureURL.indexOf('data:') === 0) {
            // for some reason, data: URLs are not allowed with crossOrigin, see https://github.com/mrdoob/three.js/issues/687
            // warning: this might break other stuff
            delete THREE.ImageUtils.crossOrigin;
          }
          path = this.defaultTextureURL;
        }
        this.progressTextures.push(THREE.ImageUtils.loadTexture(path));
      }
    }
  }

  createOverlay(target) {
    if (this.instaMine || !this.texturesEnabled) {
      return;
    }
    console.warn('mine: overlay', target);
    this.destroyOverlay();

    if (this.decals) {
      console.warn('mine: decals', target);

      this.decalPosition = target.voxel.slice(0);
      this.decalNormal = target.normal.slice(0);

      this.decals.add({
        position: this.decalPosition,
        normal: this.decalNormal,
        texture: this.progressTextures[0],
      });

      this.decals.update();
    } else {
      throw new Error('voxel-mine three.js support removed');
    }
  }

  // Set overlay texture based on mining progress stage
  updateForStage(progress, hardness) {
    if (!this.texturesEnabled) {
      return;
    }

    const index = Math.floor(
      progress / hardness * (this.progressTextures.length - 1),
    );
    const texture = this.progressTextures[index];

    this.setOverlayTexture(texture);
  }

  setOverlayTexture(texture) {
    if (!this.texturesEnabled || (!this.overlay && !this.decalPosition)) {
      return;
    }

    if (this.decals) {
      this.decals.change({
        position: this.decalPosition,
        normal: this.decalNormal,
        texture: texture,
      });
      this.decals.update();
    } else {
      this.opts.applyTextureParams(texture);
      this.overlay.children[0].material.map = texture;
      this.overlay.children[0].material.needsUpdate = true;
    }
  }

  destroyOverlay() {
    if (!this.texturesEnabled || (!this.overlay && !this.decalPosition)) {
      return;
    }

    if (this.decals) {
      if (this.decalPosition !== undefined)
        this.decals.remove(this.decalPosition);
      this.decals.update();
      this.decalPosition = undefined;
    } else {
      this.game.scene.remove(this.overlay);
    }

    this.overlay = null;
  }
}

module.exports.pluginInfo = {
  loadAfter: [
    'voxel-reach',
    'voxel-registry',
    'voxel-inventory-hotbar',
    'voxel-decals',
    'voxel-stitch',
  ],
};

export default VoxelMine;
