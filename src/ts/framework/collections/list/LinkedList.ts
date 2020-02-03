/** @file LinkedList.ts */

/// <reference path="../../lang/lang.ts" />

/**
 * The base class for a doubly linked list node.
 * Useful for implementing custom linked list nodes that don't need a value member.
 * @template Node The type of node in the list.
 */
abstract class BaseLinkedListNode<Node extends BaseLinkedListNode<any>>
{
	//#region Members
	/** Gets the linked list that this node belongs to. Is set to null if the node is not in a list. @readonly */
	public list:LinkedList<Node> = null;

	/** The next node in the list. Is set to null if there is no next node or the node is not in a list. @readonly */
	public next:Node = null;

	/** The previous node in the list. Is set to null if there is no previous node or the node is not in a list. @readonly */
	public previous:Node = null;
	//#endregion
}

/**
 * A generic doubly linked list node that can store any value.
 * @template V The value type to store at the node.
 */
class LinkedListNode<V> extends BaseLinkedListNode<LinkedListNode<V>>
{
	//#region Members
	/** The value stored at this node. */
	public value:V;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new linked list node with the specified value.
	 * @param value The value to set at the new node.
	 */
	public constructor(value:V = null)
	{
		super();
		this.value = value;
	}
	//#endregion
}

/**
 * A doubly linked list of the specified node type.
 * @template Node The type of node to store.
 */
class LinkedList<Node extends BaseLinkedListNode<any>>
{
	//#region Members
	/** Gets the first node in the list. @readonly */
	public first:Node = null;

	/** Gets the last node in the list. @readonly */
	public last:Node = null;

	/** Gets the number of nodes contained in the list. @readonly */
	public count:int = 0;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new linked list.
	 * @param node Optional. If present the list is initialized with it.
	 */
	public constructor(node?:Node)
	{
		if (node) this.append(node);
	}
	//#endregion


	//#region Actions
	/**
	 * Appends a node to the end of the list.
	 * @param node The node to append.
	 * @return The appended node.
	 * @throws Error If the node is already in a list.
	 */
	public append(node:Node):Node
	{
		// Ensure not in a list
		if (node.list !== null) throw new Error("The node is already in a list!");

		// Connect
		if (this.count > 0)
		{
			this.last.next = node;
			node.previous = this.last;
		}
		else this.first = node;	// Count is 0, so also need to make this the start

		this.last = node;
		node.list = this;

		// Update count
		this.count++;

		// Return the node
		return node;
	}

	/**
	 * Prepends a node to the start of the list.
	 * @param node The node to prepend.
	 * @return The prepended node.
	 * @throws Error If the node is already in a list.
	 */
	public prepend(node:Node):Node
	{
		// Ensure not in a list
		if (node.list !== null) throw new Error("The node is already in a list!");

		// Connect
		if (this.count > 0)
		{
			this.first.previous = node;
			node.next = this.first;
		}
		else (this).last = node;	// Count is 0, so also need to make this the end

		this.first = node;
		node.list = this;

		// Update count
		this.count++;

		// Return the node
		return node;
	}

	/**
	 * Removes a node from the list.
	 * @param node The node to remove.
	 * @return The removed node.
	 * @throws Error If the node is not in this list.
	 */
	public remove(node:Node):Node
	{
		// Ensure it is in this list
		if (node.list !== this) throw new Error("Node is not in this list!");

		// Disconnect
		if (this.count === 1)
		{
			this.first =
			this.last = null;
		}
		else if (node === this.first)
		{
			this.first = node.next;
			this.first.previous = null;
		}
		else if (node === this.last)
		{
			this.last = node.previous;
			this.last.next = null;
		}
		else
		{
			node.previous.next = node.next;
			node.next.prev = node.previous;
		}
		node.list =
		node.next =
		node.previous = null;

		// Update count
		this.count--;

		// Return the node
		return node;
	}

	/**
	 * Removes the first node in the list.
	 * @param node The node to remove.
	 * @return The removed node. Returns null if there was no first node.
	 */
	public removeFirst():Node
	{
		return this.count > 0 ? this.remove(this.first) : null;
	}

	/**
	 * Removes the last node in the list.
	 * @param node The node to remove.
	 * @return The removed node. Returns null if there was no first node.
	 */
	public removeLast():Node
	{
		return this.count > 0 ? this.remove(this.last) : null;
	}

	/**
	 * Removes all nodes from the list.
	 */
	public clear():void
	{
		let current:Node = this.first;
		while (current)
		{
			let next:Node = current.next;

			current.list =
			current.next =
			current.previous = null;

			current = next;
		}
		this.first =
		this.last = null;
		this.count = 0;
	}
	//#endregion
}
