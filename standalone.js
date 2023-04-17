(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var vnode;
	var hasRequiredVnode;

	function requireVnode () {
		if (hasRequiredVnode) return vnode;
		hasRequiredVnode = 1;

		function Vnode(tag, key, attrs, children, text, dom) {
			return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
		}
		Vnode.normalize = function(node) {
			if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
			if (node == null || typeof node === "boolean") return null
			if (typeof node === "object") return node
			return Vnode("#", undefined, undefined, String(node), undefined, undefined)
		};
		Vnode.normalizeChildren = function(input) {
			var children = [];
			if (input.length) {
				var isKeyed = input[0] != null && input[0].key != null;
				// Note: this is a *very* perf-sensitive check.
				// Fun fact: merging the loop like this is somehow faster than splitting
				// it, noticeably so.
				for (var i = 1; i < input.length; i++) {
					if ((input[i] != null && input[i].key != null) !== isKeyed) {
						throw new TypeError(
							isKeyed && (input[i] != null || typeof input[i] === "boolean")
								? "In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole."
								: "In fragments, vnodes must either all have keys or none have keys."
						)
					}
				}
				for (var i = 0; i < input.length; i++) {
					children[i] = Vnode.normalize(input[i]);
				}
			}
			return children
		};

		vnode = Vnode;
		return vnode;
	}

	var Vnode$4 = requireVnode();

	// Call via `hyperscriptVnode.apply(startOffset, arguments)`
	//
	// The reason I do it this way, forwarding the arguments and passing the start
	// offset in `this`, is so I don't have to create a temporary array in a
	// performance-critical path.
	//
	// In native ES6, I'd instead add a final `...args` parameter to the
	// `hyperscript` and `fragment` factories and define this as
	// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
	// ES5 (what Mithril.js requires thanks to IE support) doesn't give me that luxury,
	// and engines aren't nearly intelligent enough to do either of these:
	//
	// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
	//    another function only to be indexed.
	// 2. Elide an `arguments` allocation when it's passed to any function other
	//    than `Function.prototype.apply` or `Reflect.apply`.
	//
	// In ES6, it'd probably look closer to this (I'd need to profile it, though):
	// module.exports = function(attrs, ...children) {
	//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
	//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
	//     } else {
	//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
	//         attrs = undefined
	//     }
	//
	//     if (attrs == null) attrs = {}
	//     return Vnode("", attrs.key, attrs, children)
	// }
	var hyperscriptVnode$2 = function() {
		var attrs = arguments[this], start = this + 1, children;

		if (attrs == null) {
			attrs = {};
		} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
			attrs = {};
			start = this;
		}

		if (arguments.length === start + 1) {
			children = arguments[start];
			if (!Array.isArray(children)) children = [children];
		} else {
			children = [];
			while (start < arguments.length) children.push(arguments[start++]);
		}

		return Vnode$4("", attrs.key, attrs, children)
	};

	var hasOwn$2 = {}.hasOwnProperty;

	var Vnode$3 = requireVnode();
	var hyperscriptVnode$1 = hyperscriptVnode$2;
	var hasOwn$1 = hasOwn$2;

	var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
	var selectorCache = {};

	function isEmpty(object) {
		for (var key in object) if (hasOwn$1.call(object, key)) return false
		return true
	}

	function compileSelector(selector) {
		var match, tag = "div", classes = [], attrs = {};
		while (match = selectorParser.exec(selector)) {
			var type = match[1], value = match[2];
			if (type === "" && value !== "") tag = value;
			else if (type === "#") attrs.id = value;
			else if (type === ".") classes.push(value);
			else if (match[3][0] === "[") {
				var attrValue = match[6];
				if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
				if (match[4] === "class") classes.push(attrValue);
				else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
			}
		}
		if (classes.length > 0) attrs.className = classes.join(" ");
		return selectorCache[selector] = {tag: tag, attrs: attrs}
	}

	function execSelector(state, vnode) {
		var attrs = vnode.attrs;
		var hasClass = hasOwn$1.call(attrs, "class");
		var className = hasClass ? attrs.class : attrs.className;

		vnode.tag = state.tag;
		vnode.attrs = {};

		if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
			var newAttrs = {};

			for (var key in attrs) {
				if (hasOwn$1.call(attrs, key)) newAttrs[key] = attrs[key];
			}

			attrs = newAttrs;
		}

		for (var key in state.attrs) {
			if (hasOwn$1.call(state.attrs, key) && key !== "className" && !hasOwn$1.call(attrs, key)){
				attrs[key] = state.attrs[key];
			}
		}
		if (className != null || state.attrs.className != null) attrs.className =
			className != null
				? state.attrs.className != null
					? String(state.attrs.className) + " " + String(className)
					: className
				: state.attrs.className != null
					? state.attrs.className
					: null;

		if (hasClass) attrs.class = null;

		for (var key in attrs) {
			if (hasOwn$1.call(attrs, key) && key !== "key") {
				vnode.attrs = attrs;
				break
			}
		}

		return vnode
	}

	function hyperscript$2(selector) {
		if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
			throw Error("The selector must be either a string or a component.");
		}

		var vnode = hyperscriptVnode$1.apply(1, arguments);

		if (typeof selector === "string") {
			vnode.children = Vnode$3.normalizeChildren(vnode.children);
			if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
		}

		vnode.tag = selector;
		return vnode
	}

	var hyperscript_1$1 = hyperscript$2;

	var Vnode$2 = requireVnode();

	var trust = function(html) {
		if (html == null) html = "";
		return Vnode$2("<", undefined, undefined, html, undefined, undefined)
	};

	var Vnode$1 = requireVnode();
	var hyperscriptVnode = hyperscriptVnode$2;

	var fragment = function() {
		var vnode = hyperscriptVnode.apply(0, arguments);

		vnode.tag = "[";
		vnode.children = Vnode$1.normalizeChildren(vnode.children);
		return vnode
	};

	var hyperscript$1 = hyperscript_1$1;

	hyperscript$1.trust = trust;
	hyperscript$1.fragment = fragment;

	var hyperscript_1 = hyperscript$1;

	var promiseExports = {};
	var promise = {
	  get exports(){ return promiseExports; },
	  set exports(v){ promiseExports = v; },
	};

	var polyfill;
	var hasRequiredPolyfill;

	function requirePolyfill () {
		if (hasRequiredPolyfill) return polyfill;
		hasRequiredPolyfill = 1;
		/** @constructor */
		var PromisePolyfill = function(executor) {
			if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with 'new'.")
			if (typeof executor !== "function") throw new TypeError("executor must be a function.")

			var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
			var instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
			var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
			function handler(list, shouldAbsorb) {
				return function execute(value) {
					var then;
					try {
						if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
							if (value === self) throw new TypeError("Promise can't be resolved with itself.")
							executeOnce(then.bind(value));
						}
						else {
							callAsync(function() {
								if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value);
								for (var i = 0; i < list.length; i++) list[i](value);
								resolvers.length = 0, rejectors.length = 0;
								instance.state = shouldAbsorb;
								instance.retry = function() {execute(value);};
							});
						}
					}
					catch (e) {
						rejectCurrent(e);
					}
				}
			}
			function executeOnce(then) {
				var runs = 0;
				function run(fn) {
					return function(value) {
						if (runs++ > 0) return
						fn(value);
					}
				}
				var onerror = run(rejectCurrent);
				try {then(run(resolveCurrent), onerror);} catch (e) {onerror(e);}
			}

			executeOnce(executor);
		};
		PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
			var self = this, instance = self._instance;
			function handle(callback, list, next, state) {
				list.push(function(value) {
					if (typeof callback !== "function") next(value);
					else try {resolveNext(callback(value));} catch (e) {if (rejectNext) rejectNext(e);}
				});
				if (typeof instance.retry === "function" && state === instance.state) instance.retry();
			}
			var resolveNext, rejectNext;
			var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject;});
			handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
			return promise
		};
		PromisePolyfill.prototype.catch = function(onRejection) {
			return this.then(null, onRejection)
		};
		PromisePolyfill.prototype.finally = function(callback) {
			return this.then(
				function(value) {
					return PromisePolyfill.resolve(callback()).then(function() {
						return value
					})
				},
				function(reason) {
					return PromisePolyfill.resolve(callback()).then(function() {
						return PromisePolyfill.reject(reason);
					})
				}
			)
		};
		PromisePolyfill.resolve = function(value) {
			if (value instanceof PromisePolyfill) return value
			return new PromisePolyfill(function(resolve) {resolve(value);})
		};
		PromisePolyfill.reject = function(value) {
			return new PromisePolyfill(function(resolve, reject) {reject(value);})
		};
		PromisePolyfill.all = function(list) {
			return new PromisePolyfill(function(resolve, reject) {
				var total = list.length, count = 0, values = [];
				if (list.length === 0) resolve([]);
				else for (var i = 0; i < list.length; i++) {
					(function(i) {
						function consume(value) {
							count++;
							values[i] = value;
							if (count === total) resolve(values);
						}
						if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
							list[i].then(consume, reject);
						}
						else consume(list[i]);
					})(i);
				}
			})
		};
		PromisePolyfill.race = function(list) {
			return new PromisePolyfill(function(resolve, reject) {
				for (var i = 0; i < list.length; i++) {
					list[i].then(resolve, reject);
				}
			})
		};

		polyfill = PromisePolyfill;
		return polyfill;
	}

	/* global window */

	var PromisePolyfill$1 = requirePolyfill();

	if (typeof window !== "undefined") {
		if (typeof window.Promise === "undefined") {
			window.Promise = PromisePolyfill$1;
		} else if (!window.Promise.prototype.finally) {
			window.Promise.prototype.finally = PromisePolyfill$1.prototype.finally;
		}
		promise.exports = window.Promise;
	} else if (typeof commonjsGlobal !== "undefined") {
		if (typeof commonjsGlobal.Promise === "undefined") {
			commonjsGlobal.Promise = PromisePolyfill$1;
		} else if (!commonjsGlobal.Promise.prototype.finally) {
			commonjsGlobal.Promise.prototype.finally = PromisePolyfill$1.prototype.finally;
		}
		promise.exports = commonjsGlobal.Promise;
	} else {
		promise.exports = PromisePolyfill$1;
	}

	var render$2;
	var hasRequiredRender$1;

	function requireRender$1 () {
		if (hasRequiredRender$1) return render$2;
		hasRequiredRender$1 = 1;

		var Vnode = requireVnode();

		render$2 = function($window) {
			var $doc = $window && $window.document;
			var currentRedraw;

			var nameSpace = {
				svg: "http://www.w3.org/2000/svg",
				math: "http://www.w3.org/1998/Math/MathML"
			};

			function getNameSpace(vnode) {
				return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
			}

			//sanity check to discourage people from doing `vnode.state = ...`
			function checkState(vnode, original) {
				if (vnode.state !== original) throw new Error("'vnode.state' must not be modified.")
			}

			//Note: the hook is passed as the `this` argument to allow proxying the
			//arguments without requiring a full array allocation to do so. It also
			//takes advantage of the fact the current `vnode` is the first argument in
			//all lifecycle methods.
			function callHook(vnode) {
				var original = vnode.state;
				try {
					return this.apply(original, arguments)
				} finally {
					checkState(vnode, original);
				}
			}

			// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
			// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
			function activeElement() {
				try {
					return $doc.activeElement
				} catch (e) {
					return null
				}
			}
			//create
			function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
				for (var i = start; i < end; i++) {
					var vnode = vnodes[i];
					if (vnode != null) {
						createNode(parent, vnode, hooks, ns, nextSibling);
					}
				}
			}
			function createNode(parent, vnode, hooks, ns, nextSibling) {
				var tag = vnode.tag;
				if (typeof tag === "string") {
					vnode.state = {};
					if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
					switch (tag) {
						case "#": createText(parent, vnode, nextSibling); break
						case "<": createHTML(parent, vnode, ns, nextSibling); break
						case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
						default: createElement(parent, vnode, hooks, ns, nextSibling);
					}
				}
				else createComponent(parent, vnode, hooks, ns, nextSibling);
			}
			function createText(parent, vnode, nextSibling) {
				vnode.dom = $doc.createTextNode(vnode.children);
				insertNode(parent, vnode.dom, nextSibling);
			}
			var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"};
			function createHTML(parent, vnode, ns, nextSibling) {
				var match = vnode.children.match(/^\s*?<(\w+)/im) || [];
				// not using the proper parent makes the child element(s) vanish.
				//     var div = document.createElement("div")
				//     div.innerHTML = "<td>i</td><td>j</td>"
				//     console.log(div.innerHTML)
				// --> "ij", no <td> in sight.
				var temp = $doc.createElement(possibleParents[match[1]] || "div");
				if (ns === "http://www.w3.org/2000/svg") {
					temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>";
					temp = temp.firstChild;
				} else {
					temp.innerHTML = vnode.children;
				}
				vnode.dom = temp.firstChild;
				vnode.domSize = temp.childNodes.length;
				// Capture nodes to remove, so we don't confuse them.
				vnode.instance = [];
				var fragment = $doc.createDocumentFragment();
				var child;
				while (child = temp.firstChild) {
					vnode.instance.push(child);
					fragment.appendChild(child);
				}
				insertNode(parent, fragment, nextSibling);
			}
			function createFragment(parent, vnode, hooks, ns, nextSibling) {
				var fragment = $doc.createDocumentFragment();
				if (vnode.children != null) {
					var children = vnode.children;
					createNodes(fragment, children, 0, children.length, hooks, null, ns);
				}
				vnode.dom = fragment.firstChild;
				vnode.domSize = fragment.childNodes.length;
				insertNode(parent, fragment, nextSibling);
			}
			function createElement(parent, vnode, hooks, ns, nextSibling) {
				var tag = vnode.tag;
				var attrs = vnode.attrs;
				var is = attrs && attrs.is;

				ns = getNameSpace(vnode) || ns;

				var element = ns ?
					is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
					is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
				vnode.dom = element;

				if (attrs != null) {
					setAttrs(vnode, attrs, ns);
				}

				insertNode(parent, element, nextSibling);

				if (!maybeSetContentEditable(vnode)) {
					if (vnode.children != null) {
						var children = vnode.children;
						createNodes(element, children, 0, children.length, hooks, null, ns);
						if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs);
					}
				}
			}
			function initComponent(vnode, hooks) {
				var sentinel;
				if (typeof vnode.tag.view === "function") {
					vnode.state = Object.create(vnode.tag);
					sentinel = vnode.state.view;
					if (sentinel.$$reentrantLock$$ != null) return
					sentinel.$$reentrantLock$$ = true;
				} else {
					vnode.state = void 0;
					sentinel = vnode.tag;
					if (sentinel.$$reentrantLock$$ != null) return
					sentinel.$$reentrantLock$$ = true;
					vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode);
				}
				initLifecycle(vnode.state, vnode, hooks);
				if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
				vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode));
				if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
				sentinel.$$reentrantLock$$ = null;
			}
			function createComponent(parent, vnode, hooks, ns, nextSibling) {
				initComponent(vnode, hooks);
				if (vnode.instance != null) {
					createNode(parent, vnode.instance, hooks, ns, nextSibling);
					vnode.dom = vnode.instance.dom;
					vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0;
				}
				else {
					vnode.domSize = 0;
				}
			}

			//update
			/**
			 * @param {Element|Fragment} parent - the parent element
			 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
			 *                               this part of the tree
			 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
			 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
			 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
			 *                                       fragment that is not the last item in its
			 *                                       parent
			 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
			 * @returns void
			 */
			// This function diffs and patches lists of vnodes, both keyed and unkeyed.
			//
			// We will:
			//
			// 1. describe its general structure
			// 2. focus on the diff algorithm optimizations
			// 3. discuss DOM node operations.

			// ## Overview:
			//
			// The updateNodes() function:
			// - deals with trivial cases
			// - determines whether the lists are keyed or unkeyed based on the first non-null node
			//   of each list.
			// - diffs them and patches the DOM if needed (that's the brunt of the code)
			// - manages the leftovers: after diffing, are there:
			//   - old nodes left to remove?
			// 	 - new nodes to insert?
			// 	 deal with them!
			//
			// The lists are only iterated over once, with an exception for the nodes in `old` that
			// are visited in the fourth part of the diff and in the `removeNodes` loop.

			// ## Diffing
			//
			// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
			// may be good for context on longest increasing subsequence-based logic for moving nodes.
			//
			// In order to diff keyed lists, one has to
			//
			// 1) match nodes in both lists, per key, and update them accordingly
			// 2) create the nodes present in the new list, but absent in the old one
			// 3) remove the nodes present in the old list, but absent in the new one
			// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
			//
			// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
			// over the new list and for each new vnode, find the corresponding vnode in the old list using
			// the map.
			// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
			// and must be created.
			// For the removals, we actually remove the nodes that have been updated from the old list.
			// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
			// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
			// algorithm.
			//
			// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
			// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
			// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
			//  match the above lists, for example).
			//
			// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
			// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
			//
			// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
			// the longest increasing subsequence *of old nodes still present in the new list*).
			//
			// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
			// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
			// the `LIS` and a temporary one to create the LIS).
			//
			// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
			// the LIS and can be updated without moving them.
			//
			// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
			// the exception of the last node if the list is fully reversed).
			//
			// ## Finding the next sibling.
			//
			// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
			// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
			// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
			// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
			//
			// In the other scenarios (swaps, upwards traversal, map-based diff),
			// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
			// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
			// as the next sibling (cached in the `nextSibling` variable).


			// ## DOM node moves
			//
			// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
			// this is not the case if the node moved (second and fourth part of the diff algo). We move
			// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
			// variable rather than fetching it using `getNextSibling()`.
			//
			// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
			// like #1791 and #1999. We need to be smarter about those situations where adjascent old
			// nodes remain together in the new list in a way that isn't covered by parts one and
			// three of the diff algo.

			function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
				if (old === vnodes || old == null && vnodes == null) return
				else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns);
				else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length);
				else {
					var isOldKeyed = old[0] != null && old[0].key != null;
					var isKeyed = vnodes[0] != null && vnodes[0].key != null;
					var start = 0, oldStart = 0;
					if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++;
					if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++;
					if (isOldKeyed !== isKeyed) {
						removeNodes(parent, old, oldStart, old.length);
						createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
					} else if (!isKeyed) {
						// Don't index past the end of either list (causes deopts).
						var commonLength = old.length < vnodes.length ? old.length : vnodes.length;
						// Rewind if necessary to the first non-null index on either side.
						// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
						// but that would be optimizing for sparse lists which are more rare than dense ones.
						start = start < oldStart ? start : oldStart;
						for (; start < commonLength; start++) {
							o = old[start];
							v = vnodes[start];
							if (o === v || o == null && v == null) continue
							else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling));
							else if (v == null) removeNode(parent, o);
							else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns);
						}
						if (old.length > commonLength) removeNodes(parent, old, start, old.length);
						if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
					} else {
						// keyed diff
						var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling;

						// bottom-up
						while (oldEnd >= oldStart && end >= start) {
							oe = old[oldEnd];
							ve = vnodes[end];
							if (oe.key !== ve.key) break
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
							if (ve.dom != null) nextSibling = ve.dom;
							oldEnd--, end--;
						}
						// top-down
						while (oldEnd >= oldStart && end >= start) {
							o = old[oldStart];
							v = vnodes[start];
							if (o.key !== v.key) break
							oldStart++, start++;
							if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns);
						}
						// swaps and list reversals
						while (oldEnd >= oldStart && end >= start) {
							if (start === end) break
							if (o.key !== ve.key || oe.key !== v.key) break
							topSibling = getNextSibling(old, oldStart, nextSibling);
							moveNodes(parent, oe, topSibling);
							if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns);
							if (++start <= --end) moveNodes(parent, o, nextSibling);
							if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns);
							if (ve.dom != null) nextSibling = ve.dom;
							oldStart++; oldEnd--;
							oe = old[oldEnd];
							ve = vnodes[end];
							o = old[oldStart];
							v = vnodes[start];
						}
						// bottom up once again
						while (oldEnd >= oldStart && end >= start) {
							if (oe.key !== ve.key) break
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
							if (ve.dom != null) nextSibling = ve.dom;
							oldEnd--, end--;
							oe = old[oldEnd];
							ve = vnodes[end];
						}
						if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1);
						else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
						else {
							// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
							var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices;
							for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1;
							for (i = end; i >= start; i--) {
								if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1);
								ve = vnodes[i];
								var oldIndex = map[ve.key];
								if (oldIndex != null) {
									pos = (oldIndex < pos) ? oldIndex : -1; // becomes -1 if nodes were re-ordered
									oldIndices[i-start] = oldIndex;
									oe = old[oldIndex];
									old[oldIndex] = null;
									if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
									if (ve.dom != null) nextSibling = ve.dom;
									matched++;
								}
							}
							nextSibling = originalNextSibling;
							if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1);
							if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
							else {
								if (pos === -1) {
									// the indices of the indices of the items that are part of the
									// longest increasing subsequence in the oldIndices list
									lisIndices = makeLisIndices(oldIndices);
									li = lisIndices.length - 1;
									for (i = end; i >= start; i--) {
										v = vnodes[i];
										if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
										else {
											if (lisIndices[li] === i - start) li--;
											else moveNodes(parent, v, nextSibling);
										}
										if (v.dom != null) nextSibling = vnodes[i].dom;
									}
								} else {
									for (i = end; i >= start; i--) {
										v = vnodes[i];
										if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
										if (v.dom != null) nextSibling = vnodes[i].dom;
									}
								}
							}
						}
					}
				}
			}
			function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
				var oldTag = old.tag, tag = vnode.tag;
				if (oldTag === tag) {
					vnode.state = old.state;
					vnode.events = old.events;
					if (shouldNotUpdate(vnode, old)) return
					if (typeof oldTag === "string") {
						if (vnode.attrs != null) {
							updateLifecycle(vnode.attrs, vnode, hooks);
						}
						switch (oldTag) {
							case "#": updateText(old, vnode); break
							case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
							case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
							default: updateElement(old, vnode, hooks, ns);
						}
					}
					else updateComponent(parent, old, vnode, hooks, nextSibling, ns);
				}
				else {
					removeNode(parent, old);
					createNode(parent, vnode, hooks, ns, nextSibling);
				}
			}
			function updateText(old, vnode) {
				if (old.children.toString() !== vnode.children.toString()) {
					old.dom.nodeValue = vnode.children;
				}
				vnode.dom = old.dom;
			}
			function updateHTML(parent, old, vnode, ns, nextSibling) {
				if (old.children !== vnode.children) {
					removeHTML(parent, old);
					createHTML(parent, vnode, ns, nextSibling);
				}
				else {
					vnode.dom = old.dom;
					vnode.domSize = old.domSize;
					vnode.instance = old.instance;
				}
			}
			function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
				updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns);
				var domSize = 0, children = vnode.children;
				vnode.dom = null;
				if (children != null) {
					for (var i = 0; i < children.length; i++) {
						var child = children[i];
						if (child != null && child.dom != null) {
							if (vnode.dom == null) vnode.dom = child.dom;
							domSize += child.domSize || 1;
						}
					}
					if (domSize !== 1) vnode.domSize = domSize;
				}
			}
			function updateElement(old, vnode, hooks, ns) {
				var element = vnode.dom = old.dom;
				ns = getNameSpace(vnode) || ns;

				if (vnode.tag === "textarea") {
					if (vnode.attrs == null) vnode.attrs = {};
				}
				updateAttrs(vnode, old.attrs, vnode.attrs, ns);
				if (!maybeSetContentEditable(vnode)) {
					updateNodes(element, old.children, vnode.children, hooks, null, ns);
				}
			}
			function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
				vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode));
				if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
				updateLifecycle(vnode.state, vnode, hooks);
				if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks);
				if (vnode.instance != null) {
					if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling);
					else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns);
					vnode.dom = vnode.instance.dom;
					vnode.domSize = vnode.instance.domSize;
				}
				else if (old.instance != null) {
					removeNode(parent, old.instance);
					vnode.dom = undefined;
					vnode.domSize = 0;
				}
				else {
					vnode.dom = old.dom;
					vnode.domSize = old.domSize;
				}
			}
			function getKeyMap(vnodes, start, end) {
				var map = Object.create(null);
				for (; start < end; start++) {
					var vnode = vnodes[start];
					if (vnode != null) {
						var key = vnode.key;
						if (key != null) map[key] = start;
					}
				}
				return map
			}
			// Lifted from ivi https://github.com/ivijs/ivi/
			// takes a list of unique numbers (-1 is special and can
			// occur multiple times) and returns an array with the indices
			// of the items that are part of the longest increasing
			// subsequence
			var lisTemp = [];
			function makeLisIndices(a) {
				var result = [0];
				var u = 0, v = 0, i = 0;
				var il = lisTemp.length = a.length;
				for (var i = 0; i < il; i++) lisTemp[i] = a[i];
				for (var i = 0; i < il; ++i) {
					if (a[i] === -1) continue
					var j = result[result.length - 1];
					if (a[j] < a[i]) {
						lisTemp[i] = j;
						result.push(i);
						continue
					}
					u = 0;
					v = result.length - 1;
					while (u < v) {
						// Fast integer average without overflow.
						// eslint-disable-next-line no-bitwise
						var c = (u >>> 1) + (v >>> 1) + (u & v & 1);
						if (a[result[c]] < a[i]) {
							u = c + 1;
						}
						else {
							v = c;
						}
					}
					if (a[i] < a[result[u]]) {
						if (u > 0) lisTemp[i] = result[u - 1];
						result[u] = i;
					}
				}
				u = result.length;
				v = result[u - 1];
				while (u-- > 0) {
					result[u] = v;
					v = lisTemp[v];
				}
				lisTemp.length = 0;
				return result
			}

			function getNextSibling(vnodes, i, nextSibling) {
				for (; i < vnodes.length; i++) {
					if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
				}
				return nextSibling
			}

			// This covers a really specific edge case:
			// - Parent node is keyed and contains child
			// - Child is removed, returns unresolved promise in `onbeforeremove`
			// - Parent node is moved in keyed diff
			// - Remaining children still need moved appropriately
			//
			// Ideally, I'd track removed nodes as well, but that introduces a lot more
			// complexity and I'm not exactly interested in doing that.
			function moveNodes(parent, vnode, nextSibling) {
				var frag = $doc.createDocumentFragment();
				moveChildToFrag(parent, frag, vnode);
				insertNode(parent, frag, nextSibling);
			}
			function moveChildToFrag(parent, frag, vnode) {
				// Dodge the recursion overhead in a few of the most common cases.
				while (vnode.dom != null && vnode.dom.parentNode === parent) {
					if (typeof vnode.tag !== "string") {
						vnode = vnode.instance;
						if (vnode != null) continue
					} else if (vnode.tag === "<") {
						for (var i = 0; i < vnode.instance.length; i++) {
							frag.appendChild(vnode.instance[i]);
						}
					} else if (vnode.tag !== "[") {
						// Don't recurse for text nodes *or* elements, just fragments
						frag.appendChild(vnode.dom);
					} else if (vnode.children.length === 1) {
						vnode = vnode.children[0];
						if (vnode != null) continue
					} else {
						for (var i = 0; i < vnode.children.length; i++) {
							var child = vnode.children[i];
							if (child != null) moveChildToFrag(parent, frag, child);
						}
					}
					break
				}
			}

			function insertNode(parent, dom, nextSibling) {
				if (nextSibling != null) parent.insertBefore(dom, nextSibling);
				else parent.appendChild(dom);
			}

			function maybeSetContentEditable(vnode) {
				if (vnode.attrs == null || (
					vnode.attrs.contenteditable == null && // attribute
					vnode.attrs.contentEditable == null // property
				)) return false
				var children = vnode.children;
				if (children != null && children.length === 1 && children[0].tag === "<") {
					var content = children[0].children;
					if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content;
				}
				else if (children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted.")
				return true
			}

			//remove
			function removeNodes(parent, vnodes, start, end) {
				for (var i = start; i < end; i++) {
					var vnode = vnodes[i];
					if (vnode != null) removeNode(parent, vnode);
				}
			}
			function removeNode(parent, vnode) {
				var mask = 0;
				var original = vnode.state;
				var stateResult, attrsResult;
				if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
					var result = callHook.call(vnode.state.onbeforeremove, vnode);
					if (result != null && typeof result.then === "function") {
						mask = 1;
						stateResult = result;
					}
				}
				if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
					var result = callHook.call(vnode.attrs.onbeforeremove, vnode);
					if (result != null && typeof result.then === "function") {
						// eslint-disable-next-line no-bitwise
						mask |= 2;
						attrsResult = result;
					}
				}
				checkState(vnode, original);

				// If we can, try to fast-path it and avoid all the overhead of awaiting
				if (!mask) {
					onremove(vnode);
					removeChild(parent, vnode);
				} else {
					if (stateResult != null) {
						var next = function () {
							// eslint-disable-next-line no-bitwise
							if (mask & 1) { mask &= 2; if (!mask) reallyRemove(); }
						};
						stateResult.then(next, next);
					}
					if (attrsResult != null) {
						var next = function () {
							// eslint-disable-next-line no-bitwise
							if (mask & 2) { mask &= 1; if (!mask) reallyRemove(); }
						};
						attrsResult.then(next, next);
					}
				}

				function reallyRemove() {
					checkState(vnode, original);
					onremove(vnode);
					removeChild(parent, vnode);
				}
			}
			function removeHTML(parent, vnode) {
				for (var i = 0; i < vnode.instance.length; i++) {
					parent.removeChild(vnode.instance[i]);
				}
			}
			function removeChild(parent, vnode) {
				// Dodge the recursion overhead in a few of the most common cases.
				while (vnode.dom != null && vnode.dom.parentNode === parent) {
					if (typeof vnode.tag !== "string") {
						vnode = vnode.instance;
						if (vnode != null) continue
					} else if (vnode.tag === "<") {
						removeHTML(parent, vnode);
					} else {
						if (vnode.tag !== "[") {
							parent.removeChild(vnode.dom);
							if (!Array.isArray(vnode.children)) break
						}
						if (vnode.children.length === 1) {
							vnode = vnode.children[0];
							if (vnode != null) continue
						} else {
							for (var i = 0; i < vnode.children.length; i++) {
								var child = vnode.children[i];
								if (child != null) removeChild(parent, child);
							}
						}
					}
					break
				}
			}
			function onremove(vnode) {
				if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode);
				if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode);
				if (typeof vnode.tag !== "string") {
					if (vnode.instance != null) onremove(vnode.instance);
				} else {
					var children = vnode.children;
					if (Array.isArray(children)) {
						for (var i = 0; i < children.length; i++) {
							var child = children[i];
							if (child != null) onremove(child);
						}
					}
				}
			}

			//attrs
			function setAttrs(vnode, attrs, ns) {
				// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
				//
				// Also, the DOM does things to inputs based on the value, so it needs set first.
				// See: https://github.com/MithrilJS/mithril.js/issues/2622
				if (vnode.tag === "input" && attrs.type != null) vnode.dom.setAttribute("type", attrs.type);
				var isFileInput = attrs != null && vnode.tag === "input" && attrs.type === "file";
				for (var key in attrs) {
					setAttr(vnode, key, null, attrs[key], ns, isFileInput);
				}
			}
			function setAttr(vnode, key, old, value, ns, isFileInput) {
				if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object" || key === "type" && vnode.tag === "input") return
				if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
				if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
				else if (key === "style") updateStyle(vnode.dom, old, value);
				else if (hasPropertyKey(vnode, key, ns)) {
					if (key === "value") {
						// Only do the coercion if we're actually going to check the value.
						/* eslint-disable no-implicit-coercion */
						//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
						//setting input[type=file][value] to same value causes an error to be generated if it's non-empty
						if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && (isFileInput || vnode.dom === activeElement())) return
						//setting select[value] to same value while having select open blinks select dropdown in Chrome
						if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
						//setting option[value] to same value while having select open blinks select dropdown in Chrome
						if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
						//setting input[type=file][value] to different value is an error if it's non-empty
						// Not ideal, but it at least works around the most common source of uncaught exceptions for now.
						if (isFileInput && "" + value !== "") { console.error("`value` is read-only on file inputs!"); return }
						/* eslint-enable no-implicit-coercion */
					}
					vnode.dom[key] = value;
				} else {
					if (typeof value === "boolean") {
						if (value) vnode.dom.setAttribute(key, "");
						else vnode.dom.removeAttribute(key);
					}
					else vnode.dom.setAttribute(key === "className" ? "class" : key, value);
				}
			}
			function removeAttr(vnode, key, old, ns) {
				if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
				if (key[0] === "o" && key[1] === "n") updateEvent(vnode, key, undefined);
				else if (key === "style") updateStyle(vnode.dom, old, null);
				else if (
					hasPropertyKey(vnode, key, ns)
					&& key !== "className"
					&& key !== "title" // creates "null" as title
					&& !(key === "value" && (
						vnode.tag === "option"
						|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
					))
					&& !(vnode.tag === "input" && key === "type")
				) {
					vnode.dom[key] = null;
				} else {
					var nsLastIndex = key.indexOf(":");
					if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1);
					if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key);
				}
			}
			function setLateSelectAttrs(vnode, attrs) {
				if ("value" in attrs) {
					if(attrs.value === null) {
						if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null;
					} else {
						var normalized = "" + attrs.value; // eslint-disable-line no-implicit-coercion
						if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
							vnode.dom.value = normalized;
						}
					}
				}
				if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined);
			}
			function updateAttrs(vnode, old, attrs, ns) {
				if (old && old === attrs) {
					console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major");
				}
				if (attrs != null) {
					// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
					//
					// Also, the DOM does things to inputs based on the value, so it needs set first.
					// See: https://github.com/MithrilJS/mithril.js/issues/2622
					if (vnode.tag === "input" && attrs.type != null) vnode.dom.setAttribute("type", attrs.type);
					var isFileInput = vnode.tag === "input" && attrs.type === "file";
					for (var key in attrs) {
						setAttr(vnode, key, old && old[key], attrs[key], ns, isFileInput);
					}
				}
				var val;
				if (old != null) {
					for (var key in old) {
						if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
							removeAttr(vnode, key, val, ns);
						}
					}
				}
			}
			function isFormAttribute(vnode, attr) {
				return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
			}
			function isLifecycleMethod(attr) {
				return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
			}
			function hasPropertyKey(vnode, key, ns) {
				// Filter out namespaced keys
				return ns === undefined && (
					// If it's a custom element, just keep it.
					vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
					// If it's a normal element, let's try to avoid a few browser bugs.
					key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
					// Defer the property check until *after* we check everything.
				) && key in vnode.dom
			}

			//style
			var uppercaseRegex = /[A-Z]/g;
			function toLowerCase(capital) { return "-" + capital.toLowerCase() }
			function normalizeKey(key) {
				return key[0] === "-" && key[1] === "-" ? key :
					key === "cssFloat" ? "float" :
						key.replace(uppercaseRegex, toLowerCase)
			}
			function updateStyle(element, old, style) {
				if (old === style) ; else if (style == null) {
					// New style is missing, just clear it.
					element.style.cssText = "";
				} else if (typeof style !== "object") {
					// New style is a string, let engine deal with patching.
					element.style.cssText = style;
				} else if (old == null || typeof old !== "object") {
					// `old` is missing or a string, `style` is an object.
					element.style.cssText = "";
					// Add new style properties
					for (var key in style) {
						var value = style[key];
						if (value != null) element.style.setProperty(normalizeKey(key), String(value));
					}
				} else {
					// Both old & new are (different) objects.
					// Update style properties that have changed
					for (var key in style) {
						var value = style[key];
						if (value != null && (value = String(value)) !== String(old[key])) {
							element.style.setProperty(normalizeKey(key), value);
						}
					}
					// Remove style properties that no longer exist
					for (var key in old) {
						if (old[key] != null && style[key] == null) {
							element.style.removeProperty(normalizeKey(key));
						}
					}
				}
			}

			// Here's an explanation of how this works:
			// 1. The event names are always (by design) prefixed by `on`.
			// 2. The EventListener interface accepts either a function or an object
			//    with a `handleEvent` method.
			// 3. The object does not inherit from `Object.prototype`, to avoid
			//    any potential interference with that (e.g. setters).
			// 4. The event name is remapped to the handler before calling it.
			// 5. In function-based event handlers, `ev.target === this`. We replicate
			//    that below.
			// 6. In function-based event handlers, `return false` prevents the default
			//    action and stops event propagation. We replicate that below.
			function EventDict() {
				// Save this, so the current redraw is correctly tracked.
				this._ = currentRedraw;
			}
			EventDict.prototype = Object.create(null);
			EventDict.prototype.handleEvent = function (ev) {
				var handler = this["on" + ev.type];
				var result;
				if (typeof handler === "function") result = handler.call(ev.currentTarget, ev);
				else if (typeof handler.handleEvent === "function") handler.handleEvent(ev);
				if (this._ && ev.redraw !== false) (0, this._)();
				if (result === false) {
					ev.preventDefault();
					ev.stopPropagation();
				}
			};

			//event
			function updateEvent(vnode, key, value) {
				if (vnode.events != null) {
					vnode.events._ = currentRedraw;
					if (vnode.events[key] === value) return
					if (value != null && (typeof value === "function" || typeof value === "object")) {
						if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false);
						vnode.events[key] = value;
					} else {
						if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false);
						vnode.events[key] = undefined;
					}
				} else if (value != null && (typeof value === "function" || typeof value === "object")) {
					vnode.events = new EventDict();
					vnode.dom.addEventListener(key.slice(2), vnode.events, false);
					vnode.events[key] = value;
				}
			}

			//lifecycle
			function initLifecycle(source, vnode, hooks) {
				if (typeof source.oninit === "function") callHook.call(source.oninit, vnode);
				if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode));
			}
			function updateLifecycle(source, vnode, hooks) {
				if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode));
			}
			function shouldNotUpdate(vnode, old) {
				do {
					if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
						var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old);
						if (force !== undefined && !force) break
					}
					if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
						var force = callHook.call(vnode.state.onbeforeupdate, vnode, old);
						if (force !== undefined && !force) break
					}
					return false
				} while (false); // eslint-disable-line no-constant-condition
				vnode.dom = old.dom;
				vnode.domSize = old.domSize;
				vnode.instance = old.instance;
				// One would think having the actual latest attributes would be ideal,
				// but it doesn't let us properly diff based on our current internal
				// representation. We have to save not only the old DOM info, but also
				// the attributes used to create it, as we diff *that*, not against the
				// DOM directly (with a few exceptions in `setAttr`). And, of course, we
				// need to save the children and text as they are conceptually not
				// unlike special "attributes" internally.
				vnode.attrs = old.attrs;
				vnode.children = old.children;
				vnode.text = old.text;
				return true
			}

			var currentDOM;

			return function(dom, vnodes, redraw) {
				if (!dom) throw new TypeError("DOM element being rendered to does not exist.")
				if (currentDOM != null && dom.contains(currentDOM)) {
					throw new TypeError("Node is currently being rendered to and thus is locked.")
				}
				var prevRedraw = currentRedraw;
				var prevDOM = currentDOM;
				var hooks = [];
				var active = activeElement();
				var namespace = dom.namespaceURI;

				currentDOM = dom;
				currentRedraw = typeof redraw === "function" ? redraw : undefined;
				try {
					// First time rendering into a node clears it out
					if (dom.vnodes == null) dom.textContent = "";
					vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes]);
					updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace);
					dom.vnodes = vnodes;
					// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
					if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus();
					for (var i = 0; i < hooks.length; i++) hooks[i]();
				} finally {
					currentRedraw = prevRedraw;
					currentDOM = prevDOM;
				}
			}
		};
		return render$2;
	}

	var render$1;
	var hasRequiredRender;

	function requireRender () {
		if (hasRequiredRender) return render$1;
		hasRequiredRender = 1;

		render$1 = requireRender$1()(typeof window !== "undefined" ? window : null);
		return render$1;
	}

	var Vnode = requireVnode();

	var mountRedraw$3 = function(render, schedule, console) {
		var subscriptions = [];
		var pending = false;
		var offset = -1;

		function sync() {
			for (offset = 0; offset < subscriptions.length; offset += 2) {
				try { render(subscriptions[offset], Vnode(subscriptions[offset + 1]), redraw); }
				catch (e) { console.error(e); }
			}
			offset = -1;
		}

		function redraw() {
			if (!pending) {
				pending = true;
				schedule(function() {
					pending = false;
					sync();
				});
			}
		}

		redraw.sync = sync;

		function mount(root, component) {
			if (component != null && component.view == null && typeof component !== "function") {
				throw new TypeError("m.mount expects a component, not a vnode.")
			}

			var index = subscriptions.indexOf(root);
			if (index >= 0) {
				subscriptions.splice(index, 2);
				if (index <= offset) offset -= 2;
				render(root, []);
			}

			if (component != null) {
				subscriptions.push(root, component);
				render(root, Vnode(component), redraw);
			}
		}

		return {mount: mount, redraw: redraw}
	};

	var render = requireRender();

	var mountRedraw$2 = mountRedraw$3(render, typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : null, typeof console !== "undefined" ? console : null);

	var build$1;
	var hasRequiredBuild$1;

	function requireBuild$1 () {
		if (hasRequiredBuild$1) return build$1;
		hasRequiredBuild$1 = 1;

		build$1 = function(object) {
			if (Object.prototype.toString.call(object) !== "[object Object]") return ""

			var args = [];
			for (var key in object) {
				destructure(key, object[key]);
			}

			return args.join("&")

			function destructure(key, value) {
				if (Array.isArray(value)) {
					for (var i = 0; i < value.length; i++) {
						destructure(key + "[" + i + "]", value[i]);
					}
				}
				else if (Object.prototype.toString.call(value) === "[object Object]") {
					for (var i in value) {
						destructure(key + "[" + i + "]", value[i]);
					}
				}
				else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
			}
		};
		return build$1;
	}

	var assign$1;
	var hasRequiredAssign;

	function requireAssign () {
		if (hasRequiredAssign) return assign$1;
		hasRequiredAssign = 1;

		var hasOwn = hasOwn$2;

		assign$1 = Object.assign || function(target, source) {
			for (var key in source) {
				if (hasOwn.call(source, key)) target[key] = source[key];
			}
		};
		return assign$1;
	}

	var build;
	var hasRequiredBuild;

	function requireBuild () {
		if (hasRequiredBuild) return build;
		hasRequiredBuild = 1;

		var buildQueryString = requireBuild$1();
		var assign = requireAssign();

		// Returns `path` from `template` + `params`
		build = function(template, params) {
			if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
				throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.")
			}
			if (params == null) return template
			var queryIndex = template.indexOf("?");
			var hashIndex = template.indexOf("#");
			var queryEnd = hashIndex < 0 ? template.length : hashIndex;
			var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
			var path = template.slice(0, pathEnd);
			var query = {};

			assign(query, params);

			var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
				delete query[key];
				// If no such parameter exists, don't interpolate it.
				if (params[key] == null) return m
				// Escape normal parameters, but not variadic ones.
				return variadic ? params[key] : encodeURIComponent(String(params[key]))
			});

			// In case the template substitution adds new query/hash parameters.
			var newQueryIndex = resolved.indexOf("?");
			var newHashIndex = resolved.indexOf("#");
			var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex;
			var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex;
			var result = resolved.slice(0, newPathEnd);

			if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd);
			if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd);
			var querystring = buildQueryString(query);
			if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring;
			if (hashIndex >= 0) result += template.slice(hashIndex);
			if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex);
			return result
		};
		return build;
	}

	var buildPathname = requireBuild();
	var hasOwn = hasOwn$2;

	var request$2 = function($window, Promise, oncompletion) {
		var callbackCount = 0;

		function PromiseProxy(executor) {
			return new Promise(executor)
		}

		// In case the global Promise is some userland library's where they rely on
		// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
		// similar. Let's *not* break them.
		PromiseProxy.prototype = Promise.prototype;
		PromiseProxy.__proto__ = Promise; // eslint-disable-line no-proto

		function makeRequest(factory) {
			return function(url, args) {
				if (typeof url !== "string") { args = url; url = url.url; }
				else if (args == null) args = {};
				var promise = new Promise(function(resolve, reject) {
					factory(buildPathname(url, args.params), args, function (data) {
						if (typeof args.type === "function") {
							if (Array.isArray(data)) {
								for (var i = 0; i < data.length; i++) {
									data[i] = new args.type(data[i]);
								}
							}
							else data = new args.type(data);
						}
						resolve(data);
					}, reject);
				});
				if (args.background === true) return promise
				var count = 0;
				function complete() {
					if (--count === 0 && typeof oncompletion === "function") oncompletion();
				}

				return wrap(promise)

				function wrap(promise) {
					var then = promise.then;
					// Set the constructor, so engines know to not await or resolve
					// this as a native promise. At the time of writing, this is
					// only necessary for V8, but their behavior is the correct
					// behavior per spec. See this spec issue for more details:
					// https://github.com/tc39/ecma262/issues/1577. Also, see the
					// corresponding comment in `request/tests/test-request.js` for
					// a bit more background on the issue at hand.
					promise.constructor = PromiseProxy;
					promise.then = function() {
						count++;
						var next = then.apply(promise, arguments);
						next.then(complete, function(e) {
							complete();
							if (count === 0) throw e
						});
						return wrap(next)
					};
					return promise
				}
			}
		}

		function hasHeader(args, name) {
			for (var key in args.headers) {
				if (hasOwn.call(args.headers, key) && key.toLowerCase() === name) return true
			}
			return false
		}

		return {
			request: makeRequest(function(url, args, resolve, reject) {
				var method = args.method != null ? args.method.toUpperCase() : "GET";
				var body = args.body;
				var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData || body instanceof $window.URLSearchParams);
				var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json");

				var xhr = new $window.XMLHttpRequest(), aborted = false, isTimeout = false;
				var original = xhr, replacedAbort;
				var abort = xhr.abort;

				xhr.abort = function() {
					aborted = true;
					abort.call(this);
				};

				xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);

				if (assumeJSON && body != null && !hasHeader(args, "content-type")) {
					xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
				}
				if (typeof args.deserialize !== "function" && !hasHeader(args, "accept")) {
					xhr.setRequestHeader("Accept", "application/json, text/*");
				}
				if (args.withCredentials) xhr.withCredentials = args.withCredentials;
				if (args.timeout) xhr.timeout = args.timeout;
				xhr.responseType = responseType;

				for (var key in args.headers) {
					if (hasOwn.call(args.headers, key)) {
						xhr.setRequestHeader(key, args.headers[key]);
					}
				}

				xhr.onreadystatechange = function(ev) {
					// Don't throw errors on xhr.abort().
					if (aborted) return

					if (ev.target.readyState === 4) {
						try {
							var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url);
							// When the response type isn't "" or "text",
							// `xhr.responseText` is the wrong thing to use.
							// Browsers do the right thing and throw here, and we
							// should honor that and do the right thing by
							// preferring `xhr.response` where possible/practical.
							var response = ev.target.response, message;

							if (responseType === "json") {
								// For IE and Edge, which don't implement
								// `responseType: "json"`.
								if (!ev.target.responseType && typeof args.extract !== "function") {
									// Handle no-content which will not parse.
									try { response = JSON.parse(ev.target.responseText); }
									catch (e) { response = null; }
								}
							} else if (!responseType || responseType === "text") {
								// Only use this default if it's text. If a parsed
								// document is needed on old IE and friends (all
								// unsupported), the user should use a custom
								// `config` instead. They're already using this at
								// their own risk.
								if (response == null) response = ev.target.responseText;
							}

							if (typeof args.extract === "function") {
								response = args.extract(ev.target, args);
								success = true;
							} else if (typeof args.deserialize === "function") {
								response = args.deserialize(response);
							}
							if (success) resolve(response);
							else {
								var completeErrorResponse = function() {
									try { message = ev.target.responseText; }
									catch (e) { message = response; }
									var error = new Error(message);
									error.code = ev.target.status;
									error.response = response;
									reject(error);
								};

								if (xhr.status === 0) {
									// Use setTimeout to push this code block onto the event queue
									// This allows `xhr.ontimeout` to run in the case that there is a timeout
									// Without this setTimeout, `xhr.ontimeout` doesn't have a chance to reject
									// as `xhr.onreadystatechange` will run before it
									setTimeout(function() {
										if (isTimeout) return
										completeErrorResponse();
									});
								} else completeErrorResponse();
							}
						}
						catch (e) {
							reject(e);
						}
					}
				};

				xhr.ontimeout = function (ev) {
					isTimeout = true;
					var error = new Error("Request timed out");
					error.code = ev.target.status;
					reject(error);
				};

				if (typeof args.config === "function") {
					xhr = args.config(xhr, args, url) || xhr;

					// Propagate the `abort` to any replacement XHR as well.
					if (xhr !== original) {
						replacedAbort = xhr.abort;
						xhr.abort = function() {
							aborted = true;
							replacedAbort.call(this);
						};
					}
				}

				if (body == null) xhr.send();
				else if (typeof args.serialize === "function") xhr.send(args.serialize(body));
				else if (body instanceof $window.FormData || body instanceof $window.URLSearchParams) xhr.send(body);
				else xhr.send(JSON.stringify(body));
			}),
			jsonp: makeRequest(function(url, args, resolve, reject) {
				var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
				var script = $window.document.createElement("script");
				$window[callbackName] = function(data) {
					delete $window[callbackName];
					script.parentNode.removeChild(script);
					resolve(data);
				};
				script.onerror = function() {
					delete $window[callbackName];
					script.parentNode.removeChild(script);
					reject(new Error("JSONP request failed"));
				};
				script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
					encodeURIComponent(args.callbackKey || "callback") + "=" +
					encodeURIComponent(callbackName);
				$window.document.documentElement.appendChild(script);
			}),
		}
	};

	var PromisePolyfill = promiseExports;
	var mountRedraw$1 = mountRedraw$2;

	var request$1 = request$2(typeof window !== "undefined" ? window : null, PromisePolyfill, mountRedraw$1.redraw);

	var parse$2;
	var hasRequiredParse$1;

	function requireParse$1 () {
		if (hasRequiredParse$1) return parse$2;
		hasRequiredParse$1 = 1;

		function decodeURIComponentSave(str) {
			try {
				return decodeURIComponent(str)
			} catch(err) {
				return str
			}
		}

		parse$2 = function(string) {
			if (string === "" || string == null) return {}
			if (string.charAt(0) === "?") string = string.slice(1);

			var entries = string.split("&"), counters = {}, data = {};
			for (var i = 0; i < entries.length; i++) {
				var entry = entries[i].split("=");
				var key = decodeURIComponentSave(entry[0]);
				var value = entry.length === 2 ? decodeURIComponentSave(entry[1]) : "";

				if (value === "true") value = true;
				else if (value === "false") value = false;

				var levels = key.split(/\]\[?|\[/);
				var cursor = data;
				if (key.indexOf("[") > -1) levels.pop();
				for (var j = 0; j < levels.length; j++) {
					var level = levels[j], nextLevel = levels[j + 1];
					var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
					if (level === "") {
						var key = levels.slice(0, j).join();
						if (counters[key] == null) {
							counters[key] = Array.isArray(cursor) ? cursor.length : 0;
						}
						level = counters[key]++;
					}
					// Disallow direct prototype pollution
					else if (level === "__proto__") break
					if (j === levels.length - 1) cursor[level] = value;
					else {
						// Read own properties exclusively to disallow indirect
						// prototype pollution
						var desc = Object.getOwnPropertyDescriptor(cursor, level);
						if (desc != null) desc = desc.value;
						if (desc == null) cursor[level] = desc = isNumber ? [] : {};
						cursor = desc;
					}
				}
			}
			return data
		};
		return parse$2;
	}

	var parse$1;
	var hasRequiredParse;

	function requireParse () {
		if (hasRequiredParse) return parse$1;
		hasRequiredParse = 1;

		var parseQueryString = requireParse$1();

		// Returns `{path, params}` from `url`
		parse$1 = function(url) {
			var queryIndex = url.indexOf("?");
			var hashIndex = url.indexOf("#");
			var queryEnd = hashIndex < 0 ? url.length : hashIndex;
			var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
			var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/");

			if (!path) path = "/";
			else {
				if (path[0] !== "/") path = "/" + path;
				if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1);
			}
			return {
				path: path,
				params: queryIndex < 0
					? {}
					: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
			}
		};
		return parse$1;
	}

	var compileTemplate;
	var hasRequiredCompileTemplate;

	function requireCompileTemplate () {
		if (hasRequiredCompileTemplate) return compileTemplate;
		hasRequiredCompileTemplate = 1;

		var parsePathname = requireParse();

		// Compiles a template into a function that takes a resolved path (without query
		// strings) and returns an object containing the template parameters with their
		// parsed values. This expects the input of the compiled template to be the
		// output of `parsePathname`. Note that it does *not* remove query parameters
		// specified in the template.
		compileTemplate = function(template) {
			var templateData = parsePathname(template);
			var templateKeys = Object.keys(templateData.params);
			var keys = [];
			var regexp = new RegExp("^" + templateData.path.replace(
				// I escape literal text so people can use things like `:file.:ext` or
				// `:lang-:locale` in routes. This is all merged into one pass so I
				// don't also accidentally escape `-` and make it harder to detect it to
				// ban it from template parameters.
				/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
				function(m, key, extra) {
					if (key == null) return "\\" + m
					keys.push({k: key, r: extra === "..."});
					if (extra === "...") return "(.*)"
					if (extra === ".") return "([^/]+)\\."
					return "([^/]+)" + (extra || "")
				}
			) + "$");
			return function(data) {
				// First, check the params. Usually, there isn't any, and it's just
				// checking a static set.
				for (var i = 0; i < templateKeys.length; i++) {
					if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
				}
				// If no interpolations exist, let's skip all the ceremony
				if (!keys.length) return regexp.test(data.path)
				var values = regexp.exec(data.path);
				if (values == null) return false
				for (var i = 0; i < keys.length; i++) {
					data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1]);
				}
				return true
			}
		};
		return compileTemplate;
	}

	var censor;
	var hasRequiredCensor;

	function requireCensor () {
		if (hasRequiredCensor) return censor;
		hasRequiredCensor = 1;

		// Note: this is mildly perf-sensitive.
		//
		// It does *not* use `delete` - dynamic `delete`s usually cause objects to bail
		// out into dictionary mode and just generally cause a bunch of optimization
		// issues within engines.
		//
		// Ideally, I would've preferred to do this, if it weren't for the optimization
		// issues:
		//
		// ```js
		// const hasOwn = require("./hasOwn")
		// const magic = [
		//     "key", "oninit", "oncreate", "onbeforeupdate", "onupdate",
		//     "onbeforeremove", "onremove",
		// ]
		// module.exports = (attrs, extras) => {
		//     const result = Object.assign(Object.create(null), attrs)
		//     for (const key of magic) delete result[key]
		//     if (extras != null) for (const key of extras) delete result[key]
		//     return result
		// }
		// ```

		var hasOwn = hasOwn$2;
		// Words in RegExp literals are sometimes mangled incorrectly by the internal bundler, so use RegExp().
		var magic = new RegExp("^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$");

		censor = function(attrs, extras) {
			var result = {};

			if (extras != null) {
				for (var key in attrs) {
					if (hasOwn.call(attrs, key) && !magic.test(key) && extras.indexOf(key) < 0) {
						result[key] = attrs[key];
					}
				}
			} else {
				for (var key in attrs) {
					if (hasOwn.call(attrs, key) && !magic.test(key)) {
						result[key] = attrs[key];
					}
				}
			}

			return result
		};
		return censor;
	}

	var router;
	var hasRequiredRouter;

	function requireRouter () {
		if (hasRequiredRouter) return router;
		hasRequiredRouter = 1;

		var Vnode = requireVnode();
		var m = hyperscript_1$1;
		var Promise = promiseExports;

		var buildPathname = requireBuild();
		var parsePathname = requireParse();
		var compileTemplate = requireCompileTemplate();
		var assign = requireAssign();
		var censor = requireCensor();

		var sentinel = {};

		function decodeURIComponentSave(component) {
			try {
				return decodeURIComponent(component)
			} catch(e) {
				return component
			}
		}

		router = function($window, mountRedraw) {
			var callAsync = $window == null
				// In case Mithril.js' loaded globally without the DOM, let's not break
				? null
				: typeof $window.setImmediate === "function" ? $window.setImmediate : $window.setTimeout;
			var p = Promise.resolve();

			var scheduled = false;

			// state === 0: init
			// state === 1: scheduled
			// state === 2: done
			var ready = false;
			var state = 0;

			var compiled, fallbackRoute;

			var currentResolver = sentinel, component, attrs, currentPath, lastUpdate;

			var RouterRoot = {
				onbeforeupdate: function() {
					state = state ? 2 : 1;
					return !(!state || sentinel === currentResolver)
				},
				onremove: function() {
					$window.removeEventListener("popstate", fireAsync, false);
					$window.removeEventListener("hashchange", resolveRoute, false);
				},
				view: function() {
					if (!state || sentinel === currentResolver) return
					// Wrap in a fragment to preserve existing key semantics
					var vnode = [Vnode(component, attrs.key, attrs)];
					if (currentResolver) vnode = currentResolver.render(vnode[0]);
					return vnode
				},
			};

			var SKIP = route.SKIP = {};

			function resolveRoute() {
				scheduled = false;
				// Consider the pathname holistically. The prefix might even be invalid,
				// but that's not our problem.
				var prefix = $window.location.hash;
				if (route.prefix[0] !== "#") {
					prefix = $window.location.search + prefix;
					if (route.prefix[0] !== "?") {
						prefix = $window.location.pathname + prefix;
						if (prefix[0] !== "/") prefix = "/" + prefix;
					}
				}
				// This seemingly useless `.concat()` speeds up the tests quite a bit,
				// since the representation is consistently a relatively poorly
				// optimized cons string.
				var path = prefix.concat()
					.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponentSave)
					.slice(route.prefix.length);
				var data = parsePathname(path);

				assign(data.params, $window.history.state);

				function reject(e) {
					console.error(e);
					setPath(fallbackRoute, null, {replace: true});
				}

				loop(0);
				function loop(i) {
					// state === 0: init
					// state === 1: scheduled
					// state === 2: done
					for (; i < compiled.length; i++) {
						if (compiled[i].check(data)) {
							var payload = compiled[i].component;
							var matchedRoute = compiled[i].route;
							var localComp = payload;
							var update = lastUpdate = function(comp) {
								if (update !== lastUpdate) return
								if (comp === SKIP) return loop(i + 1)
								component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div";
								attrs = data.params, currentPath = path, lastUpdate = null;
								currentResolver = payload.render ? payload : null;
								if (state === 2) mountRedraw.redraw();
								else {
									state = 2;
									mountRedraw.redraw.sync();
								}
							};
							// There's no understating how much I *wish* I could
							// use `async`/`await` here...
							if (payload.view || typeof payload === "function") {
								payload = {};
								update(localComp);
							}
							else if (payload.onmatch) {
								p.then(function () {
									return payload.onmatch(data.params, path, matchedRoute)
								}).then(update, path === fallbackRoute ? null : reject);
							}
							else update("div");
							return
						}
					}

					if (path === fallbackRoute) {
						throw new Error("Could not resolve default route " + fallbackRoute + ".")
					}
					setPath(fallbackRoute, null, {replace: true});
				}
			}

			// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
			// even if neither `pushState` nor `hashchange` are supported. It's
			// cleared if `hashchange` is used, since that makes it automatically
			// async.
			function fireAsync() {
				if (!scheduled) {
					scheduled = true;
					// TODO: just do `mountRedraw.redraw()` here and elide the timer
					// dependency. Note that this will muck with tests a *lot*, so it's
					// not as easy of a change as it sounds.
					callAsync(resolveRoute);
				}
			}

			function setPath(path, data, options) {
				path = buildPathname(path, data);
				if (ready) {
					fireAsync();
					var state = options ? options.state : null;
					var title = options ? options.title : null;
					if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path);
					else $window.history.pushState(state, title, route.prefix + path);
				}
				else {
					$window.location.href = route.prefix + path;
				}
			}

			function route(root, defaultRoute, routes) {
				if (!root) throw new TypeError("DOM element being rendered to does not exist.")

				compiled = Object.keys(routes).map(function(route) {
					if (route[0] !== "/") throw new SyntaxError("Routes must start with a '/'.")
					if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
						throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.")
					}
					return {
						route: route,
						component: routes[route],
						check: compileTemplate(route),
					}
				});
				fallbackRoute = defaultRoute;
				if (defaultRoute != null) {
					var defaultData = parsePathname(defaultRoute);

					if (!compiled.some(function (i) { return i.check(defaultData) })) {
						throw new ReferenceError("Default route doesn't match any known routes.")
					}
				}

				if (typeof $window.history.pushState === "function") {
					$window.addEventListener("popstate", fireAsync, false);
				} else if (route.prefix[0] === "#") {
					$window.addEventListener("hashchange", resolveRoute, false);
				}

				ready = true;
				mountRedraw.mount(root, RouterRoot);
				resolveRoute();
			}
			route.set = function(path, data, options) {
				if (lastUpdate != null) {
					options = options || {};
					options.replace = true;
				}
				lastUpdate = null;
				setPath(path, data, options);
			};
			route.get = function() {return currentPath};
			route.prefix = "#!";
			route.Link = {
				view: function(vnode) {
					// Omit the used parameters from the rendered element - they are
					// internal. Also, censor the various lifecycle methods.
					//
					// We don't strip the other parameters because for convenience we
					// let them be specified in the selector as well.
					var child = m(
						vnode.attrs.selector || "a",
						censor(vnode.attrs, ["options", "params", "selector", "onclick"]),
						vnode.children
					);
					var options, onclick, href;

					// Let's provide a *right* way to disable a route link, rather than
					// letting people screw up accessibility on accident.
					//
					// The attribute is coerced so users don't get surprised over
					// `disabled: 0` resulting in a button that's somehow routable
					// despite being visibly disabled.
					if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
						child.attrs.href = null;
						child.attrs["aria-disabled"] = "true";
						// If you *really* do want add `onclick` on a disabled link, use
						// an `oncreate` hook to add it.
					} else {
						options = vnode.attrs.options;
						onclick = vnode.attrs.onclick;
						// Easier to build it now to keep it isomorphic.
						href = buildPathname(child.attrs.href, vnode.attrs.params);
						child.attrs.href = route.prefix + href;
						child.attrs.onclick = function(e) {
							var result;
							if (typeof onclick === "function") {
								result = onclick.call(e.currentTarget, e);
							} else if (onclick == null || typeof onclick !== "object") ; else if (typeof onclick.handleEvent === "function") {
								onclick.handleEvent(e);
							}

							// Adapted from React Router's implementation:
							// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
							//
							// Try to be flexible and intuitive in how we handle links.
							// Fun fact: links aren't as obvious to get right as you
							// would expect. There's a lot more valid ways to click a
							// link than this, and one might want to not simply click a
							// link, but right click or command-click it to copy the
							// link target, etc. Nope, this isn't just for blind people.
							if (
								// Skip if `onclick` prevented default
								result !== false && !e.defaultPrevented &&
								// Ignore everything but left clicks
								(e.button === 0 || e.which === 0 || e.which === 1) &&
								// Let the browser handle `target=_blank`, etc.
								(!e.currentTarget.target || e.currentTarget.target === "_self") &&
								// No modifier keys
								!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
							) {
								e.preventDefault();
								e.redraw = false;
								route.set(href, null, options);
							}
						};
					}
					return child
				},
			};
			route.param = function(key) {
				return attrs && key != null ? attrs[key] : attrs
			};

			return route
		};
		return router;
	}

	var route;
	var hasRequiredRoute;

	function requireRoute () {
		if (hasRequiredRoute) return route;
		hasRequiredRoute = 1;

		var mountRedraw = mountRedraw$2;

		route = requireRouter()(typeof window !== "undefined" ? window : null, mountRedraw);
		return route;
	}

	var hyperscript = hyperscript_1;
	var request = request$1;
	var mountRedraw = mountRedraw$2;

	var m = function m() { return hyperscript.apply(this, arguments) };
	m.m = hyperscript;
	m.trust = hyperscript.trust;
	m.fragment = hyperscript.fragment;
	m.Fragment = "[";
	m.mount = mountRedraw.mount;
	m.route = requireRoute();
	m.render = requireRender();
	m.redraw = mountRedraw.redraw;
	m.request = request.request;
	m.jsonp = request.jsonp;
	m.parseQueryString = requireParse$1();
	m.buildQueryString = requireBuild$1();
	m.parsePathname = requireParse();
	m.buildPathname = requireBuild();
	m.vnode = requireVnode();
	m.PromisePolyfill = requirePolyfill();
	m.censor = requireCensor();

	var mithril = m;

	function curry(fn, args = []){
	  return (..._args) =>
	    (rest => rest.length >= fn.length ? fn(...rest) : curry(fn, rest))([
	      ...args,
	      ..._args,
	    ])
	}

	const { isArray } = Array;

	function clone(input){
	  const out = isArray(input) ? Array(input.length) : {};
	  if (input && input.getTime) return new Date(input.getTime())

	  for (const key in input){
	    const v = input[ key ];
	    out[ key ] =
	      typeof v === 'object' && v !== null ?
	        v.getTime ?
	          new Date(v.getTime()) :
	          clone(v) :
	        v;
	  }

	  return out
	}

	const INCORRECT_ITERABLE_INPUT = 'Incorrect iterable input';

	const { keys: keys$1 } = Object;

	function mapArray(
	  fn, list, isIndexed = false
	){
	  let index = 0;
	  const willReturn = Array(list.length);

	  while (index < list.length){
	    willReturn[ index ] = isIndexed ? fn(list[ index ], index) : fn(list[ index ]);

	    index++;
	  }

	  return willReturn
	}

	function mapObject(fn, obj){
	  if (arguments.length === 1){
	    return _obj => mapObject(fn, _obj)
	  }
	  let index = 0;
	  const objKeys = keys$1(obj);
	  const len = objKeys.length;
	  const willReturn = {};

	  while (index < len){
	    const key = objKeys[ index ];
	    willReturn[ key ] = fn(
	      obj[ key ], key, obj
	    );
	    index++;
	  }

	  return willReturn
	}

	function map(fn, iterable){
	  if (arguments.length === 1) return _iterable => map(fn, _iterable)
	  if (!iterable){
	    throw new Error(INCORRECT_ITERABLE_INPUT)
	  }

	  if (isArray(iterable)) return mapArray(fn, iterable)

	  return mapObject(fn, iterable)
	}

	function type(input){
	  if (input === null){
	    return 'Null'
	  } else if (input === undefined){
	    return 'Undefined'
	  } else if (Number.isNaN(input)){
	    return 'NaN'
	  }
	  const typeResult = Object.prototype.toString.call(input).slice(8, -1);

	  return typeResult === 'AsyncFunction' ? 'Promise' : typeResult
	}

	function keys(x){
	  return Object.keys(x)
	}

	function mergeDeepRight(target, source){
	  if (arguments.length === 1){
	    return sourceHolder => mergeDeepRight(target, sourceHolder)
	  }

	  const willReturn = clone(target);

	  Object.keys(source).forEach(key => {
	    if (type(source[ key ]) === 'Object'){
	      if (type(target[ key ]) === 'Object'){
	        willReturn[ key ] = mergeDeepRight(target[ key ], source[ key ]);
	      } else {
	        willReturn[ key ] = source[ key ];
	      }
	    } else {
	      willReturn[ key ] = source[ key ];
	    }
	  });

	  return willReturn
	}

	function range(start, end){
	  if (arguments.length === 1) return _end => range(start, _end)

	  if (Number.isNaN(Number(start)) || Number.isNaN(Number(end))){
	    throw new TypeError('Both arguments to range must be numbers')
	  }

	  if (end < start) return []

	  const len = end - start;
	  const willReturn = Array(len);

	  for (let i = 0; i < len; i++){
	    willReturn[ i ] = start + i;
	  }

	  return willReturn
	}

	function sliceFn(
	  from, to, list
	){
	  return list.slice(from, to)
	}

	const slice = curry(sliceFn);

	function values(obj){
	  if (type(obj) !== 'Object') return []

	  return Object.values(obj)
	}

	///////////////////////////////////////////////////////////////////////////////// 

	var JSONCrush = {

	crush: (string, maxSubstringLength=50)=>
	{
	    const delimiter = '\u0001'; // used to split parts of crushed string
	    const JSCrush=(string, replaceCharacters)=>
	    {
	        // JSCrush Algorithm (repleace repeated substrings with single characters)
	        let replaceCharacterPos = replaceCharacters.length;
	        let splitString = '';
	        
	        const ByteLength =(string)=>encodeURI(encodeURIComponent(string)).replace(/%../g,'i').length;
	        const HasUnmatchedSurrogate =(string)=>
	        {
	            // check ends of string for unmatched surrogate pairs
	            let c1 = string.charCodeAt(0);
	            let c2 = string.charCodeAt(string.length-1);
	            return (c1 >= 0xDC00 && c1 <= 0xDFFF) || (c2 >= 0xD800 && c2 <= 0xDBFF);
	        };
	        
	        // count instances of substrings
	        let substringCount = {};
	        for (let substringLength = 2; substringLength < maxSubstringLength; substringLength++)
	        for (let i = 0; i < string.length - substringLength; ++i)
	        {
	            let substring = string.substr(i, substringLength);

	            // don't recount if already in list
	            if (substringCount[substring])
	                continue;

	            // prevent breaking up unmatched surrogates
	            if (HasUnmatchedSurrogate(substring))
	                continue;

	            // count how many times the substring appears
	            let count = 1;
	            for (let substringPos = string.indexOf(substring, i+substringLength); substringPos >= 0; ++count)
	                substringPos = string.indexOf(substring, substringPos + substringLength);
	                
	            // add to list if it appears multiple times
	            if (count > 1)
	                substringCount[substring] = count;
	        }
	        
	        while(true) // loop while string can be crushed more
	        {
	            // get the next character that is not in the string
	            for (;replaceCharacterPos-- && string.includes(replaceCharacters[replaceCharacterPos]);){}
	            if (replaceCharacterPos < 0)
	                break; // ran out of replacement characters
	            let replaceCharacter = replaceCharacters[replaceCharacterPos];
	            
	            // find the longest substring to replace
	            let bestSubstring;  
	            let bestLengthDelta = 0;  
	            let replaceByteLength = ByteLength(replaceCharacter);
	            for (let substring in substringCount) 
	            {
	                // calculate change in length of string if it substring was replaced
	                let count = substringCount[substring];
	                let lengthDelta = (count-1)*ByteLength(substring) - (count+1)*replaceByteLength;
	                if (!splitString.length)
	                    lengthDelta -= ByteLength(delimiter); // include the delimiter length 
	                if (lengthDelta <= 0)
	                    delete substringCount[substring];
	                else if (lengthDelta > bestLengthDelta)
	                {
	                    bestSubstring = substring;
	                    bestLengthDelta = lengthDelta;
	                }
	            }
	            if (!bestSubstring)
	                break; // string can't be compressed further
	                
	            // create new string with the split character
	            string = string.split(bestSubstring).join(replaceCharacter) + replaceCharacter + bestSubstring;
	            splitString = replaceCharacter + splitString;
	            
	            // update substring count list after the replacement
	            let newSubstringCount = {};
	            for (let substring in substringCount)
	            {
	                // make a new substring with the replacement
	                let newSubstring = substring.split(bestSubstring).join(replaceCharacter);
	                
	                // count how many times the new substring appears
	                let count = 0;
	                for (let i = string.indexOf(newSubstring); i >= 0; ++count)
	                    i = string.indexOf(newSubstring, i + newSubstring.length);
	                    
	                // add to list if it appears multiple times
	                if (count > 1)
	                    newSubstringCount[newSubstring] = count;
	                
	            }
	            substringCount = newSubstringCount;
	        }

	        return {a:string, b:splitString};
	    };
	    
	    // create a string of replacement characters
	    let characters = [];
	    
	    // prefer replacing with characters that will not be escaped by encodeURIComponent
	    const unescapedCharacters = `-_.!~*'()`;
	    for (let i=127; --i;)
	    {
	        if 
	        (
	            (i>=48 && i<=57) || // 0-9
	            (i>=65 && i<=90) || // A-Z
	            (i>=97 && i<=122)|| // a-z
	            unescapedCharacters.includes(String.fromCharCode(i))
	        )
	            characters.push(String.fromCharCode(i));
	    }
	    
	    // pick from extended set last
	    for (let i=32; i<255; ++i)
	    {
	        let c = String.fromCharCode(i);
	        if (c!='\\' && !characters.includes(c))
	            characters.unshift(c);
	    }

	    // remove delimiter if it is found in the string
	    string = string.replace(new RegExp(delimiter,'g'),'');
	    
	    // swap out common json characters
	    string = JSONCrushSwap(string);
	    
	    // crush with JS crush
	    const crushed = JSCrush(string, characters);
	    
	    // insert delimiter between JSCrush parts
	    let crushedString = crushed.a;
	    if (crushed.b.length)
	        crushedString += delimiter + crushed.b;
	    
	    // fix issues with some links not being recognized properly
	    crushedString += '_';
	    
	    // return crushed string
	    return crushedString;
	},

	uncrush: (string)=>
	{
	    // remove last character
	    string = string.substring(0, string.length - 1);

	    // unsplit the string using the delimiter
	    const stringParts = string.split('\u0001');
	    
	    // JSUncrush algorithm
	    let uncrushedString = stringParts[0];
	    if (stringParts.length > 1)
	    {
	        let splitString = stringParts[1];
	        for (let character of splitString)
	        {
	            // split the string using the current splitCharacter
	            let splitArray = uncrushedString.split(character);

	            // rejoin the string with the last element from the split
	            uncrushedString = splitArray.join(splitArray.pop());
	        }
	    }
	    
	    // unswap the json characters in reverse direction
	    return JSONCrushSwap(uncrushedString, 0);
	}

	}; // JSONCrush

	const JSONCrushSwap = (string, forward=1)=>
	{
	    // swap out characters for lesser used ones that wont get escaped
	    const swapGroups = 
	    [
	        ['"', "'"],
	        ["':", "!"],
	        [",'", "~"],
	        ['}', ")", '\\', '\\'],
	        ['{', "(", '\\', '\\'],
	    ];
	    
	    const swapInternal=(string, g)=>
	    {
	        let regex = new RegExp(`${(g[2]?g[2]:'')+g[0]}|${(g[3]?g[3]:'')+g[1]}`,'g');
	        return string.replace(regex, $1 => ($1 === g[0] ? g[1] : g[0]));
	    };

	    // need to be able to swap characters in reverse direction for uncrush
	    if (forward)
	        for (let i = 0; i < swapGroups.length; ++i)
	            string = swapInternal(string, swapGroups[i]);
	    else
	        for (let i = swapGroups.length; i--;)
	            string = swapInternal(string, swapGroups[i]);

	    return string;
	};

	function fnProperty(fn, base, prop, objs) {
	    return Math.ceil(objs.map((o) => o[prop]).reduce(fn, base));
	}
	function mulp(prop, ...objs) {
	    return fnProperty((a, b) => a * b, 1, prop, objs);
	}
	function sump(prop, ...objs) {
	    return fnProperty((a, b) => a + b, 0, prop, objs);
	}
	function sum(...stats) {
	    return stats.reduce((a, b) => a + b, 0);
	}

	const crcTable = [
	    0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5,
	    0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b,
	    0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
	    0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
	    0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c,
	    0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
	    0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b,
	    0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
	    0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
	    0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738,
	    0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5,
	    0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
	    0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969,
	    0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96,
	    0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
	    0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
	    0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03,
	    0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
	    0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6,
	    0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
	    0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
	    0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb,
	    0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1,
	    0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
	    0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c,
	    0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2,
	    0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
	    0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
	    0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447,
	    0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
	    0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2,
	    0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
	    0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
	    0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827,
	    0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c,
	    0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
	    0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0,
	    0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d,
	    0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
	    0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
	    0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba,
	    0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
	    0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
	];
	function crc16(s) {
	    let crc = 0xFFFF;
	    let j;
	    for (let i = 0; i < s.length; i++) {
	        let c = s.charCodeAt(i);
	        if (c > 255) {
	            throw new RangeError();
	        }
	        j = (c ^ (crc >> 8)) & 0xFF;
	        crc = crcTable[j] ^ (crc << 8);
	    }
	    return ((crc ^ 0) & 0xFFFF).toString(16);
	}

	const levels = [
	    {
	        level: -5,
	        armor_class: 11,
	        hit_points: 1,
	        attack_bonus: -1,
	        damage_per_action: 1,
	        spell_dc: [8, 5],
	        perception: 0,
	        proficiency_bonus: 0,
	        saving_throws: [1, 0, -1],
	        ability_modifiers: [1, 0, 0, 0, 0, -1],
	        experience: 0,
	    },
	    {
	        level: -4,
	        armor_class: 12,
	        hit_points: 1,
	        attack_bonus: 0,
	        damage_per_action: 1,
	        spell_dc: [9, 6],
	        perception: 1,
	        proficiency_bonus: 0,
	        saving_throws: [2, 1, -1],
	        ability_modifiers: [2, 1, 1, 0, 0, -1],
	        experience: 0,
	    },
	    {
	        level: -3,
	        armor_class: 13,
	        hit_points: 4,
	        attack_bonus: 1,
	        damage_per_action: 1,
	        spell_dc: [10, 7],
	        perception: 1,
	        proficiency_bonus: 1,
	        saving_throws: [3, 1, 0],
	        ability_modifiers: [2, 1, 1, 0, 0, -1],
	        experience: 2,
	    },
	    {
	        level: -2,
	        armor_class: 13,
	        hit_points: 8,
	        attack_bonus: 1,
	        damage_per_action: 1,
	        spell_dc: [10, 7],
	        perception: 1,
	        proficiency_bonus: 1,
	        saving_throws: [3, 1, 0],
	        ability_modifiers: [2, 1, 1, 0, 0, -1],
	        experience: 6,
	    },
	    {
	        level: -1,
	        armor_class: 13,
	        hit_points: 12,
	        attack_bonus: 1,
	        damage_per_action: 1,
	        spell_dc: [10, 7],
	        perception: 1,
	        proficiency_bonus: 1,
	        saving_throws: [3, 1, 0],
	        ability_modifiers: [2, 1, 1, 0, 0, -1],
	        experience: 12,
	    },
	    {
	        level: 0,
	        armor_class: 14,
	        hit_points: 16,
	        attack_bonus: 2,
	        damage_per_action: 1,
	        spell_dc: [10, 7],
	        perception: 1,
	        proficiency_bonus: 1,
	        saving_throws: [4, 2, 0],
	        ability_modifiers: [3, 2, 1, 1, 0, -1],
	        experience: 25,
	    },
	    {
	        level: 1,
	        armor_class: 14,
	        hit_points: 26,
	        attack_bonus: 3,
	        damage_per_action: 2,
	        spell_dc: [11, 8],
	        perception: 1,
	        proficiency_bonus: 2,
	        saving_throws: [5, 3, 0],
	        ability_modifiers: [3, 2, 1, 1, 0, -1],
	        experience: 50,
	    },
	    {
	        level: 2,
	        armor_class: 14,
	        hit_points: 30,
	        attack_bonus: 3,
	        damage_per_action: 4,
	        spell_dc: [11, 8],
	        perception: 1,
	        proficiency_bonus: 2,
	        saving_throws: [5, 3, 0],
	        ability_modifiers: [3, 2, 1, 1, 0, -1],
	        experience: 112,
	    },
	    {
	        level: 3,
	        armor_class: 14,
	        hit_points: 33,
	        attack_bonus: 3,
	        damage_per_action: 5,
	        spell_dc: [11, 8],
	        perception: 1,
	        proficiency_bonus: 2,
	        saving_throws: [5, 3, 0],
	        ability_modifiers: [3, 2, 1, 1, 0, -1],
	        experience: 175,
	    },
	    {
	        level: 4,
	        armor_class: 15,
	        hit_points: 36,
	        attack_bonus: 4,
	        damage_per_action: 8,
	        spell_dc: [12, 9],
	        perception: 2,
	        proficiency_bonus: 2,
	        saving_throws: [6, 3, 1],
	        ability_modifiers: [4, 3, 2, 1, 1, 0],
	        experience: 275,
	    },
	    {
	        level: 5,
	        armor_class: 16,
	        hit_points: 60,
	        attack_bonus: 5,
	        damage_per_action: 10,
	        spell_dc: [13, 10],
	        perception: 2,
	        proficiency_bonus: 3,
	        saving_throws: [7, 4, 1],
	        ability_modifiers: [4, 3, 2, 1, 1, 0],
	        experience: 450,
	    },
	    {
	        level: 6,
	        armor_class: 16,
	        hit_points: 64,
	        attack_bonus: 5,
	        damage_per_action: 11,
	        spell_dc: [13, 10],
	        perception: 2,
	        proficiency_bonus: 3,
	        saving_throws: [7, 4, 1],
	        ability_modifiers: [4, 3, 2, 1, 1, 0],
	        experience: 575,
	    },
	    {
	        level: 7,
	        armor_class: 16,
	        hit_points: 68,
	        attack_bonus: 5,
	        damage_per_action: 13,
	        spell_dc: [13, 10],
	        perception: 2,
	        proficiency_bonus: 3,
	        saving_throws: [7, 4, 1],
	        ability_modifiers: [4, 3, 2, 1, 1, 0],
	        experience: 725,
	    },
	    {
	        level: 8,
	        armor_class: 17,
	        hit_points: 72,
	        attack_bonus: 6,
	        damage_per_action: 17,
	        spell_dc: [14, 11],
	        perception: 3,
	        proficiency_bonus: 3,
	        saving_throws: [8, 5, 1],
	        ability_modifiers: [5, 3, 2, 2, 1, 0],
	        experience: 975,
	    },
	    {
	        level: 9,
	        armor_class: 18,
	        hit_points: 102,
	        attack_bonus: 7,
	        damage_per_action: 19,
	        spell_dc: [15, 12],
	        perception: 3,
	        proficiency_bonus: 4,
	        saving_throws: [9, 5, 2],
	        ability_modifiers: [5, 3, 2, 2, 1, 0],
	        experience: 1250,
	    },
	    {
	        level: 10,
	        armor_class: 18,
	        hit_points: 107,
	        attack_bonus: 7,
	        damage_per_action: 21,
	        spell_dc: [15, 12],
	        perception: 3,
	        proficiency_bonus: 4,
	        saving_throws: [9, 5, 2],
	        ability_modifiers: [5, 3, 2, 2, 1, 0],
	        experience: 1475,
	    },
	    {
	        level: 11,
	        armor_class: 18,
	        hit_points: 111,
	        attack_bonus: 7,
	        damage_per_action: 23,
	        spell_dc: [15, 12],
	        perception: 3,
	        proficiency_bonus: 4,
	        saving_throws: [9, 5, 2],
	        ability_modifiers: [5, 3, 2, 2, 1, 0],
	        experience: 1800,
	    },
	    {
	        level: 12,
	        armor_class: 18,
	        hit_points: 115,
	        attack_bonus: 8,
	        damage_per_action: 28,
	        spell_dc: [15, 12],
	        perception: 3,
	        proficiency_bonus: 4,
	        saving_throws: [10, 6, 2],
	        ability_modifiers: [6, 4, 3, 2, 1, 0],
	        experience: 2100,
	    },
	    {
	        level: 13,
	        armor_class: 19,
	        hit_points: 152,
	        attack_bonus: 9,
	        damage_per_action: 30,
	        spell_dc: [16, 13],
	        perception: 3,
	        proficiency_bonus: 5,
	        saving_throws: [11, 7, 2],
	        ability_modifiers: [6, 4, 3, 2, 1, 0],
	        experience: 2500,
	    },
	    {
	        level: 14,
	        armor_class: 19,
	        hit_points: 157,
	        attack_bonus: 9,
	        damage_per_action: 32,
	        spell_dc: [16, 13],
	        perception: 3,
	        proficiency_bonus: 5,
	        saving_throws: [11, 7, 2],
	        ability_modifiers: [6, 4, 3, 2, 1, 0],
	        experience: 2875,
	    },
	    {
	        level: 15,
	        armor_class: 19,
	        hit_points: 162,
	        attack_bonus: 9,
	        damage_per_action: 35,
	        spell_dc: [16, 13],
	        perception: 3,
	        proficiency_bonus: 5,
	        saving_throws: [11, 7, 2],
	        ability_modifiers: [6, 4, 3, 2, 1, 0],
	        experience: 3250,
	    },
	    {
	        level: 16,
	        armor_class: 20,
	        hit_points: 167,
	        attack_bonus: 10,
	        damage_per_action: 41,
	        spell_dc: [17, 14],
	        perception: 4,
	        proficiency_bonus: 5,
	        saving_throws: [12, 7, 3],
	        ability_modifiers: [7, 5, 3, 2, 2, 1],
	        experience: 3750,
	    },
	    {
	        level: 17,
	        armor_class: 21,
	        hit_points: 210,
	        attack_bonus: 11,
	        damage_per_action: 43,
	        spell_dc: [18, 15],
	        perception: 4,
	        proficiency_bonus: 6,
	        saving_throws: [13, 8, 3],
	        ability_modifiers: [7, 5, 3, 2, 2, 1],
	        experience: 4500,
	    },
	    {
	        level: 18,
	        armor_class: 21,
	        hit_points: 216,
	        attack_bonus: 11,
	        damage_per_action: 46,
	        spell_dc: [18, 15],
	        perception: 4,
	        proficiency_bonus: 6,
	        saving_throws: [13, 8, 3],
	        ability_modifiers: [7, 5, 3, 2, 2, 1],
	        experience: 5000,
	    },
	    {
	        level: 19,
	        armor_class: 21,
	        hit_points: 221,
	        attack_bonus: 11,
	        damage_per_action: 48,
	        spell_dc: [18, 15],
	        perception: 4,
	        proficiency_bonus: 6,
	        saving_throws: [13, 8, 3],
	        ability_modifiers: [7, 5, 3, 2, 2, 1],
	        experience: 5500,
	    },
	    {
	        level: 20,
	        armor_class: 22,
	        hit_points: 226,
	        attack_bonus: 12,
	        damage_per_action: 51,
	        spell_dc: [19, 16],
	        perception: 5,
	        proficiency_bonus: 6,
	        saving_throws: [14, 9, 3],
	        ability_modifiers: [8, 6, 4, 3, 2, 1],
	        experience: 6250,
	    },
	    {
	        level: 21,
	        armor_class: 22,
	        hit_points: 276,
	        attack_bonus: 13,
	        damage_per_action: 53,
	        spell_dc: [20, 17],
	        perception: 5,
	        proficiency_bonus: 7,
	        saving_throws: [15, 9, 4],
	        ability_modifiers: [8, 6, 4, 3, 2, 1],
	        experience: 8250,
	    },
	    {
	        level: 22,
	        armor_class: 22,
	        hit_points: 282,
	        attack_bonus: 13,
	        damage_per_action: 56,
	        spell_dc: [20, 17],
	        perception: 5,
	        proficiency_bonus: 7,
	        saving_throws: [15, 9, 4],
	        ability_modifiers: [8, 6, 4, 3, 2, 1],
	        experience: 10250,
	    },
	    {
	        level: 23,
	        armor_class: 22,
	        hit_points: 288,
	        attack_bonus: 13,
	        damage_per_action: 58,
	        spell_dc: [20, 17],
	        perception: 5,
	        proficiency_bonus: 7,
	        saving_throws: [15, 9, 4],
	        ability_modifiers: [8, 6, 4, 3, 2, 1],
	        experience: 12500,
	    },
	    {
	        level: 24,
	        armor_class: 23,
	        hit_points: 294,
	        attack_bonus: 14,
	        damage_per_action: 61,
	        spell_dc: [20, 17],
	        perception: 5,
	        proficiency_bonus: 7,
	        saving_throws: [16, 10, 4],
	        ability_modifiers: [9, 6, 4, 3, 2, 1],
	        experience: 15500,
	    },
	    {
	        level: 25,
	        armor_class: 24,
	        hit_points: 350,
	        attack_bonus: 15,
	        damage_per_action: 63,
	        spell_dc: [21, 18],
	        perception: 5,
	        proficiency_bonus: 8,
	        saving_throws: [17, 11, 4],
	        ability_modifiers: [9, 6, 4, 3, 2, 1],
	        experience: 18750,
	    },
	    {
	        level: 26,
	        armor_class: 24,
	        hit_points: 357,
	        attack_bonus: 15,
	        damage_per_action: 66,
	        spell_dc: [21, 18],
	        perception: 5,
	        proficiency_bonus: 8,
	        saving_throws: [17, 11, 4],
	        ability_modifiers: [9, 6, 4, 3, 2, 1],
	        experience: 22500,
	    },
	    {
	        level: 27,
	        armor_class: 24,
	        hit_points: 363,
	        attack_bonus: 15,
	        damage_per_action: 68,
	        spell_dc: [21, 18],
	        perception: 5,
	        proficiency_bonus: 8,
	        saving_throws: [17, 11, 4],
	        ability_modifiers: [9, 6, 4, 3, 2, 1],
	        experience: 26250,
	    },
	    {
	        level: 28,
	        armor_class: 25,
	        hit_points: 369,
	        attack_bonus: 16,
	        damage_per_action: 71,
	        spell_dc: [22, 19],
	        perception: 6,
	        proficiency_bonus: 8,
	        saving_throws: [18, 11, 5],
	        ability_modifiers: [10, 7, 5, 4, 3, 2],
	        experience: 30000,
	    },
	    {
	        level: 29,
	        armor_class: 26,
	        hit_points: 432,
	        attack_bonus: 17,
	        damage_per_action: 73,
	        spell_dc: [23, 20],
	        perception: 6,
	        proficiency_bonus: 9,
	        saving_throws: [19, 12, 5],
	        ability_modifiers: [10, 7, 5, 4, 3, 2],
	        experience: 33750,
	    },
	    {
	        level: 30,
	        armor_class: 26,
	        hit_points: 439,
	        attack_bonus: 17,
	        damage_per_action: 76,
	        spell_dc: [23, 20],
	        perception: 6,
	        proficiency_bonus: 9,
	        saving_throws: [19, 12, 5],
	        ability_modifiers: [10, 7, 5, 4, 3, 2],
	        experience: 38750,
	    },
	    {
	        level: 31,
	        armor_class: 26,
	        hit_points: 446,
	        attack_bonus: 17,
	        damage_per_action: 78,
	        spell_dc: [23, 20],
	        perception: 6,
	        proficiency_bonus: 9,
	        saving_throws: [19, 12, 5],
	        ability_modifiers: [10, 7, 5, 4, 3, 2],
	        experience: 44500,
	    },
	    {
	        level: 32,
	        armor_class: 26,
	        hit_points: 453,
	        attack_bonus: 18,
	        damage_per_action: 81,
	        spell_dc: [24, 21],
	        perception: 7,
	        proficiency_bonus: 9,
	        saving_throws: [20, 13, 5],
	        ability_modifiers: [11, 8, 5, 4, 3, 2],
	        experience: 51000,
	    },
	    {
	        level: 33,
	        armor_class: 27,
	        hit_points: 522,
	        attack_bonus: 19,
	        damage_per_action: 83,
	        spell_dc: [25, 22],
	        perception: 7,
	        proficiency_bonus: 10,
	        saving_throws: [21, 13, 6],
	        ability_modifiers: [11, 8, 5, 4, 3, 2],
	        experience: 58000,
	    },
	    {
	        level: 34,
	        armor_class: 27,
	        hit_points: 530,
	        attack_bonus: 19,
	        damage_per_action: 86,
	        spell_dc: [25, 22],
	        perception: 7,
	        proficiency_bonus: 10,
	        saving_throws: [21, 13, 6],
	        ability_modifiers: [11, 8, 5, 4, 3, 2],
	        experience: 67750,
	    },
	    {
	        level: 35,
	        armor_class: 27,
	        hit_points: 537,
	        attack_bonus: 19,
	        damage_per_action: 88,
	        spell_dc: [25, 22],
	        perception: 7,
	        proficiency_bonus: 10,
	        saving_throws: [21, 13, 6],
	        ability_modifiers: [11, 8, 5, 4, 3, 2],
	        experience: 77750,
	    },
	];
	const roles = {
	    brute: {
	        armor_class: 4,
	        hit_points: 1.2,
	        attack_bonus: 0,
	        damage_per_action: 1,
	        saving_throws: -2,
	        spell_dc: 0,
	        initiative: -2,
	        perception: -2,
	        speed: -10,
	        stat_priorities: ["con", "str", "dex", "wis", "cha", "int"],
	    },
	    magical_striker: {
	        armor_class: -4,
	        hit_points: 0.6,
	        attack_bonus: 4,
	        damage_per_action: 1.25,
	        saving_throws: -2,
	        spell_dc: 2,
	        initiative: 0,
	        perception: 0,
	        speed: -5,
	        stat_priorities: ["int", "wis", "cha", "dex", "con", "str"],
	    },
	    skill_paragon: {
	        armor_class: -2,
	        hit_points: 1,
	        attack_bonus: 2,
	        damage_per_action: 1,
	        saving_throws: 2,
	        spell_dc: 0,
	        initiative: 2,
	        perception: 2,
	        speed: 0,
	        stat_priorities: ["str", "dex", "con", "wis", "int", "cha"],
	    },
	    skirmisher: {
	        armor_class: -4,
	        hit_points: 0.5,
	        attack_bonus: 2,
	        damage_per_action: 1.5,
	        saving_throws: -2,
	        spell_dc: 0,
	        initiative: 1,
	        perception: 2,
	        speed: 5,
	        stat_priorities: ["dex", "wis", "str", "con", "int", "cha"],
	    },
	    sniper: {
	        armor_class: 0,
	        hit_points: 0.75,
	        attack_bonus: 0,
	        damage_per_action: 1.25,
	        saving_throws: 0,
	        spell_dc: 0,
	        initiative: 0,
	        perception: 2,
	        speed: -10,
	        stat_priorities: ["dex", "wis", "str", "int", "cha", "con"],
	    },
	    soldier: {
	        armor_class: 0,
	        hit_points: 1,
	        attack_bonus: 0,
	        damage_per_action: 1,
	        saving_throws: 0,
	        spell_dc: 0,
	        initiative: 0,
	        perception: 0,
	        speed: 0,
	        stat_priorities: ["str", "dex", "con", "wis", "cha", "int"],
	    },
	    spellcaster: {
	        armor_class: -4,
	        hit_points: 0.75,
	        attack_bonus: 0,
	        damage_per_action: 0.75,
	        saving_throws: -1,
	        spell_dc: 2,
	        initiative: -1,
	        perception: 1,
	        speed: -5,
	        stat_priorities: ["int", "wis", "cha", "con", "dex", "str"],
	    },
	};
	const modifiers = {
	    normal: {
	        armor_class: 0,
	        attack_bonus: 0,
	        hit_points: 1,
	        damage_per_action: 1,
	        saving_throws: 0,
	        spell_dc: 0,
	        initiative: 0,
	        perception: 0,
	        stealth: 0,
	        experience: 1,
	        special: [],
	    },
	    minion: {
	        armor_class: -2,
	        attack_bonus: -2,
	        hit_points: 0.2,
	        damage_per_action: 0.75,
	        saving_throws: -2,
	        spell_dc: -2,
	        initiative: -2,
	        perception: -2,
	        stealth: -2,
	        experience: 0.25,
	        special: [],
	    },
	    elite: {
	        armor_class: 2,
	        attack_bonus: 2,
	        hit_points: 2,
	        damage_per_action: 1.2,
	        saving_throws: 2,
	        spell_dc: 2,
	        initiative: 2,
	        perception: 2,
	        stealth: 2,
	        experience: 2,
	        special: ["paragon"],
	    },
	    solo: {
	        armor_class: 2,
	        attack_bonus: 2,
	        hit_points: 4,
	        damage_per_action: 1.2,
	        saving_throws: 2,
	        spell_dc: 2,
	        initiative: 4,
	        perception: 4,
	        stealth: 4,
	        experience: 4,
	        special: ["paragon", "phase_66", "phase_33"],
	    },
	};
	const HitDies = {
	    small: "d4",
	    medium: "d6",
	    large: "d8",
	    huge: "d10",
	    gargantuan: "d20",
	};
	const sizes = keys(HitDies);
	const dies_avg = {
	    d2: 1,
	    d3: 1.5,
	    d4: 2.5,
	    d6: 3.5,
	    d8: 4.5,
	    d10: 5.5,
	    d12: 6.5,
	    d20: 10.5,
	};
	const dies = keys(dies_avg);
	dies.map((i) => i.replace(/[^\d]/, "")).map(parseInt);
	const cr_exp = [
	    { cr: "0", exp: 10 },
	    { cr: "1/8", exp: 25 },
	    { cr: "1/4", exp: 50 },
	    { cr: "1/2", exp: 100 },
	    { cr: "1", exp: 200 },
	    { cr: "2", exp: 450 },
	    { cr: "3", exp: 700 },
	    { cr: "4", exp: 1100 },
	    { cr: "5", exp: 1800 },
	    { cr: "6", exp: 2300 },
	    { cr: "7", exp: 2900 },
	    { cr: "8", exp: 3900 },
	    { cr: "9", exp: 5000 },
	    { cr: "10", exp: 5900 },
	    { cr: "11", exp: 7200 },
	    { cr: "12", exp: 8400 },
	    { cr: "13", exp: 10000 },
	    { cr: "14", exp: 11500 },
	    { cr: "15", exp: 13000 },
	    { cr: "16", exp: 15000 },
	    { cr: "17", exp: 18000 },
	    { cr: "18", exp: 20000 },
	    { cr: "19", exp: 22000 },
	    { cr: "20", exp: 25000 },
	    { cr: "21", exp: 33000 },
	    { cr: "22", exp: 41000 },
	    { cr: "23", exp: 50000 },
	    { cr: "24", exp: 62000 },
	    { cr: "25", exp: 75000 },
	    { cr: "26", exp: 90000 },
	    { cr: "27", exp: 105000 },
	    { cr: "28", exp: 120000 },
	    { cr: "29", exp: 135000 },
	    { cr: "30", exp: 155000 },
	];
	// https://www.5esrd.com/languages/
	const languages = [
	    "common",
	    "dwarvish",
	    "elvish",
	    "giant",
	    "gnomish",
	    "goblin",
	    "halfling",
	    "orc",
	    "abyssal",
	    "celestial",
	    "draconic",
	    "deep speech",
	    "infernal",
	    "primordial",
	    "sylvan",
	    "undercommon",
	];
	// https://www.5esrd.com/gamemastering/monsters-foes/#Senses
	const special_senses = [
	    "blindsight",
	    "darkvision",
	    "tremorsense",
	    "truesight",
	];
	const categories = [
	    "aberration",
	    "beast",
	    "celestial",
	    "construct",
	    "dragon",
	    "elemental",
	    "fey",
	    "fiend",
	    "fiend (demon)",
	    "fiend (devil)",
	    "giant",
	    "humanoid",
	    "monstrosity",
	    "ooze",
	    "plant",
	    "undead",
	];
	const alignments = [
	    "lawful",
	    "lawful good",
	    "lawful evil",
	    "neutral",
	    "neutral good",
	    "neutral evil",
	    "chaotic",
	    "chaotic good",
	    "chaotic evil",
	    "unaligned",
	];
	const conditions = [
	    "blinded",
	    "charmed",
	    "deafened",
	    "exhaustion",
	    "frightened",
	    "grappled",
	    "incapacitated",
	    "invisible",
	    "paralyzed",
	    "petrified",
	    "poisoned",
	    "prone",
	    "restrained",
	    "stunned",
	    "unconscious",
	];
	// https://www.5esrd.com/gamemastering/combat#Damage_Types
	const damage_types = [
	    "cold",
	    "fire",
	    "force",
	    "lightning",
	    "necrotic",
	    "poison",
	    "psychic",
	    "radiant",
	    "thunder",
	    "bludgeoning",
	    "piercing",
	    "slashing",
	];

	function templateByLevel(lvl) {
	    return levels.filter((i) => lvl == i.level)[0];
	}
	function generateUuid(opts) {
	    let name = opts.name.toLowerCase();
	    let { level, role, modifier, size } = opts;
	    return crc16(name + level + role + modifier + size);
	}
	function createCreature(opts) {
	    const role = roles[opts.role];
	    const modifier = modifiers[opts.modifier];
	    const template = templateByLevel(opts.level);
	    const saving_throws = template.saving_throws.map((s) => s + role.saving_throws + modifier.saving_throws);
	    ({
	        major: {
	            stat: saving_throws[0],
	            abilities: [role.stat_priorities[0], role.stat_priorities[1]],
	        },
	        minor: {
	            stat: saving_throws[1],
	            abilities: [role.stat_priorities[2], role.stat_priorities[3]],
	        },
	        lower: {
	            stat: saving_throws[2],
	            abilities: [role.stat_priorities[4], role.stat_priorities[5]],
	        },
	    });
	    const ability_modifiers = {
	        str: 0,
	        dex: 0,
	        con: 0,
	        int: 0,
	        wis: 0,
	        cha: 0,
	    };
	    for (const key in template.ability_modifiers) {
	        ability_modifiers[role.stat_priorities[key]] =
	            template.ability_modifiers[key];
	    }
	    const hit_points = mulp("hit_points", template, role, modifier);
	    const experience = mulp("experience", template, modifier);
	    const challenge_rating = calculateChallengeRating({ experience });
	    return {
	        uid: generateUuid(opts),
	        name: opts.name,
	        level: template.level,
	        role: opts.role,
	        modifier: opts.modifier,
	        size: opts.size,
	        category: opts.category,
	        alignment: opts.alignment,
	        armor_class: sump("armor_class", template, role, modifier),
	        hit_die: calculateHitDie({
	            size: opts.size,
	            level: opts.level,
	            ability_modifiers,
	            hit_points,
	        }),
	        hit_points,
	        attack_bonus: sump("attack_bonus", template, role, modifier),
	        damage_per_action: mulp("damage_per_action", template, role, modifier),
	        spell_dc: template.spell_dc
	            .map((spell_dc) => spell_dc + modifier.spell_dc),
	        initiative: sum(template.proficiency_bonus, role.initiative, modifier.initiative),
	        perception: sum(template.proficiency_bonus, role.perception, modifier.perception),
	        stealth: sum(0, modifier.stealth),
	        speed: sum(25, role.speed),
	        experience,
	        challenge_rating,
	        saving_throws,
	        ability_modifiers,
	        multiattacks: opts.multiattacks || [],
	        attacks: opts.attacks || [],
	        properties: opts.properties || {},
	    };
	}
	/**
	 * From HP to die + constitution modifier estimates
	 */
	function calculateHitDie(sb) {
	    let die = HitDies[sb.size];
	    let estimate = dies_avg[die];
	    let sway = Math.ceil((sb.hit_points / 100) * 15);
	    let result = 0;
	    let dies = 0;
	    while (result < (sb.hit_points - sway) && result < (sb.hit_points + sway)) {
	        dies += 1;
	        result = estimate * dies;
	    }
	    let base = dies > 0 ? sb.ability_modifiers.con * dies : 1;
	    return [
	        dies,
	        die,
	        base,
	    ];
	}
	function calculateChallengeRating(sb) {
	    let result = "0";
	    for (let cr of cr_exp) {
	        if (sb.experience >= cr.exp) {
	            result = cr.cr;
	        }
	        else {
	            break;
	        }
	    }
	    return result;
	}
	function modToAbilityScore(mod) {
	    return 10 + Math.floor(mod * 2);
	}
	function attackDamage(atk) {
	    const mediumDmg = dies_avg[atk.die];
	    const maxDie = parseInt(atk.die.replace(/[^\d]/, ""));
	    return {
	        min: atk.die_num + atk.mod,
	        avg: mediumDmg * atk.die_num + atk.mod,
	        max: maxDie * atk.die_num + atk.mod,
	    };
	}
	const demo_creature = {
	    name: "Creature",
	    level: 0,
	    role: "soldier",
	    modifier: "normal",
	    size: "small",
	    attacks: [],
	    multiattacks: [],
	};
	const state = {
	    STORE_CURRENT_KEY: 'LMM_Current',
	    STORE_COMPENDIUM_KEY: 'LMM_Compendium',
	    list: {},
	    current: demo_creature,
	    init(creature) {
	        const data = creature ? creature : JSON.parse(localStorage.getItem(state.STORE_CURRENT_KEY));
	        if (!!data) {
	            state.current = createCreature(data);
	        }
	        state.update();
	    },
	    update() {
	        state.current = createCreature(state.current);
	        state.save();
	    },
	    save() {
	        localStorage.setItem("current", JSON.stringify(state.current));
	    },
	    set(data) {
	        state.current = mergeDeepRight(state.current, data);
	        state.update();
	    },
	    loadCreatureCompendium() {
	        const data = JSON.parse(localStorage.getItem(state.STORE_COMPENDIUM_KEY));
	        state.list = data || {};
	    },
	    saveToCompendium(sb) {
	        state.list[sb.uid] = sb;
	        state.saveCompendium();
	    },
	    deleteFromCompendium(uid) {
	        delete state.list[uid];
	        state.saveCompendium();
	    },
	    saveCompendium() {
	        localStorage.setItem(state.STORE_COMPENDIUM_KEY, JSON.stringify(state.list));
	    },
	    resetCompendium() {
	        localStorage.setItem(state.STORE_COMPENDIUM_KEY, "{}");
	    },
	    newAttack() {
	        const id = crc16(Math.random().toString());
	        state.current.attacks.push({
	            id,
	            name: "",
	            die_num: 1,
	            description: "",
	            die: "d4",
	            type: "slashing",
	            mod: 0,
	        });
	    },
	    removeAttack(attack) {
	        const attacks = state.current.attacks
	            .filter((atk) => atk.id != attack.id);
	        state.set({ attacks });
	    },
	    setAttack(atk) {
	        const attacks = state.current.attacks
	            .map((k) => (k.id == atk.id) ? atk : k);
	        state.set({ attacks });
	    },
	};
	function encode(data) {
	    const str = JSON.stringify(data);
	    return encodeURIComponent(JSONCrush.crush(str));
	}
	function decode(data) {
	    const str = JSONCrush.uncrush(decodeURIComponent(data));
	    return JSON.parse(str);
	}

	var pseudos = [
	  ':active',
	  ':any',
	  ':checked',
	  ':default',
	  ':disabled',
	  ':empty',
	  ':enabled',
	  ':first',
	  ':first-child',
	  ':first-of-type',
	  ':fullscreen',
	  ':focus',
	  ':hover',
	  ':indeterminate',
	  ':in-range',
	  ':invalid',
	  ':last-child',
	  ':last-of-type',
	  ':left',
	  ':link',
	  ':only-child',
	  ':only-of-type',
	  ':optional',
	  ':out-of-range',
	  ':read-only',
	  ':read-write',
	  ':required',
	  ':right',
	  ':root',
	  ':scope',
	  ':target',
	  ':valid',
	  ':visited',

	  // With value
	  ':dir',
	  ':lang',
	  ':not',
	  ':nth-child',
	  ':nth-last-child',
	  ':nth-last-of-type',
	  ':nth-of-type',

	  // Elements
	  '::after',
	  '::before',
	  '::first-letter',
	  '::first-line',
	  '::selection',
	  '::backdrop',
	  '::placeholder',
	  '::marker',
	  '::spelling-error',
	  '::grammar-error'
	];

	var popular = {
	  ai : 'alignItems',
	  b  : 'bottom',
	  bc : 'backgroundColor',
	  br : 'borderRadius',
	  bs : 'boxShadow',
	  bi : 'backgroundImage',
	  c  : 'color',
	  d  : 'display',
	  f  : 'float',
	  fd : 'flexDirection',
	  ff : 'fontFamily',
	  fs : 'fontSize',
	  h  : 'height',
	  jc : 'justifyContent',
	  l  : 'left',
	  lh : 'lineHeight',
	  ls : 'letterSpacing',
	  m  : 'margin',
	  mb : 'marginBottom',
	  ml : 'marginLeft',
	  mr : 'marginRight',
	  mt : 'marginTop',
	  o  : 'opacity',
	  p  : 'padding',
	  pb : 'paddingBottom',
	  pl : 'paddingLeft',
	  pr : 'paddingRight',
	  pt : 'paddingTop',
	  r  : 'right',
	  t  : 'top',
	  ta : 'textAlign',
	  td : 'textDecoration',
	  tt : 'textTransform',
	  w  : 'width'
	};

	var cssProperties = ['float'].concat(Object.keys(
	  typeof document === 'undefined'
	    ? {}
	    : findWidth(document.documentElement.style)
	).filter(function (p) { return p.indexOf('-') === -1 && p !== 'length'; }));

	function findWidth(obj) {
	  return obj
	    ? obj.hasOwnProperty('width')
	      ? obj
	      : findWidth(Object.getPrototypeOf(obj))
	    : {}
	}

	var isProp = /^-?-?[a-z][a-z-_0-9]*$/i;

	var memoize = function (fn, cache) {
	  if ( cache === void 0 ) cache = {};

	  return function (item) { return item in cache
	    ? cache[item]
	    : cache[item] = fn(item); };
	};

	function add(style, prop, values) {
	  if (prop in style) // Recursively increase specificity
	    { add(style, '!' + prop, values); }
	  else
	    { style[prop] = formatValues(prop, values); }
	}

	var vendorMap = Object.create(null, {});
	var vendorValuePrefix = Object.create(null, {});

	var vendorRegex = /^(o|O|ms|MS|Ms|moz|Moz|webkit|Webkit|WebKit)([A-Z])/;

	var appendPx = memoize(function (prop) {
	  var el = document.createElement('div');

	  try {
	    el.style[prop] = '1px';
	    el.style.setProperty(prop, '1px');
	    return el.style[prop].slice(-3) === '1px' ? 'px' : ''
	  } catch (err) {
	    return ''
	  }
	}, {
	  flex: '',
	  boxShadow: 'px',
	  border: 'px',
	  borderTop: 'px',
	  borderRight: 'px',
	  borderBottom: 'px',
	  borderLeft: 'px'
	});

	function lowercaseFirst(string) {
	  return string.charAt(0).toLowerCase() + string.slice(1)
	}

	function assign(obj, obj2) {
	  for (var key in obj2) {
	    if (obj2.hasOwnProperty(key)) {
	      obj[key] = typeof obj2[key] === 'string'
	        ? obj2[key]
	        : assign(obj[key] || {}, obj2[key]);
	    }
	  }
	  return obj
	}

	var hyphenSeparator = /-([a-z])/g;
	function hyphenToCamelCase(hyphen) {
	  return hyphen.slice(hyphen.charAt(0) === '-' ? 1 : 0).replace(hyphenSeparator, function(match) {
	    return match[1].toUpperCase()
	  })
	}

	var camelSeparator = /(\B[A-Z])/g;
	function camelCaseToHyphen(camelCase) {
	  return camelCase.replace(camelSeparator, '-$1').toLowerCase()
	}

	var initialMatch = /([A-Z])/g;
	function initials(camelCase) {
	  return camelCase.charAt(0) + (camelCase.match(initialMatch) || []).join('').toLowerCase()
	}

	var ampersandMatch = /&/g;
	function objectToRules(style, selector, suffix, single) {
	  if ( suffix === void 0 ) suffix = '';

	  var base = {};
	  var extra = suffix.indexOf('&') > -1 && suffix.indexOf(',') === -1 ? '' : '&';
	  var rules = [];

	  Object.keys(style).forEach(function (prop) {
	    if (prop.charAt(0) === '@')
	      { rules.push(prop + '{' + objectToRules(style[prop], selector, suffix, single).join('') + '}'); }
	    else if (typeof style[prop] === 'object')
	      { rules = rules.concat(objectToRules(style[prop], selector, suffix + prop, single)); }
	    else
	      { base[prop] = style[prop]; }
	  });

	  if (Object.keys(base).length) {
	    rules.unshift(
	      ((single || (suffix.charAt(0) === ' ') ? '' : '&') + extra + suffix).replace(ampersandMatch, selector).trim() +
	      '{' + stylesToCss(base) + '}'
	    );
	  }

	  return rules
	}

	var selectorSplit = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

	function stylesToCss(style) {
	  return Object.keys(style).reduce(function (acc, prop) { return acc + propToString(prop.charAt(0) === '!' ? prop.slice(1) : prop, style[prop]); }
	  , '')
	}

	function propToString(prop, value) {
	  prop = prop in vendorMap ? vendorMap[prop] : prop;
	  return (vendorRegex.test(prop) ? '-' : '')
	    + (cssVar(prop)
	      ? prop
	      : camelCaseToHyphen(prop)
	    )
	    + ':'
	    + value
	    + ';'
	}

	function formatValues(prop, value) {
	  return Array.isArray(value)
	    ? value.map(function (v) { return formatValue(prop, v); }).join(' ')
	    : typeof value === 'string'
	      ? formatValues(prop, value.split(' '))
	      : formatValue(prop, value)
	}

	function formatValue(prop, value) {
	  return value in vendorValuePrefix
	    ? vendorValuePrefix[value]
	    : value + (isNaN(value) || value === null || value === 0 || value === '0' || typeof value === 'boolean' || cssVar(prop) ? '' : appendPx(prop))
	}

	function cssVar(prop) {
	  return prop.charAt(0) === '-' && prop.charAt(1) === '-'
	}

	var classPrefix = 'b' + ('000' + ((Math.random() * 46656) | 0).toString(36)).slice(-3) +
	                    ('000' + ((Math.random() * 46656) | 0).toString(36)).slice(-3);

	var styleSheet = typeof document === 'object' && document.createElement('style');
	styleSheet && document.head && document.head.appendChild(styleSheet);
	styleSheet && (styleSheet.id = classPrefix);

	var sheet = styleSheet && styleSheet.sheet;

	var debug = false;
	var classes = Object.create(null, {});
	var rules = [];
	var count = 0;

	function setDebug(d) {
	  debug = d;
	}

	function getSheet() {
	  var content = rules.join('');
	  rules = [];
	  classes = Object.create(null, {});
	  count = 0;
	  return content
	}

	function getRules() {
	  return rules
	}

	function insert(rule, index) {
	  rules.push(rule);

	  if (debug)
	    { return styleSheet.textContent = rules.join('\n') }

	  try {
	    sheet && sheet.insertRule(rule, arguments.length > 1
	      ? index
	      : sheet.cssRules.length);
	  } catch (e) {
	    // Ignore thrown errors in eg. firefox for unsupported strings (::-webkit-inner-spin-button)
	  }
	}

	function createClass(style) {
	  var json = JSON.stringify(style);

	  if (json in classes)
	    { return classes[json] }

	  var className = classPrefix + (++count)
	      , rules = objectToRules(style, '.' + className);

	  for (var i = 0; i < rules.length; i++)
	    { insert(rules[i]); }

	  classes[json] = className;

	  return className
	}

	/* eslint no-invalid-this: 0 */

	var shorts = Object.create(null);

	function bss(input, value) {
	  var b = chain(bss);
	  input && assign(b.__style, parse.apply(null, arguments));
	  return b
	}

	function setProp(prop, value) {
	  Object.defineProperty(bss, prop, {
	    configurable: true,
	    value: value
	  });
	}

	Object.defineProperties(bss, {
	  __style: {
	    configurable: true,
	    writable: true,
	    value: {}
	  },
	  valueOf: {
	    configurable: true,
	    writable: true,
	    value: function() {
	      return '.' + this.class
	    }
	  },
	  toString: {
	    configurable: true,
	    writable: true,
	    value: function() {
	      return this.class
	    }
	  }
	});

	setProp('setDebug', setDebug);

	setProp('$keyframes', keyframes);
	setProp('$media', $media);
	setProp('$import', $import);
	setProp('$nest', $nest);
	setProp('getSheet', getSheet);
	setProp('getRules', getRules);
	setProp('helper', helper);
	setProp('css', css);
	setProp('classPrefix', classPrefix);

	function chain(instance) {
	  var newInstance = Object.create(bss, {
	    __style: {
	      value: assign({}, instance.__style)
	    },
	    style: {
	      enumerable: true,
	      get: function() {
	        var this$1$1 = this;

	        return Object.keys(this.__style).reduce(function (acc, key) {
	          if (typeof this$1$1.__style[key] === 'number' || typeof this$1$1.__style[key] === 'string')
	            { acc[key.charAt(0) === '!' ? key.slice(1) : key] = this$1$1.__style[key]; }
	          return acc
	        }, {})
	      }
	    }
	  });

	  if (instance === bss)
	    { bss.__style = {}; }

	  return newInstance
	}

	cssProperties.forEach(function (prop) {
	  var vendor = prop.match(vendorRegex);
	  if (vendor) {
	    var unprefixed = lowercaseFirst(prop.replace(vendorRegex, '$2'));
	    if (cssProperties.indexOf(unprefixed) === -1) {
	      if (unprefixed === 'flexDirection')
	        { vendorValuePrefix.flex = '-' + vendor[1].toLowerCase() + '-flex'; }

	      vendorMap[unprefixed] = prop;
	      setProp(unprefixed, setter(prop));
	      setProp(short(unprefixed), bss[unprefixed]);
	      return
	    }
	  }

	  setProp(prop, setter(prop));
	  setProp(short(prop), bss[prop]);
	});

	setProp('content', function Content(arg) {
	  var b = chain(this);
	  arg === null || arg === undefined || arg === false
	    ? delete b.__style.content
	    : b.__style.content = '"' + arg + '"';
	  return b
	});

	Object.defineProperty(bss, 'class', {
	  set: function(value) {
	    this.__class = value;
	  },
	  get: function() {
	    return this.__class || createClass(this.__style)
	  }
	});

	function $media(value, style) {
	  var b = chain(this);
	  if (value)
	    { b.__style['@media ' + value] = parse(style); }

	  return b
	}

	var hasUrl = /^('|"|url\('|url\(")/i;
	function $import(value) {
	  value && insert('@import '
	    + (hasUrl.test(value) ? value : '"' + value + '"')
	    + ';', 0);

	  return chain(this)
	}

	function $nest(selector, properties) {
	  var b = chain(this);
	  if (arguments.length === 1)
	    { Object.keys(selector).forEach(function (x) { return addNest(b.__style, x, selector[x]); }); }
	  else if (selector)
	    { addNest(b.__style, selector, properties); }

	  return b
	}

	function addNest(style, selector, properties) {
	  var prop = selector.split(selectorSplit).map(function (x) {
	    x = x.trim();
	    return (x.charAt(0) === ':' || x.charAt(0) === '[' ? '' : ' ') + x
	  }).join(',&');

	  prop in style
	    ? assign(style[prop], parse(properties))
	    : style[prop] = parse(properties);
	}

	pseudos.forEach(function (name) { return setProp('$' + hyphenToCamelCase(name.replace(/:/g, '')), function Pseudo(value, style) {
	    var b = chain(this);
	    if (isTagged(value))
	      { b.__style[name] = parse.apply(null, arguments); }
	    else if (value || style)
	      { b.__style[name + (style ? '(' + value + ')' : '')] = parse(style || value); }
	    return b
	  }); }
	);

	function setter(prop) {
	  return function CssProperty(value) {
	    var b = chain(this);
	    if (!value && value !== 0)
	      { delete b.__style[prop]; }
	    else if (arguments.length > 0)
	      { add(b.__style, prop, Array.prototype.slice.call(arguments)); }

	    return b
	  }
	}

	function css(selector, style) {
	  if (arguments.length === 1)
	    { Object.keys(selector).forEach(function (key) { return addCss(key, selector[key]); }); }
	  else
	    { addCss(selector, style); }

	  return chain(this)
	}

	function addCss(selector, style) {
	  objectToRules(parse(style), selector, '', true).forEach(function (rule) { return insert(rule); });
	}

	function helper(name, styling) {
	  if (arguments.length === 1)
	    { return Object.keys(name).forEach(function (key) { return helper(key, name[key]); }) }

	  delete bss[name]; // Needed to avoid weird get calls in chrome

	  if (typeof styling === 'function') {
	    helper[name] = styling;
	    Object.defineProperty(bss, name, {
	      configurable: true,
	      value: function Helper(input) {
	        var b = chain(this);
	        var result = isTagged(input)
	          ? styling(raw(input, arguments))
	          : styling.apply(null, arguments);
	        assign(b.__style, result.__style);
	        return b
	      }
	    });
	  } else {
	    helper[name] = parse(styling);
	    Object.defineProperty(bss, name, {
	      configurable: true,
	      get: function() {
	        var b = chain(this);
	        assign(b.__style, parse(styling));
	        return b
	      }
	    });
	  }
	}

	bss.helper('$animate', function (value, props) { return bss.animation(bss.$keyframes(props) + ' ' + value); }
	);

	function short(prop) {
	  var acronym = initials(prop)
	      , short = popular[acronym] && popular[acronym] !== prop ? prop : acronym;

	  shorts[short] = prop;
	  return short
	}

	var blockEndMatch = /;(?![^("]*[)"])|\n/;
	var commentsMatch = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*(?![^("]*[)"])/g;
	var propSeperator = /[ :]+/;

	var stringToObject = memoize(function (string) {
	  var last = ''
	    , prev;

	  return string.trim().replace(commentsMatch, '').split(blockEndMatch).reduce(function (acc, line) {
	    if (!line)
	      { return acc }
	    line = last + line.trim();
	    var ref = line.replace(propSeperator, ' ').split(' ');
	    var key = ref[0];
	    var tokens = ref.slice(1);

	    last = line.charAt(line.length - 1) === ',' ? line : '';
	    if (last)
	      { return acc }

	    if (line.charAt(0) === ',' || !isProp.test(key)) {
	      acc[prev] += ' ' + line;
	      return acc
	    }

	    if (!key)
	      { return acc }

	    var prop = key.charAt(0) === '-' && key.charAt(1) === '-'
	      ? key
	      : hyphenToCamelCase(key);

	    prev = shorts[prop] || prop;

	    if (key in helper) {
	      typeof helper[key] === 'function'
	        ? assign(acc, helper[key].apply(helper, tokens).__style)
	        : assign(acc, helper[key]);
	    } else if (prop in helper) {
	      typeof helper[prop] === 'function'
	        ? assign(acc, helper[prop].apply(helper, tokens).__style)
	        : assign(acc, helper[prop]);
	    } else if (tokens.length > 0) {
	      add(acc, prev, tokens);
	    }

	    return acc
	  }, {})
	});

	var count$1 = 0;
	var keyframeCache = {};

	function keyframes(props) {
	  var content = Object.keys(props).reduce(function (acc, key) { return acc + key + '{' + stylesToCss(parse(props[key])) + '}'; }
	  , '');

	  if (content in keyframeCache)
	    { return keyframeCache[content] }

	  var name = classPrefix + count$1++;
	  keyframeCache[content] = name;
	  insert('@keyframes ' + name + '{' + content + '}');

	  return name
	}

	function parse(input, value) {
	  var obj;

	  if (typeof input === 'string') {
	    if (typeof value === 'string' || typeof value === 'number')
	      { return (( obj = {}, obj[input] = value, obj )) }

	    return stringToObject(input)
	  } else if (isTagged(input)) {
	    return stringToObject(raw(input, arguments))
	  }

	  return input.__style || sanitize(input)
	}

	function isTagged(input) {
	  return Array.isArray(input) && typeof input[0] === 'string'
	}

	function raw(input, args) {
	  var str = '';
	  for (var i = 0; i < input.length; i++)
	    { str += input[i] + (args[i + 1] || args[i + 1] === 0 ? args[i + 1] : ''); }
	  return str
	}

	function sanitize(styles) {
	  return Object.keys(styles).reduce(function (acc, key) {
	    var value = styles[key];
	    key = shorts[key] || key;

	    if (!value && value !== 0 && value !== '')
	      { return acc }

	    if (key === 'content' && value.charAt(0) !== '"')
	      { acc[key] = '"' + value + '"'; }
	    else if (typeof value === 'object')
	      { acc[key] = sanitize(value); }
	    else
	      { add(acc, key, value); }

	    return acc
	  }, {})
	}

	const colors = {
	    red: "rgb(125, 52, 37)",
	    lightred: "#db5f5f",
	    darkGrey: "rgb(32,32,32)",
	    grey: "rgb(64,64,64)",
	    lightgrey: "rgb(92,92,92)",
	};
	const style_base = {
	    input: bss `
    ff Arial, sans-serif
    fs 1.2rem
    lh 1.6rem
    p 0.4rem 0.6rem
    m 0.4rem 0.6rem
    border 0
    background-color: ${colors.darkGrey}
    color rgb(230, 230, 230)
    outline 0
    border-bottom 2px dotted ${colors.red}
  `.$hover `
    bc ${colors.grey}
  `,
	    label: bss `
    display block
    p 0.4rem 0.6rem
    m 0.4rem 0.6rem

    font-variant small-caps
  `,
	    tags: bss `
    d flex
    flex-grow 3
    padding-left 1rem
    font-variant small-caps
  `,
	    tag: bss `
    margin-left 1rem
  `.$hover `
    cursor pointer
    color ${colors.red}
  `,
	    select: bss `
    border-bottom: 2px dotted ${colors.red}
  `.$disabled `
    color: ${colors.lightgrey}
    font-style italic
  `,
	    hr: bss `
    bc rgba(0,0,0,0)
    bi linear-gradient(90deg, ${colors.red} 0px, rgba(125, 52, 37, 0))
    border 0
    h 2px
    m 1rem 0
  `,
	    remove: bss `
    c rgb(125,52,37)
    fw bolder
    fs 1.2rem
    p 0.4rem
    cursor pointer
  `.$hover `
    c rgb(225,52,37)
  `,
	    table: bss `
    d table
    border-collapse collapse
  `,
	    table_header: bss `
    font-style italic
  `,
	    table_row: bss `
    d table-row
    cursor pointer
  `,
	    table_cell: bss `
    d table-cell
    p 0.6rem
  `,
	    hilight_bg: bss `
  `.$hover `
    background-color ${colors.grey}
  `,
	    light_bg: bss `
    background-color ${colors.grey}
  `,
	    small: bss `
    fs 0.8rem
    font-variant small-caps
  `,
	};
	const style = Object.assign(Object.assign({}, style_base), { textarea: style_base.input + bss `
    resize vertical
  `, select: style_base.select + style_base.input, select_block: bss ``, button: style_base.input + bss `
    border 2px solid ${colors.red}
    font-weight bolder
    font-style italic
    background inherit
    color ${colors.lightgrey}
  `, abilities_block: bss `
    display flex
    flex-direction row
    justify-content center
    align-items stretch
    align-content center
  `, ability_modifiers: bss `
    display flex
    flex-direction column
    align-content center
    text-align center
    margin 0 0.8rem
  `, ability_modifier_stat: bss `
    fs 1.4rem
    fw bolder
    font-variant small-caps
  `, ability_modifier_score: bss `
    font-size 1.3em
  `.$hover `
    b ${colors.grey}
  `, actions_block: bss `
    display grid
    grid-template-columns 1fr 1fr 1fr
    grid-template-rows auto
    grid-column-gap 2rem
  `, action_block: bss `
    align-self start
    display grid
    grid-template-columns 1fr 1fr 1fr
    grid-template-rows auto
    grid-column-gap 0.6rem
    grid-row-gap 0.8rem
  `, action_cell: bss `
    align-self start
    margin 0
    padding 0.6rem 0
  `, action_cell_wide: bss `
    align-self start
    grid-column 1 / 4
    margin 0
    padding 0.6rem 0
  `, select_tag_component: bss `
    min-width 16rem
  `, main: bss `
    ff Arial, sans-serif
    fs 1.0rem
    lh 1.6rem
  `, permalink: bss `
    font-weight bold
    font-style italic
    color ${colors.red}
  `.$hover `
    color ${colors.lightred}
  `.$active `
  `.$visited `
    color ${colors.lightred}
  `, base_properties: bss `
    display grid
    grid-template-columns 1fr 1fr
  `, compendium_header: bss `
    padding-top: 0.6rem
    padding-bottom: 0.6rem
  `, compendium_row: bss `
    display grid
    grid-template-columns repeat(6, 1fr) 2rem
  `, compendium_cell: bss `
    justify-self: stretch
    align-self: center
    padding-left: 0.6rem
  ` });
	const grid = {
	    container: (size, rest) => bss `
    display grid
    grid-template-columns repeat(${size}, 1fr) ${rest}
    grid-template-rows auto
  `,
	};
	const el = {
	    input: "input" + style.input,
	    textarea: "textarea" + style.textarea,
	    select: "select" + style.select,
	    select_block: "div" + style.select_block,
	    button: "button" + style.button,
	    option: "option",
	    hr: "hr" + style.hr,
	    table: "table" + style.table,
	    table_row: "tr" + style.table_row,
	    table_cell: "td" + style.table_cell,
	    label: "label" + style.label,
	    div: "div",
	    // Component Elements
	    //
	    //
	    main: ".little-creature-maker" + style.main,
	    tags: "span" + style.tags,
	    tag: "span" + style.tag,
	    remove: "span" + style.remove,
	    crc: "div" + style.small,
	    stat_block: "div",
	    base_properties: "div" + style.base_properties,
	    compendium: "div",
	    compendium_header: style.light_bg + style.compendium_header + style.compendium_row,
	    compendium_row: "" + style.hilight_bg + style.compendium_row,
	    compendium_cell: "" + style.compendium_cell,
	    property_block: "div.property_block",
	    property_line: "div.property_line",
	    abilities_block: "div" + style.abilities_block,
	    ability_modifiers: "div" + style.ability_modifiers,
	    ability_modifier_stat: "span" + style.ability_modifier_stat,
	    ability_modifier_score: "span" + style.ability_modifier_score,
	    actions_block: "div" + style.actions_block,
	    action_block: "div" + style.action_block,
	    action_cell: "div" + style.action_cell,
	    action_cell_wide: "div" + style.action_cell_wide,
	    multiattacks: "div",
	    multiattack: "div",
	    name_editor: "h1"
	};

	var streamExports$1 = {};
	var stream$1 = {
	  get exports(){ return streamExports$1; },
	  set exports(v){ streamExports$1 = v; },
	};

	var streamExports = {};
	var stream = {
	  get exports(){ return streamExports; },
	  set exports(v){ streamExports = v; },
	};

	/* eslint-disable */

	(function (module) {
	(function() {
		/* eslint-enable */
		Stream.SKIP = {};
		Stream.lift = lift;
		Stream.scan = scan;
		Stream.merge = merge;
		Stream.combine = combine;
		Stream.scanMerge = scanMerge;
		Stream["fantasy-land/of"] = Stream;

		var warnedHalt = false;
		Object.defineProperty(Stream, "HALT", {
			get: function() {
				warnedHalt || console.log("HALT is deprecated and has been renamed to SKIP");
				warnedHalt = true;
				return Stream.SKIP
			}
		});

		function Stream(value) {
			var dependentStreams = [];
			var dependentFns = [];

			function stream(v) {
				if (arguments.length && v !== Stream.SKIP) {
					value = v;
					if (open(stream)) {
						stream._changing();
						stream._state = "active";
						// Cloning the list to ensure it's still iterated in intended
						// order
						dependentStreams.slice().forEach(function(s, i) {
							if (open(s)) s(this[i](value));
						}, dependentFns.slice());
					}
				}

				return value
			}

			stream.constructor = Stream;
			stream._state = arguments.length && value !== Stream.SKIP ? "active" : "pending";
			stream._parents = [];

			stream._changing = function() {
				if (open(stream)) stream._state = "changing";
				dependentStreams.forEach(function(s) {
					s._changing();
				});
			};

			stream._map = function(fn, ignoreInitial) {
				var target = ignoreInitial ? Stream() : Stream(fn(value));
				target._parents.push(stream);
				dependentStreams.push(target);
				dependentFns.push(fn);
				return target
			};

			stream.map = function(fn) {
				return stream._map(fn, stream._state !== "active")
			};

			var end;
			function createEnd() {
				end = Stream();
				end.map(function(value) {
					if (value === true) {
						stream._parents.forEach(function (p) {p._unregisterChild(stream);});
						stream._state = "ended";
						stream._parents.length = dependentStreams.length = dependentFns.length = 0;
					}
					return value
				});
				return end
			}

			stream.toJSON = function() { return value != null && typeof value.toJSON === "function" ? value.toJSON() : value };

			stream["fantasy-land/map"] = stream.map;
			stream["fantasy-land/ap"] = function(x) { return combine(function(s1, s2) { return s1()(s2()) }, [x, stream]) };

			stream._unregisterChild = function(child) {
				var childIndex = dependentStreams.indexOf(child);
				if (childIndex !== -1) {
					dependentStreams.splice(childIndex, 1);
					dependentFns.splice(childIndex, 1);
				}
			};

			Object.defineProperty(stream, "end", {
				get: function() { return end || createEnd() }
			});

			return stream
		}

		function combine(fn, streams) {
			var ready = streams.every(function(s) {
				if (s.constructor !== Stream)
					throw new Error("Ensure that each item passed to stream.combine/stream.merge/lift is a stream.")
				return s._state === "active"
			});
			var stream = ready
				? Stream(fn.apply(null, streams.concat([streams])))
				: Stream();

			var changed = [];

			var mappers = streams.map(function(s) {
				return s._map(function(value) {
					changed.push(s);
					if (ready || streams.every(function(s) { return s._state !== "pending" })) {
						ready = true;
						stream(fn.apply(null, streams.concat([changed])));
						changed = [];
					}
					return value
				}, true)
			});

			var endStream = stream.end.map(function(value) {
				if (value === true) {
					mappers.forEach(function(mapper) { mapper.end(true); });
					endStream.end(true);
				}
				return undefined
			});

			return stream
		}

		function merge(streams) {
			return combine(function() { return streams.map(function(s) { return s() }) }, streams)
		}

		function scan(fn, acc, origin) {
			var stream = origin.map(function(v) {
				var next = fn(acc, v);
				if (next !== Stream.SKIP) acc = next;
				return next
			});
			stream(acc);
			return stream
		}

		function scanMerge(tuples, seed) {
			var streams = tuples.map(function(tuple) { return tuple[0] });

			var stream = combine(function() {
				var changed = arguments[arguments.length - 1];
				streams.forEach(function(stream, i) {
					if (changed.indexOf(stream) > -1)
						seed = tuples[i][1](seed, stream());
				});

				return seed
			}, streams);

			stream(seed);

			return stream
		}

		function lift() {
			var fn = arguments[0];
			var streams = Array.prototype.slice.call(arguments, 1);
			return merge(streams).map(function(streams) {
				return fn.apply(undefined, streams)
			})
		}

		function open(s) {
			return s._state === "pending" || s._state === "active" || s._state === "changing"
		}

		module["exports"] = Stream;

		}());
	} (stream));

	(function (module) {

		module.exports = streamExports;
	} (stream$1));

	var Stream = /*@__PURE__*/getDefaultExportFromCjs(streamExports$1);

	const OptionComponent = {
	    view({ attrs: { value, disabled }, children }) {
	        return mithril(el.option, {
	            key: value,
	            value,
	            disabled,
	        }, children);
	    },
	};
	function Select() {
	    const selectedIndex = Stream(0);
	    return {
	        view({ attrs: { name, current, choices, onchange, preventDefault, label, style, id } }) {
	            selectedIndex(choices.map(i => i[0])
	                .indexOf(String(current)) + 1);
	            console.log("sel: ", selectedIndex());
	            return mithril(el.select + (style || ""), {
	                id,
	                name,
	                selectedIndex: selectedIndex(),
	                onchange(e) {
	                    if (preventDefault)
	                        e.preventDefault();
	                    selectedIndex();
	                    onchange(this.value);
	                },
	            }, mithril(OptionComponent, {
	                value: '_label',
	                disabled: true,
	            }, label), ...choices.map((choice) => mithril(OptionComponent, { value: String(choice[0]) }, choice[1])));
	        },
	    };
	}
	function SelectLabel() {
	    const id = Math.random().toString(36).slice(6);
	    return {
	        view(vnode) {
	            return mithril(el.select_block, mithril(el.label, { for: id }, vnode.attrs.label), mithril(Select, Object.assign({ id }, vnode.attrs)));
	        }
	    };
	}

	function capitalize(str) {
	    return str.charAt(0).toUpperCase() + str.slice(1);
	}
	function formatString(str) {
	    return String(str)
	        .replace(/[^a-z0-9\-\(\)]/ig, " ")
	        .replace(/\b([a-zÁ-ú]{3,})/g, capitalize);
	}
	function formatModScore(mod) {
	    if (mod < 0) {
	        return " - " + Math.abs(mod);
	    }
	    else {
	        return " + " + mod;
	    }
	}
	function formatAbilityScore(score) {
	    return modToAbilityScore(score) +
	        " (" + formatModScore(score) + ") ";
	}
	function formatChoice(i) {
	    return [String(i), formatString(i)];
	}
	function formatChoices(i) {
	    return i.map(formatChoice);
	}

	const SelectTag = {
	    view({ attrs: { label, name, choices, selected, onchange } }) {
	        const items = choices
	            .filter((i) => selected.indexOf(i) < 0)
	            .map(i => i.toString());
	        return [
	            mithril(Select, {
	                style: style.select_tag_component,
	                name,
	                label,
	                current: "",
	                choices: formatChoices(items),
	                onchange(val) {
	                    onchange(selected.concat(val));
	                },
	                preventDefault: true
	            }),
	            mithril(el.tags, ...map((tag) => mithril(el.tag, {
	                onclick(e) {
	                    e.preventDefault();
	                    const data = selected.filter(x => x !== tag);
	                    onchange(data);
	                }
	            }, tag), selected))
	        ];
	    }
	};

	function Textarea() {
	    const text = Stream("");
	    return {
	        oncreate({ dom }) {
	            const d = dom;
	            text
	                .map(() => {
	                d.style.height = '';
	                d.style.height = dom.scrollHeight + 'px';
	            });
	        },
	        view({ attrs: { name, placeholder, value, oninput, style } }) {
	            return mithril(el.textarea + (style || ""), {
	                name,
	                placeholder,
	                oninput() {
	                    text(this.value);
	                    oninput(this.value);
	                }
	            }, value);
	        },
	    };
	}

	function StatHex() {
	    const radius = 50;
	    const size = {
	        width: radius * 2,
	        height: radius * 2,
	    };
	    const maxScore = 30;
	    const unit = Math.floor(radius / maxScore);
	    const sin = Math.sin(Math.PI / 6);
	    const cos = Math.cos(Math.PI / 6);
	    const points = Stream([]);
	    const style = bss `
    fill rgb(90,90,90)
    stroke-width 1
    stroke rgb(90,45,45)
  `.style;
	    bss `
    stroke rgba(100, 100, 100, 0.5)
    stroke-width 2
  `.style;
	    function score2points(score) {
	        return score.map((s, key) => {
	            const p = unit * s;
	            let y = 0;
	            let x = 0;
	            if (key === 0) {
	                x = radius + 0;
	                y = radius - p;
	            }
	            if (key === 1) {
	                x = radius + Math.ceil(p * cos);
	                y = radius - Math.ceil(p * sin);
	            }
	            if (key === 2) {
	                x = radius + Math.ceil(p * cos);
	                y = radius + Math.ceil(p * sin);
	            }
	            if (key === 3) {
	                x = radius + 0;
	                y = radius + p;
	            }
	            if (key === 4) {
	                x = radius - Math.ceil(p * cos);
	                y = radius + Math.ceil(p * sin);
	            }
	            if (key === 5) {
	                x = radius - Math.ceil(p * cos);
	                y = radius - Math.ceil(p * sin);
	            }
	            return [x, y];
	        });
	    }
	    return {
	        view({ attrs: { score } }) {
	            points(score2points(score));
	            return mithril("svg", Object.assign({}, size), mithril("polygon", {
	                points: points().map((s) => s.join(',')).join(' '),
	                style,
	            }));
	        }
	    };
	}

	const Permalink = {
	    view({ attrs: { sb } }) {
	        return mithril(mithril.route.Link, {
	            class: style.permalink,
	            href: "/" + encode(sb)
	        }, "Permalink");
	    }
	};
	const NameEditorComponent = {
	    view() {
	        return mithril(el.input, {
	            type: "text",
	            name: "name",
	            value: state.current.name,
	            onkeyup(e) {
	                state.set({ name: e.target.value });
	            },
	        });
	    }
	};
	const AbilityModifierComponent = {
	    view({ attrs: { mod } }) {
	        const score = state.current.ability_modifiers[mod];
	        return mithril(el.ability_modifiers, { key: mod }, mithril(el.ability_modifier_stat, mod), mithril(el.ability_modifier_score, formatAbilityScore(score)));
	    }
	};
	const BaseProperty = {
	    view({ children }) {
	        const title = children[0];
	        const value = slice(1, Infinity, children);
	        return mithril(el.property_line, mithril("b", title), ": ", ...value);
	    }
	};
	const MultiAttacks = {
	    view({ attrs: { sb } }) {
	        const choices = sb.attacks.map((atk) => [atk.id, atk.name]);
	        console.log(choices);
	        return mithril(el.multiattacks, mithril("h3", "Multiattacks", mithril(el.button, {
	            onclick() {
	                sb.multiattacks.push({
	                    id: "",
	                    times: 0,
	                });
	            }
	        }, "new")), ...sb.multiattacks
	            .map((atk, key) => mithril(el.multiattack, mithril(Select, {
	            key,
	            name: "times",
	            label: "#",
	            choices: formatChoices(range(0, 8)),
	            current: atk.times,
	            onchange(val) {
	                console.log("using: ", val);
	                atk.times = parseInt(val);
	            }
	        }), mithril(Select, {
	            key,
	            name: "attack",
	            label: "Attack",
	            current: atk.id,
	            choices,
	            onchange(val) {
	                console.log("using: ", atk.id);
	                atk.id = val;
	            }
	        }), mithril(el.remove, {
	            key,
	            onclick() {
	                console.log("rm: ", atk.id);
	                sb.multiattacks = sb.multiattacks.filter(a => a.id !== atk.id);
	            }
	        }, "Remove"))));
	    }
	};
	const AttackComponent = {
	    view({ attrs: { attack } }) {
	        const dmg = attackDamage(attack);
	        return mithril(el.action_block, { key: attack.id }, mithril(el.input + style.action_cell_wide, {
	            name: "attack",
	            placeholder: "name",
	            value: attack.name,
	            onchange(e) {
	                state.setAttack(Object.assign(Object.assign({}, attack), { name: e.target['value'] }));
	            }
	        }), mithril(Textarea, {
	            style: style.action_cell_wide,
	            name: "description",
	            placeholder: "description",
	            value: attack.description,
	            oninput(val) {
	                state.setAttack(Object.assign(Object.assign({}, attack), { description: val }));
	            },
	        }), mithril(Select, {
	            style: style.action_cell,
	            name: "die_num",
	            current: attack.die_num,
	            choices: formatChoices(range(1, 21)),
	            onchange(die_num) {
	                state.setAttack(Object.assign(Object.assign({}, attack), { die_num: parseInt(die_num) }));
	            }
	        }), mithril(Select, {
	            style: style.action_cell,
	            name: "die",
	            current: attack.die,
	            choices: formatChoices(dies),
	            onchange(die) {
	                state.setAttack(Object.assign(Object.assign({}, attack), { die }));
	            }
	        }), mithril(Select, {
	            style: style.action_cell,
	            name: "mod",
	            current: attack.mod.toString(),
	            choices: formatChoices(range(0, 61)),
	            onchange(mod) {
	                state.setAttack(Object.assign(Object.assign({}, attack), { mod: parseInt(mod) }));
	            }
	        }), mithril(Select, {
	            style: style.action_cell_wide,
	            name: "type",
	            current: attack.type,
	            choices: formatChoices(damage_types),
	            onchange(type) {
	                state.setAttack(Object.assign(Object.assign({}, attack), { type }));
	            }
	        }), mithril(el.action_cell, "max: ", mithril("b", dmg.max)), mithril(el.action_cell, "avg: ", mithril("b", dmg.avg)), mithril(el.action_cell, "min: ", mithril("b", dmg.min)), mithril(el.remove + style.action_cell_wide, {
	            onclick() {
	                state.removeAttack(attack);
	            }
	        }, "remove"));
	    }
	};
	const ActionsBlock = {
	    view({ attrs: { sb } }) {
	        return mithril(".actions", [
	            mithril("h3", "Actions", mithril(el.button, {
	                onclick() {
	                    state.newAttack();
	                }
	            }, "new")),
	            mithril(el.actions_block, sb.attacks.map((attack) => mithril(AttackComponent, { attack }))),
	            sb.attacks.length ? mithril(MultiAttacks, { sb }) : [],
	        ]);
	    }
	};
	const PropertyLines = {
	    view() {
	        return [
	            mithril(el.property_line, mithril(SelectTag, {
	                label: "Damage Immunities",
	                name: "damage-immunities",
	                choices: damage_types,
	                selected: state.current.properties.damage_immunities || [],
	                onchange(val) {
	                    state.set({ properties: { damage_immunities: val } });
	                },
	            })),
	            mithril(el.property_line, mithril(SelectTag, {
	                label: "Damage Resistances",
	                name: "senses",
	                choices: damage_types,
	                selected: state.current.properties.damage_resistances || [],
	                onchange(val) {
	                    state.set({ properties: { damage_resistances: val } });
	                },
	            })),
	            mithril(el.property_line, mithril(SelectTag, {
	                label: "Damage Weaknesses",
	                name: "damage-weaknesses",
	                choices: damage_types,
	                selected: state.current.properties.damage_weaknesses || [],
	                onchange(val) {
	                    state.set({ properties: { damage_weaknesses: val } });
	                },
	            })),
	            mithril(el.property_line, mithril(SelectTag, {
	                label: "Condition Immunities",
	                name: "condition-immunities",
	                choices: conditions,
	                selected: state.current.properties.condition_immunities || [],
	                onchange(val) {
	                    state.set({ properties: { condition_immunities: val } });
	                },
	            })),
	            mithril(el.property_line, mithril(SelectTag, {
	                label: "Condition Weaknesses",
	                name: "condition-weaknesses",
	                choices: conditions,
	                selected: state.current.properties.condition_weaknesses || [],
	                onchange(val) {
	                    state.set({ properties: { condition_weaknesses: val } });
	                },
	            })),
	            mithril(el.property_line, mithril(SelectTag, {
	                label: "Senses",
	                name: "senses",
	                choices: special_senses,
	                selected: state.current.properties.special_senses || [],
	                onchange(val) {
	                    state.set({ properties: { special_senses: val } });
	                },
	            })),
	            mithril(el.property_line, mithril(SelectTag, {
	                label: "Languages",
	                name: "languages",
	                choices: languages,
	                selected: state.current.properties.languages || [],
	                onchange(val) {
	                    state.set({ properties: { languages: val } });
	                }
	            })),
	        ];
	    }
	};
	const SimpleCreatureJSON = {
	    view() {
	        const currentJson = JSON.stringify(state.current);
	        const copyText = JSON.stringify(state.current, null, 2);
	        return mithril(".actions", mithril(el.button, {
	            onclick(e) {
	                e.preventDefault();
	                state.saveToCompendium(state.current);
	            }
	        }, "save to compendium"), mithril(el.input, {
	            id: "littleCreatureJSON",
	            type: "text",
	            value: currentJson,
	        }), mithril(el.button, {
	            onclick(e) {
	                e.preventDefault();
	                navigator.clipboard.writeText(copyText);
	            }
	        }, "copy json to clipboard"), mithril(el.button, {
	            onclick() {
	                const val = document.getElementById("littleCreatureJSON").value;
	                state.set(JSON.parse(val));
	            }
	        }, "import from JSON"), mithril(Permalink, { sb: state.current }));
	    }
	};
	const StatBlockComponent = {
	    view() {
	        return mithril(".stat-block", mithril(el.crc, state.current.uid), mithril(el.hr), mithril(el.name_editor, mithril(NameEditorComponent)), mithril(el.property_line, { class: grid.container(6) }, mithril(SelectLabel, {
	            name: "level",
	            label: "Level",
	            current: state.current.level.toString(),
	            choices: formatChoices(map((i) => i.toString(), range(-5, 36))),
	            onchange(lvl) {
	                state.set({ level: parseInt(lvl) });
	            },
	        }), mithril(SelectLabel, {
	            name: "role",
	            label: "Role",
	            onchange(val) { state.set({ role: val }); },
	            current: state.current.role,
	            choices: formatChoices(keys(roles)),
	        }), mithril(SelectLabel, {
	            name: "modifier",
	            label: "Modifier",
	            onchange(val) { state.set({ modifier: val }); },
	            current: state.current.modifier,
	            choices: formatChoices(keys(modifiers)),
	        }), mithril(SelectLabel, {
	            name: "size",
	            label: "Size",
	            onchange(val) { state.set({ size: val }); },
	            current: state.current.size,
	            choices: formatChoices(sizes),
	        }), mithril(SelectLabel, {
	            name: "category",
	            label: "Category",
	            onchange(val) { state.set({ category: val }); },
	            current: state.current.category,
	            choices: formatChoices(categories),
	        }), mithril(SelectLabel, {
	            name: "alignment",
	            label: "Alignment",
	            onchange(val) { state.set({ alignment: val }); },
	            current: state.current.alignment,
	            choices: formatChoices(alignments),
	        })), mithril(el.hr), mithril(el.base_properties, mithril(el.div, mithril(BaseProperty, "Hit Points", state.current.hit_points, ` (${state.current.hit_die[0]}${state.current.hit_die[1]} + ${state.current.hit_die[2]}) `), mithril(BaseProperty, "Armor Class", state.current.armor_class), mithril(BaseProperty, "Speed", state.current.speed, "ft"), mithril(BaseProperty, "Challenge", state.current.challenge_rating, " ( ", state.current.experience, " ) "), mithril(BaseProperty, "Damage per Action", state.current.damage_per_action)), mithril(StatHex, { score: values(state.current.ability_modifiers).map(modToAbilityScore) })), mithril(el.hr), mithril(el.abilities_block, map((mod) => mithril(AbilityModifierComponent, { mod }), ["str", "dex", "con", "int", "wis", "cha"])), mithril(el.hr), mithril(PropertyLines), mithril(el.hr), mithril(ActionsBlock, { sb: state.current }), mithril(el.hr), mithril(SimpleCreatureJSON));
	    },
	};
	const SimpleCreatureCompendium = {
	    oninit() {
	        state.loadCreatureCompendium();
	    },
	    view() {
	        return mithril(el.compendium, mithril("h1", "List of creatures"), mithril(el.compendium, mithril(el.compendium_header + style.light_bg, mithril(el.compendium_cell, "uid"), mithril(el.compendium_cell, "name"), mithril(el.compendium_cell, "level"), mithril(el.compendium_cell, "role"), mithril(el.compendium_cell, "modifier")), map((creature) => mithril(el.compendium_row + style.hilight_bg, {
	            key: creature.uid,
	            onclick() {
	                state.current = creature;
	                mithril.route.set("/" + encode(creature));
	            }
	        }, mithril(el.compendium_cell, creature.uid), mithril(el.compendium_cell, creature.name), mithril(el.compendium_cell, creature.level), mithril(el.compendium_cell, creature.role), mithril(el.compendium_cell, creature.modifier), mithril(el.compendium_cell, mithril(Permalink, { sb: creature })), mithril(el.compendium_cell + style.remove, {
	            onclick() { state.deleteFromCompendium(creature.uid); }
	        }, "x")), values(state.list))));
	    }
	};
	const Ui = {
	    oninit(vnode) {
	        if (vnode.attrs.creature) {
	            try {
	                const creature = decode(vnode.attrs.creature);
	                return state.init(creature);
	            }
	            catch (e) {
	                console.error(e);
	            }
	        }
	        state.init();
	    },
	    view() {
	        return mithril(el.main, [
	            mithril(StatBlockComponent),
	            mithril(SimpleCreatureCompendium),
	        ]);
	    },
	};

	mithril.route(document.body, "/", {
	    "/": Ui,
	    "/:creature": Ui,
	});

})();
//# sourceMappingURL=standalone.js.map
