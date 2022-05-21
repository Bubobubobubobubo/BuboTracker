
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    /* src/Column.svelte generated by Svelte v3.48.0 */

    const file$3 = "src/Column.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (19:8) {:else}
    function create_else_block$1(ctx) {
    	let span;
    	let input;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			input = element("input");
    			t = space();
    			attr_dev(input, "maxlength", "8");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "normalText svelte-1xzgju9");
    			add_location(input, file$3, 20, 16, 427);
    			attr_dev(span, "class", "normalLine svelte-1xzgju9");
    			add_location(span, file$3, 19, 12, 385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, input);
    			append_dev(span, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(19:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#if (n % 4 == 0)}
    function create_if_block$1(ctx) {
    	let span;
    	let input;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			input = element("input");
    			t = space();
    			attr_dev(input, "maxlength", "8");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "highlightText svelte-1xzgju9");
    			add_location(input, file$3, 16, 16, 281);
    			attr_dev(span, "class", "highlightLine svelte-1xzgju9");
    			add_location(span, file$3, 15, 12, 236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, input);
    			append_dev(span, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(15:8) {#if (n % 4 == 0)}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#each Array.from(Array(nbSteps).keys()) as n}
    function create_each_block$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*n*/ ctx[2] % 4 == 0) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(13:4) {#each Array.from(Array(nbSteps).keys()) as n}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let tracker_column;
    	let each_value = Array.from(Array(/*nbSteps*/ ctx[0]).keys());
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			tracker_column = element("tracker_column");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tracker_column, file$3, 11, 0, 128);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tracker_column, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tracker_column, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Array, nbSteps*/ 1) {
    				each_value = Array.from(Array(/*nbSteps*/ ctx[0]).keys());
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tracker_column, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tracker_column);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function scheduler() {
    	
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Column', slots, []);
    	let { nbSteps = 12 } = $$props;
    	var audioContext = new AudioContext();
    	const writable_props = ['nbSteps'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Column> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('nbSteps' in $$props) $$invalidate(0, nbSteps = $$props.nbSteps);
    	};

    	$$self.$capture_state = () => ({ nbSteps, audioContext, scheduler });

    	$$self.$inject_state = $$props => {
    		if ('nbSteps' in $$props) $$invalidate(0, nbSteps = $$props.nbSteps);
    		if ('audioContext' in $$props) audioContext = $$props.audioContext;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nbSteps];
    }

    class Column extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { nbSteps: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Column",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get nbSteps() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nbSteps(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/NumberingColumn.svelte generated by Svelte v3.48.0 */

    const file$2 = "src/NumberingColumn.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:8) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t_value = /*num*/ ctx[1] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "normalNum svelte-327vyk");
    			add_location(span, file$2, 9, 12, 229);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nbSteps*/ 1 && t_value !== (t_value = /*num*/ ctx[1] + 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(9:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:8) {#if (num % 4) == 0}
    function create_if_block(ctx) {
    	let span;
    	let t_value = /*num*/ ctx[1] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "highlightNum svelte-327vyk");
    			add_location(span, file$2, 7, 12, 157);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nbSteps*/ 1 && t_value !== (t_value = /*num*/ ctx[1] + 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(7:8) {#if (num % 4) == 0}",
    		ctx
    	});

    	return block;
    }

    // (6:4) {#each Array.from(Array(nbSteps).keys()) as num}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*num*/ ctx[1] % 4 == 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(6:4) {#each Array.from(Array(nbSteps).keys()) as num}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let numbering_column;
    	let each_value = Array.from(Array(/*nbSteps*/ ctx[0]).keys());
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			numbering_column = element("numbering_column");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(numbering_column, file$2, 4, 0, 44);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, numbering_column, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(numbering_column, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Array, nbSteps*/ 1) {
    				each_value = Array.from(Array(/*nbSteps*/ ctx[0]).keys());
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(numbering_column, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(numbering_column);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('NumberingColumn', slots, []);
    	let { nbSteps } = $$props;
    	const writable_props = ['nbSteps'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NumberingColumn> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('nbSteps' in $$props) $$invalidate(0, nbSteps = $$props.nbSteps);
    	};

    	$$self.$capture_state = () => ({ nbSteps });

    	$$self.$inject_state = $$props => {
    		if ('nbSteps' in $$props) $$invalidate(0, nbSteps = $$props.nbSteps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nbSteps];
    }

    class NumberingColumn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { nbSteps: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NumberingColumn",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nbSteps*/ ctx[0] === undefined && !('nbSteps' in props)) {
    			console.warn("<NumberingColumn> was created without expected prop 'nbSteps'");
    		}
    	}

    	get nbSteps() {
    		throw new Error("<NumberingColumn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nbSteps(value) {
    		throw new Error("<NumberingColumn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Tracker.svelte generated by Svelte v3.48.0 */
    const file$1 = "src/Tracker.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (19:8) {#each [...Array(nbTracks)] as track}
    function create_each_block(ctx) {
    	let column;
    	let current;

    	column = new Column({
    			props: { nbSteps: /*nbSteps*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(column, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const column_changes = {};
    			if (dirty & /*nbSteps*/ 2) column_changes.nbSteps = /*nbSteps*/ ctx[1];
    			column.$set(column_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(19:8) {#each [...Array(nbTracks)] as track}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let div;
    	let p0;
    	let t0;
    	let input0;
    	let t1;
    	let p1;
    	let t2;
    	let input1;
    	let t3;
    	let p2;
    	let t4;
    	let input2;
    	let t5;
    	let p3;
    	let t7;
    	let tracker_zone;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = [...Array(/*nbTracks*/ ctx[0])];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Steps : ");
    			input0 = element("input");
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Tracks: ");
    			input1 = element("input");
    			t3 = space();
    			p2 = element("p");
    			t4 = text("Table: ");
    			input2 = element("input");
    			t5 = space();
    			p3 = element("p");
    			p3.textContent = "(Enter to change)";
    			t7 = space();
    			tracker_zone = element("tracker_zone");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "class", "step_modifier svelte-avkgcg");
    			add_location(input0, file$1, 11, 40, 277);
    			attr_dev(p0, "class", "tracker_text svelte-avkgcg");
    			add_location(p0, file$1, 11, 8, 245);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "track_modifier svelte-avkgcg");
    			add_location(input1, file$1, 12, 40, 386);
    			attr_dev(p1, "class", "tracker_text svelte-avkgcg");
    			add_location(p1, file$1, 12, 8, 354);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "table_modifier svelte-avkgcg");
    			add_location(input2, file$1, 13, 39, 496);
    			attr_dev(p2, "class", "tracker_text svelte-avkgcg");
    			add_location(p2, file$1, 13, 8, 465);
    			attr_dev(p3, "class", "text_hint svelte-avkgcg");
    			add_location(p3, file$1, 14, 8, 570);
    			attr_dev(div, "class", "tracker_modifiers svelte-avkgcg");
    			add_location(div, file$1, 10, 4, 205);
    			attr_dev(tracker_zone, "class", "svelte-avkgcg");
    			add_location(tracker_zone, file$1, 17, 4, 629);
    			attr_dev(main, "class", "svelte-avkgcg");
    			add_location(main, file$1, 9, 0, 194);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, input0);
    			set_input_value(input0, /*nbSteps*/ ctx[1]);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, t2);
    			append_dev(p1, input1);
    			set_input_value(input1, /*nbTracks*/ ctx[0]);
    			append_dev(div, t3);
    			append_dev(div, p2);
    			append_dev(p2, t4);
    			append_dev(p2, input2);
    			set_input_value(input2, /*table*/ ctx[2]);
    			append_dev(div, t5);
    			append_dev(div, p3);
    			append_dev(main, t7);
    			append_dev(main, tracker_zone);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tracker_zone, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*nbSteps*/ 2 && to_number(input0.value) !== /*nbSteps*/ ctx[1]) {
    				set_input_value(input0, /*nbSteps*/ ctx[1]);
    			}

    			if (dirty & /*nbTracks*/ 1 && to_number(input1.value) !== /*nbTracks*/ ctx[0]) {
    				set_input_value(input1, /*nbTracks*/ ctx[0]);
    			}

    			if (dirty & /*table*/ 4 && input2.value !== /*table*/ ctx[2]) {
    				set_input_value(input2, /*table*/ ctx[2]);
    			}

    			if (dirty & /*nbSteps, nbTracks*/ 3) {
    				each_value = [...Array(/*nbTracks*/ ctx[0])];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tracker_zone, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tracker', slots, []);
    	let nbTracks = 4;
    	let nbSteps = 12;
    	let table = 'default';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tracker> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		nbSteps = to_number(this.value);
    		$$invalidate(1, nbSteps);
    	}

    	function input1_input_handler() {
    		nbTracks = to_number(this.value);
    		$$invalidate(0, nbTracks);
    	}

    	function input2_input_handler() {
    		table = this.value;
    		$$invalidate(2, table);
    	}

    	$$self.$capture_state = () => ({
    		Column,
    		NumberingColumn,
    		nbTracks,
    		nbSteps,
    		table
    	});

    	$$self.$inject_state = $$props => {
    		if ('nbTracks' in $$props) $$invalidate(0, nbTracks = $$props.nbTracks);
    		if ('nbSteps' in $$props) $$invalidate(1, nbSteps = $$props.nbSteps);
    		if ('table' in $$props) $$invalidate(2, table = $$props.table);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nbTracks,
    		nbSteps,
    		table,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class Tracker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tracker",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.48.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let article;
    	let tracker;
    	let t4;
    	let nav;
    	let h2;
    	let t6;
    	let div;
    	let t8;
    	let footer;
    	let current;
    	tracker = new Tracker({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "|| BUBO MUSIC TRACKER ||";
    			t1 = space();
    			p = element("p");
    			p.textContent = "A music tracker done wrong";
    			t3 = space();
    			article = element("article");
    			create_component(tracker.$$.fragment);
    			t4 = space();
    			nav = element("nav");
    			h2 = element("h2");
    			h2.textContent = "Instructions";
    			t6 = space();
    			div = element("div");
    			div.textContent = "Parameters";
    			t8 = space();
    			footer = element("footer");
    			footer.textContent = "Footer";
    			attr_dev(h1, "class", "svelte-1d7aist");
    			add_location(h1, file, 7, 1, 99);
    			attr_dev(p, "class", "subtitle svelte-1d7aist");
    			add_location(p, file, 8, 1, 135);
    			attr_dev(header, "class", "pageHeader svelte-1d7aist");
    			add_location(header, file, 5, 1, 69);
    			attr_dev(article, "id", "mainArticle");
    			attr_dev(article, "class", "svelte-1d7aist");
    			add_location(article, file, 12, 1, 200);
    			attr_dev(h2, "class", "svelte-1d7aist");
    			add_location(h2, file, 17, 2, 279);
    			attr_dev(nav, "class", "mainNav svelte-1d7aist");
    			add_location(nav, file, 16, 1, 255);
    			attr_dev(div, "class", "siteParameters svelte-1d7aist");
    			add_location(div, file, 20, 1, 311);
    			attr_dev(footer, "class", "pageFooter svelte-1d7aist");
    			add_location(footer, file, 22, 1, 358);
    			attr_dev(main, "class", "svelte-1d7aist");
    			add_location(main, file, 4, 0, 61);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, p);
    			append_dev(main, t3);
    			append_dev(main, article);
    			mount_component(tracker, article, null);
    			append_dev(main, t4);
    			append_dev(main, nav);
    			append_dev(nav, h2);
    			append_dev(main, t6);
    			append_dev(main, div);
    			append_dev(main, t8);
    			append_dev(main, footer);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tracker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tracker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(tracker);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Tracker });
    	return [];
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

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
