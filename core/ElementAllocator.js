//中文注释部分由 Mr. Wiredancer(aka J.L) 完成
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
     * Internal helper object to Context that handles the process of
     *   creating and allocating DOM elements within a managed div.
     *   Private.
     *
     * @class ElementAllocator
     * @constructor
     * @private
     * @param {Node} container document element in which Famo.us content will be inserted
     */
    //`ElementAllocator`应该作为一个私有类来使用。它是专门用来生成一个给`Context`内部使用的对象，这个对象是负责`Context`所管理的 div(`container`) 下面的 DOM 元素的创建和分配
    function ElementAllocator(container) {
        //注意此处使用了`DocumentFragment`，这个对象会带来非常高的性能提升。简单来说，`DocumentFragment`只储存在内存而不在 DOM 树中，所以将元素插入`DocumentFragment`时不会引起 reflow. 详情参见 https://developer.mozilla.org/en-US/docs/Web/API/document.createDocumentFragment
        if (!container) container = document.createDocumentFragment();
        this.container = container;
        //`detachedNodes`是一个存放可重用的 DOM 元素的池
        this.detachedNodes = {};
        //`nodeCount`记录这个对象所管理的通过`allocate`分配的非空闲元素的个数
        this.nodeCount = 0;
    }

    /**
     * Move the document elements from their original container to a new one.
     *
     * @private
     * @method migrate
     *
     * @param {Node} container document element to which Famo.us content will be migrated
     */
    // 将原有container的 DOM 元素转移到新的container去，并管理新的 container 
    ElementAllocator.prototype.migrate = function migrate(container) {
        var oldContainer = this.container;
        if (container === oldContainer) return;

        //如果`container`是一个`DocumentFragment`对象, 则直接将`this.container`加到`container`下面
        if (oldContainer instanceof DocumentFragment) {
            container.appendChild(oldContainer);
        }
        else {
            while (oldContainer.hasChildNodes()) {
                container.appendChild(oldContainer.removeChild(oldContainer.firstChild));
            }
        }

        this.container = container;
    };

    /**
     * Allocate an element of specified type from the pool.
     *
     * @private
     * @method allocate
     *
     * @param {string} type type of element, e.g. 'div'
     * @return {Node} allocated document element
     */
    // 如果空闲池里有所需类型的空闲元素，则返回一个空闲元素；否则创建一个新元素并返回
    ElementAllocator.prototype.allocate = function allocate(type) {
        type = type.toLowerCase();
        if (!(type in this.detachedNodes)) this.detachedNodes[type] = [];
        var nodeStore = this.detachedNodes[type];
        var result;
        if (nodeStore.length > 0) {
            result = nodeStore.pop();
        }
        else {
            result = document.createElement(type);
            this.container.appendChild(result);
        }
        this.nodeCount++;
        return result;
    };

    /**
     * De-allocate an element of specified type to the pool.
     *
     * @private
     * @method deallocate
     *
     * @param {Node} element document element to deallocate
     */
    // 将一个可以重用的元素放到空闲池去
    ElementAllocator.prototype.deallocate = function deallocate(element) {
        var nodeType = element.nodeName.toLowerCase();
        var nodeStore = this.detachedNodes[nodeType];
        nodeStore.push(element);
        this.nodeCount--;
    };

    /**
     * Get count of total allocated nodes in the document.
     *
     * @private
     * @method getNodeCount
     *
     * @return {Number} total node count
     */
    // getter of this.nodeCount
    ElementAllocator.prototype.getNodeCount = function getNodeCount() {
        return this.nodeCount;
    };

    module.exports = ElementAllocator;
});
