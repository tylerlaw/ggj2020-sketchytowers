"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/** @file lang.ts */
//#endregion
/** @file Handler.ts */
/** @file Delegate.ts */
/// <reference path="Handler.ts" />
/**
 * A functor that wraps a function of the supplied type signature.
 */
var Delegate = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates an instance of Delegate that starts out as unset.
     * @param method Optional if no scope is supplied. A method with signature matching T.
     * @param scope Optional. The scope to call the following handler method on.
     * @throws Error If a scope is supplied without a method no method is supplied.
     */
    function Delegate(method, scope) {
        if (scope || method)
            this.set(method, scope);
        else
            this.clear();
    }
    //#endregion
    //#region Setting
    /**
     * Sets a delegate to call a specified method on a specified scope.
     * @param method A method with signature matching T.
     * @param scope Optional. The scope to call the following handler method on.
     * @throws Error If the delegate is already set. It must be cleared first.
     * @throws Error If no method is supplied.
     */
    Delegate.prototype.set = function (method, scope) {
        if (scope === void 0) { scope = null; }
        if (this.scope || this.method)
            throw new Error("An existing delegate handler must be cleared before a new one can be set!");
        if (!method)
            throw new Error("Method must be defined! Use clear() to unset a delegate.");
        this.method = method;
        this.scope = scope;
        this.isSet = true;
        this.invoke = this.fire;
    };
    /**
     * Clears a delegate of its currently set method and scope if any.
     */
    Delegate.prototype.clear = function () {
        this.method = null;
        this.scope = null;
        this.isSet = false;
        this.invoke = this.unset;
    };
    //#endregion
    //#region Invoking
    /**
     * Helper method that is called if an unset delegate is invoked.
     * @throws Error If called.
     */
    Delegate.prototype.unset = function () {
        throw new Error("Tried to invoke a delegate that was not set!");
    };
    /**
     * Helper method to fire off a set delegate.
     * @param arguments Any set of arguments to be used when calling the wrapped function.
     * @returns The return value of the wrapped function.
     */
    Delegate.prototype.fire = function () {
        return this.method.apply(this.scope, arguments);
    };
    //#endregion
    //#region Equatable
    /**
     * Returns true iff the supplied scope and method match the currently set handler.
     * @param method The method to check for.
     * @param scope The scope to check for.
     * @returns True iff the supplied params match the current handler settings.
     */
    Delegate.prototype.equals = function (method, scope) {
        if (scope === void 0) { scope = null; }
        return (this.scope === scope && this.method === method);
    };
    return Delegate;
}());
/** @file DelegateEvent.ts */
/// <reference path="Delegate.ts" />
/**
 * Groups a set of Delegates to a single event handle.
 * When the event is invoked, each attached handler is invoked in order they are attached.
 * New Delegates added during invokaction will not be invoked.
 * Delegates not yet called during invokation which are removed will not be called.
 * Note that DelegateEvents cannot handle functors with return values
 */
var DelegateEvent = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Constructs a new DelegateEvent.
     */
    function DelegateEvent() {
        //#region Members
        /** Gets the number of delegates attached to this delegate event. @readonly */
        this.count = 0;
        /** Returns true if there are no delegates attached to this event. @readonly */
        this.isEmpty = true;
        /** The set of all delegates waiting for this event */
        this._delegates = [];
        /** Indicates if the event is currently being invoked. */
        this._invoking = false;
        /** The invokation iterator helper. */
        this._iterator = -1;
        /** The invokation iterator stop helper. */
        this._iteratorStop = -1;
        this.invoke = this.fire0;
    }
    //#endregion
    //#region Access
    /**
     * Adds the specified delegate to this event.
     * @param method A method with signature matching T.
     * @param scope Optional. The scope to call the following handler method on.
     * @throws Error If the specified delegate was already added.
     */
    DelegateEvent.prototype.add = function (method, scope) {
        if (this.indexOf(method, scope) >= 0)
            throw new Error("Tried to add a delegate that was already added!");
        this._delegates.push(new Delegate(method, scope));
        if (this._delegates.length === 1)
            this.invoke = this.fire1;
        else if (this._delegates.length >= 2)
            this.invoke = this.fire;
        this.count = this._delegates.length;
        this.isEmpty = false;
    };
    /**
     * Removes the specified delegate from this event.
     * @param method A method with signature matching T.
     * @param scope Optional. The scope to call the following handler method on.
     * @throws Error if the specified delegate was not added.
     */
    DelegateEvent.prototype.remove = function (method, scope) {
        var index = this.indexOf(method, scope);
        if (index < 0)
            throw new Error("Tried to remove a delegate that was not added!");
        this._delegates.splice(index, 1);
        if (this._invoking) {
            this._iteratorStop--;
            if (this._iterator >= index)
                this._iterator--;
        }
        if (this._delegates.length === 1)
            this.invoke = this.fire1;
        else if (this._delegates.length === 0)
            this.invoke = this.fire0;
        this.count = this._delegates.length;
        this.isEmpty = (this.count === 0);
    };
    /**
     * Removes all delegates attached to this event.
     */
    DelegateEvent.prototype.clear = function () {
        // Free up all the delegates just to be safe
        for (var i = 0; i < this._delegates.length; ++i) {
            this._delegates[i].clear();
        }
        this._delegates.length = 0;
        this.invoke = this.fire0;
        if (this._invoking) {
            this._iterator = 0;
            this._iteratorStop = 0;
        }
        this.count = 0;
        this.isEmpty = true;
    };
    /**
     * Checks to see if a specific handler is attached to this event.
     * @param method The method to call when handling this event.
     * @param scope Optional. The scope to call the specified method on.
     * @returns Returns true if a delegate with the specified scope and method are waiting for this event.
     */
    DelegateEvent.prototype.contains = function (method, scope) {
        return this.indexOf(method, scope) >= 0;
    };
    /**
     * Returnts the index of the delegate if present, -1 if not present.
     * @param method The method to call when handling this event.
     * @param scope Optional. The scope to call the specified method on.
     * @returns The 0 based index of the delegate within the delegate list, if present, otherwise -1.
     */
    DelegateEvent.prototype.indexOf = function (method, scope) {
        for (var i = 0; i < this._delegates.length; ++i) {
            if (this._delegates[i].equals(method, scope))
                return i;
        }
        return -1;
    };
    //#endregion
    //#region Invoking
    /**
     * Invokation function when no delegates are attached.
     */
    DelegateEvent.prototype.fire0 = function () { };
    /**
     * Optimized invokation function when 1 delegate is attached.
     * @throws Error If the event was already being triggered.
     */
    DelegateEvent.prototype.fire1 = function () {
        if (this._invoking)
            throw new Error("Tried to invoke a DelegateEvent that is currently firing. Recursive events are not supported nor advised!");
        this._invoking = true;
        this._iterator = 0;
        this._iteratorStop = 1;
        this._delegates[0].invoke.apply(this._delegates[0], arguments);
        this._invoking = false;
        this._iterator = -1;
        this._iteratorStop = -1;
    };
    /**
     * Invokation function when more than 1 delegate is attached
     * @throws Error If the event was already being triggered.
     */
    DelegateEvent.prototype.fire = function () {
        if (this._invoking)
            throw new Error("Tried to invoke a DelegateEvent that is currently firing. Recursive events are not supported nor advised!");
        var del;
        var a = arguments;
        this._iteratorStop = this._delegates.length;
        this._invoking = true;
        for (this._iterator = 0; this._iterator < this._iteratorStop; ++this._iterator) {
            del = this._delegates[this._iterator];
            del.invoke.apply(del, a);
        }
        this._invoking = false;
        this._iterator = -1;
        this._iteratorStop = -1;
    };
    return DelegateEvent;
}());
/** @file Version.ts */
/**
 * Utility class for parsing version numbers encoded in standard
 * format [major].[minor].[build].[revision].
 */
var Version = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Constructs a new version with the default 0 number.
     */
    function Version() {
        //#region Members
        /** @inheritdoc */
        this.major = 0;
        /** @inheritdoc */
        this.minor = 0;
        /** @inheritdoc */
        this.build = 0;
        /** @inheritdoc */
        this.revision = 0;
        /** @inheritdoc */
        this.str = "0.0.0.0";
        /** @inheritdoc */
        this.name = "";
    }
    //#endregion
    //#region Initializers
    /**
     * Initializes a version to 0 with the specified name.
     * @param name The name of the version.
     */
    Version.prototype.fromName = function (name) {
        this.str = "0.0.0.0";
        this.major = this.minor = this.build = this.revision = 0;
        this.name = name;
    };
    /**
     * Initializes a version number from the specified string. Optionally
     * sets a name for the version.
     * @param str A version string of format [major].[minor].[build].[revision]
     * @param name (optional) A name for the version.
     */
    Version.prototype.fromVersionString = function (str, name) {
        this.str = str;
        this.name = name || "";
        var parts = str.split(".");
        this.major = parts.length > 0 ? parseInt(parts[0], 10) : 0;
        this.minor = parts.length > 1 ? parseInt(parts[1], 10) : 0;
        this.build = parts.length > 2 ? parseInt(parts[2], 10) : 0;
        this.revision = parts.length > 3 ? parseInt(parts[3], 10) : 0;
        return this;
    };
    /**
     * Initializes a version from the specified numbers with and optional name.
     * @param major The major version number.
     * @param minor (optional) The minor version number.
     * @param build (optional) The build version number.
     * @param revision (optional) The revision version number.
     * @param name (optional) A name for the version.
     */
    Version.prototype.fromVersionNumbers = function (major, minor, build, revision, name) {
        this.major = major || 0;
        this.minor = minor || 0;
        this.build = build || 0;
        this.revision = revision || 0;
        this.name = name || "";
        this.str = "";
        if (major !== undefined)
            this.str += major;
        if (minor !== undefined)
            this.str += "." + minor;
        if (build !== undefined)
            this.str += "." + build;
        if (revision !== undefined)
            this.str += "." + revision;
        return this;
    };
    //#endregion
    //#region Compare
    /**
     * Comparator function that compares two version numbers. Returns -1 if a is lower,
     * returns 1 if be is lower, returns 0 if they are the same.
     * @param a The first instance to check.
     * @param b The second instance to check.
     * @returns Returns -1 if a is lower, returns 1 if be is lower, returns 0 if they are the same.
     */
    Version.compare = function (a, b) {
        if (a.major < b.major)
            return -1;
        if (a.major > b.major)
            return 1;
        if (a.minor < b.minor)
            return -1;
        if (a.minor > b.minor)
            return 1;
        if (a.build < b.build)
            return -1;
        if (a.build > b.build)
            return 1;
        if (a.revision < b.revision)
            return -1;
        if (a.revision > b.revision)
            return 1;
        return 0;
    };
    //#endregion
    //#region String
    /** @inheritdoc */
    Version.prototype.toString = function () {
        var str = "";
        if (this.name !== "")
            str += this.name + " ";
        return str + this.str;
    };
    return Version;
}());
/** @file OS.ts */
/** @file DeviceType.ts */
/** @file Browser.ts */
/** @file Platform.ts */
/** @file System.ts */
/// <reference path="../util/Version.ts" />
/// <reference path="OS.ts" />
/// <reference path="DeviceType.ts" />
/// <reference path="Browser.ts" />
/// <reference path="Platform.ts" />
/**
 * Holds information about the current runtime environment.
 * @staticclass
 */
// tslint:disable-next-line: typedef
var System = new (/** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Initializes the static instance.
     */
    function class_1() {
        // Get the user agent and attempt detection
        var ua = navigator.userAgent.toLowerCase();
        //#region Helpers
        /**
         * Parses a version string following prefix from the user agent.
         * @param prefix The string of characters prefixing the version string.
         * @returns The parsed version.
         */
        function getVer(prefix) {
            var verStr = ua.substr(ua.indexOf(prefix) + prefix.length);
            if (verStr.indexOf(" ") >= 0)
                verStr = verStr.substr(0, verStr.indexOf(" "));
            if (verStr.indexOf(";") >= 0)
                verStr = verStr.substr(0, verStr.indexOf(";"));
            if (verStr.indexOf(")") >= 0)
                verStr = verStr.substr(0, verStr.indexOf(")"));
            while (verStr.indexOf("w") >= 0)
                verStr = verStr.replace("w", "");
            while (verStr.indexOf("_") >= 0)
                verStr = verStr.replace("_", ".");
            return new Version().fromVersionString(verStr);
        }
        //#endregion
        // Detect Platform
        this.platform = 0 /* Web */;
        // Detect OS
        if (ua.indexOf("cros") >= 0) {
            // NOTE: No current way to detect os version!
            this.os = 3 /* ChromeOS */;
        }
        else if (ua.indexOf("android") >= 0) {
            // Detect kindle vs android
            if (ua.indexOf("kindle") >= 0 || ua.indexOf("; kf") >= 0 || ua.indexOf("silk/") >= 0)
                this.os = 6 /* FireOS */; // kindles
            else
                this.os = 5 /* Android */;
            this.osVersion = getVer("android ");
        }
        else if (ua.indexOf("iphone") >= 0 && ua.indexOf("like iphone") < 0 || // IE Mobile adds "like i---" to its user agent for some reason
            ua.indexOf("ipad") >= 0 && ua.indexOf("like ipad") < 0 ||
            ua.indexOf("ipod") >= 0 && ua.indexOf("like ipod") < 0) {
            this.os = 4 /* AppleiOS */;
            if (ua.indexOf("iphone os ") >= 0)
                this.osVersion = getVer("iphone os ");
            else if (ua.indexOf("cpu os ") >= 0)
                this.osVersion = getVer("cpu os ");
        }
        else if (ua.indexOf("Windows phone os ") >= 0) {
            this.os = 7 /* WindowsPhone */;
            this.osVersion = getVer("windows phone os ");
        }
        else if (ua.indexOf("windows") >= 0) {
            this.os = 1 /* Windows */;
            if (ua.indexOf("windows nt ") >= 0)
                this.osVersion = getVer("windows nt ");
            else
                this.osVersion = new Version(); // Probably windows ME or lower
        }
        else if (ua.indexOf("mac os x ") >= 0) {
            this.os = 2 /* Mac */;
            this.osVersion = getVer("mac os x ");
        }
        else {
            this.os = 0 /* Unknown */;
            this.osVersion = new Version();
        }
        // Detect Device Type
        if (this.os === 4 /* AppleiOS */) {
            if (ua.indexOf("ipad") >= 0)
                this.device = 2 /* Tablet */;
            else
                this.device = 3 /* Handheld */;
        }
        else if (this.os === 6 /* FireOS */) {
            this.device = 2 /* Tablet */;
        }
        else if (this.os === 5 /* Android */) {
            if (ua.indexOf("mobile") >= 0)
                this.device = 3 /* Handheld */;
            else
                this.device = 2 /* Tablet */;
        }
        else if (this.os === 1 /* Windows */ && ua.indexOf("windows phone os") >= 0) {
            this.device = 3 /* Handheld */;
        }
        else {
            // Default back to computer if unknown
            this.device = 1 /* Computer */;
        }
        // Detect Browser
        if (ua.indexOf("silk/") >= 0) {
            this.browser = 10 /* Silk */;
            this.browserVersion = getVer("silk/");
        }
        else if (ua.indexOf("[fban/") >= 0 || ua.indexOf("[fb_iab/") >= 0) {
            this.browser = 9 /* Facebook */;
            this.browserVersion = getVer("fbav/");
        }
        else if (ua.indexOf("edge") >= 0) {
            this.browser = 4 /* Edge */;
            this.browserVersion = getVer("edge/");
        }
        else if (ua.indexOf("edg") >= 0) {
            this.browser = 11 /* EdgeChromium */;
            this.browserVersion = getVer("edg/");
        }
        else if (ua.indexOf("firefox") >= 0) {
            this.browser = 2 /* Firefox */;
            this.browserVersion = getVer("firefox/");
        }
        else if (ua.indexOf("opr/") >= 0) {
            this.browser = 6 /* Opera */;
            this.browserVersion = getVer("opr/");
        }
        else if (ua.indexOf("opera") >= 0) {
            this.browser = 6 /* Opera */;
            this.browserVersion = getVer("opera/");
        }
        else if (ua.indexOf("vivaldi") >= 0) {
            this.browser = 7 /* Vivaldi */;
            this.browserVersion = getVer("vivaldi/");
        }
        else if (ua.indexOf("samsungbrowser") >= 0) {
            this.browser = 8 /* Samsung */;
            this.browserVersion = getVer("samsungbrowser/");
        }
        else if (ua.indexOf("chrome") >= 0) {
            this.browser = 1 /* Chrome */;
            this.browserVersion = getVer("chrome/");
        }
        else if (this.os === 4 /* AppleiOS */ && ua.indexOf("crios") >= 0) {
            this.browser = 1 /* Chrome */;
            this.browserVersion = getVer("crios/");
        }
        else if (this.os === 4 /* AppleiOS */ && ua.indexOf("fxios") >= 0) {
            this.browser = 2 /* Firefox */;
            this.browserVersion = getVer("fxios/");
        }
        else if (this.os === 4 /* AppleiOS */ && ua.indexOf("safari") >= 0 && ua.indexOf("version/") >= 0) {
            this.browser = 3 /* Safari */;
            this.browserVersion = getVer("version/");
        }
        else if (this.os === 2 /* Mac */ && ua.indexOf("safari") >= 0 && ua.indexOf("version/") >= 0) {
            this.browser = 3 /* Safari */;
            this.browserVersion = getVer("version/");
        }
        else if (ua.indexOf("msie") >= 0) {
            // Older 9 / 10
            this.browser = 5 /* IE */;
            this.browserVersion = getVer("msie ");
        }
        else if (ua.indexOf("trident/") >= 0) {
            // IE 11
            this.browser = 5 /* IE */;
            this.browserVersion = getVer("rv:");
        }
        else {
            this.browser = 0 /* Unknown */;
            this.browserVersion = new Version();
        }
    }
    return class_1;
}()))();
/** @file GameWindow.ts */
// tslint:disable-next-line: typedef
var GameWindow = new (/** @class */ (function () {
    function class_2() {
        this.onResized = new DelegateEvent();
        this.element = null;
        this.width = 1;
        this.height = 1;
        this.pixelRatio = 1;
        this._dirty = true;
        this.window_resize = this.window_resize.bind(this);
    }
    class_2.prototype.initialize = function () {
        window.addEventListener("resize", this.window_resize);
        this.element = document.getElementById("game");
        this.beginFrame();
    };
    class_2.prototype.beginFrame = function () {
        if (this._dirty) {
            this._dirty = false;
            var rect = this.element.getBoundingClientRect(); // causes a dom reflow, use sparingly
            var pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : (screen.deviceXDPI && screen.logicalXDPI ? screen.deviceXDPI / screen.logicalXDPI : 1);
            var resized = this.width !== rect.width || this.height !== rect.height || this.pixelRatio !== pixelRatio;
            if (resized) {
                this.width = rect.width;
                this.height = rect.height;
                this.pixelRatio = pixelRatio;
                this.onResized.invoke();
            }
        }
    };
    class_2.prototype.window_resize = function () {
        this._dirty = true;
    };
    return class_2;
}()))();
/** @file KeyboardKey.ts */
/**
 * Internal interface for the KeyboardKey class.
 */
var KeyboardKey = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new keyboard key.
     * @param name The name of the key.
     * @sealed
     */
    function KeyboardKey(name) {
        //#region Events
        /** Fired when a key is pressed down. Fired AFTER the keyboard's event and only if the key state still matches. */
        this.onPress = new DelegateEvent();
        /** Fired when a key is repeated when pressed down. Fired AFTER the keyboard's event and only if the key state still matches. */
        this.onRepeat = new DelegateEvent();
        /** Fired when a key is released. Fired AFTER the keyboard's event. */
        this.onRelease = new DelegateEvent();
        /** Fired when a key press is canceled. Fired AFTER the keyboard's event. */
        this.onCancel = new DelegateEvent();
        //#endregion
        //#region Members
        /** Indicates if the mouse button is currently pressed. @readonly */
        this.isPressed = false;
        this.name = name;
    }
    //#endregion
    //#region Actions
    /**
     * Presses the key.
     * @internal
     */
    KeyboardKey.prototype.press = function (character, evt) {
        if (this.isPressed)
            return;
        this.isPressed = true;
        Keyboard.onPress.invoke(this, character, evt);
        if (this.isPressed)
            this.onPress.invoke(this, character, evt);
    };
    /**
     * Repeats the key.
     * @internal
     */
    KeyboardKey.prototype.repeat = function (character, evt) {
        if (!this.isPressed)
            return;
        this.isPressed = true;
        Keyboard.onRepeat.invoke(this, character, evt);
        if (this.isPressed)
            this.onRepeat.invoke(this, character, evt);
    };
    /**
     * Releases the key.
     * @internal
     */
    KeyboardKey.prototype.release = function (character, evt) {
        if (!this.isPressed)
            return;
        this.isPressed = false;
        Keyboard.onRelease.invoke(this, character, evt);
        this.onRelease.invoke(this, character, evt);
    };
    /**
     * Cancels a current press if any.
     */
    KeyboardKey.prototype.cancel = function () {
        if (!this.isPressed)
            return;
        this.isPressed = false;
        Keyboard.onCancel.invoke(this);
        this.onCancel.invoke(this);
    };
    return KeyboardKey;
}());
/** @file KeyboardKeySet.ts */
/// <reference path="KeyboardKey.ts" />
/** @file Keyboard.ts */
/// <reference path="KeyboardKeySet.ts" />
/**
 * AppComponent for working with keyboard input and state.
 * @staticclass
 */
// tslint:disable-next-line: typedef
var Keyboard = new (/** @class */ (function () {
    //#endregion
    //#region Constructor
    /** @inheritdoc */
    function class_3() {
        //#region Events
        /** fired when a keyboard key is pressed. */
        this.onPress = new DelegateEvent();
        /** fired when a keyboard key is repeated. */
        this.onRepeat = new DelegateEvent();
        /** fired when a keyboard key is released. */
        this.onRelease = new DelegateEvent();
        /** fired when a keyboard key is canceled. */
        this.onCancel = new DelegateEvent();
        //#endregion
        //#region Members
        /** The set of all keyboard keys. */
        this.keys = {};
        /** Map of lowercase KeyboardEvent::key values to Keys. */
        this._nameToKey = {};
        /** Array of all keys. @internal */
        this.keyList = [];
        // Bind
        this.reset = this.reset.bind(this); // Handles resetting events (blur, onFullscreenChange)
        this.target_keyDown = this.target_keyDown.bind(this);
        this.target_keyUp = this.target_keyUp.bind(this);
        // Init keys
        // If just a character, lowercase versions are added to the map, the single character is the prop name
        // If an array, lower case versions of each are added to the map, the first entry is the prop name
        var key, i, j, names, keyData = [
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
            ["Num0", "0"], ["Num1", "1"], ["Num2", "2"], ["Num3", "3"], ["Num4", "4"], ["Num5", "5"], ["Num6", "6"], ["Num7", "7"], ["Num8", "8"], ["Num9", "9"],
            ["Left", "ArrowLeft"], ["Up", "ArrowUp"], ["Right", "ArrowRight"], ["Down", "ArrowDown"],
            "PageUp", "PageDown",
            "Home", "End",
            "Shift",
            "Tab",
            ["Space", " "],
            "Enter",
            ["Escape", "Esc"],
            "Backspace",
            "Delete",
            "CapsLock",
            ["Ctrl", "Control"],
            "Alt",
            "OS",
            ["Tilde", "`", "~"],
            ["Backslash", "\\", "|"]
            //"F11"						// Reserved for toggling fullscreen
        ];
        for (i = 0; i < keyData.length; ++i) {
            names = typeof keyData[i] === "string" ? [keyData[i]] : keyData[i]; // convert to array if just a single string
            this.keys[names[0]] = key = new KeyboardKey(names[0]); // create and assign to prop
            for (j = 0; j < names.length; ++j)
                this._nameToKey[names[j].toLowerCase()] = key; // add to map under all names
            this.keyList.push(key); // add to list
        }
    }
    //#endregion
    //#region App Component
    /** @inheritdoc @internal */
    class_3.prototype.initialize = function () {
        // Grab the target
        this._target = GameWindow.element;
        // Start watching for input
        this._target.addEventListener("keydown", this.target_keyDown);
        this._target.addEventListener("keyup", this.target_keyUp);
        // Start watching for resetting events
        this._target.addEventListener("blur", this.reset);
        App.onFullscreenChange.add(this.reset, this);
    };
    /** @inheritdoc @internal */
    class_3.prototype.deactivate = function () {
        // Cancel all key presses
        this.reset();
    };
    /** @inheritdoc @internal */
    class_3.prototype.dispose = function () {
        // Stop watching for resetting events
        this._target.removeEventListener("blur", this.reset);
        App.onFullscreenChange.remove(this.reset, this);
        // Stop watching for input
        this._target.removeEventListener("keydown", this.target_keyDown);
        this._target.removeEventListener("keyup", this.target_keyUp);
        // Drop the target
        this._target = null;
    };
    //#endregion
    //#region Actions
    /**
     * Cancels all current key presses.
     */
    class_3.prototype.reset = function () {
        for (var i = 0; i < this.keyList.length; ++i)
            this.keyList[i].cancel();
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles key presses and repeats.
     * @param evt The key event.
     */
    class_3.prototype.target_keyDown = function (evt) {
        if (!App.isActive || evt.key === undefined)
            return; // KeyboardEvent::key isn't 100% supported
        var key = this._nameToKey[evt.key.toLowerCase()];
        if (key) {
            if (key.isPressed) {
                key.repeat(evt.key, evt);
            }
            else {
                if (key.onPress.count > 0)
                    evt.stopImmediatePropagation(); // I think this is here to prevent the page from handling presses the game is handling
                key.press(evt.key, evt);
            }
        }
    };
    /**
     * Handles key releases.
     * @param evt The key event.
     */
    class_3.prototype.target_keyUp = function (evt) {
        if (!App.isActive || evt.key === undefined)
            return; // KeyboardEvent::key isn't 100% supported
        var key = this._nameToKey[evt.key.toLowerCase()];
        if (key && key.isPressed) {
            key.release(evt.key, evt);
        }
    };
    return class_3;
}()))();
/** @file Cursor.ts */
/** @file MouseButton.ts */
/**
 * Wraps a mouse button.
 */
var MouseButton = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /** @sealed */
    function MouseButton() {
        //#region Events
        /** Fired when a mouse button is pressed down. Fired AFTER the mouse's event and only if state hasn't changed. */
        this.onPress = new DelegateEvent();
        /** Fired when a mouse button is released. Fired AFTER the mouse's event. */
        this.onRelease = new DelegateEvent();
        /** Fired when a mouse button press is canceled. Fired AFTER the mouse's event. */
        this.onCancel = new DelegateEvent();
        //#endregion
        //#region Members
        /** Indicates if the mouse button is currently pressed. @readonly */
        this.isPressed = false;
    }
    //#endregion
    //#region Actions
    /**
     * Presses the mouse button.
     * @internal
     */
    MouseButton.prototype.press = function () {
        if (this.isPressed)
            return;
        this.isPressed = true;
        Mouse.onPress.invoke(this);
        if (this.isPressed)
            this.onPress.invoke(this);
    };
    /**
     * Releases the mouse button.
     * @internal
     */
    MouseButton.prototype.release = function () {
        if (!this.isPressed)
            return;
        this.isPressed = false;
        Mouse.onRelease.invoke(this);
        this.onRelease.invoke(this);
    };
    /**
     * Cancels a current press if any.
     */
    MouseButton.prototype.cancel = function () {
        if (!this.isPressed)
            return;
        this.isPressed = false;
        Mouse.onCancel.invoke(this);
        this.onCancel.invoke(this);
    };
    return MouseButton;
}());
/** @file MouseWheel.ts */
/**
 * Wraps mouse wheel input.
 */
var MouseWheel = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /** @sealed */
    function MouseWheel() {
        //#region Events
        /** Fired when the wheel is scrolled. Fired AFTER the mouse's event and only if not reset. */
        this.onScroll = new DelegateEvent();
        /** Fired when the wheel scroll is reset. Fired AFTER the mouse's event and only if not reset. */
        this.onScrollReset = new DelegateEvent();
        //#endregion
        //#region Members
        /** Indicates if mouse wheel scroll is prevented when the game canvas has focus. Default False. */
        this.lock = true;
        /** The amount the wheel is scrolled, positive numebrs means down, negative is up. Note that wheel scroll requires canvas focus just like keyboard. @readonly */
        this.scroll = 0;
        /** Helper to track when the wheel is in a reset state */
        this._reset = true;
    }
    //#endregion
    //#region Actions
    /**
     * Scrolls the mouse wheel down.
     * @param delta The amount to scroll the mouse wheel down. Should be positive.
     * @param evt The wheel event so prevent default can be called if needed.
     * @internal
     */
    MouseWheel.prototype.down = function (delta, evt) {
        this._reset = false;
        this.scroll += delta;
        Mouse.onScroll.invoke(this, delta, evt);
        if (!this._reset)
            this.onScroll.invoke(this, delta, evt);
    };
    /**
     * Scrolls the mouse wheel up.
     * @param delta The amount to scroll the mouse wheel up. Should be negative.
     * @internal
     */
    MouseWheel.prototype.up = function (delta, evt) {
        this._reset = false;
        this.scroll -= delta;
        Mouse.onScroll.invoke(this, delta, evt);
        if (!this._reset)
            this.onScroll.invoke(this, delta, evt);
    };
    /**
     * Resets the total amount of scroll of the mouse wheel.
     */
    MouseWheel.prototype.reset = function () {
        this._reset = true;
        this.scroll = 0;
        Mouse.onScrollReset.invoke(this);
        this.onScrollReset.invoke(this);
    };
    return MouseWheel;
}());
/** @file Mouse.ts */
/// <reference path="Cursor.ts" />
/// <reference path="MouseButton.ts" />
/// <reference path="MouseWheel.ts" />
/**
 * AppComponent for working with mouse input and state.
 * QUIRKS:
 * - the mouse position and over state may be invalid if the game window size/position changes or fullscreen changes
 * - the local mouse position is close, but not 100% accurate because its backed into using clientX/Y to avoid DOM reflows
 * @staticclass
 */
// tslint:disable-next-line: typedef
var Mouse = new (/** @class */ (function () {
    //#endregion
    //#region Constructor
    /** @inheritdoc */
    function class_4() {
        //#region Events
        /** Fire when the mouse enters the game element. */
        this.onOver = new DelegateEvent();
        /** Fire when the mouse moves. */
        this.onMove = new DelegateEvent();
        /** Fire when the mouse leaves the game element. */
        this.onOut = new DelegateEvent();
        /** Fired when a mouse button is pressed down. Fired BEFORE the button's event. */
        this.onPress = new DelegateEvent();
        /** Fired when a mouse button is released. Fired BEFORE the button's event. */
        this.onRelease = new DelegateEvent();
        /** Fired when a mouse button press is canceled. Fired BEFORE the button's event. */
        this.onCancel = new DelegateEvent();
        /** Fired when the wheel is scrolled. Fired BEFORE the wheel's event. */
        this.onScroll = new DelegateEvent();
        /** Fired when the wheel scroll is reset. Fired BEFORE the wheel's event. */
        this.onScrollReset = new DelegateEvent();
        //#endregion
        //#region Members
        /** The x (int) position of the mouse over canvas, in canvas coordinates. @readonly */
        this.x = -1;
        /** The y (int) position of the mouse over canvas, in canvas coordinates. @readonly */
        this.y = -1;
        /** Indicates if the mouse is currently over the game. @readonly */
        this.isOver = false;
        /** The left (primary) mouse button. */
        this.left = new MouseButton();
        /** The right (secondary) mouse button. */
        this.right = new MouseButton();
        /** The middle (auxilery) mouse button. */
        this.middle = new MouseButton();
        /** The mouse wheel. */
        this.wheel = new MouseWheel();
        /** Array of mouse buttons to work with. */
        this.buttons = [this.left, this.middle, this.right];
        // Bind
        this.target_move = this.target_move.bind(this);
        this.target_button = this.target_button.bind(this);
        this.target_wheel = this.target_wheel.bind(this);
        this.window_mouseUp = this.window_mouseUp.bind(this);
    }
    //#endregion
    //#region App Component
    /** @inheritdoc @internal */
    class_4.prototype.initialize = function () {
        // Grab the target
        this._target = GameWindow.element;
        // Start watching for input
        for (var _i = 0, _a = ["mouseover", "mousemove", "mouseout"]; _i < _a.length; _i++) {
            var evt = _a[_i];
            this._target.addEventListener(evt, this.target_move, { capture: true, passive: true });
        }
        for (var _b = 0, _c = ["mousedown", "mouseup"]; _b < _c.length; _b++) {
            var evt = _c[_b];
            this._target.addEventListener(evt, this.target_button, { capture: true, passive: true });
        }
        this._target.addEventListener("wheel", this.target_wheel, { capture: true, passive: false }); // Not passive because we want to be able to stop the wheel from scrolling the page if wheel.lock is set
        window.addEventListener("mouseup", this.window_mouseUp); // Catches mouse ups when not over the canvas
    };
    /** @inheritdoc @internal */
    class_4.prototype.deactivate = function () {
        // Force release all buttons
        this.reset();
    };
    /** @inheritdoc @internal */
    class_4.prototype.dispose = function () {
        // Stop watching for input
        for (var _i = 0, _a = ["mouseover", "mousemove", "mouseout"]; _i < _a.length; _i++) {
            var evt = _a[_i];
            this._target.removeEventListener(evt, this.target_move, { capture: true, passive: true });
        }
        for (var _b = 0, _c = ["mousedown", "mouseup"]; _b < _c.length; _b++) {
            var evt = _c[_b];
            this._target.removeEventListener(evt, this.target_button, { capture: true, passive: true });
        }
        this._target.removeEventListener("wheel", this.target_wheel, { capture: true, passive: false }); // Not passive because we want to be able to stop the wheel from scrolling the page if wheel.lock is set
        window.removeEventListener("mouseup", this.window_mouseUp); // Catches mouse ups when not over the canvas
        // Drop the target
        this._target = null;
    };
    //#endregion
    //#region Actions
    /**
     * Cancels all mouse button presses and resets the mouse position.
     */
    class_4.prototype.reset = function () {
        // Cancel button presses
        for (var i = 0; i < this.buttons.length; ++i)
            this.buttons[i].cancel();
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles mouse movement related events (mouseover, mouseout, mousemove).
     * Also called privately to move the mouse to the correct position before handling button and scroll events.
     * @param evt The mouse event.
     */
    class_4.prototype.target_move = function (evt) {
        if (!App.isActive)
            return;
        // Store old state so we can calculate changes
        var oldX = this.x, oldY = this.y, oldOver = this.isOver, forceMove = false;
        // Update state
        this.x = Math.round((evt.clientX - Stage.cssRect.x) * GameWindow.pixelRatio);
        this.y = Math.round((evt.clientY - Stage.cssRect.y) * GameWindow.pixelRatio);
        this.isOver = evt.type !== "mouseout" && (this.x >= 0 && this.x < Stage.width && this.y >= 0 && this.y < Stage.height); // force out on mouseout event
        // Process Over
        if (!oldOver && this.isOver) {
            // Whenever we have a new enter, we should consider the move to be a 0 delta move to avoid massive movement deltas
            oldX = this.x;
            oldY = this.y;
            forceMove = true;
            if (this.onOver.count)
                this.onOver.invoke();
        }
        // Process Move
        if ((forceMove || (oldX !== this.x || oldY !== this.y)) && this.onMove.count)
            this.onMove.invoke(this.x - oldX, this.y - oldY);
        // Process Left
        if (oldOver && !this.isOver && this.onOut.count) {
            this.onOut.invoke();
        }
        // Stop propagation
        evt.stopPropagation();
    };
    /**
     * Handles mouse button related events (mousedown, mouseup).
     * @param evt The mouse event.
     */
    class_4.prototype.target_button = function (evt) {
        if (!App.isActive)
            return;
        // Simulate a move to the correct location because the mouse position may be invalid as a move event may have never fired
        this.target_move(evt);
        // Perform the button action
        if (evt.button < this.buttons.length) {
            var button = this.buttons[evt.button];
            if (evt.type === "mousedown") {
                if (this.isOver)
                    button.press();
            }
            else {
                if (this.isOver)
                    button.release();
                else
                    button.cancel();
            }
        }
    };
    /**
     * Handles mouse wheel related events (wheel).
     * @param evt The wheel event.
     */
    class_4.prototype.target_wheel = function (evt) {
        if (!App.isActive)
            return;
        // Mouse wheel events require focus
        if (document.activeElement !== undefined && document.activeElement !== this._target)
            return; // document.activeElement is not universally supported, will be undefined if unsupported and will be null/body if no selected element
        // Simulate a move to the correct location because the mouse position may be invalid as a move event may have never fired
        this.target_move(evt);
        // Perform the scroll action
        if (this.isOver) {
            if (evt.deltaY > 0)
                this.wheel.down(1, evt);
            else
                this.wheel.up(1, evt);
            // Prevent default if requested
            if (this.wheel.lock)
                evt.preventDefault();
        }
    };
    /**
     * Handles when the mouse is released at any time, over the target or not so we can catch cancel releases.
     * NOTE: this must be called AFTER the target events, so ensure that captures are set up properly.
     * @param evt The mouse event.
     */
    class_4.prototype.window_mouseUp = function (evt) {
        if (evt.button < this.buttons.length)
            this.buttons[evt.button].cancel();
    };
    return class_4;
}()))();
/** @file TouchPoint.ts */
/**
 * TouchPoint internal implementation.
 */
var TouchPoint = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new TouchPoint.
     * @param index The index of the touch point in the touchscreen touch point list.
     * @sealed
     */
    function TouchPoint(index) {
        //#region Events
        /** Fired when the touch point is pressed. */
        this.onPress = new DelegateEvent();
        /** Fired when the touch point moves. */
        this.onMove = new DelegateEvent();
        /** Fired when the touch point is released. */
        this.onRelease = new DelegateEvent();
        /** Fired when the touch point is canceled. */
        this.onCancel = new DelegateEvent();
        /** The last known x position of the touch point in canvas coords. @readony */
        this.x = 0;
        /** The last known y position of the touch point in canvas coords. @readony */
        this.y = 0;
        /** Indicates if this touch point is currently pressed or not. @readonly */
        this.isPressed = false;
        /** The system identifier of this touch point. Should be undefined when the touch point is not active. @internal */
        this.identifier = undefined;
        this.index = index;
    }
    //#endregion
    //#region Actions
    /**
     * Handles when a touch point is pressed.
     * @internal
     */
    TouchPoint.prototype.press = function () {
        if (this.isPressed)
            return;
        this.isPressed = true;
        if (this.onPress.count)
            this.onPress.invoke(this);
    };
    /**
     * Handles when a touch point is moved.
     * @param x The touch point x position in canvas space.
     * @param y The touch point y position in canvas space.
     * @internal
     */
    TouchPoint.prototype.move = function (x, y) {
        if (this.x !== x || this.y !== y) {
            var dx = x - this.x;
            var dy = y - this.y;
            this.x = x;
            this.y = y;
            if (this.isPressed && this.onMove.count)
                this.onMove.invoke(this, dx, dy);
        }
    };
    /**
     * Handles when a touch point is released.
     * @internal
     */
    TouchPoint.prototype.release = function () {
        this.identifier = undefined;
        if (!this.isPressed)
            return;
        this.isPressed = false;
        if (this.onRelease.count)
            this.onRelease.invoke(this);
    };
    /**
     * Cancels the current press if any.
     */
    TouchPoint.prototype.cancel = function () {
        this.identifier = undefined;
        if (!this.isPressed)
            return;
        this.isPressed = false;
        if (this.onCancel.count)
            this.onCancel.invoke(this);
    };
    return TouchPoint;
}());
/** @file TouchScreen.ts */
/// <reference path="TouchPoint.ts" />
/**
 * Provides an interface for working with touch input.
 * @staticclass
 */
// tslint:disable-next-line: typedef
var TouchScreen = new (/** @class */ (function () {
    //#endregion
    //#region Constructor
    /** @inheritdoc */
    function class_5() {
        // Bind functions
        this.reset = this.reset.bind(this); // used to reset state on blur / fullscreen change
        this.target_touchEvt = this.target_touchEvt.bind(this);
        this.target_touchCancel = this.target_touchCancel.bind(this);
        // Init touch points
        var maxTouchPoints = 10;
        if (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints !== null && navigator.maxTouchPoints !== 0)
            maxTouchPoints = navigator.maxTouchPoints;
        else if (navigator.msMaxTouchPoints !== undefined && navigator.msMaxTouchPoints !== null && navigator.msMaxTouchPoints !== 0)
            maxTouchPoints = navigator.msMaxTouchPoints;
        // tslint:disable-next-line: no-console
        else
            console.info("Max touch points undefined, defaulting to 10.");
        var points = [];
        for (var i = 0; i < maxTouchPoints; ++i)
            points.push(new TouchPoint(i));
        this.points = points;
    }
    //#endregion
    //#region App Component
    /** @inheritdoc @internal */
    class_5.prototype.initialize = function () {
        // Grab the target
        this._target = GameWindow.element;
        // Start watching for input
        this._target.addEventListener("touchstart", this.target_touchEvt, { capture: true, passive: false });
        this._target.addEventListener("touchmove", this.target_touchEvt, { capture: true, passive: true });
        this._target.addEventListener("touchend", this.target_touchEvt, { capture: true, passive: false });
        this._target.addEventListener("touchcancel", this.target_touchCancel);
        // Start watching for resetting events
        this._target.addEventListener("blur", this.reset);
        App.onFullscreenChange.add(this.reset, this);
    };
    /** @inheritdoc @internal */
    class_5.prototype.deactivate = function () {
        // Cancel all touches
        this.reset();
    };
    /** @inheritdoc @internal */
    class_5.prototype.dispose = function () {
        // Stop watching for resetting events
        this._target.removeEventListener("blur", this.reset);
        App.onFullscreenChange.remove(this.reset, this);
        // Stop watching for input
        this._target.removeEventListener("touchstart", this.target_touchEvt, { capture: true, passive: false });
        this._target.removeEventListener("touchmove", this.target_touchEvt, { capture: true, passive: true });
        this._target.removeEventListener("touchend", this.target_touchEvt, { capture: true, passive: false });
        this._target.removeEventListener("touchcancel", this.target_touchCancel);
        // Drop the target
        this._target = null;
    };
    //#endregion
    //#region Actions
    /**
     * Cancels all touchscreen touch points.
     */
    class_5.prototype.reset = function () {
        for (var i = 0; i < this.points.length; ++i)
            this.points[i].cancel();
    };
    //#endregion
    //#region Helpers
    /**
     * Returns a TouchPoint for the given identifier.
     * @param identifier The system assigned identifier of the touch point.
     * @return The appropriate touch point.
     */
    class_5.prototype.fetch = function (identifier) {
        var point = null;
        var empty = null;
        // Iterate over the touch point list finding one that has a matching identifier and the first "empty" touch point
        for (var i = 0; i < this.points.length; ++i) {
            if (this.points[i].identifier === identifier) {
                point = this.points[i];
                break;
            }
            else if (empty === null && this.points[i].identifier === undefined) {
                empty = this.points[i];
            }
        }
        if (point === null && empty !== null) {
            point = empty;
            point.identifier = identifier;
        }
        return point;
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles touch action events (touchstart, touchmove, touchend)
     * @param evt The touch event.
     */
    class_5.prototype.target_touchEvt = function (evt) {
        if (!App.isActive)
            return;
        var touchList = evt.changedTouches;
        for (var i = 0; i < touchList.length; ++i) {
            var touch = touchList[i];
            var touchPoint = this.fetch(touch.identifier);
            if (touchPoint) {
                touchPoint.move(Math.round((touch.clientX - Stage.cssRect.x) * GameWindow.pixelRatio), Math.round((touch.clientY - Stage.cssRect.y) * GameWindow.pixelRatio));
                if (evt.type === "touchstart")
                    touchPoint.press();
                else if (evt.type === "touchend")
                    touchPoint.release();
            }
        }
        if (evt.type === "touchstart") {
            //if (!GameWindow.allowPageScrolling && evt.cancelable) evt.preventDefault();	// Prevent scrolling and gestures, we only want to do this if expanded or expansion in not required in the current state
        }
        else if (evt.type === "touchend") {
            if (evt.cancelable)
                evt.preventDefault(); // Prevent mouse emulation
            evt.stopPropagation(); // Prevent page from seeing the touch end?
        }
    };
    /**
     * Handles when a touch is canceled.
     * @param evt The touch event.
     */
    class_5.prototype.target_touchCancel = function (evt) {
        var touchList = evt.changedTouches;
        for (var i = 0; i < touchList.length; ++i) {
            var touch = touchList[i];
            var touchPoint = this.fetch(touch.identifier);
            if (touchPoint)
                touchPoint.cancel();
        }
    };
    return class_5;
}()))();
/** @file Pointer.ts */
/// <reference path="../../lang/lang.ts" />
/// <reference path="../../lang/delegate/DelegateEvent.ts" />
/** Pointer internal implementation. */
var Pointer = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new Pointer.
     * @param index The index of this pointer in the pointinputs's pointer list.
     * @internal
     */
    function Pointer(index) {
        //#region Events
        /** Fired when the pointer is pressed. */
        this.onPress = new DelegateEvent();
        /** Fired when the pointer moves. */
        this.onMove = new DelegateEvent();
        /** Fired when the pointer is released. */
        this.onRelease = new DelegateEvent();
        /** Fired when the pointer is canceled. */
        this.onCancel = new DelegateEvent();
        /** Fired when this pointer is marked present. */
        this.onPresent = new DelegateEvent();
        /** Fired when this pointer is marked NOT present. */
        this.onAbsent = new DelegateEvent();
        /** The last known x position of the pointer in canvas coords. @readonly */
        this.x = 0;
        /** The last known y position of the pointer in canvas coords. @readonly */
        this.y = 0;
        /** Indicates if this pointer is currently pressed. @readonly */
        this.isPressed = false;
        /** Indicates if this pointer is currently considered present. @readonly */
        this.isPresent = false;
        this.index = index;
    }
    //#endregion
    //#region Actions
    /**
     * Handles when this pointer comes present.
     * @internal
     */
    Pointer.prototype.present = function () {
        if (this.isPresent)
            return;
        this.isPresent = true;
        this.onPresent.invoke(this);
    };
    /**
     * Handles when this pointer goes absent.
     * @internal
     */
    Pointer.prototype.absent = function () {
        if (!this.isPresent)
            return;
        this.isPresent = false;
        this.onAbsent.invoke(this);
    };
    /**
     * Handles when this pointer is pressed.
     * @internal
     */
    Pointer.prototype.press = function () {
        if (this.isPressed)
            return;
        this.isPressed = true;
        this.onPress.invoke(this);
    };
    /**
     * Handles when this pointer is moved.
     * @param x The x position in canvas space.
     * @param y The y position in canvas space.
     * @internal
     */
    Pointer.prototype.move = function (x, y) {
        if (this.x !== x || this.y !== y) {
            var dx = x - this.x;
            var dy = y - this.y;
            this.x = x;
            this.y = y;
            this.onMove.invoke(this, dx, dy);
        }
    };
    /**
     * Handles when this pointer is released.
     * @internal
     */
    Pointer.prototype.release = function () {
        if (!this.isPressed)
            return;
        this.isPressed = false;
        this.onRelease.invoke(this);
    };
    /**
     * Cancels the current press if any.
     */
    Pointer.prototype.cancel = function () {
        if (!this.isPressed)
            return;
        this.isPressed = false;
        this.onCancel.invoke(this);
    };
    return Pointer;
}());
/** @file PointerInput.ts */
/// <reference path="Pointer.ts" />
/**
 * AppComponent for working with unified mouse & touch "pointer" input and state.
 * The first pointing device (touch point 0 or mouse) to be pressed is given active control if it is available
 * Mouse has "passive" control otherwise
 * @staticclass
 */
// tslint:disable-next-line: typedef
var PointerInput = new (/** @class */ (function () {
    //#endregion
    //#region Constructor
    /** @inheritdoc */
    function class_6() {
        this._mouseControl = false;
        this._touchPointControl = false;
        // Create pointers
        var pointers = [];
        pointers.push(new Pointer(0));
        for (var i = 1; i < TouchScreen.points.length; ++i)
            pointers.push(new Pointer(i));
        this.pointers = pointers;
        this.primary = this.pointers[0];
    }
    //#endregion
    //#region App Component
    /** @inheritdoc @internal */
    class_6.prototype.initialize = function () {
        // Start watching for input events
        Mouse.onMove.add(this.Mouse_onMove, this);
        Mouse.left.onPress.add(this.Mouse_left_onPress, this);
        Mouse.left.onRelease.add(this.Mouse_left_onRelease, this);
        Mouse.left.onCancel.add(this.Mouse_left_onCancel, this);
        Mouse.onOver.add(this.Mouse_onOver, this);
        Mouse.onOut.add(this.Mouse_onOut, this);
        for (var i = 0; i < TouchScreen.points.length; ++i) {
            TouchScreen.points[i].onPress.add(this.touchPoint_onPress, this);
            TouchScreen.points[i].onMove.add(this.touchPoint_onMove, this);
            TouchScreen.points[i].onRelease.add(this.touchPoint_onRelease, this);
            TouchScreen.points[i].onCancel.add(this.touchPoint_onCancel, this);
        }
        // The mouse should immediately pickup passive control
        if (Mouse.isOver) {
            this.primary.move(Mouse.x, Mouse.y);
            this.primary.present();
        }
        else {
            this.primary.absent();
        }
    };
    /** @inheritdoc @internal */
    class_6.prototype.dispose = function () {
        // Stop watching for input events
        Mouse.onMove.remove(this.Mouse_onMove, this);
        Mouse.left.onPress.remove(this.Mouse_left_onPress, this);
        Mouse.left.onRelease.remove(this.Mouse_left_onRelease, this);
        Mouse.left.onCancel.remove(this.Mouse_left_onCancel, this);
        Mouse.onOver.remove(this.Mouse_onOver, this);
        Mouse.onOut.remove(this.Mouse_onOut, this);
        for (var i = 0; i < TouchScreen.points.length; ++i) {
            TouchScreen.points[i].onPress.remove(this.touchPoint_onPress, this);
            TouchScreen.points[i].onMove.remove(this.touchPoint_onMove, this);
            TouchScreen.points[i].onRelease.remove(this.touchPoint_onRelease, this);
            TouchScreen.points[i].onCancel.remove(this.touchPoint_onCancel, this);
        }
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles a mouse move.
     * @param dx The x move delta.
     * @param dy The y move delta.
     */
    class_6.prototype.Mouse_onMove = function (dx, dy) {
        // TODO: FUTURE- This doesn't handle massive movement deltas well
        // Mouse is a passive controller so it will update the pointer any time the touch screen isn't in control
        if (!this._touchPointControl) {
            // Update
            this.primary.move(Mouse.x, Mouse.y);
        }
    };
    /**
     * Handles when the mouse leaves the canvas.
     */
    class_6.prototype.Mouse_onOver = function () {
        // TODO: FUTURE- This would force a drop of the mouse leaves the game window, maybe want to add something to check if the mouse is down
        if (!this._touchPointControl) {
            this.primary.present();
        }
    };
    /**
     * Handles when the mouse enters the canvas.
     */
    class_6.prototype.Mouse_onOut = function () {
        if (!this._touchPointControl) {
            this.primary.absent();
        }
    };
    /**
     * Handles left mouse button presses.
     * @param button The left mouse button.
     */
    class_6.prototype.Mouse_left_onPress = function (button) {
        // The mouse can only gain control if the pointer is not in control
        if (!this._touchPointControl) {
            // Gain control
            this._mouseControl = true;
            // Update
            this.primary.move(Mouse.x, Mouse.y);
            this.primary.press();
        }
    };
    /**
     * Handles left mouse button releases.
     * @param button The left mouse button.
     */
    class_6.prototype.Mouse_left_onRelease = function (button) {
        // Only handle mouse releases if under mouse control
        if (this._mouseControl) {
            // Lose control
            this._mouseControl = false;
            // Update
            this.primary.move(Mouse.x, Mouse.y);
            this.primary.release();
        }
    };
    /**
     * Handles left mouse button cancels.
     * @param button The left mouse button.
     */
    class_6.prototype.Mouse_left_onCancel = function (button) {
        // Only handle mouse cancels if under mouse control
        if (this._mouseControl) {
            // Lose control
            this._mouseControl = false;
            // Update
            this.primary.move(Mouse.x, Mouse.y);
            this.primary.cancel();
        }
    };
    /**
     * Handles a touch point press.
     * @param touchPoint The touch point.
     */
    class_6.prototype.touchPoint_onPress = function (touchPoint) {
        if (touchPoint.index > 0) {
            this.pointers[touchPoint.index].move(touchPoint.x, touchPoint.y);
            this.pointers[touchPoint.index].present();
            this.pointers[touchPoint.index].press();
        }
        else {
            // If the touch point is not under mouse control, then the touch can take it
            if (!this._mouseControl) {
                // Take control
                this._touchPointControl = true;
                // Move
                this.primary.move(touchPoint.x, touchPoint.y);
                this.primary.present();
                this.primary.press();
            }
        }
    };
    /**
     * Handles touch point moves.
     * @param touchPoint The touch point.
     * @param dx The x movement delta.
     * @param dy The y movement delta.
     */
    class_6.prototype.touchPoint_onMove = function (touchPoint, dx, dy) {
        if (touchPoint.index > 0) {
            this.pointers[touchPoint.index].move(touchPoint.x, touchPoint.y);
        }
        else {
            // Only move if the mouse isn't the active or passive controller
            if (this._touchPointControl) {
                this.primary.move(touchPoint.x, touchPoint.y);
            }
        }
    };
    /**
     * Handles a touch point release.
     * @param touchPoint The touch point.
     */
    class_6.prototype.touchPoint_onRelease = function (touchPoint) {
        if (touchPoint.index > 0) {
            this.pointers[touchPoint.index].move(touchPoint.x, touchPoint.y);
            this.pointers[touchPoint.index].release();
            this.pointers[touchPoint.index].absent();
        }
        else {
            // Only handle releases if we are under control by the touch point
            if (this._touchPointControl) {
                // Lose control
                this._touchPointControl = false;
                // Update
                this.primary.move(touchPoint.x, touchPoint.y);
                this.primary.release();
                // Revert to mouse position or behave as a touch point
                if (Mouse.isOver) {
                    this.primary.move(Mouse.x, Mouse.y);
                }
                else {
                    this.primary.absent();
                }
            }
        }
    };
    /**
     * Handles a touch point cancel.
     * @param touchPoint The touch point.
     */
    class_6.prototype.touchPoint_onCancel = function (touchPoint) {
        if (touchPoint.index > 0) {
            this.pointers[touchPoint.index].move(touchPoint.x, touchPoint.y);
            this.pointers[touchPoint.index].cancel();
            this.pointers[touchPoint.index].absent();
        }
        else {
            // Only handle cancels if we are under control by the touch point
            if (this._touchPointControl) {
                // Lose control
                this._touchPointControl = false;
                // Update
                this.primary.move(touchPoint.x, touchPoint.y);
                this.primary.cancel();
                // Revert to mouse position or behave as a touch point
                if (Mouse.isOver) {
                    this.primary.move(Mouse.x, Mouse.y);
                }
                else {
                    this.primary.absent();
                }
            }
        }
    };
    return class_6;
}()))();
/** @file SoundState.ts */
/** @file SoundCategory.ts */
/**
 * A category that a sound can be part of.
 * Entire categories can have volume or mute modifiers.
 */
var SoundCategory = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new sound category.
     * @param name The name of the category.
     * @internal
     */
    function SoundCategory(name) {
        this._volume = 1;
        this._isMuted = false;
        this.name = name;
    }
    Object.defineProperty(SoundCategory.prototype, "volume", {
        /** The volume modifier of the category [0-1]. */
        get: function () { return this._volume; },
        set: function (v) { this.updateVolume(v); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundCategory.prototype, "isMuted", {
        /** The mute modifier of the category. */
        get: function () { return this._isMuted; },
        set: function (v) { this.updateMute(v); },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Helpers
    /**
     * Updates the volume of the category. Triggering updates on all sounds in the category.
     * @param v The new volume.
     */
    SoundCategory.prototype.updateVolume = function (v) {
        v = Math.min(Math.max(0, v), 1);
        if (this._volume === v)
            return;
        this._volume = v;
        SoundManager.updateSoundVolumes();
    };
    /**
     * Updates the mute setting of the category. Triggering updates on all sounds in the category.
     * @param v The new mute setting.
     */
    SoundCategory.prototype.updateMute = function (v) {
        if (this._isMuted === v)
            return;
        this._isMuted = v;
        SoundManager.updateSoundVolumes();
    };
    return SoundCategory;
}());
/** @file SoundData.ts */
/**
 * Defines the data required to create a sound.
 */
var SoundData = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new sound data instance.
     * @param buffer The audio playback buffer / tag.
     * @internal
     */
    function SoundData(buffer) {
        this._volume = 1;
        /** The default looped state of sounds created from this data. */
        this.isLooped = false;
        this.buffer = buffer;
        this.duration = this.buffer.duration * 1000;
    }
    Object.defineProperty(SoundData.prototype, "volume", {
        //#region Members
        /** The default volume of sounds created from this data [0-1]. */
        get: function () { return this._volume; },
        set: function (v) { this._volume = Math.max(Math.min(v, 1), 0); },
        enumerable: true,
        configurable: true
    });
    return SoundData;
}());
/** @file Sound.ts */
/**
 * The usable form of Sound data, like Bitmap to BitmapData. Used to playback sounds.
 */
var Sound = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new sound.
     * @param data The sound data to play back.
     * @param category The category to play back with.
     */
    function Sound(data, category) {
        if (category === void 0) { category = "default"; }
        //#region Events
        /** Invoke when a sound has completely finished playing a pass. Does NOT fire on loops. */
        this.onComplete = new DelegateEvent();
        this.data = data;
        this._category = SoundManager.getCategory(category);
        this.renderer = WebAudio.isSupported ? new WebAudioRenderer(this) : new HTMLAudioRenderer(this);
        this.renderer.onComplete.add(this.renderer_onComplete, this);
    }
    Object.defineProperty(Sound.prototype, "position", {
        /** The play back position in ms. */
        get: function () { return this.renderer.position; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "duration", {
        /** The duration in ms. */
        get: function () { return this.renderer.duration; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "volume", {
        /** The volume [0-1]. */
        get: function () { return this.renderer.volume; },
        set: function (v) { this.renderer.volume = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "isMuted", {
        /** The mute setting. */
        get: function () { return this.renderer.isMuted; },
        set: function (v) { this.renderer.isMuted = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "isLooped", {
        /** Indicates if this sound is looping or not. */
        get: function () { return this.renderer.isLooped; },
        set: function (v) { this.renderer.isLooped = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "isPlaying", {
        /** Indicates if this sound is playing. */
        get: function () { return this.renderer.state === 1 /* Playing */; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "isStopped", {
        /** Indicates if this sound is stopped. */
        get: function () { return this.renderer.state === 0 /* Stopped */; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "isPaused", {
        /** Indicates if this sound is paused. */
        get: function () { return this.renderer.state === 2 /* Paused */; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "category", {
        /** The sound category. */
        get: function () { return this._category; },
        set: function (v) {
            v = v ? v : SoundManager.defaultCategory;
            if (v !== this._category) {
                this._category = v;
                this.renderer.updateVolume();
            }
        },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Playback
    /**
     * Begins playing the sound. Should resume if paused or play from beginning if stopped.
     */
    Sound.prototype.play = function () { this.renderer.play(); };
    /**
     * Pauses the sound if playing. Leaves it stopped if stopped.
     */
    Sound.prototype.pause = function () { this.renderer.pause(); };
    /**
     * Resumes the sound if paused. Leaves it stopped if stopped.
     */
    Sound.prototype.resume = function () { this.renderer.resume(); };
    /**
     * Stops the sound if playing or paused.
     */
    Sound.prototype.stop = function () { this.renderer.stop(); };
    //#endregion
    //#region Event Handlers
    /**
     * Handles when the renderer has finished playback.
     * @param renderer The renderer.
     */
    Sound.prototype.renderer_onComplete = function (renderer) {
        this.onComplete.invoke(this);
    };
    return Sound;
}());
/** @file SoundRenderer.ts */
/// <reference path="../lang/delegate/DelegateEvent.ts" />
/// <reference path="SoundState.ts" />
/// <reference path="Sound.ts" />
/**
 * The usable form of Sound data, like Bitmap to BitmapData. Used to playback sounds.
 */
var SoundRenderer = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new sound renderer.
     * @param sound The sound to playback.
     * @internal
     */
    function SoundRenderer(sound) {
        //#region Events
        /** Invoke when a sound has completely finished playing a pass. Does NOT play on loops. */
        this.onComplete = new DelegateEvent();
        this._position = 0;
        this._isMuted = false;
        /** The time the node started playing. Used for computing playback position. */
        this._startTime = 0;
        /** The sounds renderers playback state. @readonly */
        this.state = 0 /* Stopped */;
        this.sound = sound;
        this.duration = sound.data.duration;
        this._volume = sound.data.volume;
        this._isLooped = sound.data.isLooped;
        this.engine = WebAudio.isSupported ? WebAudio : HTMLAudio;
        // Bind
        this.source_ended = this.source_ended.bind(this);
    }
    Object.defineProperty(SoundRenderer.prototype, "position", {
        /** The current playback position in ms. */
        get: function () {
            var pos = this._position;
            if (this.state === 1 /* Playing */)
                pos += (Date.now() - this._startTime);
            if (pos < 0)
                pos = 0;
            if (pos >= this.duration)
                pos = this.duration;
            return pos;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundRenderer.prototype, "volume", {
        /** The volume of the renderer sound [0-1]. */
        get: function () { return this._volume; },
        set: function (v) {
            v = Math.max(Math.min(v, 1), 0); // Cap to [0, 1]
            if (this._volume === v)
                return;
            this._volume = v;
            this.updateVolume();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundRenderer.prototype, "isMuted", {
        /** Indicates if this sound renderer is currently muted. */
        get: function () { return this._isMuted; },
        set: function (v) {
            v = !!v; // ensure a boolean
            if (this._isMuted === v)
                return;
            this._isMuted = v;
            this.updateVolume();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundRenderer.prototype, "isLooped", {
        /** Indicates if this sound renderer is looping. */
        get: function () { return this._isLooped; },
        set: function (v) {
            v = !!v;
            if (this._isLooped === v)
                return;
            this._isLooped = v;
            if (this._src)
                this._src.loop = v;
        },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Playback
    /**
     * Begins playing the sound. Should resume if paused or play from beginning if stopped.
     */
    SoundRenderer.prototype.play = function () {
        if (this.sound.duration > 1000 * 3) {
            console.log("stopping sound");
        }
        if (this.state === 2 /* Paused */)
            this.resume();
        else if (this.state === 0 /* Stopped */) {
            // Update state
            this.state = 1 /* Playing */;
            // Reset starting position
            this._position = 0;
            // Watch for engine state changes
            this.engine.onStateChange.add(this.engine_onStateChange, this);
            // Create src
            if (!this.engine.isSuspended)
                this.createSource();
        }
    };
    /**
     * Pauses the sound if playing. Leaves it stopped if stopped.
     */
    SoundRenderer.prototype.pause = function () {
        if (this.state === 1 /* Playing */) {
            // Get current position
            this._position = this.position;
            // Destroy src
            if (this._src)
                this.destroySource();
            // Update state
            this.state = 2 /* Paused */;
        }
    };
    /**
     * Resumes the sound if paused. Leaves it stopped if stopped.
     */
    SoundRenderer.prototype.resume = function () {
        if (this.state === 2 /* Paused */) {
            // Update state
            this.state = 1 /* Playing */;
            // Create src from current position
            if (!this.engine.isSuspended)
                this.createSource();
        }
    };
    /**
     * Stops the sound if playing or paused.
     */
    SoundRenderer.prototype.stop = function () {
        if (this.sound.duration > 1000 * 3) {
            console.log("stopping sound");
        }
        if (this.state !== 0 /* Stopped */) {
            // Reset to starting position
            this._position = 0;
            // Destroy src if it exists (means actively playing)
            if (this._src)
                this.destroySource();
            // Stop watching for engine state changes
            this.engine.onStateChange.remove(this.engine_onStateChange, this);
            // Update state
            this.state = 0 /* Stopped */;
        }
    };
    //#endregion
    //#region Audio Engine Interface
    /**
     * Creates the audio playback channel objects and begins playback
     * from the current position.
     */
    SoundRenderer.prototype.createSource = function () {
        // Set initial state
        this._src.loop = this._isLooped;
        this.updateVolume();
        // Register
        SoundManager.registerActiveSound(this.sound);
    };
    /**
     * Stops playback and destroys the playback channel objects.
     */
    SoundRenderer.prototype.destroySource = function () {
        // Free src
        this._src = null;
        // Unregister
        SoundManager.unregisterActiveSound(this.sound);
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles when the sound has ended
     * @param evt The event.
     */
    SoundRenderer.prototype.source_ended = function (evt) {
        if (!this._src)
            return; // we don't have a source set
        if (evt && evt.currentTarget && evt.currentTarget !== this._src)
            return; // event from prior source
        this.destroySource();
        this._position = 0;
        this.state = 0 /* Stopped */;
        // Stop watching for engine state changes
        this.engine.onStateChange.remove(this.engine_onStateChange, this);
        this.onComplete.invoke(this);
    };
    /**
     * Handles when the engine suspension state chnages.
     */
    SoundRenderer.prototype.engine_onStateChange = function () {
        if (this.engine.isSuspended) {
            if (this.state === 1 /* Playing */) {
                // Get current position
                this._position = this.position;
                // Destroy src
                if (this._src)
                    this.destroySource();
            }
        }
        else {
            // engine resumed
            if (this.state === 1 /* Playing */ && !this._src)
                this.createSource();
        }
    };
    return SoundRenderer;
}());
/** @file SoundEngine.ts */
/**
 * Base type for an audio engine.
 */
var SoundEngine = /** @class */ (function () {
    //#endregion
    //#region Constructor
    function SoundEngine() {
        //#region Events
        /** Triggered when the audio engine is suspended or resumed. */
        this.onStateChange = new DelegateEvent();
        /** Indicates if our desired state is running. */
        this._run = true;
        /** Indicates if we have a currently unresolved promise. */
        this._pending = false;
        /** Indicates if we're watching for unlockable events or not. */
        this._unlockingEventsEnabled = false;
        /** Indicates if the audio engine is currently suspended or not. @readonly */
        this.isSuspended = true;
        this.win_useraction = this.win_useraction.bind(this);
    }
    //#endregion
    //#region App Component
    /** @inheritdoc */
    SoundEngine.prototype.activate = function () {
        if (this.isSupported) {
            this._run = true;
            this.checkState(true);
        }
    };
    /** @inheritdoc */
    SoundEngine.prototype.deactivate = function () {
        if (this.isSupported) {
            this._run = false;
            this.checkState(true);
        }
    };
    /**
     * Called when the context has entered a known state.
     * @param suspended The current suspended state.
     */
    SoundEngine.prototype.stateChange = function (suspended) {
        if (this.isSuspended === suspended)
            return;
        this.isSuspended = suspended;
        this.onStateChange.invoke();
    };
    /**
     * Turns on or off watching for unlocking events.
     * @param enable Indicates if events should be watched for or not.
     */
    SoundEngine.prototype.toggleUnlocking = function (enable) {
        if (this._unlockingEventsEnabled === enable)
            return;
        this._unlockingEventsEnabled = enable;
        for (var i = 0; i < SoundEngine.unlockingEvents.length; ++i) {
            if (enable)
                window.addEventListener(SoundEngine.unlockingEvents[i], this.win_useraction, { capture: true, passive: true });
            else
                window.removeEventListener(SoundEngine.unlockingEvents[i], this.win_useraction, { capture: true, passive: true });
        }
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles audio triggering user interaction events.
     */
    SoundEngine.prototype.win_useraction = function () {
        // try resuming
        this.checkState(true);
    };
    //#endregion
    //#region Static Members
    /** The set of audio unlocking events. @see https://developers.google.com/web/updates/2018/11/web-audio-autoplay */
    SoundEngine.unlockingEvents = ["click", "contextmenu", "auxclick", "dblclick", "mousedown", "mouseup", "touchend", "keydown", "keyup"];
    return SoundEngine;
}());
/** @file WebAudioRenderer.ts */
/// <reference path="WebAudio.ts" />
/// <reference path="../SoundRenderer.ts" />
/**
 * A sound renderer for playing back web audio.
 */
var WebAudioRenderer = /** @class */ (function (_super) {
    __extends(WebAudioRenderer, _super);
    //#endregion
    //#region Constructor
    /**
     * @inheritdoc
     * @internal
     */
    function WebAudioRenderer(sound) {
        return _super.call(this, sound) || this;
    }
    //#endregion
    //#region Audio Engine Interface
    /** @inheritdoc */
    WebAudioRenderer.prototype.createSource = function () {
        // Create the nodes
        this._src = WebAudio.context.createBufferSource();
        this._src.buffer = this.sound.data.buffer;
        this._gainNode = WebAudio.context.createGain();
        // Connect the audio graph
        this._src.connect(this._gainNode);
        this._gainNode.connect(WebAudio.context.destination);
        // Watch for state changes
        this._src.addEventListener("ended", this.source_ended); // Not 100% sure that onended exists everywhere, so we do the event and the onended callback
        this._src.onended = this.source_ended; // required by some android browsers
        // Run base actions
        _super.prototype.createSource.call(this);
        // Begin playback
        this._startTime = Date.now();
        if (this._position > 0)
            this._src.start(0, this._position / 1000); // Resuming
        else
            this._src.start(); // Playing from start - throws typeerror if a negative value is supplied as a time param
    };
    /** @inheritdoc */
    WebAudioRenderer.prototype.destroySource = function () {
        // Stop watching for state changes
        this._src.removeEventListener("ended", this.source_ended); // Not 100% sure that onended exists everywhere, so we do the event and the onended callback
        this._src.onended = null;
        // Stop playback
        this._src.stop();
        this._startTime = 0;
        // Disconnect the audio graph
        this._src.disconnect();
        this._gainNode.disconnect();
        // Free nodes
        this._gainNode = null;
        // Run base actions
        _super.prototype.destroySource.call(this);
    };
    /** @inheritdoc */
    WebAudioRenderer.prototype.updateVolume = function () {
        if (this._gainNode) {
            if (this._isMuted || this.sound.category.isMuted || SoundManager.isMuted)
                this._gainNode.gain.value = 0;
            else
                this._gainNode.gain.value = this._volume * this.sound.category.volume * SoundManager.volume;
        }
    };
    return WebAudioRenderer;
}(SoundRenderer));
/** @file WebAudio.ts */
/// <reference path="WebAudioRenderer.ts" />
/**
 * Sound engine type for working with Web Audio.
 * @staticclass
 */
// tslint:disable-next-line: typedef
var WebAudio = new (/** @class */ (function (_super) {
    __extends(class_7, _super);
    //#endregion
    //#region Constructor
    /** @inheritdoc */
    function class_7() {
        var _this = _super.call(this) || this;
        //#region Members
        /** The offline audio context class. */
        _this.contextClass = window.AudioContext || window.webkitAudioContext;
        // Bind
        _this.context_statechange = _this.context_statechange.bind(_this);
        _this.context_promiseHandler = _this.context_promiseHandler.bind(_this);
        // Support test
        if (!_this.contextClass) {
            // tslint:disable-next-line: no-console
            console.warn("Web Audio is not supported");
            _this.isSupported = false;
        }
        else {
            _this.isSupported = true;
            // Create context
            _this.context = new _this.contextClass();
            // Watch for state changes
            _this.context.onstatechange = _this.context_statechange;
            // Check initial state
            _this.checkState(false);
        }
        return _this;
    }
    //#endregion
    //#region Suspension
    /** @inheritdoc  */
    class_7.prototype.checkState = function (tryChange) {
        // If we have a pending action, do nothing because a state change is likely coming
        if (this._pending)
            return;
        // Check real context state, if not running, assume suspended (ie iOS has an 'interrupted' state)
        if (this.context.state !== "running") {
            // Interrupted or suspended, check if our state matches
            if (this._run) {
                this.toggleUnlocking(true);
                // We want to be running
                if (tryChange) {
                    // Try forcing a change, so stop watching for unlocking events while attempt is in progress
                    //this.toggleUnlocking(false);
                    // Start attempt
                    //this._pending = true;	// Can't stay pending
                    this.context.resume().then(this.context_promiseHandler, this.context_promiseHandler);
                }
                else {
                    // We're not going to try unlocking this time, but make sure unlocking events are enabled
                    //this.toggleUnlocking(true);
                }
            }
            else {
                // We don't want to be running, so no need to watch for unlocking events
                this.toggleUnlocking(false);
                // We want to be suspended, so this is good
                this.stateChange(true);
            }
        }
        else {
            // No need to watch for unlocking events while running
            this.toggleUnlocking(false);
            // Check if our state matches
            if (this._run) {
                // We want to be running, so this is good, unsuspend
                this.stateChange(false);
            }
            else {
                // We want to be suspended, we can suspend at any time
                //this._pending = true;	// Can't stay pending
                this.context.suspend().then(this.context_promiseHandler, this.context_promiseHandler);
            }
        }
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles state changes on the context.
     */
    class_7.prototype.context_statechange = function () {
        // Ensure we're not disposed, this shouldn't be called after a dispose, but I've seen it happen once on chrome
        if (!this.context)
            return;
        this.checkState(true);
    };
    /**
     * Handles promise results.
     */
    class_7.prototype.context_promiseHandler = function () {
        // Ensure we're not disposed, a promise could have resolved after being disposed
        if (!this.context)
            return;
        //this._pending = false;	// we dont bother with pending
        this.checkState(false);
    };
    return class_7;
}(SoundEngine)))();
/** @file HTMLAudioRenderer.ts */
/// <reference path="HTMLAudio.ts" />
/// <reference path="../SoundRenderer.ts" />
/**
 * A sound renderer for playing back html audio.
 * Known Issues when web audio isn't available:
 * - Resuming isn't terribly accurate
 * - Resuming really doesn't work well on iOS and likely android as well, but web audio is supported there
 */
var HTMLAudioRenderer = /** @class */ (function (_super) {
    __extends(HTMLAudioRenderer, _super);
    //#region Constructor
    /**
     * @inheritdoc
     * @internal
     */
    function HTMLAudioRenderer(sound) {
        var _this = _super.call(this, sound) || this;
        // Bind
        _this.tag_loadeddata = _this.tag_loadeddata.bind(_this);
        _this.tag_play_rejected = _this.tag_play_rejected.bind(_this);
        _this.tag_play_fulfilled = _this.tag_play_fulfilled.bind(_this);
        return _this;
    }
    //#endregion
    //#region Audio Engine Interface
    /** @inheritdoc */
    HTMLAudioRenderer.prototype.createSource = function () {
        // Create the src
        var data = this.sound.data.buffer;
        if (System.browser === 1 /* Chrome */) {
            // NOTE: chrome tag must be created this way otherwise you hit a weird bug where
            this._src = document.createElement("audio");
        }
        else {
            // NOTE: airplay MUST be disabled this way
            var tmp = document.createElement("div");
            tmp.innerHTML = "<audio x-webkit-airplay='deny'></audio>";
            this._src = tmp.children.item(0);
        }
        this._src.controls = false;
        this._src.disableRemotePlayback = true; // Airplay like controls on other devices, prevents casting of the tag
        this._src.crossOrigin = data.crossOrigin;
        this._src.playbackRate = data.playbackRate;
        this._src.preload = "auto";
        // Watch for state changes
        this._src.addEventListener("ended", this.source_ended);
        this._src.addEventListener("loadeddata", this.tag_loadeddata);
        // Run base actions
        _super.prototype.createSource.call(this);
        // Begin playback
        this._startTime = Date.now();
        this._src.src = data.src;
        var tag = this._src;
        var that = this;
        var promise = this._src.play();
        if (promise)
            promise.then(this.tag_play_fulfilled).catch(function (reason) { that.tag_play_rejected(tag, reason); });
    };
    /** @inheritdoc */
    HTMLAudioRenderer.prototype.destroySource = function () {
        // Stop watching for state changes
        this._src.removeEventListener("ended", this.source_ended);
        this._src.removeEventListener("loadeddata", this.tag_loadeddata);
        // Stop playback
        this._src.pause();
        // Run base actions
        _super.prototype.destroySource.call(this);
    };
    /** @inheritdoc */
    HTMLAudioRenderer.prototype.updateVolume = function () {
        if (this._src) {
            this._src.volume = this._volume * this.sound.category.volume * SoundManager.volume;
            if (this._isMuted || this.sound.category.isMuted || SoundManager.isMuted)
                this._src.muted = true;
            else
                this._src.muted = false;
        }
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles when the tag metadata has successfully loaded.
     * Used to set the playback time.
     */
    HTMLAudioRenderer.prototype.tag_loadeddata = function () {
        if (this._position !== 0)
            this._src.currentTime = this._position / 1000;
    };
    /**
     * Handles when a tag starts playing back successfully.
     */
    HTMLAudioRenderer.prototype.tag_play_fulfilled = function () {
        // Update the start time to get a more accurate resume position
        this._startTime = Date.now();
    };
    /**
     * Handles when a tag fails to play.
     * This might happen if a tag is started and stopped too frequently, but in that case can be ignored.
     * This may also happen if autoplay is disabled and the sound can't be started, this can be seen in firefox.
     * @param reason The error.
     */
    HTMLAudioRenderer.prototype.tag_play_rejected = function (tag, reason) {
        // Playback was disallowed for some reason, just pretend the sound complete
        // tslint:disable-next-line: no-console
        console.warn("Failed to playback HTMLAudio: " + reason);
        this.stop();
        this.onComplete.invoke(this);
    };
    return HTMLAudioRenderer;
}(SoundRenderer));
/** @file HTMLAudio.ts */
/// <reference path="HTMLAudioRenderer.ts" />
/**
 * Sound engine type for working with HTML Audio.
 * Really only setup to work on IE and as a media channel playback enforcer for iOS.
 * @staticclass
 */
// tslint:disable-next-line: typedef
var HTMLAudio = new (/** @class */ (function (_super) {
    __extends(class_8, _super);
    //#endregion
    //#region Constructor
    /** @inheritdoc */
    function class_8() {
        var _this = _super.call(this) || this;
        // Bind
        _this.play_result = _this.play_result.bind(_this);
        // tslint:disable
        /**
         * A utility function for decompressing the base64 silence string.
         * @param c The number of times the string is repeated in the string segment.
         * @param a The string to repeat.
         */
        function z(c, a) { for (var e = a; c > 1; c--)
            e += a; return e; }
        // tslint:enable
        // We only need and html thread if web audio isn't supported or we're running on iOS
        // If web audio isn't supported, we need this to check the html audio suspension state so things can properly be paused when the page is minized (IE ONLY)
        // If iOS, then we need this to just run on loop in the background to keep web audio playing on the media channel
        if (!WebAudio.isSupported || System.os === 4 /* AppleiOS */) {
            _this.isSupported = true;
            // Create the tag
            if (System.os === 4 /* AppleiOS */) {
                // NOTE: airplay MUST be disabled this way
                var tmp = document.createElement("div");
                tmp.innerHTML = "<audio x-webkit-airplay='deny'></audio>";
                _this._tag = tmp.children.item(0);
            }
            else {
                // NOTE: Tag must be created this way on chrome otherwise you hit a weird bug where pause is automatically called on the tag when play is called, very odd
                _this._tag = document.createElement("audio");
            }
            _this._tag.controls = false;
            _this._tag.disableRemotePlayback = true; // Airplay like controls on other devices, prevents casting of the tag
            _this._tag.preload = "auto";
            // Set the src to a short bit of url encoded as a silent mp3
            // NOTE The silence MP3 must be high quality, when web audio sounds are played in parallel the web audio sound is mixed to match the bitrate of the html sound
            // 0.01 seconds of silence VBR220-260 Joint Stereo 859B
            // Uncompressed: "data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADgnABGiAAQBCqgCRMAAgEAH///////////////7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq//////////////////9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==";
            // Below is the compressed version down to about 400B including the decompress function above
            //this._tag.src = "data:audio/mpeg;base64,//uQx" +z(23,"A")+"WGluZwAAAA8AAAACAAACcQCA"+z(16,"gICA")+z(66,"/")+"8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkI"+z(320,"A")+"//sQxAADgnABGiAAQBCqgCRMAAgEAH"+z(15,"/")+"7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq"+z(18,"/")+"9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAw"+z(97,"V")+"Q==";
            _this._tag.src = "data:audio/mpeg;base64,//uQx" + z(23, "A") + "WGluZwAAAA8AAAACAAACcQCA" + z(16, "gICA") + z(66, "/") + "8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkI" + z(320, "A") + "//sQxAADgnABGiAAQBCqgCRMAAgEAH" + z(15, "/") + "7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq" + z(18, "/") + "9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAw" + z(97, "V") + "Q==";
            _this._tag.loop = true;
            _this._tag.load();
            // Try to play right off the bat
            _this.checkState(true);
        }
        else {
            // Not needed on this device
            _this.isSupported = false;
        }
        return _this;
    }
    //#endregion
    //#region App Component
    /** @inheritdoc  */
    class_8.prototype.dispose = function () {
        if (this._tag) {
            this._pending = true; // Set to pending to prevent future state checks
            this.toggleUnlocking(false);
            this._tag.removeEventListener("playing", this.play_result); // IE doesn't return a promise so fall back to events as well
            this._tag.removeEventListener("abort", this.play_result);
            this._tag.removeEventListener("error", this.play_result);
            this._tag.loop = false;
            this._tag.pause();
            this._tag.src = "";
            this._tag = null;
        }
    };
    //#endregion
    //#region Suspension
    /** @inheritdoc  */
    class_8.prototype.checkState = function (tryChange) {
        // If we have a pending action, do nothing because a state change is likely coming
        if (this._pending)
            return;
        // Check real context state
        if (this._tag.paused) {
            // Tag isn't playing, check if our state matches
            if (this._run) {
                // We want to be running
                if (tryChange) {
                    // Try forcing a change, so stop watching for unlocking events while attempt is in progress
                    this.toggleUnlocking(false);
                    // Start an attempt
                    this._pending = true;
                    var p = void 0;
                    try {
                        p = this._tag.play();
                        if (p)
                            p.then(this.play_result, this.play_result);
                        else {
                            this._tag.addEventListener("playing", this.play_result); // IE doesn't return a promise so fall back to events as well
                            this._tag.addEventListener("abort", this.play_result);
                            this._tag.addEventListener("error", this.play_result);
                        }
                    }
                    catch (err) {
                        this.play_result(); // Might happen on IE if there is an invalid state error
                    }
                }
                else {
                    // We're not going to try unlocking this time, but make sure unlocking events are enabled
                    this.toggleUnlocking(true);
                }
            }
            else {
                // We don't want to be running, so no need to watch for unlocking events
                this.toggleUnlocking(false);
                // We want to be suspended, so this is good
                this.stateChange(true);
            }
        }
        else {
            // No need to watch for unlocking events while running
            this.toggleUnlocking(false);
            // Check if our state matches
            if (this._run) {
                // We want to be running, so this is good, unsuspend
                this.stateChange(false);
            }
            else {
                // We want to be suspended, we can suspend at any time
                this._tag.pause(); // instant action, so no need to set as pending
                this.stateChange(true);
            }
        }
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles a play request result.
     */
    class_8.prototype.play_result = function () {
        // Make sure we're not disposed - its possible that this is a promise that resolved after disposal
        if (!this._tag)
            return;
        // Remove IE handlers
        this._tag.removeEventListener("playing", this.play_result); // IE doesn't return a promise so fall back to events as well
        this._tag.removeEventListener("abort", this.play_result);
        this._tag.removeEventListener("error", this.play_result);
        // Tag started playing, so we're not suspended
        this._pending = false;
        this.checkState(false);
    };
    return class_8;
}(SoundEngine)))();
/** @file SoundManager.ts */
/// <reference path="SoundState.ts" />
/// <reference path="SoundCategory.ts" />
/// <reference path="SoundData.ts" />
/// <reference path="SoundRenderer.ts" />
/// <reference path="Sound.ts" />
/// <reference path="SoundEngine.ts" />
/// <reference path="web/WebAudio.ts" />
/// <reference path="html/HTMLAudio.ts" />
/**
 * Manages game audio.
 * @staticclass
 */
// tslint:disable-next-line: typedef
var SoundManager = new (/** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Initializes the static instance.
     */
    function class_9() {
        this._volume = 1;
        this._isMuted = false;
        /** All of the sound categories. */
        this._categories = {};
        /** The set of all currently active sounds. */
        this._activeSounds = [];
        this.defaultCategory = new SoundCategory("default");
        this._categories[this.defaultCategory.name] = this.defaultCategory;
    }
    Object.defineProperty(class_9.prototype, "volume", {
        //#region Members
        /** The global volume [0-1]. */
        get: function () { return this._volume; },
        set: function (v) { this.updateVolume(v); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_9.prototype, "isMuted", {
        /** The global mute setting. */
        get: function () { return this._isMuted; },
        set: function (v) { this.updateMute(v); },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region App Component
    /** @inheritdoc */
    class_9.prototype.initialize = function () {
        //HTMLAudio.initialize();
        //WebAudio.initialize();
    };
    /** @inheritdoc */
    class_9.prototype.activate = function () {
        // Activate HTML audio first to ensure media channel starts first
        HTMLAudio.activate();
        WebAudio.activate();
    };
    /** @inheritdoc */
    class_9.prototype.deactivate = function () {
        WebAudio.deactivate();
        HTMLAudio.deactivate();
    };
    //#endregion
    //#region Categories
    /**
     * Creates a new sound category and returns it.
     * May not use the reserved names default or AudioUnlocker.
     * @param name The name of the category
     * @throws Error if the name is in use or if the name is reserved.
     */
    class_9.prototype.createCategory = function (name) {
        if (this._categories[name])
            throw "Sound Category (" + name + ") already exists!";
        var category = new SoundCategory(name);
        this._categories[name] = category;
        return category;
    };
    /**
     * Gets the sound category with the given name.
     * @param name The name of the category.
     * @throws Error if no category with that name exists.
     */
    class_9.prototype.getCategory = function (name) {
        var category = this._categories[name];
        if (!category)
            throw new Error("Sound Category (" + name + ") does not exist!");
        return category;
    };
    //#endregion
    //#region Sounds
    /**
     * Registers a sound as active.
     * @param sound The sound.
     */
    class_9.prototype.registerActiveSound = function (sound) {
        // tslint:disable-next-line: no-console
        if (this._activeSounds.indexOf(sound) >= 0)
            console.warn("Sound already registered");
        else
            this._activeSounds.push(sound);
    };
    /**
     * Unregisters a sound as active.
     * @param sound The sound.
     */
    class_9.prototype.unregisterActiveSound = function (sound) {
        var idx = this._activeSounds.indexOf(sound);
        if (idx >= 0)
            this._activeSounds.splice(idx, 1);
        // tslint:disable-next-line: no-console
        else
            console.warn("Sound not registered");
    };
    //#endregion
    //#region Helpers
    /**
     * Updates the global volume and propgates the change to all active sounds.
     * @param v The new global volume.
     */
    class_9.prototype.updateVolume = function (v) {
        v = Math.min(Math.max(0, v), 1);
        if (this._volume === v)
            return;
        this._volume = v;
        this.updateSoundVolumes();
    };
    /**
     * Updates the global mute setting and propgates the change to all active sounds.
     * @param v The new globl mute setting.
     */
    class_9.prototype.updateMute = function (v) {
        if (this._isMuted === v)
            return;
        this._isMuted = v;
        this.updateSoundVolumes();
    };
    /**
     * Propogates volume / mute settings to all sounds.
     * Used by categories to handle when a category setting changes.
     * @internal
     */
    class_9.prototype.updateSoundVolumes = function () {
        for (var i = 0; i < this._activeSounds.length; ++i) {
            this._activeSounds[i].renderer.updateVolume();
        }
    };
    return class_9;
}()))();
/** @file AssetEntry.ts */
/// <reference path="../lang/lang.ts" />
/** @file Asset.ts */
/// <reference path="../lang/delegate/DelegateEvent.ts" />
/**
 * Base class for an asset.
 * @template T the type of data.
 */
var Asset = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new asset.
     * @param id The unique asset Id.
     */
    function Asset(id) {
        //#region Events
        /** Triggered when the asset has finished loading. @internal */
        this.onLoaded = new DelegateEvent();
        /** Triggered when loading an asset fails. @internal */
        this.onError = new DelegateEvent();
        this.onProgress = new DelegateEvent();
        /** The asset's data. @readonly */
        this.data = null;
        this.progress = 0;
        this.id = id;
    }
    //#endregion
    //#region Disposal
    /**
     * Disposes of the asset.
     * @internal
     */
    Asset.prototype.dispose = function () {
        this.data = null;
    };
    /**
     * Handles when the asset has loaded successfully.
     */
    Asset.prototype.loaded = function () {
        this.progress = 1;
        this.onLoaded.invoke(this);
    };
    /**
     * Handles when the asset failed to load.
     * @param msg An error message.
     */
    Asset.prototype.error = function (msg) {
        // tslint:disable-next-line: no-console
        console.warn("Failed to load", this.id, msg);
        this.onError.invoke(this);
    };
    return Asset;
}());
/** @file FontMetrics.ts */
/** @file Font.ts */
/// <reference path="FontMetrics.ts" />
/**
 * Represents a font that may be used with the engine.
 */
var Font = /** @class */ (function () {
    /**
     * Defines a new Font.
     * @param family The font family.
     * @param weight The font weight.
     * @param style The fonts style.
     * @param variant The font variant.
     * @param ascent Font metrics ascent.
     * @param descent Font metrics descent.
     * @param unitsPerEm Font metrics unitsPerEm.
     * @internal
     */
    function Font(family, weight, style, variant, ascent, descent, unitsPerEm) {
        this.family = family;
        this.weight = weight;
        this.style = style;
        this.variant = variant;
        this.metrics = { ascent: ascent || 0, descent: descent || 0, unitsPerEm: unitsPerEm || 0 };
    }
    return Font;
}());
/** @file FontAsset.ts */
/// <reference path="../font/Font.ts" />
/**
 * Loader for bundled font assets.
 * Attempts to load the font using the FontFace API if available.
 * If that failes it will fallback to loading using a style and interval
 * measuring of an offscreen font element.
 *
 * Font Face API status
 * 	FontFaceSet
 * 		add		48
 * 	Document
 * 		fonts	60
 *
 */
var FontAsset = /** @class */ (function (_super) {
    __extends(FontAsset, _super);
    //#endregion
    //#region Constructor
    /**
     * Creates a new font asset.
     * @param id The unique id of the asset.
     * @internal
     */
    function FontAsset(id) {
        var _this = _super.call(this, id) || this;
        //#endregion
        //#region Members
        /** A FontFace instance used to load fonts when the FontFace api is available. */
        _this._fontFace = null;
        /** The style element used to add the font to the page when using embed loading. */
        _this._style = null;
        /** Helper element for style based loading, hides a string of text off screen to force the font to load using a style src. */
        _this._embed = null;
        /** The last embed test measured width. */
        _this._lastWidth = -1;
        /** The last embed test measured height. */
        _this._lastHeight = -1;
        /** The time that measurement testing started. */
        _this._startTime = null;
        /** The interval timer used to test embed size changes. */
        _this._intervalId = null;
        /** The amount of time an embed measurement is allowed to test for. */
        _this._timeoutDelay = 3000;
        // Bind
        _this.fontFace_onfulfilled = _this.fontFace_onfulfilled.bind(_this);
        _this.fontFace_onrejected = _this.fontFace_onrejected.bind(_this);
        _this.setInterval_handler = _this.setInterval_handler.bind(_this);
        return _this;
    }
    //#endregion
    //#region Disposal
    /** @inheritdoc @internal */
    FontAsset.prototype.dispose = function () {
        if (FontAsset._isFontFaceAPISupported) {
            if (this._fontFace) {
                document.fonts.delete(this._fontFace); // NOTE: it is okay to delete this without it being added, it just returns false
                this._fontFace = null;
            }
        }
        else {
            if (this._intervalId !== null)
                clearInterval(this._intervalId);
            this._intervalId = null;
            this._embed = null;
            if (FontAsset._embedHolder)
                document.body.removeChild(FontAsset._embedHolder);
            FontAsset._embedHolder = null;
            if (this._style)
                document.head.removeChild(this._style);
            this._style = null;
        }
        _super.prototype.dispose.call(this);
    };
    //#endregion
    //#region Loading
    /** @inheritdoc @internal */
    FontAsset.prototype.load = function (src) {
        this.data = Assets.fonts[this.id];
        // First try the font face api
        if (FontAsset._isFontFaceAPISupported)
            this.loadUsingFontFace(src);
        else
            this.loadUsingEmbedTest(src);
    };
    /** @inheritdoc */
    FontAsset.prototype.loaded = function () {
        _super.prototype.loaded.call(this);
    };
    //#endregion
    //#region Font Face API Loading
    /**
     * Attempts loading via the FontFace API.
     */
    FontAsset.prototype.loadUsingFontFace = function (src) {
        var descriptors = { family: this.data.family, weight: this.data.weight, style: this.data.style, variant: this.data.variant };
        //console.log("loading font face", src);
        this._fontFace = new FontFace(this.data.family, "url(" + src + ")", descriptors);
        this._fontFace.load().then(this.fontFace_onfulfilled, this.fontFace_onrejected).catch(this.fontFace_onrejected);
    };
    /**
     * Handles when a font face is successfully loaded with font face api.
     * @param fontFace The loaded font face.
     */
    FontAsset.prototype.fontFace_onfulfilled = function (fontFace) {
        // If we were canceled, fontFace will be null
        if (!this._fontFace)
            return;
        document.fonts.add(fontFace); // NOTE: must be added to the document for it to start rendering
        this.loaded();
    };
    /**
     * Handles when a font face fails to load.
     * @param reason The reason for failure, could be a string, DOMException, or some kind of error.
     */
    FontAsset.prototype.fontFace_onrejected = function (reason) {
        // If we were canceled, fontFace will be null
        if (!this._fontFace)
            return;
        this.error("Font Face promise failed: " + reason);
    };
    //#endregion
    //#region Embed Test Loading
    /**
     * Loads a font using embed testing.
     */
    FontAsset.prototype.loadUsingEmbedTest = function (src) {
        // Add style element to kick off loading
        var css = "@font-face {\n" +
            "	font-family: '" + this.data.family + "';\n" +
            "	src: url('" + src + "') format('truetype');\n" +
            "	font-weight: " + this.data.weight + ";\n" +
            "	font-style: " + this.data.style + ";\n" +
            "	font-variant: " + this.data.variant + ";\n" +
            "	font-display: block;\n" +
            "}";
        this._style = document.createElement("style");
        this._style.innerHTML = css;
        document.head.appendChild(this._style);
        // Add the embed element w/o the correct family
        if (FontAsset._embedHolder === null) {
            FontAsset._embedHolder = document.createElement("div");
            FontAsset._embedHolder.style.cssText = "display: inline-block; clear: both; white-space: nowrap; position: absolute; top: -10000px; left: -10000px;";
            if (document.body.children.length > 0)
                document.body.insertBefore(FontAsset._embedHolder, document.body.children[0]);
            else
                document.body.appendChild(FontAsset._embedHolder);
        }
        this._embed = document.createElement("div");
        this._embed.style.cssText = "font-family: Arial; font-weight: " + this.data.weight + "; font-style: " + this.data.style + "; font-variant: " + this.data.variant + ";";
        this._embed.innerHTML = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcderfhijklmnopqrstuvwxyz0123456789`~!@#$%^&amp;*()_-+=|\]}[{'&quot;;:/?.&gt;,&lt;";
        FontAsset._embedHolder.appendChild(this._embed);
        // Take an initial measurement
        this.measure();
        // Update to the correct family
        this._embed.style.cssText = "font-family: '" + this.data.family + "', Arial; font-weight: " + this.data.weight + "; font-style: " + this.data.style + "; font-variant: " + this.data.variant + ";";
        // Measure again and start measuring on interval if needed
        if (!this.check())
            this.startInterval();
    };
    /**
     * Measures the current size of the embed element.
     * @return true iff the size changed.
     */
    FontAsset.prototype.measure = function () {
        var width = this._embed.clientWidth;
        var height = this._embed.clientHeight;
        var changed = (width !== this._lastWidth || height !== this._lastHeight) ? true : false;
        this._lastWidth = width;
        this._lastHeight = height;
        return changed;
    };
    /**
     * Checks if the size of the element has changed.
     * @return true iff the size changed.
     */
    FontAsset.prototype.check = function () {
        if (this.measure()) {
            this.embedComplete();
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Starts the embed measurement interval.
     */
    FontAsset.prototype.startInterval = function () {
        this._startTime = Date.now();
        this._intervalId = setInterval(this.setInterval_handler, 1000 / 60);
    };
    /**
     * Stops the embed measurement interval.
     */
    FontAsset.prototype.stopInterval = function () {
        if (this._intervalId !== null)
            clearInterval(this._intervalId);
        this._intervalId = null;
    };
    /**
     * Processes a measurement interval tick
     */
    FontAsset.prototype.setInterval_handler = function () {
        if (this._intervalId !== null) {
            if (this.check()) {
            }
            else {
                if (Date.now() - this._startTime >= this._timeoutDelay)
                    this.embedTimeout();
            }
        }
    };
    /**
     * Handles when an embed test times out.
     */
    FontAsset.prototype.embedTimeout = function () {
        // Stop Ticking
        this.stopInterval();
        // Dump a warning
        // tslint:disable-next-line: no-console
        console.warn("Font " + this.data.family + " (weight: " + this.data.weight + ", style: " + this.data.style + ", variant: " + this.data.variant + ") timed out.");
        // Fonts are not super essential and we can never be 100% certain embed test loading even works properly, so we allow loading to continue anyway
        this.loaded();
    };
    /**
     * Handles when an embed test comletes sucessfully.
     */
    FontAsset.prototype.embedComplete = function () {
        this.stopInterval();
        this.loaded();
    };
    //#region Static Members
    /** A single embed holder element to keep the dom relatively clean. */
    FontAsset._embedHolder = null;
    /** Indicates if the font face api is supported */
    FontAsset._isFontFaceAPISupported = (function () {
        var supported = document.fonts && document.fonts.add && document.fonts.delete && FontFace && !!FontFace.prototype.load;
        // tslint:disable-next-line: no-console
        if (!supported)
            console.warn("Font Face API is unsupported. Using embed test loading.");
        return supported;
    })();
    return FontAsset;
}(Asset));
/** @file ImageAsset.ts */
/**
 * Tag based image loader for bundled image assets.
 * Converts the packed binary data to base64 and then loads it into the tag as a data uri.
 * Note that tag loading does not support progress events.
 */
var ImageAsset = /** @class */ (function (_super) {
    __extends(ImageAsset, _super);
    //#endregion
    //#region Constructor
    /**
     * Creates a new image asset.
     * @param id The unique id of the asset.
     * @internal
     */
    function ImageAsset(id) {
        var _this = _super.call(this, id) || this;
        //#region Members
        /** Indicates if we're listening on the tag. */
        _this._listening = false;
        // Bind
        _this.data_error = _this.data_error.bind(_this);
        _this.data_load = _this.data_load.bind(_this);
        return _this;
    }
    //#endregion
    //#region Disposal
    /** @inheritdoc @internal */
    ImageAsset.prototype.dispose = function () {
        this.unlisten();
        _super.prototype.dispose.call(this);
    };
    //#endregion
    //#region Loading
    /** @inheritdoc @internal */
    ImageAsset.prototype.load = function (src) {
        this.data = document.createElement("img");
        this.listen();
        this.data.src = src;
    };
    /**
     * Starts listening on the tag.
     */
    ImageAsset.prototype.listen = function () {
        if (this._listening)
            return;
        this._listening = true;
        this.data.addEventListener("abort", this.data_error);
        this.data.addEventListener("error", this.data_error);
        this.data.addEventListener("load", this.data_load);
    };
    /**
     * Stops listening on the tag.
     */
    ImageAsset.prototype.unlisten = function () {
        if (!this._listening)
            return;
        this._listening = false;
        this.data.removeEventListener("abort", this.data_error);
        this.data.removeEventListener("error", this.data_error);
        this.data.removeEventListener("load", this.data_load);
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles tag load events.
     * @param evt The event.
     */
    ImageAsset.prototype.data_load = function (evt) {
        this.unlisten();
        Assets.images[this.id] = new Texture(this.data);
        this.data = null;
        this.loaded();
    };
    /**
     * Handles tag error / abort events.
     * @param evt The event.
     */
    ImageAsset.prototype.data_error = function (evt) {
        this.unlisten();
        this.error(evt.type);
    };
    return ImageAsset;
}(Asset));
/** @file SoundAsset.ts */
/// <reference path="../sound/SoundData.ts" />
/**
 * Loader for bundled audio assets.
 * Attempts to load using the WebAudio API if availble.
 * If Web Audio is unavailable it will fallback to HTMLAudio.
 */
var SoundAsset = /** @class */ (function (_super) {
    __extends(SoundAsset, _super);
    //#endregion
    //#region Constructor
    /**
     * Creates a new sound asset.
     * @param id The unique id of the asset.
     * @internal
     */
    function SoundAsset(id) {
        var _this = _super.call(this, id) || this;
        //#region Members
        /** Tracks if audio decoding was resolved. This is necessary because the handler is called twice in some cases and we need to be able to cancel. */
        _this._waitingOnDecode = false;
        /** Indicates if we're listening on the tag. */
        _this._listeningTag = false;
        _this._listeningRequest = false;
        // Bind
        _this.request_load = _this.request_load.bind(_this);
        _this.request_progress = _this.request_progress.bind(_this);
        _this.request_error = _this.request_error.bind(_this);
        _this.request_timeout = _this.request_timeout.bind(_this);
        _this.request_abort = _this.request_abort.bind(_this);
        _this.decodeAudioData_error = _this.decodeAudioData_error.bind(_this);
        _this.decodeAudioData_success = _this.decodeAudioData_success.bind(_this);
        _this.tag_canplaythrough = _this.tag_canplaythrough.bind(_this);
        _this.tag_progress = _this.tag_progress.bind(_this);
        _this.tag_error = _this.tag_error.bind(_this);
        return _this;
    }
    //#endregion
    //#region Disposal
    /** @inheritdoc @internal */
    SoundAsset.prototype.dispose = function () {
        if (WebAudio.isSupported) {
            this._waitingOnDecode = false;
        }
        else {
            this.unlistenTag();
        }
        _super.prototype.dispose.call(this);
    };
    //#endregion
    //#region Loading
    /** @inheritdoc @internal */
    SoundAsset.prototype.load = function (src) {
        if (WebAudio.isSupported)
            this.loadUsingWebAudio(src);
        else
            this.loadUsingHTMLAudio(src);
    };
    //#endregion
    //#region Web Audio
    /**
     * Starts loading using Web Audio.
     * @param bytes The audio data.
     */
    SoundAsset.prototype.loadUsingWebAudio = function (src) {
        this._request = new XMLHttpRequest();
        this._request.open("GET", src, true);
        this._request.responseType = "arraybuffer";
        this.listenRequest();
        this._request.send();
    };
    /**
     * Starts listening on the web audio request.
     */
    SoundAsset.prototype.listenRequest = function () {
        if (this._listeningRequest)
            return;
        this._listeningRequest = true;
        this._request.addEventListener("progress", this.request_progress);
        this._request.addEventListener("load", this.request_load);
        this._request.addEventListener("abort", this.request_abort);
        this._request.addEventListener("error", this.request_error);
        this._request.addEventListener("timeout", this.request_timeout);
    };
    /**
     * Stops listening on the web audio request.
     */
    SoundAsset.prototype.unlistenRequest = function () {
        if (!this._listeningRequest)
            return;
        this._listeningRequest = false;
        this._request.removeEventListener("progress", this.request_progress);
        this._request.removeEventListener("load", this.request_load);
        this._request.removeEventListener("abort", this.request_abort);
        this._request.removeEventListener("error", this.request_error);
        this._request.removeEventListener("timeout", this.request_timeout);
    };
    /**
     * Handles when a web audio request has progressed.
     * @param evt The progress event.
     */
    SoundAsset.prototype.request_progress = function (evt) {
        if (evt.lengthComputable) {
            this.progress = 0.5 * evt.loaded / evt.total;
            this.onProgress.invoke(this);
        }
    };
    /**
     * Handles when a web audio request has loaded.
     * @param evt The event.
     */
    SoundAsset.prototype.request_load = function (evt) {
        if (this._request.status === 404) {
            this.request_error({ type: "File not found (404)." }); // happens when a file isnt on the server
            return;
        }
        var arrayBuffer = this._request.response;
        this.unlistenRequest();
        this._request = null;
        // NOTE: Promises are not supported everywhere but need to be handled when available, this will cause the handlers to fire twice in some cases
        this._waitingOnDecode = true;
        var promise = WebAudio.context.decodeAudioData(arrayBuffer, this.decodeAudioData_success, this.decodeAudioData_error);
        if (promise)
            promise.then(this.decodeAudioData_success, this.decodeAudioData_error).catch(this.decodeAudioData_error);
    };
    /**
     * Handles when a request is aborted.
     * @param evt The aborted event.
     */
    SoundAsset.prototype.request_abort = function (evt) {
        this.unlistenRequest();
        //this.handleAbort();
        this.error("Aborted");
    };
    /**
     * Handles when a request times out.
     * @param evt The timeout event.
     */
    SoundAsset.prototype.request_timeout = function (evt) {
        this.unlistenRequest();
        //this.handleTimeout();
        this.error("Timeout");
    };
    /**
     * Handles when a request results in an error.
     * @param evt The error event or a spoof object like it.
     */
    SoundAsset.prototype.request_error = function (e) {
        this.unlistenRequest();
        //this.handleError(new Error(e.type + " Error loading web audio data " + this.src), false);
        this.error("Error");
    };
    /**
     * Handles when audio data is finished decoding.
     * @param audioBuffer The decoded audio buffer.
     */
    SoundAsset.prototype.decodeAudioData_success = function (audioBuffer) {
        // Only allow resolution on the first call
        if (!this._waitingOnDecode)
            return;
        this._waitingOnDecode = false;
        this.data = new SoundData(audioBuffer);
        Assets.sounds[this.id] = this.data;
        this.data = null;
        this.loaded();
    };
    /**
     * Handles when there is an error decoding audio data.
     * @param error The error that occurred
     */
    SoundAsset.prototype.decodeAudioData_error = function (error) {
        // Only allow resolution on the first call
        if (!this._waitingOnDecode)
            return;
        this._waitingOnDecode = false;
        // Since crawlers (google bot) won't decode audio, we don't want to error out and show the crawler an error, instead just stub a short silent sound
        // Create an empty one-second stereo buffer at the sample rate of the AudioContext
        var fallbackBuffer = WebAudio.context.createBuffer(2, WebAudio.context.sampleRate * 1, WebAudio.context.sampleRate);
        this.data = new SoundData(fallbackBuffer);
        Assets.sounds[this.id] = this.data;
        this.data = null;
        this.loaded();
        // Warn
        // tslint:disable-next-line: no-console
        console.warn("Failed to decode audio data and will use fallback for: ", this.id);
        /* OLD error on decode
        let errorMsg:string = "Error decoding audio data.";
        if (error)
        {
            try
            {
                errorMsg += " " + error.name + " " + error.message;
            } catch (e) {}
        }

        this.error(errorMsg);
        */
    };
    //#endregion
    //#region HTML Audio
    /**
     * Starts loading using HTML Audio.
     * @param bytes The audio data.
     */
    SoundAsset.prototype.loadUsingHTMLAudio = function (src) {
        var tag = document.createElement("audio");
        this.data = new SoundData(tag);
        this.listenTag();
        tag.src = src;
        tag.load();
    };
    /**
     * Starts listening on the tag.
     */
    SoundAsset.prototype.listenTag = function () {
        if (this._listeningTag)
            return;
        this._listeningTag = true;
        var tag = this.data.buffer;
        if (System.os === 5 /* Android */)
            tag.addEventListener("loadstart", this.tag_canplaythrough);
        else
            tag.addEventListener("canplaythrough", this.tag_canplaythrough);
        tag.addEventListener("progress", this.tag_progress);
        tag.addEventListener("error", this.tag_error);
        tag.addEventListener("abort", this.tag_error);
    };
    /**
     * Stops listening on the tag.
     */
    SoundAsset.prototype.unlistenTag = function () {
        if (!this._listeningTag)
            return;
        this._listeningTag = false;
        var tag = this.data.buffer;
        if (System.os === 5 /* Android */)
            tag.removeEventListener("loadstart", this.tag_canplaythrough);
        else
            tag.removeEventListener("canplaythrough", this.tag_canplaythrough);
        tag.removeEventListener("error", this.tag_error);
        tag.removeEventListener("abort", this.tag_error);
        tag.removeEventListener("progress", this.tag_progress);
    };
    SoundAsset.prototype.tag_progress = function (evt) {
        if (evt.lengthComputable) {
            this.progress = (evt.loaded / evt.total);
            this.onProgress.invoke(this);
        }
    };
    /**
     * Handles when a tag has reached a playable state.
     * @param evt The event.
     */
    SoundAsset.prototype.tag_canplaythrough = function (evt) {
        this.unlistenTag();
        Assets.sounds[this.id] = this.data;
        this.data = null;
        this.loaded();
    };
    /**
     * Handles tag error events.
     * @param evt The event.
     */
    SoundAsset.prototype.tag_error = function (evt) {
        this.unlistenTag();
        this.error(evt.type);
    };
    return SoundAsset;
}(Asset));
/** @file AssetManager.ts */
/// <reference path="AssetEntry.ts" />
/// <reference path="Asset.ts" />
/// <reference path="FontAsset.ts" />
/// <reference path="ImageAsset.ts" />
/// <reference path="SoundAsset.ts" />
/**
 * Unpacks the bundle files and maintains references to the files via their packed paths.
 * @staticclass
 */
// tslint:disable-next-line: typedef
var AssetManager = new (/** @class */ (function () {
    function class_10() {
        //#region Events
        /** Triggered when the asset manager has unpacked successfully. @internal */
        this.onLoaded = new DelegateEvent();
        /** Triggered when the asset manager has unpacked successfully. @internal */
        this.onError = new DelegateEvent();
        this.onProgress = new DelegateEvent();
        //#endregion
        //#region Members
        /** The set of all unpacked assets stored by path (excluding extension). */
        this._assets = [];
        /** The number of pending assets still unpacking. */
        this._pending = 0;
        this._total = 0;
        /** Indicates if an error occurred while loading. */
        this._error = false;
        this.progress = 0;
        //#endregion
    }
    //#endregion
    //#region Loading
    class_10.prototype.load = function () {
        var toLoad = [];
        for (var id in Assets.manifest.images) {
            var asset = new ImageAsset(id);
            toLoad.push({ asset: asset, src: Assets.manifest.images[id] });
            this._assets.push(asset);
        }
        for (var id in Assets.manifest.sounds) {
            var asset = new SoundAsset(id);
            toLoad.push({ asset: asset, src: Assets.manifest.sounds[id] });
            this._assets.push(asset);
        }
        for (var id in Assets.manifest.fonts) {
            var asset = new FontAsset(id);
            toLoad.push({ asset: asset, src: Assets.manifest.fonts[id] });
            this._assets.push(asset);
        }
        // Load each asset
        //console.log("loading items", Date.now());
        this._total = this._pending = toLoad.length;
        if (this._pending > 0) {
            for (var i = 0; i < toLoad.length; ++i) {
                var asset = toLoad[i].asset;
                var src = toLoad[i].src;
                //console.log("   loading", asset.id, Date.now());
                asset.onLoaded.add(this.asset_onLoaded, this);
                asset.onError.add(this.asset_onError, this);
                asset.load(src);
            }
        }
        else {
            this.onLoaded.invoke();
        }
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles when an asset loads successfully.
     * @param asset The loaded asset.
     */
    class_10.prototype.asset_onLoaded = function (asset) {
        asset.onLoaded.remove(this.asset_onLoaded, this);
        asset.onError.remove(this.asset_onError, this);
        //console.log("   finished", asset.id, Date.now());
        if (!this._error) {
            this.asset_onProgress();
            this._pending--;
            if (this._pending === 0) {
                //console.log("finished unpack", Date.now());
                this.progress = 1;
                this.onProgress.invoke();
                this.onLoaded.invoke();
            }
        }
    };
    /**
     * Handles when an asset fails to load.
     * @param asset The asset that failed to load.
     */
    class_10.prototype.asset_onError = function (asset) {
        asset.onLoaded.remove(this.asset_onLoaded, this);
        asset.onError.remove(this.asset_onError, this);
        // Report the error if haven't already
        if (!this._error) {
            this._error = true;
            // tslint:disable-next-line: no-console
            console.warn("Failed to load assets.");
        }
    };
    class_10.prototype.asset_onProgress = function () {
        if (!this._error) {
            this.progress = 0;
            for (var _i = 0, _a = this._assets; _i < _a.length; _i++) {
                var asset = _a[_i];
                this.progress += asset.progress / this._total;
            }
            this.onProgress.invoke();
        }
    };
    return class_10;
}()))();
/** @file PointHitArea.ts */
/** @file Circle.ts */
/// <reference path="PointHitArea.ts" />
/**
 * A circle class.
 */
var Circle = /** @class */ (function () {
    //#region Constructor
    /**
     * Creates a new circle.
     * @param x The x origin.
     * @param y The y origin.
     * @param radius The radius.
     */
    function Circle(x, y, radius) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (radius === void 0) { radius = 50; }
        this.origin = new Vector2(x, y);
        this.radius = radius;
    }
    //#endregion
    /**
     * Tests if the supplied vector is contained within this circle.
     * Those filling on the edge of the circle are considered outside of it.
     * @param pt The point to test.
     * @return true iff the point is within the circle.
     */
    Circle.prototype.containsVector = function (pt) {
        return pt.distanceSquared(this.origin) < this.radius * this.radius ? true : false;
    };
    return Circle;
}());
/** @file Rectangle.ts */
/// <reference path="PointHitArea.ts" />
/// <reference path="Circle.ts" />
/**
 * A rectangle class.
 */
var Rectangle = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new rectangle.
     * @param x The x position.
     * @param y The y position.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     */
    function Rectangle(x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
    }
    Object.defineProperty(Rectangle.prototype, "isEmpty", {
        /** @inheritdoc */
        get: function () { return this.width === 0 || this.height === 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "bottom", {
        /** @inheritdoc */
        get: function () { return this.y + this.height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "right", {
        /** @inheritdoc */
        get: function () { return this.x + this.width; },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Setting
    /**
     * Sets the rectangles components.
     * @param x The x position.
     * @param y The y position.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     * @returns This rectangle.
     */
    Rectangle.prototype.set = function (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    };
    /**
     * Copies the values of the supplied rectangle into this one.
     * @param r The rectangle to copy.
     * @return this rectangle.
     */
    Rectangle.prototype.copy = function (r) {
        this.x = r.x;
        this.y = r.y;
        this.width = r.width;
        this.height = r.height;
        return this;
    };
    /**
     * Floors the rectangle position and dimensions.
     */
    Rectangle.prototype.floor = function () {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.width = Math.floor(this.width);
        this.height = Math.floor(this.height);
        return this;
    };
    //#endregion
    //#region Geom
    /** @inheritdoc */
    Rectangle.prototype.containsVector = function (v) {
        return (v.x >= this.x && v.x < this.x + this.width && v.y >= this.y && v.y < this.y + this.height);
    };
    /**
     * Expands this rectangle to include the supplied rectangle.
     * @param other The rectangle to encompass.
     * @returns this rectangle.
     */
    Rectangle.prototype.extend = function (other) {
        // TODO: FUTURE- this could be optimized
        var x = Math.min(this.x, other.x);
        var y = Math.min(this.y, other.y);
        var width = Math.max(this.x + this.width, other.x + other.width);
        var height = Math.max(this.y + this.height, other.y + other.height);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    };
    //#endregion
    //#region Equatable
    /** @inheritdoc */
    Rectangle.prototype.equals = function (other) {
        return other.x === this.x && other.y === this.y && other.width === this.width && other.height === this.height;
    };
    //#endregion
    //#region Cloneable
    /** @inheritdoc */
    Rectangle.prototype.clone = function () {
        return new Rectangle(this.x, this.y, this.width, this.height);
    };
    //#endregion
    //#region String
    /** @inheritdoc */
    Rectangle.prototype.toString = function () {
        return "[Rectangle (x=" + this.x + " y=" + this.y + " width=" + this.width + " height=" + this.height + ")]";
    };
    return Rectangle;
}());
/** @file MathUtil.ts */
/**
 * Holds various Math utilities.
 */
// tslint:disable-next-line: typedef
var MathUtil = new (/** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new MathUtil.
     */
    function class_11() {
        //#region Constants
        /** The constant used to convert degrees to radians. */
        this.DEG_TO_RAD = Math.PI / 180;
        /** The constant used to convert degrees to radians. */
        this.RAD_TO_DEG = 180 / Math.PI;
        /** The constant used for 360 degress (2 pi). */
        this.TWO_PI = Math.PI * 2;
        //#endregion
        //#region Members
        /** Lookup table for computing the cos value of a degree. */
        this._lutCosDegrees = [];
        /** Lookup table for computing the sin value of a degree. */
        this._lutSinDegrees = [];
        // Compute look up tables
        /*
        for (let i:number = 0; i < 360 * 4; ++i)
        {
            this._lutCosDegrees[i] = Math.cos(this.DEG_TO_RAD * i / 4);
            this._lutSinDegrees[i] = Math.sin(this.DEG_TO_RAD * i / 4);
        }
        */
        this._lutCosDegrees.length =
            this._lutSinDegrees.length = 3600;
        for (var i = 0; i < 3600; ++i) {
            this._lutCosDegrees[i] = Math.cos(this.DEG_TO_RAD * i / 10);
            this._lutSinDegrees[i] = Math.sin(this.DEG_TO_RAD * i / 10);
        }
    }
    //#endregion
    //#region Numbers
    /**
     * Checks if a number is a power of 2.
     * @param value The number to check.
     * @returns True if value is a power of 2.
     */
    class_11.prototype.isPowerOf2 = function (value) {
        return (value & (value - 1)) === 0;
    };
    //#endregion
    //#region Geometry
    /**
     * Uses a precomputed lookup table instead of Math.cos();
     * @param d The degree value to find the cos of
     * @returns Math.cos(degrees) accurate to 1/10 of a degree.
     */
    class_11.prototype.cosDegrees = function (d) {
        // accurate to 1/4 degree
        /*
        degrees *= 4;

        degrees = (degrees + (degrees >= 0 ? 0.5 : -0.5)) << 0;	// round
        degrees = degrees % (360 * 4);							// truncate to 360
        if (degrees < 0) degrees += (360 * 4);					// make positive by wrapping
        */
        d *= 10;
        d = (d + (d >= 0 ? 0.5 : -0.5)) << 0;
        d = d % 3600;
        d = d === -0 ? 0 : d;
        d = d >= 0 ? d : d + 3600;
        return this._lutCosDegrees[d];
    };
    /**
     * Uses a precomputed lookup table instead of Math.sin();
     * @param d The degree value to find the sin of
     * @returns Math.sin(degrees) accurate to 1/10 of a degree.
     */
    class_11.prototype.sinDegrees = function (d) {
        // accurate to 1/4 degree
        /*
        degrees *= 4;

        degrees = (degrees + (degrees >= 0 ? 0.5 : -0.5)) << 0;	// round
        degrees = degrees % (360 * 4);							// truncate to 360
        if (degrees < 0) degrees += (360 * 4);					// make positive by wrapping
        */
        d *= 10;
        d = (d + (d >= 0 ? 0.5 : -0.5)) << 0;
        d = d % 3600;
        d = d === -0 ? 0 : d;
        d = d >= 0 ? d : d + 3600;
        return this._lutSinDegrees[d];
    };
    return class_11;
}()))();
/** @file Vector2.ts */
/**
 * Defines a vector with 2 components.
 */
var Vector2 = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new Vector2.
     * @param x The x component. Default 0.
     * @param y The y component. Default 0.
     */
    function Vector2(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    //#endregion
    //#region Setting
    /**
     * Sets the vector values.
     * @param x The x component.
     * @param y The y component.
     * @returns this object.
     */
    Vector2.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    /**
     * Copies the supplied vectors values to this values.
     * @param v The vector to read values from.
     * @returns this object.
     * @throws Error if other is null or undefined.
     */
    Vector2.prototype.copy = function (v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    };
    /**
     * Floors the vector components.
     * @returns this object.
     */
    Vector2.prototype.floor = function () {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    };
    /**
     * Floors the vector components to a certain number of decimal places.
     * @param decimalPlaces The number of decimal places to contain.
     * @returns this object.
     */
    Vector2.prototype.floorTo = function (decimalPlaces) {
        decimalPlaces = Math.pow(10, decimalPlaces);
        this.x = Math.floor(this.x * decimalPlaces) / decimalPlaces;
        this.y = Math.floor(this.y * decimalPlaces) / decimalPlaces;
        return this;
    };
    /**
     * Rounds the vector components.
     * @returns this object.
     */
    Vector2.prototype.round = function () {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    };
    /**
     * Rounds the vector components to a certain number of decimal places.
     * @param decimalPlaces The number of decimal places to contain.
     * @returns this object.
     */
    Vector2.prototype.roundTo = function (decimalPlaces) {
        decimalPlaces = Math.pow(10, decimalPlaces);
        this.x = Math.round(this.x * decimalPlaces) / decimalPlaces;
        this.y = Math.round(this.y * decimalPlaces) / decimalPlaces;
        return this;
    };
    //#endregion
    //#region Cloning
    /**
     * Creates a new instance of a vector with the same values as this one.
     * @returns a new vector with the same values as this one.
     */
    Vector2.prototype.clone = function () {
        return new Vector2(this.x, this.y); // Because optional unspecified is faster
    };
    //#endregion
    Vector2.prototype.normalize = function () {
        if (this.x !== 0 || this.y !== 0) {
            var l = this.length();
            if (l > 0) {
                this.x /= l;
                this.y /= l;
            }
            else {
                this.x = this.y = 0;
            }
        }
    };
    //#region Math
    /**
     * Returns the distance between the point of this vector and another.
     * @param v The other vector.
     * @returns the distance between the point of this vector and the other.
     * @throws Error if v is null or undefined.
     */
    Vector2.prototype.distance = function (v) {
        return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
    };
    /**
     * Returns the distance squared between the point of this vector and another.
     * @param v The other vector.
     * @returns the distance squared between the point of this vector and the other.
     * @throws Error if v is null or undefined.
     */
    Vector2.prototype.distanceSquared = function (v) {
        return (this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y);
    };
    /**
     * Returns the length of this vector.
     * @returns the length of this vector.
     */
    Vector2.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    /**
     * Returns the length squared of this vector.
     * @returns the length squared of this vector.
     */
    Vector2.prototype.lengthSquared = function () {
        return this.x * this.x + this.y * this.y;
    };
    //#endregion
    //#region Interpolation
    /**
     * Interpolates along the vector at the given scale s [0-1].
     * @param s The scale along the vector [0-1].
     * @param out The vector to set components of.
     * @return out or a new vector.
     */
    Vector2.prototype.interpolate = function (s, out) {
        out = out || new Vector2();
        out.x = this.x * s;
        out.y = this.y * s;
        return out;
    };
    //#endregion
    //#region String
    /**
     * Returns a human readable string of this object.
     * @returns a human readable string of this object.
     */
    Vector2.prototype.toString = function () {
        return "[Vector2 (x=" + this.x + " y=" + this.y + ")]";
    };
    return Vector2;
}());
/** @file Matrix2D.ts */
/// <reference path="../MathUtil.ts" />
/// <reference path="Vector2.ts" />
/**
 * A 2 dimensional matrix suited for graphics transformations.
 */
var Matrix2D = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new Matrix object with the specified parameters. Default params will set to identity.
     * @param a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
     * @param b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
     * @param c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
     * @param d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
     * @param tx The distance by which to translate each point along the x axis.
     * @param ty The distance by which to translate each point along the y axis.
     */
    function Matrix2D(a, b, c, d, tx, ty) {
        if (a === void 0) { a = 1; }
        if (b === void 0) { b = 0; }
        if (c === void 0) { c = 0; }
        if (d === void 0) { d = 1; }
        if (tx === void 0) { tx = 0; }
        if (ty === void 0) { ty = 0; }
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    }
    Object.defineProperty(Matrix2D.prototype, "isIdentity", {
        /** Returns true if this matrix is currently the identity. */
        get: function () { return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.tx === 0 && this.ty === 0; },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Setting
    /**
     * Manually sets each component of the matrix.
     * @returns this matrix.
     */
    Matrix2D.prototype.set = function (a, b, c, d, tx, ty) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        return this;
    };
    /**
     * Copies the values of one matrix to this matrix.
     * @param m The matrix to copy.
     * @returns this matrix.
     */
    Matrix2D.prototype.copy = function (m) {
        this.a = m.a;
        this.b = m.b;
        this.c = m.c;
        this.d = m.d;
        this.tx = m.tx;
        this.ty = m.ty;
        return this;
    };
    Matrix2D.prototype.concat = function (m, x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        this.a = m.a;
        this.b = m.b;
        this.c = m.c;
        this.d = m.d;
        this.tx = m.tx;
        this.ty = m.ty;
        var cos, sin;
        if (rotation % 360) {
            //var r:number = rotation * MathUtil.DEG_TO_RAD;
            //var cos:number = Math.cos(r);
            //var sin:number = Math.sin(r);
            cos = MathUtil.cosDegrees(rotation);
            sin = MathUtil.sinDegrees(rotation);
        }
        else {
            cos = 1;
            sin = 0;
        }
        if (skewX || skewY) {
            //skewX *= MathUtil.DEG_TO_RAD;
            //skewY *= MathUtil.DEG_TO_RAD;
            //this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
            //this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
            // TODO: FUTURE- can this be combined into a single append operation?
            // TODO: FUTURE- after combining the operations, it should be inlined.
            this.append(MathUtil.cosDegrees(skewY), MathUtil.sinDegrees(skewY), -MathUtil.sinDegrees(skewX), MathUtil.cosDegrees(skewX), x, y);
            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
        }
        else {
            // TODO: FUTURE- inline, this is a major perf drag
            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
        }
        if (regX || regY) {
            // append the registration offset
            this.tx -= regX * this.a + regY * this.c;
            this.ty -= regX * this.b + regY * this.d;
        }
        return this;
    };
    /**
     * Sets to an identity matrix.
     * @returns this matrix.
     */
    Matrix2D.prototype.identity = function () {
        this.a = this.d = 1;
        this.b = this.c = this.tx = this.ty = 0;
        return this;
    };
    /**
     * Sets the values of this matrix as specified by the transform properties supplied.
     * @param x The x position.
     * @param y The y position.
     * @param scaleX The x scale.
     * @param scaleY The y scale.
     * @param rotation The rotation in degrees.
     * @param skewX	The x skew.
     * @param skewY The y skew.
     * @param regX The x registration point to transform around.
     * @param regY The y registration point to transform around.
     * @returns This matrix.
     */
    Matrix2D.prototype.setTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        this.a = this.d = 1;
        this.b = this.c = this.tx = this.ty = 0;
        var cos, sin;
        if (rotation % 360) {
            //var r:number = rotation * MathUtil.DEG_TO_RAD;
            //var cos:number = Math.cos(r);
            //var sin:number = Math.sin(r);
            cos = MathUtil.cosDegrees(rotation);
            sin = MathUtil.sinDegrees(rotation);
        }
        else {
            cos = 1;
            sin = 0;
        }
        if (skewX || skewY) {
            //skewX *= MathUtil.DEG_TO_RAD;
            //skewY *= MathUtil.DEG_TO_RAD;
            //this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
            //this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
            // TODO: FUTURE- can this be combined into a single append operation?
            // TODO: FUTURE- after combining the operations, it should be inlined.
            this.append(MathUtil.cosDegrees(skewY), MathUtil.sinDegrees(skewY), -MathUtil.sinDegrees(skewX), MathUtil.cosDegrees(skewX), x, y);
            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
        }
        else {
            // TODO: FUTURE- Inline
            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y); // TODO: FUTURE- this is a major drag
        }
        if (regX || regY) {
            // append the registration offset:
            this.tx -= regX * this.a + regY * this.c;
            this.ty -= regX * this.b + regY * this.d;
        }
        return this;
    };
    //#endregion
    //#region Math
    /**
     * Inverts the matrix.
     * @returns This matrix, now inverted.
     */
    Matrix2D.prototype.invert = function () {
        /* // Orig code
        var a1:number = this.a;
        var b1:number = this.b;
        var c1:number = this.c;
        var d1:number = this.d;
        var tx1:number = this.tx;
        var n:number = a1 * d1 - b1 * c1;

        this.a = d1 / n;
        this.b = -b1 / n;
        this.c = -c1 / n;
        this.d = a1 / n;
        this.tx = (c1 * this.ty - d1 * tx1) / n;
        this.ty = -(a1 * this.ty - b1 * tx1) / n;
        */
        // Opt code
        var a1 = this.a; // req
        var tx1 = this.tx; // req
        var n = a1 * this.d - this.b * this.c;
        this.tx = (this.c * this.ty - this.d * tx1) / n;
        this.ty = -(this.a * this.ty - this.b * tx1) / n;
        this.a = this.d / n;
        this.b = -this.b / n;
        this.c = -this.c / n;
        this.d = a1 / n;
        return this;
    };
    /**
     * Appends a matrix as specified by the supplied components to this matrix.
     * @param a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
     * @param b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
     * @param c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
     * @param d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
     * @param tx The distance by which to translate each point along the x axis.
     * @param ty The distance by which to translate each point along the y axis.
     * @returns This matrix.
     */
    Matrix2D.prototype.append = function (a, b, c, d, tx, ty) {
        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;
        if (a !== 1 || b !== 0 || c !== 0 || d !== 1) {
            this.a = a1 * a + c1 * b;
            this.b = b1 * a + d1 * b;
            this.c = a1 * c + c1 * d;
            this.d = b1 * c + d1 * d;
        }
        this.tx = a1 * tx + c1 * ty + this.tx;
        this.ty = b1 * tx + d1 * ty + this.ty;
        return this;
    };
    /**
     * Appends the specified matrix to this matrix.
     * @param m The matrix to append.
     * @returns This matrix.
     */
    Matrix2D.prototype.appendMatrix = function (m) {
        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;
        if (m.a !== 1 || m.b !== 0 || m.c !== 0 || m.d !== 1) {
            this.a = a1 * m.a + c1 * m.b;
            this.b = b1 * m.a + d1 * m.b;
            this.c = a1 * m.c + c1 * m.d;
            this.d = b1 * m.c + d1 * m.d;
        }
        this.tx = a1 * m.tx + c1 * m.ty + this.tx;
        this.ty = b1 * m.tx + d1 * m.ty + this.ty;
        return this;
    };
    /**
     * Appends a matrix as specified by the transform properties supplied.
     * @param x The x position.
     * @param y The y position.
     * @param scaleX The x scale.
     * @param scaleY The y scale.
     * @param rotation The rotation in degrees.
     * @param skewX	The x skew.
     * @param skewY The y skew.
     * @param regX The x registration point to transform around.
     * @param regY The y registration point to transform around.
     * @returns This matrix.
     */
    Matrix2D.prototype.appendTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        var cos, sin;
        if (rotation % 360) {
            //var r:number = rotation * MathUtil.DEG_TO_RAD;
            //var cos:number = Math.cos(r);
            //var sin:number = Math.sin(r);
            cos = MathUtil.cosDegrees(rotation);
            sin = MathUtil.sinDegrees(rotation);
        }
        else {
            cos = 1;
            sin = 0;
        }
        if (skewX || skewY) {
            //skewX *= MathUtil.DEG_TO_RAD;
            //skewY *= MathUtil.DEG_TO_RAD;
            //this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
            //this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
            // TODO: FUTURE- can this be combined into a single append operation?
            // TODO: FUTURE- after combining the operations, it should be inlined.
            this.append(MathUtil.cosDegrees(skewY), MathUtil.sinDegrees(skewY), -MathUtil.sinDegrees(skewX), MathUtil.cosDegrees(skewX), x, y);
            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
        }
        else {
            // TODO: FUTURE- inline, this is a major perf drag
            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
        }
        if (regX || regY) {
            // append the registration offset
            this.tx -= regX * this.a + regY * this.c;
            this.ty -= regX * this.b + regY * this.d;
        }
        return this;
    };
    /**
     * Prepends a matrix as specified by the supplied components to this matrix.
     * @param a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
     * @param b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
     * @param c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
     * @param d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
     * @param tx The distance by which to translate each point along the x axis.
     * @param ty The distance by which to translate each point along the y axis.
     * @returns This matrix.
     */
    Matrix2D.prototype.prepend = function (a, b, c, d, tx, ty) {
        var a1 = this.a;
        var c1 = this.c;
        var tx1 = this.tx;
        this.a = a * a1 + c * this.b;
        this.b = b * a1 + d * this.b;
        this.c = a * c1 + c * this.d;
        this.d = b * c1 + d * this.d;
        this.tx = a * tx1 + c * this.ty + tx;
        this.ty = b * tx1 + d * this.ty + ty;
        return this;
    };
    /**
     * Prepends the specified matrix to this matrix.
     * @param m The matrix to append.
     * @returns This matrix.
     */
    Matrix2D.prototype.prependMatrix = function (m) {
        var a1 = this.a;
        var c1 = this.c;
        var tx1 = this.tx;
        this.a = m.a * a1 + m.c * this.b;
        this.b = m.b * a1 + m.d * this.b;
        this.c = m.a * c1 + m.c * this.d;
        this.d = m.b * c1 + m.d * this.d;
        this.tx = m.a * tx1 + m.c * this.ty + m.tx;
        this.ty = m.b * tx1 + m.d * this.ty + m.ty;
        return this;
    };
    /**
     * Prepends a matrix as specified by the transform properties supplied.
     * @param x The x position.
     * @param y The y position.
     * @param scaleX The x scale.
     * @param scaleY The y scale.
     * @param rotation The rotation in degrees.
     * @param skewX	The x skew.
     * @param skewY The y skew.
     * @param regX The x registration point to transform around.
     * @param regY The y registration point to transform around.
     * @returns This matrix.
     */
    Matrix2D.prototype.prependTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        // TODO: FUTURE- optimize / inline
        var m = Matrix2D._helper.setTransform(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY);
        return this.prepend(m.a, m.b, m.c, m.d, m.tx, m.ty);
    };
    //#endregion
    //#region Vectors
    /**
     * Transforms a point according to this matrix.
     * Deforms the vector and returns it.
     * @param v The vector to transform.
     * @returns The same vector, transformed.
     */
    Matrix2D.prototype.transformVector = function (v) {
        var x = v.x;
        var y = v.y;
        v.x = x * this.a + y * this.c + this.tx;
        v.y = x * this.b + y * this.d + this.ty;
        return v;
    };
    //#endregion
    //#region Cloning
    /**
     * Returns a new matrix with the same values as this matrix.
     * @returns a new matrix with the same values as this matrix.
     */
    Matrix2D.prototype.clone = function () {
        return new Matrix2D(this.a, this.b, this.c, this.d, this.tx, this.ty);
    };
    //#endregion
    //#region Equatable
    /**
     * Returns true if the specied matrix's components match this one's.
     * @param m The matrix to compare.
     * @returns true if the specied matrix's components match this one's.
     */
    Matrix2D.prototype.equals = function (m) {
        return m.a === this.a && m.b === this.b && m.c === this.c && m.d === this.d && m.tx === this.tx && m.ty === this.ty;
    };
    //#endregion
    //#region String
    /**
     * Returns a human readable string of this object.
     * @returns a human readable string of this object.
     */
    Matrix2D.prototype.toString = function () {
        return "[Matrix2D (a=" + this.a + " b=" + this.b + " c=" + this.c + " d=" + this.d + " tx=" + this.tx + " ty=" + this.ty + ")]";
    };
    //#region Static Members
    /** A helper matrix, this shouldn't be needed eventually after optimizations. */
    Matrix2D._helper = new Matrix2D();
    return Matrix2D;
}());
/** @file Texture.ts */
var Texture = /** @class */ (function () {
    function Texture(src) {
        /** The textures x registration point. */
        this.x = 0;
        /** The textures y registration point. */
        this.y = 0;
        this.canvas = document.createElement("canvas");
        this.width = this.canvas.width = src.width;
        this.height = this.canvas.height = src.height;
        var ctx = this.canvas.getContext("2d");
        ctx.drawImage(src, 0, 0);
    }
    return Texture;
}());
/** @file Color.ts */
/**
 * Represents a color with rgba components ranging from 0 to 1 inclusively.
 */
var Color = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Constructs a new color. Default params create opaque white.
     * @param r The red color component [0-1].
     * @param g The green color component [0-1].
     * @param b The blue color component [0-1].
     * @param a The alpha color component [0-1].
     */
    function Color(r, g, b, a) {
        if (r === void 0) { r = 1; }
        if (g === void 0) { g = 1; }
        if (b === void 0) { b = 1; }
        if (a === void 0) { a = 1; }
        this._r = (r >= 1 ? 1 : r <= 0 ? 0 : r);
        this._g = (g >= 1 ? 1 : g <= 0 ? 0 : g);
        this._b = (b >= 1 ? 1 : b <= 0 ? 0 : b);
        this._a = (a >= 1 ? 1 : a <= 0 ? 0 : a);
    }
    Object.defineProperty(Color.prototype, "r", {
        //#region Members
        /** The red color component [0-1]. */
        get: function () { return this._r; },
        set: function (v) { this._r = (v >= 1 ? 1 : v <= 0 ? 0 : v); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Color.prototype, "g", {
        /** The green color component [0-1]. */
        get: function () { return this._g; },
        set: function (v) { this._g = (v >= 1 ? 1 : v <= 0 ? 0 : v); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Color.prototype, "b", {
        /** The blue color component [0-1]. */
        get: function () { return this._b; },
        set: function (v) { this._b = (v >= 1 ? 1 : v <= 0 ? 0 : v); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Color.prototype, "a", {
        /** The alpha color component [0-1]. */
        get: function () { return this._a; },
        set: function (v) { this._a = (v >= 1 ? 1 : v <= 0 ? 0 : v); },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Setting
    /**
     * Copies the values of the other color to this color.
     * @param other The color to copy.
     * @throws Error if other is not a valid color.
     */
    Color.prototype.copy = function (other) {
        this._r = other._r;
        this._g = other._g;
        this._b = other._b;
        this._a = other._a;
        return this;
    };
    /**
     * Sets the color components.
     * @param r The red color component [0-1].
     * @param g The green color component [0-1].
     * @param b The blue color component [0-1].
     * @param a The alpha color component [0-1].
     */
    Color.prototype.set = function (r, g, b, a) {
        this._r = (r >= 1 ? 1 : r <= 0 ? 0 : r);
        this._g = (g >= 1 ? 1 : g <= 0 ? 0 : g);
        this._b = (b >= 1 ? 1 : b <= 0 ? 0 : b);
        this._a = (a >= 1 ? 1 : a <= 0 ? 0 : a);
        return this;
    };
    /**
     * Sets this color
     * @param fromColor The color to tween from.
     * @param toColor The color to tween to.
     * @param pct The amount to interpolate.
     * @return This color for chaining.
     */
    Color.prototype.interpolateFromTo = function (fromColor, toColor, pct) {
        return this.set(pct * (toColor._r - fromColor._r) + fromColor._r, pct * (toColor._g - fromColor._g) + fromColor._g, pct * (toColor._b - fromColor._b) + fromColor._b, pct * (toColor._a - fromColor._a) + fromColor._a);
    };
    //#endregion
    //#region Equatable
    /**
     * Returns true iff the other color supplied matches.
     * @param other The color to compare to.
     * @throws Error if other is not a valid color.
     */
    Color.prototype.equals = function (other) {
        return (this._r === other._r && this._g === other._g && this._b === other._b && this._a === other._a);
    };
    //#endregion
    //#region Cloning
    /**
     * Create a new color with the same color components.
     * @returns A new color with the same color components.
     */
    Color.prototype.clone = function () {
        return new Color(this._r, this._g, this._b, this._a);
    };
    //#endregion
    //#region Conversion
    /**
     * Returns a 6 character hex css style RGB value created from the rgb components of this color. Example #FFFFFF.
     * NOTE: Endianness may be an issue on some systems.
     * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     * @returns A 6 character hex css style RGB value created from the rgb components of this color. Example #FFFFFF.
     */
    Color.prototype.toStyleHexRGB = function () {
        var r = Math.round(this._r * 255);
        var g = Math.round(this._g * 255);
        var b = Math.round(this._b * 255);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };
    /**
     * Sets the folor components from a 3 or 6 character hex css style RGB value to the.
     * NOTE: untested
     * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     * @param rgbHex The color string to read from. Example #FFFFFF or #FFF.
     * @return this Color.
     */
    Color.prototype.fromStyleHexRGB = function (rgbHex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        rgbHex = rgbHex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rgbHex);
        if (!result)
            throw new Error("Not a valid 6 or 3 char hex rgb value! " + rgbHex);
        this.r = parseInt(result[1], 16) / 255;
        this.g = parseInt(result[2], 16) / 255;
        this.b = parseInt(result[3], 16) / 255;
        return this;
    };
    /**
     * Returns a rgba() css style function string created from the rgba components of this color. Example rgba(255, 255, 255, 1).
     * NOTE: Endianness may be an issue on some systems.
     * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     * @returns A rgba() css style function string created from the rgba components of this color. Example rgba(255, 255, 255, 1).
     */
    Color.prototype.toStyleFuncRGBA = function () {
        return "rgba(" + Math.round(this._r * 255) + ", " + Math.round(this._g * 255) + ", " + Math.round(this._b * 255) + ", " + this._a + ")";
    };
    return Color;
}());
/** @file FillStyle.ts */
/** @file FillSettings.ts */
/// <reference path="FillStyle.ts" />
/**
 * Wraps fill settings into a single class
 */
var FillSettings = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new fill style.
     * @param style The fill style to use.
     */
    function FillSettings(style) {
        if (style === void 0) { style = "#000000"; }
        this.style = style;
    }
    return FillSettings;
}());
/** @file StrokeStyle.ts */
/** @file LineCap.ts */
/** @file LineJoin.ts */
/** @file StrokeSettings.ts */
/// <reference path="StrokeStyle.ts" />
/// <reference path="LineCap.ts" />
/// <reference path="LineJoin.ts" />
/**
 * Wraps stroke settings into a single class
 */
var StrokeSettings = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new stroke settings.
     * @param style The stroke style to use.
     * @param width The stroke width to use.
     * @param underFill Indicates if the stroke should be drawn under the fill (opposite of normal). Default false.
     * @param cap The line cap to use.
     * @param dash The line dash pattern to use.
     * @param dashOffset The line dash offset to use.
     * @param join The line join setting.
     * @param miter The line miter setting.
     */
    function StrokeSettings(style, width, underFill, cap, dash, dashOffset, join, miter) {
        if (style === void 0) { style = "#000000"; }
        if (width === void 0) { width = 1; }
        if (underFill === void 0) { underFill = false; }
        if (cap === void 0) { cap = "butt" /* Butt */; }
        if (dash === void 0) { dash = []; }
        if (dashOffset === void 0) { dashOffset = 0; }
        if (join === void 0) { join = "miter" /* Miter */; }
        if (miter === void 0) { miter = 10; }
        this.style = style;
        this.width = width;
        this.underFill = underFill;
        this.cap = cap;
        this.dash = dash;
        this.dashOffset = dashOffset;
        this.join = join;
        this.miter = miter;
    }
    return StrokeSettings;
}());
/** @file TextStyle.ts */
/** @file TextAlign.ts */
/** @file TextBaseline.ts */
/** @file TextSettings.ts */
/// <reference path="../../../font/Font.ts" />
/// <reference path="TextStyle.ts" />
/// <reference path="TextAlign.ts" />
/// <reference path="TextBaseline.ts" />
/**
 * Wraps text settings into a single class.
 */
var TextSettings = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new Font setting.
     * @param font The font to use.
     * @param size The pixel size. Default 10.
     * @param align The text alignment. Default Start.
     * @param baseline The text baseline. Default Alphabetic.
     */
    function TextSettings(font, size, align, baseline) {
        if (size === void 0) { size = 10; }
        if (align === void 0) { align = "left" /* Left */; }
        if (baseline === void 0) { baseline = "top" /* Top */; }
        this.font = font;
        this.size = size;
        this.align = align;
        this.baseline = baseline;
    }
    return TextSettings;
}());
/** @file GraphicsContext.ts */
/// <reference path="../math/geom/Matrix2D.ts" />
/// <reference path="Texture.ts" />
/// <reference path="support/color/Color.ts" />
/// <reference path="support/fill/FillSettings.ts" />
/// <reference path="support/stroke/StrokeSettings.ts" />
/// <reference path="support/text/TextSettings.ts" />
var GraphicsContext = /** @class */ (function () {
    function GraphicsContext(canvas) {
        this.matrix = new Matrix2D();
        this.alpha = 1;
        this.text = new TextSettings(null);
        this.fill = new FillSettings();
        this.stroke = new StrokeSettings();
        this.fillStyleOverride = null;
        this.strokeStyleOverride = null;
        this.imageSmoothingEnabled = true;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.globalAlpha = 1;
        if (this.ctx.imageSmoothingEnabled !== undefined)
            this.imageSmoothingEnabledProp = "imageSmoothingEnabled";
        else if (this.ctx.msImageSmoothingEnabled !== undefined)
            this.imageSmoothingEnabledProp = "msImageSmoothingEnabled";
        else if (this.ctx.mozImageSmoothingEnabled !== undefined)
            this.imageSmoothingEnabledProp = "mozImageSmoothingEnabled";
        else if (this.ctx.webkitImageSmoothingEnabled !== undefined)
            this.imageSmoothingEnabledProp = "webkitImageSmoothingEnabled";
        else if (this.ctx.oImageSmoothingEnabled !== undefined)
            this.imageSmoothingEnabledProp = "oImageSmoothingEnabled";
        // tslint:disable-next-line: no-console
        if (!this.imageSmoothingEnabledProp)
            console.warn("Image smoothing control is not available");
        // tslint:disable-next-line: no-console
        else if (this.imageSmoothingEnabledProp !== "imageSmoothingEnabled")
            console.info("Using polyfill image smoothing control: " + this.imageSmoothingEnabledProp);
        this.clear(false);
    }
    GraphicsContext.prototype.resize = function (width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.clear(false);
    };
    GraphicsContext.prototype.clear = function (clearPixels) {
        if (clearPixels) {
            if (!this.matrix.isIdentity)
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
        else {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.matrix.identity();
        if (this.imageSmoothingEnabledProp) {
            this.imageSmoothingEnabled = this.ctx[this.imageSmoothingEnabledProp];
        }
        else {
            this.imageSmoothingEnabled = true;
        }
        this.alpha = this.ctx.globalAlpha;
        this.fill.style = this.ctx.fillStyle || null;
        this.stroke.style = this.ctx.strokeStyle || null;
        this.stroke.width = this.ctx.lineWidth;
        this.stroke.cap = this.ctx.lineCap || null;
        this.stroke.dash = this.ctx.getLineDash() || [];
        this.stroke.dashOffset = this.ctx.lineDashOffset;
        this.stroke.join = this.ctx.lineJoin || null;
        this.stroke.miter = this.ctx.miterLimit;
        this.stroke.underFill = false;
        this._fontStr = this.ctx.font; // has size and face built into it
        this.text.align = this.ctx.textAlign || null;
        // Text baseline must always be set to alphabetic
        var textBaseline = this.ctx.textBaseline;
        if (textBaseline !== "alphabetic") {
            this.ctx.textBaseline = "alphabetic";
        }
    };
    GraphicsContext.prototype.apply = function (matrix, alpha, text, fill, stroke, imageSmoothingEnabled) {
        // Apply matrix
        if (!this.matrix.equals(matrix)) {
            this.matrix.copy(matrix);
            this.ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        }
        // Apply alpha
        if (this.alpha !== alpha) {
            this.ctx.globalAlpha = this.alpha = alpha;
        }
        if (this.imageSmoothingEnabled !== imageSmoothingEnabled) {
            if (this.imageSmoothingEnabledProp) {
                this.ctx[this.imageSmoothingEnabledProp] = imageSmoothingEnabled;
            }
            this.imageSmoothingEnabled = imageSmoothingEnabled;
        }
        // Apply font
        if (text) {
            var nextFontStr = ""; // see https://developer.mozilla.org/en-US/docs/Web/CSS/font
            if (text.font.style)
                nextFontStr += text.font.style + " ";
            if (text.font.variant)
                nextFontStr += text.font.variant + " ";
            if (text.font.weight)
                nextFontStr += text.font.weight + " ";
            nextFontStr += text.size + "px ";
            nextFontStr += text.font.family;
            if (this._fontStr !== nextFontStr) {
                this.text.font = text.font;
                this.text.size = text.size;
                this.ctx.font = this._fontStr = nextFontStr;
            }
            if (this.text.align !== text.align) {
                this.ctx.textAlign = this.text.align = text.align;
            }
            if (this.text.baseline !== text.baseline) {
                this.text.baseline = text.baseline;
                // No need to change state here, baseline is handled by the renderer
            }
        }
        // Apply fill
        if (fill) {
            var fillStyle = this.fillStyleOverride !== null ? this.fillStyleOverride : fill.style;
            if (this.fill.style !== fillStyle) {
                this.ctx.fillStyle = this.fill.style = fillStyle;
            }
        }
        // Apply stroke
        if (stroke) {
            if (this.stroke.cap !== stroke.cap) {
                this.ctx.lineCap = this.stroke.cap = stroke.cap;
            }
            if (stroke.dash.length > 0 || this.stroke.dash.length > 0) // if has stroke, or no stroke currently have stroke set
             {
                var diff = false;
                if (stroke.dash.length !== this.stroke.dash.length) {
                    diff = true;
                }
                else {
                    for (var i = 0; i < stroke.dash.length; ++i) {
                        if (stroke.dash[i] !== this.stroke.dash[i]) {
                            diff = true;
                            break;
                        }
                    }
                }
                if (diff) {
                    this.stroke.dash = stroke.dash.slice(0);
                    this.ctx.setLineDash(this.stroke.dash);
                }
            }
            if (this.stroke.dashOffset !== stroke.dashOffset) {
                this.ctx.lineDashOffset = this.stroke.dashOffset = stroke.dashOffset;
            }
            if (this.stroke.join !== stroke.join) {
                this.ctx.lineJoin = this.stroke.join = stroke.join;
            }
            if (this.stroke.miter !== stroke.miter) {
                this.ctx.miterLimit = this.stroke.miter = stroke.miter;
            }
            var strokeStyle = this.strokeStyleOverride !== null ? this.strokeStyleOverride : stroke.style;
            if (this.stroke.style !== strokeStyle) {
                this.ctx.strokeStyle = this.stroke.style = strokeStyle;
            }
            if (this.stroke.width !== stroke.width) {
                this.ctx.lineWidth = this.stroke.width = stroke.width;
            }
        }
    };
    GraphicsContext.prototype.applyTextSettings = function (text) {
        // Apply font
        if (text) {
            var nextFontStr = ""; // see https://developer.mozilla.org/en-US/docs/Web/CSS/font
            if (text.font.style)
                nextFontStr += text.font.style + " ";
            if (text.font.variant)
                nextFontStr += text.font.variant + " ";
            if (text.font.weight)
                nextFontStr += text.font.weight + " ";
            nextFontStr += text.size + "px ";
            nextFontStr += text.font.family;
            if (this._fontStr !== nextFontStr) {
                this.text.font = text.font;
                this.text.size = text.size;
                this.ctx.font = this._fontStr = nextFontStr;
            }
            if (this.text.align !== text.align) {
                this.ctx.textAlign = this.text.align = text.align;
            }
            if (this.text.baseline !== text.baseline) {
                this.text.baseline = text.baseline;
                // No need to change state here, baseline is handled by the renderer
            }
        }
    };
    //#region Text Measuring
    /**
     * Measures the given string using the given text settings.
     * @param str The string to measure.
     * @param text The text settings to measure with.
     */
    GraphicsContext.prototype.measureText = function (str, text) {
        this.applyTextSettings(text);
        return this.ctx.measureText(str);
    };
    //#endregion
    /**
     * Draws a CanvasImageSource from the specified src rect in the img to the destination rect supplied.
     * @param matrix The transformation matrix to set.
     * @param alpha The global alpha to set.
     * @param img The img to draw.
     * @param sX The src rectangle x.
     * @param sY The src rectangle y.
     * @param sW The src rectangle w.
     * @param sH The src rectangle h.
     * @param dX The dest rectangle x.
     * @param dY The dest rectangle y.
     * @param dW The dest rectangle w.
     * @param dH The dest rectangle h.
     */
    GraphicsContext.prototype.drawImage = function (matrix, alpha, img, sX, sY, sW, sH, dX, dY, dW, dH, imageSmoothingEnabled) {
        if (imageSmoothingEnabled === void 0) { imageSmoothingEnabled = true; }
        if (sW === 0 || sH === 0 || dW === 0 || dH === 0 || !img || alpha === 0)
            return; // nothing to draw
        this.apply(matrix, alpha, null, null, null, imageSmoothingEnabled);
        this.ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
    };
    /**
     * Draws the supplied string at the given location with the supplied fill and/or stroke and shadow.
     * If you don't supply a stroke or a fill, nothing will be rendered.
     * Stroke and fill order (if both are supplied) is determined by the stroke.underFill property.
     * @param matrix The transformation matrix to draw at.
     * @param alpha The alpha to draw with.
     * @param x An additional x transformation to draw with.
     * @param y An additional y transformation to draw with.
     * @param str The string to draw.
     * @param text The font settings to use.
     * @param fill The fill settings to use. Supply null for no fill.
     * @param stroke The stroke settings to use. Supply stroke for no fill.
     */
    GraphicsContext.prototype.drawText = function (matrix, alpha, x, y, str, text, fill, stroke, imageSmoothingEnabled) {
        if (imageSmoothingEnabled === void 0) { imageSmoothingEnabled = true; }
        if (!str || str === "" || !text || (!fill && !stroke))
            return; // nothing to draw
        this.apply(matrix, alpha, text, fill, stroke, imageSmoothingEnabled);
        // Offset for baseline
        if (this.text.font.metrics) {
            if (this.text.baseline === "top" /* Top */) {
                y += this.text.font.metrics.ascent / this.text.font.metrics.unitsPerEm * this.text.size;
            }
            else if (this.text.baseline === "alphabetic" /* Alphabetic */) {
                y += 0;
            }
            else if (this.text.baseline === "bottom" /* Bottom */) {
                y += this.text.font.metrics.descent / this.text.font.metrics.unitsPerEm * this.text.size;
            }
            else if (this.text.baseline === "middle" /* Middle */) {
                var top_1 = this.text.font.metrics.ascent / this.text.font.metrics.unitsPerEm * this.text.size;
                var bottom = this.text.font.metrics.descent / this.text.font.metrics.unitsPerEm * this.text.size;
                y += (top_1 + bottom) / 2;
            }
            else {
                throw new Error("Text Baseline " + this.text.baseline + " is not yet supported!");
            }
        }
        if (stroke && stroke.underFill) {
            this.ctx.strokeText(str, x, y);
        }
        if (fill) {
            this.ctx.fillText(str, x, y);
        }
        if (stroke && !stroke.underFill) {
            this.ctx.strokeText(str, x, y);
        }
    };
    /**
     * Draws a rectangle of the supplied size with the supplied fill and/or stroke.
     * If you don't supply a stroke or a fill, nothing will be rendered.
     * Stroke and fill order (if both are supplied) is determined by the stroke.underFill property.
     * @param matrix The transformation matrix to draw at.
     * @param alpha The alpha to draw with.
     * @param x An additional x transformation to draw with.
     * @param y An additional y transformation to draw with.
     * @param w The width to draw.
     * @param h The height ot draw.
     * @param fill The fill settings to use. Supply null for no fill.
     * @param stroke The stroke settings to use. Supply stroke for no fill.
     */
    GraphicsContext.prototype.drawRect = function (matrix, alpha, x, y, w, h, fill, stroke, imageSmoothingEnabled) {
        if (imageSmoothingEnabled === void 0) { imageSmoothingEnabled = true; }
        if (w === 0 || h === 0 || (!fill && !stroke))
            return; // nothing to draw
        this.apply(matrix, alpha, null, fill, stroke, imageSmoothingEnabled);
        if (stroke && stroke.underFill) {
            this.ctx.strokeRect(x, y, w, h);
        }
        if (fill) {
            this.ctx.fillRect(x, y, w, h);
        }
        if (stroke && !stroke.underFill) {
            this.ctx.strokeRect(x, y, w, h);
        }
    };
    /**
     * Draws an a line.
     * If you don't supply a stroke, nothing will be rendered.
     * @param matrix The transformation matrix to draw at.
     * @param alpha The alpha to draw with.
     * @param x x of starting point.
     * @param y y of starting point.
     * @param x2 x of ending point.
     * @param y2 y of ending point.
     * @param stroke The stroke settings to use. Supply stroke for no fill.
     */
    GraphicsContext.prototype.drawLine = function (matrix, alpha, x, y, x2, y2, stroke, imageSmoothingEnabled) {
        if (imageSmoothingEnabled === void 0) { imageSmoothingEnabled = true; }
        if (!stroke)
            return; // nothing to draw
        this.apply(matrix, alpha, null, null, stroke, imageSmoothingEnabled);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    };
    /**
     * Draws a rectangle of the supplied size with the supplied fill and/or stroke and shadow.
     * If you don't supply a stroke or a fill, nothing will be rendered.
     * Stroke and fill order (if both are supplied) is determined by the stroke.underFill property.
     * @param matrix The transformation matrix to draw at.
     * @param alpha The alpha to draw with.
     * @param x An additional x transformation to draw with.
     * @param y An additional y transformation to draw with.
     * @param w The width to draw.
     * @param h The height ot draw.
     * @param rtl The top left radius in pixels.
     * @param rtr The top right radius in pixels.
     * @param rbr The bottom right radius in pixels.
     * @param rbl The bottom left radius in pixels.
     * @param fill The fill settings to use. Supply null for no fill.
     * @param stroke The stroke settings to use. Supply stroke for no fill.
     */
    GraphicsContext.prototype.drawRoundedRect = function (matrix, alpha, x, y, w, h, rtl, rtr, rbr, rbl, fill, stroke, imageSmoothingEnabled) {
        if (imageSmoothingEnabled === void 0) { imageSmoothingEnabled = true; }
        if (w === 0 || h === 0 || (!fill && !stroke) || alpha === 0)
            return; // nothing to draw
        this.apply(matrix, alpha, null, fill, stroke, imageSmoothingEnabled);
        this.ctx.beginPath();
        this.ctx.moveTo(x + rtl, y);
        this.ctx.lineTo(x + w - rtr, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + rtr);
        this.ctx.lineTo(x + w, y + h - rbr);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - rbr, y + h);
        this.ctx.lineTo(x + rbl, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - rbl);
        this.ctx.lineTo(x, y + rtl);
        this.ctx.quadraticCurveTo(x, y, x + rtl, y);
        this.ctx.closePath();
        this.fillStroke(fill, stroke);
    };
    /**
     * Draws a path.
     * @param matrix The transformation matrix to draw at.
     * @param alpha The alpha to draw with.
     * @param path The set of points to move to.
     * @param fill The fill settings to use. Supply null for no fill.
     * @param stroke The stroke settings to use. Supply stroke for no fill.
     */
    GraphicsContext.prototype.drawPath = function (matrix, alpha, path, fill, stroke, close, imageSmoothingEnabled) {
        if (close === void 0) { close = true; }
        if (imageSmoothingEnabled === void 0) { imageSmoothingEnabled = true; }
        if (path.length <= 1 || (!fill && !stroke))
            return; // nothing to draw
        this.apply(matrix, alpha, null, fill, stroke, imageSmoothingEnabled);
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (var i = 1; i < path.length; ++i) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        if (close && path.length > 2) {
            this.ctx.lineTo(path[0].x, path[0].y);
        }
        this.fillStroke(fill, stroke);
    };
    /**
     * Draws a circle of the supplied radius with the supplied fill and/or stroke and shadow.
     * If you don't supply a stroke or a fill, nothing will be rendered.
     * Stroke and fill order (if both are supplied) is determined by the stroke.underFill property.
     * @param matrix The transformation matrix to draw at.
     * @param alpha The alpha to draw with.
     * @param x An additional x transformation to draw with.
     * @param y An additional y transformation to draw with.
     * @param r The radius to draw.
     * @param fill The fill settings to use. Supply null for no fill.
     * @param stroke The stroke settings to use. Supply stroke for no fill.
     */
    GraphicsContext.prototype.drawCircle = function (matrix, alpha, x, y, r, startAngle, endAngle, fill, stroke, imageSmoothingEnabled) {
        if (imageSmoothingEnabled === void 0) { imageSmoothingEnabled = true; }
        if (startAngle === endAngle || r === 0 || (!fill && !stroke))
            return; // nothing to draw
        this.apply(matrix, alpha, null, fill, stroke, imageSmoothingEnabled);
        startAngle = MathUtil.DEG_TO_RAD * startAngle;
        endAngle = MathUtil.DEG_TO_RAD * endAngle;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, startAngle, endAngle, false);
        // TODO: FUTURE- Would it be faster to store the path in the primitive and pass it in
        this.fillStroke(fill, stroke);
    };
    //#region Helpers
    /**
     * Draws the fills and strokes.
     * @param fill The fill settings to fill with.
     * @param stroke The stroke settings to stroke with.
     */
    GraphicsContext.prototype.fillStroke = function (fill, stroke, imageSmoothingEnabled) {
        if (imageSmoothingEnabled === void 0) { imageSmoothingEnabled = true; }
        if (stroke && stroke.underFill) {
            this.ctx.stroke();
        }
        if (fill) {
            this.ctx.fill();
        }
        if (stroke && !stroke.underFill) {
            this.ctx.stroke();
        }
    };
    return GraphicsContext;
}());
/** @file Sprite.ts */
/// <reference path="../math/geom/Matrix2D.ts" />
var Sprite = /** @class */ (function () {
    function Sprite() {
        this.name = "Sprite (unnamed)";
        this.x = 0;
        this.y = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.skewX = 0;
        this.skewY = 0;
        this.rotation = 0;
        this.regX = 0;
        this.regY = 0;
        this._wvp = new Matrix2D();
        this._pt = new Vector2();
        this._xformMatrix = new Matrix2D();
        this.visible = true;
        this.alpha = 1;
        this.parent = null;
        this.children = [];
        //#region Input
        /** The cursor property. */
        this.cursor = null;
        /** The input component for this display object. */
        this.input = null;
    }
    //#endregion
    Sprite.prototype.setPosition = function (x, y) {
        this.x = x;
        this.y = y;
    };
    //#region Hierarchy
    /**
     * Adds a child to the end of the list.
     * @param child The child to add.
     * @return The child that was added.
     */
    Sprite.prototype.addChild = function (child) {
        // Don't add self
        if (child === this)
            throw new Error("Cannot add an item to itself!");
        // Prevent cycles
        var parent = this.parent;
        while (parent) {
            if (parent === child)
                throw new Error("An item cannot be added as its own descendant!");
            parent = parent.parent;
        }
        // If it has a parent already, remove it
        if (child.parent)
            child.parent.removeChild(child);
        // Add it
        this.children.push(child);
        child.parent = this;
        // Return the child
        return child;
    };
    /**
     * Adds a child at the specified index.
     * @param child The child to add.
     * @param index The index to insert the child at.
     * @return The child that was added.
     * @throws Error if the supplied index is out of range.
     */
    Sprite.prototype.addChildAt = function (child, index) {
        // Don't add self
        if (child === this)
            throw new Error("Cannot add an item to iteself!");
        // Prevent cycles
        var parent = this.parent;
        while (parent) {
            if (parent === child)
                throw new Error("An item cannot be added as its own descendant!");
            parent = parent.parent;
        }
        // Ensure valid range
        if (index < 0 || index > this.children.length)
            throw new Error("Index (" + index + ") out of range [0, " + this.children.length + "]!");
        // If it has a parent already, remove it
        if (child.parent)
            child.parent.removeChild(child);
        // Add at new index
        if (index <= 0) {
            // Push on to front
            this.children.unshift(child);
        }
        else if (index >= this.children.length) {
            // Push to end since greater than list length
            this.children.push(child);
        }
        else {
            // Insert at the specified point
            this.children.splice(index, 0, child);
        }
        child.parent = this;
        // Return the child
        return child;
    };
    /**
     * Gets the index of the supplied child.
     * @param child The child to lookup the index of.
     * @return The index of the child or a number < 0 if the supplied node is not a child.
     * @throws Error if child is not actually a child of this container.
     */
    Sprite.prototype.getChildIndex = function (child) {
        // Get the current index
        var index = this.children.indexOf(child);
        // Ensure a child
        if (index < 0)
            throw new Error("Sprite is not a child of this Container!");
        // Return the index
        return index;
    };
    /**
     * Moves the child to the specified index.
     * @param child The child to move.
     * @param index The new index to move to.
     * @throws Error if index is out of range.
     * @throws Error if child is not actually a child of this node.
     */
    Sprite.prototype.setChildIndex = function (child, index) {
        // Ensure valid range
        if (index < 0 || index >= this.children.length)
            throw new Error("Index (" + index + ") out of range [0, " + this.children.length + "]!");
        // Get the current index
        var curr = this.children.indexOf(child);
        // Ensure is a child
        if (curr < 0)
            throw new Error("Sprite is not a child of this Container!");
        // Move as needed
        if (curr !== index) {
            // Remove from current index
            this.children.splice(curr, 1);
            // Add at new index
            if (index <= 0) {
                // Push on to front
                this.children.unshift(child);
            }
            else if (index >= this.children.length) {
                // Push to end since greater than list length
                this.children.push(child);
            }
            else {
                // Insert at the specified point
                this.children.splice(index, 0, child);
            }
        }
    };
    /**
     * Swaps the position of 2 display objects within this container.
     * @param child1 The first child to swap.
     * @param child2 The second child to swap.
     */
    Sprite.prototype.swapChildren = function (child1, child2) {
        // Get indexes
        var index1 = this.children.indexOf(child1);
        var index2 = this.children.indexOf(child2);
        // Ensure children
        if (index1 < 0 || index2 < 0)
            throw new Error("Sprite is not a child of this Container!");
        // Swap if needed
        if (index1 !== index2) {
            this.children[index1] = child2;
            this.children[index2] = child1;
        }
    };
    /**
     * Gets the child at the specified index.
     * @param index The index of the child to return.
     * @return The child at that index.
     * @throws Error if index is out of range.
     */
    Sprite.prototype.getChildAt = function (index) {
        // Ensure valid range
        if (index < 0 || index >= this.children.length)
            throw new Error("Index (" + index + ") out of range [0, " + this.children.length + "]!");
        // Return the index
        return this.children[index];
    };
    /**
     * Removes the specified child from the list.
     * @param child The child to remove.
     * @return the removed child.
     * @throws Error if child is not a child of this node.
     */
    Sprite.prototype.removeChild = function (child) {
        // Get the current index
        var curr = this.children.indexOf(child);
        // Ensure is a child
        if (curr < 0)
            throw new Error("Sprite is not a child of this Container!");
        // Remove it
        this.children.splice(curr, 1);
        child.parent = null;
        // Return it
        return child;
    };
    /**
     * Removes a child at the specified index.
     * @param index The index to remove the child at.
     * @return The child that was removed.
     * @throws Error if index is out of range.
     */
    Sprite.prototype.removeChildAt = function (index) {
        // Ensure valid range
        if (index < 0 || index >= this.children.length)
            throw new Error("Index (" + index + ") out of range [0, " + this.children.length + "]!");
        // Remove it
        var child = this.children.splice(index, 1)[0];
        child.parent = null;
        // Return the removed child
        return child;
    };
    //#endregion
    /** @inheritdoc */
    Sprite.prototype.pick = function (matrix, globalX, globalY, mode) {
        if (mode !== 0 /* PointerInput */ || !this.input || (this.input && this.input.pointerChildrenEnabled)) {
            var child = void 0;
            for (var i = this.children.length - 1; i >= 0; --i) {
                child = this.children[i];
                if (!child.visible
                    || child.alpha <= 0
                    || child.scaleX === 0 || child.scaleY === 0)
                    continue;
                if (mode === 0 /* PointerInput */ && child.input && !child.input.pointerEnabled && !child.input.pointerChildrenEnabled)
                    continue;
                child = child.pick(this._wvp.copy(matrix).appendTransform(child.x, child.y, child.scaleX, child.scaleY, child.rotation, child.skewX, child.skewY, child.regX, child.regY), globalX, globalY, mode);
                if (child)
                    return child;
            }
        }
        if (mode === 0 /* PointerInput */ && this.input && this.input.pointerEnabled && this.input.hitArea) {
            this._wvp.copy(matrix).invert().transformVector(this._pt.set(globalX, globalY));
            if (this.input.hitArea.containsVector(this._pt))
                return this;
        }
        return null;
    };
    //#region Transformations
    /**
     * Deforms the passed in matrix to be the global matrix to this display object.
     * @param matrix The matrix to deform. If one is not supplied, a new one is created.
     */
    Sprite.prototype.getConcatenatedMatrix = function (matrix) {
        matrix = matrix || new Matrix2D();
        matrix.setTransform(this.x, this.y, this.scaleX, this.scaleY, this.rotation, this.skewX, this.skewY, this.regX, this.regY);
        var o = this.parent;
        while (o) {
            matrix.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation, o.skewX, o.skewY, o.regX, o.regY);
            o = o.parent;
        }
        // Prepend the stage scale factor
        // TODO: FUTURE - this could be optimized
        matrix.prependTransform(0, 0, Stage.scale, Stage.scale, 0, 0, 0, 0, 0);
        return matrix;
    };
    /**
     * Deforms the passed in vector from global coords to local coords.
     * Returns the same vector for chaining
     * @param vec The vector to transform.
     */
    Sprite.prototype.globalToLocal = function (vec) {
        return this.getConcatenatedMatrix(this._xformMatrix).invert().transformVector(vec);
    };
    //#endregion
    Sprite.prototype.render = function (ctx, matrix, alpha) {
        var child;
        for (var i = 0; i < this.children.length; ++i) {
            child = this.children[i];
            if (child.visible && child.alpha > 0 && child.scaleX !== 0 && child.scaleY !== 0) {
                child.render(ctx, this._wvp.concat(matrix, child.x, child.y, child.scaleX, child.scaleY, child.rotation, child.skewX, child.skewY, child.regX, child.regY), alpha * child.alpha);
            }
        }
    };
    return Sprite;
}());
/** @file Bitmap.ts */
var Bitmap = /** @class */ (function (_super) {
    __extends(Bitmap, _super);
    function Bitmap(texture, sx, sy, sw, sh) {
        if (texture === void 0) { texture = null; }
        if (sx === void 0) { sx = 0; }
        if (sy === void 0) { sy = 0; }
        if (sw === void 0) { sw = texture ? texture.width : 0; }
        if (sh === void 0) { sh = texture ? texture.height : 0; }
        var _this = _super.call(this) || this;
        _this.imageSmoothingEnabled = true;
        _this.texture = texture;
        _this.srcRect = new Rectangle(sx, sy, sw, sh);
        return _this;
    }
    //#region Hit Testing
    /** @inheritdoc */
    Bitmap.prototype.pick = function (matrix, globalX, globalY, mode) {
        /*
        let pickedChild:Sprite = super.pick(matrix, globalX, globalY, mode);
        if (pickedChild) return pickedChild;

        if (this.input && !this.input.pointerEnabled) return null;

        matrix.invert().transformVector(this._pt.set(globalX, globalY));

        if (this.input && this.input.hitArea) return (this.input.hitArea.containsVector(this._pt) ? this : null);
        
        if (this.texture)
        {
            if (this._pt.x >= 0 && this._pt.y >= 0 && this._pt.x < this.srcRect.width && this._pt.y < this.srcRect.height) return this;
        }
        */
        return _super.prototype.pick.call(this, matrix, globalX, globalY, mode);
    };
    //#endregion
    Bitmap.prototype.render = function (ctx, matrix, alpha) {
        if (this.texture) {
            ctx.drawImage(matrix, alpha, this.texture.canvas, this.srcRect.x, this.srcRect.y, this.srcRect.width, this.srcRect.height, this.texture.x, this.texture.y, this.srcRect.width, this.srcRect.height, this.imageSmoothingEnabled);
        }
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return Bitmap;
}(Sprite));
/** @file TextField.ts */
/// <reference path="Sprite.ts" />
/**
 * Display object class for rendering a string of text.
 */
var TextField = /** @class */ (function (_super) {
    __extends(TextField, _super);
    //#endregion
    //#region Constructor
    /**
     * Creates a new text field to render.
     * @param text The text to display.
     * @param font The font settings to use.
     * @param fill The fill to use.
     * @param stroke The stroke to use.
     */
    function TextField(text, font, fill, stroke) {
        if (text === void 0) { text = ""; }
        if (font === void 0) { font = null; }
        if (fill === void 0) { fill = null; }
        if (stroke === void 0) { stroke = null; }
        var _this = _super.call(this) || this;
        /** The target area to render in. This is the target bounds to fit the text into. */
        _this.textArea = new Rectangle(0, 0, 0, 0);
        _this.text = text;
        _this.font = font;
        _this.fill = fill;
        _this.stroke = stroke;
        return _this;
    }
    //#endregion
    //#region Measuring
    /**
     * Measures the current text.
     */
    TextField.prototype.measure = function () {
        return Stage.graphics.measureText(this.text, this.font);
    };
    //#endregion
    //#region Rendering
    /** @inheritdoc */
    TextField.prototype.render = function (ctx, matrix, alpha) {
        if (this.font) {
            var x = 0;
            if (this.font.align === "center" /* Center */)
                x += this.textArea.width / 2;
            else if (this.font.align === "right" /* Right */)
                x += this.textArea.width;
            //renderer.drawRect(matrix, alpha, this.textArea.x, this.textArea.y, this.textArea.width, this.textArea.height, new FillSettings("#0000FF"));
            ctx.drawText(matrix, alpha, x, 0, this.text, this.font, this.fill, this.stroke);
        }
    };
    return TextField;
}(Sprite));
/** @file Button.ts */
/// <reference path="Sprite.ts" />
/// <reference path="../sound/Sound.ts" />
/**
 * The base button class.
 */
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    //#endregion
    //#region Constructor
    /**
     * Creates a new Button.
     */
    function Button() {
        var _this = _super.call(this) || this;
        //#region Button State
        /** The current button state. */
        _this._state = 0 /* Up */;
        _this.isPressed = false;
        _this.isOver = false;
        /** The click sound. */
        _this.clickSound = null;
        //#endregion
        //#region Value
        /** An optional value set at the button. */
        _this.value = null;
        _this.cursor = "pointer" /* Pointer */;
        _this.input = new DisplayInputComponent(_this);
        _this.input.onPointerRollOver.add(_this.this_onRollOver, _this);
        _this.input.onPointerRollOut.add(_this.this_onRollOut, _this);
        _this.input.onPointerPress.add(_this.this_onMousePress, _this);
        _this.input.onPointerCancel.add(_this.this_onMouseCancel, _this);
        _this.input.onPointerRelease.add(_this.this_onMouseRelease, _this);
        _this.input.onPointerClick.add(_this.this_onPointerClick, _this);
        return _this;
    }
    //#endregion
    //#region Button State
    /**
     * Updates the current button state.
     */
    Button.prototype.updateButtonState = function () {
        if (!this.isOver) {
            if (this._state !== 0 /* Up */)
                this.up();
        }
        else if (this.isPressed) {
            if (this._state !== 2 /* Down */)
                this.down();
        }
        else {
            if (this._state !== 1 /* Over */)
                this.over();
        }
    };
    /**
     * Updates button state to up.
     */
    Button.prototype.up = function () {
        this._state = 0 /* Up */;
    };
    /**
     * Update button state to down.
     */
    Button.prototype.down = function () {
        this._state = 2 /* Down */;
    };
    /**
     * Update button state to over.
     */
    Button.prototype.over = function () {
        this._state = 1 /* Over */;
    };
    //#endregion
    //#region Event Handlers
    /** Handles Pointer event changes. */
    Button.prototype.this_onRollOver = function (current, target) {
        this.isOver = true;
        this.updateButtonState();
    };
    /** Handles Pointer event changes. */
    Button.prototype.this_onRollOut = function (current, target) {
        this.isOver = false;
        this.updateButtonState();
    };
    /** Handles Pointer event changes. */
    Button.prototype.this_onMousePress = function (current, target) {
        this.isPressed = true;
        this.updateButtonState();
    };
    /** Handles Pointer event changes. */
    Button.prototype.this_onMouseCancel = function (current, target) {
        this.isPressed = false;
        this.updateButtonState();
    };
    /** Handles Pointer event changes. */
    Button.prototype.this_onMouseRelease = function (current, target) {
        this.isPressed = false;
        this.updateButtonState();
    };
    /** Handles pointer click events. */
    Button.prototype.this_onPointerClick = function (current, target) {
        if (this.clickSound) {
            this.clickSound.stop();
            this.clickSound.play();
        }
    };
    return Button;
}(Sprite));
/** @file LinkedList.ts */
/// <reference path="../../lang/lang.ts" />
/**
 * The base class for a doubly linked list node.
 * Useful for implementing custom linked list nodes that don't need a value member.
 * @template Node The type of node in the list.
 */
var BaseLinkedListNode = /** @class */ (function () {
    function BaseLinkedListNode() {
        //#region Members
        /** Gets the linked list that this node belongs to. Is set to null if the node is not in a list. @readonly */
        this.list = null;
        /** The next node in the list. Is set to null if there is no next node or the node is not in a list. @readonly */
        this.next = null;
        /** The previous node in the list. Is set to null if there is no previous node or the node is not in a list. @readonly */
        this.previous = null;
        //#endregion
    }
    return BaseLinkedListNode;
}());
/**
 * A generic doubly linked list node that can store any value.
 * @template V The value type to store at the node.
 */
var LinkedListNode = /** @class */ (function (_super) {
    __extends(LinkedListNode, _super);
    //#endregion
    //#region Constructor
    /**
     * Creates a new linked list node with the specified value.
     * @param value The value to set at the new node.
     */
    function LinkedListNode(value) {
        if (value === void 0) { value = null; }
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    return LinkedListNode;
}(BaseLinkedListNode));
/**
 * A doubly linked list of the specified node type.
 * @template Node The type of node to store.
 */
var LinkedList = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new linked list.
     * @param node Optional. If present the list is initialized with it.
     */
    function LinkedList(node) {
        //#region Members
        /** Gets the first node in the list. @readonly */
        this.first = null;
        /** Gets the last node in the list. @readonly */
        this.last = null;
        /** Gets the number of nodes contained in the list. @readonly */
        this.count = 0;
        if (node)
            this.append(node);
    }
    //#endregion
    //#region Actions
    /**
     * Appends a node to the end of the list.
     * @param node The node to append.
     * @return The appended node.
     * @throws Error If the node is already in a list.
     */
    LinkedList.prototype.append = function (node) {
        // Ensure not in a list
        if (node.list !== null)
            throw new Error("The node is already in a list!");
        // Connect
        if (this.count > 0) {
            this.last.next = node;
            node.previous = this.last;
        }
        else
            this.first = node; // Count is 0, so also need to make this the start
        this.last = node;
        node.list = this;
        // Update count
        this.count++;
        // Return the node
        return node;
    };
    /**
     * Prepends a node to the start of the list.
     * @param node The node to prepend.
     * @return The prepended node.
     * @throws Error If the node is already in a list.
     */
    LinkedList.prototype.prepend = function (node) {
        // Ensure not in a list
        if (node.list !== null)
            throw new Error("The node is already in a list!");
        // Connect
        if (this.count > 0) {
            this.first.previous = node;
            node.next = this.first;
        }
        else
            (this).last = node; // Count is 0, so also need to make this the end
        this.first = node;
        node.list = this;
        // Update count
        this.count++;
        // Return the node
        return node;
    };
    /**
     * Removes a node from the list.
     * @param node The node to remove.
     * @return The removed node.
     * @throws Error If the node is not in this list.
     */
    LinkedList.prototype.remove = function (node) {
        // Ensure it is in this list
        if (node.list !== this)
            throw new Error("Node is not in this list!");
        // Disconnect
        if (this.count === 1) {
            this.first =
                this.last = null;
        }
        else if (node === this.first) {
            this.first = node.next;
            this.first.previous = null;
        }
        else if (node === this.last) {
            this.last = node.previous;
            this.last.next = null;
        }
        else {
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
    };
    /**
     * Removes the first node in the list.
     * @param node The node to remove.
     * @return The removed node. Returns null if there was no first node.
     */
    LinkedList.prototype.removeFirst = function () {
        return this.count > 0 ? this.remove(this.first) : null;
    };
    /**
     * Removes the last node in the list.
     * @param node The node to remove.
     * @return The removed node. Returns null if there was no first node.
     */
    LinkedList.prototype.removeLast = function () {
        return this.count > 0 ? this.remove(this.last) : null;
    };
    /**
     * Removes all nodes from the list.
     */
    LinkedList.prototype.clear = function () {
        var current = this.first;
        while (current) {
            var next = current.next;
            current.list =
                current.next =
                    current.previous = null;
            current = next;
        }
        this.first =
            this.last = null;
        this.count = 0;
    };
    return LinkedList;
}());
/** @file ObjectPool.ts */
/// <reference path="../../lang/lang.ts" />
/**
 * A generic object pool.
 * NOTE: This is not totally safe, you could add the same object to the pool twice.
 * 	This unsafe behavior is by design for performance reasons.
 * @template T the type of the object to store in the pool
 */
var ObjectPool = /** @class */ (function () {
    function ObjectPool() {
        /** The set of items in the pool. */
        this._pool = [];
        this._count = 0;
    }
    Object.defineProperty(ObjectPool.prototype, "count", {
        /** The number of items in the pool */
        get: function () { return this._count; },
        enumerable: true,
        configurable: true
    });
    /**
     * Removes an item from the pool.
     * @return An item from the pool or null if there are no free items.
     */
    ObjectPool.prototype.remove = function () {
        var item = null;
        // If we have an item, take it out
        if (this._count > 0) {
            item = this._pool[this._count - 1];
            this._pool[this._count - 1] = null;
            this._count--;
        }
        return item;
    };
    /**
     * Adds the specified item to the pool.
     * @param item The item to add.
     */
    ObjectPool.prototype.add = function (item) {
        if (!item)
            throw new Error("Cannot add null or empty to pool!");
        if (this._pool.length > this._count)
            this._pool[this._count] = item;
        else
            this._pool.push(item);
        this._count++;
    };
    return ObjectPool;
}());
/** @file DisplayInputComponent.ts */
/// <reference path="../../math/geom/PointHitArea.ts" />
/**
 * Handles input for a display object.
 */
var DisplayInputComponent = /** @class */ (function () {
    function DisplayInputComponent(displayObject, pointerEnabled, pointerChildrenEnabled, hitArea) {
        if (pointerEnabled === void 0) { pointerEnabled = true; }
        if (pointerChildrenEnabled === void 0) { pointerChildrenEnabled = true; }
        if (hitArea === void 0) { hitArea = null; }
        /** Dispatched when this object is moused over. */
        this.onPointerOver = new DelegateEvent();
        /** Dispatched when this object is moused out. */
        this.onPointerOut = new DelegateEvent();
        /** Dispatched when this object is rolled over. */
        this.onPointerRollOver = new DelegateEvent();
        /** Dispatched when this object is rolled out. */
        this.onPointerRollOut = new DelegateEvent();
        /** Dispatched when this object is pressed on. */
        this.onPointerPress = new DelegateEvent();
        /** Dispatched when this object is released on. */
        this.onPointerRelease = new DelegateEvent();
        /** Dispatched when this object is clicked on. */
        this.onPointerClick = new DelegateEvent();
        /** Dispatched when a press on this object is canceled. */
        this.onPointerCancel = new DelegateEvent();
        this.displayObject = displayObject;
        this.pointerEnabled = pointerEnabled;
        this.pointerChildrenEnabled = pointerChildrenEnabled;
        this.hitArea = hitArea;
    }
    return DisplayInputComponent;
}());
/** @file PickMode.ts */
/** @file StageInputManager.ts */
/// <reference path="../../lang/lang.ts" />
/// <reference path="../../collections/list/LinkedList.ts" />
/// <reference path="../../collections/pool/ObjectPool.ts" />
/// <reference path="../../input/pointer/PointerInput.ts" />
/// <reference path="DisplayInputComponent.ts" />
/// <reference path="../support/PickMode.ts" />
/**
 * Stage component class for handling input.
 * Only one of these should be created by the stage.
 * Known Quirks:
 * 	- if the display object is edited and then returned back to the same state in between updates, the component assumes that its state is still valid
 */
var StageInputManager = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new Stage Input Component.
     */
    function StageInputManager() {
        //#region Members
        /** A set of interactions chains that are used to track over state. */
        this._pointChains = [new LinkedList(), new LinkedList()];
        /** A helper index indicating which chain in the array is currently marked as the current pointer chain. */
        this._pointChainIndex = 0;
        /** A chain of objects that were recent pressed. */
        this._pressChain = new LinkedList();
        /** Indicates if the pointer is currently pressed. */
        this._pressed = false;
        /** The last cursor that was set by this component. */
        this._cursor = null;
        /** An object pool for interaction chains. */
        this._pool = new ObjectPool();
        this._pointChain = this._pointChains[0];
        this._nextPointChain = this._pointChains[1];
        PointerInput.primary.onPress.add(this.PointerInput_primary_onPress, this);
        PointerInput.primary.onRelease.add(this.PointerInput_primary_onRelease, this);
        PointerInput.primary.onCancel.add(this.PointerInput_primary_onCancel, this);
    }
    //#endregion
    //#region Frames
    /**
     * Should be called at the start of every frame to update pointer chain.
     */
    StageInputManager.prototype.beginFrame = function () {
        this.point();
    };
    //#endregion
    //#region Interactions
    /**
     * Updates the pointer chain and dispatches over / out events.
     * Also updates the cursor.
     * Algorithm:
     * 	- build a new point chain by picking on the stage at the pointer coordinates
     * 	- check if the lists match and top most common parent
     * 	- dispatch out events on the oldChain.leaf up to common parent
     * 	- dispatch over events on newChain.leaf up to common parent
     * 	- find the deepest over object that has a cursor set and apply that or use the stage default cursor.
     * 	- make newChain the current point chain
     * 	- free the old point chain
     */
    StageInputManager.prototype.point = function () {
        // Decalare working vars
        var newNode; // Iterator value
        var oldNode; // Iterator value
        var displayObject; // Iterator value
        var commonFound; // Iterator state helper
        var oldTarget; // Target of the old list
        var newTarget; // Target of the new list
        var commonTarget; // Common parent of new and old target, if any
        var listChanged; // Indicates if there was a difference in the pointer chains
        var cursor = null; // The cursor to set
        // Find targets
        newTarget = PointerInput.primary.isPresent ? Stage.pick(PointerInput.primary.x, PointerInput.primary.y, 0 /* PointerInput */) : null;
        oldTarget = this._pointChain.last ? this._pointChain.last.value : null;
        // Build the new point chain and identify the deepest set cursor
        displayObject = newTarget;
        while (displayObject) {
            // Get a node
            var node = this._pool.remove() || new LinkedListNode();
            node.value = displayObject;
            // Prepend it to the list
            this._nextPointChain.prepend(node);
            // Set the cursor
            cursor = cursor || displayObject.cursor;
            // Move up
            displayObject = displayObject.parent;
        }
        // Check to see if the lists match and find the common parent target by iterating down each list until a mismatch is found
        commonTarget = null;
        oldNode = this._pointChain.first;
        newNode = this._nextPointChain.first;
        listChanged = (oldNode === null && newNode === null) ? false : true; // if lists are both empty, it hasn't changed, otherwise assume changed and check if same in loop
        while (oldNode && newNode && oldNode.value === newNode.value) {
            // Both nodes exist and have same value, so this is a common target
            commonTarget = oldNode.value;
            // Move down
            oldNode = oldNode.next;
            newNode = newNode.next;
            // If we've hit the end of both old and new, then the lists haven't changed
            if (!oldNode && !newNode)
                listChanged = false;
        }
        // Iterate up old list dispatching out events while also freeing the list
        commonFound = false;
        oldNode = this._pointChain.last;
        while (oldNode) {
            // Handle pointer out
            if (listChanged) {
                if (oldNode.value.input && !oldNode.value.input.onPointerOut.isEmpty)
                    oldNode.value.input.onPointerOut.invoke(oldNode.value, oldTarget);
            }
            // Handle roll out
            if (!commonFound) {
                if (oldNode.value !== commonTarget) {
                    if (oldNode.value.input && !oldNode.value.input.onPointerRollOut.isEmpty)
                        oldNode.value.input.onPointerRollOut.invoke(oldNode.value, oldTarget);
                }
                else {
                    commonFound = true;
                }
            }
            // Free the node
            oldNode.value = null;
            this._pool.add(oldNode); // Return the node to the pool
            // Move up
            oldNode = oldNode.previous;
        }
        this._pointChain.clear(); // Clear the old point chain, this wipes the next, prev, and list refs
        // Iterate up new lists dispatching over events
        commonFound = false;
        newNode = this._nextPointChain.last;
        while (newNode) {
            // Handle roll over
            if (!commonFound) {
                if (newNode.value !== commonTarget) {
                    if (newNode.value.input && !newNode.value.input.onPointerRollOver.isEmpty)
                        newNode.value.input.onPointerRollOver.invoke(newNode.value, newTarget);
                }
                else {
                    commonFound = true;
                }
            }
            // Handle pointer over
            if (listChanged) {
                if (newNode.value.input && !newNode.value.input.onPointerOver.isEmpty)
                    newNode.value.input.onPointerOver.invoke(newNode.value, newTarget);
            }
            // Move up
            newNode = newNode.previous;
        }
        // Swap point chains
        if (this._pointChainIndex === 0) {
            this._pointChain = this._pointChains[1];
            this._nextPointChain = this._pointChains[0];
            this._pointChainIndex = 1;
        }
        else {
            this._pointChain = this._pointChains[0];
            this._nextPointChain = this._pointChains[1];
            this._pointChainIndex = 0;
        }
        // Update the cursor
        if (!cursor)
            cursor = Stage.defaultCursor;
        if (this._cursor !== cursor) {
            this._cursor = cursor;
            Stage.canvas.style.cursor = cursor;
        }
    };
    /**
     * Dispatches press events when the pointer is pressed.
     * Algorithm:
     * 	- Copy the point chain into a new press chain
     * 	- Dispatch press on everything in the new press chain
     */
    StageInputManager.prototype.press = function () {
        // This shouldn't happen, but if we're already pressed, cancel the existing one before creating a new one
        if (this._pressed)
            this.cancel();
        // Set as pressed
        this._pressed = true;
        // Update point chain
        this.point();
        // Copy new point chain into press chain
        var pointNode = this._pointChain.last;
        var pressNode;
        while (pointNode) {
            // Get or create a node, init it, and prepend it to the chain
            pressNode = this._pool.remove() || new LinkedListNode();
            pressNode.value = pointNode.value;
            this._pressChain.prepend(pressNode);
            // Move up
            pointNode = pointNode.previous;
        }
        // Dispatch press events on everything in the press chain
        pressNode = this._pressChain.last;
        var newTarget = pressNode ? pressNode.value : null;
        while (pressNode) {
            // Dispatch press
            if (pressNode.value.input && !pressNode.value.input.onPointerPress.isEmpty)
                pressNode.value.input.onPointerPress.invoke(pressNode.value, newTarget);
            // Move up
            pressNode = pressNode.previous;
        }
    };
    /**
     * Dispatches release and cancel events on the press chain when the pointer is released.
     * Algorithm:
     * 	- check if chains match exactly
     * 	- find common parent
     * 	if chains match exactly
     * 		- dispatch release on everything
     * 		- distpatch click on everything
     * 	if chains are a mismatch
     * 		loop(press chain leaf -> common parent)
     * 			cancel
     * 		- free the press chain
     * 		loop(current chain leaf -> root)
     * 			release
     */
    StageInputManager.prototype.release = function () {
        // Set as unpressed
        this._pressed = false;
        // Update point chain
        this.point();
        // Decalare working vars
        var newNode; // Iterator value for current point chain
        var oldNode; // Iterator value for pressed chain
        var commonFound; // Iterator state helper
        var oldTarget; // Target of the old list
        var newTarget; // Target of the new list
        var commonTarget; // Common parent of new and old target, if any
        var listChanged; // Indicates if there was a difference in the pointer chains
        // Check to see if the lists match and find the common parent target by iterating down each list until a mismatch is found
        commonTarget = null;
        oldNode = this._pressChain.first;
        newNode = this._pointChain.first;
        listChanged = (oldNode === null && newNode === null) ? false : true; // if lists are both empty, it hasn't changed, otherwise assume changed and check if same in loop
        while (oldNode && newNode && oldNode.value === newNode.value) {
            // Both nodes exist and have same value, so this is a common target
            commonTarget = oldNode.value;
            // Move down
            oldNode = oldNode.next;
            newNode = newNode.next;
            // If we've hit the end of both old and new, then the lists haven't changed
            if (!oldNode && !newNode)
                listChanged = false;
        }
        // Dispatch cancel / release / click events
        if (!listChanged) {
            // If the lists match, then we only need to dispatch release and click on everything, so iterate up the chain and free it as we go
            oldNode = this._pressChain.last;
            oldTarget = oldNode ? oldNode.value : null;
            while (oldNode) {
                // Dispatch release
                if (oldNode.value.input && !oldNode.value.input.onPointerRelease.isEmpty)
                    oldNode.value.input.onPointerRelease.invoke(oldNode.value, oldTarget);
                // Dispatch click
                if (oldNode.value.input && !oldNode.value.input.onPointerClick.isEmpty)
                    oldNode.value.input.onPointerClick.invoke(oldNode.value, oldTarget);
                // Free the node
                oldNode.value = null;
                this._pool.add(oldNode);
                // Move up
                oldNode = oldNode.previous;
            }
            this._pressChain.clear(); // Clear the old press chain, this wipes the next, prev, and list refs
        }
        else {
            // If the lists are a partial match or less we need to dispatch cancel events on those which are not in the new point (release) chain, free it as we go
            commonFound = false;
            oldNode = this._pressChain.last;
            oldTarget = oldNode ? oldNode.value : null;
            while (oldNode) {
                if (!commonFound && oldNode.value !== commonTarget) {
                    // Nodes that were not in the new point chain on (below the common target) get canceled
                    if (oldNode.value.input && !oldNode.value.input.onPointerCancel.isEmpty)
                        oldNode.value.input.onPointerCancel.invoke(oldNode.value, oldTarget); // provide with original target since that is where it originates
                }
                else {
                    commonFound = true;
                }
                // Free the node
                oldNode.value = null;
                this._pool.add(oldNode); // Return the node to the pool
                // Move up
                oldNode = oldNode.previous;
            }
            this._pressChain.clear(); // Clear the old press chain, this wipes the next, prev, and list refs
            // Dispatch release events on everything in the new point chain (release chain)
            newNode = this._pointChain.last;
            newTarget = newNode ? newNode.value : null;
            while (newNode) {
                // Dispatch release
                if (newNode.value.input && !newNode.value.input.onPointerRelease.isEmpty)
                    newNode.value.input.onPointerRelease.invoke(newNode.value, newTarget);
                // Move up
                newNode = newNode.previous;
            }
        }
    };
    /**
     * Dispatches cancel events when the pointer in canceled.
     * Algorithm:
     * 	- dispatch cancel on existing press chain
     * 	- free existing press chain
     */
    StageInputManager.prototype.cancel = function () {
        // Set as unpressed
        this._pressed = false;
        // We only need to clear all presses so iterate up the press chain triggering cancel events and clear the chain as we go
        var oldNode = this._pressChain.last;
        var oldTarget = oldNode ? oldNode.value : null;
        while (oldNode) {
            // Dispatch cancels
            if (oldNode.value.input && !oldNode.value.input.onPointerCancel.isEmpty)
                oldNode.value.input.onPointerCancel.invoke(oldNode.value, oldTarget);
            // Free the node
            oldNode.value = null;
            this._pool.add(oldNode);
            // Move Up
            oldNode = oldNode.previous;
        }
        this._pressChain.clear(); // Clear the press chain, this wipes the next, pref, and list refs
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles when the primary pointer has been pressed.
     */
    StageInputManager.prototype.PointerInput_primary_onPress = function () {
        // console.log("press -- ");
        this.press();
    };
    /**
     * Handles when the primary pointer has been released.
     */
    StageInputManager.prototype.PointerInput_primary_onRelease = function () {
        // console.log("release --");
        this.release();
    };
    /**
     * Handles when the primary pointer press has been canceled.
     */
    StageInputManager.prototype.PointerInput_primary_onCancel = function () {
        // console.log("cancel --");
        this.cancel();
    };
    return StageInputManager;
}());
/** @file Stage.ts */
/// <reference path="../math/geom/Rectangle.ts" />
/// <reference path="../graphics/GraphicsContext.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="Bitmap.ts" />
/// <reference path="TextField.ts" />
/// <reference path="Button.ts" />
/// <reference path="input/StageInputManager.ts" />
// tslint:disable-next-line: typedef
var Stage = new (/** @class */ (function () {
    function class_12() {
        this.dirty = true;
        this.width = 1;
        this.height = 1;
        this.cssRect = new Rectangle();
        this.scale = 1;
        this.refWidth = 1920;
        this.refHeight = 1080;
        this._wvp = new Matrix2D();
        this._pickTransform = new Matrix2D();
        this.letterbox = true;
        this.defaultCursor = "default" /* Default */;
    }
    class_12.prototype.initialize = function () {
        this.canvas = document.getElementById("canvas");
        this.root = new Sprite();
        GameWindow.onResized.add(this.GameWindow_onResized, this);
        this.canvas.style.background = "#000000";
        this.graphics = new GraphicsContext(this.canvas);
        this.inputManager = new StageInputManager();
        this.beginFrame();
    };
    class_12.prototype.GameWindow_onResized = function () {
        this.dirty = true;
    };
    class_12.prototype.beginFrame = function () {
        if (this.dirty) {
            this.dirty = false;
            if (this.letterbox) {
                // CSS Letterboxing
                var cssWidth = Math.ceil(GameWindow.width);
                var cssHeight = Math.ceil(GameWindow.height);
                var cssScale = Math.min(cssWidth / this.refWidth, cssHeight / this.refHeight);
                cssWidth = Math.ceil(cssScale * this.refWidth);
                cssHeight = Math.ceil(cssScale * this.refHeight);
                var cssTop = Math.round((GameWindow.height - cssHeight) / 2);
                var cssLeft = Math.round((GameWindow.width - cssWidth) / 2);
                this.cssRect.set(cssLeft, cssTop, cssWidth, cssHeight);
                this.canvas.style.top = cssTop + "px";
                this.canvas.style.left = cssLeft + "px";
                this.canvas.style.width = cssWidth + "px";
                this.canvas.style.height = cssHeight + "px";
                // Pixel Density scaling
                var cvsWidth = Math.ceil(cssWidth * GameWindow.pixelRatio);
                var cvsHeight = Math.ceil(cssHeight * GameWindow.pixelRatio);
                this.graphics.resize(cvsWidth, cvsHeight);
                // Uniform content scaling
                var sx = this.graphics.width / this.refWidth;
                var sy = this.graphics.height / this.refHeight;
                this.scale = Math.min(sx, sy);
                this.width = this.graphics.width / this.scale;
                this.height = this.graphics.height / this.scale;
                /*
                this.width = Math.ceil(cssWidth * GameWindow.pixelRatio);
                this.height = Math.ceil(cssHeight * GameWindow.pixelRatio);
                this.scale = this.width / this.refWidth;

                // Canvas should match the stage width and height
                this.graphics.resize(this.width, this.height);
                */
            }
            else {
                // Canvas should just fill the window at the correct density
                this.graphics.resize(GameWindow.width * GameWindow.pixelRatio, GameWindow.height * GameWindow.pixelRatio);
                // CSS Fill Screen
                this.cssRect.set(0, 0, GameWindow.width, GameWindow.height);
                this.canvas.style.top = "0px";
                this.canvas.style.left = "0px";
                this.canvas.style.width = "100%";
                this.canvas.style.height = "100%";
                // Uniform Content Scaling
                var sx = this.graphics.width / this.refWidth;
                var sy = this.graphics.height / this.refHeight;
                this.scale = Math.min(sx, sy);
                this.width = this.graphics.width / this.scale;
                this.height = this.graphics.height / this.scale;
            }
        }
        // Begin the input manager's frame - it should handle non-interaction event (mouse moves etc) input here
        this.inputManager.beginFrame();
    };
    //#region Picking
    /**
     * Runs a hit test down the display list in a front first fashion, returning the top most object at the given coordinates.
     * @param globalX The global (canvas) x position to test at.
     * @param globalY The global (canvas) y position to test at.
     * @param mode The mode to pick with.
     * @return The hit display object otherwise null.
     */
    class_12.prototype.pick = function (globalX, globalY, mode) {
        // Init the root transform
        this._pickTransform.set(this.scale, 0, 0, this.scale, 0, 0); // Our own transform
        // Pick
        return this.root.pick(this._pickTransform, globalX, globalY, mode) || this.root;
    };
    //#endregion
    class_12.prototype.render = function () {
        this.graphics.clear(true);
        this.root.render(this.graphics, this._wvp.set(this.scale, 0, 0, this.scale, 0, 0), 1);
    };
    return class_12;
}()))();
/** @file App.ts */
/// <reference path="../GameWindow.ts" />
/// <reference path="../input/keyboard/Keyboard.ts" />
/// <reference path="../input/mouse/Mouse.ts" />
/// <reference path="../input/touch/TouchScreen.ts" />
/// <reference path="../input/pointer/PointerInput.ts" />
/// <reference path="../sound/SoundManager.ts" />
/// <reference path="../assets/AssetManager.ts" />
/// <reference path="../stage/Stage.ts" />
/// <reference path="../Game.ts" />
/**
 * Base app type. The app manages:
 * - overall app startup / shutdown
 * - active state
 * @staticclass
 */
// tslint:disable-next-line: typedef
var App = new (/** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Initializes the static App instance.
     * Must not be called in threads.
     */
    function class_13() {
        //#region Events
        /** Triggered when the app becomes active. */
        this.onActivated = new DelegateEvent();
        /** Triggered when the app becomes inactive. */
        this.onDeactivated = new DelegateEvent();
        /** Triggered when teh app is disposed. */
        this.onDisposed = new DelegateEvent();
        this.onFullscreenChange = new DelegateEvent();
        //#endregion
        //#region Members
        /** Indicates if the app is currently active or not. @readonly */
        this.isActive = true;
        /** Indicates if the app is visible. @readonly @internal */
        this.isVisible = true;
        /** Indicates if the app id disposed. @readonly */
        this.isDisposed = false;
        /** iOS has a buggy page visibility API, luckily it dispatches blur and focus events on the window when vis change events should fire. */
        this._iosIsFocused = true;
        // Bind
        this.doc_visChange = this.doc_visChange.bind(this);
        this.win_focuschange = this.win_focuschange.bind(this);
        // Determine PageVisibilityAPI
        if (document.hidden !== undefined)
            this._pageVisibilityAPI = { hidden: "hidden", visibilitychange: "visibilitychange" };
        else if (document.webkitHidden !== undefined)
            this._pageVisibilityAPI = { hidden: "webkitHidden", visibilitychange: "webkitvisibilitychange" };
        else if (document.mozHidden !== undefined)
            this._pageVisibilityAPI = { hidden: "mozHidden", visibilitychange: "mozvisibilitychange" };
        else if (document.msHidden !== undefined)
            this._pageVisibilityAPI = { hidden: "msHidden", visibilitychange: "msvisibilitychange" };
        // tslint:disable-next-line: no-console
        else
            console.warn("Page Visibility API is unsupported.");
        // Determine FullscreenAPI
        if (document.fullscreenEnabled !== undefined) {
            // Windows Chrome
            // Windows Firefox
            // Mac Chrome
            // Mac Firefox
            this._fullscreenAPI = {
                fullscreenEnabled: "fullscreenEnabled",
                fullscreenElement: "fullscreenElement",
                requestFullscreen: "requestFullscreen",
                exitFullscreen: "exitFullscreen",
                fullscreenchange: "fullscreenchange",
                fullscreenerror: "fullscreenerror"
            };
        }
        else if (document.webkitFullscreenEnabled !== undefined) {
            // Windows Chrome
            // Windows Edge
            // Mac Safari
            // Mac Chrome
            // iOS Safari
            this._fullscreenAPI = {
                fullscreenEnabled: "webkitFullscreenEnabled",
                fullscreenElement: "webkitFullscreenElement",
                requestFullscreen: "webkitRequestFullscreen",
                exitFullscreen: "webkitExitFullscreen",
                fullscreenchange: "webkitfullscreenchange",
                fullscreenerror: "webkitfullscreenerror"
            };
        }
        else if (document.mozFullScreenEnabled !== undefined) {
            // Windows Firefox
            // Mac Firefox
            this._fullscreenAPI = {
                fullscreenEnabled: "mozFullScreenEnabled",
                fullscreenElement: "mozFullScreenElement",
                requestFullscreen: "mozRequestFullScreen",
                exitFullscreen: "mozCancelFullScreen",
                fullscreenchange: "mozfullscreenchange",
                fullscreenerror: "mozfullscreenerror"
            };
        }
        else if (document.msFullscreenEnabled !== undefined) {
            // Internet Explorer
            this._fullscreenAPI = {
                fullscreenEnabled: "msFullscreenEnabled",
                fullscreenElement: "msFullscreenElement",
                requestFullscreen: "msRequestFullscreen",
                exitFullscreen: "msExitFullscreen",
                fullscreenchange: "MSFullscreenChange",
                fullscreenerror: "MSFullscreenError"
            };
        }
        // Disallow on iOS because it is a poor experience
        //if (System.os === OS.AppleiOS) this._fullscreenAPI = null;
        // Watch for events
        if (this._fullscreenAPI) {
            // Bind
            this.doc_fschange = this.doc_fschange.bind(this);
            // Start watching for events
            document.addEventListener(this._fullscreenAPI.fullscreenchange, this.doc_fschange);
        }
    }
    //#endregion
    //#region Initialization
    class_13.prototype.initialize = function () {
        // Init Components
        GameWindow.initialize();
        SoundManager.initialize();
        Keyboard.initialize();
        Mouse.initialize();
        TouchScreen.initialize();
        PointerInput.initialize();
        Stage.initialize();
        // Watch for visibility state changes, only available in main thread
        if (this._pageVisibilityAPI)
            document.addEventListener(this._pageVisibilityAPI.visibilitychange, this.doc_visChange, true);
        if (System.os === 4 /* AppleiOS */) {
            // Watch for blur / focus events on ios because it doesn't dispatch vis change events properly
            window.addEventListener("focus", this.win_focuschange, true);
            window.addEventListener("blur", this.win_focuschange, true);
        }
        // Check initial state
        this.doc_visChange();
        if (System.os === 4 /* AppleiOS */)
            this.win_focuschange();
    };
    //#endregion
    //#region State
    /**
     * Called when the app becomes active.
     */
    class_13.prototype.activate = function () {
        if (this.isDisposed || this.isActive)
            return;
        this.isActive = true;
        // Refocus
        GameWindow.element.focus();
        // Activate components
        SoundManager.activate();
        this.onActivated.invoke();
    };
    /**
     * Called when the app becomes inactive.
     */
    class_13.prototype.deactivate = function () {
        if (this.isDisposed || !this.isActive)
            return;
        this.isActive = false;
        this.onDeactivated.invoke();
        // Deactivate components
        TouchScreen.deactivate();
        Mouse.deactivate();
        Keyboard.deactivate();
        SoundManager.deactivate();
    };
    //#endregion
    //#region Errors
    /**
     * Should be called by game code when a fatal error occurs and the app cannot continue.
     * @param errorMsg The associated error message.
     */
    class_13.prototype.fatal = function (errorMsg) {
        // tslint:disable-next-line: no-console
        console.error("FATAL ERROR: " + errorMsg);
    };
    //#endregion
    //#region Activation Tests
    /**
     * Updates the active state.
     */
    class_13.prototype.updateState = function () {
        if (!this.testActive())
            this.deactivate();
        else
            this.activate();
    };
    /**
     * Tests if the app can be active.
     * @return true if the app can be active.
     */
    class_13.prototype.testActive = function () {
        return !this.isDisposed && this.isVisible && this._iosIsFocused;
    };
    //#endregion
    //#region Event Handlers
    /**
     * Handles fullscreen state changes
     */
    class_13.prototype.doc_fschange = function () {
        this.onFullscreenChange.invoke();
    };
    /**
     * Called when the app vis state changed.
     * Only used on main thread.
     */
    class_13.prototype.doc_visChange = function () {
        var d = document;
        if (this._pageVisibilityAPI) {
            if (d[this._pageVisibilityAPI.hidden] === this.isVisible) {
                this.isVisible = !d[this._pageVisibilityAPI.hidden];
                this.updateState();
            }
        }
    };
    /**
     * Handles window focus events, only used on ios.
     * Only used on main thread.
     * @param evt The focus event. If not specified, the process will run.
     */
    class_13.prototype.win_focuschange = function (evt) {
        if (evt && evt.target !== window)
            return;
        if (document.hasFocus()) {
            if (this._iosIsFocused)
                return;
            this._iosIsFocused = true;
            this.updateState();
        }
        else {
            if (!this._iosIsFocused)
                return;
            this._iosIsFocused = false;
            this.updateState();
        }
    };
    return class_13;
}()))();
/** @file GameScreen.ts */
/// <reference path="../lang/delegate/DelegateEvent.ts" />
/// <reference path="GameScreenManager.ts" />
/**
 * A GameScreen describes a visual and input based game state.
 */
var GameScreen = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new screen.
     */
    function GameScreen() {
        //#endregion
        //#region Events
        /** Invoked whenever the screen is removed from the screen manager. */
        this.onRemoved = new DelegateEvent();
        this._isModal = true;
        this._isPopup = false;
        this._inputEnabled = true;
        this._isActive = false; // Set by screen manager
        this._isFocused = false;
        this._isOccluded = true;
        /** Indicates if the screen has been initialized or not. */
        this._isInitialized = false;
        /** Indicates if this screen is currently allowed to accept input based on its position in the stack. */
        this._isInputAllowed = false; // Set by screen manager
        this._isExiting = false;
        this._isDisposed = false;
        this._display = new Sprite();
        /** The screen manager this screen is on. */
        this.screenManager = null;
        this._display.name = this.toString();
        this._display.input = new DisplayInputComponent(this._display);
        this._display.visible = false;
        this._display.input.pointerEnabled = this._display.input.pointerChildrenEnabled = false;
    }
    Object.defineProperty(GameScreen.prototype, "isModal", {
        //#endregion
        //#region GameScreen State
        /** Indicates if this screen disallows input to be passed down to screens below it. default true. */
        get: function () { return this._isModal; },
        set: function (v) { this._isModal = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameScreen.prototype, "isPopup", {
        /** Indicates if this screen a transparent or opaque (hides things below it). default false. */
        get: function () { return this._isPopup; },
        set: function (v) { this._isPopup = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameScreen.prototype, "inputEnabled", {
        /** Indicates if this screen is accepting input. */
        get: function () { return this._inputEnabled; },
        set: function (v) {
            if (this._inputEnabled === v)
                return;
            this._inputEnabled = v;
            this.refreshInputState();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameScreen.prototype, "isActive", {
        /** Indicates if the screen is currently added to the screen manager. */
        get: function () { return this._isActive; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameScreen.prototype, "isFocused", {
        /** Indicates if this screen is currently the top most screen handling input. */
        get: function () { return this._isFocused; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameScreen.prototype, "isOccluded", {
        /** Indicates if this screen is currently being shown and not covered by any other opaque screens. default true. */
        get: function () { return this._isOccluded; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameScreen.prototype, "isExiting", {
        /**  Indicates if this screen is currently exiting. */
        get: function () { return this._isExiting; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameScreen.prototype, "isDisposed", {
        /** Indicates if this screen is currently disposed */
        get: function () { return this._isDisposed; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameScreen.prototype, "display", {
        /** The display object used to render this screen's contents. */
        get: function () { return this._display; },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Initialization
    /**
     * This method is called when the screen is first added to the screen manager the first time.
     */
    GameScreen.prototype.initialize = function () {
        // tslint:disable-next-line: no-console
        if (GameScreen._debug)
            console.info("initialize: " + this);
        this._isInitialized = true;
    };
    //#endregion
    //#region Dispose
    /**
     * You may call this method to permanently mark a screen as garbage.
     */
    GameScreen.prototype.dispose = function () {
        this._isDisposed = true;
        this._display = null;
    };
    //#endregion
    //#region Added / Removed
    /**
     * Called whenever the screen is added to the screen manager.
     */
    GameScreen.prototype.added = function () {
        // tslint:disable-next-line: no-console
        if (GameScreen._debug)
            console.info("added: " + this);
    };
    /**
     * Called whenever the screen is removed from the screen manager.
     */
    GameScreen.prototype.removed = function () {
        // tslint:disable-next-line: no-console
        if (GameScreen._debug)
            console.info("removed: " + this);
    };
    //#endregion
    //#region Exiting
    /**
     * Call to have the screen be removed from the screen manager.
     */
    GameScreen.prototype.exit = function () {
        if (!this._isActive)
            return;
        if (this._isExiting)
            return;
        this._isExiting = true;
        this.screenManager.remove(this); // internal access
    };
    //#endregion
    //#region Focus
    /**
     * Function gets called whenever the screen gains focus.
     */
    GameScreen.prototype.gainFocus = function () {
        // tslint:disable-next-line: no-console
        if (GameScreen._debug)
            console.info("gainFocus: " + this);
        this._isFocused = true;
    };
    /**
     * Function gets called whenever the screen loses focus.
     */
    GameScreen.prototype.loseFocus = function () {
        // tslint:disable-next-line: no-console
        if (GameScreen._debug)
            console.info("loseFocus: " + this);
        this._isFocused = false;
    };
    //#endregion
    //#region Occlusion
    /**
     * Function gets called whenever a screen is set to be shown.
     */
    GameScreen.prototype.show = function () {
        // tslint:disable-next-line: no-console
        if (GameScreen._debug)
            console.info("show: " + this);
        this._isOccluded = false;
        this._display.visible = true;
    };
    /**
     * Function gets called whenever a screen is set to be hidden.
     */
    GameScreen.prototype.hide = function () {
        // tslint:disable-next-line: no-console
        if (GameScreen._debug)
            console.info("hide: " + this);
        this._isOccluded = true;
        this._display.visible = false;
    };
    //#endregion
    //#region Input
    /**
     * This method is called by the screen manager whenever screen input enabled / allowed changes.
     */
    GameScreen.prototype.refreshInputState = function () {
        if (this._isInputAllowed && this._inputEnabled) {
            this._display.input.pointerEnabled = this._display.input.pointerChildrenEnabled = true;
        }
        else {
            this._display.input.pointerEnabled = this._display.input.pointerChildrenEnabled = false;
        }
    };
    //#endregion
    //#region Updating
    /**
     * Override to add update logic.
     * @param elapsed The amount of time that has passed since the last update.
     */
    GameScreen.prototype.update = function (elapsed) {
    };
    //#endregion
    //#region Drawing
    /**
     * Override to add custom post-update & pre-render logic.
     */
    GameScreen.prototype.draw = function () {
    };
    //#endregion
    //#region Debug
    /**
     * Gets a debug verion of this screen as a string.
     * @return a string verion of the screen.
     */
    GameScreen.prototype.toString = function () {
        try {
            return "[" + (this.constructor).name + "]";
        }
        catch (e) {
            return "[GameScreen]";
        }
    };
    //#region Static Members
    /** Helper value which will cause this screen to print out its screen state when it changes. */
    GameScreen._debug = false;
    return GameScreen;
}());
/** @file GameScreenManager.ts */
/// <reference path="GameScreen.ts" />
/**
 * A GameScreenManager.
 */
var GameScreenManager = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new screen manager.
     */
    function GameScreenManager() {
        //#region Members
        /** The set of screens currently in the screen manager. */
        this._list = [];
        /** An iterator. */
        this._iterator = -1;
        /** A reverser iterator. */
        this._reverseIterator = -1;
        /** The number of screens in the list. */
        this._count = 0;
        /** The root container all screens will be held in. */
        this.display = new Sprite();
        this.display.name = "screenManager.display";
    }
    //#endregion
    //#region Screens
    /**
     * Safely adds a screen to the top of the stack.
     * @param screen The screen to add.
     */
    GameScreenManager.prototype.add = function (screen) {
        var s = screen;
        if (s.isActive)
            throw new Error("GameScreen is already added to the screen manager!");
        if (s._isDisposed)
            throw new Error("GameScreen is disposed!");
        s._isExiting = false;
        s._isActive = true;
        s._isFocused = false;
        s._isOccluded = true;
        s.screenManager = this;
        this._list.push(s);
        this._count++;
        this.display.addChild(s._display);
        if (!s._isInitialized)
            s.initialize();
        s.added();
        this.updateScreenState();
    };
    /**
     * Safely adds a screen to the stack behind the supplied screen.
     * @param screen The screen to add.
     * @param overScreen The screen to insert behind.
     */
    GameScreenManager.prototype.addBehind = function (screen, overScreen) {
        var s = screen;
        if (!overScreen.isActive)
            throw new Error("overScreen is not in the screen manager!");
        if (s.isActive)
            throw new Error("GameScreen is already added to the screen manager!");
        if (s._isDisposed)
            throw new Error("GameScreen is disposed!");
        s._isExiting = false;
        s._isActive = true;
        s._isFocused = false;
        s._isOccluded = true;
        s.screenManager = this;
        //this._list.push(s);
        var index = this._list.indexOf(overScreen);
        if (index === 0)
            this._list.unshift(screen);
        else
            this._list.splice(index, 0, screen);
        this._count++;
        if (index <= this._iterator)
            this._iterator++; // avoid updating same one twice
        if (index <= this._reverseIterator)
            this._reverseIterator++;
        this.display.addChildAt(s._display, index);
        if (!s._isInitialized)
            s.initialize();
        s.added();
        this.updateScreenState();
    };
    /**
     * Safely removes a screen from the stack.
     * @param screen The screen to remove
     */
    GameScreenManager.prototype.remove = function (screen) {
        var s = screen;
        if (!screen.isActive)
            throw new Error("GameScreen is not in the screen manager!");
        if (screen.isFocused)
            s.loseFocus();
        if (!screen.isOccluded)
            s.hide();
        s.removed();
        var index = this._list.indexOf(screen);
        if (index >= 0) {
            this._list.splice(index, 1);
            this._count--;
            if (index <= this._iterator)
                this._iterator--;
            if (index <= this._reverseIterator)
                this._reverseIterator--;
        }
        this.display.removeChild(screen.display);
        s._isActive = false;
        s.screenManager = null;
        screen.onRemoved.invoke(screen);
        this.updateScreenState();
    };
    /**
     * Removes all screens from the stack.
     */
    GameScreenManager.prototype.removeAll = function () {
        while (this._list.length > 0)
            this.remove(this._list[this._list.length - 1]);
    };
    //#endregion
    //#region GameScreen State
    /**
     * Updates the input and visibility state of each screen in the stack.
     */
    GameScreenManager.prototype.updateScreenState = function () {
        if (this._reverseIterator !== -1)
            throw new Error("Already iterating!");
        var focusAvailable = true;
        var occluding = false;
        var inputAvailable = true;
        for (this._reverseIterator = this._count - 1; this._reverseIterator >= 0; this._reverseIterator--) {
            var value = this._list[this._reverseIterator];
            if (inputAvailable) {
                if (!value._isInputAllowed) {
                    value._isInputAllowed = true;
                    value.refreshInputState();
                }
                if (value._isModal)
                    inputAvailable = false;
            }
            else {
                if (value._isInputAllowed) {
                    value._isInputAllowed = false;
                    value.refreshInputState();
                }
            }
            if (focusAvailable) {
                if (!value._isFocused) {
                    value.gainFocus();
                }
                if (value._isModal)
                    focusAvailable = false;
            }
            else {
                if (value._isFocused)
                    value.loseFocus();
            }
            if (!occluding) {
                if (value._isOccluded)
                    value.show();
                if (!value._isPopup)
                    occluding = true;
            }
            else {
                if (!value._isOccluded)
                    value.hide();
            }
        }
        this._reverseIterator = -1;
    };
    //#endregion
    //#region Updating
    /**
     * Calls update on each screen in the stack from top to bottom.
     * @param elapsed The elapsed game time since the last update.
     */
    GameScreenManager.prototype.update = function (elapsed) {
        if (this._iterator !== -1)
            throw new Error("already iterating!");
        for (this._iterator = 0; this._iterator < this._count; ++this._iterator) {
            this._list[this._iterator].update(elapsed);
        }
        this._iterator = -1;
    };
    //#endregion
    //#region Drawing
    /**
     * Calls the draw function on each screen in the stack from bottom to top.
     * This function is really meant for any necessary post update processes that require the scene to be updated before making visual changes.
     */
    GameScreenManager.prototype.draw = function () {
        this.updateScreenState();
        if (this._iterator !== -1)
            throw new Error("already iterating!");
        for (this._iterator = 0; this._iterator < this._count; ++this._iterator) {
            this._list[this._iterator].draw();
        }
        this._iterator = -1;
    };
    //#endregion
    //#region Debug
    /**
     * Returns a debug string to print the screen manager.
     * @return a string describing the screen manager.
     */
    GameScreenManager.prototype.toString = function () {
        var str = "ScreenManager:";
        for (var i = this._list.length - 1; i >= 0; --i) {
            str += "\n    " + this._list[i];
        }
        return str;
    };
    return GameScreenManager;
}());
/** @file Easing.ts */
var Easing;
(function (Easing) {
    /** PI * 2 */
    var PI_M2 = Math.PI * 2;
    /** Default Linear interpolation function. */
    function none(t, b, c, d) { return c * t / d + b; }
    Easing.none = none;
    var Quadratic;
    (function (Quadratic) {
        /** Quadratic ease in. */
        function easeIn(t, b, c, d) { return c * (t /= d) * t + b; }
        Quadratic.easeIn = easeIn;
        /** Quadratic ease out. */
        function easeOut(t, b, c, d) { return -c * (t /= d) * (t - 2) + b; }
        Quadratic.easeOut = easeOut;
        /** Quadratic ease in and out. */
        function easeInOut(t, b, c, d) { return ( /* tslint:disable */(t /= d / 2) /* tslint:enable */ < 1) ? (c / 2 * t * t + b) : (-c / 2 * ((--t) * (t - 2) - 1) + b); }
        Quadratic.easeInOut = easeInOut;
    })(Quadratic = Easing.Quadratic || (Easing.Quadratic = {}));
    var Overshoot;
    (function (Overshoot) {
        /** A soft overshoot ease. */
        function soft(t, b, c, d, part1, part2) {
            var overshoot = c * 0.025;
            var t1 = t;
            var b1 = b;
            var c1 = c + overshoot;
            var d1 = d * 0.7;
            var t2 = t - d1;
            var b2 = b + c + overshoot;
            var c2 = -overshoot;
            var d2 = d - d1;
            if (t <= d1)
                return part1(t1, b1, c1, d1);
            else
                return part2(t2, b2, c2, d2);
        }
        /** A medium overshoot ease. */
        function med(t, b, c, d, part1, part2) {
            var overshoot = c * 0.05;
            var t1 = t;
            var b1 = b;
            var c1 = c + overshoot;
            var d1 = d * 0.7;
            var t2 = t - d1;
            var b2 = b + c + overshoot;
            var c2 = -overshoot;
            var d2 = d - d1;
            if (t <= d1)
                return part1(t1, b1, c1, d1);
            else
                return part2(t2, b2, c2, d2);
        }
        /** A soft overshoot ease. */
        function softEaseOut(t, b, c, d) {
            return soft(t, b, c, d, Quadratic.easeOut, Easing.none);
        }
        Overshoot.softEaseOut = softEaseOut;
        /** A medium overshoot ease. */
        function medEaseOut(t, b, c, d) {
            return med(t, b, c, d, Quadratic.easeOut, Easing.none);
        }
        Overshoot.medEaseOut = medEaseOut;
        /** A soft overshoot ease. */
        function softEaseInOut(t, b, c, d) {
            return soft(t, b, c, d, Quadratic.easeIn, Quadratic.easeOut);
        }
        Overshoot.softEaseInOut = softEaseInOut;
    })(Overshoot = Easing.Overshoot || (Easing.Overshoot = {}));
    var Rock;
    (function (Rock) {
        /** Rocks back and forth starting from a fully rocked position. */
        function easeOut(t, b, c, d) {
            var dp = d / 7;
            var s;
            var e;
            if (t <= dp) {
                // -2 --> 0
                return Quadratic.easeIn(t, b, // -2
                c, // -2 + 2 = 0
                dp);
            }
            else if (t <= dp * 2) {
                // 0 --> 1
                return Quadratic.easeOut(t - dp, b + c, // -2 + 2 = 0
                c * 0.5, // 0 + (2 * 0.5) = 1
                dp);
            }
            else if (t <= dp * 3) {
                // 1 --> 0
                return Quadratic.easeIn(t - dp * 2, b + c * 1.5, // -2 + 2 * 1.5 = -2 + 3 = 1
                -c / 2, // 1 + -2 / 2 = 1 + -1 = 0
                dp);
            }
            else if (t <= dp * 4) {
                // 0 --> -0.5
                return Quadratic.easeOut(t - dp * 3, b + c, // -2 + 2 = 0
                -c / 4, // 0 + -2 / 4 = -2 / 4 = -0.5
                dp);
            }
            else if (t <= dp * 5) {
                // -0.5 --> 0
                return Quadratic.easeIn(t - dp * 4, b + c * 0.75, // -0.5
                c / 4, // -0.5 + 2 / 4 = -0.5 + 0.5 = 0
                dp);
            }
            else if (t <= dp * 6) {
                // 0 --> 0.25
                return Quadratic.easeOut(t - dp * 5, b + c, // -2 + 2 = 0
                c / 8, // 0 + 2 / 8 = 0.25
                dp);
            }
            else {
                // 0.25 --> 0
                return Quadratic.easeIn(t - dp * 6, b + c * 1.125, // -2 + 2 * 1.125 = 0.25
                -c / 8, dp);
            }
        }
        Rock.easeOut = easeOut;
    })(Rock = Easing.Rock || (Easing.Rock = {}));
})(Easing || (Easing = {}));
/** @file Looper.ts */
/// <reference path="Interpolator.ts" />
/**
 * Defines a basic looping behavior for an interpolator.
 */
var Looper = /** @class */ (function () {
    function Looper(total, reverseDirection) {
        if (total === void 0) { total = -1; }
        if (reverseDirection === void 0) { reverseDirection = false; }
        /** The number of times to loop, < 0 means indefinitely. */
        this.total = 0;
        /** The number of times it has looped for. */
        this.count = 0;
        this.total = total;
        this.reverseDirection = reverseDirection;
    }
    Object.defineProperty(Looper.prototype, "hasMoreLoops", {
        /** Check to see if the looper has more loops. */
        get: function () { return (this.total < 0 || this.count < this.total) ? true : false; },
        enumerable: true,
        configurable: true
    });
    /**
     * Loops the interpolator.
     * @param interpolator The interpolator to loop.
     * @param isForward Indicates if the interpolator
     */
    Looper.prototype.loop = function (interpolator, isForward) {
        if (isForward === void 0) { isForward = true; }
        if (isForward) {
            // Note that we moved a loop
            this.count++;
            // Remove one duration worth of current interpolation time
            interpolator.time -= interpolator.duration;
        }
        else {
            // Note that we moved a loop
            this.count--;
            // Add one duration worth of current interpolation time
            interpolator.time += interpolator.duration;
        }
        if (this.reverseDirection) {
            var tmp = interpolator.start;
            interpolator.start = interpolator.end;
            interpolator.end = tmp;
        }
    };
    return Looper;
}());
/** @file Interpolator.ts */
/// <reference path="../../lang/delegate/DelegateEvent.ts" />
/// <reference path="Easing.ts" />
/// <reference path="Looper.ts" />
/**
 * An interpolation control object.
 */
var Interpolator = /** @class */ (function () {
    //#endregion
    //#region Constructor
    /**
     * Creates a new Interpolator.
     * @param start The starting value to tween from.
     * @param end The ending value to tween to.
     * @param duration The duration to tween for (ms).
     * @param delay The delay before starting to tween (ms).
     * @param ease The easing function to use.
     * @param looper The looping behavior to use.
     */
    function Interpolator(start, end, duration, delay, ease, looper) {
        if (delay === void 0) { delay = 0; }
        if (ease === void 0) { ease = null; }
        if (looper === void 0) { looper = null; }
        //#region Events
        /** Fired when an interpolator starts. */
        this.onStarted = new DelegateEvent();
        /** Fired when an interpolator loops forward. */
        this.onLooped = new DelegateEvent();
        /** Fired when an interpolator loops backwards. */
        this.onReverseLooped = new DelegateEvent();
        /** Fired when the interpolator is finished. */
        this.onFinished = new DelegateEvent();
        this._duration = 1;
        /** Current playback time (ms) of the tween. */
        this.time = 0;
        this.delay = delay;
        this.start = start;
        this.end = end;
        this.duration = duration;
        this.ease = ease ? ease : Easing.none;
        this.looper = looper;
    }
    Object.defineProperty(Interpolator.prototype, "duration", {
        //#endregion
        //#region Members
        /** Duration of the tween (ms). Must be greater than 0. */
        get: function () { return this._duration; },
        set: function (v) { if (v <= 0)
            throw new Error("Supplied duration must be greater than 0!"); this._duration = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interpolator.prototype, "value", {
        /** Gets the current value at the interpolation time. */
        get: function () {
            if (this.time <= this.delay)
                return this.start;
            else if (this.time - this.delay >= this.duration)
                return this.end;
            else
                return this.ease(this.time - this.delay, this.start, this.end - this.start, this._duration);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interpolator.prototype, "isFinished", {
        /** returns true iff the interpolator is finished. */
        get: function () {
            if (this.time >= this._duration + this.delay) {
                if (this.looper && this.looper.hasMoreLoops)
                    return false;
                else
                    return true;
            }
            else
                return false;
        },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Interpolation
    /**
     * Handles looping backwards.
     */
    Interpolator.prototype.underflow = function () {
        while (this.time < 0) {
            if (this.looper) {
                this.looper.loop(this, false);
                if (!this.onReverseLooped.isEmpty)
                    this.onReverseLooped.invoke(this);
            }
            else {
                this.time = 0;
            }
        }
    };
    /**
     * Handles looping forwards.
     */
    Interpolator.prototype.overflow = function () {
        while (this.time > this._duration + this.delay) {
            if (this.looper && this.looper.hasMoreLoops) {
                this.looper.loop(this, true);
                if (!this.onLooped.isEmpty)
                    this.onLooped.invoke(this);
            }
            else {
                this.time = this._duration + this.delay;
                if (!this.onFinished.isEmpty)
                    this.onFinished.invoke(this);
            }
        }
    };
    /**
     * Handles when the end is reached.
     */
    Interpolator.prototype.reachedEnding = function () {
        if (!this.looper || !this.looper.hasMoreLoops) {
            if (!this.onFinished.isEmpty)
                this.onFinished.invoke(this);
        }
    };
    /**
     * Advances the interpolation by the specified amount of time.
     * @param elapsed The amount of time to advance by (ms).
     * @return The new value at the updated time.
     */
    Interpolator.prototype.update = function (elapsed) {
        var unstarted = false;
        if (this.time <= this.delay)
            unstarted = true;
        this.time += elapsed;
        if (unstarted && this.time > this.delay)
            this.onStarted.invoke(this);
        if (this.time < 0)
            this.underflow();
        else if (this.time === this._duration + this.delay)
            this.reachedEnding();
        else if (this.time > this._duration + this.delay)
            this.overflow();
        return this.value;
    };
    return Interpolator;
}());
/** @file Geom.ts */
/// <reference path="../math/geom/Vector2.ts" />
var Geom = /** @class */ (function () {
    function Geom(shape, radius) {
        this.shape = shape;
        this.radius = radius;
        this.radiusSquared = radius * radius;
    }
    return Geom;
}());
/** @file CircleGeom.ts */
/// <reference path="Geom.ts" />
var CircleGeom = /** @class */ (function (_super) {
    __extends(CircleGeom, _super);
    function CircleGeom(radius) {
        return _super.call(this, 0 /* Circle */, radius) || this;
    }
    CircleGeom.prototype.setOrigin = function (x, y) {
        this.originX = x;
        this.originY = y;
    };
    return CircleGeom;
}(Geom));
/** @file SquareGeom.ts */
/// <reference path="Geom.ts" />
var SquareGeom = /** @class */ (function (_super) {
    __extends(SquareGeom, _super);
    function SquareGeom(size) {
        return _super.call(this, 1 /* Square */, new Vector2(size / 2, size / 2).length()) || this;
    }
    SquareGeom.prototype.setOrigin = function (x, y) {
        this.originX = x;
        this.originY = y;
        this.x1 = x - this.size / 2;
        this.y1 = y - this.size / 2;
        this.x2 = x + this.size / 2;
        this.y2 = y + this.size / 2;
    };
    return SquareGeom;
}(Geom));
/** @file Collider.ts */
/// <reference path="Geom.ts" />
/// <reference path="CircleGeom.ts" />
/// <reference path="SquareGeom.ts" />
var Collision = /** @class */ (function () {
    function Collision() {
        this.isCollision = false;
        this.intersect = 0;
        this.response = new Vector2();
    }
    return Collision;
}());
var $Collider = /** @class */ (function () {
    function $Collider() {
        this._vec = new Vector2();
        this._collision = new Collision();
    }
    $Collider.prototype.isCollision = function (a, b, v) {
        this._collision.isCollision = false;
        this._collision.response.set(0, 0);
        this._collision.intersect = a.radius + b.radius - this._vec.set(b.originX - a.originX, b.originY - a.originY).length();
        if (this._collision.intersect > 0) {
            if (a.shape === 0 /* Circle */ && b.shape === 0 /* Circle */) {
                this._collision.isCollision = true;
            }
            else if (a.shape === 0 /* Circle */) {
                //return this.isCollisionCircleSquare(a, <SquareGeom>b);
                this._collision.isCollision = this.isCollisionCircleSquare(a, b);
            }
            else if (b.shape === 0 /* Circle */) {
                //return this.isCollisionCircleSquare(b, <SquareGeom>a);
                this._collision.isCollision = this.isCollisionCircleSquare(b, a);
            }
            else {
                throw new Error("Not implemented");
            }
        }
        return this._collision;
    };
    $Collider.prototype.isCollisionCircleSquare = function (circle, square) {
        var testX = circle.originX;
        var testY = circle.originY;
        if (circle.originX < square.x1)
            testX = square.x1;
        else if (circle.originX > square.x2)
            testX = square.x2;
        if (circle.originY < square.y1)
            testY = square.y1;
        else if (circle.originY > square.y2)
            testY = square.y2;
        this._collision.intersect = circle.radius - this._vec.set(circle.originX - testX, circle.originY - testY).length();
        //if (this._vec.set(circle.originX - testX, circle.originY - testY).length() < circle.radius)
        if (this._collision.intersect > 0) {
            return true;
        }
        {
            return false;
        }
    };
    return $Collider;
}());
var Collider = new $Collider();
/*
class Collision
{
    public isCollision:boolean = false;
    public intersect:number = 0;
    public response:Vector2 = new Vector2();
}

class $Collider
{
    private readonly _vec:Vector2 = new Vector2();

    private readonly _collision:Collision = new Collision();

    public isCollision(a:Geom, b:Geom, v?:Vector2):Collision
    {
        this._collision.isCollision = false;
        this._collision.response.set(0, 0);
        this._collision.intersect = a.radius + b.radius - this._vec.set(b.originX - a.originX, b.originY - a.originY).length();
        if (this._collision.intersect > 0)
        {
            if (a.shape === GeomShape.Circle && b.shape === GeomShape.Circle)
            {
                this._collision.isCollision = true;
            }
            else if (a.shape === GeomShape.Circle)
            {
                //return this.isCollisionCircleSquare(a, <SquareGeom>b);
                this._collision.isCollision = this.isCollisionCircleSquare(a, <SquareGeom>b);
            }
            else if (b.shape === GeomShape.Circle)
            {
                //return this.isCollisionCircleSquare(b, <SquareGeom>a);
                this._collision.isCollision = this.isCollisionCircleSquare(b, <SquareGeom>a);
            }
            else
            {
                throw new Error("Not implemented");
            }
        }

        return this._collision;
    }

    public getCollision(a:Geom, b:Geom):Collision
    {
        this._collision.isCollision = false;
        this._collision.intersect = a.radius + b.radius - this._vec.set(b.originX - a.originX, b.originY - a.originY).length();
        if (this._collision.intersect > 0)
        {
            if (a.shape === GeomShape.Circle && b.shape === GeomShape.Circle)
            {
                this._collision.isCollision = true;
            }
            else if (a.shape === GeomShape.Circle)
            {
                //return this.isCollisionCircleSquare(a, <SquareGeom>b);
                this._collision.isCollision = this.isCollisionCircleSquare(a, <SquareGeom>b);
            }
            else if (b.shape === GeomShape.Circle)
            {
                //return this.isCollisionCircleSquare(b, <SquareGeom>a);
                this._collision.isCollision = this.isCollisionCircleSquare(b, <SquareGeom>a);
            }
            else
            {
                throw new Error("Not implemented");
            }
        }

        return this._collision;
    }

    private isCollisionCircleSquare(circle:CircleGeom, square:SquareGeom):boolean
    {
        let testX:number = circle.originX;
        let testY:number = circle.originY;

        if (circle.originX < square.x1) testX = square.x1;
        else if (circle.originX > square.x2) testX = square.x2;

        if (circle.originY < square.y1) testY = square.y1;
        else if (circle.originY > square.y2) testY = square.y2;

        this._collision.intersect = circle.radius - this._vec.set(circle.originX - testX, circle.originY - testY).length();

        //if (this._vec.set(circle.originX - testX, circle.originY - testY).length() < circle.radius)
        if (this._collision.intersect > 0)
        {
            return true;
        }
        {
            return false;
        }
    }
}

const Collider:$Collider = new $Collider();
*/
/** @file Game.ts */
/// <reference path="lang/lang.ts" />
/// <reference path="lang/delegate/DelegateEvent.ts" />
/// <reference path="system/System.ts" />
/// <reference path="app/App.ts" />
/// <reference path="font/Font.ts" />
/// <reference path="GameWindow.ts" />
/// <reference path="stage/Stage.ts" />
/// <reference path="screen/GameScreenManager.ts" />
/// <reference path="assets/AssetManager.ts" />
/// <reference path="sound/SoundManager.ts" />
/// <reference path="input/keyboard/Keyboard.ts" />
/// <reference path="math/interpolation/Interpolator.ts" />
/// <reference path="physics/Collider.ts" />
/**
 * Base game class
 */
var Game = /** @class */ (function () {
    function Game() {
        this.tick = this.tick.bind(this);
        App.initialize();
    }
    Game.prototype.start = function () {
        this._lastTick = Date.now();
        this.tick();
    };
    Game.prototype.tick = function () {
        var now = Date.now();
        var elapsed = now - this._lastTick;
        this._lastTick = now;
        if (elapsed > (1000 / 60) * 3)
            elapsed = (1000 / 60) * 3;
        // Update
        this.update(elapsed);
        this.draw();
        // Begin Frame
        GameWindow.beginFrame();
        Stage.beginFrame();
        // Draw
        Stage.render();
        // Tick
        requestAnimationFrame(this.tick);
    };
    return Game;
}());
/** @file Assets.generated.ts */
// tslint:disable
var Assets = new (/** @class */ (function () {
    function class_14() {
        this.manifest = {
            images: {
                back_button: "images/back-button.png",
                baddie_Baddie0001: "images/baddie/Baddie0001.png",
                baddie_Baddie0002: "images/baddie/Baddie0002.png",
                baddie_Baddie0003: "images/baddie/Baddie0003.png",
                baddie_Baddie0004: "images/baddie/Baddie0004.png",
                baddie_Baddie0005: "images/baddie/Baddie0005.png",
                baddie_Baddie0006: "images/baddie/Baddie0006.png",
                baddie_Baddie0007: "images/baddie/Baddie0007.png",
                baddie_Baddie0008: "images/baddie/Baddie0008.png",
                baddie_Baddie0009: "images/baddie/Baddie0009.png",
                baddie_Baddie0010: "images/baddie/Baddie0010.png",
                baddie_Baddie0011: "images/baddie/Baddie0011.png",
                baddie_Baddie0012: "images/baddie/Baddie0012.png",
                baddie_Baddie0013: "images/baddie/Baddie0013.png",
                baddie_Baddie0014: "images/baddie/Baddie0014.png",
                baddie_Baddie0015: "images/baddie/Baddie0015.png",
                baddie_Baddie0016: "images/baddie/Baddie0016.png",
                baddie_Baddie0017: "images/baddie/Baddie0017.png",
                baddie_Baddie0018: "images/baddie/Baddie0018.png",
                baddie_Baddie0019: "images/baddie/Baddie0019.png",
                baddie_Baddie0020: "images/baddie/Baddie0020.png",
                baddie_Baddie0021: "images/baddie/Baddie0021.png",
                baddie_Baddie0022: "images/baddie/Baddie0022.png",
                baddie_Baddie0023: "images/baddie/Baddie0023.png",
                baddie_Baddie0024: "images/baddie/Baddie0024.png",
                baddie_frames0001: "images/baddie/frames0001.png",
                baddie_frames0002: "images/baddie/frames0002.png",
                baddie_frames0003: "images/baddie/frames0003.png",
                baddie_frames0004: "images/baddie/frames0004.png",
                baddie_frames0005: "images/baddie/frames0005.png",
                baddie_frames0006: "images/baddie/frames0006.png",
                baddie_frames0007: "images/baddie/frames0007.png",
                baddie_frames0008: "images/baddie/frames0008.png",
                baddie_frames0009: "images/baddie/frames0009.png",
                baddie_frames0010: "images/baddie/frames0010.png",
                baddie_frames0011: "images/baddie/frames0011.png",
                baddie_frames0012: "images/baddie/frames0012.png",
                baddie_frames0013: "images/baddie/frames0013.png",
                baddie_frames0014: "images/baddie/frames0014.png",
                baddie_frames0015: "images/baddie/frames0015.png",
                baddie_frames0016: "images/baddie/frames0016.png",
                baddie_frames0017: "images/baddie/frames0017.png",
                baddie_frames0018: "images/baddie/frames0018.png",
                baddie_frames0019: "images/baddie/frames0019.png",
                baddie_frames0020: "images/baddie/frames0020.png",
                baddie_frames0021: "images/baddie/frames0021.png",
                baddie_frames0022: "images/baddie/frames0022.png",
                baddie_frames0023: "images/baddie/frames0023.png",
                baddie_frames0024: "images/baddie/frames0024.png",
                Castle: "images/Castle.png",
                engineer_blue_Player_Dwarf_Blue0001: "images/engineer/blue/Player_Dwarf_Blue0001.png",
                engineer_blue_Player_Dwarf_Blue0002: "images/engineer/blue/Player_Dwarf_Blue0002.png",
                engineer_blue_Player_Dwarf_Blue0003: "images/engineer/blue/Player_Dwarf_Blue0003.png",
                engineer_blue_Player_Dwarf_Blue0004: "images/engineer/blue/Player_Dwarf_Blue0004.png",
                engineer_blue_Player_Dwarf_Blue0005: "images/engineer/blue/Player_Dwarf_Blue0005.png",
                engineer_blue_Player_Dwarf_Blue0006: "images/engineer/blue/Player_Dwarf_Blue0006.png",
                engineer_blue_Player_Dwarf_Blue0007: "images/engineer/blue/Player_Dwarf_Blue0007.png",
                engineer_blue_Player_Dwarf_Blue0008: "images/engineer/blue/Player_Dwarf_Blue0008.png",
                engineer_blue_Player_Dwarf_Blue0009: "images/engineer/blue/Player_Dwarf_Blue0009.png",
                engineer_blue_Player_Dwarf_Blue0010: "images/engineer/blue/Player_Dwarf_Blue0010.png",
                engineer_blue_Player_Dwarf_Blue0011: "images/engineer/blue/Player_Dwarf_Blue0011.png",
                engineer_blue_Player_Dwarf_Blue0012: "images/engineer/blue/Player_Dwarf_Blue0012.png",
                engineer_blue_Player_Dwarf_Blue0013: "images/engineer/blue/Player_Dwarf_Blue0013.png",
                engineer_blue_Player_Dwarf_Blue0014: "images/engineer/blue/Player_Dwarf_Blue0014.png",
                engineer_blue_Player_Dwarf_Blue0015: "images/engineer/blue/Player_Dwarf_Blue0015.png",
                engineer_blue_Player_Dwarf_Blue0016: "images/engineer/blue/Player_Dwarf_Blue0016.png",
                engineer_blue_Player_Dwarf_Blue0017: "images/engineer/blue/Player_Dwarf_Blue0017.png",
                engineer_blue_Player_Dwarf_Blue0018: "images/engineer/blue/Player_Dwarf_Blue0018.png",
                engineer_blue_Player_Dwarf_Blue0019: "images/engineer/blue/Player_Dwarf_Blue0019.png",
                engineer_blue_Player_Dwarf_Blue0020: "images/engineer/blue/Player_Dwarf_Blue0020.png",
                engineer_blue_Player_Dwarf_Blue0021: "images/engineer/blue/Player_Dwarf_Blue0021.png",
                engineer_blue_Player_Dwarf_Blue0022: "images/engineer/blue/Player_Dwarf_Blue0022.png",
                engineer_blue_Player_Dwarf_Blue0023: "images/engineer/blue/Player_Dwarf_Blue0023.png",
                engineer_blue_Player_Dwarf_Blue0024: "images/engineer/blue/Player_Dwarf_Blue0024.png",
                engineer_blue_Player_Dwarf_Blue0025: "images/engineer/blue/Player_Dwarf_Blue0025.png",
                engineer_blue_Player_Dwarf_Blue0026: "images/engineer/blue/Player_Dwarf_Blue0026.png",
                fighter_blue_fighter0001: "images/fighter/blue/fighter0001.png",
                fighter_blue_fighter0002: "images/fighter/blue/fighter0002.png",
                fighter_blue_fighter0003: "images/fighter/blue/fighter0003.png",
                fighter_blue_fighter0004: "images/fighter/blue/fighter0004.png",
                fighter_blue_fighter0005: "images/fighter/blue/fighter0005.png",
                fighter_blue_fighter0006: "images/fighter/blue/fighter0006.png",
                fighter_blue_fighter0007: "images/fighter/blue/fighter0007.png",
                fighter_blue_fighter0008: "images/fighter/blue/fighter0008.png",
                fighter_blue_fighter0009: "images/fighter/blue/fighter0009.png",
                fighter_blue_fighter0010: "images/fighter/blue/fighter0010.png",
                fighter_blue_fighter0011: "images/fighter/blue/fighter0011.png",
                fighter_blue_fighter0012: "images/fighter/blue/fighter0012.png",
                fighter_blue_fighter0013: "images/fighter/blue/fighter0013.png",
                fighter_blue_fighter0014: "images/fighter/blue/fighter0014.png",
                fighter_blue_fighter0015: "images/fighter/blue/fighter0015.png",
                fighter_blue_fighter0016: "images/fighter/blue/fighter0016.png",
                fighter_blue_fighter0017: "images/fighter/blue/fighter0017.png",
                fighter_blue_fighter0018: "images/fighter/blue/fighter0018.png",
                fighter_blue_fighter0019: "images/fighter/blue/fighter0019.png",
                fighter_blue_fighter0020: "images/fighter/blue/fighter0020.png",
                fighter_blue_fighter0021: "images/fighter/blue/fighter0021.png",
                fighter_blue_fighter0022: "images/fighter/blue/fighter0022.png",
                fighter_blue_fighter0023: "images/fighter/blue/fighter0023.png",
                fighter_blue_fighter0024: "images/fighter/blue/fighter0024.png",
                fighter_blue_fighter0025: "images/fighter/blue/fighter0025.png",
                fighter_blue_fighter0026: "images/fighter/blue/fighter0026.png",
                fighter_blue_fighter0027: "images/fighter/blue/fighter0027.png",
                fighter_blue_fighter0028: "images/fighter/blue/fighter0028.png",
                fighter_blue_fighter0029: "images/fighter/blue/fighter0029.png",
                fighter_blue_fighter0030: "images/fighter/blue/fighter0030.png",
                fighter_blue_fighter0031: "images/fighter/blue/fighter0031.png",
                fighter_cyan_fighter0001: "images/fighter/cyan/fighter0001.png",
                fighter_cyan_fighter0002: "images/fighter/cyan/fighter0002.png",
                fighter_cyan_fighter0003: "images/fighter/cyan/fighter0003.png",
                fighter_cyan_fighter0004: "images/fighter/cyan/fighter0004.png",
                fighter_cyan_fighter0005: "images/fighter/cyan/fighter0005.png",
                fighter_cyan_fighter0006: "images/fighter/cyan/fighter0006.png",
                fighter_cyan_fighter0007: "images/fighter/cyan/fighter0007.png",
                fighter_cyan_fighter0008: "images/fighter/cyan/fighter0008.png",
                fighter_cyan_fighter0009: "images/fighter/cyan/fighter0009.png",
                fighter_cyan_fighter0010: "images/fighter/cyan/fighter0010.png",
                fighter_cyan_fighter0011: "images/fighter/cyan/fighter0011.png",
                fighter_cyan_fighter0012: "images/fighter/cyan/fighter0012.png",
                fighter_cyan_fighter0013: "images/fighter/cyan/fighter0013.png",
                fighter_cyan_fighter0014: "images/fighter/cyan/fighter0014.png",
                fighter_cyan_fighter0015: "images/fighter/cyan/fighter0015.png",
                fighter_cyan_fighter0016: "images/fighter/cyan/fighter0016.png",
                fighter_cyan_fighter0017: "images/fighter/cyan/fighter0017.png",
                fighter_cyan_fighter0018: "images/fighter/cyan/fighter0018.png",
                fighter_cyan_fighter0019: "images/fighter/cyan/fighter0019.png",
                fighter_cyan_fighter0020: "images/fighter/cyan/fighter0020.png",
                fighter_cyan_fighter0021: "images/fighter/cyan/fighter0021.png",
                fighter_cyan_fighter0022: "images/fighter/cyan/fighter0022.png",
                fighter_cyan_fighter0023: "images/fighter/cyan/fighter0023.png",
                fighter_cyan_fighter0024: "images/fighter/cyan/fighter0024.png",
                fighter_cyan_fighter0025: "images/fighter/cyan/fighter0025.png",
                fighter_cyan_fighter0026: "images/fighter/cyan/fighter0026.png",
                fighter_cyan_fighter0027: "images/fighter/cyan/fighter0027.png",
                fighter_cyan_fighter0028: "images/fighter/cyan/fighter0028.png",
                fighter_cyan_fighter0029: "images/fighter/cyan/fighter0029.png",
                fighter_cyan_fighter0030: "images/fighter/cyan/fighter0030.png",
                fighter_cyan_fighter0031: "images/fighter/cyan/fighter0031.png",
                fighter_green_fighter0001: "images/fighter/green/fighter0001.png",
                fighter_green_fighter0002: "images/fighter/green/fighter0002.png",
                fighter_green_fighter0003: "images/fighter/green/fighter0003.png",
                fighter_green_fighter0004: "images/fighter/green/fighter0004.png",
                fighter_green_fighter0005: "images/fighter/green/fighter0005.png",
                fighter_green_fighter0006: "images/fighter/green/fighter0006.png",
                fighter_green_fighter0007: "images/fighter/green/fighter0007.png",
                fighter_green_fighter0008: "images/fighter/green/fighter0008.png",
                fighter_green_fighter0009: "images/fighter/green/fighter0009.png",
                fighter_green_fighter0010: "images/fighter/green/fighter0010.png",
                fighter_green_fighter0011: "images/fighter/green/fighter0011.png",
                fighter_green_fighter0012: "images/fighter/green/fighter0012.png",
                fighter_green_fighter0013: "images/fighter/green/fighter0013.png",
                fighter_green_fighter0014: "images/fighter/green/fighter0014.png",
                fighter_green_fighter0015: "images/fighter/green/fighter0015.png",
                fighter_green_fighter0016: "images/fighter/green/fighter0016.png",
                fighter_green_fighter0017: "images/fighter/green/fighter0017.png",
                fighter_green_fighter0018: "images/fighter/green/fighter0018.png",
                fighter_green_fighter0019: "images/fighter/green/fighter0019.png",
                fighter_green_fighter0020: "images/fighter/green/fighter0020.png",
                fighter_green_fighter0021: "images/fighter/green/fighter0021.png",
                fighter_green_fighter0022: "images/fighter/green/fighter0022.png",
                fighter_green_fighter0023: "images/fighter/green/fighter0023.png",
                fighter_green_fighter0024: "images/fighter/green/fighter0024.png",
                fighter_green_fighter0025: "images/fighter/green/fighter0025.png",
                fighter_green_fighter0026: "images/fighter/green/fighter0026.png",
                fighter_green_fighter0027: "images/fighter/green/fighter0027.png",
                fighter_green_fighter0028: "images/fighter/green/fighter0028.png",
                fighter_green_fighter0029: "images/fighter/green/fighter0029.png",
                fighter_green_fighter0030: "images/fighter/green/fighter0030.png",
                fighter_green_fighter0031: "images/fighter/green/fighter0031.png",
                fighter_red_fighter0001: "images/fighter/red/fighter0001.png",
                fighter_red_fighter0002: "images/fighter/red/fighter0002.png",
                fighter_red_fighter0003: "images/fighter/red/fighter0003.png",
                fighter_red_fighter0004: "images/fighter/red/fighter0004.png",
                fighter_red_fighter0005: "images/fighter/red/fighter0005.png",
                fighter_red_fighter0006: "images/fighter/red/fighter0006.png",
                fighter_red_fighter0007: "images/fighter/red/fighter0007.png",
                fighter_red_fighter0008: "images/fighter/red/fighter0008.png",
                fighter_red_fighter0009: "images/fighter/red/fighter0009.png",
                fighter_red_fighter0010: "images/fighter/red/fighter0010.png",
                fighter_red_fighter0011: "images/fighter/red/fighter0011.png",
                fighter_red_fighter0012: "images/fighter/red/fighter0012.png",
                fighter_red_fighter0013: "images/fighter/red/fighter0013.png",
                fighter_red_fighter0014: "images/fighter/red/fighter0014.png",
                fighter_red_fighter0015: "images/fighter/red/fighter0015.png",
                fighter_red_fighter0016: "images/fighter/red/fighter0016.png",
                fighter_red_fighter0017: "images/fighter/red/fighter0017.png",
                fighter_red_fighter0018: "images/fighter/red/fighter0018.png",
                fighter_red_fighter0019: "images/fighter/red/fighter0019.png",
                fighter_red_fighter0020: "images/fighter/red/fighter0020.png",
                fighter_red_fighter0021: "images/fighter/red/fighter0021.png",
                fighter_red_fighter0022: "images/fighter/red/fighter0022.png",
                fighter_red_fighter0023: "images/fighter/red/fighter0023.png",
                fighter_red_fighter0024: "images/fighter/red/fighter0024.png",
                fighter_red_fighter0025: "images/fighter/red/fighter0025.png",
                fighter_red_fighter0026: "images/fighter/red/fighter0026.png",
                fighter_red_fighter0027: "images/fighter/red/fighter0027.png",
                fighter_red_fighter0028: "images/fighter/red/fighter0028.png",
                fighter_red_fighter0029: "images/fighter/red/fighter0029.png",
                fighter_red_fighter0030: "images/fighter/red/fighter0030.png",
                fighter_red_fighter0031: "images/fighter/red/fighter0031.png",
                FX_Bolt: "images/FX_Bolt.png",
                FX_BoltFire: "images/FX_BoltFire.png",
                icon_attack: "images/icon-attack.png",
                icon_build: "images/icon-build.png",
                icon_defense: "images/icon-defense.png",
                icon_speed: "images/icon-speed.png",
                log: "images/log.png",
                logo: "images/logo.png",
                map_background: "images/map-background.png",
                nail_down: "images/nail-down.png",
                nail_up: "images/nail-up.png",
                test_map: "images/test-map.png",
                Title: "images/Title.png",
                Tower_Build: "images/Tower-Build.png",
                Tower: "images/Tower.png",
                TowerBolt: "images/TowerBolt.png",
                Tree: "images/Tree.png"
            },
            sounds: {
                Arrow_Shot: "sounds/Arrow Shot.mp3",
                AXE_WHOOSH: "sounds/AXE WHOOSH.mp3",
                Charachter_select_loop: "sounds/Charachter select_loop.mp3",
                Chopping_Complete: "sounds/Chopping Complete.mp3",
                Enemy_Hit_4: "sounds/Enemy Hit 4.mp3",
                Gameplay_Loop: "sounds/Gameplay Loop.mp3",
                Log_Chopping_1: "sounds/Log Chopping 1.mp3",
                Log_Chopping_2: "sounds/Log Chopping 2.mp3",
                Log_Chopping_3: "sounds/Log Chopping 3.mp3",
                Repair_Hammer_on_Nail: "sounds/Repair_Hammer on Nail.mp3"
            },
            fonts: {
                OpenSans_Bold: "fonts/OpenSans-Bold.ttf",
                gothamBlack: "fonts/gothamBlack.ttf"
            }
        };
        this.images = {};
        this.sounds = {};
        this.fonts = {
            OpenSans_Bold: new Font("OpenSans", "bold", "normal", "normal", 2189, -600, 2048),
            gothamBlack: new Font("Gotham Black", "normal", "normal", "normal", 730, -160, 1000)
        };
    }
    return class_14;
}()))();
// tslint:enable
/** @file ControlPadButton.ts */
var ControlPadButton = /** @class */ (function () {
    function ControlPadButton() {
        this.isPressed = false;
        this.justPressed = false;
        this.justReleased = false;
    }
    return ControlPadButton;
}());
/** @file ControlPadStick.ts */
var ControlPadStick = /** @class */ (function () {
    function ControlPadStick() {
        this.isPressed = false;
        this.justPressed = false;
        this.justReleased = false;
        this.vector = new Vector2();
    }
    return ControlPadStick;
}());
/** @file ControlPad.ts */
/// <reference path="ControlPadButton.ts" />
/// <reference path="ControlPadStick.ts" />
var ControlPad = /** @class */ (function () {
    function ControlPad(index) {
        this.index = index;
        this.attackButton = new ControlPadButton();
        this.interactButton = new ControlPadButton();
        this.buildButton = new ControlPadButton();
        this.stick = new ControlPadStick();
    }
    ControlPad.prototype.update = function (degs, move, attack, interact, build) {
        this.attackButton.justPressed = this.attackButton.justReleased = false;
        this.interactButton.justPressed = this.interactButton.justReleased = false;
        this.buildButton.justPressed = this.buildButton.justReleased = false;
        this.stick.justPressed = this.stick.justReleased = false;
        this.stick.vector.x = MathUtil.cosDegrees(degs);
        this.stick.vector.y = MathUtil.sinDegrees(degs);
        if (move) {
            if (!this.stick.isPressed) {
                this.stick.isPressed = true;
                this.stick.justPressed = true;
            }
        }
        else {
            this.stick.vector.set(0, 0);
            if (this.stick.isPressed) {
                this.stick.isPressed = false;
                this.stick.justReleased = true;
            }
        }
        if (build) {
            if (!this.buildButton.isPressed) {
                this.buildButton.isPressed = true;
                this.buildButton.justPressed = true;
            }
        }
        else {
            if (this.buildButton.isPressed) {
                this.buildButton.isPressed = false;
                this.buildButton.justReleased = true;
            }
        }
        if (interact) {
            if (!this.interactButton.isPressed) {
                this.interactButton.isPressed = true;
                this.interactButton.justPressed = true;
            }
        }
        else {
            if (this.interactButton.isPressed) {
                this.interactButton.isPressed = false;
                this.interactButton.justReleased = true;
            }
        }
        if (attack) {
            if (!this.attackButton.isPressed) {
                this.attackButton.isPressed = true;
                this.attackButton.justPressed = true;
            }
        }
        else {
            if (this.attackButton.isPressed) {
                this.attackButton.isPressed = false;
                this.attackButton.justReleased = true;
            }
        }
    };
    ControlPad.array = [
        new ControlPad(0),
        new ControlPad(1),
        new ControlPad(2),
        new ControlPad(3)
    ];
    return ControlPad;
}());
/** @file LocalControlPad.ts */
var LocalControlPad = /** @class */ (function (_super) {
    __extends(LocalControlPad, _super);
    function LocalControlPad() {
        var _this = _super.call(this, 0) || this;
        ControlPad.array[0] = _this;
        return _this;
    }
    LocalControlPad.prototype.poll = function () {
        this.attackButton.justPressed = false;
        this.interactButton.justPressed = false;
        this.buildButton.justPressed = false;
        this.stick.justPressed = false;
        this.attackButton.justReleased = false;
        this.interactButton.justReleased = false;
        this.buildButton.justReleased = false;
        this.stick.justReleased = false;
        if (Keyboard.keys.Space.isPressed) {
            if (!this.attackButton.isPressed) {
                this.attackButton.isPressed = true;
                this.attackButton.justPressed = true;
            }
        }
        else {
            if (this.attackButton.isPressed) {
                this.attackButton.isPressed = false;
                this.attackButton.justReleased = true;
            }
        }
        if (Keyboard.keys.Enter.isPressed) {
            if (!this.interactButton.isPressed) {
                this.interactButton.isPressed = true;
                this.interactButton.justPressed = true;
            }
        }
        else {
            if (this.interactButton.isPressed) {
                this.interactButton.isPressed = false;
                this.interactButton.justReleased = true;
            }
        }
        if (Keyboard.keys.B.isPressed) {
            if (!this.buildButton.isPressed) {
                this.buildButton.isPressed = true;
                this.buildButton.justPressed = true;
            }
        }
        else {
            if (this.buildButton.isPressed) {
                this.buildButton.isPressed = false;
                this.buildButton.justReleased = true;
            }
        }
        var v = this.stick.vector.set(0, 0);
        if (Keyboard.keys.Left.isPressed)
            v.x--;
        if (Keyboard.keys.Right.isPressed)
            v.x++;
        if (Keyboard.keys.Up.isPressed)
            v.y--;
        if (Keyboard.keys.Down.isPressed)
            v.y++;
        if (v.lengthSquared() > 0) {
            v.normalize();
            if (!this.stick.isPressed) {
                this.stick.isPressed = true;
                this.stick.justPressed = true;
            }
        }
        else {
            if (this.stick.isPressed) {
                this.stick.isPressed = false;
                this.stick.justReleased = true;
            }
        }
    };
    return LocalControlPad;
}(ControlPad));
/** @file GameState.ts */
var $GameState = /** @class */ (function () {
    function $GameState() {
        this.logs = 999;
        this.coins = 0;
    }
    $GameState.prototype.reset = function () {
        this.logs = 0;
        this.coins = 0;
    };
    return $GameState;
}());
var GameState = new $GameState();
/** @file ConnectionState.ts */
/** @file MapObjSprite.ts */
var MapObjSprite = /** @class */ (function (_super) {
    __extends(MapObjSprite, _super);
    function MapObjSprite() {
        var _this = _super.call(this) || this;
        _this.sortIndex = Map.sortIndex++;
        return _this;
    }
    return MapObjSprite;
}(Sprite));
var MapObjBmp = /** @class */ (function (_super) {
    __extends(MapObjBmp, _super);
    function MapObjBmp(texture, sx, sy, sw, sh) {
        if (texture === void 0) { texture = null; }
        if (sx === void 0) { sx = 0; }
        if (sy === void 0) { sy = 0; }
        if (sw === void 0) { sw = texture ? texture.width : 0; }
        if (sh === void 0) { sh = texture ? texture.height : 0; }
        var _this = _super.call(this, texture, sx, sy, sw, sh) || this;
        _this.sortIndex = Map.sortIndex++;
        return _this;
    }
    return MapObjBmp;
}(Bitmap));
/** @file PlayerSprite.ts */
/// <reference path="../../map/MapObjSprite.ts" />
var PlayerSprite = /** @class */ (function (_super) {
    __extends(PlayerSprite, _super);
    function PlayerSprite(index, map, job) {
        var _this = _super.call(this) || this;
        _this.bmp = new Bitmap(null, 0, 0, PlayerSprite.WIDTH, PlayerSprite.HEIGHT);
        _this._idleFrames = [];
        _this._walkFrames = [];
        _this._attackFrames = [];
        _this.frames = _this._idleFrames;
        _this.isDead = false;
        _this.geom = new CircleGeom(24);
        _this.speed = 400;
        _this.attackDelay = 500;
        _this.state = 0 /* Idle */;
        _this.nearbyTree = null;
        _this.nearbyTower = null;
        _this.moved = false;
        _this.frame = 0;
        _this.step = 0;
        _this._attackCooldown = 0;
        _this._attackTimeElapsed = 0;
        _this._hits = [];
        _this.index = index;
        _this.map = map;
        _this.job = job;
        _this.color = PlayerColors.array[_this.index];
        _this.pad = ControlPad.array[_this.index];
        return _this;
    }
    PlayerSprite.prototype.attack = function () {
        this._hits.length = 0;
        this._attackTimeElapsed = 0;
        this.setState(2 /* Attack */);
        new Sound(Assets.sounds.AXE_WHOOSH).play();
    };
    PlayerSprite.prototype.distSqr = function (x, y) {
        return x * x + y * y;
    };
    PlayerSprite.prototype.update = function (elasped) {
        this.tick(elasped);
        this._attackCooldown -= elasped;
        // Update nearby
        var cell = this.map.getCellAt(this.x, this.y);
        if (cell.tree)
            this.nearbyTree = cell.tree;
        else
            this.nearbyTree = null;
        if (cell.tower)
            this.nearbyTower = cell.tower;
        else
            this.nearbyTower = null;
        // Check if interaction
        if (DisplayClient.room.playerSlots[this.index].choppingTree === null && DisplayClient.room.playerSlots[this.index].repairingBuilding === null) {
            if (this.pad.attackButton.isPressed) {
                if (this._attackCooldown <= 0) {
                    this.attack();
                    this._attackCooldown = this.attackDelay;
                }
            }
            else if (this.pad.interactButton.justPressed) {
                if (this.nearbyTower && !this.nearbyTower.busy && this.nearbyTower.health < 100) {
                    // Hide nearby tree
                    if (this.nearbyTree) {
                        this.nearbyTree.removeNearbyPlayer();
                        this.nearbyTree = null;
                    }
                    // Hide nearby tree
                    if (this.nearbyTree) {
                        this.nearbyTree.removeNearbyPlayer();
                        this.nearbyTree = null;
                    }
                    // Trigger minigame
                    DisplayClient.triggerBuildingMinigame(this.index, this.nearbyTower);
                }
                else if (this.nearbyTree && !this.nearbyTree.busy) {
                    DisplayClient.triggerLoggingMinigame(this.index, this.nearbyTree);
                    this.nearbyTree.removeNearbyPlayer();
                    this.nearbyTree = null;
                }
            }
        }
        // Check for hits
        // FIGHTER ONLY
        if ( /*this.job === PlayerJobs.Fighter && */this.state === 2 /* Attack */) {
            this._attackTimeElapsed += elasped;
            var attackDur = 1000 / 60 * this._attackFrames.length;
            var attackPct = this._attackTimeElapsed / attackDur;
            var newHits = [];
            var v = new Vector2();
            var attackRadiusSqr = 192 * 192;
            for (var _i = 0, _a = this.map.monsterSprites; _i < _a.length; _i++) {
                var monster = _a[_i];
                if (this._hits.indexOf(monster) < 0) {
                    if (v.set(monster.x - this.x, monster.y - this.y).lengthSquared() <= attackRadiusSqr) {
                        var rot = MathUtil.RAD_TO_DEG * Math.atan2(v.y, v.x);
                        if (rot < 0)
                            rot += 360;
                        rot = 180 - rot;
                        if (rot < 0)
                            rot += 360;
                        rot = rot / 360;
                        if (Math.abs(attackPct - rot) <= 1) {
                            this._hits.push(monster);
                            newHits.push(monster);
                            new Sound(Assets.sounds.Enemy_Hit_4).play();
                        }
                    }
                }
            }
            for (var _b = 0, newHits_1 = newHits; _b < newHits_1.length; _b++) {
                var monster = newHits_1[_b];
                monster.hit(75);
            }
        }
        // Advance anim playhead
        this.step += elasped;
        // Update state
        if (this.moved)
            this.setState(1 /* Walk */);
        else
            this.setState(0 /* Idle */);
        // Advance frames
        while (this.step > 1000 / 30) {
            if (this.job === PlayerJobs.Fighter && this.state === 2 /* Attack */)
                this.step -= 1000 / 60;
            else
                this.step -= 1000 / 30;
            this.frame++;
            if (this.state === 2 /* Attack */ && this.frame >= this.frames.length) {
                this.state = null;
                if (this.moved)
                    this.setState(1 /* Walk */);
                else
                    this.setState(0 /* Idle */);
            }
            else
                while (this.frame >= this.frames.length)
                    this.frame -= this.frames.length;
        }
        // Update texture
        var tex = this.frames[this.frame];
        if (tex !== this.bmp.texture)
            this.bmp.texture = tex;
        // Reset state
        this.moved = false;
    };
    PlayerSprite.prototype.setState = function (state) {
        if (this.state !== 2 /* Attack */) {
            if (this.state !== state) {
                this.state = state;
                this.frame = 0;
                this.step = 0;
                if (state === 1 /* Walk */)
                    this.frames = this._walkFrames;
                else if (state === 0 /* Idle */)
                    this.frames = this._idleFrames;
                else if (state === 2 /* Attack */)
                    this.frames = this._attackFrames;
            }
        }
    };
    PlayerSprite.prototype.tick = function (ticks) {
        var v = this.pad.stick.vector.clone();
        if (v.lengthSquared() > 0) {
            v.x *= (ticks / 1000) * this.speed;
            v.y *= (ticks / 1000) * this.speed;
            var newX = this.x + v.x;
            var newY = this.y + v.y;
            if (this.tryMove(newX, newY)) {
                this.moved = true;
                this.setPosition(newX, newY);
            }
            else if (this.tryMove(this.x, newY)) {
                this.moved = true;
                this.setPosition(this.x, newY);
            }
            else if (this.tryMove(newX, this.y)) {
                this.moved = true;
                this.setPosition(newX, this.y);
            }
            else {
                this.moved = false;
                this.setPosition(this.x, this.y);
            }
        }
        else {
            this.moved = false;
        }
    };
    PlayerSprite.prototype.tryMove = function (newX, newY) {
        // Update the geom to target position
        this.geom.setOrigin(newX, newY);
        // check grid
        var minR = Math.floor((newY - this.geom.radius) / Map.CELL_HEIGHT);
        var minC = Math.floor((newX - this.geom.radius) / Map.CELL_WIDTH);
        var maxR = Math.floor((newY + this.geom.radius) / Map.CELL_HEIGHT);
        var maxC = Math.floor((newX + this.geom.radius) / Map.CELL_WIDTH);
        for (var r = minR; r <= maxR; ++r) {
            for (var c = minC; c <= maxC; ++c) {
                var cell = this.map.getCell(r, c);
                if (!cell) {
                    return false;
                }
                else if (!cell.walkable) {
                    var cellGeom = new SquareGeom(64);
                    cellGeom.setOrigin((c + 0.5) * Map.CELL_WIDTH, (r + 0.5) * Map.CELL_HEIGHT);
                    if (Collider.isCollision(this.geom, cellGeom).isCollision) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    PlayerSprite.prototype.setPosition = function (x, y) {
        this.geom.setOrigin(this.x = x, this.y = y);
    };
    PlayerSprite.WIDTH = 128;
    PlayerSprite.HEIGHT = 128;
    return PlayerSprite;
}(MapObjSprite));
/** @file EngineerSprite.ts */
/// <reference path="PlayerSprite.ts" />
var EngineerSprite = /** @class */ (function (_super) {
    __extends(EngineerSprite, _super);
    function EngineerSprite(index, map) {
        var _this = _super.call(this, index, map, PlayerJobs.Engineer) || this;
        if (_this.color === PlayerColors.Red) {
            _this._idleFrames.push(Assets.images.fighter_red_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0030);
        }
        else if (_this.color === PlayerColors.Blue) {
            _this._idleFrames.push(Assets.images.fighter_blue_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0030);
        }
        else if (_this.color === PlayerColors.Yellow) {
            _this._idleFrames.push(Assets.images.fighter_cyan_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0030);
        }
        else {
            _this._idleFrames.push(Assets.images.fighter_green_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0030);
        }
        _this.bmp.texture = _this._idleFrames[0];
        _this.bmp.srcRect.set(0, 0, _this.bmp.texture.width, _this.bmp.texture.height);
        _this.bmp.regX = 91;
        _this.bmp.regY = 123;
        _this.addChild(_this.bmp);
        return _this;
    }
    EngineerSprite.prototype.render = function (ctx, matrix, alpha) {
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return EngineerSprite;
}(PlayerSprite));
/** @file FighterSprite.ts */
/// <reference path="PlayerSprite.ts" />
var FighterSprite = /** @class */ (function (_super) {
    __extends(FighterSprite, _super);
    function FighterSprite(index, map) {
        var _this = _super.call(this, index, map, PlayerJobs.Fighter) || this;
        if (_this.color === PlayerColors.Red) {
            _this._idleFrames.push(Assets.images.fighter_red_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0030);
        }
        else if (_this.color === PlayerColors.Blue) {
            _this._idleFrames.push(Assets.images.fighter_blue_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0030);
        }
        else if (_this.color === PlayerColors.Yellow) {
            _this._idleFrames.push(Assets.images.fighter_cyan_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0030);
        }
        else {
            _this._idleFrames.push(Assets.images.fighter_green_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0030);
        }
        _this.bmp.texture = _this._idleFrames[0];
        _this.bmp.srcRect.set(0, 0, _this.bmp.texture.width, _this.bmp.texture.height);
        _this.bmp.regX = 91;
        _this.bmp.regY = 123;
        _this.addChild(_this.bmp);
        return _this;
    }
    FighterSprite.prototype.render = function (ctx, matrix, alpha) {
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return FighterSprite;
}(PlayerSprite));
/** @file ThiefSprite.ts */
/// <reference path="PlayerSprite.ts" />
var ThiefSprite = /** @class */ (function (_super) {
    __extends(ThiefSprite, _super);
    function ThiefSprite(index, map) {
        var _this = _super.call(this, index, map, PlayerJobs.Thief) || this;
        if (_this.color === PlayerColors.Red) {
            _this._idleFrames.push(Assets.images.fighter_red_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0030);
        }
        else if (_this.color === PlayerColors.Blue) {
            _this._idleFrames.push(Assets.images.fighter_blue_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0030);
        }
        else if (_this.color === PlayerColors.Yellow) {
            _this._idleFrames.push(Assets.images.fighter_cyan_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0030);
        }
        else {
            _this._idleFrames.push(Assets.images.fighter_green_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0030);
        }
        _this.bmp.texture = _this._idleFrames[0];
        _this.bmp.srcRect.set(0, 0, _this.bmp.texture.width, _this.bmp.texture.height);
        _this.bmp.regX = 91;
        _this.bmp.regY = 123;
        _this.addChild(_this.bmp);
        return _this;
    }
    ThiefSprite.prototype.render = function (ctx, matrix, alpha) {
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return ThiefSprite;
}(PlayerSprite));
/** @file BardSprite.ts */
/// <reference path="PlayerSprite.ts" />
var BardSprite = /** @class */ (function (_super) {
    __extends(BardSprite, _super);
    function BardSprite(index, map) {
        var _this = _super.call(this, index, map, PlayerJobs.Bard) || this;
        if (_this.color === PlayerColors.Red) {
            _this._idleFrames.push(Assets.images.fighter_red_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_red_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_red_fighter0030);
        }
        else if (_this.color === PlayerColors.Blue) {
            _this._idleFrames.push(Assets.images.fighter_blue_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_blue_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_blue_fighter0030);
        }
        else if (_this.color === PlayerColors.Yellow) {
            _this._idleFrames.push(Assets.images.fighter_cyan_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_cyan_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_cyan_fighter0030);
        }
        else {
            _this._idleFrames.push(Assets.images.fighter_green_fighter0001);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0002);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0003);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0004);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0005);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0006);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0007);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0008);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0009);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0010);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0011);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0012);
            _this._walkFrames.push(Assets.images.fighter_green_fighter0013);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0015);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0016);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0017);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0018);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0019);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0020);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0021);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0022);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0023);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0024);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0025);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0026);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0027);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0028);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0029);
            _this._attackFrames.push(Assets.images.fighter_green_fighter0030);
        }
        _this.bmp.texture = _this._idleFrames[0];
        _this.bmp.srcRect.set(0, 0, _this.bmp.texture.width, _this.bmp.texture.height);
        _this.bmp.regX = 91;
        _this.bmp.regY = 123;
        _this.addChild(_this.bmp);
        return _this;
    }
    BardSprite.prototype.render = function (ctx, matrix, alpha) {
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return BardSprite;
}(PlayerSprite));
/** @file PlayerJobs.ts */
/// <reference path="../stage/sprites/pc/EngineerSprite.ts" />
/// <reference path="../stage/sprites/pc/FighterSprite.ts" />
/// <reference path="../stage/sprites/pc/ThiefSprite.ts" />
/// <reference path="../stage/sprites/pc/BardSprite.ts" />
// tslint:disable-next-line: typedef
var PlayerJobs = new (/** @class */ (function () {
    function class_15() {
        this.Engineer = { index: 0, name: "Engineer", spriteClass: EngineerSprite, attack: 2, defense: 3, speed: 2, build: 4 };
        this.Fighter = { index: 1, name: "Fighter", spriteClass: FighterSprite, attack: 4, defense: 4, speed: 1, build: 1 };
        this.Thief = { index: 2, name: "Thief", spriteClass: ThiefSprite, attack: 3, defense: 2, speed: 4, build: 1 };
        this.Bard = { index: 3, name: "Bard", spriteClass: BardSprite, attack: 2, defense: 1, speed: 4, build: 2 };
        this.array = [
            this.Engineer,
            this.Fighter,
            this.Thief,
            this.Bard
        ];
    }
    return class_15;
}()))();
/** @file PlayerColors.ts */
// tslint:disable-next-line: typedef
var PlayerColors = new (/** @class */ (function () {
    function class_16() {
        this.Red = { index: 0, name: "Red", main: "#FF0000" };
        this.Blue = { index: 1, name: "Blue", main: "#3300FF" };
        this.Green = { index: 2, name: "Green", main: "#33CC00" };
        this.Yellow = { index: 3, name: "Cyan", main: "#33CCFF" };
        this.array = [
            this.Red,
            this.Blue,
            this.Green,
            this.Yellow
        ];
    }
    return class_16;
}()))();
/** @file PlayerSlot.ts */
/// <reference path="../../model/PlayerJobs.ts" />
/// <reference path="../../model/PlayerColors.ts" />
/*
const enum MinigameStatus
{
    None = 0,
    Logging = 1,
    Building = 2
}
*/
var PlayerSlot = /** @class */ (function () {
    function PlayerSlot(index) {
        this._deviceId = -1;
        this.isReady = false;
        //public minigameStatus:MinigameStatus = MinigameStatus.None;
        this.choppingTree = null;
        this.repairingBuilding = null;
        this.index = index;
        this.color = PlayerColors.array[index];
        this.job = PlayerJobs.array[index];
    }
    Object.defineProperty(PlayerSlot.prototype, "deviceId", {
        get: function () { return this._deviceId; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlayerSlot.prototype, "isPresent", {
        get: function () { return this.deviceId > 0; },
        enumerable: true,
        configurable: true
    });
    PlayerSlot.prototype.join = function (deviceId) {
        this._deviceId = deviceId;
    };
    PlayerSlot.prototype.leave = function () {
        this._deviceId = -1;
        this.isReady = false;
    };
    return PlayerSlot;
}());
/** @file Room.ts */
/// <reference path="PlayerSlot.ts" />
var Room = /** @class */ (function () {
    function Room() {
        this.maxPlayers = 4;
        this.numPlayers = 0;
        this.inProgress = false;
        this.playerSlots = [
            new PlayerSlot(0),
            new PlayerSlot(1),
            new PlayerSlot(2),
            new PlayerSlot(3)
        ];
        this._deviceToPlayerSlot = {};
        this.allReady = false;
    }
    Object.defineProperty(Room.prototype, "isFull", {
        get: function () { return this.inProgress || this.numPlayers >= this.maxPlayers; },
        enumerable: true,
        configurable: true
    });
    Room.prototype.add = function (deviceId) {
        if (this.isPlayer(deviceId))
            return;
        var playerSlot;
        for (var i = 0; i < this.playerSlots.length; ++i) {
            if (!this.playerSlots[i].isPresent) {
                playerSlot = this.playerSlots[i];
                break;
            }
        }
        playerSlot.join(deviceId);
        this.numPlayers++;
        this._deviceToPlayerSlot[deviceId] = playerSlot;
        this.checkAllReady();
    };
    Room.prototype.remove = function (deviceId) {
        if (!this.isPlayer(deviceId))
            return;
        var playerSlot = this._deviceToPlayerSlot[deviceId];
        playerSlot.leave();
        this.numPlayers--;
        delete this._deviceToPlayerSlot[deviceId];
        this.checkAllReady();
        if (this.allReady) {
            DisplayClient.unreadyAllPlayers();
        }
    };
    Room.prototype.isPlayer = function (deviceId) {
        var playerSlot = this._deviceToPlayerSlot[deviceId] || null;
        return playerSlot !== null;
    };
    Room.prototype.getPlayerSlot = function (deviceId) {
        var playerSlot = this._deviceToPlayerSlot[deviceId] || null;
        return playerSlot;
    };
    Room.prototype.setReady = function (deviceId) {
        var playerSlot = this._deviceToPlayerSlot[deviceId] || null;
        if (playerSlot && !playerSlot.isReady) {
            playerSlot.isReady = true;
            this.checkAllReady();
        }
    };
    Room.prototype.setUnready = function (deviceId) {
        var playerSlot = this._deviceToPlayerSlot[deviceId] || null;
        if (playerSlot && playerSlot.isReady) {
            playerSlot.isReady = false;
            this.checkAllReady();
        }
    };
    Room.prototype.checkAllReady = function () {
        var numReadyPlayers = 0;
        for (var _i = 0, _a = this.playerSlots; _i < _a.length; _i++) {
            var playerSlot = _a[_i];
            if (playerSlot.isPresent && playerSlot.isReady) {
                numReadyPlayers++;
            }
        }
        var newAllReady = numReadyPlayers >= this.numPlayers;
        if (newAllReady !== this.allReady) {
            this.allReady = newAllReady;
            if (newAllReady)
                DisplayClient.onPlayersReady.invoke();
            else
                DisplayClient.onPlayersUnready.invoke();
        }
    };
    Room.prototype.startGame = function () {
        this.inProgress = true;
        for (var _i = 0, _a = this.playerSlots; _i < _a.length; _i++) {
            var playerSlot = _a[_i];
            playerSlot.isReady = false;
        }
    };
    return Room;
}());
/** @file DisplayClient.ts */
/// <reference path="../support/ConnectionState.ts" />
/// <reference path="Room.ts" />
var $DisplayClient = /** @class */ (function () {
    function $DisplayClient() {
        this.onConnected = new DelegateEvent();
        this.onPlayersReady = new DelegateEvent();
        this.onPlayersUnready = new DelegateEvent();
        this.onPlayerJoined = new DelegateEvent();
        this.onPlayerLeft = new DelegateEvent();
        this.onPlayerJobChange = new DelegateEvent();
        this.onPlayerReady = new DelegateEvent();
        this.onPlayerNotReady = new DelegateEvent();
        this.onTreeFinished = new DelegateEvent();
        this.onBuildingFinished = new DelegateEvent();
        this._connectionState = "Disconnected" /* Disconnected */;
        this.room = new Room();
        this.ac_onReady = this.ac_onReady.bind(this);
        this.ac_onConnect = this.ac_onConnect.bind(this);
        this.ac_onDeviceStateChange = this.ac_onDeviceStateChange.bind(this);
        this.ac_onDisconnect = this.ac_onDisconnect.bind(this);
        this.ac_onMessage = this.ac_onMessage.bind(this);
    }
    Object.defineProperty($DisplayClient.prototype, "connectionState", {
        get: function () { return this._connectionState; },
        enumerable: true,
        configurable: true
    });
    $DisplayClient.prototype.connect = function () {
        if (this._connectionState === "Connected" /* Connected */)
            throw new Error("Already connected");
        else if (this._connectionState === "Connecting" /* Connecting */)
            return;
        this._connectionState = "Connecting" /* Connecting */;
        if (!this._ac)
            this._ac = new AirConsole({ orientation: AirConsole.ORIENTATION_LANDSCAPE });
        this._ac.onReady = this.ac_onReady;
        this._ac.onConnect = this.ac_onConnect;
        this._ac.onDisconnect = this.ac_onDisconnect;
        this._ac.onDeviceStateChange = this.ac_onDeviceStateChange;
        this._ac.onMessage = this.ac_onMessage;
    };
    $DisplayClient.prototype.unreadyAllPlayers = function () {
        for (var _i = 0, _a = this.room.playerSlots; _i < _a.length; _i++) {
            var playerSlot = _a[_i];
            if (!this.room.inProgress && playerSlot.isPresent && playerSlot.isReady) {
                this.room.setUnready(playerSlot.deviceId);
                this._ac.message(playerSlot.deviceId, { type: "NotReadyApproved" /* NotReadyApproved */ });
                this.onPlayerNotReady.invoke(playerSlot.index);
            }
        }
    };
    $DisplayClient.prototype.startGame = function () {
        if (this.room.allReady) {
            this.room.startGame();
            this._ac.broadcast({ type: "StartGame" /* StartGame */ });
        }
    };
    $DisplayClient.prototype.triggerLoggingMinigame = function (playerIndex, tree) {
        if (TeamTowerDefense.instance.isLocalTest) {
            TeamTowerDefense.instance.screenManager.add(new MinigameLoggingScreen(tree.health));
        }
        else {
            tree.busy = true;
            var playerSlot = this.room.playerSlots[playerIndex];
            //if (playerSlot.minigameStatus === MinigameStatus.None)
            //{
            //playerSlot.minigameStatus = MinigameStatus.Logging;
            playerSlot.choppingTree = tree;
            this._ac.message(playerSlot.deviceId, {
                type: "EnterLoggingMinigame" /* EnterLoggingMinigame */,
                health: tree.health
            });
            //}
        }
    };
    $DisplayClient.prototype.triggerBuildingMinigame = function (playerIndex, tower) {
        if (TeamTowerDefense.instance.isLocalTest) {
            TeamTowerDefense.instance.screenManager.add(new MinigameBuildingScreen(tower.health));
        }
        else {
            tower.busy = true;
            var playerSlot = this.room.playerSlots[playerIndex];
            //if (playerSlot.minigameStatus === MinigameStatus.None)
            //{
            //playerSlot.minigameStatus = MinigameStatus.Building;
            playerSlot.repairingBuilding = tower;
            this._ac.message(playerSlot.deviceId, {
                type: "EnterBuildingMinigame" /* EnterBuildingMinigame */,
                health: tower.health
            });
            //}
        }
    };
    $DisplayClient.prototype.ac_onReady = function (code) {
        //console.log("ready", code);
        this._connectionState = "Connected" /* Connected */;
        this.onConnected.invoke();
    };
    $DisplayClient.prototype.ac_onConnect = function (deviceId) {
        //console.log("onConnect", deviceId);
    };
    $DisplayClient.prototype.ac_onDisconnect = function (deviceId) {
        //console.log("onDisonnect", deviceId);
    };
    $DisplayClient.prototype.ac_onDeviceStateChange = function (deviceId, userData) {
        //console.log("onDeviceStateChange", deviceId, userData);
    };
    $DisplayClient.prototype.ac_onMessage = function (deviceId, data) {
        console.log("onMessage", deviceId, data);
        if (data.type === "IsJoinAvailable" /* IsJoinAvailable */) {
            if (!this.room.isFull)
                this._ac.message(deviceId, { type: "JoinAvailable" /* JoinAvailable */ });
            else
                this._ac.message(deviceId, { type: "JoinUnavailable" /* JoinUnavailable */ });
        }
        else if (data.type === "RequestJoin" /* RequestJoin */) {
            if (!this.room.isFull) {
                // Room isn't full
                this.room.add(deviceId);
                var playerSlot = this.room.getPlayerSlot(deviceId);
                this._ac.message(deviceId, {
                    type: "JoinApproved" /* JoinApproved */,
                    playerIndex: playerSlot.index,
                    jobIndex: playerSlot.job.index
                });
                if (this.room.isFull)
                    this._ac.broadcast({ type: "JoinUnavailable" /* JoinUnavailable */ });
                this.onPlayerJoined.invoke(playerSlot.index);
            }
            else {
                // Room full
                this._ac.message(deviceId, { type: "JoinDenied" /* JoinDenied */ });
            }
        }
        else if (data.type === "RequestLeave" /* RequestLeave */) {
            if (!this.room.isPlayer(deviceId) || !this.room.inProgress) {
                var playerSlot = this.room.getPlayerSlot(deviceId);
                this.room.remove(deviceId);
                this._ac.message(deviceId, { type: "LeaveApproved" /* LeaveApproved */ });
                if (!this.room.isFull)
                    this._ac.broadcast({ type: "JoinAvailable" /* JoinAvailable */ });
                this.onPlayerLeft.invoke(playerSlot.index);
            }
            else {
                this._ac.message(deviceId, { type: "LeaveDenied" /* LeaveDenied */ });
            }
        }
        else if (data.type === "RequestChangeJob" /* RequestChangeJob */) {
            if (this.room.isPlayer(deviceId) && !this.room.inProgress) {
                var playerSlot = this.room.getPlayerSlot(deviceId);
                playerSlot.job = PlayerJobs.array[data.jobIndex];
                this._ac.message(deviceId, { type: "ChangeJobApproved" /* ChangeJobApproved */, jobIndex: data.jobIndex });
                this.onPlayerJobChange.invoke(playerSlot.index, playerSlot.job.index);
            }
        }
        else if (data.type === "Ready" /* Ready */) {
            if (!this.room.inProgress) {
                this.room.setReady(deviceId);
                if (this.room.isPlayer(deviceId)) {
                    this.onPlayerReady.invoke(this.room.getPlayerSlot(deviceId).index);
                }
            }
        }
        else if (data.type === "RequestNotReady" /* RequestNotReady */) {
            if (!this.room.inProgress) {
                this.room.setUnready(deviceId);
                this._ac.message(deviceId, { type: "NotReadyApproved" /* NotReadyApproved */ });
                if (this.room.isPlayer(deviceId)) {
                    this.onPlayerNotReady.invoke(this.room.getPlayerSlot(deviceId).index);
                }
            }
        }
        else if (data.type === "ControlsChanged" /* ControlsChanged */) {
            var playerSlot = this.room.getPlayerSlot(deviceId);
            var pad = ControlPad.array[playerSlot.index];
            pad.update(data.degs, data.move, data.attack, data.interact, data.build);
        }
        else if (data.type === "RequestExitMinigame" /* RequestExitMinigame */) {
            var playerSlot = this.room.getPlayerSlot(deviceId);
            this._ac.message(playerSlot.deviceId, {
                type: "ExitMinigameApproved" /* ExitMinigameApproved */
            });
            //playerSlot.minigameStatus = MinigameStatus.None;
            if (playerSlot.choppingTree)
                playerSlot.choppingTree.busy = false;
            playerSlot.choppingTree = null;
            if (playerSlot.repairingBuilding)
                playerSlot.repairingBuilding.busy = false;
            playerSlot.repairingBuilding = null;
            /*
            let playerSlot:PlayerSlot = this.room.getPlayerSlot(deviceId);
            if (playerSlot.isPresent && playerSlot.minigameStatus !== MinigameStatus.None)
            {
                this._ac.message(playerSlot.deviceId, {
                    type: ClientMessageType.ExitMinigameApproved
                });
                playerSlot.minigameStatus = MinigameStatus.None;
                playerSlot.choppingTree = null;
            }
            else
            {
                this._ac.message(playerSlot.deviceId, {
                    type: ClientMessageType.ExitMinigameDenied
                });
            }
            */
        }
        else if (data.type === "ChoppedLog" /* ChoppedLog */) {
            var playerSlot = this.room.getPlayerSlot(deviceId);
            if (playerSlot.isPresent /*&& playerSlot.minigameStatus === MinigameStatus.Logging*/ && playerSlot.choppingTree) {
                // Change the health
                playerSlot.choppingTree.health -= playerSlot.job.build * 2; // 10 swipes for an engineer with a 5pt build rating
                if (playerSlot.choppingTree.health < 0)
                    playerSlot.choppingTree.health = 0;
                for (var _i = 0, _a = this.room.playerSlots; _i < _a.length; _i++) {
                    var slot = _a[_i];
                    if (slot.isPresent && /*slot.minigameStatus === MinigameStatus.Logging */ slot.choppingTree === playerSlot.choppingTree) {
                        this._ac.message(slot.deviceId, {
                            type: "TreeHealthChange" /* TreeHealthChange */,
                            health: playerSlot.choppingTree.health
                        });
                    }
                }
                // check if finished
                if (playerSlot.choppingTree.health <= 0) {
                    var choppingTree = playerSlot.choppingTree;
                    for (var _b = 0, _c = this.room.playerSlots; _b < _c.length; _b++) {
                        var slot = _c[_b];
                        if (slot.isPresent && /*slot.minigameStatus === MinigameStatus.Logging*/ slot.choppingTree === choppingTree) {
                            this._ac.message(slot.deviceId, {
                                type: "TreeFinished" /* TreeFinished */
                            });
                            //slot.minigameStatus = MinigameStatus.None;
                            slot.choppingTree = null;
                        }
                    }
                    GameState.logs++;
                    this.onTreeFinished.invoke(choppingTree);
                    var tower = new TowerSprite(Map.instance);
                    tower.setPosition(choppingTree.x, choppingTree.y + 20);
                    Map.instance.addTower(tower);
                    new Sound(Assets.sounds.Chopping_Complete).play();
                }
            }
        }
        else if (data.type === "HitNail" /* HitNail */) {
            var playerSlot = this.room.getPlayerSlot(deviceId);
            if (playerSlot.isPresent /*&& playerSlot.minigameStatus === MinigameStatus.Building*/ && playerSlot.repairingBuilding) {
                playerSlot.repairingBuilding.health += playerSlot.job.build * 2; // 10 swipes for an engineer with a 5pt build rating
                if (playerSlot.repairingBuilding.health > 100)
                    playerSlot.repairingBuilding.health = 100;
                for (var _d = 0, _e = this.room.playerSlots; _d < _e.length; _d++) {
                    var slot = _e[_d];
                    if (slot.isPresent && /*slot.minigameStatus === MinigameStatus.Building &&*/ slot.repairingBuilding === playerSlot.repairingBuilding) {
                        this._ac.message(slot.deviceId, {
                            type: "BuildingHealthChange" /* BuildingHealthChange */,
                            health: playerSlot.repairingBuilding.health
                        });
                    }
                }
                if (playerSlot.repairingBuilding.health >= 100) {
                    var repairingBuilding = playerSlot.repairingBuilding;
                    for (var _f = 0, _g = this.room.playerSlots; _f < _g.length; _f++) {
                        var slot = _g[_f];
                        if (slot.isPresent && /*slot.minigameStatus === MinigameStatus.Building &&*/ slot.repairingBuilding === repairingBuilding) {
                            this._ac.message(slot.deviceId, {
                                type: "BuildingFinished" /* BuildingFinished */
                            });
                            //slot.minigameStatus = MinigameStatus.None;
                            slot.repairingBuilding = null;
                        }
                    }
                    //GameState.logs++;
                    repairingBuilding.busy = false;
                    repairingBuilding.notDestroyed();
                    this.onBuildingFinished.invoke(repairingBuilding);
                    new Sound(Assets.sounds.Chopping_Complete).play();
                }
            }
        }
    };
    $DisplayClient.prototype.triggerGameOver = function () {
        if (TeamTowerDefense.instance.isLocalTest)
            return;
        for (var _i = 0, _a = this.room.playerSlots; _i < _a.length; _i++) {
            var playerSlot = _a[_i];
            if (playerSlot.isPresent) {
                this._ac.message(playerSlot.deviceId, {
                    type: "GameOver" /* GameOver */
                });
                playerSlot.choppingTree = null;
                playerSlot.repairingBuilding = null;
                playerSlot.isReady = false;
            }
        }
        this.room.allReady = false;
        this.room.inProgress = false;
    };
    return $DisplayClient;
}());
var DisplayClient = new $DisplayClient();
/** @file ClientMessageType.ts */
/** @file PlayerClient.ts */
/// <reference path="../support/ConnectionState.ts" />
/// <reference path="../support/ClientMessageType.ts" />
var $PlayerClient = /** @class */ (function () {
    function $PlayerClient() {
        this.onConnected = new DelegateEvent();
        this.onJoinAvailable = new DelegateEvent();
        this.onJoinUnavailable = new DelegateEvent();
        this.onJoinApproved = new DelegateEvent();
        this.onJoinDenied = new DelegateEvent();
        this.onLeaveApproved = new DelegateEvent();
        this.onLeaveDenied = new DelegateEvent();
        this.onNotReadyApproved = new DelegateEvent();
        this.onStartGame = new DelegateEvent();
        this.onEnterLoggingMinigame = new DelegateEvent();
        this.onTreeHealthChange = new DelegateEvent();
        this.onTreeFinished = new DelegateEvent();
        this.onExitMinigame = new DelegateEvent();
        this.onEnterBuildingMinigame = new DelegateEvent();
        this.onBuildingHealthChange = new DelegateEvent();
        this.onBuildingFinished = new DelegateEvent();
        this._connectionState = "Disconnected" /* Disconnected */;
        this._requestingIsJoinAvailable = false;
        this._requestingJoin = false;
        this._requestingLeave = false;
        this.playerSlot = null;
        this._requestingExitMinigame = false;
        //private readonly _dir:Vector2 = new Vector2(0, 0);
        this.degs = 0;
        this._dirChanged = false;
        this._lastDirUpdate = 0;
        this._minDirUpdateTime = 1000 / 12;
        this._attack = false;
        this._interact = false;
        this._build = false;
        this._move = false;
        // HACKS
        this._treeHealth = 100;
        this._buildingHealth = 0;
        this.ac_onReady = this.ac_onReady.bind(this);
        this.ac_onConnect = this.ac_onConnect.bind(this);
        this.ac_onDeviceStateChange = this.ac_onDeviceStateChange.bind(this);
        this.ac_onDisconnect = this.ac_onDisconnect.bind(this);
        this.ac_onMessage = this.ac_onMessage.bind(this);
    }
    Object.defineProperty($PlayerClient.prototype, "connectionState", {
        get: function () { return this._connectionState; },
        enumerable: true,
        configurable: true
    });
    $PlayerClient.prototype.connect = function () {
        if (this._connectionState === "Connected" /* Connected */)
            throw new Error("Already connected");
        else if (this._connectionState === "Connecting" /* Connecting */)
            return;
        this._connectionState = "Connecting" /* Connecting */;
        if (!this._ac)
            this._ac = new AirConsole({ orientation: AirConsole.ORIENTATION_LANDSCAPE });
        this._ac.onReady = this.ac_onReady;
        this._ac.onConnect = this.ac_onConnect;
        this._ac.onDisconnect = this.ac_onDisconnect;
        this._ac.onDeviceStateChange = this.ac_onDeviceStateChange;
        this._ac.onMessage = this.ac_onMessage;
    };
    $PlayerClient.prototype.isJoinAvailable = function () {
        if (this._requestingIsJoinAvailable)
            return;
        this._requestingIsJoinAvailable = true;
        this._ac.message(AirConsole.SCREEN, { type: "IsJoinAvailable" /* IsJoinAvailable */ });
    };
    $PlayerClient.prototype.requestJoin = function () {
        if (this._requestingJoin)
            return;
        this._requestingJoin = true;
        this._ac.message(AirConsole.SCREEN, { type: "RequestJoin" /* RequestJoin */ });
    };
    $PlayerClient.prototype.requestLeave = function () {
        if (this._requestingLeave)
            return;
        this._requestingLeave = true;
        this._ac.message(AirConsole.SCREEN, { type: "RequestLeave" /* RequestLeave */ });
    };
    $PlayerClient.prototype.changeJob = function (job) {
        this._ac.message(AirConsole.SCREEN, { type: "RequestChangeJob" /* RequestChangeJob */, jobIndex: job.index });
    };
    $PlayerClient.prototype.ready = function () {
        this.playerSlot.isReady = true;
        this._ac.message(AirConsole.SCREEN, { type: "Ready" /* Ready */ });
    };
    $PlayerClient.prototype.requestNotReady = function () {
        this._ac.message(AirConsole.SCREEN, { type: "RequestNotReady" /* RequestNotReady */ });
    };
    $PlayerClient.prototype.controlsChanged = function (attack, interact, build, move, force) {
        if (this._attack !== attack || this._interact !== interact || this._build !== build || this._move !== move || force) {
            console.log("sending controls changed");
            this._attack = attack;
            this._interact = interact;
            this._build = build;
            this._move = move;
            this._dirChanged = false;
            if (!move) {
                //this._dir.set(0, 0);
                this.degs = 0;
            }
            this._ac.message(AirConsole.SCREEN, {
                type: "ControlsChanged" /* ControlsChanged */,
                //x: this._dir.x,
                //y: this._dir.y,
                degs: this.degs,
                move: move,
                attack: attack,
                interact: interact,
                build: build
            });
        }
    };
    $PlayerClient.prototype.dirChange = function (degs, move) {
        //if (x !== this._dir.x || y !== this._dir.y)
        if (degs !== this.degs || move !== this._move) {
            this._dirChanged = true;
            //this._dir.set(x, y);
            this.degs = degs;
            this._move = move;
            var now = Date.now();
            if (this._dirChanged && now - this._lastDirUpdate >= this._minDirUpdateTime) {
                this._lastDirUpdate = now;
                this.controlsChanged(this._attack, this._interact, this._build, this._move, true);
            }
        }
    };
    $PlayerClient.prototype.requestExitMinigame = function () {
        if (TeamTowerDefense.instance.isLocalTest) {
            this.onExitMinigame.invoke();
        }
        else {
            if (this._requestingExitMinigame) {
                return;
            }
            this._requestingExitMinigame = true;
            this._ac.message(AirConsole.SCREEN, {
                type: "RequestExitMinigame" /* RequestExitMinigame */
            });
        }
    };
    $PlayerClient.prototype.update = function () {
        var now = Date.now();
        if (this._dirChanged && now - this._lastDirUpdate >= this._minDirUpdateTime) {
            this._lastDirUpdate = now;
            this.controlsChanged(this._attack, this._interact, this._build, this._move, true);
        }
    };
    $PlayerClient.prototype.choppedLog = function () {
        if (TeamTowerDefense.instance.isLocalTest) {
            this._treeHealth -= 10;
            if (this._treeHealth < 0)
                this._treeHealth = 0;
            this.onTreeHealthChange.invoke(this._treeHealth);
            if (this._treeHealth <= 0) {
                this.onTreeFinished.invoke();
            }
        }
        else {
            this._ac.message(AirConsole.SCREEN, {
                type: "ChoppedLog" /* ChoppedLog */
            });
        }
    };
    $PlayerClient.prototype.hitNail = function () {
        if (TeamTowerDefense.instance.isLocalTest) {
            this._buildingHealth += 100;
            if (this._buildingHealth > 100)
                this._buildingHealth = 100;
            this.onBuildingHealthChange.invoke(this._buildingHealth);
            if (this._buildingHealth >= 100) {
                this.onBuildingFinished.invoke();
            }
        }
        else {
            this._ac.message(AirConsole.SCREEN, {
                type: "HitNail" /* HitNail */
            });
        }
    };
    $PlayerClient.prototype.ac_onReady = function (code) {
    };
    $PlayerClient.prototype.ac_onConnect = function (deviceId) {
        if (deviceId === 0) {
            // There seems to be a bug where you can't immediately send a request to the screen (sometimes), so add a small delay
            this._connectionState = "Connected" /* Connected */;
            setTimeout(function () {
                PlayerClient.onConnected.invoke();
            }, 100);
        }
    };
    $PlayerClient.prototype.ac_onDisconnect = function (deviceId) {
        //console.log("client " + this._ac.getDeviceId() + " onDisonnect", deviceId);
    };
    $PlayerClient.prototype.ac_onDeviceStateChange = function (deviceId, userData) {
        //console.log("client " + this._ac.getDeviceId() + " onDeviceStateChange", deviceId, userData);
    };
    $PlayerClient.prototype.ac_onMessage = function (deviceId, data) {
        if (deviceId !== AirConsole.SCREEN)
            return;
        console.log("client " + this._ac.getDeviceId() + " onMessage", deviceId, data);
        if (data.type === "JoinAvailable" /* JoinAvailable */) {
            this._requestingIsJoinAvailable = false;
            this.onJoinAvailable.invoke();
        }
        else if (data.type === "JoinUnavailable" /* JoinUnavailable */) {
            this._requestingIsJoinAvailable = false;
            this.onJoinUnavailable.invoke();
        }
        else if (data.type === "JoinApproved" /* JoinApproved */) {
            this._requestingJoin = false;
            this.playerSlot = new PlayerSlot(data.playerIndex);
            this.playerSlot.join(this._ac.getDeviceId());
            this.playerSlot.job = PlayerJobs.array[data.jobIndex];
            this.playerSlot.color = PlayerColors.array[data.playerIndex];
            this.onJoinApproved.invoke();
        }
        else if (data.type === "JoinDenied" /* JoinDenied */) {
            this._requestingJoin = false;
            this.onJoinDenied.invoke();
        }
        else if (data.type === "LeaveApproved" /* LeaveApproved */) {
            this._requestingLeave = false;
            this.playerSlot.leave();
            this.playerSlot = null;
            this.onLeaveApproved.invoke();
        }
        else if (data.type === "LeaveDenied" /* LeaveDenied */) {
            this._requestingLeave = false;
            this.onLeaveDenied.invoke();
        }
        else if (data.type === "ChangeJobApproved" /* ChangeJobApproved */) {
            this.playerSlot.job = PlayerJobs.array[data.jobIndex];
        }
        else if (data.type === "NotReadyApproved" /* NotReadyApproved */) {
            this.playerSlot.isReady = false;
            this.onNotReadyApproved.invoke();
        }
        else if (data.type === "StartGame" /* StartGame */) {
            this.onStartGame.invoke();
        }
        else if (data.type === "EnterLoggingMinigame" /* EnterLoggingMinigame */) {
            this.onEnterLoggingMinigame.invoke(data.health);
        }
        else if (data.type === "TreeHealthChange" /* TreeHealthChange */) {
            this.onTreeHealthChange.invoke(data.health);
        }
        else if (data.type === "TreeFinished" /* TreeFinished */) {
            this.onTreeFinished.invoke();
        }
        else if (data.type === "EnterBuildingMinigame" /* EnterBuildingMinigame */) {
            this.onEnterBuildingMinigame.invoke(data.health);
        }
        else if (data.type === "BuildingHealthChange" /* BuildingHealthChange */) {
            this.onBuildingHealthChange.invoke(data.health);
        }
        else if (data.type === "BuildingFinished" /* BuildingFinished */) {
            this.onBuildingFinished.invoke();
        }
        else if (data.type === "ExitMinigameApproved" /* ExitMinigameApproved */) {
            this._requestingExitMinigame = false;
            this.onExitMinigame.invoke();
        }
        else if (data.type === "ExitMinigameDenied" /* ExitMinigameDenied */) {
            this._requestingExitMinigame = false;
        }
        else if (data.type === "GameOver" /* GameOver */) {
            //this.onGameOver.invoke();
            TeamTowerDefense.instance.screenManager.removeAll();
            TeamTowerDefense.instance.screenManager.add(new PlayerSelectScreen());
            TeamTowerDefense.instance.screenManager.add(new GameOverScreen());
        }
        else {
            // tslint:disable-next-line: no-console
            console.log("OTHER");
        }
    };
    return $PlayerClient;
}());
var PlayerClient = new $PlayerClient();
/** @file MinigameLoggingScreen.ts */
var MinigameLoggingSwipe = /** @class */ (function (_super) {
    __extends(MinigameLoggingSwipe, _super);
    function MinigameLoggingSwipe(screen) {
        var _this = _super.call(this) || this;
        _this.isFinished = false;
        _this.isDead = false;
        _this.isSuccess = false;
        _this._tween = new Interpolator(1, 0, 150, 0);
        _this.normalStroke = new StrokeSettings("#CCCCCC", 3);
        _this.successStroke = new StrokeSettings("#FFFFFF", 6);
        _this.failedStroke = new StrokeSettings("#FF0000", 3);
        _this.start = new Vector2();
        _this.end = new Vector2();
        _this.screen = screen;
        return _this;
    }
    MinigameLoggingSwipe.prototype.update = function (elapsed) {
        if (this.isFinished) {
            this.alpha = this._tween.update(elapsed);
            if (this._tween.isFinished)
                this.isFinished = true;
        }
    };
    MinigameLoggingSwipe.prototype.render = function (ctx, matrix, alpha) {
        if (this.isSuccess) {
            ctx.drawLine(matrix, alpha, this.start.x, this.start.y, this.end.x, this.end.y, this.successStroke);
        }
        else if (this.isFinished) {
            ctx.drawLine(matrix, alpha, this.start.x, this.start.y, this.end.x, this.end.y, this.failedStroke);
        }
        else {
            ctx.drawLine(matrix, alpha, this.start.x, this.start.y, this.end.x, this.end.y, this.normalStroke);
        }
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return MinigameLoggingSwipe;
}(Sprite));
var MinigameLoggingFillBar = /** @class */ (function (_super) {
    __extends(MinigameLoggingFillBar, _super);
    function MinigameLoggingFillBar() {
        var _this = _super.call(this) || this;
        _this.health = 100;
        _this.fill = new FillSettings("#00FF00");
        return _this;
    }
    MinigameLoggingFillBar.prototype.render = function (ctx, matrix, alpha) {
        ctx.drawRect(matrix, alpha, 0, Stage.height * 0.975, Stage.width * (100 - this.health) / 100, Stage.height, this.fill);
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return MinigameLoggingFillBar;
}(Sprite));
var MinigameLoggingScreen = /** @class */ (function (_super) {
    __extends(MinigameLoggingScreen, _super);
    // TODO:
    // particle effect on chop
    // if player dies while in minigame, the minigame quits
    // show hit overlay if player gets hit while in minigame
    // player can quit minigame
    // display a fill bar
    function MinigameLoggingScreen(health) {
        var _this = _super.call(this) || this;
        _this.logBmp = new Bitmap(Assets.images.log);
        _this.backBtn = new Button();
        _this.backBtnBitmap = new Bitmap(Assets.images.back_button);
        _this.fillBar = new MinigameLoggingFillBar();
        _this.hitRect = new Rectangle();
        _this.isPressed = false;
        _this._crossed = false;
        _this._downLoc = new Vector2();
        _this._curLoc = new Vector2();
        _this._swipe = null;
        _this._swipes = [];
        _this.isReverse = false;
        _this._forceKillDelay = -1;
        _this.sounds = [
            new Sound(Assets.sounds.Log_Chopping_1),
            new Sound(Assets.sounds.Log_Chopping_2),
            new Sound(Assets.sounds.Log_Chopping_3)
        ];
        _this.soundIndex = 0;
        _this.fillBar.health = health;
        return _this;
    }
    MinigameLoggingScreen.prototype.initialize = function () {
        this.logBmp.regX = this.logBmp.texture.width / 2;
        this.logBmp.regY = this.logBmp.texture.height / 2;
        this.display.addChild(this.logBmp);
        this.display.addChild(this.fillBar);
        this.backBtn.addChild(this.backBtnBitmap);
        this.display.addChild(this.backBtn);
        this.backBtn.x = this.backBtn.y = 20;
        this.backBtn.input.hitArea = new Circle(0, 0, Math.max(this.backBtnBitmap.texture.width, this.backBtnBitmap.texture.height));
        this.display.input = new DisplayInputComponent(this.display, true, false, this.hitRect);
        this.display.input.onPointerPress.add(this.display_onPress, this);
        this.display.input.onPointerRelease.add(this.display_onRelease, this);
        this.display.input.onPointerCancel.add(this.display_onRelease, this);
        this.display.input.onPointerOut.add(this.display_onRelease, this);
        PlayerClient.onTreeHealthChange.add(this.PlayerClient_onTreeHealthChange, this);
        PlayerClient.onTreeFinished.add(this.PlayerClient_onTreeFinished, this);
        PlayerClient.onExitMinigame.add(this.PlayerClient_onExitMinigame, this);
        this.backBtn.input.onPointerClick.add(this.backBtn_onPress, this);
        this.anchor();
        navigator.vibrate([500, 50, 100, 50, 50]);
        _super.prototype.initialize.call(this);
    };
    MinigameLoggingScreen.prototype.removed = function () {
        PlayerClient.onTreeHealthChange.remove(this.PlayerClient_onTreeHealthChange, this);
        PlayerClient.onTreeFinished.remove(this.PlayerClient_onTreeFinished, this);
        PlayerClient.onExitMinigame.remove(this.PlayerClient_onExitMinigame, this);
    };
    MinigameLoggingScreen.prototype.backBtn_onPress = function () {
        PlayerClient.requestExitMinigame();
    };
    MinigameLoggingScreen.prototype.PlayerClient_onTreeHealthChange = function (health) {
        this.fillBar.health = health;
    };
    MinigameLoggingScreen.prototype.PlayerClient_onTreeFinished = function () {
        this.exit();
    };
    MinigameLoggingScreen.prototype.PlayerClient_onExitMinigame = function () {
        this.exit();
    };
    MinigameLoggingScreen.prototype.display_onPress = function () {
        this._crossed = false;
        var xNow = PointerInput.primary.x / Stage.scale;
        var yNow = PointerInput.primary.y / Stage.scale;
        this.isPressed = true;
        this._downLoc.set(xNow, yNow);
        this._swipe = new MinigameLoggingSwipe(this);
        this.display.addChild(this._swipe);
        this._swipe.start.set(xNow, yNow);
        this._swipe.end.set(xNow, yNow);
        this._swipes.push(this._swipe);
        this._forceKillDelay = -1;
        if (xNow < Stage.width / 2) {
            this.isReverse = false;
        }
        else {
            this.isReverse = true;
        }
    };
    MinigameLoggingScreen.prototype.display_onRelease = function () {
        if (this.isPressed) {
            var xNow = PointerInput.primary.x / Stage.scale;
            var yNow = PointerInput.primary.y / Stage.scale;
            this._swipe.end.set(xNow, yNow);
            this._swipe.isFinished = true;
            this.isPressed = false;
            if ((this.isReverse === false && xNow > Stage.width / 2) || (this.isReverse && xNow < Stage.width / 2)) {
                // chopped
            }
            else {
                // Play failed sound effect
                // show missed?
            }
        }
    };
    MinigameLoggingScreen.prototype.anchor = function () {
        this.hitRect.set(0, 0, Stage.width, Stage.height);
        this.logBmp.x = Stage.width / 2;
        this.logBmp.y = Stage.height / 2;
        this.logBmp.scaleX = this.logBmp.scaleY = Stage.height * 0.8 / this.logBmp.texture.height;
    };
    MinigameLoggingScreen.prototype.update = function (elapsed) {
        for (var i = 0; i < this._swipes.length; ++i) {
            this._swipes[i].update(elapsed);
            if (this._swipes[i].isDead) {
                this._swipes.splice(i, 1);
                i--;
            }
        }
        if (this.isPressed) {
            var prevX = this._curLoc.x;
            var prevY = this._curLoc.y;
            var xNow = PointerInput.primary.x / Stage.scale;
            var yNow = PointerInput.primary.y / Stage.scale;
            this._swipe.end.set(xNow, yNow);
            this._curLoc.set(xNow, yNow);
            if (!this._crossed) {
                if ((this.isReverse === false && xNow > Stage.width / 2) || (this.isReverse && xNow < Stage.width / 2)) {
                    PlayerClient.choppedLog();
                    this._crossed = true;
                    this._swipe.isSuccess = true;
                    // Play chop sound
                    // Particle effect
                    this._forceKillDelay = 100;
                    if (navigator.vibrate)
                        navigator.vibrate([20]);
                    this.sounds[this.soundIndex].stop();
                    this.sounds[this.soundIndex].play();
                    this.soundIndex++;
                    if (this.soundIndex >= this.sounds.length)
                        this.soundIndex = 0;
                }
            }
            else {
                if ((this.isReverse === false && xNow < Stage.width / 2) || (this.isReverse && xNow > Stage.width / 2)) {
                    this.display_onRelease();
                    this._swipe.end.set(prevX, prevY);
                    this._curLoc.set(prevX, prevY);
                }
            }
        }
        if (this.isPressed && this._forceKillDelay > 0) {
            this._forceKillDelay -= elapsed;
            if (this._forceKillDelay <= 0) {
                this.display_onRelease();
            }
        }
        _super.prototype.update.call(this, elapsed);
    };
    return MinigameLoggingScreen;
}(GameScreen));
/** @file MinigameBuildingScreen.ts */
var MinigameBuildingFillBar = /** @class */ (function (_super) {
    __extends(MinigameBuildingFillBar, _super);
    function MinigameBuildingFillBar() {
        var _this = _super.call(this) || this;
        _this.health = 0;
        _this.fill = new FillSettings("#00FF00");
        return _this;
    }
    MinigameBuildingFillBar.prototype.render = function (ctx, matrix, alpha) {
        ctx.drawRect(matrix, alpha, 0, Stage.height * 0.975, Stage.width * this.health / 100, Stage.height, this.fill);
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return MinigameBuildingFillBar;
}(Sprite));
var MinigameBuildingBg = /** @class */ (function (_super) {
    __extends(MinigameBuildingBg, _super);
    function MinigameBuildingBg() {
        var _this = _super.call(this) || this;
        _this.fill = new FillSettings("#FFFFFF");
        return _this;
    }
    MinigameBuildingBg.prototype.render = function (ctx, matrix, alpha) {
        ctx.drawRect(matrix, alpha, 0, 0, Stage.width, Stage.height, this.fill);
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return MinigameBuildingBg;
}(Sprite));
var MinigameBuildingNail = /** @class */ (function (_super) {
    __extends(MinigameBuildingNail, _super);
    function MinigameBuildingNail() {
        var _this = _super.call(this, Assets.images.nail_down) || this;
        _this.downTexture = Assets.images.nail_down;
        _this.upTexture = Assets.images.nail_up;
        _this.isUp = false;
        _this.hitArea = new Rectangle(-60 + 70, -92 + 97, 120, 76);
        _this.life = 0;
        _this.regX = _this.texture.width / 2;
        _this.regY = 97;
        _this.input = new DisplayInputComponent(_this, true, false, _this.hitArea);
        return _this;
    }
    MinigameBuildingNail.prototype.up = function (life) {
        this.isUp = true;
        this.texture = this.upTexture;
        this.life = life;
    };
    MinigameBuildingNail.prototype.down = function () {
        this.isUp = false;
        this.texture = this.downTexture;
    };
    return MinigameBuildingNail;
}(Bitmap));
var MinigameBuildingScreen = /** @class */ (function (_super) {
    __extends(MinigameBuildingScreen, _super);
    //private hammerPause:number = 0;
    //private hammerTween:
    function MinigameBuildingScreen(health) {
        var _this = _super.call(this) || this;
        //public hammer:Bitmap = new Bitmap(Assets.images.hammer);
        _this.backBtn = new Button();
        _this.backBtnBitmap = new Bitmap(Assets.images.back_button);
        _this.fillBar = new MinigameBuildingFillBar();
        _this.nails = [];
        _this.bg = new MinigameBuildingBg();
        _this.upNails = [];
        _this.nextDelay = 1500;
        _this.fillBar.health = health;
        return _this;
    }
    MinigameBuildingScreen.prototype.initialize = function () {
        this.display.addChild(this.bg);
        //this.hammer.regX = this.hammer.texture.width / 2;
        //this.hammer.regY = 254;
        //this.display.addChild(this.hammer);
        this.display.addChild(this.fillBar);
        this.backBtn.addChild(this.backBtnBitmap);
        this.display.addChild(this.backBtn);
        this.backBtn.x = this.backBtn.y = 20;
        this.backBtn.input.hitArea = new Circle(0, 0, Math.max(this.backBtnBitmap.texture.width, this.backBtnBitmap.texture.height));
        this.backBtn.input.onPointerClick.add(this.backBtn_onPress, this);
        for (var i = 0; i < 6; i++) {
            var nail = new MinigameBuildingNail();
            this.nails.push(nail);
            this.display.addChild(this.nails[this.nails.length - 1]);
            //nail.input.onPointerPress.add(this.nail_press, this);
        }
        for (var _i = 0, _a = PointerInput.pointers; _i < _a.length; _i++) {
            var pointer = _a[_i];
            pointer.onPress.add(this.pointer_onPress, this);
        }
        //this.nails[0].up(1000);
        //this.nails[this.nails.length - 1].up(1500);
        this.anchor();
        navigator.vibrate([500, 50, 100, 50, 50]);
        PlayerClient.onBuildingHealthChange.add(this.PlayerClient_onBuildingHealthChange, this);
        PlayerClient.onBuildingFinished.add(this.PlayerClient_onBuildingFinished, this);
        PlayerClient.onExitMinigame.add(this.PlayerClient_onExitMinigame, this);
        //PlayerClient.onGameOver.add(this.PlayerClient_onGameOver, this);
        _super.prototype.initialize.call(this);
    };
    MinigameBuildingScreen.prototype.removed = function () {
        PlayerClient.onBuildingHealthChange.remove(this.PlayerClient_onBuildingHealthChange, this);
        PlayerClient.onBuildingFinished.remove(this.PlayerClient_onBuildingFinished, this);
        PlayerClient.onExitMinigame.remove(this.PlayerClient_onExitMinigame, this);
        //PlayerClient.onGameOver.remove(this.PlayerClient_onGameOver, this);
    };
    MinigameBuildingScreen.prototype.pointer_onPress = function (pointer) {
        for (var _i = 0, _a = this.nails; _i < _a.length; _i++) {
            var nail = _a[_i];
            if (nail.isUp) {
                var local = nail.globalToLocal(new Vector2(pointer.x, pointer.y));
                if (nail.hitArea.containsVector(local)) {
                    nail.down();
                    PlayerClient.hitNail();
                    new Sound(Assets.sounds.Repair_Hammer_on_Nail).play();
                    navigator.vibrate([20]);
                }
            }
        }
    };
    MinigameBuildingScreen.prototype.backBtn_onPress = function () {
        PlayerClient.requestExitMinigame();
    };
    MinigameBuildingScreen.prototype.PlayerClient_onBuildingHealthChange = function (health) {
        this.fillBar.health = health;
    };
    MinigameBuildingScreen.prototype.PlayerClient_onBuildingFinished = function () {
        this.exit();
    };
    MinigameBuildingScreen.prototype.PlayerClient_onExitMinigame = function () {
        this.exit();
    };
    MinigameBuildingScreen.prototype.anchor = function () {
        var nailSize = Math.min(Stage.width * 0.15);
        var ttlNailSizeX = nailSize * 3;
        var ttlNailSizeY = nailSize * 2;
        var nailScale = nailSize / 140;
        var ttlPadX = Stage.width - ttlNailSizeX;
        var padX = ttlPadX / 4;
        var ttlPadY = Stage.height - ttlNailSizeY;
        var padY = ttlPadY / 3;
        for (var r = 0; r < 2; ++r) {
            for (var c = 0; c < 3; ++c) {
                var i = r * 3 + c;
                var nail = this.nails[i];
                nail.scaleX = nail.scaleY = nailScale;
                nail.x = Stage.width / 4 * (c + 1);
                nail.y = Stage.height / 3 * (r + 1);
                /*
                nail.x = padX * (c + 1) + nailSize * c;
                nail.y = padY * (r + 1) + nailSize * r;
                nail.scaleX = nail.scaleY = nailScale;
                if (i === 0)
                {
                    console.log(nail.x + nail.regX, nail.y + 97);
                }
                */
            }
        }
        //this.hammer.scaleX = this.hammer.scaleY = nailScale;
    };
    MinigameBuildingScreen.prototype.update = function (elapsed) {
        for (var i = 0; i < this.upNails.length; ++i) {
            var nail = this.upNails[i];
            nail.life -= elapsed;
            if (nail.life <= 0) {
                nail.down();
                this.upNails.splice(i, 1);
                i--;
            }
        }
        if (this.upNails.length === 0) {
            if (this.nextDelay <= 0) {
                this.nextDelay = Math.random() * 900 + 100;
            }
        }
        if (this.nextDelay > 0) {
            this.nextDelay -= elapsed;
            if (this.nextDelay <= 0) {
                var numNails = Math.floor(Math.random() * 2) + 1;
                //numNails = 1;
                while (numNails > 0) {
                    var nail = this.nails[Math.floor(Math.random() * this.nails.length)];
                    nail.up(Math.random() * 750 + 250);
                    this.upNails.push(nail);
                    numNails--;
                }
            }
        }
        this.anchor();
        _super.prototype.update.call(this, elapsed);
    };
    return MinigameBuildingScreen;
}(GameScreen));
/** @file StandardButton.ts */
var StandardButton = /** @class */ (function (_super) {
    __extends(StandardButton, _super);
    function StandardButton(w, h, txt, upFill, downFill, stroke, textSettings, textFill) {
        if (upFill === void 0) { upFill = new FillSettings("#009999"); }
        if (downFill === void 0) { downFill = new FillSettings("#008E8E"); }
        if (stroke === void 0) { stroke = new StrokeSettings("#00A3A3", 24, true); }
        if (textSettings === void 0) { textSettings = new TextSettings(Assets.fonts.OpenSans_Bold, 60, "center" /* Center */, "middle" /* Middle */); }
        if (textFill === void 0) { textFill = new FillSettings("#FFFFFF"); }
        var _this = _super.call(this) || this;
        _this.shadowFill = new FillSettings("#000000");
        _this.shadowAlpha = 0.3;
        _this._mtx = new Matrix2D();
        _this.w = w;
        _this.h = h;
        _this.upFill = upFill;
        _this.downFill = downFill;
        _this.stroke = stroke;
        _this.text = txt;
        _this.textSettings = textSettings;
        _this.textFill = textFill;
        _this.cursor = "pointer" /* Pointer */;
        _this.input.hitArea = new Rectangle(0, 0, _this.w, _this.h);
        return _this;
    }
    StandardButton.prototype.render = function (ctx, matrix, alpha) {
        if (this.isOver && this.isPressed) {
            ctx.drawRoundedRect(this._wvp.copy(matrix).append(1, 0, 0, 1, 0, 30), alpha * this.shadowAlpha, 0, 0, this.w, this.h, 10, 10, 10, 10, this.shadowFill, null, true);
            ctx.drawRoundedRect(this._wvp.copy(matrix).append(1, 0, 0, 1, 0, 10), alpha, 0, 0, this.w, this.h, 10, 10, 10, 10, this.upFill, this.stroke, true);
            ctx.drawText(this._wvp.copy(matrix).append(1, 0, 0, 1, 0, 10), alpha, this.w / 2, this.h / 2, this.text, this.textSettings, this.textFill, null, true);
        }
        else {
            ctx.drawRoundedRect(this._wvp.copy(matrix).append(1, 0, 0, 1, 0, 30), alpha * this.shadowAlpha, 0, 0, this.w, this.h, 10, 10, 10, 10, this.shadowFill, null, true);
            ctx.drawRoundedRect(matrix, alpha, 0, 0, this.w, this.h, 10, 10, 10, 10, this.upFill, this.stroke, true);
            ctx.drawText(matrix, alpha, this.w / 2, this.h / 2, this.text, this.textSettings, this.textFill, null, true);
        }
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return StandardButton;
}(Button));
/** @file Dimmer.ts */
var Dimmer = /** @class */ (function (_super) {
    __extends(Dimmer, _super);
    function Dimmer() {
        var _this = _super.call(this) || this;
        _this.fill = new FillSettings("#000000");
        _this.fillAlpha = 0.3;
        return _this;
    }
    Dimmer.prototype.render = function (ctx, matrix, alpha) {
        ctx.drawRect(matrix, alpha * this.fillAlpha, 0, 0, Stage.width, Stage.height, this.fill);
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return Dimmer;
}(Sprite));
/** @file PlayerStatBar.ts */
var PlayerStatBar = /** @class */ (function (_super) {
    __extends(PlayerStatBar, _super);
    function PlayerStatBar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.count = 4;
        return _this;
    }
    PlayerStatBar.prototype.render = function (ctx, matrix, alpha) {
        for (var i = 0; i < this.count; ++i) {
            ctx.drawRect(matrix, alpha, i * 60, (72 - 40) / 2, 40, 40, new FillSettings("#FFFFFF"));
        }
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return PlayerStatBar;
}(Sprite));
/** @file PlayerSelectEntry.ts */
/// <reference path="../general/PlayerStatBar.ts" />
var PlayerSelectEntry = /** @class */ (function (_super) {
    __extends(PlayerSelectEntry, _super);
    function PlayerSelectEntry(index, job, color) {
        var _this = _super.call(this) || this;
        _this._infoBox = new Sprite();
        _this._nameTextField = new TextField("", new TextSettings(Assets.fonts.OpenSans_Bold, 80, "left" /* Left */, "top" /* Top */), new FillSettings("#FFFFFF"));
        _this._atkBmp = new Bitmap(Assets.images.icon_attack);
        _this._defBmp = new Bitmap(Assets.images.icon_defense);
        _this._spdBmp = new Bitmap(Assets.images.icon_speed);
        _this._bldBmp = new Bitmap(Assets.images.icon_build);
        _this._atkBar = new PlayerStatBar();
        _this._defBar = new PlayerStatBar();
        _this._spdBar = new PlayerStatBar();
        _this._bldBar = new PlayerStatBar();
        _this.index = index;
        _this.job = job;
        _this.color = color;
        _this.bgFill = new FillSettings(_this.color.main);
        _this._playerSprite = new job.spriteClass(_this.color.index, null);
        _this.addChild(_this._playerSprite);
        _this._atkBmp.scaleX = _this._atkBmp.scaleY =
            _this._defBmp.scaleX = _this._defBmp.scaleY =
                _this._spdBmp.scaleX = _this._spdBmp.scaleY =
                    _this._bldBmp.scaleX = _this._bldBmp.scaleY = 0.3;
        _this._nameTextField.text = job.name.toUpperCase();
        _this._infoBox.addChild(_this._nameTextField);
        _this._infoBox.addChild(_this._atkBmp);
        _this._infoBox.addChild(_this._defBmp);
        _this._infoBox.addChild(_this._spdBmp);
        _this._infoBox.addChild(_this._bldBmp);
        _this.addChild(_this._infoBox);
        _this._infoBox.addChild(_this._atkBar);
        _this._infoBox.addChild(_this._defBar);
        _this._infoBox.addChild(_this._spdBar);
        _this._infoBox.addChild(_this._bldBar);
        _this._atkBar.y = _this._atkBmp.y = 128;
        _this._defBar.y = _this._defBmp.y = 128 + 90;
        _this._spdBar.y = _this._spdBmp.y = 128 + 90 * 2;
        _this._bldBar.y = _this._bldBmp.y = 128 + 90 * 3;
        _this._atkBar.x = _this._defBar.x = _this._spdBar.x = _this._bldBar.x = 100;
        _this._atkBar.count = _this.job.attack;
        _this._defBar.count = _this.job.defense;
        _this._spdBar.count = _this.job.speed;
        _this._bldBar.count = _this.job.build;
        return _this;
    }
    PlayerSelectEntry.prototype.anchor = function () {
        this.x = Stage.width * this.index;
        var desSize = 0.42 * Stage.width;
        this._playerSprite.scaleX = this._playerSprite.scaleY = desSize / PlayerSprite.WIDTH;
        this._playerSprite.x = Stage.width / 4;
        this._playerSprite.y = Stage.height / 2 + desSize / 2;
        this._infoBox.x = Stage.width / 2 + 40;
        this._infoBox.y = Stage.height / 2 - 488 / 2;
    };
    PlayerSelectEntry.prototype.render = function (ctx, matrix, alpha) {
        ctx.drawRect(matrix, alpha, 0, 0, Stage.width + 2, Stage.height, new FillSettings("#222222"));
        ctx.drawRect(matrix, alpha, 0, 0, Stage.width + 2, 40, this.bgFill);
        ctx.drawRect(matrix, alpha, 0, Stage.height - 40, Stage.width + 2, 40, this.bgFill);
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return PlayerSelectEntry;
}(Sprite));
/** @file PlayerSelectArrow.ts */
var PlayerSelectArrow = /** @class */ (function (_super) {
    __extends(PlayerSelectArrow, _super);
    function PlayerSelectArrow() {
        var _this = _super.call(this) || this;
        _this.stroke = new StrokeSettings("#FFFFFF", 10);
        _this.shadowStroke = new StrokeSettings("#000000", 10);
        _this.points = [
            new Vector2(-20, -80),
            new Vector2(0, 0),
            new Vector2(-20, 80)
        ];
        _this.input.hitArea = new Rectangle(-30, -80, 60, 160);
        return _this;
    }
    PlayerSelectArrow.prototype.render = function (ctx, matrix, alpha) {
        if (this.isOver && this.isPressed) {
            ctx.drawPath(this._wvp.copy(matrix).appendMatrix(new Matrix2D(1, 0, 0, 1, 20, 10)), alpha * 0.3, this.points, null, this.shadowStroke, false, true);
            ctx.drawPath(this._wvp.copy(matrix).appendMatrix(new Matrix2D(1, 0, 0, 1, 20, 0)), alpha, this.points, null, this.stroke, false, true);
        }
        else {
            ctx.drawPath(this._wvp.copy(matrix).appendMatrix(new Matrix2D(1, 0, 0, 1, 0, 10)), alpha * 0.3, this.points, null, this.shadowStroke, false);
            ctx.drawPath(matrix, alpha, this.points, null, this.stroke, false);
        }
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return PlayerSelectArrow;
}(Button));
/** @file InputControlArea.ts */
var InputControlArea = /** @class */ (function (_super) {
    __extends(InputControlArea, _super);
    function InputControlArea(id, isRotational) {
        if (isRotational === void 0) { isRotational = false; }
        var _this = _super.call(this) || this;
        _this.onPointerPress = new DelegateEvent();
        _this.onPointerRelease = new DelegateEvent();
        _this.upFill = null;
        _this.upFillAlpha = 0;
        _this.upStroke = new StrokeSettings("#FFFFFF", 10);
        _this.upStrokeAlpha = 0.3;
        _this.downFill = null;
        _this.downStroke = new StrokeSettings("#FFFFFF", 10);
        _this.downStrokeAlpha = 0.5;
        _this.downFillAlpha = 0.1;
        _this.relArea = new Rectangle(0, 0, 0.5, 1);
        _this.radius = 20;
        _this.lbl = new TextField("lbl", new TextSettings(Assets.fonts.OpenSans_Bold, 40, "center" /* Center */, "middle" /* Middle */), new FillSettings("#FFFFFF"));
        _this._hitRect = new Rectangle();
        _this._renderRect = new Rectangle();
        _this._downPoint = new Vector2();
        _this._currPoint = new Vector2();
        _this.vec = new Vector2();
        _this.degs = 0;
        _this.enabled = true;
        _this.isPressed = false;
        _this.downPointer = null;
        _this.addChild(_this.lbl);
        _this.lbl.text = id;
        _this.id = id;
        _this.isRotational = isRotational;
        //this.input.hitArea = this._hitRect;
        //this.input.onPointerPress.add(this.input_onPointerPress, this);
        var c = 0;
        for (var _i = 0, _a = PointerInput.pointers; _i < _a.length; _i++) {
            var pointer = _a[_i];
            pointer.onPress.add(_this.pointer_onPress, _this);
            pointer.onRelease.add(_this.pointer_onRelease, _this);
            pointer.onCancel.add(_this.pointer_onRelease, _this);
            c++;
        }
        /*

        The first pointer down on this area is the assigned pointer

        */
        _this.anchor();
        return _this;
    }
    Object.defineProperty(InputControlArea.prototype, "isPressedEnough", {
        get: function () {
            return this.isPressed && this.vec.lengthSquared() > 0;
        },
        enumerable: true,
        configurable: true
    });
    InputControlArea.prototype.reset = function () {
        this._downPoint.set(0, 0);
        this._currPoint.set(0, 0);
        this.vec.set(0, 0);
        this.degs = 0;
        this.isPressed = false;
        this.downPointer = null;
    };
    InputControlArea.prototype.anchor = function () {
        var titleSafeHeight = 44 / Stage.scale * GameWindow.pixelRatio;
        var availHeight = Stage.height - titleSafeHeight;
        this._hitRect.set(this.relArea.x * Stage.width, this.relArea.y * availHeight + titleSafeHeight, this.relArea.width * Stage.width, this.relArea.height * availHeight);
        this._renderRect.set(this.relArea.x * Stage.width + 30, this.relArea.y * availHeight + 30 + titleSafeHeight, this.relArea.width * Stage.width - 60, this.relArea.height * availHeight - 60);
        this.lbl.x = this._hitRect.x + this._hitRect.width / 2;
        this.lbl.y = this._hitRect.y + this._hitRect.height / 2;
    };
    InputControlArea.prototype.input_onPointerPress = function () {
        var xNow = PointerInput.primary.x / Stage.scale;
        var yNow = PointerInput.primary.y / Stage.scale;
        this._downPoint.set(xNow, yNow);
        this._currPoint.set(xNow, yNow);
        this.vec.set(0, 0);
    };
    InputControlArea.prototype.pointer_onPress = function (pointer) {
        if (this.enabled) {
            if (!this.isPressed) {
                var xNow = pointer.x / Stage.scale;
                var yNow = pointer.y / Stage.scale;
                if (this._hitRect.containsVector(new Vector2(xNow, yNow))) {
                    this.downPointer = pointer;
                    this.isPressed = true;
                    this._downPoint.set(xNow, yNow);
                    this._currPoint.set(xNow, yNow);
                    this.vec.set(0, 0);
                    this.onPointerPress.invoke();
                }
            }
        }
    };
    InputControlArea.prototype.pointer_onRelease = function (pointer) {
        if (this.enabled) {
            if (this.isPressed && this.downPointer === pointer) {
                this.isPressed = false;
                this.downPointer = null;
                this.onPointerRelease.invoke();
            }
        }
    };
    InputControlArea.prototype.update = function () {
        if (this.isPressed) {
            //let xNow:number = PointerInput.primary.x / Stage.scale;
            //let yNow:number = PointerInput.primary.y / Stage.scale;
            var xNow = this.downPointer.x / Stage.scale;
            var yNow = this.downPointer.y / Stage.scale;
            this._currPoint.set(xNow, yNow);
            if (this.isRotational) {
                this.vec.set(xNow - this._downPoint.x, yNow - this._downPoint.y);
                if (this.vec.length() > 0.1 * Stage.height) {
                    var rads = Math.atan2(this.vec.y, this.vec.x);
                    var degs = MathUtil.RAD_TO_DEG * rads;
                    degs = Math.round(degs);
                    if (degs % 2 === 1)
                        degs -= 1;
                    //rads = MathUtil.DEG_TO_RAD * degs;
                    this.vec.set(MathUtil.cosDegrees(degs), MathUtil.sinDegrees(degs));
                    this.degs = degs;
                }
                else {
                    this.vec.set(0, 0);
                    this.degs = 0;
                }
            }
        }
        else {
            this.vec.set(0, 0);
            this.degs = 0;
        }
    };
    InputControlArea.prototype.render = function (ctx, matrix, alpha) {
        if (this.isPressed) {
            ctx.drawRoundedRect(matrix, alpha * this.downFillAlpha, this._renderRect.x, this._renderRect.y, this._renderRect.width, this._renderRect.height, this.radius, this.radius, this.radius, this.radius, this.downFill);
            ctx.drawRoundedRect(matrix, alpha * this.downStrokeAlpha, this._renderRect.x, this._renderRect.y, this._renderRect.width, this._renderRect.height, this.radius, this.radius, this.radius, this.radius, null, this.downStroke);
        }
        else {
            ctx.drawRoundedRect(matrix, alpha * this.upFillAlpha, this._renderRect.x, this._renderRect.y, this._renderRect.width, this._renderRect.height, this.radius, this.radius, this.radius, this.radius, this.upFill);
            ctx.drawRoundedRect(matrix, alpha * this.upStrokeAlpha, this._renderRect.x, this._renderRect.y, this._renderRect.width, this._renderRect.height, this.radius, this.radius, this.radius, this.radius, null, this.upStroke);
        }
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return InputControlArea;
}(Sprite));
/** @file WorldControls.ts */
/// <reference path="InputControlArea.ts" />
var WorldControls = /** @class */ (function (_super) {
    __extends(WorldControls, _super);
    function WorldControls() {
        var _this = _super.call(this) || this;
        _this.movementArea = new InputControlArea("MOVE", true);
        _this.addChild(_this.movementArea);
        _this.aArea = new InputControlArea("ATTACK");
        _this.aArea.relArea.set(0.5, 0, 0.25, 1);
        _this.addChild(_this.aArea);
        _this.bArea = new InputControlArea("LOG / REPAIR");
        _this.bArea.relArea.set(0.75, 0, 0.25, 1);
        _this.addChild(_this.bArea);
        _this.cArea = new InputControlArea("build");
        _this.cArea.relArea.set(-10.0, -10.0, 0.0, 0.0);
        //this.addChild(this.cArea);
        /*
        this.aArea.input.onPointerPress.add(this.btnChanged, this);
        this.bArea.input.onPointerPress.add(this.btnChanged, this);
        this.cArea.input.onPointerPress.add(this.btnChanged, this);
        this.movementArea.input.onPointerPress.add(this.btnChanged, this);
        this.aArea.input.onPointerRelease.add(this.btnChanged, this);
        this.bArea.input.onPointerRelease.add(this.btnChanged, this);
        this.cArea.input.onPointerRelease.add(this.btnChanged, this);
        this.movementArea.input.onPointerRelease.add(this.btnChanged, this);
        this.aArea.input.onPointerCancel.add(this.btnChanged, this);
        this.bArea.input.onPointerCancel.add(this.btnChanged, this);
        this.cArea.input.onPointerCancel.add(this.btnChanged, this);
        this.movementArea.input.onPointerCancel.add(this.btnChanged, this);
        */
        _this.aArea.onPointerPress.add(_this.btnChanged, _this);
        _this.bArea.onPointerPress.add(_this.btnChanged, _this);
        _this.cArea.onPointerPress.add(_this.btnChanged, _this);
        _this.movementArea.onPointerPress.add(_this.btnChanged, _this);
        _this.aArea.onPointerRelease.add(_this.btnChanged, _this);
        _this.bArea.onPointerRelease.add(_this.btnChanged, _this);
        //this.cArea.onPointerRelease.add(this.btnChanged, this);
        _this.movementArea.onPointerRelease.add(_this.btnChanged, _this);
        return _this;
    }
    WorldControls.prototype.btnChanged = function () {
        PlayerClient.controlsChanged(this.aArea.isPressed, this.bArea.isPressed, false, //this.cArea.isPressed,
        this.movementArea.isPressedEnough);
    };
    WorldControls.prototype.update = function (elapsed) {
        var lastX = this.movementArea.vec.x;
        var lastY = this.movementArea.vec.y;
        this.movementArea.update();
        if (lastX !== this.movementArea.vec.x || lastY !== this.movementArea.vec.y) {
            //PlayerClient.dirChange(this.movementArea.vec.x, this.movementArea.vec.y);
            PlayerClient.dirChange(this.movementArea.degs, this.movementArea.isPressedEnough);
        }
    };
    WorldControls.prototype.reset = function () {
        this.movementArea.reset();
        this.aArea.reset();
        this.bArea.reset();
        this.cArea.reset();
        this.btnChanged();
        PlayerClient.dirChange(0, false);
    };
    WorldControls.prototype.disable = function () {
        this.movementArea.enabled = false;
        this.aArea.enabled = false;
        this.bArea.enabled = false;
        this.cArea.enabled = false;
    };
    WorldControls.prototype.enable = function () {
        this.movementArea.enabled = true;
        this.aArea.enabled = true;
        this.bArea.enabled = true;
        this.cArea.enabled = true;
    };
    WorldControls.prototype.anchor = function () {
        this.movementArea.anchor();
        this.aArea.anchor();
        this.bArea.anchor();
        this.cArea.anchor();
    };
    return WorldControls;
}(Sprite));
/** @file PlayerGameplayScreen.ts */
/// <reference path="../stage/controls/WorldControls.ts" />
var PlayerGameplayScreen = /** @class */ (function (_super) {
    __extends(PlayerGameplayScreen, _super);
    function PlayerGameplayScreen() {
        return _super.call(this) || this;
    }
    PlayerGameplayScreen.prototype.initialize = function () {
        this.worldControls = new WorldControls();
        this.display.addChild(this.worldControls);
        PlayerClient.onEnterLoggingMinigame.add(this.PlayerClient_onEnterLoggingMinigame, this);
        PlayerClient.onEnterBuildingMinigame.add(this.PlayerClient_onEnterBuildingMinigame, this);
        this.anchor();
        _super.prototype.initialize.call(this);
    };
    PlayerGameplayScreen.prototype.removed = function () {
        PlayerClient.onEnterLoggingMinigame.remove(this.PlayerClient_onEnterLoggingMinigame, this);
        PlayerClient.onEnterBuildingMinigame.remove(this.PlayerClient_onEnterBuildingMinigame, this);
        _super.prototype.removed.call(this);
    };
    PlayerGameplayScreen.prototype.PlayerClient_onEnterLoggingMinigame = function (health) {
        this.screenManager.add(new MinigameLoggingScreen(health));
    };
    PlayerGameplayScreen.prototype.PlayerClient_onEnterBuildingMinigame = function (health) {
        this.screenManager.add(new MinigameBuildingScreen(health));
    };
    PlayerGameplayScreen.prototype.loseFocus = function () {
        this.worldControls.reset();
        this.worldControls.disable();
        _super.prototype.loseFocus.call(this);
    };
    PlayerGameplayScreen.prototype.gainFocus = function () {
        this.worldControls.reset();
        this.worldControls.enable();
        _super.prototype.gainFocus.call(this);
    };
    PlayerGameplayScreen.prototype.anchor = function () {
        this.worldControls.anchor();
    };
    PlayerGameplayScreen.prototype.update = function (elapsed) {
        this.worldControls.update(elapsed);
        this.anchor();
    };
    return PlayerGameplayScreen;
}(GameScreen));
/** @file PlayerSelectScreen.ts */
/// <reference path="../stage/general/StandardButton.ts" />
/// <reference path="../stage/general/Dimmer.ts" />
/// <reference path="../stage/playerSelect/PlayerSelectEntry.ts" />
/// <reference path="../stage/playerSelect/PlayerSelectArrow.ts" />
/// <reference path="PlayerGameplayScreen.ts" />
var PlayerSelectScreen = /** @class */ (function (_super) {
    __extends(PlayerSelectScreen, _super);
    function PlayerSelectScreen() {
        var _this = _super.call(this) || this;
        _this._hitSprite = new Sprite();
        _this._tray = new Sprite();
        _this._entries = [];
        _this._leftArrow = new PlayerSelectArrow();
        _this._rightArrow = new PlayerSelectArrow();
        _this._readyButton = new StandardButton(880, 120, "Ready!");
        _this._notReadyButton = new StandardButton(880, 120, "Not Ready...");
        _this._readyDimmer = new Dimmer();
        _this._isPressed = false;
        _this._isBlocked = false;
        _this._currX = 0;
        _this._totalMovementX = 0;
        _this._dragging = false;
        _this._startDragTrayPos = 0;
        _this._posTween = null;
        _this._hitRect = new Rectangle();
        return _this;
    }
    PlayerSelectScreen.prototype.initialize = function () {
        this._activeIndex = PlayerClient.playerSlot.job.index;
        this._hitSprite.input = new DisplayInputComponent(this._hitSprite, true, false, this._hitRect);
        this.display.addChild(this._hitSprite);
        var color = PlayerClient.playerSlot.color;
        for (var i = 0; i < PlayerJobs.array.length; ++i) {
            var entry = new PlayerSelectEntry(i, PlayerJobs.array[i], color);
            this._entries.push(entry);
            this._tray.addChild(entry);
        }
        this.display.addChild(this._tray);
        this._leftArrow.scaleX = -1;
        this._leftArrow.visible = this._activeIndex !== 0;
        this.display.addChild(this._leftArrow);
        this._rightArrow.visible = this._activeIndex !== this._entries.length - 1;
        this.display.addChild(this._rightArrow);
        this.display.addChild(this._readyButton);
        this._leaveButton = new StandardButton(240, 120, "Back");
        this._leaveButton.x = 40;
        this._leaveButton.y = 40;
        this.display.addChild(this._leaveButton);
        this._readyDimmer.visible = false;
        this.display.addChild(this._readyDimmer);
        this.display.addChild(this._notReadyButton);
        this._notReadyButton.visible = false;
        this._notReadyButton.upFill.style = "#990000";
        this._notReadyButton.downFill.style = "#8E0000";
        this._notReadyButton.stroke.style = "#A30000";
        this._hitSprite.input.onPointerPress.add(this.hitSprite_onPress, this);
        PointerInput.primary.onMove.add(this.pointer_onMove, this);
        PointerInput.primary.onCancel.add(this.pointer_onRelease, this);
        PointerInput.primary.onRelease.add(this.pointer_onRelease, this);
        this._leftArrow.input.onPointerClick.add(this.leftArrow_onClick, this);
        this._rightArrow.input.onPointerClick.add(this.rightArrow_onClick, this);
        this._readyButton.input.onPointerClick.add(this.readyButton_onClick, this);
        this._notReadyButton.input.onPointerClick.add(this.notReadyButton_onClick, this);
        this._leaveButton.input.onPointerClick.add(this.leaveButton_onClick, this);
        PlayerClient.onLeaveApproved.add(this.PlayerClient_onLeaveApproved, this);
        PlayerClient.onLeaveDenied.add(this.PlayerClient_onLeaveDenied, this);
        PlayerClient.onNotReadyApproved.add(this.PlayerClient_onNotReadyApproved, this);
        PlayerClient.onStartGame.add(this.PlayerClient_onStartGame, this);
        this._trayPos = (this._activeIndex / PlayerJobs.array.length) + (1 / 4 * 0.25);
        this.anchor();
        this.snap(1.5);
        _super.prototype.initialize.call(this);
    };
    PlayerSelectScreen.prototype.snap = function (timeScale) {
        if (timeScale === void 0) { timeScale = 1; }
        if (PlayerClient.playerSlot.job.index !== this._activeIndex) {
            PlayerClient.changeJob(this._entries[this._activeIndex].job);
        }
        this._isPressed = false;
        this._leftArrow.visible = this._activeIndex !== 0;
        this._rightArrow.visible = this._activeIndex !== this._entries.length - 1;
        this._posTween = new Interpolator(this._trayPos, this._activeIndex / this._entries.length, 400 * timeScale, 0, Easing.Overshoot.medEaseOut);
    };
    PlayerSelectScreen.prototype.PlayerClient_onStartGame = function () {
        PointerInput.primary.onMove.remove(this.pointer_onMove, this);
        PointerInput.primary.onCancel.remove(this.pointer_onRelease, this);
        PointerInput.primary.onRelease.remove(this.pointer_onRelease, this);
        PlayerClient.onLeaveApproved.remove(this.PlayerClient_onLeaveApproved, this);
        PlayerClient.onLeaveDenied.remove(this.PlayerClient_onLeaveDenied, this);
        PlayerClient.onNotReadyApproved.remove(this.PlayerClient_onNotReadyApproved, this);
        PlayerClient.onStartGame.remove(this.PlayerClient_onStartGame, this);
        this.screenManager.add(new PlayerGameplayScreen());
        this.exit();
    };
    PlayerSelectScreen.prototype.leaveButton_onClick = function () {
        this.inputEnabled = false;
        PlayerClient.requestLeave();
    };
    PlayerSelectScreen.prototype.PlayerClient_onLeaveApproved = function () {
        PointerInput.primary.onMove.remove(this.pointer_onMove, this);
        PointerInput.primary.onCancel.remove(this.pointer_onRelease, this);
        PointerInput.primary.onRelease.remove(this.pointer_onRelease, this);
        PlayerClient.onLeaveApproved.remove(this.PlayerClient_onLeaveApproved, this);
        PlayerClient.onLeaveDenied.remove(this.PlayerClient_onLeaveDenied, this);
        PlayerClient.onNotReadyApproved.remove(this.PlayerClient_onNotReadyApproved, this);
        PlayerClient.onStartGame.remove(this.PlayerClient_onStartGame, this);
        this.screenManager.add(new TitleScreen(TeamTowerDefense.instance.isPlayerClient, TeamTowerDefense.instance.isLocalTest));
        this.exit();
    };
    PlayerSelectScreen.prototype.PlayerClient_onLeaveDenied = function () {
        this.inputEnabled = true;
    };
    PlayerSelectScreen.prototype.notReadyButton_onClick = function () {
        PlayerClient.requestNotReady();
    };
    PlayerSelectScreen.prototype.PlayerClient_onNotReadyApproved = function () {
        this._isBlocked = false;
        this._readyButton.visible = true;
        this._leftArrow.visible = this._activeIndex > 0;
        this._rightArrow.visible = this._activeIndex < this._entries.length - 1;
        this._readyDimmer.visible = false;
        this._notReadyButton.visible = false;
        this._leaveButton.visible = true;
    };
    PlayerSelectScreen.prototype.readyButton_onClick = function () {
        this._isBlocked = true;
        this._readyButton.visible = false;
        this._leftArrow.visible = false;
        this._rightArrow.visible = false;
        this._readyDimmer.visible = true;
        this._notReadyButton.visible = true;
        this._leaveButton.visible = false;
        PlayerClient.ready();
    };
    PlayerSelectScreen.prototype.leftArrow_onClick = function () {
        if (this._activeIndex > 0) {
            this._activeIndex--;
            this.snap();
        }
    };
    PlayerSelectScreen.prototype.rightArrow_onClick = function () {
        if (this._activeIndex < this._entries.length - 1) {
            this._activeIndex++;
            this.snap();
        }
    };
    PlayerSelectScreen.prototype.hitSprite_onPress = function () {
        if (this._isPressed)
            return;
        if (this._isBlocked)
            return;
        this._isPressed = true;
        this._currX = PointerInput.primary.x / Stage.scale;
        this._totalMovementX = 0;
        this._dragging = false;
    };
    PlayerSelectScreen.prototype.pointer_onMove = function () {
        if (!this._isPressed)
            return;
        var xNow = PointerInput.primary.x / Stage.scale;
        var trayWidth = Stage.width * this._entries.length;
        if (!this._dragging) {
            this._totalMovementX += Math.abs(xNow - this._currX);
            if (this._totalMovementX / Stage.width >= 0.03) {
                this._dragging = true;
                this._startDragTrayPos = this._trayPos;
            }
        }
        var deltaX = xNow - this._currX;
        this._currX = xNow;
        if (this._dragging) {
            var trayX = trayWidth * -this._trayPos;
            trayX += deltaX;
            if (trayX > 30)
                trayX = 30;
            if (trayX < -(trayWidth - Stage.width + 30))
                trayX = -(trayWidth - Stage.width + 30);
            this._trayPos = trayX / (PlayerJobs.array.length * -Stage.width);
            //this._trayPos -= deltaX / (Stage.width);
            var ttlDeltaPos = this._trayPos - this._startDragTrayPos;
            if (Math.abs(ttlDeltaPos) > (1 / 4) * 0.1) {
                if (ttlDeltaPos > 0) {
                    if (this._activeIndex < this._entries.length - 1) {
                        this._activeIndex++;
                        this.snap();
                    }
                }
                else {
                    if (this._activeIndex > 0) {
                        this._activeIndex--;
                        this.snap();
                    }
                }
            }
        }
    };
    PlayerSelectScreen.prototype.pointer_onRelease = function () {
        if (!this._isPressed)
            return;
        this._isPressed = false;
        if (!this._posTween)
            this.snap();
    };
    PlayerSelectScreen.prototype.anchor = function () {
        for (var _i = 0, _a = this._entries; _i < _a.length; _i++) {
            var entry = _a[_i];
            entry.anchor();
        }
        this._hitRect.set(0, 0, Stage.width, Stage.height);
        this._tray.x = (-Stage.width * this._entries.length) * this._trayPos;
        this._leftArrow.x = 30;
        this._rightArrow.x = Stage.width - 30;
        this._leftArrow.y = this._rightArrow.y = Stage.height / 2;
        this._readyButton.x = Stage.width / 2 + 40;
        this._readyButton.y = Stage.height / 2 + 488 / 2 + 40;
        this._notReadyButton.x = Stage.width / 2 + 40;
        this._notReadyButton.y = Stage.height / 2 + 488 / 2 + 40;
    };
    PlayerSelectScreen.prototype.update = function (elapsed) {
        if (this._activeIndex !== 1) {
            this._readyButton.visible = false;
        }
        else {
            this._readyButton.visible = true;
        }
        if (this._posTween && !this._isPressed) {
            this._trayPos = this._posTween.update(elapsed);
            if (this._posTween.isFinished)
                this._posTween = null;
        }
        this.anchor();
        _super.prototype.update.call(this, elapsed);
    };
    return PlayerSelectScreen;
}(GameScreen));
/** @file LobbyPlayerBox.ts */
var LobbyPlayerBox = /** @class */ (function (_super) {
    __extends(LobbyPlayerBox, _super);
    //#endregion
    function LobbyPlayerBox(index) {
        var _this = _super.call(this) || this;
        //#region Display
        _this._emptyFill = new FillSettings("#222222");
        _this._numberFill = new FillSettings("#000000");
        _this._numberStroke = new StrokeSettings("#FFFFFF", 2);
        _this._numberAlpha = 0.1;
        _this._numberFont = new TextSettings(Assets.fonts.OpenSans_Bold, 600, "center" /* Center */, "middle" /* Middle */);
        _this._joinNowFill = new FillSettings("#666666");
        _this._joinNowFont = new TextSettings(Assets.fonts.OpenSans_Bold, 40, "center" /* Center */, "middle" /* Middle */);
        _this._readyFill = new FillSettings("#FFFFFF");
        _this._readyFont = new TextSettings(Assets.fonts.OpenSans_Bold, 80, "center" /* Center */, "middle" /* Middle */);
        _this._playerSprite = null;
        _this.isPresent = false;
        _this.isReady = false;
        _this.index = index;
        _this.x = Stage.refWidth / 4 * index;
        _this._joinedFill = new FillSettings(PlayerColors.array[index].main);
        DisplayClient.onPlayerJoined.add(_this.DisplayClient_onPlayerJoined, _this);
        DisplayClient.onPlayerLeft.add(_this.DisplayClient_onPlayerLeft, _this);
        DisplayClient.onPlayerJobChange.add(_this.DisplayClient_onPlayerJobChange, _this);
        DisplayClient.onPlayerReady.add(_this.DisplayClient_onPlayerReady, _this);
        DisplayClient.onPlayerNotReady.add(_this.DisplayClient_onPlayerNotReady, _this);
        // Mark as joined if alread in game
        var playerSlot = DisplayClient.room.playerSlots[index];
        if (playerSlot && playerSlot.isPresent) {
            _this.DisplayClient_onPlayerJoined(playerSlot.index);
            if (playerSlot.isReady) {
                _this.DisplayClient_onPlayerReady(playerSlot.index);
            }
        }
        return _this;
    }
    LobbyPlayerBox.prototype.dispose = function () {
    };
    LobbyPlayerBox.prototype.DisplayClient_onPlayerReady = function (playerIndex) {
        if (playerIndex !== this.index)
            return;
        this.isReady = true;
    };
    LobbyPlayerBox.prototype.DisplayClient_onPlayerNotReady = function (playerIndex) {
        if (playerIndex !== this.index)
            return;
        this.isReady = false;
    };
    LobbyPlayerBox.prototype.DisplayClient_onPlayerJobChange = function (playerIndex, jobIndex) {
        if (playerIndex !== this.index)
            return;
        if (this._playerSprite) {
            this.removeChild(this._playerSprite);
            this._playerSprite = null;
        }
        var playerSlot = DisplayClient.room.playerSlots[this.index];
        this._playerSprite = new playerSlot.job.spriteClass(PlayerColors.array[this.index].index, null);
        this.addChild(this._playerSprite);
    };
    LobbyPlayerBox.prototype.DisplayClient_onPlayerJoined = function (playerIndex) {
        if (playerIndex !== this.index)
            return;
        this.isPresent = true;
        this.isReady = false;
        var playerSlot = DisplayClient.room.playerSlots[this.index];
        this._playerSprite = new playerSlot.job.spriteClass(PlayerColors.array[this.index].index, null);
        this.addChild(this._playerSprite);
    };
    LobbyPlayerBox.prototype.DisplayClient_onPlayerLeft = function (playerIndex) {
        if (playerIndex !== this.index)
            return;
        this.isPresent = false;
        this.isReady = false;
        this.removeChild(this._playerSprite);
    };
    LobbyPlayerBox.prototype.anchor = function () {
        if (this._playerSprite) {
            this._playerSprite.x = Stage.width / 8;
            this._playerSprite.y = Stage.height / 2;
            var desWidth = Stage.width / 4 - 40;
            this._playerSprite.scaleX = this._playerSprite.scaleY = desWidth / PlayerSprite.WIDTH;
        }
    };
    LobbyPlayerBox.prototype.render = function (ctx, matrix, alpha) {
        if (!this.isPresent) {
            ctx.drawRect(matrix, alpha, 2, 0, Stage.refWidth / 4 - 4, Stage.refHeight, this._emptyFill);
            ctx.drawText(matrix, alpha * this._numberAlpha, Stage.refWidth / 8, Stage.refHeight / 2, (this.index + 1).toString(), this._numberFont, this._numberFill, this._numberStroke);
            ctx.drawText(matrix, alpha, Stage.refWidth / 8, Stage.refHeight / 2, "Join Now!", this._joinNowFont, this._joinNowFill, null);
        }
        else {
            ctx.drawRect(matrix, alpha, 0, 0, Stage.refWidth / 4 + 2, Stage.refHeight, this._joinedFill);
        }
        _super.prototype.render.call(this, ctx, matrix, alpha);
        if (this.isPresent && this.isReady) {
            if (this.isReady) {
                ctx.drawText(matrix, alpha, Stage.refWidth / 8, Stage.refHeight * 0.8, "Ready!", this._readyFont, this._readyFill, null);
            }
        }
    };
    return LobbyPlayerBox;
}(Sprite));
/** @file Map.ts */
var MapDebugLayer = /** @class */ (function (_super) {
    __extends(MapDebugLayer, _super);
    function MapDebugLayer(map) {
        var _this = _super.call(this) || this;
        _this.renderGrid = true;
        _this.renderWalkable = true;
        _this.renderBuildable = true;
        _this.renderBounds = true;
        _this.map = map;
        return _this;
    }
    MapDebugLayer.prototype.render = function (ctx, matrix, alpha) {
        if (this.renderGrid) {
            var stroke = new StrokeSettings("#00FF00", 1);
            for (var r = 0; r <= Map.GRID_HEIGHT; ++r) {
                ctx.drawLine(matrix, alpha, 0, r * Map.CELL_HEIGHT, Stage.width, r * Map.CELL_HEIGHT, stroke);
            }
            for (var c = 0; c <= Map.GRID_WIDTH; ++c) {
                ctx.drawLine(matrix, alpha, c * Map.CELL_WIDTH, 0, c * Map.CELL_WIDTH, Stage.height, stroke);
            }
        }
        for (var _i = 0, _a = this.map.grid; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell.hasTree) {
                ctx.drawRect(matrix, alpha * 0.3, cell.center.x - Map.CELL_WIDTH / 2, cell.center.y - Map.CELL_HEIGHT / 2, Map.CELL_WIDTH, Map.CELL_HEIGHT, new FillSettings("#FF0000"));
            }
        }
        if (this.renderWalkable || this.renderBuildable) {
            var notWalkableFill = new FillSettings("#FF00FF");
            var notBuildableStroke = new StrokeSettings("#00FFFF", 2);
            for (var r = 0; r < Map.GRID_HEIGHT; ++r) {
                for (var c = 0; c < Map.GRID_WIDTH; ++c) {
                    var cell = this.map.grid[r * Map.GRID_WIDTH + c];
                    if (!cell.walkable)
                        ctx.drawRect(matrix, alpha * 0.3, c * Map.CELL_WIDTH + 2, r * Map.CELL_HEIGHT + 2, Map.CELL_WIDTH - 4, Map.CELL_HEIGHT - 4, notWalkableFill);
                    if (!cell.buildable) {
                        ctx.drawLine(matrix, alpha, c * Map.CELL_WIDTH + 4, r * Map.CELL_HEIGHT + 4, (c + 1) * Map.CELL_WIDTH - 4, (r + 1) * Map.CELL_HEIGHT - 4, notBuildableStroke);
                        ctx.drawLine(matrix, alpha, c * Map.CELL_WIDTH + 4, (r + 1) * Map.CELL_HEIGHT - 4, (c + 1) * Map.CELL_WIDTH - 4, r * Map.CELL_HEIGHT + 4, notBuildableStroke);
                    }
                }
            }
        }
        if (this.renderBounds) {
            for (var _b = 0, _c = this.map.playerSprites; _b < _c.length; _b++) {
                var playerSprite = _c[_b];
                var boundsStroke = new StrokeSettings("#FF0000", 2);
                ctx.drawCircle(matrix, alpha, playerSprite.geom.originX, playerSprite.geom.originY, playerSprite.geom.radius, 0, 360, null, boundsStroke);
            }
            /*
            for (let treeSprite of this.map.treeSprites)
            {
                let boundsStroke:StrokeSettings = new StrokeSettings("#FF0000", 2);
                ctx.drawCircle(matrix, alpha, treeSprite.geom.originX, treeSprite.geom.originY, treeSprite.geom.radius, 0, 360, null, boundsStroke);
            }
            */
        }
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return MapDebugLayer;
}(Sprite));
/** @file EffectSprite.ts */
/** @file TreeSprite.ts */
var TreeSprite = /** @class */ (function (_super) {
    __extends(TreeSprite, _super);
    function TreeSprite() {
        var _this = _super.call(this, Assets.images.Tree) || this;
        _this.health = 100;
        _this.busy = false;
        _this._nearbyPlayerCount = 0;
        _this.regX = _this.texture.width / 2;
        _this.regY = 67 * 2;
        return _this;
    }
    TreeSprite.prototype.addNearbyPlayer = function () {
        this._nearbyPlayerCount++;
        if (this._nearbyPlayerCount > 0) {
            // todo, show arrow
        }
    };
    TreeSprite.prototype.removeNearbyPlayer = function () {
        this._nearbyPlayerCount--;
        if (this._nearbyPlayerCount === 0) {
            // todo, hide arrow
        }
    };
    TreeSprite.prototype.render = function (ctx, matrix, alpha) {
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return TreeSprite;
}(MapObjBmp));
/** @file TowerBolt.ts */
var TowerBoltTail = /** @class */ (function (_super) {
    __extends(TowerBoltTail, _super);
    function TowerBoltTail(bolt) {
        var _this = _super.call(this) || this;
        _this.fullLife = 150;
        _this.life = _this.fullLife;
        _this.isDead = false;
        _this.bolt = bolt;
        return _this;
    }
    TowerBoltTail.prototype.update = function (elapsed) {
        this.life -= elapsed;
        if (this.life <= 0) {
            this.isDead = true;
        }
    };
    TowerBoltTail.prototype.render = function (ctx, matrix, alpha) {
        var a = Easing.Quadratic.easeIn(1 - this.life / this.fullLife, 1, -1, 1);
        ctx.drawLine(matrix, alpha * a, this.bolt.x, this.bolt.y, this.bolt.fireX, this.bolt.fireY, new StrokeSettings("#FFFFFF", 4));
        ctx.drawLine(matrix, alpha * a, this.bolt.x, this.bolt.y, this.bolt.fireX, this.bolt.fireY, new StrokeSettings("#000000", 1));
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return TowerBoltTail;
}(MapObjSprite));
var TowerBolt = /** @class */ (function (_super) {
    __extends(TowerBolt, _super);
    function TowerBolt(fireX, fireY, target) {
        var _this = _super.call(this, Assets.images.FX_Bolt) || this;
        _this.isDead = false;
        _this.targetChest = -40;
        _this.hitRadius = 20;
        _this.speed = 1200;
        _this.damage = 50;
        _this.fireX = fireX;
        _this.fireY = fireY;
        _this.regX = 0;
        _this.regY = _this.texture.height / 2;
        _this.target = target;
        _this.setPosition(fireX, fireY);
        _this.updateRotation();
        _this.scaleX = _this.scaleY = 0.5;
        _this.tail = new TowerBoltTail(_this);
        return _this;
    }
    TowerBolt.prototype.updateRotation = function () {
        var rads = Math.atan2((this.target.y + this.targetChest) - this.y, this.target.x - this.x);
        var degs = MathUtil.RAD_TO_DEG * rads;
        this.rotation = degs;
    };
    TowerBolt.prototype.checkHit = function () {
        var targetOffset = new Vector2(this.target.x - this.x, (this.target.y + this.targetChest) - this.y);
        if (targetOffset.lengthSquared() < this.hitRadius * this.hitRadius) {
            this.isDead = true;
            this.visible = false;
            this.target.hit(this.damage);
        }
    };
    TowerBolt.prototype.update = function (elapsed) {
        var targetOffset = new Vector2(this.target.x - this.x, (this.target.y + this.targetChest) - this.y);
        var targetDist = targetOffset.length();
        var delta = this.speed * elapsed / 1000;
        if (delta >= targetDist - 1) {
            delta = targetDist - 1;
        }
        targetOffset.normalize();
        targetOffset.x *= delta;
        targetOffset.y *= delta;
        this.x += targetOffset.x;
        this.y += targetOffset.y;
        this.updateRotation();
        this.checkHit();
    };
    return TowerBolt;
}(MapObjBmp));
/** @file TowerSprite.ts */
/// <reference path="../projectiles/TowerBolt.ts" />
var TowerSprite = /** @class */ (function (_super) {
    __extends(TowerSprite, _super);
    function TowerSprite(map) {
        var _this = _super.call(this, null) || this;
        _this.fireEffect = new Bitmap(Assets.images.FX_BoltFire);
        _this.geom = new CircleGeom(32);
        _this.busy = false;
        _this.hBarHeight = 210 / 2;
        //private _nearbyPlayerCount:int = 0;
        _this.healthBar = new HealthBar(_this);
        _this.health = 0;
        _this.range = 128 * 3.5;
        _this.fireDelay = 750;
        _this.isDestroyed = true;
        _this.target = null;
        _this._cooldown = 0;
        _this.fireY = -59 * 2;
        _this.fullHealth = 100;
        _this.fireEffectLife = 0;
        _this.map = map;
        _this.healthBar.scaleX = 2;
        _this.healthBar.scaleY = 2;
        _this._destroyedTexture = _this.texture = Assets.images.Tower_Build;
        _this._normalTexture = Assets.images.Tower;
        _this.srcRect.set(0, 0, _this.texture.width, _this.texture.height);
        _this.regX = _this.texture.width / 2;
        _this.regY = _this.texture.height;
        _this.fireEffect.regX = 10;
        _this.fireEffect.regY = 25;
        _this.fireEffect.y = 70;
        _this.fireEffect.x = _this.regX;
        _this.addChild(_this.fireEffect);
        _this.fireEffect.visible = false;
        return _this;
    }
    TowerSprite.prototype.hit = function (dmg) {
        if (!this.isDestroyed) {
            this.health -= dmg;
            if (this.health <= 0) {
                this.health = 0;
                this.destroyed();
            }
        }
    };
    TowerSprite.prototype.setPosition = function (x, y) {
        this.geom.setOrigin(this.x = x, this.y = y);
    };
    TowerSprite.prototype.addNearbyPlayer = function () {
        /*
        this._nearbyPlayerCount++;
        if (this._nearbyPlayerCount === 1)
        {
            this._nearbyPlayerTween = new Interpolator(1, 0.5, 500, 0, Easing.none, new Looper(-1, true));
            this.texture = this._nearbyPlayerTexture;
        }
        */
    };
    TowerSprite.prototype.removeNearbyPlayer = function () {
        /*
        this._nearbyPlayerCount--;
        if (this._nearbyPlayerCount === 0)
        {
            this._nearbyPlayerTween = null;
            this.texture = this._normalTexture;
        }
        */
    };
    TowerSprite.prototype.distSqr = function (a, b) {
        return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    };
    TowerSprite.prototype.isInRange = function (monster) {
        if (this.distSqr(this, monster) < this.range * this.range)
            return true;
        else
            return false;
    };
    TowerSprite.prototype.fire = function () {
        this._cooldown = this.fireDelay;
        var bolt = new TowerBolt(this.x, this.y + this.fireY, this.target);
        this.map.effectsLayer.addChild(bolt);
        this.map.effectSprites.push(bolt);
        this.map.lowerEffectsLayer.addChild(bolt.tail);
        this.map.effectSprites.push(bolt.tail);
        this.fireEffectLife = 100;
        this.fireEffect.visible = true;
        var sound = new Sound(Assets.sounds.Arrow_Shot);
        sound.volume = 0.1;
        sound.play();
    };
    TowerSprite.prototype.update = function (elapsed) {
        /*
        if (this._nearbyPlayerTween)
        {
            this._nearbyPlayerTween.update(elapsed);
        }
        */
        if (this.fireEffectLife > 0) {
            this.fireEffectLife -= elapsed;
            if (this.fireEffectLife <= 0) {
                this.fireEffect.visible = false;
            }
        }
        this._cooldown -= elapsed;
        if (!this.isDestroyed) {
            if (this._cooldown <= 0) {
                if (this.target && !this.target.isDead && this.isInRange(this.target)) {
                    this.fire();
                }
                else {
                    this.target = null;
                    var bestDistSquare = 0;
                    for (var _i = 0, _a = this.map.monsterSprites; _i < _a.length; _i++) {
                        var monster = _a[_i];
                        if (monster.isSpawned && this.isInRange(monster)) {
                            var distSqr = this.distSqr(monster, this);
                            if (this.target === null || distSqr < bestDistSquare) {
                                bestDistSquare = distSqr;
                                this.target = monster;
                            }
                        }
                    }
                    if (this.target)
                        this.fire();
                }
            }
        }
    };
    TowerSprite.prototype.render = function (ctx, matrix, alpha) {
        /*
        if (this._nearbyPlayerTween)
        {
            alpha = alpha * this._nearbyPlayerTween.value;
        }
        */
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    TowerSprite.prototype.notDestroyed = function () {
        this.isDestroyed = false;
        this.health = 100;
        this.texture = this._normalTexture;
        this.srcRect.set(0, 0, this.texture.width, this.texture.height);
    };
    TowerSprite.prototype.destroyed = function () {
        this.isDestroyed = true;
        this.texture = this._destroyedTexture;
        this.srcRect.set(0, 0, this.texture.width, this.texture.height);
    };
    return TowerSprite;
}(MapObjBmp));
/** @file HealthBar.ts */
var HealthBar = /** @class */ (function (_super) {
    __extends(HealthBar, _super);
    function HealthBar(entity) {
        var _this = _super.call(this) || this;
        _this.isDead = false;
        _this.entity = entity;
        _this.regY = entity.hBarHeight;
        return _this;
    }
    HealthBar.prototype.update = function (elapsed) {
        this.x = this.entity.x;
        this.y = this.entity.y;
    };
    HealthBar.prototype.render = function (ctx, matrix, alpha) {
        if (this.entity.health < this.entity.fullHealth) {
            ctx.drawRect(matrix, alpha, -20, 0, 40, 5, new FillSettings("#FF0000"));
            if (this.entity.health > 0)
                ctx.drawRect(matrix, alpha, -20, 0, this.entity.health / this.entity.fullHealth * 40, 5, new FillSettings("#00FF00"));
        }
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return HealthBar;
}(MapObjSprite));
/** @file HitParticle.ts */
var HitParticle = /** @class */ (function (_super) {
    __extends(HitParticle, _super);
    function HitParticle(entity) {
        var _this = _super.call(this, Assets.images.FX_BoltFire) || this;
        _this.isDead = false;
        _this.life = 100;
        _this.entity = entity;
        _this.regY = 70;
        _this.scaleX = _this.scaleY = 0.5;
        _this.regX = _this.texture.width / 2;
        _this.regY = _this.texture.height / 2;
        _this.regY += 50;
        _this.regX += (-12 + Math.random() * 12);
        _this.regY += (-6 + Math.random() * 6);
        return _this;
    }
    HitParticle.prototype.update = function (elapsed) {
        this.x = this.entity.x;
        this.y = this.entity.y;
        this.life -= elapsed;
        if (this.life <= 0)
            this.isDead = true;
    };
    HitParticle.prototype.render = function (ctx, matrix, alpha) {
        if (this.entity.health < this.entity.fullHealth && this.entity.health > 0) {
            ctx.drawRect(matrix, alpha, -20, 0, 40, 5, new FillSettings("#FF0000"));
            ctx.drawRect(matrix, alpha, -20, 0, this.entity.health / this.entity.fullHealth * 40, 5, new FillSettings("#00FF00"));
        }
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return HitParticle;
}(MapObjBmp));
/** @file MonsterSprite.ts */
/// <reference path="../misc/HealthBar.ts" />
/// <reference path="../misc/HitParticle.ts" />
var MonsterSpawn = /** @class */ (function () {
    function MonsterSpawn(cell) {
        this.pos = new Vector2();
        this.cell = cell;
        this.pos.copy(cell.center);
        if (cell.r === 0) {
            this.pos.y -= Map.CELL_HEIGHT * 2;
        }
        if (cell.c === 0)
            this.pos.x -= Map.CELL_WIDTH * 2;
        if (cell.r === Map.GRID_HEIGHT - 1)
            this.pos.y += Map.CELL_HEIGHT * 3;
        if (cell.c === Map.GRID_WIDTH - 1)
            this.pos.x += Map.CELL_WIDTH * 2;
    }
    return MonsterSpawn;
}());
var MonsterSprite = /** @class */ (function (_super) {
    __extends(MonsterSprite, _super);
    function MonsterSprite(map, texture) {
        var _this = _super.call(this, texture) || this;
        _this.pathNodes = null;
        _this.firstPathing = true;
        _this.healthBar = new HealthBar(_this);
        _this.spawnDelay = 0;
        _this.isSpawned = false;
        _this.isDead = false;
        _this.hBarHeight = 70 * 2;
        _this.map = map;
        return _this;
    }
    MonsterSprite.prototype.hit = function (damage) {
        if (!this.isDead) {
            this.health -= damage;
            if (this.health < 0)
                this.health = 0;
            if (this.health <= 0) {
                this.isDead = true;
                this.map.removeMonster(this);
                this.healthBar.isDead = true;
                Map.killCount++;
            }
            var hitPar = new HitParticle(this);
            this.map.lowerEffectsLayer.addChild(hitPar);
            this.map.effectSprites.push(hitPar);
        }
    };
    return MonsterSprite;
}(MapObjBmp));
/** @file GruntSprite.ts */
var GruntSprite = /** @class */ (function (_super) {
    __extends(GruntSprite, _super);
    function GruntSprite(map, spawn) {
        var _this = _super.call(this, map, Assets.images.baddie_frames0001) || this;
        _this.health = 100; //900;
        _this.fullHealth = 100; //900;
        _this.damage = 10; //100;
        _this.speed = 200; // 100; //500;
        _this.target = null;
        _this.isTowerTarget = false;
        _this.state = 0 /* Idle */;
        _this.step = 0;
        _this.frame = 0;
        _this._cooldown = 0;
        _this.idleFrames = [
            Assets.images.baddie_frames0001
        ];
        _this.walkFrames = [
            Assets.images.baddie_frames0002,
            Assets.images.baddie_frames0003,
            Assets.images.baddie_frames0004,
            Assets.images.baddie_frames0005,
            Assets.images.baddie_frames0006,
            Assets.images.baddie_frames0007,
            Assets.images.baddie_frames0008,
            Assets.images.baddie_frames0009,
            Assets.images.baddie_frames0010,
            Assets.images.baddie_frames0011,
            Assets.images.baddie_frames0012,
            Assets.images.baddie_frames0013
        ];
        _this.attackFrames = [
            Assets.images.baddie_frames0017,
            Assets.images.baddie_frames0018,
            Assets.images.baddie_frames0019,
            Assets.images.baddie_frames0020,
            Assets.images.baddie_frames0021,
            Assets.images.baddie_frames0022,
            Assets.images.baddie_frames0023,
            Assets.images.baddie_frames0024
        ];
        _this.scaleX = _this.scaleY = 2;
        _this.regX = _this.texture.width / 2;
        _this.regY = _this.texture.height;
        _this.spawn = spawn;
        _this.setPosition(_this.spawn.pos.x, _this.spawn.pos.y);
        _this.startCell = _this.spawn.cell;
        return _this;
        //this.setPosition(this.pathNodes[0].x, this.pathNodes[0].y);
        //this.pathNodes = AStar.findPath(new Vector2(650, 873), new Vector2(896, 200));
        //this.setPosition(this.pathNodes[0].x, this.pathNodes[0].y);
    }
    GruntSprite.prototype.attack = function () {
        this.target.hit(this.damage);
        this._cooldown = 1500;
        this.state = 2 /* Attack */;
        this.step = 0;
        this.frame = 0;
        this.frames = this.attackFrames;
    };
    GruntSprite.prototype.update = function (elapsed) {
        this._cooldown -= elapsed;
        // Spawn Delay
        if (this.spawnDelay > 0) {
            this.spawnDelay -= elapsed;
            if (this.spawnDelay > 0)
                return;
        }
        var moved = false;
        if (this.state !== 2 /* Attack */) {
            // Choose a target
            var v = new Vector2();
            if (!this.target || this.target.isDestroyed) {
                this.target = null;
                this.pathNodes = null;
                var d = 0;
                for (var _i = 0, _a = this.map.towerSprites; _i < _a.length; _i++) {
                    var tower = _a[_i];
                    if (tower.isDestroyed)
                        continue;
                    var dist = v.set(tower.x - this.x, tower.y - this.y).lengthSquared();
                    if (!this.target || dist < d) {
                        this.target = tower;
                        d = dist;
                    }
                }
            }
            // check if close enough to target;
            var tDist = this.target ? v.set(this.target.x - this.x, this.target.y - this.y).lengthSquared() : 0;
            if (this.target && tDist <= (Map.CELL_HEIGHT) * (Map.CELL_HEIGHT)) {
                this.pathNodes = null;
                // TODO: ATTACK
                if (this._cooldown <= 0) {
                    this.attack();
                }
            }
            else if (this.target) {
                if (!this.pathNodes) {
                    var cell = this.map.getCellAt(this.x, this.y);
                    if (!cell) {
                        this.pathNodes = AStar.findPath(new Vector2(this.startCell.x, this.startCell.y), new Vector2(this.target.x, this.target.y));
                    }
                    else {
                        this.pathNodes = AStar.findPath(new Vector2(this.x, this.y), new Vector2(this.target.x, this.target.y));
                    }
                }
            }
            if (this.pathNodes && this.pathNodes.length > 0) {
                moved = true;
                var distLeft = this.speed * elapsed / 1000;
                while (distLeft > 0) {
                    var nextNode = this.pathNodes[0];
                    var offset = new Vector2(nextNode.x - this.x, nextNode.y - this.y);
                    var distTo = offset.length();
                    if (distTo <= distLeft) {
                        distLeft -= offset.length();
                        this.setPosition(nextNode.x, nextNode.y);
                        this.pathNodes.shift();
                        this.isSpawned = true;
                        if (this.pathNodes.length === 0) {
                            distLeft = 0;
                            moved = false;
                        }
                    }
                    else {
                        var newPos = offset.interpolate(distLeft / distTo);
                        this.setPosition(this.x + newPos.x, this.y + newPos.y);
                        distLeft = 0;
                    }
                }
            }
        }
        // Advance anim playhead
        this.step += elapsed;
        // Update state
        if (moved) {
            if (this.state !== 1 /* Move */) {
                this.state = 1 /* Move */;
                this.step = 0;
                this.frame = 0;
                this.frames = this.walkFrames;
            }
        }
        else if (this.state !== 2 /* Attack */) {
            this.state = 0 /* Idle */;
            this.step = 0;
            this.frame = 0;
            this.frames = this.idleFrames;
        }
        // Advance frames
        while (this.step > 1000 / 30) {
            this.step -= 1000 / 30;
            this.frame++;
            if (this.state === 2 /* Attack */ && this.frame >= this.frames.length) {
                this.state = 0 /* Idle */;
                this.step = 0;
                this.frame = 0;
                this.frames = this.idleFrames;
            }
            else
                while (this.frame >= this.frames.length)
                    this.frame -= this.frames.length;
        }
        // Update texture
        var tex = this.frames[this.frame];
        if (tex !== this.texture)
            this.texture = tex;
    };
    return GruntSprite;
}(MonsterSprite));
/** @file CastleSprite.ts */
var CastleSprite = /** @class */ (function (_super) {
    __extends(CastleSprite, _super);
    function CastleSprite() {
        var _this = _super.call(this, Assets.images.Castle) || this;
        //private _nearbyPlayerCount:int = 0;
        //private _nearbyPlayerTween:Interpolator = null;
        _this.health = 0;
        _this.isDestroyed = true;
        _this.regX = _this.texture.width / 2;
        _this.regY = _this.texture.height;
        return _this;
    }
    CastleSprite.prototype.addNearbyPlayer = function () {
        /*
        this._nearbyPlayerCount++;
        if (this._nearbyPlayerCount === 1)
        {
            this._nearbyPlayerTween = new Interpolator(1, 0.5, 500, 0, Easing.none, new Looper(-1, true));
            this.texture = this._nearbyPlayerTexture;
        }
        */
    };
    CastleSprite.prototype.removeNearbyPlayer = function () {
        /*
        this._nearbyPlayerCount--;
        if (this._nearbyPlayerCount === 0)
        {
            this._nearbyPlayerTween = null;
            this.texture = this._normalTexture;
        }
        */
    };
    CastleSprite.prototype.update = function (elapsed) {
        /*
        if (this._nearbyPlayerTween)
        {
            this._nearbyPlayerTween.update(elapsed);
        }
        */
    };
    CastleSprite.prototype.render = function (ctx, matrix, alpha) {
        /*
        if (this._nearbyPlayerTween)
        {
            alpha = alpha * this._nearbyPlayerTween.value;
        }
        */
        _super.prototype.render.call(this, ctx, matrix, alpha);
    };
    return CastleSprite;
}(MapObjBmp));
/** @file AStar.ts */
var $AStar = /** @class */ (function () {
    function $AStar() {
        this._pass = 0;
    }
    $AStar.prototype.initialize = function (map) {
        this._map = map;
    };
    /*
    private distSqr(a:Cell, b:Cell):number
    {
        return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    }
    */
    $AStar.prototype.dist = function (a, b) {
        return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    };
    $AStar.prototype.findPath = function (startPos, endPos) {
        this._pass++;
        var pass = this._pass;
        var start = this._map.getCellAt(startPos.x, startPos.y);
        var end = this._map.getCellAt(endPos.x, endPos.y);
        if (start === end)
            return [startPos, endPos];
        var cell = start;
        cell.g = 0;
        cell.h = this.dist(start, end);
        cell.f = cell.g + cell.h;
        cell.pass = this._pass;
        cell.mark = 1 /* Open */;
        cell.parent = null;
        var open = [cell];
        while (open.length > 0) {
            open.sort(this.sort);
            cell = open.pop();
            cell.mark = 2 /* Closed */;
            if (cell === end) {
                var pts = [];
                while (cell) {
                    pts.unshift(cell.center);
                    cell = cell.parent;
                }
                if (startPos.distanceSquared(pts[1]) <= pts[0].distanceSquared(pts[1])) {
                    pts.shift();
                }
                if (endPos.distanceSquared(pts[pts.length - 2]) <= endPos.distanceSquared(pts[pts.length - 1])) {
                    pts.pop();
                }
                pts.unshift(startPos);
                pts.push(endPos);
                return pts;
            }
            else {
                for (var i = 0; i < cell.neighbors.length; ++i) {
                    var edge = cell.neighbors[i];
                    var to = edge.to;
                    var travelCost = edge.travelCost;
                    if (cell.isRoad && to.isRoad) {
                        //travelCost *= 0.5;
                        //travelCost = 1;
                    }
                    if (to.hasTree) {
                        travelCost *= 10;
                    }
                    if (to !== end && to.hasTower) {
                        travelCost *= 10;
                    }
                    var g = cell.g + travelCost;
                    var h = this.dist(to, end);
                    var f = g + h;
                    //if (!to.hasTree)
                    //{
                    if (to.pass === pass && (to.mark === 1 /* Open */ || to.mark === 2 /* Closed */)) {
                        if (f < to.f) {
                            to.f = f;
                            to.g = g;
                            to.h = h;
                            to.parent = cell;
                        }
                    }
                    else {
                        to.pass = pass;
                        to.g = g;
                        to.f = f;
                        to.h = h;
                        to.parent = cell;
                        to.mark = 1 /* Open */;
                        open.push(to);
                    }
                    //}
                }
            }
        }
        return null;
    };
    $AStar.prototype.sort = function (a, b) {
        if (a.f > b.f)
            return -1;
        else if (a.f < b.f)
            return 1;
        else
            return 0;
    };
    return $AStar;
}());
var AStar = new $AStar();
/** @file MapLayout.ts */
var MapLayout = [
    4, 4, 2, 2, 2, 4, 2, 2, 4, 2, 2, 2, 2, 4, 2,
    4, 4, 4, 2, 2, 2, 4, 4, 4, 4, 2, 4, 4, 4, 4,
    2, 2, 4, 4, 2, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4,
    4, 2, 2, 2, 2, 2, 2, 4, 4, 2, 4, 2, 4, 4, 2,
    2, 2, 2, 2, 2, 2, 2, 4, 2, 2, 2, 2, 2, 2, 2,
    2, 4, 4, 2, 2, 2, 2, 2, 2, 2, 4, 4, 2, 2, 4,
    2, 4, 2, 4, 2, 4, 4, 2, 2, 4, 4, 4, 2, 2, 2,
    2, 4, 4, 2, 2, 4, 4, 4, 2, 4, 4, 2, 2, 4, 4,
    4, 2, 2, 2, 2, 2, 4, 2, 2, 2, 4, 4, 2, 4, 4,
    2, 2, 2, 2, 2, 2, 2, 2, 4, 2, 2, 2, 2, 4, 4,
    2, 2, 2, 4, 2, 4, 4, 2, 2, 2, 2, 2, 4, 4, 4,
    2, 4, 4, 4, 2, 2, 4, 4, 2, 2, 2, 4, 2, 4, 4,
    2, 4, 2, 2, 2, 2, 4, 4, 2, 4, 2, 2, 2, 2, 2,
    2, 2, 2, 2, 4, 2, 2, 2, 2, 4, 4, 4, 2, 2, 2,
    2, 2, 2, 4, 4, 4, 2, 2, 2, 4, 4, 4, 2, 2, 2,
    4, 4, 2, 2, 2, 4, 2, 4, 2, 2, 2, 4, 2, 2, 4,
    4, 4, 2, 4, 2, 2, 2, 2, 4, 2, 2, 2, 2, 4, 4
];
/** @file Edge.ts */
var Edge = /** @class */ (function () {
    function Edge(to, travelCost) {
        this.to = to;
        this.travelCost = travelCost;
    }
    return Edge;
}());
/** @file Cell.ts */
/// <reference path="Edge.ts" />
var Cell = /** @class */ (function () {
    function Cell(r, c) {
        this.neighbors = [];
        /** Indicates a permanently blocked cell, use this for non walkable areas drawn into the map. */
        this.walkable = true;
        /** Indicates if building is allowed on this cell. We don't want to let the player build where monsters come in. */
        this.buildable = true;
        this.hasTree = false;
        this.hasTower = false;
        this.tree = null;
        this.tower = null;
        this.isRoad = false;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.pass = 0;
        this.mark = 0 /* Unknown */;
        this.parent = null;
        this.i = r * Map.GRID_WIDTH + c;
        this.r = r;
        this.c = c;
        this.x = (c + 0.5) * Map.CELL_WIDTH;
        this.y = (r + 0.5) * Map.CELL_HEIGHT;
        this.center = new Vector2(this.x, this.y);
    }
    Cell.prototype.addNeighbor = function (to) {
        var edge = new Edge(to, new Vector2(this.x - to.x, this.y - to.y).length());
        this.neighbors.push(edge);
    };
    return Cell;
}());
/** @file Waves.ts */
var $Waves = /** @class */ (function () {
    function $Waves() {
        this.current = 0;
    }
    $Waves.prototype.spawn = function (map) {
        console.log("   spawning", this.current);
        var baseSpawnDelay = 1000;
        var baseNumMonster = 4;
        var postWaveDelay = 10000;
        var initialDelay = 7000;
        if (this.current === 0) {
            initialDelay = 10000;
        }
        //initialDelay = 0;
        var spawnDuration = 6000;
        var spawnDelay = baseSpawnDelay;
        for (var i = 0; i < this.current; ++i)
            spawnDelay *= 0.9;
        var numMonsters = 4 + this.current * 4;
        //let spawnDelay:number = spawnDuration / numMonsters;
        for (var i = 0; i < numMonsters; ++i) {
            var grunt = new GruntSprite(map, map.monsterSpawns[Math.floor(Math.random() * map.monsterSpawns.length)]);
            map.monsterSprites.push(grunt);
            //let randPos:Vector2 = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
            //grunt.x = randPos.x;
            ///grunt.y = randPos.y;
            map.objectLayer.addChild(grunt);
            grunt.spawnDelay = initialDelay + spawnDelay * i;
            map.effectSprites.push(grunt.healthBar);
            map.upperEffectsLayer.addChild(grunt.healthBar);
            console.log("   spawn");
        }
        this.current++;
        return postWaveDelay;
    };
    return $Waves;
}());
var Waves = new $Waves();
/** @file Map.ts */
/// <reference path="MapDebugLayer.ts" />
/// <reference path="MapObjSprite.ts" />
/// <reference path="../sprites/EffectSprite.ts" />
/// <reference path="../sprites/resources/TreeSprite.ts" />
/// <reference path="../sprites/towers/TowerSprite.ts" />
/// <reference path="../sprites/monsters/MonsterSprite.ts" />
/// <reference path="../sprites/monsters/GruntSprite.ts" />
/// <reference path="../sprites/towers/CastleSprite.ts" />
/// <reference path="AStar.ts" />
/// <reference path="MapLayout.ts" />
/// <reference path="Cell.ts" />
/// <reference path="Waves.ts" />
var Map = /** @class */ (function (_super) {
    __extends(Map, _super);
    function Map() {
        var _this = _super.call(this) || this;
        _this.background = new Bitmap(Assets.images.test_map);
        _this.debugLayer = new MapDebugLayer(_this);
        _this.objectLayer = new Sprite();
        _this.lowerEffectsLayer = new Sprite();
        _this.effectsLayer = new Sprite();
        _this.upperEffectsLayer = new Sprite();
        _this.playerSprites = [
        //new FighterSprite(0, this) //,
        //new EngineerSprite(1, this),
        //new EngineerSprite(2, this),
        //new EngineerSprite(3, this)
        ];
        _this.treeSprites = [];
        _this.monsterSprites = [];
        _this.towerSprites = [];
        _this.effectSprites = [];
        _this.grid = [];
        _this.monsterSpawns = [];
        Waves.current = 0;
        Map.killCount = 0;
        Map.instance = _this;
        _this.y = -4;
        AStar.initialize(_this);
        _this.addChild(_this.background);
        //this.addChild(this.debugLayer);
        _this.addChild(_this.objectLayer);
        _this.addChild(_this.lowerEffectsLayer);
        _this.addChild(_this.effectsLayer);
        _this.addChild(_this.upperEffectsLayer);
        _this.initGrid();
        _this.initLayout();
        _this.initNeighbors();
        //this.playerSprites[0].setPosition(900, 220);
        //this.playerSprites[1].setPosition(832, 250);
        //this.playerSprites[2].setPosition(972, 260);
        //this.playerSprites[3].setPosition(896, 298);
        //this.objectLayer.addChild(this.playerSprites[0]);
        //this.objectLayer.addChild(this.playerSprites[1]);
        //this.objectLayer.addChild(this.playerSprites[2]);
        //this.objectLayer.addChild(this.playerSprites[3]);
        var cell;
        for (var r = 0; r < Map.GRID_HEIGHT; ++r) {
            for (var c = 0; c < Map.GRID_WIDTH; ++c) {
                if (r === 0 || c === 0 || r === Map.GRID_HEIGHT - 1 || c === Map.GRID_WIDTH - 1) {
                    cell = _this.getCell(r, c);
                    var spawn = new MonsterSpawn(cell);
                    _this.monsterSpawns.push(spawn);
                }
            }
        }
        var playerSpawns = [
            _this.getCell(5, 4),
            _this.getCell(4, 3),
            _this.getCell(4, 5),
            _this.getCell(3, 4)
        ];
        if (DisplayClient.room) {
            for (var _i = 0, _a = DisplayClient.room.playerSlots; _i < _a.length; _i++) {
                var playerSlot = _a[_i];
                if (playerSlot.isPresent) {
                    var playerSprite = void 0; //new PlayerSprite(playerSlot.index)
                    if (playerSlot.job === PlayerJobs.Fighter)
                        playerSprite = new FighterSprite(playerSlot.index, _this);
                    else if (playerSlot.job === PlayerJobs.Engineer)
                        playerSprite = new EngineerSprite(playerSlot.index, _this);
                    else if (playerSlot.job === PlayerJobs.Thief)
                        playerSprite = new ThiefSprite(playerSlot.index, _this);
                    else
                        playerSprite = new BardSprite(playerSlot.index, _this);
                    playerSprite.setPosition(playerSpawns[playerSlot.index].x, playerSpawns[playerSlot.index].y);
                    _this.objectLayer.addChild(playerSprite);
                    _this.playerSprites.push(playerSprite);
                }
            }
        }
        var tower = new TowerSprite(_this);
        cell = _this.getCell(6, 7);
        tower.setPosition(cell.x, cell.y + 20);
        _this.addTower(tower);
        tower.notDestroyed();
        tower = new TowerSprite(_this);
        cell = _this.getCell(12, 10);
        tower.setPosition(cell.x, cell.y + 20);
        _this.addTower(tower);
        tower.notDestroyed();
        tower = new TowerSprite(_this);
        cell = _this.getCell(13, 3);
        tower.setPosition(cell.x, cell.y + 20);
        _this.addTower(tower);
        tower.notDestroyed();
        tower = new TowerSprite(_this);
        cell = _this.getCell(5, 3);
        tower.setPosition(cell.x, cell.y + 20);
        _this.addTower(tower);
        tower.notDestroyed();
        return _this;
        /*
        let spawnDelay:number = 0;
        for (let i:int = 0; i < 1; ++i)
        {
            let grunt:GruntSprite = new GruntSprite(this, this.monsterSpawns[Math.floor(Math.random() * this.monsterSpawns.length)]);
            this.monsterSprites.push(grunt);
            //let randPos:Vector2 = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
            //grunt.x = randPos.x;
            ///grunt.y = randPos.y;
            this.objectLayer.addChild(grunt);
            grunt.spawnDelay = spawnDelay;
            spawnDelay += 1250;

            this.effectSprites.push(grunt.healthBar);
            this.upperEffectsLayer.addChild(grunt.healthBar);
        }
        */
    }
    Map.prototype.initGrid = function () {
        this.grid.length = Map.GRID_WIDTH * Map.GRID_HEIGHT;
        for (var r = 0; r < Map.GRID_HEIGHT; ++r) {
            for (var c = 0; c < Map.GRID_WIDTH; ++c) {
                var i = r * Map.GRID_WIDTH + c;
                this.grid[i] = new Cell(r, c);
            }
        }
    };
    Map.prototype.initLayout = function () {
        for (var i = 0; i < MapLayout.length; ++i) {
            var tile = MapLayout[i];
            if (tile === 9 /* Castle */ || tile === 3 /* Water */) {
                this.grid[i].walkable = false;
                this.grid[i].buildable = false;
            }
            else if (tile === 1 /* Road */) {
                this.grid[i].buildable = false;
                this.grid[i].isRoad = true;
            }
            else if (tile === 4 /* Tree */) {
                var tree = new TreeSprite();
                this.treeSprites.push(tree);
                this.objectLayer.addChild(tree);
                tree.setPosition(this.grid[i].x, this.grid[i].y);
                this.grid[i].hasTree = true;
                this.grid[i].tree = tree;
            }
        }
    };
    Map.prototype.initNeighbors = function () {
        for (var _i = 0, _a = this.grid; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell.walkable) {
                for (var r = cell.r - 1; r <= cell.r + 1; ++r) {
                    for (var c = cell.c - 1; c <= cell.c + 1; ++c) {
                        var otherCell = this.getCell(r, c);
                        if (otherCell && otherCell.walkable && otherCell !== cell) {
                            cell.addNeighbor(otherCell);
                        }
                    }
                }
            }
        }
    };
    Map.prototype.addTower = function (tower) {
        this.towerSprites.push(tower);
        this.objectLayer.addChild(tower);
        var cell = this.getCellAt(tower.x, tower.y);
        cell.hasTower = true;
        cell.tower = tower;
        this.upperEffectsLayer.addChild(tower.healthBar);
        this.effectSprites.push(tower.healthBar);
    };
    Map.prototype.getCellAt = function (x, y) {
        var r = Math.floor(y / Map.CELL_HEIGHT);
        var c = Math.floor(x / Map.CELL_WIDTH);
        if (r < 0 || r >= Map.GRID_HEIGHT || c < 0 || c >= Map.GRID_WIDTH)
            return null;
        return this.grid[Map.GRID_WIDTH * r + c];
    };
    Map.prototype.getCell = function (r, c) {
        if (r < 0 || r >= Map.GRID_HEIGHT || c < 0 || c >= Map.GRID_WIDTH)
            return null;
        return this.grid[Map.GRID_WIDTH * r + c];
    };
    Map.prototype.removeTree = function (tree) {
        var idx = this.treeSprites.indexOf(tree);
        if (idx >= 0) {
            this.treeSprites.splice(idx);
            this.objectLayer.removeChild(tree);
            var cell = this.getCellAt(tree.x, tree.y);
            cell.hasTree = false;
            cell.tree = null;
        }
    };
    Map.prototype.removeMonster = function (monster) {
        this.monsterSprites.splice(this.monsterSprites.indexOf(monster), 1);
        this.objectLayer.removeChild(monster);
    };
    Map.prototype.update = function (elapsed) {
        /*
        let ticks:number = elapsed;
        let targetStep:number = 10;
        while (ticks > 0)
        {
            let step:number = Math.min(ticks, targetStep);
            ticks -= step;

            for (let playerSprite of this.playerSprites)
            {
                playerSprite.tick(elapsed);
            }
        }
        */
        for (var _i = 0, _a = this.playerSprites; _i < _a.length; _i++) {
            var playerSprite = _a[_i];
            playerSprite.update(elapsed);
        }
        if (this.monsterSprites.length === 0) {
            Waves.spawn(this);
        }
        for (var _b = 0, _c = this.monsterSprites; _b < _c.length; _b++) {
            var monsterSprite = _c[_b];
            monsterSprite.update(elapsed);
        }
        for (var _d = 0, _e = this.towerSprites; _d < _e.length; _d++) {
            var towerSprite = _e[_d];
            towerSprite.update(elapsed);
        }
        this.objectLayer.children.sort(ySort);
        for (var _f = 0, _g = this.treeSprites; _f < _g.length; _f++) {
            var treeSprite = _g[_f];
            treeSprite.alpha = 1;
            for (var _h = 0, _j = this.monsterSprites; _h < _j.length; _h++) {
                var monsterSprite = _j[_h];
                if (monsterSprite.y < treeSprite.y && treeSprite.y - monsterSprite.y < 64 && Math.abs(monsterSprite.x - treeSprite.x) < 48) {
                    treeSprite.alpha = 0.5;
                }
            }
            if (treeSprite.alpha === 1) {
                for (var _k = 0, _l = this.playerSprites; _k < _l.length; _k++) {
                    var playerSprite = _l[_k];
                    if (playerSprite.y < treeSprite.y && treeSprite.y - playerSprite.y < 64 && Math.abs(playerSprite.x - treeSprite.x) < 48) {
                        treeSprite.alpha = 0.5;
                    }
                }
            }
        }
        for (var _m = 0, _o = this.towerSprites; _m < _o.length; _m++) {
            var towerSprite = _o[_m];
            towerSprite.alpha = 1;
            for (var _p = 0, _q = this.monsterSprites; _p < _q.length; _p++) {
                var monsterSprite = _q[_p];
                if (monsterSprite.y < towerSprite.y && towerSprite.y - monsterSprite.y < 64 + 128 && Math.abs(monsterSprite.x - towerSprite.x) < 48) {
                    towerSprite.alpha = 0.5;
                }
            }
            if (towerSprite.alpha === 1) {
                for (var _r = 0, _s = this.playerSprites; _r < _s.length; _r++) {
                    var playerSprite = _s[_r];
                    if (playerSprite.y < towerSprite.y && towerSprite.y - playerSprite.y < 64 + 128 && Math.abs(playerSprite.x - towerSprite.x) < 48) {
                        towerSprite.alpha = 0.5;
                    }
                }
            }
        }
        for (var i = 0; i < this.effectSprites.length; ++i) {
            var effectSprite = this.effectSprites[i];
            effectSprite.update(elapsed);
            if (effectSprite.isDead) {
                effectSprite.parent.removeChild(effectSprite);
                this.effectSprites.splice(i, 1);
                i--;
            }
        }
    };
    Map.CELL_WIDTH = 128;
    Map.CELL_HEIGHT = 64;
    Map.GRID_WIDTH = 15;
    Map.GRID_HEIGHT = 17;
    Map.sortIndex = 0;
    Map.killCount = 0;
    return Map;
}(Sprite));
function ySort(a, b) {
    if (a.y > b.y)
        return 1;
    else if (a.y < b.y)
        return -1;
    else if (a.sortIndex < b.sortIndex)
        return -1;
    else
        return 1;
}
/** @file GameOverScreen.ts */
var GameOverScreen = /** @class */ (function (_super) {
    __extends(GameOverScreen, _super);
    function GameOverScreen() {
        var _this = _super.call(this) || this;
        _this.delay = 5000;
        _this.dimmer = new Dimmer();
        _this.lbl = new TextField("GAME OVER", new TextSettings(Assets.fonts.OpenSans_Bold, 200, "center" /* Center */, "middle" /* Middle */), new FillSettings("#FFFFFF"), new StrokeSettings("#000000", 20, true));
        _this.isPopup = true;
        return _this;
    }
    GameOverScreen.prototype.initialize = function () {
        this.display.addChild(this.dimmer);
        this.display.addChild(this.lbl);
        this.anchor();
        if (TeamTowerDefense.instance.isPlayerClient === false) {
            TeamTowerDefense.instance.gameMusic.stop();
            TeamTowerDefense.instance.titleMusic.play();
        }
        _super.prototype.initialize.call(this);
    };
    GameOverScreen.prototype.anchor = function () {
        this.lbl.x = Stage.width / 2;
        this.lbl.y = Stage.height / 2;
    };
    GameOverScreen.prototype.update = function (elapsed) {
        this.anchor();
        this.delay -= elapsed;
        if (this.delay <= 0) {
            this.exit();
        }
    };
    return GameOverScreen;
}(GameScreen));
/** @file ScreenGameplayScreen.ts */
/// <reference path="../stage/map/Map.ts" />
/// <reference path="GameOverScreen.ts" />
var ScreenGameplayScreen = /** @class */ (function (_super) {
    __extends(ScreenGameplayScreen, _super);
    function ScreenGameplayScreen() {
        var _this = _super.call(this) || this;
        _this.killCount = new TextField("TIME: 0", new TextSettings(Assets.fonts.OpenSans_Bold, 40, "left" /* Left */, "alphabetic" /* Alphabetic */), new FillSettings("#000000"), new StrokeSettings("#FFFFFF", 8, true));
        _this.time = 0;
        return _this;
    }
    ScreenGameplayScreen.prototype.initialize = function () {
        this.map = new Map();
        this.display.addChild(this.map);
        DisplayClient.onTreeFinished.add(this.DisplayClient_onTreeFinished, this);
        DisplayClient.onBuildingFinished.add(this.DisplayClient_onBuildingFinished, this);
        this.display.addChild(this.killCount);
        this.anchor();
        console.log("stopping music");
        TeamTowerDefense.instance.titleMusic.stop();
        TeamTowerDefense.instance.gameMusic.play();
        _super.prototype.initialize.call(this);
    };
    ScreenGameplayScreen.prototype.removed = function () {
        DisplayClient.onTreeFinished.remove(this.DisplayClient_onTreeFinished, this);
        DisplayClient.onBuildingFinished.remove(this.DisplayClient_onBuildingFinished, this);
        _super.prototype.removed.call(this);
    };
    ScreenGameplayScreen.prototype.DisplayClient_onTreeFinished = function (treeSprite) {
        this.map.removeTree(treeSprite);
    };
    ScreenGameplayScreen.prototype.DisplayClient_onBuildingFinished = function (tower) {
        //this.map.removeTree(tower);
    };
    ScreenGameplayScreen.prototype.anchor = function () {
        this.killCount.x = 20;
        this.killCount.y = Stage.height - 20;
    };
    ScreenGameplayScreen.prototype.update = function (elapsed) {
        this.anchor();
        if (this.isFocused) {
            this.time += elapsed;
            this.killCount.text = "TIME: " + Math.floor(this.time / 1000);
            this.map.update(elapsed);
            var go = true;
            for (var _i = 0, _a = this.map.towerSprites; _i < _a.length; _i++) {
                var tower = _a[_i];
                if (!tower.isDestroyed) {
                    go = false;
                }
            }
            if (go) {
                var gameOver = new GameOverScreen();
                gameOver.onRemoved.add(this.gameOver_onRemoved, this);
                this.screenManager.add(gameOver);
                DisplayClient.triggerGameOver();
            }
        }
        _super.prototype.update.call(this, elapsed);
    };
    ScreenGameplayScreen.prototype.gameOver_onRemoved = function () {
        this.screenManager.add(new LobbyScreen());
        this.exit();
    };
    return ScreenGameplayScreen;
}(GameScreen));
/** @file LobbyScreen.ts */
/// <reference path="../stage/lobby/LobbyPlayerBox.ts" />
/// <reference path="ScreenGameplayScreen.ts" />
var LobbyScreen = /** @class */ (function (_super) {
    __extends(LobbyScreen, _super);
    // need a dimmer and a count text
    // need to mark display client as game started when count hits 0
    function LobbyScreen() {
        var _this = _super.call(this) || this;
        _this.boxes = [
            new LobbyPlayerBox(0),
            new LobbyPlayerBox(1),
            new LobbyPlayerBox(2),
            new LobbyPlayerBox(3)
        ];
        _this.countdownText = new TextField("3", new TextSettings(Assets.fonts.OpenSans_Bold, 800, "center" /* Center */, "middle" /* Middle */), new FillSettings("#FFFFFF"));
        _this.countdown = 0;
        return _this;
    }
    LobbyScreen.prototype.initialize = function () {
        for (var _i = 0, _a = this.boxes; _i < _a.length; _i++) {
            var box = _a[_i];
            this.display.addChild(box);
        }
        this.dimmer = new Dimmer();
        this.dimmer.visible = false;
        this.display.addChild(this.dimmer);
        this.display.addChild(this.countdownText);
        this.countdownText.visible = false;
        DisplayClient.onPlayerLeft.add(this.DisplayClient_onPlayerLeft, this);
        DisplayClient.onPlayersReady.add(this.DisplayClient_onPlayersReady, this);
        DisplayClient.onPlayersUnready.add(this.DisplayClient_onPlayersUnready, this);
        if (DisplayClient.room.allReady) {
            this.DisplayClient_onPlayersReady();
        }
        TeamTowerDefense.instance.gameMusic.stop();
        TeamTowerDefense.instance.titleMusic.play();
        this.anchor();
        _super.prototype.initialize.call(this);
    };
    LobbyScreen.prototype.DisplayClient_onPlayerLeft = function () {
        if (DisplayClient.room.numPlayers === 0) {
            DisplayClient.onPlayerLeft.remove(this.DisplayClient_onPlayerLeft, this);
            DisplayClient.onPlayersReady.remove(this.DisplayClient_onPlayersReady, this);
            DisplayClient.onPlayersUnready.remove(this.DisplayClient_onPlayersUnready, this);
            this.screenManager.add(new TitleScreen(TeamTowerDefense.instance.isPlayerClient, TeamTowerDefense.instance.isLocalTest));
            this.exit();
        }
    };
    LobbyScreen.prototype.DisplayClient_onPlayersReady = function () {
        this.dimmer.visible = true;
        this.countdownText.visible = true;
        this.countdown = 3000;
    };
    LobbyScreen.prototype.DisplayClient_onPlayersUnready = function () {
        this.dimmer.visible = false;
        this.countdownText.visible = false;
        this.countdown = 0;
    };
    LobbyScreen.prototype.anchor = function () {
        for (var _i = 0, _a = this.boxes; _i < _a.length; _i++) {
            var box = _a[_i];
            box.anchor();
        }
        this.countdownText.x = Stage.width / 2;
        this.countdownText.y = Stage.height / 2;
    };
    LobbyScreen.prototype.update = function (elapsed) {
        this.anchor();
        if (this.countdown > 0) {
            this.countdown -= elapsed;
            if (this.countdown > 0) {
                this.countdownText.text = Math.ceil(this.countdown / 1000) + "";
            }
            else {
                DisplayClient.startGame();
                this.screenManager.add(new ScreenGameplayScreen());
                this.exit();
            }
        }
        _super.prototype.update.call(this, elapsed);
    };
    return LobbyScreen;
}(GameScreen));
/** @file TitleScreen.ts */
/// <reference path="../stage/general/StandardButton.ts" />
/// <reference path="PlayerSelectScreen.ts" />
/// <reference path="LobbyScreen.ts" />
var TitleScreen = /** @class */ (function (_super) {
    __extends(TitleScreen, _super);
    function TitleScreen(isPlayerClient, isLocalTest) {
        var _this = _super.call(this) || this;
        _this._isPlayerClient = isPlayerClient;
        _this._isLocalTest = isLocalTest;
        return _this;
    }
    TitleScreen.prototype.initialize = function () {
        this._logo = new Bitmap(Assets.images.Title);
        this.display.addChild(this._logo);
        this._connectingLbl = new TextField("Connecting...", new TextSettings(Assets.fonts.OpenSans_Bold, 20, "center" /* Center */, "alphabetic" /* Alphabetic */), new FillSettings("#FFFFFF"));
        this.display.addChild(this._connectingLbl);
        this._gameFullLbl = new TextField("Game is full. Please Wait.", new TextSettings(Assets.fonts.OpenSans_Bold, 20, "center" /* Center */, "alphabetic" /* Alphabetic */), new FillSettings("#FFFFFF"));
        this.display.addChild(this._gameFullLbl);
        this._gameFullLbl.visible = false;
        this._playButton = new StandardButton(880, 120, "Play!");
        this.display.addChild(this._playButton);
        this._playButton.regX = this._playButton.w / 2;
        this._playButton.regY = this._playButton.h;
        this._playButton.visible = false;
        if (this._isPlayerClient === false) {
            DisplayClient.onConnected.add(this.DisplayClient_onConnected, this);
            if (DisplayClient.connectionState !== "Connected" /* Connected */) {
                DisplayClient.connect();
            }
            else {
                this.DisplayClient_onConnected();
            }
        }
        else {
            PlayerClient.onConnected.add(this.PlayerClient_onConnected, this);
            if (PlayerClient.connectionState !== "Connected" /* Connected */) {
                PlayerClient.connect();
            }
            else {
                this.PlayerClient_onConnected();
            }
        }
        this._playButton.input.onPointerClick.add(this.playButton_onClick, this);
        this.anchor();
        if (this._isPlayerClient === false) {
            TeamTowerDefense.instance.gameMusic.stop();
            TeamTowerDefense.instance.titleMusic.play();
        }
        _super.prototype.initialize.call(this);
    };
    TitleScreen.prototype.DisplayClient_onConnected = function () {
        DisplayClient.onConnected.remove(this.DisplayClient_onConnected, this);
        this._connectingLbl.visible = false;
        DisplayClient.onPlayerJoined.add(this.DisplayClient_onPlayerJoined, this);
        if (DisplayClient.room.numPlayers > 0)
            this.DisplayClient_onPlayerJoined();
    };
    TitleScreen.prototype.DisplayClient_onPlayerJoined = function () {
        DisplayClient.onPlayerJoined.remove(this.DisplayClient_onPlayerJoined, this);
        this.screenManager.add(new LobbyScreen());
        this.exit();
    };
    TitleScreen.prototype.PlayerClient_onConnected = function () {
        PlayerClient.onConnected.remove(this.PlayerClient_onConnected, this);
        this._connectingLbl.visible = false;
        PlayerClient.onJoinAvailable.add(this.PlayerClient_onJoinAvailable, this);
        PlayerClient.onJoinUnavailable.add(this.PlayerClient_onJoinUnavailable, this);
        PlayerClient.isJoinAvailable();
    };
    TitleScreen.prototype.PlayerClient_onJoinAvailable = function () {
        this._playButton.visible = true;
        this._gameFullLbl.visible = false;
    };
    TitleScreen.prototype.PlayerClient_onJoinUnavailable = function () {
        this._playButton.visible = false;
        this._gameFullLbl.visible = true;
    };
    TitleScreen.prototype.playButton_onClick = function () {
        this._playButton.visible = false;
        PlayerClient.onJoinApproved.add(this.PlayerClient_onJoinApproved, this);
        PlayerClient.onJoinDenied.add(this.PlayerClient_onJoinDenied, this);
        PlayerClient.requestJoin();
    };
    TitleScreen.prototype.PlayerClient_onJoinApproved = function () {
        PlayerClient.onJoinApproved.remove(this.PlayerClient_onJoinApproved, this);
        PlayerClient.onJoinDenied.remove(this.PlayerClient_onJoinDenied, this);
        PlayerClient.onJoinAvailable.remove(this.PlayerClient_onJoinAvailable, this);
        PlayerClient.onJoinUnavailable.remove(this.PlayerClient_onJoinUnavailable, this);
        this.screenManager.add(new PlayerSelectScreen());
        this.exit();
    };
    TitleScreen.prototype.PlayerClient_onJoinDenied = function () {
        PlayerClient.onJoinApproved.remove(this.PlayerClient_onJoinApproved, this);
        PlayerClient.onJoinDenied.remove(this.PlayerClient_onJoinDenied, this);
        PlayerClient.isJoinAvailable();
    };
    TitleScreen.prototype.anchor = function () {
        this._logo.x = Stage.width / 2 - this._logo.texture.width / 2;
        this._logo.y = Stage.height / 2 - this._logo.texture.height / 2;
        this._connectingLbl.x = Stage.width / 2;
        this._connectingLbl.y = Stage.height - 40;
        this._gameFullLbl.x = Stage.width / 2;
        this._gameFullLbl.y = Stage.height - 40;
        this._playButton.x = Stage.width / 2;
        this._playButton.y = Stage.height - 40;
    };
    TitleScreen.prototype.update = function (elapsed) {
        this.anchor();
        _super.prototype.update.call(this, elapsed);
    };
    return TitleScreen;
}(GameScreen));
/** @file TeamTowerDefense.ts */
/// <reference path="../defs/AirConsole.d.ts" />
/// <reference path="../framework/Game.ts" />
/// <reference path="../../assets/Assets.generated.ts" />
/// <reference path="controls/ControlPad.ts" />
/// <reference path="controls/LocalControlPad.ts" />
/// <reference path="model/GameState.ts" />
/// <reference path="client/display/DisplayClient.ts" />
/// <reference path="client/player/PlayerClient.ts" />
/// <reference path="screens/MinigameLoggingScreen.ts" />
/// <reference path="screens/MinigameBuildingScreen.ts" />
/// <reference path="screens/TitleScreen.ts" />
var TeamTowerDefense = /** @class */ (function (_super) {
    __extends(TeamTowerDefense, _super);
    function TeamTowerDefense(isPlayerClient, isLocalTest) {
        var _this = this;
        // Configure engine for client type
        if (isPlayerClient) {
            // Don't letterbox on clients
            Stage.letterbox = false;
            Stage.dirty = true;
        }
        //Assets.sounds.Arrow_Shot.volume = 0.8;
        // Initialize
        _this = _super.call(this) || this;
        TeamTowerDefense.instance = _this;
        // Initialize Clients
        _this.isPlayerClient = isPlayerClient;
        _this.isLocalTest = isLocalTest;
        return _this;
    }
    TeamTowerDefense.prototype.start = function () {
        Assets.sounds.Gameplay_Loop.isLooped = true;
        Assets.sounds.Charachter_select_loop.isLooped = true;
        if (this.isLocalTest)
            new LocalControlPad();
        this.titleMusic = new Sound(Assets.sounds.Charachter_select_loop);
        this.gameMusic = new Sound(Assets.sounds.Gameplay_Loop);
        // Setup screen manager
        this.screenManager = new GameScreenManager();
        // Setup stage
        Stage.root.addChild(this.screenManager.display);
        // Add screen
        //this.screenManager.add(new TitleScreen(this.isPlayerClient, this.isLocalTest));
        if (this.isLocalTest) {
            this.screenManager.add(new ScreenGameplayScreen());
            //this.screenManager.add(new MinigameBuildingScreen(0));
            //this.screenManager.add(new MinigameLoggingScreen(0));
            //this.screenManager.add(new PlayerGameplayScreen());
        }
        else {
            this.screenManager.add(new TitleScreen(this.isPlayerClient, this.isLocalTest));
        }
        // Start ticking
        _super.prototype.start.call(this);
    };
    TeamTowerDefense.prototype.update = function (elapsed) {
        if (this.isLocalTest) {
            ControlPad.array[0].poll();
        }
        else {
            if (this.isPlayerClient) {
                PlayerClient.update();
            }
        }
        this.screenManager.update(elapsed);
    };
    TeamTowerDefense.prototype.draw = function () {
        this.screenManager.draw();
    };
    return TeamTowerDefense;
}(Game));
/** @file main.ts */
/// <reference path="game/TeamTowerDefense.ts" />
navigator.vibrate = (navigator.vibrate ||
    navigator.webkitVibrate ||
    navigator.mozVibrate ||
    navigator.msVibrate);
function main() {
    AssetManager.onProgress.add(function () {
        //console.log(AssetManager.progress);
    }, null);
    AssetManager.onLoaded.add(function () {
        //console.log("loaded");
        setTimeout(function () {
            //console.log(Assets);
            new TeamTowerDefense(window.isPlayerClient, window.isLocalTest).start();
        }, 100);
    }, null);
    AssetManager.load();
}
setTimeout(main, 100);
