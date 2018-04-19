const { EventEmitter } = require('fbemitter');

module.exports = (game, opts) => new Use(game, opts);

module.exports.pluginInfo = {
  loadAfter: ['voxel-reach', 'voxel-registry', 'voxel-inventory-hotbar'],
};

class Use extends EventEmitter {
  constructor(game, opts) {
    super();

    this.game = game;

    //// TODO: Fix this nonsense
    return;

    // this.reach = game.plugins.get('voxel-reach');
    // if (!this.reach) throw new Error('voxel-use requires "voxel-reach" plugin');
    //
    // this.registry = game.plugins.get('voxel-registry');
    // if (!this.registry) throw new Error('voxel-use requires "voxel-registry" plugin');
    //
    // this.inventoryHotbar = game.plugins.get('voxel-inventory-hotbar');
    // if (!this.inventoryHotbar) throw new Error('voxel-use requires "voxel-inventory-hotbar" plugin'); // TODO: move held to voxel-carry?

    this.enable();
  }

  enable() {
    this.reach.on(
      'use',
      (this.onInteract = target => {
        // 1. block interaction
        if (target && target.voxel && !this.game.buttons.crouch) {
          const clickedBlockID = this.game.getBlock(target.voxel); // TODO: should voxel-reach get this?
          const clickedBlock = this.registry.getBlockName(clickedBlockID);

          const props = this.registry.getBlockProps(clickedBlock);
          if (props.onInteract) {
            // this block handles its own interaction
            // TODO: redesign this? cancelable event?
            const preventDefault = props.onInteract(target);
            if (preventDefault) return;
          }
        }

        // 2. use items in hand
        const held = this.inventoryHotbar.held();

        if (held && held.item) {
          const props = this.registry.getItemProps(held.item);
          if (props && props.onUse) {
            // 2a. use items

            const ret = props.onUse(held, target);
            if (typeof ret === 'undefined') {
              // nothing
            } else if (typeof ret === 'number' || typeof ret === 'boolean') {
              // consume this many
              const consumeCount = ret | 0;
              this.inventoryHotbar.takeHeld(consumeCount);
            } else if (typeof ret === 'object') {
              // (assumed ItemPile instance (TODO: instanceof? but..))
              // replace item - used for voxel-bucket
              // TODO: handle if item count >1? this replaces the whole pile
              this.inventoryHotbar.replaceHeld(ret);
            }
          } else if (this.registry.isBlock(held.item)) {
            // 2b. place itemblocks
            const newHeld = this.useBlock(target, held);
            this.inventoryHotbar.replaceHeld(newHeld);
            this.emit('usedBlock', target, held, newHeld);
          }
        } else {
          console.log('waving');
        }
      }),
    );
  }

  // place a block on target and decrement held
  useBlock(target, held) {
    if (!target) {
      // right-clicked air with a block, does nothing
      // TODO: allow 'using' blocks when clicked in air? (no target) (see also: voxel-skyhook)
      console.log('waving block');
      return held;
    }

    // test if can place block here (not blocked by self), before consuming inventory
    // (note: canCreateBlock + setBlock = createBlock, but we want to check in between)
    if (!this.game.canCreateBlock(target.adjacent)) {
      console.log('blocked');
      return held;
    }

    const taken = held.splitPile(1);

    // clear empty piles (wart due to itempile mutability, and can't use takeHeld here
    // since held may not necessarily come from the hotbar - if someone else calls us)
    if (held.count === 0) held = undefined;

    if (taken === undefined) {
      console.log('nothing in this inventory slot to use');
      return held;
    }

    const currentBlockID = this.registry.getBlockIndex(taken.item);
    this.game.setBlock(target.adjacent, currentBlockID);
    return held;
  }

  disable() {
    this.reach.removeListener('use', this.onInteract);
  }
}
