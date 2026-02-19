import {
  POWERUP_CONFIG,
  POWERUP_SPAWN_SETTINGS,
} from "../config/powerup-config.js";

export class Powerup {
  /**
   * @param {Object} opts
   * @param {string} opts.type - one of POWERUP_CONFIG keys
   * @param {number} opts.x - initial x position in pixels (left)
   * @param {number} opts.y - initial y position in pixels (top)
   * @param {HTMLElement|null} opts.parent - optional parent to mount element into
   *   (if omitted, caller should append `powerup.element` themselves)
   * @param {Function|null} opts.onCollect - called when collected: (powerup) => void
   * @param {string|number|null} opts.id - optional id for bookkeeping
   */
  constructor({
    type,
    x = 0,
    y = 0,
    parent = null,
    onCollect = null,
    id = null,
  } = {}) {
    this.id = id ?? `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.type = type;
    this.cfg = POWERUP_CONFIG[type] || {};

    // position
    this.x = x;
    this.y = y;

    // visual/size
    this.size = this.cfg.sizePx || 28;

    // state
    this.createdAt = performance.now();
    this.collected = false;
    this.removed = false;

    // callback invoked when collected
    this.onCollect = typeof onCollect === "function" ? onCollect : null;

    this.element = this._createElement();
    this.updatePosition();

    if (parent && parent.appendChild) parent.appendChild(this.element);
  }

  _createElement() {
    const el = document.createElement("div");
    el.className = `powerup powerup--${this.type}`;
    el.style.width = this.size + "px";
    el.style.height = this.size + "px";
    el.style.position = "absolute";
    el.style.willChange = "transform, opacity";

    // allow a config-defined iconClass for styling
    if (this.cfg.iconClass) el.classList.add(this.cfg.iconClass);

    return el;
  }

  updatePosition() {
    this.element.style.transform = `translate(${Math.round(this.x)}px, ${Math.round(this.y)}px)`;
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
    this.updatePosition();
  }

  // dt in seconds
  update(
    dt = 0,
    {
      fallSpeedPxPerSec = POWERUP_SPAWN_SETTINGS.fallSpeedPxPerSec,
      containerHeight = Infinity,
    } = {},
  ) {
    if (this.collected || this.removed) return;

    const dy = (fallSpeedPxPerSec || 120) * dt;
    this.y += dy;
    this.updatePosition();

    // auto-expire if below container or time exceeded
    const now = performance.now();
    const age = now - this.createdAt;
    const autoExpireMs =
      POWERUP_SPAWN_SETTINGS.autoExpireIfUncollectedMs || 15000;
    if (age >= autoExpireMs) {
      this.remove();
      return;
    }

    if (this.y > containerHeight + this.size) {
      this.remove();
    }
  }

  getBounds() {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.size,
      bottom: this.y + this.size,
      width: this.size,
      height: this.size,
      centerX: this.x + this.size / 2,
      centerY: this.y + this.size / 2,
    };
  }

  // used by system to detect collection; keeps entity lightweight
  collect() {
    if (this.collected || this.removed) return;
    this.collected = true;
    this.element.classList.add("powerup--collected");

    // call handler synchronously so effect can be applied immediately
    try {
      if (this.onCollect) this.onCollect(this);
    } catch (e) {
      // swallow errors from handlers to avoid breaking game loop
      // eslint-disable-next-line no-console
      console.error("powerup onCollect handler error", e);
    }

    // fade out animation then remove
    setTimeout(() => this.remove(), 220);
  }

  remove() {
    if (this.removed) return;
    this.removed = true;
    if (this.element && this.element.parentNode) this.element.remove();
  }
}

export default Powerup;
