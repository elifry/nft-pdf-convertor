
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /*
     * QRious v4.0.2
     * Copyright (C) 2017 Alasdair Mercer
     * Copyright (C) 2010 Tom Zerucha
     *
     * This program is free software: you can redistribute it and/or modify
     * it under the terms of the GNU General Public License as published by
     * the Free Software Foundation, either version 3 of the License, or
     * (at your option) any later version.
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU General Public License for more details.
     *
     * You should have received a copy of the GNU General Public License
     * along with this program.  If not, see <http://www.gnu.org/licenses/>.
     */

    var qrcode = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
        module.exports = factory() ;
      }(commonjsGlobal, (function () {  
        /*
         * Copyright (C) 2017 Alasdair Mercer, !ninja
         *
         * Permission is hereby granted, free of charge, to any person obtaining a copy
         * of this software and associated documentation files (the "Software"), to deal
         * in the Software without restriction, including without limitation the rights
         * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
         * copies of the Software, and to permit persons to whom the Software is
         * furnished to do so, subject to the following conditions:
         *
         * The above copyright notice and this permission notice shall be included in all
         * copies or substantial portions of the Software.
         *
         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
         * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
         * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
         * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
         * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
         * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
         * SOFTWARE.
         */
      
        /**
         * A bare-bones constructor for surrogate prototype swapping.
         *
         * @private
         * @constructor
         */
        var Constructor = /* istanbul ignore next */ function() {};
        /**
         * A reference to <code>Object.prototype.hasOwnProperty</code>.
         *
         * @private
         * @type {Function}
         */
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        /**
         * A reference to <code>Array.prototype.slice</code>.
         *
         * @private
         * @type {Function}
         */
        var slice = Array.prototype.slice;
      
        /**
         * Creates an object which inherits the given <code>prototype</code>.
         *
         * Optionally, the created object can be extended further with the specified <code>properties</code>.
         *
         * @param {Object} prototype - the prototype to be inherited by the created object
         * @param {Object} [properties] - the optional properties to be extended by the created object
         * @return {Object} The newly created object.
         * @private
         */
        function createObject(prototype, properties) {
          var result;
          /* istanbul ignore next */
          if (typeof Object.create === 'function') {
            result = Object.create(prototype);
          } else {
            Constructor.prototype = prototype;
            result = new Constructor();
            Constructor.prototype = null;
          }
      
          if (properties) {
            extendObject(true, result, properties);
          }
      
          return result;
        }
      
        /**
         * Extends the constructor to which this method is associated with the <code>prototype</code> and/or
         * <code>statics</code> provided.
         *
         * If <code>name</code> is provided, it will be used as the class name and can be accessed via a special
         * <code>class_</code> property on the child constructor, otherwise the class name of the super constructor will be used
         * instead. The class name may also be used string representation for instances of the child constructor (via
         * <code>toString</code>), but this is not applicable to the <i>lite</i> version of Nevis.
         *
         * If <code>constructor</code> is provided, it will be used as the constructor for the child, otherwise a simple
         * constructor which only calls the super constructor will be used instead.
         *
         * The super constructor can be accessed via a special <code>super_</code> property on the child constructor.
         *
         * @param {string} [name=this.class_] - the class name to be used for the child constructor
         * @param {Function} [constructor] - the constructor for the child
         * @param {Object} [prototype] - the prototype properties to be defined for the child
         * @param {Object} [statics] - the static properties to be defined for the child
         * @return {Function} The child <code>constructor</code> provided or the one created if none was given.
         * @public
         */
        function extend(name, constructor, prototype, statics) {
          var superConstructor = this;
      
          if (typeof name !== 'string') {
            statics = prototype;
            prototype = constructor;
            constructor = name;
            name = null;
          }
      
          if (typeof constructor !== 'function') {
            statics = prototype;
            prototype = constructor;
            constructor = function() {
              return superConstructor.apply(this, arguments);
            };
          }
      
          extendObject(false, constructor, superConstructor, statics);
      
          constructor.prototype = createObject(superConstructor.prototype, prototype);
          constructor.prototype.constructor = constructor;
      
          constructor.class_ = name || superConstructor.class_;
          constructor.super_ = superConstructor;
      
          return constructor;
        }
      
        /**
         * Extends the specified <code>target</code> object with the properties in each of the <code>sources</code> provided.
         *
         * if any source is <code>null</code> it will be ignored.
         *
         * @param {boolean} own - <code>true</code> to only copy <b>own</b> properties from <code>sources</code> onto
         * <code>target</code>; otherwise <code>false</code>
         * @param {Object} target - the target object which should be extended
         * @param {...Object} [sources] - the source objects whose properties are to be copied onto <code>target</code>
         * @return {void}
         * @private
         */
        function extendObject(own, target, sources) {
          sources = slice.call(arguments, 2);
      
          var property;
          var source;
      
          for (var i = 0, length = sources.length; i < length; i++) {
            source = sources[i];
      
            for (property in source) {
              if (!own || hasOwnProperty.call(source, property)) {
                target[property] = source[property];
              }
            }
          }
        }
      
        var extend_1 = extend;
      
        /**
         * The base class from which all others should extend.
         *
         * @public
         * @constructor
         */
        function Nevis() {}
        Nevis.class_ = 'Nevis';
        Nevis.super_ = Object;
      
        /**
         * Extends the constructor to which this method is associated with the <code>prototype</code> and/or
         * <code>statics</code> provided.
         *
         * If <code>name</code> is provided, it will be used as the class name and can be accessed via a special
         * <code>class_</code> property on the child constructor, otherwise the class name of the super constructor will be used
         * instead. The class name may also be used string representation for instances of the child constructor (via
         * <code>toString</code>), but this is not applicable to the <i>lite</i> version of Nevis.
         *
         * If <code>constructor</code> is provided, it will be used as the constructor for the child, otherwise a simple
         * constructor which only calls the super constructor will be used instead.
         *
         * The super constructor can be accessed via a special <code>super_</code> property on the child constructor.
         *
         * @param {string} [name=this.class_] - the class name to be used for the child constructor
         * @param {Function} [constructor] - the constructor for the child
         * @param {Object} [prototype] - the prototype properties to be defined for the child
         * @param {Object} [statics] - the static properties to be defined for the child
         * @return {Function} The child <code>constructor</code> provided or the one created if none was given.
         * @public
         * @static
         * @memberof Nevis
         */
        Nevis.extend = extend_1;
      
        var nevis = Nevis;
      
        var lite = nevis;
      
        /**
         * Responsible for rendering a QR code {@link Frame} on a specific type of element.
         *
         * A renderer may be dependant on the rendering of another element, so the ordering of their execution is important.
         *
         * The rendering of a element can be deferred by disabling the renderer initially, however, any attempt get the element
         * from the renderer will result in it being immediately enabled and the element being rendered.
         *
         * @param {QRious} qrious - the {@link QRious} instance to be used
         * @param {*} element - the element onto which the QR code is to be rendered
         * @param {boolean} [enabled] - <code>true</code> this {@link Renderer} is enabled; otherwise <code>false</code>.
         * @public
         * @class
         * @extends Nevis
         */
        var Renderer = lite.extend(function(qrious, element, enabled) {
          /**
           * The {@link QRious} instance.
           *
           * @protected
           * @type {QRious}
           * @memberof Renderer#
           */
          this.qrious = qrious;
      
          /**
           * The element onto which this {@link Renderer} is rendering the QR code.
           *
           * @protected
           * @type {*}
           * @memberof Renderer#
           */
          this.element = element;
          this.element.qrious = qrious;
      
          /**
           * Whether this {@link Renderer} is enabled.
           *
           * @protected
           * @type {boolean}
           * @memberof Renderer#
           */
          this.enabled = Boolean(enabled);
        }, {
      
          /**
           * Draws the specified QR code <code>frame</code> on the underlying element.
           *
           * Implementations of {@link Renderer} <b>must</b> override this method with their own specific logic.
           *
           * @param {Frame} frame - the {@link Frame} to be drawn
           * @return {void}
           * @protected
           * @abstract
           * @memberof Renderer#
           */
          draw: function(frame) {},
      
          /**
           * Returns the element onto which this {@link Renderer} is rendering the QR code.
           *
           * If this method is called while this {@link Renderer} is disabled, it will be immediately enabled and rendered
           * before the element is returned.
           *
           * @return {*} The element.
           * @public
           * @memberof Renderer#
           */
          getElement: function() {
            if (!this.enabled) {
              this.enabled = true;
              this.render();
            }
      
            return this.element;
          },
      
          /**
           * Calculates the size (in pixel units) to represent an individual module within the QR code based on the
           * <code>frame</code> provided.
           *
           * Any configured padding will be excluded from the returned size.
           *
           * The returned value will be at least one, even in cases where the size of the QR code does not fit its contents.
           * This is done so that the inevitable clipping is handled more gracefully since this way at least something is
           * displayed instead of just a blank space filled by the background color.
           *
           * @param {Frame} frame - the {@link Frame} from which the module size is to be derived
           * @return {number} The pixel size for each module in the QR code which will be no less than one.
           * @protected
           * @memberof Renderer#
           */
          getModuleSize: function(frame) {
            var qrious = this.qrious;
            var padding = qrious.padding || 0;
            var pixels = Math.floor((qrious.size - (padding * 2)) / frame.width);
      
            return Math.max(1, pixels);
          },

          /**
           * Renders a QR code on the underlying element based on the <code>frame</code> provided.
           *
           * @param {Frame} frame - the {@link Frame} to be rendered
           * @return {void}
           * @public
           * @memberof Renderer#
           */
          render: function(frame) {
            if (this.enabled) {
              this.resize();
              this.reset();
              this.draw(frame);
            }
          },
      
          /**
           * Resets the underlying element, effectively clearing any previously rendered QR code.
           *
           * Implementations of {@link Renderer} <b>must</b> override this method with their own specific logic.
           *
           * @return {void}
           * @protected
           * @abstract
           * @memberof Renderer#
           */
          reset: function() {},
      
          /**
           * Ensures that the size of the underlying element matches that defined on the associated {@link QRious} instance.
           *
           * Implementations of {@link Renderer} <b>must</b> override this method with their own specific logic.
           *
           * @return {void}
           * @protected
           * @abstract
           * @memberof Renderer#
           */
          resize: function() {}
      
        });
      
        var Renderer_1 = Renderer;
      
        /**
         * An implementation of {@link Renderer} for working with <code>canvas</code> elements.
         *
         * @public
         * @class
         * @extends Renderer
         */
        var CanvasRenderer = Renderer_1.extend({
      
          /**
           * @override
           */
          draw: function(frame) {
            var i, j;
            var qrious = this.qrious;
            var moduleSize = this.getModuleSize(frame);
            var offset = parseInt((this.element.width-(frame.width * moduleSize)) / 2);
            var context = this.element.getContext('2d');
      
            context.fillStyle = qrious.foreground;
            context.globalAlpha = qrious.foregroundAlpha;
      
            for (i = 0; i < frame.width; i++) {
              for (j = 0; j < frame.width; j++) {
                if (frame.buffer[(j * frame.width) + i]) {
                  context.fillRect((moduleSize * i) + offset, (moduleSize * j) + offset, moduleSize, moduleSize);
                }
              }
            }
          },
      
          /**
           * @override
           */
          reset: function() {
            var qrious = this.qrious;
            var context = this.element.getContext('2d');
            var size = qrious.size;
      
            context.lineWidth = 1;
            context.clearRect(0, 0, size, size);
            context.fillStyle = qrious.background;
            context.globalAlpha = qrious.backgroundAlpha;
            context.fillRect(0, 0, size, size);
          },
      
          /**
           * @override
           */
          resize: function() {
            var element = this.element;
      
            element.width = element.height = this.qrious.size;
          }
      
        });
      
        var CanvasRenderer_1 = CanvasRenderer;
      
        /* eslint no-multi-spaces: "off" */
      
      
      
        /**
         * Contains alignment pattern information.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var Alignment = lite.extend(null, {
      
          /**
           * The alignment pattern block.
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof Alignment
           */
          BLOCK: [
            0,  11, 15, 19, 23, 27, 31,
            16, 18, 20, 22, 24, 26, 28, 20, 22, 24, 24, 26, 28, 28, 22, 24, 24,
            26, 26, 28, 28, 24, 24, 26, 26, 26, 28, 28, 24, 26, 26, 26, 28, 28
          ]
      
        });
      
        var Alignment_1 = Alignment;
      
        /* eslint no-multi-spaces: "off" */
      
      
      
        /**
         * Contains error correction information.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var ErrorCorrection = lite.extend(null, {
      
          /**
           * The error correction blocks.
           *
           * There are four elements per version. The first two indicate the number of blocks, then the data width, and finally
           * the ECC width.
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof ErrorCorrection
           */
          BLOCKS: [
            1,  0,  19,  7,     1,  0,  16,  10,    1,  0,  13,  13,    1,  0,  9,   17,
            1,  0,  34,  10,    1,  0,  28,  16,    1,  0,  22,  22,    1,  0,  16,  28,
            1,  0,  55,  15,    1,  0,  44,  26,    2,  0,  17,  18,    2,  0,  13,  22,
            1,  0,  80,  20,    2,  0,  32,  18,    2,  0,  24,  26,    4,  0,  9,   16,
            1,  0,  108, 26,    2,  0,  43,  24,    2,  2,  15,  18,    2,  2,  11,  22,
            2,  0,  68,  18,    4,  0,  27,  16,    4,  0,  19,  24,    4,  0,  15,  28,
            2,  0,  78,  20,    4,  0,  31,  18,    2,  4,  14,  18,    4,  1,  13,  26,
            2,  0,  97,  24,    2,  2,  38,  22,    4,  2,  18,  22,    4,  2,  14,  26,
            2,  0,  116, 30,    3,  2,  36,  22,    4,  4,  16,  20,    4,  4,  12,  24,
            2,  2,  68,  18,    4,  1,  43,  26,    6,  2,  19,  24,    6,  2,  15,  28,
            4,  0,  81,  20,    1,  4,  50,  30,    4,  4,  22,  28,    3,  8,  12,  24,
            2,  2,  92,  24,    6,  2,  36,  22,    4,  6,  20,  26,    7,  4,  14,  28,
            4,  0,  107, 26,    8,  1,  37,  22,    8,  4,  20,  24,    12, 4,  11,  22,
            3,  1,  115, 30,    4,  5,  40,  24,    11, 5,  16,  20,    11, 5,  12,  24,
            5,  1,  87,  22,    5,  5,  41,  24,    5,  7,  24,  30,    11, 7,  12,  24,
            5,  1,  98,  24,    7,  3,  45,  28,    15, 2,  19,  24,    3,  13, 15,  30,
            1,  5,  107, 28,    10, 1,  46,  28,    1,  15, 22,  28,    2,  17, 14,  28,
            5,  1,  120, 30,    9,  4,  43,  26,    17, 1,  22,  28,    2,  19, 14,  28,
            3,  4,  113, 28,    3,  11, 44,  26,    17, 4,  21,  26,    9,  16, 13,  26,
            3,  5,  107, 28,    3,  13, 41,  26,    15, 5,  24,  30,    15, 10, 15,  28,
            4,  4,  116, 28,    17, 0,  42,  26,    17, 6,  22,  28,    19, 6,  16,  30,
            2,  7,  111, 28,    17, 0,  46,  28,    7,  16, 24,  30,    34, 0,  13,  24,
            4,  5,  121, 30,    4,  14, 47,  28,    11, 14, 24,  30,    16, 14, 15,  30,
            6,  4,  117, 30,    6,  14, 45,  28,    11, 16, 24,  30,    30, 2,  16,  30,
            8,  4,  106, 26,    8,  13, 47,  28,    7,  22, 24,  30,    22, 13, 15,  30,
            10, 2,  114, 28,    19, 4,  46,  28,    28, 6,  22,  28,    33, 4,  16,  30,
            8,  4,  122, 30,    22, 3,  45,  28,    8,  26, 23,  30,    12, 28, 15,  30,
            3,  10, 117, 30,    3,  23, 45,  28,    4,  31, 24,  30,    11, 31, 15,  30,
            7,  7,  116, 30,    21, 7,  45,  28,    1,  37, 23,  30,    19, 26, 15,  30,
            5,  10, 115, 30,    19, 10, 47,  28,    15, 25, 24,  30,    23, 25, 15,  30,
            13, 3,  115, 30,    2,  29, 46,  28,    42, 1,  24,  30,    23, 28, 15,  30,
            17, 0,  115, 30,    10, 23, 46,  28,    10, 35, 24,  30,    19, 35, 15,  30,
            17, 1,  115, 30,    14, 21, 46,  28,    29, 19, 24,  30,    11, 46, 15,  30,
            13, 6,  115, 30,    14, 23, 46,  28,    44, 7,  24,  30,    59, 1,  16,  30,
            12, 7,  121, 30,    12, 26, 47,  28,    39, 14, 24,  30,    22, 41, 15,  30,
            6,  14, 121, 30,    6,  34, 47,  28,    46, 10, 24,  30,    2,  64, 15,  30,
            17, 4,  122, 30,    29, 14, 46,  28,    49, 10, 24,  30,    24, 46, 15,  30,
            4,  18, 122, 30,    13, 32, 46,  28,    48, 14, 24,  30,    42, 32, 15,  30,
            20, 4,  117, 30,    40, 7,  47,  28,    43, 22, 24,  30,    10, 67, 15,  30,
            19, 6,  118, 30,    18, 31, 47,  28,    34, 34, 24,  30,    20, 61, 15,  30
          ],
      
          /**
           * The final format bits with mask (level << 3 | mask).
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof ErrorCorrection
           */
          FINAL_FORMAT: [
            // L
            0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
            // M
            0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
            // Q
            0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed,
            // H
            0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b
          ],
      
          /**
           * A map of human-readable ECC levels.
           *
           * @public
           * @static
           * @type {Object.<string, number>}
           * @memberof ErrorCorrection
           */
          LEVELS: {
            L: 1,
            M: 2,
            Q: 3,
            H: 4
          }
      
        });
      
        var ErrorCorrection_1 = ErrorCorrection;
      
        /**
         * Contains Galois field information.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var Galois = lite.extend(null, {
      
          /**
           * The Galois field exponent table.
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof Galois
           */
          EXPONENT: [
            0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1d, 0x3a, 0x74, 0xe8, 0xcd, 0x87, 0x13, 0x26,
            0x4c, 0x98, 0x2d, 0x5a, 0xb4, 0x75, 0xea, 0xc9, 0x8f, 0x03, 0x06, 0x0c, 0x18, 0x30, 0x60, 0xc0,
            0x9d, 0x27, 0x4e, 0x9c, 0x25, 0x4a, 0x94, 0x35, 0x6a, 0xd4, 0xb5, 0x77, 0xee, 0xc1, 0x9f, 0x23,
            0x46, 0x8c, 0x05, 0x0a, 0x14, 0x28, 0x50, 0xa0, 0x5d, 0xba, 0x69, 0xd2, 0xb9, 0x6f, 0xde, 0xa1,
            0x5f, 0xbe, 0x61, 0xc2, 0x99, 0x2f, 0x5e, 0xbc, 0x65, 0xca, 0x89, 0x0f, 0x1e, 0x3c, 0x78, 0xf0,
            0xfd, 0xe7, 0xd3, 0xbb, 0x6b, 0xd6, 0xb1, 0x7f, 0xfe, 0xe1, 0xdf, 0xa3, 0x5b, 0xb6, 0x71, 0xe2,
            0xd9, 0xaf, 0x43, 0x86, 0x11, 0x22, 0x44, 0x88, 0x0d, 0x1a, 0x34, 0x68, 0xd0, 0xbd, 0x67, 0xce,
            0x81, 0x1f, 0x3e, 0x7c, 0xf8, 0xed, 0xc7, 0x93, 0x3b, 0x76, 0xec, 0xc5, 0x97, 0x33, 0x66, 0xcc,
            0x85, 0x17, 0x2e, 0x5c, 0xb8, 0x6d, 0xda, 0xa9, 0x4f, 0x9e, 0x21, 0x42, 0x84, 0x15, 0x2a, 0x54,
            0xa8, 0x4d, 0x9a, 0x29, 0x52, 0xa4, 0x55, 0xaa, 0x49, 0x92, 0x39, 0x72, 0xe4, 0xd5, 0xb7, 0x73,
            0xe6, 0xd1, 0xbf, 0x63, 0xc6, 0x91, 0x3f, 0x7e, 0xfc, 0xe5, 0xd7, 0xb3, 0x7b, 0xf6, 0xf1, 0xff,
            0xe3, 0xdb, 0xab, 0x4b, 0x96, 0x31, 0x62, 0xc4, 0x95, 0x37, 0x6e, 0xdc, 0xa5, 0x57, 0xae, 0x41,
            0x82, 0x19, 0x32, 0x64, 0xc8, 0x8d, 0x07, 0x0e, 0x1c, 0x38, 0x70, 0xe0, 0xdd, 0xa7, 0x53, 0xa6,
            0x51, 0xa2, 0x59, 0xb2, 0x79, 0xf2, 0xf9, 0xef, 0xc3, 0x9b, 0x2b, 0x56, 0xac, 0x45, 0x8a, 0x09,
            0x12, 0x24, 0x48, 0x90, 0x3d, 0x7a, 0xf4, 0xf5, 0xf7, 0xf3, 0xfb, 0xeb, 0xcb, 0x8b, 0x0b, 0x16,
            0x2c, 0x58, 0xb0, 0x7d, 0xfa, 0xe9, 0xcf, 0x83, 0x1b, 0x36, 0x6c, 0xd8, 0xad, 0x47, 0x8e, 0x00
          ],
      
          /**
           * The Galois field log table.
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof Galois
           */
          LOG: [
            0xff, 0x00, 0x01, 0x19, 0x02, 0x32, 0x1a, 0xc6, 0x03, 0xdf, 0x33, 0xee, 0x1b, 0x68, 0xc7, 0x4b,
            0x04, 0x64, 0xe0, 0x0e, 0x34, 0x8d, 0xef, 0x81, 0x1c, 0xc1, 0x69, 0xf8, 0xc8, 0x08, 0x4c, 0x71,
            0x05, 0x8a, 0x65, 0x2f, 0xe1, 0x24, 0x0f, 0x21, 0x35, 0x93, 0x8e, 0xda, 0xf0, 0x12, 0x82, 0x45,
            0x1d, 0xb5, 0xc2, 0x7d, 0x6a, 0x27, 0xf9, 0xb9, 0xc9, 0x9a, 0x09, 0x78, 0x4d, 0xe4, 0x72, 0xa6,
            0x06, 0xbf, 0x8b, 0x62, 0x66, 0xdd, 0x30, 0xfd, 0xe2, 0x98, 0x25, 0xb3, 0x10, 0x91, 0x22, 0x88,
            0x36, 0xd0, 0x94, 0xce, 0x8f, 0x96, 0xdb, 0xbd, 0xf1, 0xd2, 0x13, 0x5c, 0x83, 0x38, 0x46, 0x40,
            0x1e, 0x42, 0xb6, 0xa3, 0xc3, 0x48, 0x7e, 0x6e, 0x6b, 0x3a, 0x28, 0x54, 0xfa, 0x85, 0xba, 0x3d,
            0xca, 0x5e, 0x9b, 0x9f, 0x0a, 0x15, 0x79, 0x2b, 0x4e, 0xd4, 0xe5, 0xac, 0x73, 0xf3, 0xa7, 0x57,
            0x07, 0x70, 0xc0, 0xf7, 0x8c, 0x80, 0x63, 0x0d, 0x67, 0x4a, 0xde, 0xed, 0x31, 0xc5, 0xfe, 0x18,
            0xe3, 0xa5, 0x99, 0x77, 0x26, 0xb8, 0xb4, 0x7c, 0x11, 0x44, 0x92, 0xd9, 0x23, 0x20, 0x89, 0x2e,
            0x37, 0x3f, 0xd1, 0x5b, 0x95, 0xbc, 0xcf, 0xcd, 0x90, 0x87, 0x97, 0xb2, 0xdc, 0xfc, 0xbe, 0x61,
            0xf2, 0x56, 0xd3, 0xab, 0x14, 0x2a, 0x5d, 0x9e, 0x84, 0x3c, 0x39, 0x53, 0x47, 0x6d, 0x41, 0xa2,
            0x1f, 0x2d, 0x43, 0xd8, 0xb7, 0x7b, 0xa4, 0x76, 0xc4, 0x17, 0x49, 0xec, 0x7f, 0x0c, 0x6f, 0xf6,
            0x6c, 0xa1, 0x3b, 0x52, 0x29, 0x9d, 0x55, 0xaa, 0xfb, 0x60, 0x86, 0xb1, 0xbb, 0xcc, 0x3e, 0x5a,
            0xcb, 0x59, 0x5f, 0xb0, 0x9c, 0xa9, 0xa0, 0x51, 0x0b, 0xf5, 0x16, 0xeb, 0x7a, 0x75, 0x2c, 0xd7,
            0x4f, 0xae, 0xd5, 0xe9, 0xe6, 0xe7, 0xad, 0xe8, 0x74, 0xd6, 0xf4, 0xea, 0xa8, 0x50, 0x58, 0xaf
          ]
      
        });
      
        var Galois_1 = Galois;
      
        /**
         * Contains version pattern information.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var Version = lite.extend(null, {
      
          /**
           * The version pattern block.
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof Version
           */
          BLOCK: [
            0xc94, 0x5bc, 0xa99, 0x4d3, 0xbf6, 0x762, 0x847, 0x60d, 0x928, 0xb78, 0x45d, 0xa17, 0x532,
            0x9a6, 0x683, 0x8c9, 0x7ec, 0xec4, 0x1e1, 0xfab, 0x08e, 0xc1a, 0x33f, 0xd75, 0x250, 0x9d5,
            0x6f0, 0x8ba, 0x79f, 0xb0b, 0x42e, 0xa64, 0x541, 0xc69
          ]
      
        });
      
        var Version_1 = Version;
      
        /**
         * Generates information for a QR code frame based on a specific value to be encoded.
         *
         * @param {Frame~Options} options - the options to be used
         * @public
         * @class
         * @extends Nevis
         */
        var Frame = lite.extend(function(options) {
          var dataBlock, eccBlock, index, neccBlock1, neccBlock2;
          var valueLength = options.value.length;
      
          this._badness = [];
          this._level = ErrorCorrection_1.LEVELS[options.level];
          this._polynomial = [];
          this._value = options.value;
          this._version = 0;
          this._stringBuffer = [];
      
          while (this._version < 40) {
            this._version++;
      
            index = ((this._level - 1) * 4) + ((this._version - 1) * 16);
      
            neccBlock1 = ErrorCorrection_1.BLOCKS[index++];
            neccBlock2 = ErrorCorrection_1.BLOCKS[index++];
            dataBlock = ErrorCorrection_1.BLOCKS[index++];
            eccBlock = ErrorCorrection_1.BLOCKS[index];
      
            index = (dataBlock * (neccBlock1 + neccBlock2)) + neccBlock2 - 3 + (this._version <= 9);
      
            if (valueLength <= index) {
              break;
            }
          }
      
          this._dataBlock = dataBlock;
          this._eccBlock = eccBlock;
          this._neccBlock1 = neccBlock1;
          this._neccBlock2 = neccBlock2;
      
          /**
           * The data width is based on version.
           *
           * @public
           * @type {number}
           * @memberof Frame#
           */
          // FIXME: Ensure that it fits instead of being truncated.
          var width = this.width = 17 + (4 * this._version);
      
          /**
           * The image buffer.
           *
           * @public
           * @type {number[]}
           * @memberof Frame#
           */
          this.buffer = Frame._createArray(width * width);
      
          this._ecc = Frame._createArray(dataBlock + ((dataBlock + eccBlock) * (neccBlock1 + neccBlock2)) + neccBlock2);
          this._mask = Frame._createArray(((width * (width + 1)) + 1) / 2);
      
          this._insertFinders();
          this._insertAlignments();
      
          // Insert single foreground cell.
          this.buffer[8 + (width * (width - 8))] = 1;
      
          this._insertTimingGap();
          this._reverseMask();
          this._insertTimingRowAndColumn();
          this._insertVersion();
          this._syncMask();
          this._convertBitStream(valueLength);
          this._calculatePolynomial();
          this._appendEccToData();
          this._interleaveBlocks();
          this._pack();
          this._finish();
        }, {
      
          _addAlignment: function(x, y) {
            var i;
            var buffer = this.buffer;
            var width = this.width;
      
            buffer[x + (width * y)] = 1;
      
            for (i = -2; i < 2; i++) {
              buffer[x + i + (width * (y - 2))] = 1;
              buffer[x - 2 + (width * (y + i + 1))] = 1;
              buffer[x + 2 + (width * (y + i))] = 1;
              buffer[x + i + 1 + (width * (y + 2))] = 1;
            }
      
            for (i = 0; i < 2; i++) {
              this._setMask(x - 1, y + i);
              this._setMask(x + 1, y - i);
              this._setMask(x - i, y - 1);
              this._setMask(x + i, y + 1);
            }
          },
      
          _appendData: function(data, dataLength, ecc, eccLength) {
            var bit, i, j;
            var polynomial = this._polynomial;
            var stringBuffer = this._stringBuffer;
      
            for (i = 0; i < eccLength; i++) {
              stringBuffer[ecc + i] = 0;
            }
      
            for (i = 0; i < dataLength; i++) {
              bit = Galois_1.LOG[stringBuffer[data + i] ^ stringBuffer[ecc]];
      
              if (bit !== 255) {
                for (j = 1; j < eccLength; j++) {
                  stringBuffer[ecc + j - 1] = stringBuffer[ecc + j] ^
                    Galois_1.EXPONENT[Frame._modN(bit + polynomial[eccLength - j])];
                }
              } else {
                for (j = ecc; j < ecc + eccLength; j++) {
                  stringBuffer[j] = stringBuffer[j + 1];
                }
              }
      
              stringBuffer[ecc + eccLength - 1] = bit === 255 ? 0 : Galois_1.EXPONENT[Frame._modN(bit + polynomial[0])];
            }
          },
      
          _appendEccToData: function() {
            var i;
            var data = 0;
            var dataBlock = this._dataBlock;
            var ecc = this._calculateMaxLength();
            var eccBlock = this._eccBlock;
      
            for (i = 0; i < this._neccBlock1; i++) {
              this._appendData(data, dataBlock, ecc, eccBlock);
      
              data += dataBlock;
              ecc += eccBlock;
            }
      
            for (i = 0; i < this._neccBlock2; i++) {
              this._appendData(data, dataBlock + 1, ecc, eccBlock);
      
              data += dataBlock + 1;
              ecc += eccBlock;
            }
          },
      
          _applyMask: function(mask) {
            var r3x, r3y, x, y;
            var buffer = this.buffer;
            var width = this.width;
      
            switch (mask) {
            case 0:
              for (y = 0; y < width; y++) {
                for (x = 0; x < width; x++) {
                  if (!((x + y) & 1) && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 1:
              for (y = 0; y < width; y++) {
                for (x = 0; x < width; x++) {
                  if (!(y & 1) && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 2:
              for (y = 0; y < width; y++) {
                for (r3x = 0, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                  }
      
                  if (!r3x && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 3:
              for (r3y = 0, y = 0; y < width; y++, r3y++) {
                if (r3y === 3) {
                  r3y = 0;
                }
      
                for (r3x = r3y, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                  }
      
                  if (!r3x && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 4:
              for (y = 0; y < width; y++) {
                for (r3x = 0, r3y = (y >> 1) & 1, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                    r3y = !r3y;
                  }
      
                  if (!r3y && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 5:
              for (r3y = 0, y = 0; y < width; y++, r3y++) {
                if (r3y === 3) {
                  r3y = 0;
                }
      
                for (r3x = 0, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                  }
      
                  if (!((x & y & 1) + !(!r3x | !r3y)) && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 6:
              for (r3y = 0, y = 0; y < width; y++, r3y++) {
                if (r3y === 3) {
                  r3y = 0;
                }
      
                for (r3x = 0, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                  }
      
                  if (!((x & y & 1) + (r3x && r3x === r3y) & 1) && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 7:
              for (r3y = 0, y = 0; y < width; y++, r3y++) {
                if (r3y === 3) {
                  r3y = 0;
                }
      
                for (r3x = 0, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                  }
      
                  if (!((r3x && r3x === r3y) + (x + y & 1) & 1) && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            }
          },
      
          _calculateMaxLength: function() {
            return (this._dataBlock * (this._neccBlock1 + this._neccBlock2)) + this._neccBlock2;
          },
      
          _calculatePolynomial: function() {
            var i, j;
            var eccBlock = this._eccBlock;
            var polynomial = this._polynomial;
      
            polynomial[0] = 1;
      
            for (i = 0; i < eccBlock; i++) {
              polynomial[i + 1] = 1;
      
              for (j = i; j > 0; j--) {
                polynomial[j] = polynomial[j] ? polynomial[j - 1] ^
                  Galois_1.EXPONENT[Frame._modN(Galois_1.LOG[polynomial[j]] + i)] : polynomial[j - 1];
              }
      
              polynomial[0] = Galois_1.EXPONENT[Frame._modN(Galois_1.LOG[polynomial[0]] + i)];
            }
      
            // Use logs for generator polynomial to save calculation step.
            for (i = 0; i <= eccBlock; i++) {
              polynomial[i] = Galois_1.LOG[polynomial[i]];
            }
          },
      
          _checkBadness: function() {
            var b, b1, h, x, y;
            var bad = 0;
            var badness = this._badness;
            var buffer = this.buffer;
            var width = this.width;
      
            // Blocks of same colour.
            for (y = 0; y < width - 1; y++) {
              for (x = 0; x < width - 1; x++) {
                // All foreground colour.
                if ((buffer[x + (width * y)] &&
                  buffer[x + 1 + (width * y)] &&
                  buffer[x + (width * (y + 1))] &&
                  buffer[x + 1 + (width * (y + 1))]) ||
                  // All background colour.
                  !(buffer[x + (width * y)] ||
                  buffer[x + 1 + (width * y)] ||
                  buffer[x + (width * (y + 1))] ||
                  buffer[x + 1 + (width * (y + 1))])) {
                  bad += Frame.N2;
                }
              }
            }
      
            var bw = 0;
      
            // X runs.
            for (y = 0; y < width; y++) {
              h = 0;
      
              badness[0] = 0;
      
              for (b = 0, x = 0; x < width; x++) {
                b1 = buffer[x + (width * y)];
      
                if (b === b1) {
                  badness[h]++;
                } else {
                  badness[++h] = 1;
                }
      
                b = b1;
                bw += b ? 1 : -1;
              }
      
              bad += this._getBadness(h);
            }
      
            if (bw < 0) {
              bw = -bw;
            }
      
            var count = 0;
            var big = bw;
            big += big << 2;
            big <<= 1;
      
            while (big > width * width) {
              big -= width * width;
              count++;
            }
      
            bad += count * Frame.N4;
      
            // Y runs.
            for (x = 0; x < width; x++) {
              h = 0;
      
              badness[0] = 0;
      
              for (b = 0, y = 0; y < width; y++) {
                b1 = buffer[x + (width * y)];
      
                if (b === b1) {
                  badness[h]++;
                } else {
                  badness[++h] = 1;
                }
      
                b = b1;
              }
      
              bad += this._getBadness(h);
            }
      
            return bad;
          },
      
          _convertBitStream: function(length) {
            var bit, i;
            var ecc = this._ecc;
            var version = this._version;
      
            // Convert string to bit stream. 8-bit data to QR-coded 8-bit data (numeric, alphanumeric, or kanji not supported).
            for (i = 0; i < length; i++) {
              ecc[i] = this._value.charCodeAt(i);
            }
      
            var stringBuffer = this._stringBuffer = ecc.slice();
            var maxLength = this._calculateMaxLength();
      
            if (length >= maxLength - 2) {
              length = maxLength - 2;
      
              if (version > 9) {
                length--;
              }
            }
      
            // Shift and re-pack to insert length prefix.
            var index = length;
      
            if (version > 9) {
              stringBuffer[index + 2] = 0;
              stringBuffer[index + 3] = 0;
      
              while (index--) {
                bit = stringBuffer[index];
      
                stringBuffer[index + 3] |= 255 & (bit << 4);
                stringBuffer[index + 2] = bit >> 4;
              }
      
              stringBuffer[2] |= 255 & (length << 4);
              stringBuffer[1] = length >> 4;
              stringBuffer[0] = 0x40 | (length >> 12);
            } else {
              stringBuffer[index + 1] = 0;
              stringBuffer[index + 2] = 0;
      
              while (index--) {
                bit = stringBuffer[index];
      
                stringBuffer[index + 2] |= 255 & (bit << 4);
                stringBuffer[index + 1] = bit >> 4;
              }
      
              stringBuffer[1] |= 255 & (length << 4);
              stringBuffer[0] = 0x40 | (length >> 4);
            }
      
            // Fill to end with pad pattern.
            index = length + 3 - (version < 10);
      
            while (index < maxLength) {
              stringBuffer[index++] = 0xec;
              stringBuffer[index++] = 0x11;
            }
          },
      
          _getBadness: function(length) {
            var i;
            var badRuns = 0;
            var badness = this._badness;
      
            for (i = 0; i <= length; i++) {
              if (badness[i] >= 5) {
                badRuns += Frame.N1 + badness[i] - 5;
              }
            }
      
            // FBFFFBF as in finder.
            for (i = 3; i < length - 1; i += 2) {
              if (badness[i - 2] === badness[i + 2] &&
                badness[i + 2] === badness[i - 1] &&
                badness[i - 1] === badness[i + 1] &&
                badness[i - 1] * 3 === badness[i] &&
                // Background around the foreground pattern? Not part of the specs.
                (badness[i - 3] === 0 || i + 3 > length ||
                badness[i - 3] * 3 >= badness[i] * 4 ||
                badness[i + 3] * 3 >= badness[i] * 4)) {
                badRuns += Frame.N3;
              }
            }
      
            return badRuns;
          },
      
          _finish: function() {
            // Save pre-mask copy of frame.
            this._stringBuffer = this.buffer.slice();
      
            var currentMask, i;
            var bit = 0;
            var mask = 30000;
      
            /*
             * Using for instead of while since in original Arduino code if an early mask was "good enough" it wouldn't try for
             * a better one since they get more complex and take longer.
             */
            for (i = 0; i < 8; i++) {
              // Returns foreground-background imbalance.
              this._applyMask(i);
      
              currentMask = this._checkBadness();
      
              // Is current mask better than previous best?
              if (currentMask < mask) {
                mask = currentMask;
                bit = i;
              }
      
              // Don't increment "i" to a void redoing mask.
              if (bit === 7) {
                break;
              }
      
              // Reset for next pass.
              this.buffer = this._stringBuffer.slice();
            }
      
            // Redo best mask as none were "good enough" (i.e. last wasn't bit).
            if (bit !== i) {
              this._applyMask(bit);
            }
      
            // Add in final mask/ECC level bytes.
            mask = ErrorCorrection_1.FINAL_FORMAT[bit + (this._level - 1 << 3)];
      
            var buffer = this.buffer;
            var width = this.width;
      
            // Low byte.
            for (i = 0; i < 8; i++, mask >>= 1) {
              if (mask & 1) {
                buffer[width - 1 - i + (width * 8)] = 1;
      
                if (i < 6) {
                  buffer[8 + (width * i)] = 1;
                } else {
                  buffer[8 + (width * (i + 1))] = 1;
                }
              }
            }
      
            // High byte.
            for (i = 0; i < 7; i++, mask >>= 1) {
              if (mask & 1) {
                buffer[8 + (width * (width - 7 + i))] = 1;
      
                if (i) {
                  buffer[6 - i + (width * 8)] = 1;
                } else {
                  buffer[7 + (width * 8)] = 1;
                }
              }
            }
          },
      
          _interleaveBlocks: function() {
            var i, j;
            var dataBlock = this._dataBlock;
            var ecc = this._ecc;
            var eccBlock = this._eccBlock;
            var k = 0;
            var maxLength = this._calculateMaxLength();
            var neccBlock1 = this._neccBlock1;
            var neccBlock2 = this._neccBlock2;
            var stringBuffer = this._stringBuffer;
      
            for (i = 0; i < dataBlock; i++) {
              for (j = 0; j < neccBlock1; j++) {
                ecc[k++] = stringBuffer[i + (j * dataBlock)];
              }
      
              for (j = 0; j < neccBlock2; j++) {
                ecc[k++] = stringBuffer[(neccBlock1 * dataBlock) + i + (j * (dataBlock + 1))];
              }
            }
      
            for (j = 0; j < neccBlock2; j++) {
              ecc[k++] = stringBuffer[(neccBlock1 * dataBlock) + i + (j * (dataBlock + 1))];
            }
      
            for (i = 0; i < eccBlock; i++) {
              for (j = 0; j < neccBlock1 + neccBlock2; j++) {
                ecc[k++] = stringBuffer[maxLength + i + (j * eccBlock)];
              }
            }
      
            this._stringBuffer = ecc;
          },
      
          _insertAlignments: function() {
            var i, x, y;
            var version = this._version;
            var width = this.width;
      
            if (version > 1) {
              i = Alignment_1.BLOCK[version];
              y = width - 7;
      
              for (;;) {
                x = width - 7;
      
                while (x > i - 3) {
                  this._addAlignment(x, y);
      
                  if (x < i) {
                    break;
                  }
      
                  x -= i;
                }
      
                if (y <= i + 9) {
                  break;
                }
      
                y -= i;
      
                this._addAlignment(6, y);
                this._addAlignment(y, 6);
              }
            }
          },
      
          _insertFinders: function() {
            var i, j, x, y;
            var buffer = this.buffer;
            var width = this.width;
      
            for (i = 0; i < 3; i++) {
              j = 0;
              y = 0;
      
              if (i === 1) {
                j = width - 7;
              }
              if (i === 2) {
                y = width - 7;
              }
      
              buffer[y + 3 + (width * (j + 3))] = 1;
      
              for (x = 0; x < 6; x++) {
                buffer[y + x + (width * j)] = 1;
                buffer[y + (width * (j + x + 1))] = 1;
                buffer[y + 6 + (width * (j + x))] = 1;
                buffer[y + x + 1 + (width * (j + 6))] = 1;
              }
      
              for (x = 1; x < 5; x++) {
                this._setMask(y + x, j + 1);
                this._setMask(y + 1, j + x + 1);
                this._setMask(y + 5, j + x);
                this._setMask(y + x + 1, j + 5);
              }
      
              for (x = 2; x < 4; x++) {
                buffer[y + x + (width * (j + 2))] = 1;
                buffer[y + 2 + (width * (j + x + 1))] = 1;
                buffer[y + 4 + (width * (j + x))] = 1;
                buffer[y + x + 1 + (width * (j + 4))] = 1;
              }
            }
          },
      
          _insertTimingGap: function() {
            var x, y;
            var width = this.width;
      
            for (y = 0; y < 7; y++) {
              this._setMask(7, y);
              this._setMask(width - 8, y);
              this._setMask(7, y + width - 7);
            }
      
            for (x = 0; x < 8; x++) {
              this._setMask(x, 7);
              this._setMask(x + width - 8, 7);
              this._setMask(x, width - 8);
            }
          },
      
          _insertTimingRowAndColumn: function() {
            var x;
            var buffer = this.buffer;
            var width = this.width;
      
            for (x = 0; x < width - 14; x++) {
              if (x & 1) {
                this._setMask(8 + x, 6);
                this._setMask(6, 8 + x);
              } else {
                buffer[8 + x + (width * 6)] = 1;
                buffer[6 + (width * (8 + x))] = 1;
              }
            }
          },
      
          _insertVersion: function() {
            var i, j, x, y;
            var buffer = this.buffer;
            var version = this._version;
            var width = this.width;
      
            if (version > 6) {
              i = Version_1.BLOCK[version - 7];
              j = 17;
      
              for (x = 0; x < 6; x++) {
                for (y = 0; y < 3; y++, j--) {
                  if (1 & (j > 11 ? version >> j - 12 : i >> j)) {
                    buffer[5 - x + (width * (2 - y + width - 11))] = 1;
                    buffer[2 - y + width - 11 + (width * (5 - x))] = 1;
                  } else {
                    this._setMask(5 - x, 2 - y + width - 11);
                    this._setMask(2 - y + width - 11, 5 - x);
                  }
                }
              }
            }
          },
      
          _isMasked: function(x, y) {
            var bit = Frame._getMaskBit(x, y);
      
            return this._mask[bit] === 1;
          },
      
          _pack: function() {
            var bit, i, j;
            var k = 1;
            var v = 1;
            var width = this.width;
            var x = width - 1;
            var y = width - 1;
      
            // Interleaved data and ECC codes.
            var length = ((this._dataBlock + this._eccBlock) * (this._neccBlock1 + this._neccBlock2)) + this._neccBlock2;
      
            for (i = 0; i < length; i++) {
              bit = this._stringBuffer[i];
      
              for (j = 0; j < 8; j++, bit <<= 1) {
                if (0x80 & bit) {
                  this.buffer[x + (width * y)] = 1;
                }
      
                // Find next fill position.
                do {
                  if (v) {
                    x--;
                  } else {
                    x++;
      
                    if (k) {
                      if (y !== 0) {
                        y--;
                      } else {
                        x -= 2;
                        k = !k;
      
                        if (x === 6) {
                          x--;
                          y = 9;
                        }
                      }
                    } else if (y !== width - 1) {
                      y++;
                    } else {
                      x -= 2;
                      k = !k;
      
                      if (x === 6) {
                        x--;
                        y -= 8;
                      }
                    }
                  }
      
                  v = !v;
                } while (this._isMasked(x, y));
              }
            }
          },
      
          _reverseMask: function() {
            var x, y;
            var width = this.width;
      
            for (x = 0; x < 9; x++) {
              this._setMask(x, 8);
            }
      
            for (x = 0; x < 8; x++) {
              this._setMask(x + width - 8, 8);
              this._setMask(8, x);
            }
      
            for (y = 0; y < 7; y++) {
              this._setMask(8, y + width - 7);
            }
          },
      
          _setMask: function(x, y) {
            var bit = Frame._getMaskBit(x, y);
      
            this._mask[bit] = 1;
          },
      
          _syncMask: function() {
            var x, y;
            var width = this.width;
      
            for (y = 0; y < width; y++) {
              for (x = 0; x <= y; x++) {
                if (this.buffer[x + (width * y)]) {
                  this._setMask(x, y);
                }
              }
            }
          }
      
        }, {
      
          _createArray: function(length) {
            var i;
            var array = [];
      
            for (i = 0; i < length; i++) {
              array[i] = 0;
            }
      
            return array;
          },
      
          _getMaskBit: function(x, y) {
            var bit;
      
            if (x > y) {
              bit = x;
              x = y;
              y = bit;
            }
      
            bit = y;
            bit += y * y;
            bit >>= 1;
            bit += x;
      
            return bit;
          },
      
          _modN: function(x) {
            while (x >= 255) {
              x -= 255;
              x = (x >> 8) + (x & 255);
            }
      
            return x;
          },
      
          // *Badness* coefficients.
          N1: 3,
          N2: 3,
          N3: 40,
          N4: 10
      
        });
      
        var Frame_1 = Frame;
      
        /**
         * The options used by {@link Frame}.
         *
         * @typedef {Object} Frame~Options
         * @property {string} level - The ECC level to be used.
         * @property {string} value - The value to be encoded.
         */
      
        /**
         * An implementation of {@link Renderer} for working with <code>img</code> elements.
         *
         * This depends on {@link CanvasRenderer} being executed first as this implementation simply applies the data URL from
         * the rendered <code>canvas</code> element as the <code>src</code> for the <code>img</code> element being rendered.
         *
         * @public
         * @class
         * @extends Renderer
         */
        var ImageRenderer = Renderer_1.extend({
      
          /**
           * @override
           */
          draw: function() {
            this.element.src = this.qrious.toDataURL();
          },
      
          /**
           * @override
           */
          reset: function() {
            this.element.src = '';
          },
      
          /**
           * @override
           */
          resize: function() {
            var element = this.element;
      
            element.width = element.height = this.qrious.size;
          }
      
        });
      
        var ImageRenderer_1 = ImageRenderer;
      
        /**
         * Defines an available option while also configuring how values are applied to the target object.
         *
         * Optionally, a default value can be specified as well a value transformer for greater control over how the option
         * value is applied.
         *
         * If no value transformer is specified, then any specified option will be applied directly. All values are maintained
         * on the target object itself as a field using the option name prefixed with a single underscore.
         *
         * When an option is specified as modifiable, the {@link OptionManager} will be required to include a setter for the
         * property that is defined on the target object that uses the option name.
         *
         * @param {string} name - the name to be used
         * @param {boolean} [modifiable] - <code>true</code> if the property defined on target objects should include a setter;
         * otherwise <code>false</code>
         * @param {*} [defaultValue] - the default value to be used
         * @param {Option~ValueTransformer} [valueTransformer] - the value transformer to be used
         * @public
         * @class
         * @extends Nevis
         */
        var Option = lite.extend(function(name, modifiable, defaultValue, valueTransformer) {
          /**
           * The name for this {@link Option}.
           *
           * @public
           * @type {string}
           * @memberof Option#
           */
          this.name = name;
      
          /**
           * Whether a setter should be included on the property defined on target objects for this {@link Option}.
           *
           * @public
           * @type {boolean}
           * @memberof Option#
           */
          this.modifiable = Boolean(modifiable);
      
          /**
           * The default value for this {@link Option}.
           *
           * @public
           * @type {*}
           * @memberof Option#
           */
          this.defaultValue = defaultValue;
      
          this._valueTransformer = valueTransformer;
        }, {
      
          /**
           * Transforms the specified <code>value</code> so that it can be applied for this {@link Option}.
           *
           * If a value transformer has been specified for this {@link Option}, it will be called upon to transform
           * <code>value</code>. Otherwise, <code>value</code> will be returned directly.
           *
           * @param {*} value - the value to be transformed
           * @return {*} The transformed value or <code>value</code> if no value transformer is specified.
           * @public
           * @memberof Option#
           */
          transform: function(value) {
            var transformer = this._valueTransformer;
            if (typeof transformer === 'function') {
              return transformer(value, this);
            }
      
            return value;
          }
      
        });
      
        var Option_1 = Option;
      
        /**
         * Returns a transformed value for the specified <code>value</code> to be applied for the <code>option</code> provided.
         *
         * @callback Option~ValueTransformer
         * @param {*} value - the value to be transformed
         * @param {Option} option - the {@link Option} for which <code>value</code> is being transformed
         * @return {*} The transform value.
         */
      
        /**
         * Contains utility methods that are useful throughout the library.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var Utilities = lite.extend(null, {
      
          /**
           * Returns the absolute value of a given number.
           *
           * This method is simply a convenient shorthand for <code>Math.abs</code> while ensuring that nulls are returned as
           * <code>null</code> instead of zero.
           *
           * @param {number} value - the number whose absolute value is to be returned
           * @return {number} The absolute value of <code>value</code> or <code>null</code> if <code>value</code> is
           * <code>null</code>.
           * @public
           * @static
           * @memberof Utilities
           */
          abs: function(value) {
            return value != null ? Math.abs(value) : null;
          },
      
          /**
           * Returns whether the specified <code>object</code> has a property with the specified <code>name</code> as an own
           * (not inherited) property.
           *
           * @param {Object} object - the object on which the property is to be checked
           * @param {string} name - the name of the property to be checked
           * @return {boolean} <code>true</code> if <code>object</code> has an own property with <code>name</code>.
           * @public
           * @static
           * @memberof Utilities
           */
          hasOwn: function(object, name) {
            return Object.prototype.hasOwnProperty.call(object, name);
          },
      
          /**
           * A non-operation method that does absolutely nothing.
           *
           * @return {void}
           * @public
           * @static
           * @memberof Utilities
           */
          noop: function() {},
      
          /**
           * Transforms the specified <code>string</code> to upper case while remaining null-safe.
           *
           * @param {string} string - the string to be transformed to upper case
           * @return {string} <code>string</code> transformed to upper case if <code>string</code> is not <code>null</code>.
           * @public
           * @static
           * @memberof Utilities
           */
          toUpperCase: function(string) {
            return string != null ? string.toUpperCase() : null;
          }
      
        });
      
        var Utilities_1 = Utilities;
      
        /**
         * Manages multiple {@link Option} instances that are intended to be used by multiple implementations.
         *
         * Although the option definitions are shared between targets, the values are maintained on the targets themselves.
         *
         * @param {Option[]} options - the options to be used
         * @public
         * @class
         * @extends Nevis
         */
        var OptionManager = lite.extend(function(options) {
          /**
           * The available options for this {@link OptionManager}.
           *
           * @public
           * @type {Object.<string, Option>}
           * @memberof OptionManager#
           */
          this.options = {};
      
          options.forEach(function(option) {
            this.options[option.name] = option;
          }, this);
        }, {
      
          /**
           * Returns whether an option with the specified <code>name</code> is available.
           *
           * @param {string} name - the name of the {@link Option} whose existence is to be checked
           * @return {boolean} <code>true</code> if an {@link Option} exists with <code>name</code>; otherwise
           * <code>false</code>.
           * @public
           * @memberof OptionManager#
           */
          exists: function(name) {
            return this.options[name] != null;
          },
      
          /**
           * Returns the value of the option with the specified <code>name</code> on the <code>target</code> object provided.
           *
           * @param {string} name - the name of the {@link Option} whose value on <code>target</code> is to be returned
           * @param {Object} target - the object from which the value of the named {@link Option} is to be returned
           * @return {*} The value of the {@link Option} with <code>name</code> on <code>target</code>.
           * @public
           * @memberof OptionManager#
           */
          get: function(name, target) {
            return OptionManager._get(this.options[name], target);
          },
      
          /**
           * Returns a copy of all of the available options on the <code>target</code> object provided.
           *
           * @param {Object} target - the object from which the option name/value pairs are to be returned
           * @return {Object.<string, *>} A hash containing the name/value pairs of all options on <code>target</code>.
           * @public
           * @memberof OptionManager#
           */
          getAll: function(target) {
            var name;
            var options = this.options;
            var result = {};
      
            for (name in options) {
              if (Utilities_1.hasOwn(options, name)) {
                result[name] = OptionManager._get(options[name], target);
              }
            }
      
            return result;
          },
      
          /**
           * Initializes the available options for the <code>target</code> object provided and then applies the initial values
           * within the speciifed <code>options</code>.
           *
           * This method will throw an error if any of the names within <code>options</code> does not match an available option.
           *
           * This involves setting the default values and defining properties for all of the available options on
           * <code>target</code> before finally calling {@link OptionMananger#setAll} with <code>options</code> and
           * <code>target</code>. Any options that are configured to be modifiable will have a setter included in their defined
           * property that will allow its corresponding value to be modified.
           *
           * If a change handler is specified, it will be called whenever the value changes on <code>target</code> for a
           * modifiable option, but only when done so via the defined property's setter.
           *
           * @param {Object.<string, *>} options - the name/value pairs of the initial options to be set
           * @param {Object} target - the object on which the options are to be initialized
           * @param {Function} [changeHandler] - the function to be called whenever the value of an modifiable option changes on
           * <code>target</code>
           * @return {void}
           * @throws {Error} If <code>options</code> contains an invalid option name.
           * @public
           * @memberof OptionManager#
           */
          init: function(options, target, changeHandler) {
            if (typeof changeHandler !== 'function') {
              changeHandler = Utilities_1.noop;
            }
      
            var name, option;
      
            for (name in this.options) {
              if (Utilities_1.hasOwn(this.options, name)) {
                option = this.options[name];
      
                OptionManager._set(option, option.defaultValue, target);
                OptionManager._createAccessor(option, target, changeHandler);
              }
            }
      
            this._setAll(options, target, true);
          },
      
          /**
           * Sets the value of the option with the specified <code>name</code> on the <code>target</code> object provided to
           * <code>value</code>.
           *
           * This method will throw an error if <code>name</code> does not match an available option or matches an option that
           * cannot be modified.
           *
           * If <code>value</code> is <code>null</code> and the {@link Option} has a default value configured, then that default
           * value will be used instead. If the {@link Option} also has a value transformer configured, it will be used to
           * transform whichever value was determined to be used.
           *
           * This method returns whether the value of the underlying field on <code>target</code> was changed as a result.
           *
           * @param {string} name - the name of the {@link Option} whose value is to be set
           * @param {*} value - the value to be set for the named {@link Option} on <code>target</code>
           * @param {Object} target - the object on which <code>value</code> is to be set for the named {@link Option}
           * @return {boolean} <code>true</code> if the underlying field on <code>target</code> was changed; otherwise
           * <code>false</code>.
           * @throws {Error} If <code>name</code> is invalid or is for an option that cannot be modified.
           * @public
           * @memberof OptionManager#
           */
          set: function(name, value, target) {
            return this._set(name, value, target);
          },
      
          /**
           * Sets all of the specified <code>options</code> on the <code>target</code> object provided to their corresponding
           * values.
           *
           * This method will throw an error if any of the names within <code>options</code> does not match an available option
           * or matches an option that cannot be modified.
           *
           * If any value within <code>options</code> is <code>null</code> and the corresponding {@link Option} has a default
           * value configured, then that default value will be used instead. If an {@link Option} also has a value transformer
           * configured, it will be used to transform whichever value was determined to be used.
           *
           * This method returns whether the value for any of the underlying fields on <code>target</code> were changed as a
           * result.
           *
           * @param {Object.<string, *>} options - the name/value pairs of options to be set
           * @param {Object} target - the object on which the options are to be set
           * @return {boolean} <code>true</code> if any of the underlying fields on <code>target</code> were changed; otherwise
           * <code>false</code>.
           * @throws {Error} If <code>options</code> contains an invalid option name or an option that cannot be modiifed.
           * @public
           * @memberof OptionManager#
           */
          setAll: function(options, target) {
            return this._setAll(options, target);
          },
      
          _set: function(name, value, target, allowUnmodifiable) {
            var option = this.options[name];
            if (!option) {
              throw new Error('Invalid option: ' + name);
            }
            if (!option.modifiable && !allowUnmodifiable) {
              throw new Error('Option cannot be modified: ' + name);
            }
      
            return OptionManager._set(option, value, target);
          },
      
          _setAll: function(options, target, allowUnmodifiable) {
            if (!options) {
              return false;
            }
      
            var name;
            var changed = false;
      
            for (name in options) {
              if (Utilities_1.hasOwn(options, name) && this._set(name, options[name], target, allowUnmodifiable)) {
                changed = true;
              }
            }
      
            return changed;
          }
      
        }, {
      
          _createAccessor: function(option, target, changeHandler) {
            var descriptor = {
              get: function() {
                return OptionManager._get(option, target);
              }
            };
      
            if (option.modifiable) {
              descriptor.set = function(value) {
                if (OptionManager._set(option, value, target)) {
                  changeHandler(value, option);
                }
              };
            }
      
            Object.defineProperty(target, option.name, descriptor);
          },
      
          _get: function(option, target) {
            return target['_' + option.name];
          },
      
          _set: function(option, value, target) {
            var fieldName = '_' + option.name;
            var oldValue = target[fieldName];
            var newValue = option.transform(value != null ? value : option.defaultValue);
      
            target[fieldName] = newValue;
      
            return newValue !== oldValue;
          }
      
        });
      
        var OptionManager_1 = OptionManager;
      
        /**
         * Called whenever the value of a modifiable {@link Option} is changed on a target object via the defined property's
         * setter.
         *
         * @callback OptionManager~ChangeHandler
         * @param {*} value - the new value for <code>option</code> on the target object
         * @param {Option} option - the modifable {@link Option} whose value has changed on the target object.
         * @return {void}
         */
      
        /**
         * A basic manager for {@link Service} implementations that are mapped to simple names.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var ServiceManager = lite.extend(function() {
          this._services = {};
        }, {
      
          /**
           * Returns the {@link Service} being managed with the specified <code>name</code>.
           *
           * @param {string} name - the name of the {@link Service} to be returned
           * @return {Service} The {@link Service} is being managed with <code>name</code>.
           * @throws {Error} If no {@link Service} is being managed with <code>name</code>.
           * @public
           * @memberof ServiceManager#
           */
          getService: function(name) {
            var service = this._services[name];
            if (!service) {
              throw new Error('Service is not being managed with name: ' + name);
            }
      
            return service;
          },
      
          /**
           * Sets the {@link Service} implementation to be managed for the specified <code>name</code> to the
           * <code>service</code> provided.
           *
           * @param {string} name - the name of the {@link Service} to be managed with <code>name</code>
           * @param {Service} service - the {@link Service} implementation to be managed
           * @return {void}
           * @throws {Error} If a {@link Service} is already being managed with the same <code>name</code>.
           * @public
           * @memberof ServiceManager#
           */
          setService: function(name, service) {
            if (this._services[name]) {
              throw new Error('Service is already managed with name: ' + name);
            }
      
            if (service) {
              this._services[name] = service;
            }
          }
      
        });
      
        var ServiceManager_1 = ServiceManager;
      
        var optionManager = new OptionManager_1([
          new Option_1('background', true, 'white'),
          new Option_1('backgroundAlpha', true, 1, Utilities_1.abs),
          new Option_1('element'),
          new Option_1('foreground', true, 'black'),
          new Option_1('foregroundAlpha', true, 1, Utilities_1.abs),
          new Option_1('level', true, 'L', Utilities_1.toUpperCase),
          new Option_1('mime', true, 'image/png'),
          new Option_1('padding', true, null, Utilities_1.abs),
          new Option_1('size', true, 100, Utilities_1.abs),
          new Option_1('value', true, '')
        ]);
        var serviceManager = new ServiceManager_1();
      
        /**
         * Enables configuration of a QR code generator which uses HTML5 <code>canvas</code> for rendering.
         *
         * @param {QRious~Options} [options] - the options to be used
         * @throws {Error} If any <code>options</code> are invalid.
         * @public
         * @class
         * @extends Nevis
         */
        var QRious = lite.extend(function(options) {
          optionManager.init(options, this, this.update.bind(this));
      
          var element = optionManager.get('element', this);
          var elementService = serviceManager.getService('element');
          var canvas = element && elementService.isCanvas(element) ? element : elementService.createCanvas();
          var image = element && elementService.isImage(element) ? element : elementService.createImage();
      
          this._canvasRenderer = new CanvasRenderer_1(this, canvas, true);
          this._imageRenderer = new ImageRenderer_1(this, image, image === element);
      
          this.update();
        }, {
      
          /**
           * Returns all of the options configured for this {@link QRious}.
           *
           * Any changes made to the returned object will not be reflected in the options themselves or their corresponding
           * underlying fields.
           *
           * @return {Object.<string, *>} A copy of the applied options.
           * @public
           * @memberof QRious#
           */
          get: function() {
            return optionManager.getAll(this);
          },
      
          /**
           * Sets all of the specified <code>options</code> and automatically updates this {@link QRious} if any of the
           * underlying fields are changed as a result.
           *
           * This is the preferred method for updating multiple options at one time to avoid unnecessary updates between
           * changes.
           *
           * @param {QRious~Options} options - the options to be set
           * @return {void}
           * @throws {Error} If any <code>options</code> are invalid or cannot be modified.
           * @public
           * @memberof QRious#
           */
          set: function(options) {
            if (optionManager.setAll(options, this)) {
              this.update();
            }
          },
      
          /**
           * Returns the image data URI for the generated QR code using the <code>mime</code> provided.
           *
           * @param {string} [mime] - the MIME type for the image
           * @return {string} The image data URI for the QR code.
           * @public
           * @memberof QRious#
           */
          toDataURL: function(mime) {
            return this.canvas.toDataURL(mime || this.mime);
          },
      
          /**
           * Updates this {@link QRious} by generating a new {@link Frame} and re-rendering the QR code.
           *
           * @return {void}
           * @protected
           * @memberof QRious#
           */
          update: function() {
            var frame = new Frame_1({
              level: this.level,
              value: this.value
            });
      
            this._canvasRenderer.render(frame);
            this._imageRenderer.render(frame);
          }
      
        }, {
      
          /**
           * Configures the <code>service</code> provided to be used by all {@link QRious} instances.
           *
           * @param {Service} service - the {@link Service} to be configured
           * @return {void}
           * @throws {Error} If a {@link Service} has already been configured with the same name.
           * @public
           * @static
           * @memberof QRious
           */
          use: function(service) {
            serviceManager.setService(service.getName(), service);
          }
      
        });
      
        Object.defineProperties(QRious.prototype, {
      
          canvas: {
            /**
             * Returns the <code>canvas</code> element being used to render the QR code for this {@link QRious}.
             *
             * @return {*} The <code>canvas</code> element.
             * @public
             * @memberof QRious#
             * @alias canvas
             */
            get: function() {
              return this._canvasRenderer.getElement();
            }
          },
      
          image: {
            /**
             * Returns the <code>img</code> element being used to render the QR code for this {@link QRious}.
             *
             * @return {*} The <code>img</code> element.
             * @public
             * @memberof QRious#
             * @alias image
             */
            get: function() {
              return this._imageRenderer.getElement();
            }
          }
      
        });
      
        var QRious_1$2 = QRious;
      
        /**
         * The options used by {@link QRious}.
         *
         * @typedef {Object} QRious~Options
         * @property {string} [background="white"] - The background color to be applied to the QR code.
         * @property {number} [backgroundAlpha=1] - The background alpha to be applied to the QR code.
         * @property {*} [element] - The element to be used to render the QR code which may either be an <code>canvas</code> or
         * <code>img</code>. The element(s) will be created if needed.
         * @property {string} [foreground="black"] - The foreground color to be applied to the QR code.
         * @property {number} [foregroundAlpha=1] - The foreground alpha to be applied to the QR code.
         * @property {string} [level="L"] - The error correction level to be applied to the QR code.
         * @property {string} [mime="image/png"] - The MIME type to be used to render the image for the QR code.
         * @property {number} [padding] - The padding for the QR code in pixels.
         * @property {number} [size=100] - The size of the QR code in pixels.
         * @property {string} [value=""] - The value to be encoded within the QR code.
         */
      
        var index = QRious_1$2;
      
        /**
         * Defines a service contract that must be met by all implementations.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var Service = lite.extend({
      
          /**
           * Returns the name of this {@link Service}.
           *
           * @return {string} The service name.
           * @public
           * @abstract
           * @memberof Service#
           */
          getName: function() {}
      
        });
      
        var Service_1 = Service;
      
        /**
         * A service for working with elements.
         *
         * @public
         * @class
         * @extends Service
         */
        var ElementService = Service_1.extend({
      
          /**
           * Creates an instance of a canvas element.
           *
           * Implementations of {@link ElementService} <b>must</b> override this method with their own specific logic.
           *
           * @return {*} The newly created canvas element.
           * @public
           * @abstract
           * @memberof ElementService#
           */
          createCanvas: function() {},
      
          /**
           * Creates an instance of a image element.
           *
           * Implementations of {@link ElementService} <b>must</b> override this method with their own specific logic.
           *
           * @return {*} The newly created image element.
           * @public
           * @abstract
           * @memberof ElementService#
           */
          createImage: function() {},
      
          /**
           * @override
           */
          getName: function() {
            return 'element';
          },
      
          /**
           * Returns whether the specified <code>element</code> is a canvas.
           *
           * Implementations of {@link ElementService} <b>must</b> override this method with their own specific logic.
           *
           * @param {*} element - the element to be checked
           * @return {boolean} <code>true</code> if <code>element</code> is a canvas; otherwise <code>false</code>.
           * @public
           * @abstract
           * @memberof ElementService#
           */
          isCanvas: function(element) {},
      
          /**
           * Returns whether the specified <code>element</code> is an image.
           *
           * Implementations of {@link ElementService} <b>must</b> override this method with their own specific logic.
           *
           * @param {*} element - the element to be checked
           * @return {boolean} <code>true</code> if <code>element</code> is an image; otherwise <code>false</code>.
           * @public
           * @abstract
           * @memberof ElementService#
           */
          isImage: function(element) {}
      
        });
      
        var ElementService_1 = ElementService;
      
        /**
         * An implementation of {@link ElementService} intended for use within a browser environment.
         *
         * @public
         * @class
         * @extends ElementService
         */
        var BrowserElementService = ElementService_1.extend({
      
          /**
           * @override
           */
          createCanvas: function() {
            return document.createElement('canvas');
          },
      
          /**
           * @override
           */
          createImage: function() {
            return document.createElement('img');
          },
      
          /**
           * @override
           */
          isCanvas: function(element) {
            return element instanceof HTMLCanvasElement;
          },
      
          /**
           * @override
           */
          isImage: function(element) {
            return element instanceof HTMLImageElement;
          }
      
        });
      
        var BrowserElementService_1 = BrowserElementService;
      
        index.use(new BrowserElementService_1());
      
        var QRious_1 = index;
      
        return QRious_1;
      
      })));
    });

    /* node_modules/svelte-qrcode/src/lib/index.svelte generated by Svelte v3.43.0 */
    const file$2 = "node_modules/svelte-qrcode/src/lib/index.svelte";

    function create_fragment$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*image*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*value*/ ctx[0]);
    			attr_dev(img, "class", /*className*/ ctx[1]);
    			add_location(img, file$2, 41, 0, 681);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*image*/ 4 && !src_url_equal(img.src, img_src_value = /*image*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*value*/ 1) {
    				attr_dev(img, "alt", /*value*/ ctx[0]);
    			}

    			if (dirty & /*className*/ 2) {
    				attr_dev(img, "class", /*className*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Lib', slots, []);
    	const QRcode = new qrcode();
    	let { errorCorrection = "L" } = $$props;
    	let { background = "#fff" } = $$props;
    	let { color = "#000" } = $$props;
    	let { size = "200" } = $$props;
    	let { value = "" } = $$props;
    	let { padding = 0 } = $$props;
    	let { className = "qrcode" } = $$props;
    	let image = '';

    	function generateQrCode() {
    		QRcode.set({
    			background,
    			foreground: color,
    			level: errorCorrection,
    			padding,
    			size,
    			value
    		});

    		$$invalidate(2, image = QRcode.toDataURL('image/jpeg'));
    	}

    	onMount(() => {
    		generateQrCode();
    	});

    	const writable_props = [
    		'errorCorrection',
    		'background',
    		'color',
    		'size',
    		'value',
    		'padding',
    		'className'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Lib> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('errorCorrection' in $$props) $$invalidate(3, errorCorrection = $$props.errorCorrection);
    		if ('background' in $$props) $$invalidate(4, background = $$props.background);
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    		if ('size' in $$props) $$invalidate(6, size = $$props.size);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('padding' in $$props) $$invalidate(7, padding = $$props.padding);
    		if ('className' in $$props) $$invalidate(1, className = $$props.className);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		QrCode: qrcode,
    		QRcode,
    		errorCorrection,
    		background,
    		color,
    		size,
    		value,
    		padding,
    		className,
    		image,
    		generateQrCode
    	});

    	$$self.$inject_state = $$props => {
    		if ('errorCorrection' in $$props) $$invalidate(3, errorCorrection = $$props.errorCorrection);
    		if ('background' in $$props) $$invalidate(4, background = $$props.background);
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    		if ('size' in $$props) $$invalidate(6, size = $$props.size);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('padding' in $$props) $$invalidate(7, padding = $$props.padding);
    		if ('className' in $$props) $$invalidate(1, className = $$props.className);
    		if ('image' in $$props) $$invalidate(2, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			{
    				if (value) {
    					generateQrCode();
    				}
    			}
    		}
    	};

    	return [value, className, image, errorCorrection, background, color, size, padding];
    }

    class Lib extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			errorCorrection: 3,
    			background: 4,
    			color: 5,
    			size: 6,
    			value: 0,
    			padding: 7,
    			className: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lib",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get errorCorrection() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorCorrection(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get background() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-color-picker/src/HsvPicker.svelte generated by Svelte v3.43.0 */
    const file$1 = "node_modules/svelte-color-picker/src/HsvPicker.svelte";

    function create_fragment$1(ctx) {
    	let div20;
    	let div4;
    	let div3;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div7;
    	let div5;
    	let t2;
    	let div6;
    	let t3;
    	let div11;
    	let div8;
    	let t4;
    	let div9;
    	let t5;
    	let div10;
    	let t6;
    	let div19;
    	let div13;
    	let div12;
    	let t7;
    	let div14;
    	let p0;
    	let t8;
    	let t9;
    	let div18;
    	let div15;
    	let p1;
    	let t10;
    	let t11;
    	let p2;
    	let t13;
    	let div16;
    	let p3;
    	let t14;
    	let t15;
    	let p4;
    	let t17;
    	let div17;
    	let p5;
    	let t18;
    	let t19;
    	let p6;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div20 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div7 = element("div");
    			div5 = element("div");
    			t2 = space();
    			div6 = element("div");
    			t3 = space();
    			div11 = element("div");
    			div8 = element("div");
    			t4 = space();
    			div9 = element("div");
    			t5 = space();
    			div10 = element("div");
    			t6 = space();
    			div19 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			t7 = space();
    			div14 = element("div");
    			p0 = element("p");
    			t8 = text(/*hexValue*/ ctx[3]);
    			t9 = space();
    			div18 = element("div");
    			div15 = element("div");
    			p1 = element("p");
    			t10 = text(/*r*/ ctx[0]);
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "R";
    			t13 = space();
    			div16 = element("div");
    			p3 = element("p");
    			t14 = text(/*g*/ ctx[1]);
    			t15 = space();
    			p4 = element("p");
    			p4.textContent = "G";
    			t17 = space();
    			div17 = element("div");
    			p5 = element("p");
    			t18 = text(/*b*/ ctx[2]);
    			t19 = space();
    			p6 = element("p");
    			p6.textContent = "B";
    			attr_dev(div0, "id", "colorsquare-picker");
    			attr_dev(div0, "class", "svelte-8esefu");
    			add_location(div0, file$1, 607, 14, 15799);
    			attr_dev(div1, "id", "colorsquare-event");
    			attr_dev(div1, "class", "svelte-8esefu");
    			add_location(div1, file$1, 608, 14, 15849);
    			attr_dev(div2, "class", "value-gradient svelte-8esefu");
    			add_location(div2, file$1, 606, 10, 15756);
    			attr_dev(div3, "class", "saturation-gradient svelte-8esefu");
    			add_location(div3, file$1, 605, 6, 15712);
    			attr_dev(div4, "class", "colorsquare size svelte-8esefu");
    			add_location(div4, file$1, 604, 2, 15675);
    			attr_dev(div5, "id", "hue-picker");
    			attr_dev(div5, "class", "svelte-8esefu");
    			add_location(div5, file$1, 614, 6, 16009);
    			attr_dev(div6, "id", "hue-event");
    			attr_dev(div6, "class", "svelte-8esefu");
    			add_location(div6, file$1, 615, 6, 16043);
    			attr_dev(div7, "class", "hue-selector svelte-8esefu");
    			add_location(div7, file$1, 613, 2, 15976);
    			attr_dev(div8, "class", "alpha-value svelte-8esefu");
    			add_location(div8, file$1, 619, 6, 16169);
    			attr_dev(div9, "id", "alpha-picker");
    			attr_dev(div9, "class", "svelte-8esefu");
    			add_location(div9, file$1, 620, 6, 16207);
    			attr_dev(div10, "id", "alpha-event");
    			attr_dev(div10, "class", "svelte-8esefu");
    			add_location(div10, file$1, 621, 6, 16243);
    			attr_dev(div11, "class", "alpha-selector svelte-8esefu");
    			add_location(div11, file$1, 618, 2, 16134);
    			attr_dev(div12, "class", "color-picked svelte-8esefu");
    			add_location(div12, file$1, 626, 6, 16409);
    			attr_dev(div13, "class", "color-picked-bg svelte-8esefu");
    			add_location(div13, file$1, 625, 4, 16373);
    			attr_dev(p0, "class", "text svelte-8esefu");
    			add_location(p0, file$1, 630, 6, 16493);
    			attr_dev(div14, "class", "hex-text-block svelte-8esefu");
    			add_location(div14, file$1, 629, 4, 16458);
    			attr_dev(p1, "class", "text svelte-8esefu");
    			add_location(p1, file$1, 635, 8, 16610);
    			attr_dev(p2, "class", "text-label svelte-8esefu");
    			add_location(p2, file$1, 636, 8, 16642);
    			attr_dev(div15, "class", "rgb-text-block svelte-8esefu");
    			add_location(div15, file$1, 634, 6, 16573);
    			attr_dev(p3, "class", "text svelte-8esefu");
    			add_location(p3, file$1, 640, 8, 16727);
    			attr_dev(p4, "class", "text-label svelte-8esefu");
    			add_location(p4, file$1, 641, 8, 16759);
    			attr_dev(div16, "class", "rgb-text-block svelte-8esefu");
    			add_location(div16, file$1, 639, 6, 16690);
    			attr_dev(p5, "class", "text svelte-8esefu");
    			add_location(p5, file$1, 645, 8, 16844);
    			attr_dev(p6, "class", "text-label svelte-8esefu");
    			add_location(p6, file$1, 646, 8, 16876);
    			attr_dev(div17, "class", "rgb-text-block svelte-8esefu");
    			add_location(div17, file$1, 644, 6, 16807);
    			attr_dev(div18, "class", "rgb-text-div svelte-8esefu");
    			add_location(div18, file$1, 633, 4, 16540);
    			attr_dev(div19, "class", "color-info-box svelte-8esefu");
    			add_location(div19, file$1, 624, 2, 16340);
    			attr_dev(div20, "class", "main-container svelte-8esefu");
    			add_location(div20, file$1, 602, 0, 15643);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div20, anchor);
    			append_dev(div20, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div20, t1);
    			append_dev(div20, div7);
    			append_dev(div7, div5);
    			append_dev(div7, t2);
    			append_dev(div7, div6);
    			append_dev(div20, t3);
    			append_dev(div20, div11);
    			append_dev(div11, div8);
    			append_dev(div11, t4);
    			append_dev(div11, div9);
    			append_dev(div11, t5);
    			append_dev(div11, div10);
    			append_dev(div20, t6);
    			append_dev(div20, div19);
    			append_dev(div19, div13);
    			append_dev(div13, div12);
    			append_dev(div19, t7);
    			append_dev(div19, div14);
    			append_dev(div14, p0);
    			append_dev(p0, t8);
    			append_dev(div19, t9);
    			append_dev(div19, div18);
    			append_dev(div18, div15);
    			append_dev(div15, p1);
    			append_dev(p1, t10);
    			append_dev(div15, t11);
    			append_dev(div15, p2);
    			append_dev(div18, t13);
    			append_dev(div18, div16);
    			append_dev(div16, p3);
    			append_dev(p3, t14);
    			append_dev(div16, t15);
    			append_dev(div16, p4);
    			append_dev(div18, t17);
    			append_dev(div18, div17);
    			append_dev(div17, p5);
    			append_dev(p5, t18);
    			append_dev(div17, t19);
    			append_dev(div17, p6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "mousedown", /*csDown*/ ctx[4], false, false, false),
    					listen_dev(div1, "touchstart", /*csDownTouch*/ ctx[5], false, false, false),
    					listen_dev(div6, "mousedown", /*hueDown*/ ctx[6], false, false, false),
    					listen_dev(div6, "touchstart", /*hueDownTouch*/ ctx[7], false, false, false),
    					listen_dev(div10, "mousedown", /*alphaDown*/ ctx[8], false, false, false),
    					listen_dev(div10, "touchstart", /*alphaDownTouch*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hexValue*/ 8) set_data_dev(t8, /*hexValue*/ ctx[3]);
    			if (dirty & /*r*/ 1) set_data_dev(t10, /*r*/ ctx[0]);
    			if (dirty & /*g*/ 2) set_data_dev(t14, /*g*/ ctx[1]);
    			if (dirty & /*b*/ 4) set_data_dev(t18, /*b*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div20);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function removeEventListenerFromElement(elementId, eventName, listenerCallback) {
    	let element = document.querySelector(elementId);
    	if (element) element.removeEventListener(eventName, listenerCallback);
    }

    //Math algorithms
    function hsvToRgb(h, s, v) {
    	var r, g, b;
    	var i = Math.floor(h * 6);
    	var f = h * 6 - i;
    	var p = v * (1 - s);
    	var q = v * (1 - f * s);
    	var t = v * (1 - (1 - f) * s);

    	switch (i % 6) {
    		case 0:
    			(r = v, g = t, b = p);
    			break;
    		case 1:
    			(r = q, g = v, b = p);
    			break;
    		case 2:
    			(r = p, g = v, b = t);
    			break;
    		case 3:
    			(r = p, g = q, b = v);
    			break;
    		case 4:
    			(r = t, g = p, b = v);
    			break;
    		case 5:
    			(r = v, g = p, b = q);
    			break;
    	}

    	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HsvPicker', slots, []);
    	let { startColor = "#FF0000" } = $$props;

    	onMount(() => {
    		document.addEventListener("mouseup", mouseUp);
    		document.addEventListener("touchend", mouseUp);
    		document.addEventListener("mousemove", mouseMove);
    		document.addEventListener("touchmove", touchMove);
    		document.addEventListener("touchstart", killMouseEvents);
    		document.addEventListener("mousedown", killTouchEvents);
    		setStartColor();
    	});

    	Number.prototype.mod = function (n) {
    		return (this % n + n) % n;
    	};

    	const dispatch = createEventDispatcher();
    	let tracked;
    	let h = 1;
    	let s = 1;
    	let v = 1;
    	let a = 1;
    	let r = 255;
    	let g = 0;
    	let b = 0;
    	let hexValue = '#FF0000';

    	function setStartColor() {
    		let hex = startColor.replace('#', '');

    		if (hex.length !== 6 && hex.length !== 3 && !hex.match(/([^A-F0-9])/gi)) {
    			alert('Invalid property value (startColor)');
    			return;
    		}

    		let hexFiltered = '';

    		if (hex.length === 3) hex.split('').forEach(c => {
    			hexFiltered += c + c;
    		}); else hexFiltered = hex;

    		$$invalidate(3, hexValue = hexFiltered);
    		$$invalidate(0, r = parseInt(hexFiltered.substring(0, 2), 16));
    		$$invalidate(1, g = parseInt(hexFiltered.substring(2, 4), 16));
    		$$invalidate(2, b = parseInt(hexFiltered.substring(4, 6), 16));
    		rgbToHSV(r, g, b, true);
    		updateCsPicker();
    		updateHuePicker();
    	}

    	function killMouseEvents() {
    		removeEventListenerFromElement("#alpha-event", "mousedown", alphaDown);
    		removeEventListenerFromElement("#colorsquare-event", "mousedown", csDown);
    		removeEventListenerFromElement("#hue-event", "mousedown", hueDown);
    		document.removeEventListener("mouseup", mouseUp);
    		document.removeEventListener("mousemove", mouseMove);
    		document.removeEventListener("touchstart", killMouseEvents);
    		document.removeEventListener("mousedown", killTouchEvents);
    	}

    	function killTouchEvents() {
    		removeEventListenerFromElement("#alpha-event", "touchstart", alphaDownTouch);
    		removeEventListenerFromElement("#colorsquare-event", "touchstart", csDownTouch);
    		removeEventListenerFromElement("#hue-event", "touchstart", hueDownTouch);
    		document.removeEventListener("touchend", mouseUp);
    		document.removeEventListener("touchmove", touchMove);
    		document.removeEventListener("touchstart", killMouseEvents);
    		document.removeEventListener("mousedown", killTouchEvents);
    	}

    	function updateCsPicker() {
    		let csPicker = document.querySelector("#colorsquare-picker");
    		let xPercentage = s * 100;
    		let yPercentage = (1 - v) * 100;
    		csPicker.style.top = yPercentage + "%";
    		csPicker.style.left = xPercentage + "%";
    	}

    	function updateHuePicker() {
    		let huePicker = document.querySelector("#hue-picker");
    		let xPercentage = h * 100;
    		huePicker.style.left = xPercentage + "%";
    	}

    	function colorChangeCallback() {
    		dispatch('colorChange', { r, g, b, a });
    	}

    	function mouseMove(event) {
    		if (tracked) {
    			let mouseX = event.clientX;
    			let mouseY = event.clientY;
    			let trackedPos = tracked.getBoundingClientRect();
    			let xPercentage, yPercentage, picker;

    			switch (tracked.id) {
    				case "colorsquare-event":
    					xPercentage = (mouseX - trackedPos.x) / 240 * 100;
    					yPercentage = (mouseY - trackedPos.y) / 160 * 100;
    					xPercentage > 100
    					? xPercentage = 100
    					: xPercentage < 0 ? xPercentage = 0 : null;
    					yPercentage > 100
    					? yPercentage = 100
    					: yPercentage < 0 ? yPercentage = 0 : null;
    					picker = document.querySelector("#colorsquare-picker");
    					yPercentage = yPercentage.toFixed(2);
    					xPercentage = xPercentage.toFixed(2);
    					picker.style.top = yPercentage + "%";
    					picker.style.left = xPercentage + "%";
    					s = xPercentage / 100;
    					v = 1 - yPercentage / 100;
    					colorChange();
    					break;
    				case "hue-event":
    					xPercentage = (mouseX - 10 - trackedPos.x) / 220 * 100;
    					xPercentage > 100
    					? xPercentage = 100
    					: xPercentage < 0 ? xPercentage = 0 : null;
    					xPercentage = xPercentage.toFixed(2);
    					picker = document.querySelector("#hue-picker");
    					picker.style.left = xPercentage + "%";
    					h = xPercentage / 100;
    					hueChange();
    					break;
    				case "alpha-event":
    					xPercentage = (mouseX - 10 - trackedPos.x) / 220 * 100;
    					xPercentage > 100
    					? xPercentage = 100
    					: xPercentage < 0 ? xPercentage = 0 : null;
    					xPercentage = xPercentage.toFixed(2);
    					picker = document.querySelector("#alpha-picker");
    					picker.style.left = xPercentage + "%";
    					a = xPercentage / 100;
    					colorChange();
    					break;
    			}
    		}
    	}

    	function touchMove(event) {
    		if (tracked) {
    			let mouseX = event.touches[0].clientX;
    			let mouseY = event.touches[0].clientY;
    			let trackedPos = tracked.getBoundingClientRect();
    			let xPercentage, yPercentage, picker;

    			switch (tracked.id) {
    				case "colorsquare-event":
    					xPercentage = (mouseX - trackedPos.x) / 240 * 100;
    					yPercentage = (mouseY - trackedPos.y) / 160 * 100;
    					xPercentage > 100
    					? xPercentage = 100
    					: xPercentage < 0 ? xPercentage = 0 : null;
    					yPercentage > 100
    					? yPercentage = 100
    					: yPercentage < 0 ? yPercentage = 0 : null;
    					picker = document.querySelector("#colorsquare-picker");
    					yPercentage = yPercentage.toFixed(2);
    					xPercentage = xPercentage.toFixed(2);
    					picker.style.top = yPercentage + "%";
    					picker.style.left = xPercentage + "%";
    					s = xPercentage / 100;
    					v = 1 - yPercentage / 100;
    					colorChange();
    					break;
    				case "hue-event":
    					xPercentage = (mouseX - 10 - trackedPos.x) / 220 * 100;
    					xPercentage > 100
    					? xPercentage = 100
    					: xPercentage < 0 ? xPercentage = 0 : null;
    					xPercentage = xPercentage.toFixed(2);
    					picker = document.querySelector("#hue-picker");
    					picker.style.left = xPercentage + "%";
    					h = xPercentage / 100;
    					hueChange();
    					break;
    				case "alpha-event":
    					xPercentage = (mouseX - 10 - trackedPos.x) / 220 * 100;
    					xPercentage > 100
    					? xPercentage = 100
    					: xPercentage < 0 ? xPercentage = 0 : null;
    					xPercentage = xPercentage.toFixed(2);
    					picker = document.querySelector("#alpha-picker");
    					picker.style.left = xPercentage + "%";
    					a = xPercentage / 100;
    					colorChange();
    					break;
    			}
    		}
    	}

    	function csDown(event) {
    		tracked = event.currentTarget;
    		let xPercentage = (event.offsetX + 1) / 240 * 100;
    		let yPercentage = (event.offsetY + 1) / 160 * 100;
    		yPercentage = yPercentage.toFixed(2);
    		xPercentage = xPercentage.toFixed(2);
    		let picker = document.querySelector("#colorsquare-picker");
    		picker.style.top = yPercentage + "%";
    		picker.style.left = xPercentage + "%";
    		s = xPercentage / 100;
    		v = 1 - yPercentage / 100;
    		colorChange();
    	}

    	function csDownTouch(event) {
    		tracked = event.currentTarget;
    		let rect = event.target.getBoundingClientRect();
    		let offsetX = event.targetTouches[0].clientX - rect.left;
    		let offsetY = event.targetTouches[0].clientY - rect.top;
    		let xPercentage = (offsetX + 1) / 240 * 100;
    		let yPercentage = (offsetY + 1) / 160 * 100;
    		yPercentage = yPercentage.toFixed(2);
    		xPercentage = xPercentage.toFixed(2);
    		let picker = document.querySelector("#colorsquare-picker");
    		picker.style.top = yPercentage + "%";
    		picker.style.left = xPercentage + "%";
    		s = xPercentage / 100;
    		v = 1 - yPercentage / 100;
    		colorChange();
    	}

    	function mouseUp(event) {
    		tracked = null;
    	}

    	function hueDown(event) {
    		tracked = event.currentTarget;
    		let xPercentage = (event.offsetX - 9) / 220 * 100;
    		xPercentage = xPercentage.toFixed(2);
    		let picker = document.querySelector("#hue-picker");
    		picker.style.left = xPercentage + "%";
    		h = xPercentage / 100;
    		hueChange();
    	}

    	function hueDownTouch(event) {
    		tracked = event.currentTarget;
    		let rect = event.target.getBoundingClientRect();
    		let offsetX = event.targetTouches[0].clientX - rect.left;
    		let xPercentage = (offsetX - 9) / 220 * 100;
    		xPercentage = xPercentage.toFixed(2);
    		let picker = document.querySelector("#hue-picker");
    		picker.style.left = xPercentage + "%";
    		h = xPercentage / 100;
    		hueChange();
    	}

    	function hueChange() {
    		let rgb = hsvToRgb(h, 1, 1);
    		let colorsquare = document.querySelector(".colorsquare");
    		colorsquare.style.background = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`;
    		colorChange();
    	}

    	function colorChange() {
    		let rgb = hsvToRgb(h, s, v);
    		$$invalidate(0, r = rgb[0]);
    		$$invalidate(1, g = rgb[1]);
    		$$invalidate(2, b = rgb[2]);
    		$$invalidate(3, hexValue = RGBAToHex());
    		let pickedColor = document.querySelector(".color-picked");
    		pickedColor.style.background = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
    		colorChangeCallback();
    	}

    	function alphaDown(event) {
    		tracked = event.currentTarget;
    		let xPercentage = (event.offsetX - 9) / 220 * 100;
    		xPercentage = xPercentage.toFixed(2);
    		let picker = document.querySelector("#alpha-picker");
    		picker.style.left = xPercentage + "%";
    		a = xPercentage / 100;
    		colorChange();
    	}

    	function alphaDownTouch(event) {
    		tracked = event.currentTarget;
    		let rect = event.target.getBoundingClientRect();
    		let offsetX = event.targetTouches[0].clientX - rect.left;
    		let xPercentage = (offsetX - 9) / 220 * 100;
    		xPercentage = xPercentage.toFixed(2);
    		let picker = document.querySelector("#alpha-picker");
    		picker.style.left = xPercentage + "%";
    		a = xPercentage / 100;
    		colorChange();
    	}

    	function RGBAToHex() {
    		let rHex = r.toString(16);
    		let gHex = g.toString(16);
    		let bHex = b.toString(16);
    		if (rHex.length == 1) rHex = "0" + rHex;
    		if (gHex.length == 1) gHex = "0" + gHex;
    		if (bHex.length == 1) bHex = "0" + bHex;
    		return ("#" + rHex + gHex + bHex).toUpperCase();
    	}

    	function rgbToHSV(r, g, b, update) {
    		let rperc, gperc, bperc, max, min, diff, pr, hnew, snew, vnew;
    		rperc = r / 255;
    		gperc = g / 255;
    		bperc = b / 255;
    		max = Math.max(rperc, gperc, bperc);
    		min = Math.min(rperc, gperc, bperc);
    		diff = max - min;
    		vnew = max;
    		vnew == 0 ? snew = 0 : snew = diff / max;

    		for (let i = 0; i < 3; i++) {
    			if ([rperc, gperc, bperc][i] === max) {
    				pr = i;
    				break;
    			}
    		}

    		if (diff == 0) {
    			hnew = 0;

    			if (update) {
    				h = hnew;
    				s = snew;
    				v = vnew;
    				hueChange();
    				return;
    			} else {
    				return { h: hnew, s: snew, v: vnew };
    			}
    		} else {
    			switch (pr) {
    				case 0:
    					hnew = 60 * ((gperc - bperc) / diff % 6) / 360;
    					break;
    				case 1:
    					hnew = 60 * ((bperc - rperc) / diff + 2) / 360;
    					break;
    				case 2:
    					hnew = 60 * ((rperc - gperc) / diff + 4) / 360;
    					break;
    			}

    			if (hnew < 0) hnew += 6;
    		}

    		if (update) {
    			h = hnew;
    			s = snew;
    			v = vnew;
    			hueChange();
    		} else {
    			return { h: hnew, s: snew, v: vnew };
    		}
    	}

    	const writable_props = ['startColor'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HsvPicker> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('startColor' in $$props) $$invalidate(10, startColor = $$props.startColor);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		startColor,
    		dispatch,
    		tracked,
    		h,
    		s,
    		v,
    		a,
    		r,
    		g,
    		b,
    		hexValue,
    		setStartColor,
    		removeEventListenerFromElement,
    		killMouseEvents,
    		killTouchEvents,
    		updateCsPicker,
    		updateHuePicker,
    		colorChangeCallback,
    		mouseMove,
    		touchMove,
    		csDown,
    		csDownTouch,
    		mouseUp,
    		hueDown,
    		hueDownTouch,
    		hueChange,
    		colorChange,
    		alphaDown,
    		alphaDownTouch,
    		hsvToRgb,
    		RGBAToHex,
    		rgbToHSV
    	});

    	$$self.$inject_state = $$props => {
    		if ('startColor' in $$props) $$invalidate(10, startColor = $$props.startColor);
    		if ('tracked' in $$props) tracked = $$props.tracked;
    		if ('h' in $$props) h = $$props.h;
    		if ('s' in $$props) s = $$props.s;
    		if ('v' in $$props) v = $$props.v;
    		if ('a' in $$props) a = $$props.a;
    		if ('r' in $$props) $$invalidate(0, r = $$props.r);
    		if ('g' in $$props) $$invalidate(1, g = $$props.g);
    		if ('b' in $$props) $$invalidate(2, b = $$props.b);
    		if ('hexValue' in $$props) $$invalidate(3, hexValue = $$props.hexValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		r,
    		g,
    		b,
    		hexValue,
    		csDown,
    		csDownTouch,
    		hueDown,
    		hueDownTouch,
    		alphaDown,
    		alphaDownTouch,
    		startColor
    	];
    }

    class HsvPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { startColor: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HsvPicker",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get startColor() {
    		throw new Error("<HsvPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startColor(value) {
    		throw new Error("<HsvPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (72:0) {#if !generate}
    function create_if_block_1(ctx) {
    	let div7;
    	let div6;
    	let div0;
    	let t1;
    	let form;
    	let input;
    	let t2;
    	let button;
    	let t3;
    	let button_disabled_value;
    	let t4;
    	let div1;
    	let t5;
    	let br0;
    	let br1;
    	let t6;
    	let br2;
    	let t7;
    	let br3;
    	let br4;
    	let t8;
    	let br5;
    	let t9;
    	let t10;
    	let div5;
    	let div2;
    	let t12;
    	let div3;
    	let t14;
    	let div4;
    	let t16;
    	let a;
    	let script;
    	let script_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			div0.textContent = "Turn your Galaxy Eggs into a nice printable PDF!";
    			t1 = space();
    			form = element("form");
    			input = element("input");
    			t2 = space();
    			button = element("button");
    			t3 = text("Generate");
    			t4 = space();
    			div1 = element("div");
    			t5 = text("How it works:\n\t\t\t");
    			br0 = element("br");
    			br1 = element("br");
    			t6 = text("\n\t\t\tPut in your egg number and hit \"Generate\".\n\t\t\t");
    			br2 = element("br");
    			t7 = text("\n\t\t\tOnce it is generated, right-click to print, and save as PDF.\n\t\t\t");
    			br3 = element("br");
    			br4 = element("br");
    			t8 = text("\n\t\t\tNOTE: Make sure you have Headers and Footers turned off\n\t\t\t");
    			br5 = element("br");
    			t9 = text("\n\t\t\t(Chrome: More Settings > Options > Headers and footers)");
    			t10 = space();
    			div5 = element("div");
    			div2 = element("div");
    			div2.textContent = "Like this tool? Here's my eth address:";
    			t12 = space();
    			div3 = element("div");
    			div3.textContent = `${/*web3Address*/ ctx[12]}`;
    			t14 = space();
    			div4 = element("div");
    			div4.textContent = `${/*ethAddress*/ ctx[13]}`;
    			t16 = space();
    			a = element("a");
    			a.textContent = "Follow @acuriousother";
    			script = element("script");
    			attr_dev(div0, "class", "intro svelte-zkwrm1");
    			add_location(div0, file, 74, 2, 2839);
    			attr_dev(input, "id", "textboxid");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", "#");
    			attr_dev(input, "autocomplete", "off");
    			attr_dev(input, "class", "svelte-zkwrm1");
    			add_location(input, file, 78, 3, 2971);
    			attr_dev(button, "id", "buttonid");
    			attr_dev(button, "type", "submit");
    			button.disabled = button_disabled_value = !/*eggNumber*/ ctx[4];
    			attr_dev(button, "class", "btn btn__primary btn__lg svelte-zkwrm1");
    			add_location(button, file, 79, 3, 3068);
    			attr_dev(form, "class", "svelte-zkwrm1");
    			add_location(form, file, 77, 2, 2922);
    			attr_dev(br0, "class", "svelte-zkwrm1");
    			add_location(br0, file, 83, 3, 3229);
    			attr_dev(br1, "class", "svelte-zkwrm1");
    			add_location(br1, file, 83, 7, 3233);
    			attr_dev(br2, "class", "svelte-zkwrm1");
    			add_location(br2, file, 85, 3, 3287);
    			attr_dev(br3, "class", "svelte-zkwrm1");
    			add_location(br3, file, 87, 3, 3359);
    			attr_dev(br4, "class", "svelte-zkwrm1");
    			add_location(br4, file, 87, 7, 3363);
    			attr_dev(br5, "class", "svelte-zkwrm1");
    			add_location(br5, file, 89, 3, 3430);
    			attr_dev(div1, "class", "howto svelte-zkwrm1");
    			add_location(div1, file, 81, 2, 3189);
    			attr_dev(div2, "class", "shilllinefirst svelte-zkwrm1");
    			add_location(div2, file, 93, 3, 3528);
    			attr_dev(div3, "class", "shillline svelte-zkwrm1");
    			add_location(div3, file, 94, 3, 3604);
    			attr_dev(div4, "class", "shillline svelte-zkwrm1");
    			add_location(div4, file, 95, 3, 3650);
    			attr_dev(a, "href", "https://twitter.com/acuriousother?ref_src=twsrc%5Etfw");
    			attr_dev(a, "class", "twitter-follow-button svelte-zkwrm1");
    			attr_dev(a, "data-show-count", "false");
    			add_location(a, file, 96, 3, 3695);
    			script.async = true;
    			if (!src_url_equal(script.src, script_src_value = "https://platform.twitter.com/widgets.js")) attr_dev(script, "src", script_src_value);
    			attr_dev(script, "charset", "utf-8");
    			attr_dev(script, "class", "svelte-zkwrm1");
    			add_location(script, file, 96, 146, 3838);
    			attr_dev(div5, "class", "shill svelte-zkwrm1");
    			add_location(div5, file, 92, 2, 3505);
    			attr_dev(div6, "class", "topSection svelte-zkwrm1");
    			add_location(div6, file, 73, 1, 2812);
    			attr_dev(div7, "class", "container svelte-zkwrm1");
    			add_location(div7, file, 72, 0, 2787);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div6, t1);
    			append_dev(div6, form);
    			append_dev(form, input);
    			set_input_value(input, /*eggNumber*/ ctx[4]);
    			append_dev(form, t2);
    			append_dev(form, button);
    			append_dev(button, t3);
    			append_dev(div6, t4);
    			append_dev(div6, div1);
    			append_dev(div1, t5);
    			append_dev(div1, br0);
    			append_dev(div1, br1);
    			append_dev(div1, t6);
    			append_dev(div1, br2);
    			append_dev(div1, t7);
    			append_dev(div1, br3);
    			append_dev(div1, br4);
    			append_dev(div1, t8);
    			append_dev(div1, br5);
    			append_dev(div1, t9);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div5, t12);
    			append_dev(div5, div3);
    			append_dev(div5, t14);
    			append_dev(div5, div4);
    			append_dev(div5, t16);
    			append_dev(div5, a);
    			append_dev(div5, script);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[17]),
    					listen_dev(form, "submit", prevent_default(/*generateEgg*/ ctx[15]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*eggNumber*/ 16 && to_number(input.value) !== /*eggNumber*/ ctx[4]) {
    				set_input_value(input, /*eggNumber*/ ctx[4]);
    			}

    			if (dirty & /*eggNumber*/ 16 && button_disabled_value !== (button_disabled_value = !/*eggNumber*/ ctx[4])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(72:0) {#if !generate}",
    		ctx
    	});

    	return block;
    }

    // (102:0) {#if generate}
    function create_if_block(ctx) {
    	let div0;
    	let hsvpicker;
    	let t0;
    	let div12;
    	let div1;
    	let img;
    	let img_src_value;
    	let t1;
    	let div11;
    	let div7;
    	let div4;
    	let div2;
    	let t2;
    	let t3;
    	let div3;
    	let t5;
    	let div5;
    	let qrcode;
    	let t6;
    	let div6;
    	let t7;
    	let t8_value = /*pad*/ ctx[16](/*eggNumber*/ ctx[4]) + "";
    	let t8;
    	let t9;
    	let div10;
    	let div8;
    	let p;
    	let t11;
    	let div9;
    	let table;
    	let tr0;
    	let th0;
    	let t13;
    	let td0;
    	let t15;
    	let tr1;
    	let th1;
    	let t17;
    	let td1;
    	let t18;
    	let t19;
    	let tr2;
    	let th2;
    	let t21;
    	let td2;
    	let t22_value = /*pad*/ ctx[16](/*eggNumber*/ ctx[4]) + "";
    	let t22;
    	let t23;
    	let tr3;
    	let th3;
    	let t25;
    	let td3;
    	let t27;
    	let tr4;
    	let th4;
    	let t29;
    	let td4;
    	let current;

    	hsvpicker = new HsvPicker({
    			props: { startColor: "#0d0c0d" },
    			$$inline: true
    		});

    	hsvpicker.$on("colorChange", /*txtColorCallback*/ ctx[14]);

    	qrcode = new Lib({
    			props: { value: /*qrSrc*/ ctx[6], size: "75" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(hsvpicker.$$.fragment);
    			t0 = space();
    			div12 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t1 = space();
    			div11 = element("div");
    			div7 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			t2 = text(/*series*/ ctx[5]);
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = `${/*collectionName*/ ctx[10]}`;
    			t5 = space();
    			div5 = element("div");
    			create_component(qrcode.$$.fragment);
    			t6 = space();
    			div6 = element("div");
    			t7 = text("#");
    			t8 = text(t8_value);
    			t9 = space();
    			div10 = element("div");
    			div8 = element("div");
    			p = element("p");
    			p.textContent = `${/*longDescription*/ ctx[9]}`;
    			t11 = space();
    			div9 = element("div");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Collection";
    			t13 = space();
    			td0 = element("td");
    			td0.textContent = `${/*collectionNamePlural*/ ctx[11]}`;
    			t15 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Series";
    			t17 = space();
    			td1 = element("td");
    			t18 = text(/*series*/ ctx[5]);
    			t19 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Token ID";
    			t21 = space();
    			td2 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr3 = element("tr");
    			th3 = element("th");
    			th3.textContent = "Token Standard";
    			t25 = space();
    			td3 = element("td");
    			td3.textContent = "ERC-721";
    			t27 = space();
    			tr4 = element("tr");
    			th4 = element("th");
    			th4.textContent = "Blockchain";
    			t29 = space();
    			td4 = element("td");
    			td4.textContent = "Ethereum";
    			attr_dev(div0, "class", "no-print svelte-zkwrm1");
    			add_location(div0, file, 102, 0, 3969);
    			attr_dev(img, "class", "eggImage svelte-zkwrm1");
    			if (!src_url_equal(img.src, img_src_value = /*imgSrc*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "galaxy egg");
    			add_location(img, file, 106, 6, 4159);
    			attr_dev(div1, "class", "svelte-zkwrm1");
    			add_location(div1, file, 106, 1, 4154);
    			attr_dev(div2, "class", "collectionName svelte-zkwrm1");
    			add_location(div2, file, 110, 4, 4394);
    			attr_dev(div3, "class", "series svelte-zkwrm1");
    			add_location(div3, file, 111, 4, 4441);
    			attr_dev(div4, "class", "collectionSeries svelte-zkwrm1");
    			set_style(div4, "--coll-seriesborder", /*collSeriesBorder*/ ctx[2]);
    			add_location(div4, file, 109, 3, 4311);
    			attr_dev(div5, "class", "qrCode svelte-zkwrm1");
    			add_location(div5, file, 113, 3, 4497);
    			attr_dev(div6, "class", "eggNum svelte-zkwrm1");
    			set_style(div6, "--egg-num-size", /*eggNumSize*/ ctx[0]);
    			add_location(div6, file, 116, 3, 4570);
    			attr_dev(div7, "class", "row1 svelte-zkwrm1");
    			add_location(div7, file, 108, 2, 4289);
    			attr_dev(p, "class", "svelte-zkwrm1");
    			add_location(p, file, 122, 4, 4723);
    			attr_dev(div8, "class", "description svelte-zkwrm1");
    			add_location(div8, file, 121, 3, 4693);
    			attr_dev(th0, "class", "svelte-zkwrm1");
    			add_location(th0, file, 127, 6, 4844);
    			attr_dev(td0, "class", "svelte-zkwrm1");
    			add_location(td0, file, 128, 6, 4870);
    			attr_dev(tr0, "class", "svelte-zkwrm1");
    			add_location(tr0, file, 126, 5, 4833);
    			attr_dev(th1, "class", "svelte-zkwrm1");
    			add_location(th1, file, 131, 6, 4929);
    			attr_dev(td1, "class", "svelte-zkwrm1");
    			add_location(td1, file, 132, 6, 4951);
    			attr_dev(tr1, "class", "svelte-zkwrm1");
    			add_location(tr1, file, 130, 5, 4918);
    			attr_dev(th2, "class", "svelte-zkwrm1");
    			add_location(th2, file, 135, 6, 4996);
    			attr_dev(td2, "class", "svelte-zkwrm1");
    			add_location(td2, file, 136, 6, 5020);
    			attr_dev(tr2, "class", "svelte-zkwrm1");
    			add_location(tr2, file, 134, 5, 4985);
    			attr_dev(th3, "class", "svelte-zkwrm1");
    			add_location(th3, file, 139, 6, 5073);
    			attr_dev(td3, "class", "svelte-zkwrm1");
    			add_location(td3, file, 140, 6, 5103);
    			attr_dev(tr3, "class", "svelte-zkwrm1");
    			add_location(tr3, file, 138, 5, 5062);
    			attr_dev(th4, "class", "svelte-zkwrm1");
    			add_location(th4, file, 143, 6, 5147);
    			attr_dev(td4, "class", "svelte-zkwrm1");
    			add_location(td4, file, 144, 6, 5173);
    			attr_dev(tr4, "class", "svelte-zkwrm1");
    			add_location(tr4, file, 142, 5, 5136);
    			attr_dev(table, "border", "1");
    			attr_dev(table, "frame", "void");
    			attr_dev(table, "rules", "rows");
    			attr_dev(table, "class", "svelte-zkwrm1");
    			add_location(table, file, 125, 4, 4789);
    			attr_dev(div9, "class", "tableData svelte-zkwrm1");
    			add_location(div9, file, 124, 3, 4761);
    			attr_dev(div10, "class", "row2 svelte-zkwrm1");
    			add_location(div10, file, 120, 2, 4671);
    			attr_dev(div11, "class", "descriptionSection svelte-zkwrm1");
    			set_style(div11, "--main-width", /*mainWidth*/ ctx[8]);
    			add_location(div11, file, 107, 1, 4220);
    			attr_dev(div12, "class", "displaybox svelte-zkwrm1");
    			set_style(div12, "--main-width", /*mainWidth*/ ctx[8]);
    			set_style(div12, "--txt-color", /*txtColor*/ ctx[1]);
    			add_location(div12, file, 105, 0, 4070);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(hsvpicker, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div1);
    			append_dev(div1, img);
    			append_dev(div12, t1);
    			append_dev(div12, div11);
    			append_dev(div11, div7);
    			append_dev(div7, div4);
    			append_dev(div4, div2);
    			append_dev(div2, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div7, t5);
    			append_dev(div7, div5);
    			mount_component(qrcode, div5, null);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, t7);
    			append_dev(div6, t8);
    			append_dev(div11, t9);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div8, p);
    			append_dev(div10, t11);
    			append_dev(div10, div9);
    			append_dev(div9, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t13);
    			append_dev(tr0, td0);
    			append_dev(table, t15);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t17);
    			append_dev(tr1, td1);
    			append_dev(td1, t18);
    			append_dev(table, t19);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t21);
    			append_dev(tr2, td2);
    			append_dev(td2, t22);
    			append_dev(table, t23);
    			append_dev(table, tr3);
    			append_dev(tr3, th3);
    			append_dev(tr3, t25);
    			append_dev(tr3, td3);
    			append_dev(table, t27);
    			append_dev(table, tr4);
    			append_dev(tr4, th4);
    			append_dev(tr4, t29);
    			append_dev(tr4, td4);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*imgSrc*/ 8 && !src_url_equal(img.src, img_src_value = /*imgSrc*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*series*/ 32) set_data_dev(t2, /*series*/ ctx[5]);

    			if (!current || dirty & /*collSeriesBorder*/ 4) {
    				set_style(div4, "--coll-seriesborder", /*collSeriesBorder*/ ctx[2]);
    			}

    			const qrcode_changes = {};
    			if (dirty & /*qrSrc*/ 64) qrcode_changes.value = /*qrSrc*/ ctx[6];
    			qrcode.$set(qrcode_changes);
    			if ((!current || dirty & /*eggNumber*/ 16) && t8_value !== (t8_value = /*pad*/ ctx[16](/*eggNumber*/ ctx[4]) + "")) set_data_dev(t8, t8_value);

    			if (!current || dirty & /*eggNumSize*/ 1) {
    				set_style(div6, "--egg-num-size", /*eggNumSize*/ ctx[0]);
    			}

    			if (!current || dirty & /*series*/ 32) set_data_dev(t18, /*series*/ ctx[5]);
    			if ((!current || dirty & /*eggNumber*/ 16) && t22_value !== (t22_value = /*pad*/ ctx[16](/*eggNumber*/ ctx[4]) + "")) set_data_dev(t22, t22_value);

    			if (!current || dirty & /*txtColor*/ 2) {
    				set_style(div12, "--txt-color", /*txtColor*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hsvpicker.$$.fragment, local);
    			transition_in(qrcode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hsvpicker.$$.fragment, local);
    			transition_out(qrcode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(hsvpicker);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div12);
    			destroy_component(qrcode);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(102:0) {#if generate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let t;
    	let current;
    	let if_block0 = !/*generate*/ ctx[7] && create_if_block_1(ctx);
    	let if_block1 = /*generate*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(main, "class", "svelte-zkwrm1");
    			add_location(main, file, 70, 0, 2764);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t);
    			if (if_block1) if_block1.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*generate*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(main, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*generate*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*generate*/ 128) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let mainWidth = '718px';
    	let eggNumSize = '4.35em';
    	let txtColor = '#0d0c0d';
    	let collSeriesBorder = '#AFAFAF';

    	// determine the OS, fine tune the css to match
    	let os = "MacOS"; // default to MacOS

    	let appV = "";

    	if (navigator.appVersion.indexOf("Win") != -1) {
    		os = "Windows";
    		eggNumSize = '4.65em';
    	}

    	if (navigator.appVersion.indexOf("iPhone") != -1) {
    		os = "iPhone";
    		eggNumSize = '4.6em';
    	}

    	//if (navigator.appVersion.indexOf("X11") != -1) os = "UNIX";
    	//if (navigator.appVersion.indexOf("Linux") != -1) os = "Linux";
    	let imgSrc = 'https://galaxy-eggs-images.s3.amazonaws.com/2k/jpg/3621.jpg';

    	let description = "collection description";
    	let longDescription = '(Art)ificial is an art studio that explores the boundaries of technology and art. Our first project is Galaxy Eggs - a generative collection of 9,999 Eggs of the metaverse that live on the Ethereum Blockchain. Our Art Director, Gal Barkan, has been creating futuristic and sci-fi art for the past 20 years - this collection is the culmination of a lifetime of work on one hand, and the beginning of a new chapter in taking part in the creation of the metaverse.';
    	let collectionName = 'Galaxy Egg'; // hardcoded because name=GalaxyEggs
    	let collectionNamePlural = 'Galaxy Eggs'; // hardcoded because name=GalaxyEggs
    	let eggNumber = '';
    	let series = 'series';
    	let qrSrc = 'https://opensea.io/assets/0xa08126f5e1ed91a635987071e6ff5eb2aeb67c48/';
    	let generate = false;
    	let nftIdentifierLength = 4;
    	document.title = 'Print your egg!';
    	let web3Address = 'elifry.eth';
    	let ethAddress = '0x51f01329d318ED23b78E47eFa336C943BFC7Bf22';

    	function txtColorCallback(rgba) {
    		$$invalidate(1, txtColor = `rgb(${rgba.detail.r},${rgba.detail.g},${rgba.detail.b},${rgba.detail.a})`);
    		$$invalidate(2, collSeriesBorder = `rgb(${rgba.detail.r},${rgba.detail.g},${rgba.detail.b},${rgba.detail.a - 0.5})`);
    	}

    	// When generate button clicked, call the opensea API for details on the egg
    	const generateEgg = async () => {
    		fetch(`https://api.opensea.io/api/v1/assets?token_ids=${eggNumber}&order_direction=desc&offset=0&limit=1&collection=galaxyeggs9999`).then(response => response.json()).then(data => {
    			document.title = pad(eggNumber);
    			$$invalidate(6, qrSrc += eggNumber);
    			$$invalidate(3, imgSrc = data.assets[0].image_original_url);
    			description = data.assets[0].collection.description;
    			$$invalidate(5, series = data.assets[0].traits[0].value);
    			$$invalidate(7, generate = true);
    		}).catch(error => {
    			console.log(error);
    			return [];
    		});
    	};

    	// Pad the number to 4 digits, puting zeroes in front as needed
    	function pad(num) {
    		let s = ('0').repeat(nftIdentifierLength - 1) + num;
    		return s.substr(s.length - nftIdentifierLength);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		eggNumber = to_number(this.value);
    		$$invalidate(4, eggNumber);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		QrCode: Lib,
    		HsvPicker,
    		mainWidth,
    		eggNumSize,
    		txtColor,
    		collSeriesBorder,
    		os,
    		appV,
    		imgSrc,
    		description,
    		longDescription,
    		collectionName,
    		collectionNamePlural,
    		eggNumber,
    		series,
    		qrSrc,
    		generate,
    		nftIdentifierLength,
    		web3Address,
    		ethAddress,
    		txtColorCallback,
    		generateEgg,
    		pad
    	});

    	$$self.$inject_state = $$props => {
    		if ('mainWidth' in $$props) $$invalidate(8, mainWidth = $$props.mainWidth);
    		if ('eggNumSize' in $$props) $$invalidate(0, eggNumSize = $$props.eggNumSize);
    		if ('txtColor' in $$props) $$invalidate(1, txtColor = $$props.txtColor);
    		if ('collSeriesBorder' in $$props) $$invalidate(2, collSeriesBorder = $$props.collSeriesBorder);
    		if ('os' in $$props) os = $$props.os;
    		if ('appV' in $$props) appV = $$props.appV;
    		if ('imgSrc' in $$props) $$invalidate(3, imgSrc = $$props.imgSrc);
    		if ('description' in $$props) description = $$props.description;
    		if ('longDescription' in $$props) $$invalidate(9, longDescription = $$props.longDescription);
    		if ('collectionName' in $$props) $$invalidate(10, collectionName = $$props.collectionName);
    		if ('collectionNamePlural' in $$props) $$invalidate(11, collectionNamePlural = $$props.collectionNamePlural);
    		if ('eggNumber' in $$props) $$invalidate(4, eggNumber = $$props.eggNumber);
    		if ('series' in $$props) $$invalidate(5, series = $$props.series);
    		if ('qrSrc' in $$props) $$invalidate(6, qrSrc = $$props.qrSrc);
    		if ('generate' in $$props) $$invalidate(7, generate = $$props.generate);
    		if ('nftIdentifierLength' in $$props) nftIdentifierLength = $$props.nftIdentifierLength;
    		if ('web3Address' in $$props) $$invalidate(12, web3Address = $$props.web3Address);
    		if ('ethAddress' in $$props) $$invalidate(13, ethAddress = $$props.ethAddress);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		eggNumSize,
    		txtColor,
    		collSeriesBorder,
    		imgSrc,
    		eggNumber,
    		series,
    		qrSrc,
    		generate,
    		mainWidth,
    		longDescription,
    		collectionName,
    		collectionNamePlural,
    		web3Address,
    		ethAddress,
    		txtColorCallback,
    		generateEgg,
    		pad,
    		input_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
