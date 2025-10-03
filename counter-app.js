/**
 * Copyright 2025 Damon Cagliola
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `counter-app`
 * 
 * @demo index.html
 * @element counter-app
 */
export class CounterApp extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return "counter-app";
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // base defaults
    this.min = 0;
    this.max = 25;
    this.defaultCount = 0;
    this.count = 0; // will be updated in firstUpdated()

    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/counter-app.ar.json", import.meta.url).href + "/../",
      locales: ["ar", "es", "hi", "zh"],
    });
  }

  static get properties() {
    return {
      ...super.properties, // gonna be honest, not sure if this was already there from the template or if copilot snuck it in
      title: { type: String },
      count: { type: Number },
      min: { type: Number },
      max: { type: Number },
      defaultCount: { type: Number },
    };
  }

  // This is how I am making the reset button work, defaultCount is edited in the index per counter
  firstUpdated() {
    this.count = this.defaultCount;
  }

  _updateState() {
    this.removeAttribute("data-state");
    if (this.count === this.min) {
      this.setAttribute("data-state", "min");
    } else if (this.count === this.max) {
      this.setAttribute("data-state", "max");
    } else if (this.count === 18) {
      this.setAttribute("data-state", "18");
    } else if (this.count === 21) {
      this.setAttribute("data-state", "21");
    }
  }


updated(changedProperties) {
  if (super.updated) {
    super.updated(changedProperties);
  }
  if (changedProperties.has('count')) {
    this._updateState();
    // do your testing of the value and make it rain by calling makeItRain
    if (this.count === 21) {
      this.makeItRain();
    }
  }
}

makeItRain() {
  // this is called a dynamic import. It means it won't import the code for confetti until this method is called
  // the .then() syntax after is because dynamic imports return a Promise object. Meaning the then() code
  // will only run AFTER the code is imported and available to us
  import("@haxtheweb/multiple-choice/lib/confetti-container.js").then(
    (module) => {
      // This is a minor timing 'hack'. We know the code library above will import prior to this running
      // The "set timeout 0" means "wait 1 microtask and run it on the next cycle.
      // this "hack" ensures the element has had time to process in the DOM so that when we set popped
      // it's listening for changes so it can react
      setTimeout(() => {
        // forcibly set the poppped attribute on something with id confetti
        // while I've said in general NOT to do this, the confetti container element will reset this
        // after the animation runs so it's a simple way to generate the effect over and over again
        this.shadowRoot.querySelector("#confetti").setAttribute("popped", "");
      }, 0);
    }
  );
}

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          --counter-font-size: var(--ddd-font-size-xxl, 4rem);
          --counter-color-default: var(--ddd-theme-primary, black);
          --counter-color-min: var(--ddd-theme-accent, red);
          --counter-color-max: var(--ddd-theme-accent, red);
          --counter-color-18: var(--ddd-theme-18, orange);
          --counter-color-21: var(--ddd-theme-21, green);

          display: block;
          font-family: var(--ddd-font-navigation);
        }
        .wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--ddd-spacing-3, 12px);
          padding: var(--ddd-spacing-4, 16px);
        }
        .count {
          font-size: var(--counter-font-size);
          color: var(--counter-color-default);
        }
        :host([data-state="min"]) .count {
          color: var(--counter-color-min);
        }
        :host([data-state="max"]) .count {
          color: var(--counter-color-max);
        }
        :host([data-state="18"]) .count {
          color: var(--counter-color-18);
        }
        :host([data-state="21"]) .count {
          color: var(--counter-color-21);
        }

        .controls {
          display: flex;
          gap: var(--ddd-spacing-2, 8px);
        }
        button {
          font-size: 1rem;
          padding: var(--ddd-spacing-2, 8px) var(--ddd-spacing-3, 12px);
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        button:hover:not(:disabled),
        button:focus-visible:not(:disabled) {
          background-color: var(--ddd-theme-secondary, lightgray);
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 10;
        }
      `,
    ];
  }

  // Copilot showed this way of working the buttons, seemed familiar to our prior in-class event listeners
  render() {
    return html`
      <div class="wrapper">
        <div class="count">${this.count}</div>
        <div class="controls">
        <button @click="${this.decrement}" ?disabled="${this.count <= this.min}">-</button>
        <button @click="${this.reset}" ?disabled="${this.count === this.defaultCount}">Reset</button> 
        <button @click="${this.increment}" ?disabled="${this.count >= this.max}">+</button>
        </div>
        <slot></slot>
      </div>
      <confetti-container id="confetti"></confetti-container>
    `;
  }  

  increment() {
    if (this.count < this.max) {
      this.count++;
      this.dispatchEvent(
        new CustomEvent("count-changed", { detail: this.count })
      );
    }
  } // Maintaining the max value

  decrement() {
    if (this.count > this.min) {
      this.count--;
      this.dispatchEvent(
        new CustomEvent("count-changed", { detail: this.count })
      );
    }
  } // Maintaining the min value

  reset() {
    this.count = this.defaultCount;
    this.dispatchEvent(
      new CustomEvent("count-reset", { detail: this.count })
    );
  } // Resetting to defaultCount

  /**
   * haxProperties integration via file reference
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(CounterApp.tag, CounterApp);
