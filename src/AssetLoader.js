import isString from 'lodash/isString'
import isObject from 'lodash/isObject'

function warn (type, key) {
  console.warn(`phaser-manifest-loader: could not find ${type} with key : ${key}`)
}

export default class AssetLoader extends Phaser.Plugin {

  init (req) {
    this.req = req
    this.loaders = {
      'audio': this.loadAudio,
      'video': this.loadVideo,
      'spritesheets': this.loadSpriteSheet,
      'images': this.loadImage,
      'bitmap_fonts': this.loadBitmapFont
    }
  }

  destroy () {
    this.loaders = null
    super.destroy()
  }

  loadManifest (manifest, assetPostfix = '') {
    return new Promise((resolve) => {
      Object.keys(this.loaders).forEach((assetType) => {
        const assets = manifest[assetType]
        if (!assets) return
        assets.forEach((assetOpt) => {
          this.loaders[assetType].call(this, assetOpt, assetPostfix)
        })
      })
      this.game.load.onLoadComplete.addOnce(() => {
        resolve()
      })
      this.game.load.start()
    })
  }

  loadAudio (key) {
    const urls = []

    try {
      urls.push(this.req(`./audio/${key}.mp3`))
    } catch (e) {}

    try {
      urls.push(this.req(`./audio/${key}.ogg`))
    } catch (e) {}

    try {
      urls.push(this.req(`./audio/${key}.m4a`))
    } catch (e) {}

    try {
      urls.push(this.req(`./audio/${key}.wav`))
    } catch (e) {}

    if (urls.length === 0) {
      warn('audio', key)
    } else {
      this.game.load.audio(key, urls)
    }
  }

  loadSpriteSheet (opt, assetPostfix) {
    let imageUrl, json;
    let frameWidth, frameHeight, frameMax, margin, spacing;

    let key, alias;
    if (typeof opt === 'string') {
      key = opt;
      alias = opt;
    } else if(typeof opt === 'object') {
      key = opt.key;
      alias = opt.alias || opt.key;
      frameWidth = opt.frameWidth;
      frameHeight = opt.frameHeight;
      frameMax = opt.frameMax;
      margin = opt.margin;
      spacing = opt.spacing;
    }

    try {
      imageUrl = this.req(`./spritesheets/${key}${assetPostfix}.png`);
    } catch (e) {}

    if (!imageUrl) warn('spriteSheet image', key);
    this.game.load.spritesheet(alias, imageUrl, frameWidth, frameHeight, frameMax, margin, spacing);
  }

  loadAtlasJSONArray (opt, assetPostfix) {
    let imageUrl, json;

    let key, alias;
    if (typeof opt === 'string') {
      key = opt;
      alias = opt;
    } else if(typeof opt === 'object') {
      key = opt.key;
      alias = opt.alias || opt.key;
    }

    try {
      imageUrl = this.req(`./spritesheets/${key}${assetPostfix}.png`)
    } catch (e) {}

    try {
      json = this.req(`./spritesheets/${key}${assetPostfix}.json`)
    } catch (e) {}

    if (!imageUrl) warn('spriteSheet image', key)
    if (!json) warn('spriteSheet json', key)
    this.game.load.atlasJSONArray(alias, imageUrl, isString(json) && json, isObject(json) && json)
  }

  loadImage (opt, assetPostfix) {
    const urls = []

    let key, alias;
    if (typeof opt === 'string') {
      key = opt;
      alias = opt;
    } else if(typeof opt === 'object') {
      key = opt.key;
      alias = opt.alias || opt.key;
    }

    try {
      urls.push(this.req(`./images/${key}${assetPostfix}.jpg`))
    } catch (e) {}

    try {
      urls.push(this.req(`./images/${key}${assetPostfix}.png`))
    } catch (e) {}

    if (urls.length === 0) {
      warn('image', key)
    } else {
      this.game.load.image(alias, urls[0])
    }
  }

  loadVideo (opt, assetPostfix) {
    const urls = []

    let key, alias;
    if (typeof opt === 'string') {
      key = opt;
      alias = opt;
    } else if(typeof opt === 'object') {
      key = opt.key;
      alias = opt.alias || opt.key;
    }

    try {
      urls.push(this.req(`./video/${key}.mp4`))
    } catch (e) {}

    if (urls.length === 0) {
      warn('video', key)
    } else {
      this.game.load.video(alias, urls[0]);
    }
  }


  loadBitmapFont (opt, assetPostfix) {
    let key, alias;
    if (typeof opt === 'string') {
      key = opt;
      alias = opt;
    } else if(typeof opt === 'object') {
      key = opt.key;
      alias = opt.alias || opt.key;
    }

    let imageUrl, xmlUrl
    try {
      imageUrl = this.req(`./bitmap_fonts/${key}${assetPostfix}.png`)
    } catch (e) {}

    try {
      xmlUrl = this.req(`./bitmap_fonts/${key}${assetPostfix}.xml`)
    } catch (e) {}

    if (!imageUrl) warn('bitmapFont image', key)
    if (!xmlUrl) warn('bitmapFont xml', key)
    this.game.load.bitmapFont(alias, imageUrl, xmlUrl)
  }

}
