/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: mark@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    /**
     * EventEmitter represents a channel for events.
     *
     * @class EventEmitter
     * @constructor
     */
    // `EventEmitter`是一个事件分发器
    function EventEmitter() {
        this.listeners = {};
        this._owner = this;
    }

    /**
     * Trigger an event, sending to all downstream handlers
     *   listening for provided 'type' key.
     *
     * @method emit
     *
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event event data
     * @return {EventHandler} this
     */
    // 触发事件，调用所有监听`type`事件的处理器
    EventEmitter.prototype.emit = function emit(type, event) {
        var handlers = this.listeners[type];
        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].call(this._owner, event);
            }
        }
        return this;
    };

    /**
     * Bind a callback function to an event type handled by this object.
     *
     * @method "on"
     *
     * @param {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     * @return {EventHandler} this
     */
    // 将一个回调函数（事件处理器）绑定至监听`type`事件
   EventEmitter.prototype.on = function on(type, handler) {
        if (!(type in this.listeners)) this.listeners[type] = [];
        var index = this.listeners[type].indexOf(handler);
        if (index < 0) this.listeners[type].push(handler);
        return this;
    };

    /**
     * Alias for "on".
     * @method addListener
     */
    // 同`on`
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;

   /**
     * Unbind an event by type and handler.
     *   This undoes the work of "on".
     *
     * @method removeListener
     *
     * @param {string} type event type key (for example, 'click')
     * @param {function} handler function object to remove
     * @return {EventEmitter} this
     */
    // `handler`处理器不再监听`type`事件
    EventEmitter.prototype.removeListener = function removeListener(type, handler) {
        var listener = this.listeners[type];
        if (listener !== undefined) {
            var index = listener.indexOf(handler);
            if (index >= 0) listener.splice(index, 1);
        }
        return this;
    };

    /**
     * Call event handlers with this set to owner.
     *
     * @method bindThis
     *
     * @param {Object} owner object this EventEmitter belongs to
     */
    // `owner`会成为所有处理器中的`this`
    EventEmitter.prototype.bindThis = function bindThis(owner) {
        this._owner = owner;
    };

    module.exports = EventEmitter;
});
