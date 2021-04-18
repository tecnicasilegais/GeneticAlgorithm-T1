
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
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
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\FileInput.svelte generated by Svelte v3.19.1 */

    const file = "src\\components\\FileInput.svelte";

    function create_fragment(ctx) {
    	let label;
    	let svg;
    	let path;
    	let t0;
    	let span;
    	let t2;
    	let input;

    	const block = {
    		c: function create() {
    			label = element("label");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Select a file";
    			t2 = space();
    			input = element("input");
    			attr_dev(path, "d", "M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z");
    			add_location(path, file, 5, 8, 354);
    			attr_dev(svg, "class", "w-8 h-8");
    			attr_dev(svg, "fill", "currentColor");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file, 4, 4, 248);
    			attr_dev(span, "class", "mt-2 text-base leading-normal");
    			add_location(span, file, 7, 4, 521);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "class", "hidden");
    			attr_dev(input, "id", "txtfiletoread");
    			add_location(input, file, 8, 4, 591);
    			attr_dev(label, "class", "w-64 flex flex-col mx-16 lg:mx-40 items-center px-4 py-6 bg-ba text-gray-200 w-1/3 h-1/2 rounded-lg shadow-lg tracking-wide uppercase border border-gray-200 cursor-pointer hover:bg-white hover:text-black");
    			add_location(label, file, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, svg);
    			append_dev(svg, path);
    			append_dev(label, t0);
    			append_dev(label, span);
    			append_dev(label, t2);
    			append_dev(label, input);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
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

    class FileInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileInput",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const fill_json_data = (generation, population, fitnesses, mutations, convergence) => {
        return {
            'generation': generation,
            'population': population,
            'fitnesses': fitnesses,
            'mutations': mutations,
            'convergence': convergence
        };
    };

    /**
     * Generates a random population
     * @param k_population size of population
     * @param k_individual size of individuals
     * @returns {[]}
     */
    const generate_random_population = (k_population, k_individual) => {
        let ind_example = Array.from({length: k_individual}, (e, i) => i);
        let sample = [];
        for(let i=0; i<k_population; i++){
            sample[i] = [...ind_example].shuffle();
        }
        return sample
    };


    if(typeof(Array.prototype.shuffle) === 'undefined'){
        Array.prototype.shuffle = function(){
            let i = this.length, j, temp;
            if ( i === 0 ) return this;
            while ( --i ) {
                j = Math.floor( Math.random() * ( i + 1 ) );
                temp = this[i];
                this[i] = this[j];
                this[j] = temp;
            }
            return this;
        };
    }

    if(typeof(Array.prototype.argmin) === 'undefined'){
        Array.prototype.argmin = function(){
            if (this.length == 0){
                return -1;
            }
            let min = this[0];

            for(let i=0; i<this.length; i++){
                if(this[i] < min);
            }
            return min;
        };
    }

    //imports

    let storep = writable([]);

    //globals
    let dados_b = [];
    let dados_a = [];
    let solution;

    let population = [];
    let fitness = []; //fitness of each individual from the population
    let mutations = [];
    let convergence = 0;
    let CHROMOSOME = 0;

    //checks if this generation contains the solution
    const solution_found = () => {
        return (Math.min(...fitness) === 0);
    };

    //population fitness
    const fitness_func = () => {
        for(let i=0; i<population.length; i++){
            fitness[i] = fitness_individual(population[i]);
        }
    };

    //individual fitness
    const fitness_individual = (individual) => {//min
        let aptitude_a, aptitude_b = 0;
        //iterates individual (i = index of A, individual[i] = index of B, values = i+1 and individual[i]+1)
        for(let a=0; a<individual.length; a++){
            let b = individual[a]; //b person (B1, B2 etc.)
            for(let i=0; i<dados_a[a].length; i++){
                if(dados_a[a][i] == b){//B
                    aptitude_a = i;
                }
            }
            for(let i=0; i<dados_b[b].length; i++){
                if(dados_b[b][i] == a){//A
                    aptitude_b = i;
                }
            }
        }
        return aptitude_a + aptitude_b;
    };

    const init$1 = (pop_size = 20, ngen, best_matches) => {
        //fill globals
        console.log(best_matches.best_a);
        CHROMOSOME = best_matches.size;
        dados_a = best_matches.best_a;
        dados_b = best_matches.best_b;

        population = generate_random_population(pop_size, CHROMOSOME);
        fitness_func();

        if(solution_found()){
            solution = population[fitness.argmin()];
            console.log(solution);
        }

        storep.set(fill_json_data(0, population, fitness, mutations, convergence));
        console.log(fill_json_data(0, population, fitness, mutations, convergence));
    };

    let best_matches = {};
    function textTolist(text){
        let lines = text.trim().split('\n');
        let size = lines[0];
        let best_a = [];
        let best_b = [];
        for(let i=1; i<parseInt(size)+1; i++){
            best_a[i-1] = collect_values(lines[i]);
        }
        let x = 0;
        for(let i=parseInt(size)+1; i<lines.length; i++){
            best_b[x] = collect_values(lines[i]);
            x++;
        }
        best_matches["best_a"] = best_a;
        best_matches["best_b"] = best_b;
        best_matches["size"] = best_a[0].length;
        init$1(10, 500, best_matches);
    }

    const collect_values = (line) => {
        if(line === undefined){return;}
        let out = [];
        let line_txt = line.trim().split(" ");
        for(let i=1; i<line_txt.length; i++){
            out[i-1] = (parseInt(line_txt[i].substr(1))-1);
        }
        return out;
    };

    /* node_modules\@fouita\pagination\src\ChevronLeft.svelte generated by Svelte v3.19.1 */

    const file$1 = "node_modules\\@fouita\\pagination\\src\\ChevronLeft.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let g;
    	let path;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M15 18l-6-6l6-6");
    			add_location(path, file$1, 22, 4, 547);
    			attr_dev(g, "fill", "none");
    			attr_dev(g, "stroke-width", "2");
    			attr_dev(g, "stroke-linecap", "round");
    			attr_dev(g, "stroke-linejoin", "round");
    			add_location(g, file$1, 17, 2, 442);
    			attr_dev(svg, "class", svg_class_value = "" + (/*klass*/ ctx[0] + " stroke-current"));
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "width", "1em");
    			attr_dev(svg, "height", "1em");
    			set_style(svg, "-ms-transform", "rotate(360deg)");
    			set_style(svg, "-webkit-transform", "rotate(360deg)");
    			set_style(svg, "transform", "rotate(360deg)");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid meet");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$1, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*klass*/ 1 && svg_class_value !== (svg_class_value = "" + (/*klass*/ ctx[0] + " stroke-current"))) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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

    function instance($$self, $$props, $$invalidate) {
    	let { class: klass = "" } = $$props;
    	const writable_props = ["class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChevronLeft> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    	};

    	$$self.$capture_state = () => ({ klass });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass];
    }

    class ChevronLeft extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, { class: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChevronLeft",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get class() {
    		throw new Error("<ChevronLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ChevronLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@fouita\pagination\src\ChevronRight.svelte generated by Svelte v3.19.1 */

    const file$2 = "node_modules\\@fouita\\pagination\\src\\ChevronRight.svelte";

    function create_fragment$2(ctx) {
    	let svg;
    	let g;
    	let path;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M9 18l6-6l-6-6");
    			add_location(path, file$2, 22, 4, 547);
    			attr_dev(g, "fill", "none");
    			attr_dev(g, "stroke-width", "2");
    			attr_dev(g, "stroke-linecap", "round");
    			attr_dev(g, "stroke-linejoin", "round");
    			add_location(g, file$2, 17, 2, 442);
    			attr_dev(svg, "class", svg_class_value = "" + (/*klass*/ ctx[0] + " stroke-current"));
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "width", "1em");
    			attr_dev(svg, "height", "1em");
    			set_style(svg, "-ms-transform", "rotate(360deg)");
    			set_style(svg, "-webkit-transform", "rotate(360deg)");
    			set_style(svg, "transform", "rotate(360deg)");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid meet");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$2, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*klass*/ 1 && svg_class_value !== (svg_class_value = "" + (/*klass*/ ctx[0] + " stroke-current"))) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { class: klass = "" } = $$props;
    	const writable_props = ["class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChevronRight> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    	};

    	$$self.$capture_state = () => ({ klass });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass];
    }

    class ChevronRight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, { class: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChevronRight",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<ChevronRight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ChevronRight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@fouita\pagination\src\Pagination.svelte generated by Svelte v3.19.1 */
    const file$3 = "node_modules\\@fouita\\pagination\\src\\Pagination.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (66:4) {#each arr_pages as i}
    function create_each_block(ctx) {
    	let div;
    	let t_value = /*i*/ ctx[15] + "";
    	let t;
    	let div_class_value;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[13](/*i*/ ctx[15], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);

    			attr_dev(div, "class", div_class_value = "w-" + /*s*/ ctx[5] + " sm:flex justify-center items-center hidden select-none\r\n        cursor-pointer leading-5 transition duration-150 ease-in " + (/*i*/ ctx[15] == /*current*/ ctx[0]
    			? /*rounded*/ ctx[1]
    				? `rounded-full bg-${/*color*/ ctx[3]}-600 text-white`
    				: `border-t-2 border-${/*color*/ ctx[3]}-600 `
    			: /*rounded*/ ctx[1]
    				? "rounded-full "
    				: "border-t-2 border-white") + "\r\n        ");

    			add_location(div, file$3, 66, 6, 1720);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			dispose = listen_dev(div, "click", click_handler_1, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*arr_pages*/ 16 && t_value !== (t_value = /*i*/ ctx[15] + "")) set_data_dev(t, t_value);

    			if (dirty & /*s, arr_pages, current, rounded, color*/ 59 && div_class_value !== (div_class_value = "w-" + /*s*/ ctx[5] + " sm:flex justify-center items-center hidden select-none\r\n        cursor-pointer leading-5 transition duration-150 ease-in " + (/*i*/ ctx[15] == /*current*/ ctx[0]
    			? /*rounded*/ ctx[1]
    				? `rounded-full bg-${/*color*/ ctx[3]}-600 text-white`
    				: `border-t-2 border-${/*color*/ ctx[3]}-600 `
    			: /*rounded*/ ctx[1]
    				? "rounded-full "
    				: "border-t-2 border-white") + "\r\n        ")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(66:4) {#each arr_pages as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div4;
    	let div0;
    	let div0_class_value;
    	let t0;
    	let div2;
    	let t1;
    	let div1;
    	let t2;
    	let div1_class_value;
    	let div2_class_value;
    	let t3;
    	let div3;
    	let div3_class_value;
    	let div4_class_value;
    	let current;
    	let dispose;

    	const chevronlefticon = new ChevronLeft({
    			props: {
    				class: "w-" + /*s*/ ctx[5] / 2 + " h-" + /*s*/ ctx[5] / 2
    			},
    			$$inline: true
    		});

    	let each_value = /*arr_pages*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const chevronrighticon = new ChevronRight({
    			props: {
    				class: "w-" + /*s*/ ctx[5] / 2 + " h-" + /*s*/ ctx[5] / 2
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			create_component(chevronlefticon.$$.fragment);
    			t0 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*current*/ ctx[0]);
    			t3 = space();
    			div3 = element("div");
    			create_component(chevronrighticon.$$.fragment);

    			attr_dev(div0, "class", div0_class_value = "h-" + /*s*/ ctx[5] + " w-" + /*s*/ ctx[5] + " mr-1 flex justify-center items-center " + (/*rounded*/ ctx[1] ? "rounded-full bg-gray-200" : "") + "\r\n    " + (/*current*/ ctx[0] > 1
    			? "cursor-pointer"
    			: "text-gray-400"));

    			add_location(div0, file$3, 57, 2, 1303);

    			attr_dev(div1, "class", div1_class_value = "w-" + /*s*/ ctx[5] + " h-" + /*s*/ ctx[5] + " sm:hidden flex justify-center select-none items-center\r\n      cursor-pointer leading-5 transition duration-150 ease-in " + (/*rounded*/ ctx[1]
    			? `rounded-full bg-${/*color*/ ctx[3]}-600 text-white`
    			: `border-t-2 border-${/*color*/ ctx[3]}-600`));

    			add_location(div1, file$3, 74, 4, 2128);
    			attr_dev(div2, "class", div2_class_value = "flex h-" + /*s*/ ctx[5] + " font-medium " + (/*rounded*/ ctx[1] ? "rounded-full bg-gray-200" : ""));
    			add_location(div2, file$3, 63, 2, 1599);

    			attr_dev(div3, "class", div3_class_value = "h-" + /*s*/ ctx[5] + " w-" + /*s*/ ctx[5] + " ml-1 flex justify-center items-center " + (/*rounded*/ ctx[1] ? "rounded-full bg-gray-200" : "") + "\r\n    " + (/*current*/ ctx[0] < /*num_pages*/ ctx[6]
    			? "cursor-pointer"
    			: "text-gray-400"));

    			add_location(div3, file$3, 80, 2, 2411);
    			attr_dev(div4, "class", div4_class_value = "flex text-gray-700 text-" + (/*small*/ ctx[2] ? "base" : "lg"));
    			add_location(div4, file$3, 56, 0, 1238);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			mount_component(chevronlefticon, div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			mount_component(chevronrighticon, div3, null);
    			current = true;

    			dispose = [
    				listen_dev(div0, "click", /*click_handler*/ ctx[12], false, false, false),
    				listen_dev(div3, "click", /*click_handler_2*/ ctx[14], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const chevronlefticon_changes = {};
    			if (dirty & /*s*/ 32) chevronlefticon_changes.class = "w-" + /*s*/ ctx[5] / 2 + " h-" + /*s*/ ctx[5] / 2;
    			chevronlefticon.$set(chevronlefticon_changes);

    			if (!current || dirty & /*s, rounded, current*/ 35 && div0_class_value !== (div0_class_value = "h-" + /*s*/ ctx[5] + " w-" + /*s*/ ctx[5] + " mr-1 flex justify-center items-center " + (/*rounded*/ ctx[1] ? "rounded-full bg-gray-200" : "") + "\r\n    " + (/*current*/ ctx[0] > 1
    			? "cursor-pointer"
    			: "text-gray-400"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*s, arr_pages, current, rounded, color, setCurrent*/ 187) {
    				each_value = /*arr_pages*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*current*/ 1) set_data_dev(t2, /*current*/ ctx[0]);

    			if (!current || dirty & /*s, rounded, color*/ 42 && div1_class_value !== (div1_class_value = "w-" + /*s*/ ctx[5] + " h-" + /*s*/ ctx[5] + " sm:hidden flex justify-center select-none items-center\r\n      cursor-pointer leading-5 transition duration-150 ease-in " + (/*rounded*/ ctx[1]
    			? `rounded-full bg-${/*color*/ ctx[3]}-600 text-white`
    			: `border-t-2 border-${/*color*/ ctx[3]}-600`))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*s, rounded*/ 34 && div2_class_value !== (div2_class_value = "flex h-" + /*s*/ ctx[5] + " font-medium " + (/*rounded*/ ctx[1] ? "rounded-full bg-gray-200" : ""))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			const chevronrighticon_changes = {};
    			if (dirty & /*s*/ 32) chevronrighticon_changes.class = "w-" + /*s*/ ctx[5] / 2 + " h-" + /*s*/ ctx[5] / 2;
    			chevronrighticon.$set(chevronrighticon_changes);

    			if (!current || dirty & /*s, rounded, current, num_pages*/ 99 && div3_class_value !== (div3_class_value = "h-" + /*s*/ ctx[5] + " w-" + /*s*/ ctx[5] + " ml-1 flex justify-center items-center " + (/*rounded*/ ctx[1] ? "rounded-full bg-gray-200" : "") + "\r\n    " + (/*current*/ ctx[0] < /*num_pages*/ ctx[6]
    			? "cursor-pointer"
    			: "text-gray-400"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*small*/ 4 && div4_class_value !== (div4_class_value = "flex text-gray-700 text-" + (/*small*/ ctx[2] ? "base" : "lg"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chevronlefticon.$$.fragment, local);
    			transition_in(chevronrighticon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chevronlefticon.$$.fragment, local);
    			transition_out(chevronrighticon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(chevronlefticon);
    			destroy_each(each_blocks, detaching);
    			destroy_component(chevronrighticon);
    			run_all(dispose);
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

    function buildArr(c, n) {
    	if (n <= 7) {
    		return [...Array(n)].map((_, i) => i + 1);
    	} else {
    		if (c < 3 || c > n - 2) {
    			return [1, 2, 3, "...", n - 2, n - 1, n];
    		} else {
    			return [1, "...", c - 1, c, c + 1, "...", n];
    		}
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { current = 1 } = $$props;
    	let { num_items = 120 } = $$props;
    	let { per_page = 5 } = $$props;
    	let { rounded = false } = $$props;
    	let { small = false } = $$props;
    	let { color = "indigo" } = $$props;
    	let arr_pages = [];

    	function setArrPages() {
    		$$invalidate(4, arr_pages = buildArr(current, num_pages));
    	}

    	function setCurrent(i) {
    		if (isNaN(i)) return;
    		$$invalidate(0, current = i);
    		dispatch("navigate", current);
    	}

    	const writable_props = ["current", "num_items", "per_page", "rounded", "small", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pagination> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => current > 1 && setCurrent(current - 1);
    	const click_handler_1 = i => setCurrent(i);
    	const click_handler_2 = () => current < num_pages && setCurrent(current + 1);

    	$$self.$set = $$props => {
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
    		if ("num_items" in $$props) $$invalidate(8, num_items = $$props.num_items);
    		if ("per_page" in $$props) $$invalidate(9, per_page = $$props.per_page);
    		if ("rounded" in $$props) $$invalidate(1, rounded = $$props.rounded);
    		if ("small" in $$props) $$invalidate(2, small = $$props.small);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		ChevronLeftIcon: ChevronLeft,
    		ChevronRightIcon: ChevronRight,
    		createEventDispatcher,
    		dispatch,
    		current,
    		num_items,
    		per_page,
    		rounded,
    		small,
    		color,
    		arr_pages,
    		buildArr,
    		setArrPages,
    		setCurrent,
    		s,
    		num_pages,
    		Math,
    		Array,
    		isNaN
    	});

    	$$self.$inject_state = $$props => {
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
    		if ("num_items" in $$props) $$invalidate(8, num_items = $$props.num_items);
    		if ("per_page" in $$props) $$invalidate(9, per_page = $$props.per_page);
    		if ("rounded" in $$props) $$invalidate(1, rounded = $$props.rounded);
    		if ("small" in $$props) $$invalidate(2, small = $$props.small);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("arr_pages" in $$props) $$invalidate(4, arr_pages = $$props.arr_pages);
    		if ("s" in $$props) $$invalidate(5, s = $$props.s);
    		if ("num_pages" in $$props) $$invalidate(6, num_pages = $$props.num_pages);
    	};

    	let s;
    	let num_pages;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*small*/ 4) {
    			 $$invalidate(5, s = small ? 8 : 12);
    		}

    		if ($$self.$$.dirty & /*num_items, per_page*/ 768) {
    			 $$invalidate(6, num_pages = Math.ceil(num_items / per_page));
    		}

    		if ($$self.$$.dirty & /*per_page*/ 512) {
    			 if (per_page) {
    				setArrPages();
    				$$invalidate(0, current = 1);
    			}
    		}

    		if ($$self.$$.dirty & /*num_items, per_page, current*/ 769) {
    			 if (num_items) {
    				$$invalidate(6, num_pages = Math.ceil(num_items / per_page));
    				$$invalidate(0, current = current || 1);
    			}
    		}

    		if ($$self.$$.dirty & /*current*/ 1) {
    			 if (current) {
    				setArrPages();
    			}
    		}
    	};

    	return [
    		current,
    		rounded,
    		small,
    		color,
    		arr_pages,
    		s,
    		num_pages,
    		setCurrent,
    		num_items,
    		per_page,
    		dispatch,
    		setArrPages,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Pagination extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {
    			current: 0,
    			num_items: 8,
    			per_page: 9,
    			rounded: 1,
    			small: 2,
    			color: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pagination",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get current() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get num_items() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set num_items(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get per_page() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set per_page(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.19.1 */

    const { document: document_1 } = globals;
    const file$4 = "src\\App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (64:4) {#if fjd.generation >= 0}
    function create_if_block(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*fjd*/ ctx[3].generation + "";
    	let t1;
    	let t2;
    	let table;
    	let tr;
    	let th0;
    	let t4;
    	let th1;
    	let t6;
    	let t7;
    	let div2;
    	let div0;
    	let t8;
    	let t9_value = /*fjd*/ ctx[3].mutations + "";
    	let t9;
    	let t10;
    	let div1;
    	let a;
    	let t11;
    	let t12_value = /*fjd*/ ctx[3].convergence + "";
    	let t12;
    	let t13;
    	let div3;
    	let updating_current;
    	let updating_num_items;
    	let current;
    	let each_value = /*fjd*/ ctx[3].population;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	function pagination_current_binding(value) {
    		/*pagination_current_binding*/ ctx[10].call(null, value);
    	}

    	function pagination_num_items_binding(value) {
    		/*pagination_num_items_binding*/ ctx[11].call(null, value);
    	}

    	let pagination_props = { per_page: /*per_page*/ ctx[5] };

    	if (/*current*/ ctx[4] !== void 0) {
    		pagination_props.current = /*current*/ ctx[4];
    	}

    	if (/*fjd*/ ctx[3].length !== void 0) {
    		pagination_props.num_items = /*fjd*/ ctx[3].length;
    	}

    	const pagination = new Pagination({ props: pagination_props, $$inline: true });
    	binding_callbacks.push(() => bind(pagination, "current", pagination_current_binding));
    	binding_callbacks.push(() => bind(pagination, "num_items", pagination_num_items_binding));

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Geração: ");
    			t1 = text(t1_value);
    			t2 = space();
    			table = element("table");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "População";
    			t4 = space();
    			th1 = element("th");
    			th1.textContent = "Fitnesses";
    			t6 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t8 = text("Mutações: ");
    			t9 = text(t9_value);
    			t10 = space();
    			div1 = element("div");
    			a = element("a");
    			t11 = text("Convergência: ");
    			t12 = text(t12_value);
    			t13 = space();
    			div3 = element("div");
    			create_component(pagination.$$.fragment);
    			attr_dev(p, "class", "text-lg text-center font-bold m-5");
    			add_location(p, file$4, 64, 8, 2642);
    			attr_dev(th0, "class", "px-4 py-3");
    			add_location(th0, file$4, 67, 16, 2881);
    			attr_dev(th1, "class", "p-0");
    			attr_dev(th1, "width", "110px");
    			add_location(th1, file$4, 68, 16, 2935);
    			attr_dev(tr, "class", "text-left border-b-2 border-gray-300 ");
    			add_location(tr, file$4, 66, 12, 2812);
    			attr_dev(table, "class", "rounded-t-lg m-5 w-5/6 mx-auto bg-gray-200 text-gray-800");
    			add_location(table, file$4, 65, 8, 2726);
    			attr_dev(div0, "class", "flex-1");
    			add_location(div0, file$4, 78, 12, 3364);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "mx-auto m-inline-block rounded-full text-white \r\n                  bg-yellow-400 hover:bg-yellow-500 duration-300 \r\n                  text-xs font-bold \r\n                  mr-1 md:mr-2 mb-2 px-2 md:px-4 py-1 \r\n                  opacity-90 hover:opacity-100");
    			add_location(a, file$4, 80, 16, 3468);
    			attr_dev(div1, "class", "flex-2");
    			add_location(div1, file$4, 79, 12, 3429);
    			attr_dev(div2, "class", "flex space-x-4 m-5 w-5/6 mx-auto");
    			add_location(div2, file$4, 77, 8, 3304);
    			attr_dev(div3, "class", "w-5/6 mx-36 lg:ml-96 lg:pl-80");
    			add_location(div3, file$4, 89, 8, 3862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t4);
    			append_dev(tr, th1);
    			append_dev(table, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t7, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t8);
    			append_dev(div0, t9);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    			append_dev(a, t11);
    			append_dev(a, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(pagination, div3, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*fjd*/ 8) && t1_value !== (t1_value = /*fjd*/ ctx[3].generation + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*fjd*/ 8) {
    				each_value = /*fjd*/ ctx[3].population;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if ((!current || dirty & /*fjd*/ 8) && t9_value !== (t9_value = /*fjd*/ ctx[3].mutations + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*fjd*/ 8) && t12_value !== (t12_value = /*fjd*/ ctx[3].convergence + "")) set_data_dev(t12, t12_value);
    			const pagination_changes = {};

    			if (!updating_current && dirty & /*current*/ 16) {
    				updating_current = true;
    				pagination_changes.current = /*current*/ ctx[4];
    				add_flush_callback(() => updating_current = false);
    			}

    			if (!updating_num_items && dirty & /*fjd*/ 8) {
    				updating_num_items = true;
    				pagination_changes.num_items = /*fjd*/ ctx[3].length;
    				add_flush_callback(() => updating_num_items = false);
    			}

    			pagination.$set(pagination_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagination.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagination.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div3);
    			destroy_component(pagination);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(64:4) {#if fjd.generation >= 0}",
    		ctx
    	});

    	return block;
    }

    // (71:12) {#each fjd.population as pop, i}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*pop*/ ctx[12] + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*fjd*/ ctx[3].fitnesses[/*i*/ ctx[14]] + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(td0, "class", "px-4 py-3");
    			add_location(td0, file$4, 72, 20, 3133);
    			attr_dev(td1, "class", "px-4 py-3");
    			add_location(td1, file$4, 73, 20, 3187);
    			attr_dev(tr, "class", "bg-gray-100 border-b border-gray-200");
    			add_location(tr, file$4, 71, 16, 3062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fjd*/ 8 && t0_value !== (t0_value = /*pop*/ ctx[12] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*fjd*/ 8 && t2_value !== (t2_value = /*fjd*/ ctx[3].fitnesses[/*i*/ ctx[14]] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(71:12) {#each fjd.population as pop, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let link;
    	let t0;
    	let main;
    	let t1;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let input0_updating = false;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let input1_updating = false;
    	let t7;
    	let div2;
    	let label2;
    	let t9;
    	let input2;
    	let input2_updating = false;
    	let t10;
    	let current;
    	let dispose;
    	const fileinput = new FileInput({ $$inline: true });

    	function input0_input_handler() {
    		input0_updating = true;
    		/*input0_input_handler*/ ctx[7].call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[8].call(input1);
    	}

    	function input2_input_handler() {
    		input2_updating = true;
    		/*input2_input_handler*/ ctx[9].call(input2);
    	}

    	let if_block = /*fjd*/ ctx[3].generation >= 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			create_component(fileinput.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Tamanho da população";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Chance de mutação";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Chance de crossover";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			if (if_block) if_block.c();
    			attr_dev(link, "href", "https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file$4, 44, 4, 1682);
    			attr_dev(label0, "for", "popsize");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$4, 51, 5, 1865);
    			attr_dev(input0, "class", "border-2 border-gray-300 p-2 w-1/3 bg-dark text-black");
    			attr_dev(input0, "min", "1");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "id", "popsize");
    			add_location(input0, file$4, 52, 2, 1937);
    			attr_dev(div0, "class", "m-5 w-5/6 mx-auto");
    			add_location(div0, file$4, 50, 4, 1827);
    			attr_dev(label1, "for", "mutcha");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$4, 55, 5, 2110);
    			attr_dev(input1, "class", "border-2 border-gray-300 p-2 w-1/3 bg-dark text-black");
    			attr_dev(input1, "step", "0.01");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "1");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "id", "mutcha");
    			add_location(input1, file$4, 56, 2, 2178);
    			attr_dev(div1, "class", "m-5 w-5/6 mx-auto");
    			add_location(div1, file$4, 54, 4, 2072);
    			attr_dev(label2, "for", "crosscha");
    			attr_dev(label2, "class", "form-label");
    			add_location(label2, file$4, 59, 5, 2370);
    			attr_dev(input2, "class", "border-2 border-gray-300 p-2 w-1/3 bg-dark text-black");
    			attr_dev(input2, "step", "0.01");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "1");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "id", "crosscha");
    			add_location(input2, file$4, 60, 2, 2442);
    			attr_dev(div2, "class", "m-5 w-5/6 mx-auto");
    			add_location(div2, file$4, 58, 4, 2332);
    			add_location(main, file$4, 46, 0, 1785);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(fileinput, main, null);
    			append_dev(main, t1);
    			append_dev(main, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*pz*/ ctx[1]);
    			append_dev(main, t4);
    			append_dev(main, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*cm*/ ctx[2]);
    			append_dev(main, t7);
    			append_dev(main, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, input2);
    			set_input_value(input2, /*cc*/ ctx[0]);
    			append_dev(main, t10);
    			if (if_block) if_block.m(main, null);
    			current = true;

    			dispose = [
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "input", input2_input_handler)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!input0_updating && dirty & /*pz*/ 2) {
    				set_input_value(input0, /*pz*/ ctx[1]);
    			}

    			input0_updating = false;

    			if (!input1_updating && dirty & /*cm*/ 4) {
    				set_input_value(input1, /*cm*/ ctx[2]);
    			}

    			input1_updating = false;

    			if (!input2_updating && dirty & /*cc*/ 1) {
    				set_input_value(input2, /*cc*/ ctx[0]);
    			}

    			input2_updating = false;

    			if (/*fjd*/ ctx[3].generation >= 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fileinput.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fileinput.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(fileinput);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let fjd;

    	storep.subscribe(fill_json_data => {
    		$$invalidate(3, fjd = fill_json_data);
    	});

    	let current = 0;
    	let per_page = 1;
    	let { fileContents } = $$props;
    	let { cc } = $$props, { pz } = $$props, { cm } = $$props;

    	window.onload = function () {
    		//Check the support for the File API support
    		if (window.File && window.FileReader && window.FileList && window.Blob) {
    			var fileSelected = document.getElementById("txtfiletoread");

    			fileSelected.addEventListener(
    				"change",
    				function (e) {
    					//Set the extension for the file
    					var fileExtension = /text.*/;

    					//Get the file object
    					var fileTobeRead = fileSelected.files[0];

    					//Check of the extension match
    					if (fileTobeRead.type.match(fileExtension)) {
    						//Initialize the FileReader object to read the 2file
    						var fileReader = new FileReader();

    						fileReader.onload = function (e) {
    							$$invalidate(6, fileContents = document.getElementById("filecontents"));
    							textTolist(fileReader.result);
    						};

    						fileReader.readAsText(fileTobeRead);
    					} else {
    						alert("Por favor selecione arquivo texto");
    					}
    				},
    				false
    			);
    		} else {
    			alert("Arquivo(s) não suportado(s)");
    		}
    	};

    	const writable_props = ["fileContents", "cc", "pz", "cm"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		pz = to_number(this.value);
    		$$invalidate(1, pz);
    	}

    	function input1_input_handler() {
    		cm = to_number(this.value);
    		$$invalidate(2, cm);
    	}

    	function input2_input_handler() {
    		cc = to_number(this.value);
    		$$invalidate(0, cc);
    	}

    	function pagination_current_binding(value) {
    		current = value;
    		$$invalidate(4, current);
    	}

    	function pagination_num_items_binding(value) {
    		fjd.length = value;
    		$$invalidate(3, fjd);
    	}

    	$$self.$set = $$props => {
    		if ("fileContents" in $$props) $$invalidate(6, fileContents = $$props.fileContents);
    		if ("cc" in $$props) $$invalidate(0, cc = $$props.cc);
    		if ("pz" in $$props) $$invalidate(1, pz = $$props.pz);
    		if ("cm" in $$props) $$invalidate(2, cm = $$props.cm);
    	};

    	$$self.$capture_state = () => ({
    		FileInput,
    		textTolist,
    		storep,
    		Pagination,
    		fjd,
    		current,
    		per_page,
    		fileContents,
    		cc,
    		pz,
    		cm,
    		window,
    		document,
    		FileReader,
    		alert
    	});

    	$$self.$inject_state = $$props => {
    		if ("fjd" in $$props) $$invalidate(3, fjd = $$props.fjd);
    		if ("current" in $$props) $$invalidate(4, current = $$props.current);
    		if ("per_page" in $$props) $$invalidate(5, per_page = $$props.per_page);
    		if ("fileContents" in $$props) $$invalidate(6, fileContents = $$props.fileContents);
    		if ("cc" in $$props) $$invalidate(0, cc = $$props.cc);
    		if ("pz" in $$props) $$invalidate(1, pz = $$props.pz);
    		if ("cm" in $$props) $$invalidate(2, cm = $$props.cm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cc,
    		pz,
    		cm,
    		fjd,
    		current,
    		per_page,
    		fileContents,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		pagination_current_binding,
    		pagination_num_items_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, { fileContents: 6, cc: 0, pz: 1, cm: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fileContents*/ ctx[6] === undefined && !("fileContents" in props)) {
    			console.warn("<App> was created without expected prop 'fileContents'");
    		}

    		if (/*cc*/ ctx[0] === undefined && !("cc" in props)) {
    			console.warn("<App> was created without expected prop 'cc'");
    		}

    		if (/*pz*/ ctx[1] === undefined && !("pz" in props)) {
    			console.warn("<App> was created without expected prop 'pz'");
    		}

    		if (/*cm*/ ctx[2] === undefined && !("cm" in props)) {
    			console.warn("<App> was created without expected prop 'cm'");
    		}
    	}

    	get fileContents() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileContents(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cc() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cc(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pz() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pz(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cm() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cm(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
