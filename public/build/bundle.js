
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

    /* src/QRJS.svelte generated by Svelte v3.43.0 */
    const file$2 = "src/QRJS.svelte";

    function create_fragment$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "qrcode");
    			attr_dev(div, "class", "svelte-1e2c7iv");
    			add_location(div, file$2, 35, 0, 688);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots('QRJS', slots, []);
    	let { codeValue } = $$props;
    	let { squareSize } = $$props;
    	let { color } = $$props;
    	let qrcode;

    	onMount(() => {
    		let script = document.createElement('script');
    		script.src = "https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js";
    		document.head.append(script);

    		script.onload = function () {
    			qrcode = new QRCode("qrcode",
    			{
    					text: codeValue,
    					width: squareSize,
    					height: squareSize,
    					colorDark: color,
    					colorLight: "#ffffff",
    					correctLevel: QRCode.CorrectLevel.H
    				});
    		};
    	});

    	const writable_props = ['codeValue', 'squareSize', 'color'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<QRJS> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('codeValue' in $$props) $$invalidate(0, codeValue = $$props.codeValue);
    		if ('squareSize' in $$props) $$invalidate(1, squareSize = $$props.squareSize);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		codeValue,
    		squareSize,
    		color,
    		qrcode
    	});

    	$$self.$inject_state = $$props => {
    		if ('codeValue' in $$props) $$invalidate(0, codeValue = $$props.codeValue);
    		if ('squareSize' in $$props) $$invalidate(1, squareSize = $$props.squareSize);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('qrcode' in $$props) qrcode = $$props.qrcode;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [codeValue, squareSize, color];
    }

    class QRJS extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { codeValue: 0, squareSize: 1, color: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QRJS",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*codeValue*/ ctx[0] === undefined && !('codeValue' in props)) {
    			console.warn("<QRJS> was created without expected prop 'codeValue'");
    		}

    		if (/*squareSize*/ ctx[1] === undefined && !('squareSize' in props)) {
    			console.warn("<QRJS> was created without expected prop 'squareSize'");
    		}

    		if (/*color*/ ctx[2] === undefined && !('color' in props)) {
    			console.warn("<QRJS> was created without expected prop 'color'");
    		}
    	}

    	get codeValue() {
    		throw new Error("<QRJS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set codeValue(value) {
    		throw new Error("<QRJS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get squareSize() {
    		throw new Error("<QRJS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set squareSize(value) {
    		throw new Error("<QRJS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<QRJS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<QRJS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

    function create_fragment(ctx) {
    	let main;
    	let div52;
    	let div37;
    	let div28;
    	let h1;
    	let t1;
    	let div3;
    	let input0;
    	let t2;
    	let label0;
    	let div0;
    	let div1;
    	let t4;
    	let div2;
    	let t5;
    	let form0;
    	let input1;
    	let t6;
    	let div15;
    	let input2;
    	let t7;
    	let label1;
    	let div4;
    	let div5;
    	let t9;
    	let div14;
    	let div9;
    	let input3;
    	let t10;
    	let label2;
    	let div6;
    	let t12;
    	let div7;
    	let t13;
    	let div8;
    	let hsvpicker0;
    	let t14;
    	let div13;
    	let input4;
    	let t15;
    	let label3;
    	let div10;
    	let t17;
    	let div11;
    	let t18;
    	let div12;
    	let hsvpicker1;
    	let t19;
    	let div27;
    	let input5;
    	let t20;
    	let label4;
    	let div16;
    	let div17;
    	let t22;
    	let div26;
    	let div21;
    	let input6;
    	let t23;
    	let label5;
    	let div18;
    	let t25;
    	let div19;
    	let t26;
    	let div20;
    	let t28;
    	let div25;
    	let input7;
    	let t29;
    	let label6;
    	let div22;
    	let t31;
    	let div23;
    	let t32;
    	let div24;
    	let t34;
    	let div36;
    	let div35;
    	let div29;
    	let t36;
    	let form1;
    	let input8;
    	let t37;
    	let button0;
    	let t38;
    	let button0_disabled_value;
    	let t39;
    	let hsvpicker2;
    	let t40;
    	let div30;
    	let t41;
    	let br0;
    	let br1;
    	let t42;
    	let br2;
    	let t43;
    	let br3;
    	let br4;
    	let t44;
    	let br5;
    	let t45;
    	let t46;
    	let div34;
    	let div31;
    	let t48;
    	let div32;
    	let t50;
    	let div33;
    	let t52;
    	let a;
    	let script;
    	let script_src_value;
    	let t54;
    	let div51;
    	let div38;
    	let t56;
    	let button1;
    	let t57;
    	let button1_disabled_value;
    	let t58;
    	let div50;
    	let div39;
    	let img;
    	let img_src_value;
    	let t59;
    	let div49;
    	let div45;
    	let div40;
    	let qrcode;
    	let t60;
    	let div43;
    	let div41;
    	let t61;
    	let t62;
    	let div42;
    	let t64;
    	let div44;
    	let t65;
    	let t66_value = /*pad*/ ctx[15](/*eggNumber*/ ctx[4]) + "";
    	let t66;
    	let t67;
    	let div48;
    	let div46;
    	let p;
    	let t69;
    	let div47;
    	let table;
    	let tr0;
    	let th0;
    	let t71;
    	let td0;
    	let t73;
    	let tr1;
    	let th1;
    	let t75;
    	let td1;
    	let t76;
    	let t77;
    	let tr2;
    	let th2;
    	let t79;
    	let td2;
    	let t80_value = /*pad*/ ctx[15](/*eggNumber*/ ctx[4]) + "";
    	let t80;
    	let t81;
    	let tr3;
    	let th3;
    	let t83;
    	let td3;
    	let t85;
    	let tr4;
    	let th4;
    	let t87;
    	let td4;
    	let current;
    	let mounted;
    	let dispose;

    	hsvpicker0 = new HsvPicker({
    			props: { startColor: "#0d0c0d" },
    			$$inline: true
    		});

    	hsvpicker0.$on("colorChange", /*txtColorCallback*/ ctx[13]);

    	hsvpicker1 = new HsvPicker({
    			props: { startColor: "#0d0c0d" },
    			$$inline: true
    		});

    	hsvpicker1.$on("colorChange", /*txtColorCallback*/ ctx[13]);

    	hsvpicker2 = new HsvPicker({
    			props: { startColor: "#0d0c0d" },
    			$$inline: true
    		});

    	hsvpicker2.$on("colorChange", /*txtColorCallback*/ ctx[13]);

    	qrcode = new QRJS({
    			props: {
    				codeValue: /*qrSrc*/ ctx[6],
    				squareSize: "80",
    				color: /*txtColor*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div52 = element("div");
    			div37 = element("div");
    			div28 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Customize your print";
    			t1 = space();
    			div3 = element("div");
    			input0 = element("input");
    			t2 = space();
    			label0 = element("label");
    			div0 = element("div");
    			div0.textContent = "eggs to print";
    			div1 = element("div");
    			t4 = space();
    			div2 = element("div");
    			t5 = text(", soluta doloribus distinctio saepe labore v\n\t\t\t\t\t");
    			form0 = element("form");
    			input1 = element("input");
    			t6 = space();
    			div15 = element("div");
    			input2 = element("input");
    			t7 = space();
    			label1 = element("label");
    			div4 = element("div");
    			div4.textContent = "colors";
    			div5 = element("div");
    			t9 = space();
    			div14 = element("div");
    			div9 = element("div");
    			input3 = element("input");
    			t10 = space();
    			label2 = element("label");
    			div6 = element("div");
    			div6.textContent = "text color";
    			t12 = space();
    			div7 = element("div");
    			t13 = space();
    			div8 = element("div");
    			create_component(hsvpicker0.$$.fragment);
    			t14 = space();
    			div13 = element("div");
    			input4 = element("input");
    			t15 = space();
    			label3 = element("label");
    			div10 = element("div");
    			div10.textContent = "background color";
    			t17 = space();
    			div11 = element("div");
    			t18 = space();
    			div12 = element("div");
    			create_component(hsvpicker1.$$.fragment);
    			t19 = space();
    			div27 = element("div");
    			input5 = element("input");
    			t20 = space();
    			label4 = element("label");
    			div16 = element("div");
    			div16.textContent = "tab three";
    			div17 = element("div");
    			t22 = space();
    			div26 = element("div");
    			div21 = element("div");
    			input6 = element("input");
    			t23 = space();
    			label5 = element("label");
    			div18 = element("div");
    			div18.textContent = "question one";
    			t25 = space();
    			div19 = element("div");
    			t26 = space();
    			div20 = element("div");
    			div20.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsam atque, soluta doloribus distinctio saepe labore voluptates facere illum alias perferendis praesentium quia vel accusamus incidunt corporis veniam sapiente. Voluptate, quasi.";
    			t28 = space();
    			div25 = element("div");
    			input7 = element("input");
    			t29 = space();
    			label6 = element("label");
    			div22 = element("div");
    			div22.textContent = "question two";
    			t31 = space();
    			div23 = element("div");
    			t32 = space();
    			div24 = element("div");
    			div24.textContent = "Ipsam atque, soluta doloribus distinctio saepe labore voluptates facere illum alias perferendis praesentium quia vel accusamus incidunt corporis veniam sapiente. Voluptate, quasi.";
    			t34 = space();
    			div36 = element("div");
    			div35 = element("div");
    			div29 = element("div");
    			div29.textContent = "Turn your Galaxy Eggs into a nice printable PDF!";
    			t36 = space();
    			form1 = element("form");
    			input8 = element("input");
    			t37 = space();
    			button0 = element("button");
    			t38 = text("Generate");
    			t39 = space();
    			create_component(hsvpicker2.$$.fragment);
    			t40 = space();
    			div30 = element("div");
    			t41 = text("How it works:\n\t\t\t\t\t");
    			br0 = element("br");
    			br1 = element("br");
    			t42 = text("\n\t\t\t\t\tPut in your egg number and hit \"Generate\".\n\t\t\t\t\t");
    			br2 = element("br");
    			t43 = text("\n\t\t\t\t\tOnce it is generated, right-click to print, and save as PDF.\n\t\t\t\t\t");
    			br3 = element("br");
    			br4 = element("br");
    			t44 = text("\n\t\t\t\t\tNOTE: Make sure you have Headers and Footers turned off\n\t\t\t\t\t");
    			br5 = element("br");
    			t45 = text("\n\t\t\t\t\t(Chrome: More Settings > Options > Headers and footers)");
    			t46 = space();
    			div34 = element("div");
    			div31 = element("div");
    			div31.textContent = "Like this tool? Here's my eth address:";
    			t48 = space();
    			div32 = element("div");
    			div32.textContent = `${/*web3Address*/ ctx[11]}`;
    			t50 = space();
    			div33 = element("div");
    			div33.textContent = `${/*ethAddress*/ ctx[12]}`;
    			t52 = space();
    			a = element("a");
    			a.textContent = "Follow @acuriousother";
    			script = element("script");
    			t54 = space();
    			div51 = element("div");
    			div38 = element("div");
    			div38.textContent = "PREVIEW";
    			t56 = space();
    			button1 = element("button");
    			t57 = text("download");
    			t58 = space();
    			div50 = element("div");
    			div39 = element("div");
    			img = element("img");
    			t59 = space();
    			div49 = element("div");
    			div45 = element("div");
    			div40 = element("div");
    			create_component(qrcode.$$.fragment);
    			t60 = space();
    			div43 = element("div");
    			div41 = element("div");
    			t61 = text(/*series*/ ctx[5]);
    			t62 = space();
    			div42 = element("div");
    			div42.textContent = `${/*collectionName*/ ctx[9]}`;
    			t64 = space();
    			div44 = element("div");
    			t65 = text("#");
    			t66 = text(t66_value);
    			t67 = space();
    			div48 = element("div");
    			div46 = element("div");
    			p = element("p");
    			p.textContent = `${/*longDescription*/ ctx[8]}`;
    			t69 = space();
    			div47 = element("div");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Collection";
    			t71 = space();
    			td0 = element("td");
    			td0.textContent = `${/*collectionNamePlural*/ ctx[10]}`;
    			t73 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Series";
    			t75 = space();
    			td1 = element("td");
    			t76 = text(/*series*/ ctx[5]);
    			t77 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Token ID";
    			t79 = space();
    			td2 = element("td");
    			t80 = text(t80_value);
    			t81 = space();
    			tr3 = element("tr");
    			th3 = element("th");
    			th3.textContent = "Token Standard";
    			t83 = space();
    			td3 = element("td");
    			td3.textContent = "ERC-721";
    			t85 = space();
    			tr4 = element("tr");
    			th4 = element("th");
    			th4.textContent = "Blockchain";
    			t87 = space();
    			td4 = element("td");
    			td4.textContent = "Ethereum";
    			attr_dev(h1, "class", "svelte-h1jxv0");
    			add_location(h1, file, 76, 3, 2811);
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "id", "tab-1");
    			attr_dev(input0, "name", "tabs");
    			attr_dev(input0, "class", "svelte-h1jxv0");
    			add_location(input0, file, 78, 4, 2869);
    			attr_dev(div0, "class", "svelte-h1jxv0");
    			add_location(div0, file, 79, 23, 2936);
    			attr_dev(div1, "class", "cross svelte-h1jxv0");
    			add_location(div1, file, 79, 47, 2960);
    			attr_dev(label0, "for", "tab-1");
    			attr_dev(label0, "class", "svelte-h1jxv0");
    			add_location(label0, file, 79, 4, 2917);
    			attr_dev(input1, "id", "textboxid");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "placeholder", "#");
    			attr_dev(input1, "autocomplete", "off");
    			attr_dev(input1, "class", "svelte-h1jxv0");
    			add_location(input1, file, 83, 6, 3127);
    			attr_dev(form0, "class", "svelte-h1jxv0");
    			add_location(form0, file, 82, 5, 3075);
    			attr_dev(div2, "class", "content svelte-h1jxv0");
    			add_location(div2, file, 80, 4, 2998);
    			attr_dev(div3, "class", "wrap-1 svelte-h1jxv0");
    			add_location(div3, file, 77, 3, 2844);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "id", "tab-2");
    			attr_dev(input2, "name", "tabs");
    			attr_dev(input2, "class", "svelte-h1jxv0");
    			add_location(input2, file, 88, 4, 3283);
    			attr_dev(div4, "class", "svelte-h1jxv0");
    			add_location(div4, file, 89, 23, 3350);
    			attr_dev(div5, "class", "cross svelte-h1jxv0");
    			add_location(div5, file, 89, 40, 3367);
    			attr_dev(label1, "for", "tab-2");
    			attr_dev(label1, "class", "svelte-h1jxv0");
    			add_location(label1, file, 89, 4, 3331);
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "id", "question-3");
    			attr_dev(input3, "name", "question");
    			attr_dev(input3, "class", "svelte-h1jxv0");
    			add_location(input3, file, 93, 6, 3469);
    			attr_dev(div6, "class", "svelte-h1jxv0");
    			add_location(div6, file, 94, 30, 3552);
    			attr_dev(div7, "class", "cross svelte-h1jxv0");
    			add_location(div7, file, 94, 52, 3574);
    			attr_dev(label2, "for", "question-3");
    			attr_dev(label2, "class", "svelte-h1jxv0");
    			add_location(label2, file, 94, 6, 3528);
    			attr_dev(div8, "class", "content svelte-h1jxv0");
    			add_location(div8, file, 95, 6, 3614);
    			attr_dev(div9, "class", "question-wrap svelte-h1jxv0");
    			add_location(div9, file, 92, 5, 3435);
    			attr_dev(input4, "type", "radio");
    			attr_dev(input4, "id", "question-4");
    			attr_dev(input4, "name", "question");
    			attr_dev(input4, "class", "svelte-h1jxv0");
    			add_location(input4, file, 100, 6, 3777);
    			attr_dev(div10, "class", "svelte-h1jxv0");
    			add_location(div10, file, 101, 30, 3860);
    			attr_dev(div11, "class", "cross svelte-h1jxv0");
    			add_location(div11, file, 101, 58, 3888);
    			attr_dev(label3, "for", "question-4");
    			attr_dev(label3, "class", "svelte-h1jxv0");
    			add_location(label3, file, 101, 6, 3836);
    			attr_dev(div12, "class", "content svelte-h1jxv0");
    			add_location(div12, file, 102, 6, 3928);
    			attr_dev(div13, "class", "question-wrap svelte-h1jxv0");
    			add_location(div13, file, 99, 5, 3743);
    			attr_dev(div14, "class", "questions svelte-h1jxv0");
    			add_location(div14, file, 91, 4, 3406);
    			attr_dev(div15, "class", "wrap-2 svelte-h1jxv0");
    			add_location(div15, file, 87, 3, 3258);
    			attr_dev(input5, "type", "radio");
    			attr_dev(input5, "id", "tab-3");
    			attr_dev(input5, "name", "tabs");
    			attr_dev(input5, "class", "svelte-h1jxv0");
    			add_location(input5, file, 110, 4, 4102);
    			attr_dev(div16, "class", "svelte-h1jxv0");
    			add_location(div16, file, 111, 23, 4169);
    			attr_dev(div17, "class", "cross svelte-h1jxv0");
    			add_location(div17, file, 111, 43, 4189);
    			attr_dev(label4, "for", "tab-3");
    			attr_dev(label4, "class", "svelte-h1jxv0");
    			add_location(label4, file, 111, 4, 4150);
    			attr_dev(input6, "type", "radio");
    			attr_dev(input6, "id", "question-1");
    			attr_dev(input6, "name", "question");
    			attr_dev(input6, "class", "svelte-h1jxv0");
    			add_location(input6, file, 114, 6, 4290);
    			attr_dev(div18, "class", "svelte-h1jxv0");
    			add_location(div18, file, 115, 30, 4373);
    			attr_dev(div19, "class", "cross svelte-h1jxv0");
    			add_location(div19, file, 115, 54, 4397);
    			attr_dev(label5, "for", "question-1");
    			attr_dev(label5, "class", "svelte-h1jxv0");
    			add_location(label5, file, 115, 6, 4349);
    			attr_dev(div20, "class", "content svelte-h1jxv0");
    			add_location(div20, file, 116, 6, 4437);
    			attr_dev(div21, "class", "question-wrap svelte-h1jxv0");
    			add_location(div21, file, 113, 5, 4256);
    			attr_dev(input7, "type", "radio");
    			attr_dev(input7, "id", "question-2");
    			attr_dev(input7, "name", "question");
    			attr_dev(input7, "class", "svelte-h1jxv0");
    			add_location(input7, file, 121, 6, 4767);
    			attr_dev(div22, "class", "svelte-h1jxv0");
    			add_location(div22, file, 122, 30, 4850);
    			attr_dev(div23, "class", "cross svelte-h1jxv0");
    			add_location(div23, file, 122, 54, 4874);
    			attr_dev(label6, "for", "question-2");
    			attr_dev(label6, "class", "svelte-h1jxv0");
    			add_location(label6, file, 122, 6, 4826);
    			attr_dev(div24, "class", "content svelte-h1jxv0");
    			add_location(div24, file, 123, 6, 4914);
    			attr_dev(div25, "class", "question-wrap svelte-h1jxv0");
    			add_location(div25, file, 120, 5, 4733);
    			attr_dev(div26, "class", "questions svelte-h1jxv0");
    			add_location(div26, file, 112, 4, 4227);
    			attr_dev(div27, "class", "wrap-3 svelte-h1jxv0");
    			add_location(div27, file, 109, 3, 4077);
    			attr_dev(div28, "class", "wrapper svelte-h1jxv0");
    			add_location(div28, file, 75, 2, 2786);
    			attr_dev(div29, "class", "intro svelte-h1jxv0");
    			add_location(div29, file, 132, 4, 5232);
    			attr_dev(input8, "id", "textboxid");
    			attr_dev(input8, "type", "number");
    			attr_dev(input8, "placeholder", "#");
    			attr_dev(input8, "autocomplete", "off");
    			attr_dev(input8, "class", "svelte-h1jxv0");
    			add_location(input8, file, 136, 5, 5372);
    			attr_dev(button0, "id", "buttonid");
    			attr_dev(button0, "type", "submit");
    			button0.disabled = button0_disabled_value = !/*eggNumber*/ ctx[4];
    			attr_dev(button0, "class", "btn btn__primary btn__lg svelte-h1jxv0");
    			add_location(button0, file, 137, 5, 5471);
    			attr_dev(form1, "class", "svelte-h1jxv0");
    			add_location(form1, file, 135, 4, 5321);
    			attr_dev(br0, "class", "svelte-h1jxv0");
    			add_location(br0, file, 144, 5, 5885);
    			attr_dev(br1, "class", "svelte-h1jxv0");
    			add_location(br1, file, 144, 9, 5889);
    			attr_dev(br2, "class", "svelte-h1jxv0");
    			add_location(br2, file, 146, 5, 5947);
    			attr_dev(br3, "class", "svelte-h1jxv0");
    			add_location(br3, file, 148, 5, 6023);
    			attr_dev(br4, "class", "svelte-h1jxv0");
    			add_location(br4, file, 148, 9, 6027);
    			attr_dev(br5, "class", "svelte-h1jxv0");
    			add_location(br5, file, 150, 5, 6098);
    			attr_dev(div30, "class", "howto svelte-h1jxv0");
    			add_location(div30, file, 142, 4, 5841);
    			attr_dev(div31, "class", "shilllinefirst svelte-h1jxv0");
    			add_location(div31, file, 154, 5, 6204);
    			attr_dev(div32, "class", "shillline svelte-h1jxv0");
    			add_location(div32, file, 155, 5, 6282);
    			attr_dev(div33, "class", "shillline svelte-h1jxv0");
    			add_location(div33, file, 156, 5, 6330);
    			attr_dev(a, "href", "https://twitter.com/acuriousother?ref_src=twsrc%5Etfw");
    			attr_dev(a, "class", "twitter-follow-button svelte-h1jxv0");
    			attr_dev(a, "data-show-count", "false");
    			add_location(a, file, 157, 5, 6377);
    			script.async = true;
    			if (!src_url_equal(script.src, script_src_value = "https://platform.twitter.com/widgets.js")) attr_dev(script, "src", script_src_value);
    			attr_dev(script, "charset", "utf-8");
    			attr_dev(script, "class", "svelte-h1jxv0");
    			add_location(script, file, 157, 148, 6520);
    			attr_dev(div34, "class", "shill svelte-h1jxv0");
    			add_location(div34, file, 153, 4, 6179);
    			attr_dev(div35, "class", "topSection svelte-h1jxv0");
    			add_location(div35, file, 131, 3, 5203);
    			attr_dev(div36, "class", "hidden svelte-h1jxv0");
    			add_location(div36, file, 130, 2, 5179);
    			attr_dev(div37, "id", "left-side");
    			attr_dev(div37, "class", "svelte-h1jxv0");
    			add_location(div37, file, 74, 1, 2763);
    			attr_dev(div38, "id", "preview-title");
    			attr_dev(div38, "class", "svelte-h1jxv0");
    			add_location(div38, file, 164, 2, 6694);
    			attr_dev(button1, "id", "buttonid");
    			attr_dev(button1, "type", "submit");
    			button1.disabled = button1_disabled_value = !/*eggNumber*/ ctx[4];
    			attr_dev(button1, "class", "btn btn__primary btn__lg svelte-h1jxv0");
    			add_location(button1, file, 167, 2, 6741);
    			attr_dev(img, "class", "egg-image svelte-h1jxv0");
    			if (!src_url_equal(img.src, img_src_value = /*imgSrc*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "galaxy egg");
    			add_location(img, file, 169, 8, 6956);
    			attr_dev(div39, "class", "svelte-h1jxv0");
    			add_location(div39, file, 169, 3, 6951);
    			attr_dev(div40, "class", "qr-code svelte-h1jxv0");
    			add_location(div40, file, 172, 5, 7115);
    			attr_dev(div41, "class", "collectionName svelte-h1jxv0");
    			add_location(div41, file, 176, 6, 7306);
    			attr_dev(div42, "class", "series svelte-h1jxv0");
    			add_location(div42, file, 177, 6, 7355);
    			attr_dev(div43, "class", "collectionSeries svelte-h1jxv0");
    			set_style(div43, "--coll-seriesborder", /*collSeriesBorder*/ ctx[2]);
    			add_location(div43, file, 175, 5, 7221);
    			attr_dev(div44, "class", "eggNum svelte-h1jxv0");
    			set_style(div44, "--egg-num-size", /*eggNumSize*/ ctx[0]);
    			add_location(div44, file, 179, 5, 7415);
    			attr_dev(div45, "class", "row1 svelte-h1jxv0");
    			add_location(div45, file, 171, 4, 7091);
    			attr_dev(p, "class", "svelte-h1jxv0");
    			add_location(p, file, 185, 6, 7580);
    			attr_dev(div46, "class", "description svelte-h1jxv0");
    			add_location(div46, file, 184, 5, 7548);
    			attr_dev(th0, "class", "svelte-h1jxv0");
    			add_location(th0, file, 190, 8, 7711);
    			attr_dev(td0, "class", "svelte-h1jxv0");
    			add_location(td0, file, 191, 8, 7739);
    			attr_dev(tr0, "class", "svelte-h1jxv0");
    			add_location(tr0, file, 189, 7, 7698);
    			attr_dev(th1, "class", "svelte-h1jxv0");
    			add_location(th1, file, 194, 8, 7804);
    			attr_dev(td1, "class", "svelte-h1jxv0");
    			add_location(td1, file, 195, 8, 7828);
    			attr_dev(tr1, "class", "svelte-h1jxv0");
    			add_location(tr1, file, 193, 7, 7791);
    			attr_dev(th2, "class", "svelte-h1jxv0");
    			add_location(th2, file, 198, 8, 7879);
    			attr_dev(td2, "class", "svelte-h1jxv0");
    			add_location(td2, file, 199, 8, 7905);
    			attr_dev(tr2, "class", "svelte-h1jxv0");
    			add_location(tr2, file, 197, 7, 7866);
    			attr_dev(th3, "class", "svelte-h1jxv0");
    			add_location(th3, file, 202, 8, 7964);
    			attr_dev(td3, "class", "svelte-h1jxv0");
    			add_location(td3, file, 203, 8, 7996);
    			attr_dev(tr3, "class", "svelte-h1jxv0");
    			add_location(tr3, file, 201, 7, 7951);
    			attr_dev(th4, "class", "svelte-h1jxv0");
    			add_location(th4, file, 206, 8, 8046);
    			attr_dev(td4, "class", "svelte-h1jxv0");
    			add_location(td4, file, 207, 8, 8074);
    			attr_dev(tr4, "class", "svelte-h1jxv0");
    			add_location(tr4, file, 205, 7, 8033);
    			attr_dev(table, "border", "1");
    			attr_dev(table, "frame", "void");
    			attr_dev(table, "rules", "rows");
    			attr_dev(table, "class", "svelte-h1jxv0");
    			add_location(table, file, 188, 6, 7652);
    			attr_dev(div47, "class", "tableData svelte-h1jxv0");
    			add_location(div47, file, 187, 5, 7622);
    			attr_dev(div48, "class", "row2 svelte-h1jxv0");
    			add_location(div48, file, 183, 4, 7524);
    			attr_dev(div49, "class", "descriptionSection svelte-h1jxv0");
    			set_style(div49, "--main-width", /*mainWidth*/ ctx[7]);
    			add_location(div49, file, 170, 3, 7020);
    			attr_dev(div50, "id", "display-box");
    			attr_dev(div50, "class", "shrink svelte-h1jxv0");
    			set_style(div50, "--main-width", /*mainWidth*/ ctx[7]);
    			set_style(div50, "--txt-color", /*txtColor*/ ctx[1]);
    			add_location(div50, file, 168, 2, 6852);
    			attr_dev(div51, "id", "right-side");
    			attr_dev(div51, "class", "svelte-h1jxv0");
    			add_location(div51, file, 163, 1, 6670);
    			attr_dev(div52, "class", "top-container svelte-h1jxv0");
    			add_location(div52, file, 73, 0, 2734);
    			attr_dev(main, "class", "svelte-h1jxv0");
    			add_location(main, file, 72, 0, 2727);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div52);
    			append_dev(div52, div37);
    			append_dev(div37, div28);
    			append_dev(div28, h1);
    			append_dev(div28, t1);
    			append_dev(div28, div3);
    			append_dev(div3, input0);
    			append_dev(div3, t2);
    			append_dev(div3, label0);
    			append_dev(label0, div0);
    			append_dev(label0, div1);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, t5);
    			append_dev(div2, form0);
    			append_dev(form0, input1);
    			set_input_value(input1, /*eggNumber*/ ctx[4]);
    			append_dev(div28, t6);
    			append_dev(div28, div15);
    			append_dev(div15, input2);
    			append_dev(div15, t7);
    			append_dev(div15, label1);
    			append_dev(label1, div4);
    			append_dev(label1, div5);
    			append_dev(div15, t9);
    			append_dev(div15, div14);
    			append_dev(div14, div9);
    			append_dev(div9, input3);
    			append_dev(div9, t10);
    			append_dev(div9, label2);
    			append_dev(label2, div6);
    			append_dev(label2, t12);
    			append_dev(label2, div7);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			mount_component(hsvpicker0, div8, null);
    			append_dev(div14, t14);
    			append_dev(div14, div13);
    			append_dev(div13, input4);
    			append_dev(div13, t15);
    			append_dev(div13, label3);
    			append_dev(label3, div10);
    			append_dev(label3, t17);
    			append_dev(label3, div11);
    			append_dev(div13, t18);
    			append_dev(div13, div12);
    			mount_component(hsvpicker1, div12, null);
    			append_dev(div28, t19);
    			append_dev(div28, div27);
    			append_dev(div27, input5);
    			append_dev(div27, t20);
    			append_dev(div27, label4);
    			append_dev(label4, div16);
    			append_dev(label4, div17);
    			append_dev(div27, t22);
    			append_dev(div27, div26);
    			append_dev(div26, div21);
    			append_dev(div21, input6);
    			append_dev(div21, t23);
    			append_dev(div21, label5);
    			append_dev(label5, div18);
    			append_dev(label5, t25);
    			append_dev(label5, div19);
    			append_dev(div21, t26);
    			append_dev(div21, div20);
    			append_dev(div26, t28);
    			append_dev(div26, div25);
    			append_dev(div25, input7);
    			append_dev(div25, t29);
    			append_dev(div25, label6);
    			append_dev(label6, div22);
    			append_dev(label6, t31);
    			append_dev(label6, div23);
    			append_dev(div25, t32);
    			append_dev(div25, div24);
    			append_dev(div37, t34);
    			append_dev(div37, div36);
    			append_dev(div36, div35);
    			append_dev(div35, div29);
    			append_dev(div35, t36);
    			append_dev(div35, form1);
    			append_dev(form1, input8);
    			set_input_value(input8, /*eggNumber*/ ctx[4]);
    			append_dev(form1, t37);
    			append_dev(form1, button0);
    			append_dev(button0, t38);
    			append_dev(div35, t39);
    			mount_component(hsvpicker2, div35, null);
    			append_dev(div35, t40);
    			append_dev(div35, div30);
    			append_dev(div30, t41);
    			append_dev(div30, br0);
    			append_dev(div30, br1);
    			append_dev(div30, t42);
    			append_dev(div30, br2);
    			append_dev(div30, t43);
    			append_dev(div30, br3);
    			append_dev(div30, br4);
    			append_dev(div30, t44);
    			append_dev(div30, br5);
    			append_dev(div30, t45);
    			append_dev(div35, t46);
    			append_dev(div35, div34);
    			append_dev(div34, div31);
    			append_dev(div34, t48);
    			append_dev(div34, div32);
    			append_dev(div34, t50);
    			append_dev(div34, div33);
    			append_dev(div34, t52);
    			append_dev(div34, a);
    			append_dev(div34, script);
    			append_dev(div52, t54);
    			append_dev(div52, div51);
    			append_dev(div51, div38);
    			append_dev(div51, t56);
    			append_dev(div51, button1);
    			append_dev(button1, t57);
    			append_dev(div51, t58);
    			append_dev(div51, div50);
    			append_dev(div50, div39);
    			append_dev(div39, img);
    			append_dev(div50, t59);
    			append_dev(div50, div49);
    			append_dev(div49, div45);
    			append_dev(div45, div40);
    			mount_component(qrcode, div40, null);
    			append_dev(div45, t60);
    			append_dev(div45, div43);
    			append_dev(div43, div41);
    			append_dev(div41, t61);
    			append_dev(div43, t62);
    			append_dev(div43, div42);
    			append_dev(div45, t64);
    			append_dev(div45, div44);
    			append_dev(div44, t65);
    			append_dev(div44, t66);
    			append_dev(div49, t67);
    			append_dev(div49, div48);
    			append_dev(div48, div46);
    			append_dev(div46, p);
    			append_dev(div48, t69);
    			append_dev(div48, div47);
    			append_dev(div47, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t71);
    			append_dev(tr0, td0);
    			append_dev(table, t73);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t75);
    			append_dev(tr1, td1);
    			append_dev(td1, t76);
    			append_dev(table, t77);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t79);
    			append_dev(tr2, td2);
    			append_dev(td2, t80);
    			append_dev(table, t81);
    			append_dev(table, tr3);
    			append_dev(tr3, th3);
    			append_dev(tr3, t83);
    			append_dev(tr3, td3);
    			append_dev(table, t85);
    			append_dev(table, tr4);
    			append_dev(tr4, th4);
    			append_dev(tr4, t87);
    			append_dev(tr4, td4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[16]),
    					listen_dev(form0, "submit", prevent_default(/*generateEgg*/ ctx[14]), false, true, false),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[17]),
    					listen_dev(form1, "submit", prevent_default(/*generateEgg*/ ctx[14]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*eggNumber*/ 16 && to_number(input1.value) !== /*eggNumber*/ ctx[4]) {
    				set_input_value(input1, /*eggNumber*/ ctx[4]);
    			}

    			if (dirty & /*eggNumber*/ 16 && to_number(input8.value) !== /*eggNumber*/ ctx[4]) {
    				set_input_value(input8, /*eggNumber*/ ctx[4]);
    			}

    			if (!current || dirty & /*eggNumber*/ 16 && button0_disabled_value !== (button0_disabled_value = !/*eggNumber*/ ctx[4])) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (!current || dirty & /*eggNumber*/ 16 && button1_disabled_value !== (button1_disabled_value = !/*eggNumber*/ ctx[4])) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}

    			if (!current || dirty & /*imgSrc*/ 8 && !src_url_equal(img.src, img_src_value = /*imgSrc*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			const qrcode_changes = {};
    			if (dirty & /*qrSrc*/ 64) qrcode_changes.codeValue = /*qrSrc*/ ctx[6];
    			if (dirty & /*txtColor*/ 2) qrcode_changes.color = /*txtColor*/ ctx[1];
    			qrcode.$set(qrcode_changes);
    			if (!current || dirty & /*series*/ 32) set_data_dev(t61, /*series*/ ctx[5]);

    			if (!current || dirty & /*collSeriesBorder*/ 4) {
    				set_style(div43, "--coll-seriesborder", /*collSeriesBorder*/ ctx[2]);
    			}

    			if ((!current || dirty & /*eggNumber*/ 16) && t66_value !== (t66_value = /*pad*/ ctx[15](/*eggNumber*/ ctx[4]) + "")) set_data_dev(t66, t66_value);

    			if (!current || dirty & /*eggNumSize*/ 1) {
    				set_style(div44, "--egg-num-size", /*eggNumSize*/ ctx[0]);
    			}

    			if (!current || dirty & /*series*/ 32) set_data_dev(t76, /*series*/ ctx[5]);
    			if ((!current || dirty & /*eggNumber*/ 16) && t80_value !== (t80_value = /*pad*/ ctx[15](/*eggNumber*/ ctx[4]) + "")) set_data_dev(t80, t80_value);

    			if (!current || dirty & /*txtColor*/ 2) {
    				set_style(div50, "--txt-color", /*txtColor*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hsvpicker0.$$.fragment, local);
    			transition_in(hsvpicker1.$$.fragment, local);
    			transition_in(hsvpicker2.$$.fragment, local);
    			transition_in(qrcode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hsvpicker0.$$.fragment, local);
    			transition_out(hsvpicker1.$$.fragment, local);
    			transition_out(hsvpicker2.$$.fragment, local);
    			transition_out(qrcode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(hsvpicker0);
    			destroy_component(hsvpicker1);
    			destroy_component(hsvpicker2);
    			destroy_component(qrcode);
    			mounted = false;
    			run_all(dispose);
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
    	let mainWidth = '718px'; // preview only
    	let eggNumSize = '4.35em'; // preview only
    	let txtColor = '#0d0c0d';
    	let newTextColor = false;
    	let collSeriesBorder = '#AFAFAF';
    	let showReal = false;

    	// determine the OS, fine tune the css to match
    	let os = "MacOS"; // default to MacOS

    	let appV = "";

    	if (navigator.appVersion.indexOf("Win") != -1) {
    		os = "Windows";
    		eggNumSize = '4.65em'; // preview only
    	}

    	if (navigator.appVersion.indexOf("iPhone") != -1) {
    		os = "iPhone";
    		eggNumSize = '4.6em'; // preview only
    	}

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
    		let [r, g, b, a] = [rgba.detail.r, rgba.detail.g, rgba.detail.b, rgba.detail.a];
    		$$invalidate(1, txtColor = `rgb(${r},${g},${b},${a})`);
    		$$invalidate(2, collSeriesBorder = `rgb(${r},${g},${b},${a * 0.5})`);
    	}

    	// When generate button clicked, call the opensea API for details on the egg
    	const generateEgg = async () => {
    		fetch(`https://api.opensea.io/api/v1/assets?token_ids=${eggNumber}&order_direction=desc&offset=0&limit=1&collection=galaxyeggs9999`).then(response => response.json()).then(data => {
    			document.title = pad(eggNumber);
    			$$invalidate(6, qrSrc += eggNumber);
    			$$invalidate(3, imgSrc = data.assets[0].image_original_url);
    			description = data.assets[0].collection.description;
    			$$invalidate(5, series = data.assets[0].traits[0].value);
    			generate = true;
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

    	function input1_input_handler() {
    		eggNumber = to_number(this.value);
    		$$invalidate(4, eggNumber);
    	}

    	function input8_input_handler() {
    		eggNumber = to_number(this.value);
    		$$invalidate(4, eggNumber);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		QRCode: QRJS,
    		HsvPicker,
    		mainWidth,
    		eggNumSize,
    		txtColor,
    		newTextColor,
    		collSeriesBorder,
    		showReal,
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
    		if ('mainWidth' in $$props) $$invalidate(7, mainWidth = $$props.mainWidth);
    		if ('eggNumSize' in $$props) $$invalidate(0, eggNumSize = $$props.eggNumSize);
    		if ('txtColor' in $$props) $$invalidate(1, txtColor = $$props.txtColor);
    		if ('newTextColor' in $$props) newTextColor = $$props.newTextColor;
    		if ('collSeriesBorder' in $$props) $$invalidate(2, collSeriesBorder = $$props.collSeriesBorder);
    		if ('showReal' in $$props) showReal = $$props.showReal;
    		if ('os' in $$props) os = $$props.os;
    		if ('appV' in $$props) appV = $$props.appV;
    		if ('imgSrc' in $$props) $$invalidate(3, imgSrc = $$props.imgSrc);
    		if ('description' in $$props) description = $$props.description;
    		if ('longDescription' in $$props) $$invalidate(8, longDescription = $$props.longDescription);
    		if ('collectionName' in $$props) $$invalidate(9, collectionName = $$props.collectionName);
    		if ('collectionNamePlural' in $$props) $$invalidate(10, collectionNamePlural = $$props.collectionNamePlural);
    		if ('eggNumber' in $$props) $$invalidate(4, eggNumber = $$props.eggNumber);
    		if ('series' in $$props) $$invalidate(5, series = $$props.series);
    		if ('qrSrc' in $$props) $$invalidate(6, qrSrc = $$props.qrSrc);
    		if ('generate' in $$props) generate = $$props.generate;
    		if ('nftIdentifierLength' in $$props) nftIdentifierLength = $$props.nftIdentifierLength;
    		if ('web3Address' in $$props) $$invalidate(11, web3Address = $$props.web3Address);
    		if ('ethAddress' in $$props) $$invalidate(12, ethAddress = $$props.ethAddress);
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
    		mainWidth,
    		longDescription,
    		collectionName,
    		collectionNamePlural,
    		web3Address,
    		ethAddress,
    		txtColorCallback,
    		generateEgg,
    		pad,
    		input1_input_handler,
    		input8_input_handler
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
