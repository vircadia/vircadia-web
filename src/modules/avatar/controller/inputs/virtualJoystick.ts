//
//  virtualJoystick.ts
//
//  This is a modified version of Babylon's built-in virtual joystick.
//  I couldn't make this a simple extension of Babylon's virtual joystick
//  because I needed to change some of the functions of the constructor and some of the private properties.
//  The main change comes from using touch events instead of pointer events.
//
//  The original implementation is mainly based on these two articles:
//  - Creating an universal virtual touch joystick working for all Touch models thanks to Hand.JS:
//    http://blogs.msdn.com/b/davrous/archive/2013/02/22/creating-an-universal-virtual-touch-joystick-working-for-all-touch-models-thanks-to-hand-js.aspx
//  - Seb Lee-Delisle's original work:
//    http://seb.ly/2011/04/multi-touch-game-controller-in-javascripthtml5-for-ipad/
//
//  Original created by the Babylon JS team.
//  This implementation created by Giga on 9 Oct 2023.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { JoystickAxis, Vector3, Vector2, StringDictionary } from "@babylonjs/core";
import { Renderer } from "@Modules/scene";

class BasicPointerPosition {
    x;
    y;
    prevX;
    prevY;

    constructor(x: number, y: number, prevX: number, prevY: number) {
        this.x = x;
        this.y = y;
        this.prevX = prevX;
        this.prevY = prevY;
    }
}

/**
 * The different customization options available for the VirtualJoystick.
 */
interface VirtualJoystickCustomizations {
    /**
     * Size of the joystick's puck.
     */
    puckSize: number;
    /**
     * Size of the joystick's container.
     */
    containerSize: number;
    /**
     * Color of the joystick and puck.
     */
    color: string;
    /**
     * Image URL for the joystick's puck.
     */
    puckImage?: string;
    /**
     * Image URL for the joystick's container
     */
    containerImage?: string;
    /**
     * The fixed position of the joystick container.
     */
    position?: { x: number; y: number };
    /**
     * Whether or not the joystick container is always visible.
     */
    alwaysVisible: boolean;
    /**
     * Whether or not to limit the movement of the puck to the joystick's container.
     */
    limitToContainer: boolean;
}

/**
 * A virtual joystick input (used by touch devices).
 */
export class VirtualJoystick {
    /**
     * A boolean indicating that left and right values must be inverted.
     */
    public reverseLeftRight: boolean;
    /**
     * A boolean indicating that up and down values must be inverted.
     */
    public reverseUpDown: boolean;
    /**
     * The change in the joystick's position.
     */
    public deltaPosition: Vector3;
    /**
     * A boolean indicating that the virtual joystick is being pressed.
     */
    public pressed: boolean;
    /**
     * Canvas the virtual joystick will render onto. By default, the z-index of this will be set to 5.
     */
    public static Canvas: Nullable<HTMLCanvasElement>;

    /**
     * A boolean indicating whether or not the joystick's puck's movement should be limited to the its container area.
     */
    public limitToContainer: boolean;

    // Used to draw the virtual joystick inside a 2D canvas on top of the WebGL rendering canvas.
    private static _GlobalJoystickIndex = 0;
    private static _AlwaysVisibleSticks = 0;
    private static _VJCanvasContext: CanvasRenderingContext2D;
    private static _VJCanvasWidth: number;
    private static _VJCanvasHeight: number;
    private static _HalfWidth: number;
    private static _GetDefaultOptions(): VirtualJoystickCustomizations {
        return {
            puckSize: 40,
            containerSize: 60,
            color: "cyan",
            puckImage: undefined,
            containerImage: undefined,
            position: undefined,
            alwaysVisible: false,
            limitToContainer: false
        };
    }

    private _action: (() => void) | undefined;
    private _axisTargetedByLeftAndRight: JoystickAxis;
    private _axisTargetedByUpAndDown: JoystickAxis;
    private _joystickSensibility: number;
    private _joystickSensibilityFactor: number;
    private _inverseSensibility: number;
    private _joystickTouchId: string; // TODO: Determine what this property was meant to do in Babylon's original implementation.
    private _joystickColor: string;
    private _joystickTouchPosition: Vector2;
    private _joystickPreviousTouchPosition: Vector2;
    private _joystickPointerStartPos: Vector2;
    private _deltaJoystickVector: Vector2;
    private _leftJoystick: boolean;
    private _touches = new StringDictionary<BasicPointerPosition | TouchEvent>();
    private _joystickPosition: Nullable<Vector2>;
    private _alwaysVisible = false;
    private _puckImage: HTMLImageElement | undefined;
    private _containerImage: HTMLImageElement | undefined;
    private _released = false;

    private _joystickPuckSize = VirtualJoystick._GetDefaultOptions().puckSize;
    private _joystickContainerSize = VirtualJoystick._GetDefaultOptions().containerSize;
    private _clearPuckSize = VirtualJoystick._GetDefaultOptions().puckSize;
    private _clearContainerSize = VirtualJoystick._GetDefaultOptions().containerSize;
    private _clearPuckSizeOffset = 0;
    private _clearContainerSizeOffset = 0;

    private _onTouchStartHandlerRef: (e: TouchEvent) => void;
    private _onTouchMoveHandlerRef: (e: TouchEvent) => void;
    private _onTouchEndHandlerRef: (e: TouchEvent) => void;
    private _onContextHandlerRef: (e: MouseEvent) => void;
    private _onResize: (e: UIEvent) => void;

    /**
     * Creates a new virtual joystick.
     * @param leftJoystick Defines that the joystick is for left hand (false by default)
     * @param customizations Defines the options used to customize the joystick.
     */
    constructor(leftJoystick?: boolean, customizations?: Partial<VirtualJoystickCustomizations>) {
        const options = {
            ...VirtualJoystick._GetDefaultOptions(),
            ...customizations
        };

        this._leftJoystick = Boolean(leftJoystick);

        VirtualJoystick._GlobalJoystickIndex += 1;

        // By default, the left & right arrow keys move on the X axis.
        // Up & down keys move on the Y axis.
        this._axisTargetedByLeftAndRight = JoystickAxis.X;
        this._axisTargetedByUpAndDown = JoystickAxis.Y;
        this.reverseLeftRight = false;
        this.reverseUpDown = false;

        this.deltaPosition = Vector3.Zero();

        this._joystickSensibility = 25;
        this._joystickSensibilityFactor = 1000;
        this._inverseSensibility = 1 / (this._joystickSensibility / this._joystickSensibilityFactor);

        this._onResize = () => {
            VirtualJoystick._VJCanvasWidth = window.innerWidth;
            VirtualJoystick._VJCanvasHeight = window.innerHeight;
            if (VirtualJoystick.Canvas) {
                VirtualJoystick.Canvas.width = VirtualJoystick._VJCanvasWidth;
                VirtualJoystick.Canvas.height = VirtualJoystick._VJCanvasHeight;
            }
            VirtualJoystick._HalfWidth = VirtualJoystick._VJCanvasWidth / 2;
        };

        // Inject a canvas element on top of the game's canvas.
        if (!VirtualJoystick.Canvas) {
            window.addEventListener("resize", this._onResize, false);
            VirtualJoystick.Canvas = document.createElement("canvas");
            VirtualJoystick._VJCanvasWidth = window.innerWidth;
            VirtualJoystick._VJCanvasHeight = window.innerHeight;
            VirtualJoystick.Canvas.width = window.innerWidth;
            VirtualJoystick.Canvas.height = window.innerHeight;
            VirtualJoystick.Canvas.style.width = "100%";
            VirtualJoystick.Canvas.style.height = "100%";
            VirtualJoystick.Canvas.style.position = "absolute";
            VirtualJoystick.Canvas.style.backgroundColor = "transparent";
            VirtualJoystick.Canvas.style.top = "0px";
            VirtualJoystick.Canvas.style.left = "0px";
            VirtualJoystick.Canvas.style.zIndex = "5";
            VirtualJoystick.Canvas.style.pointerEvents = "none";
            VirtualJoystick.Canvas.style.touchAction = "none";
            const context = VirtualJoystick.Canvas.getContext("2d");

            if (!context) {
                throw new Error("Unable to create canvas for virtual joystick");
            }

            VirtualJoystick._VJCanvasContext = context;
            VirtualJoystick._VJCanvasContext.strokeStyle = "#ffffff";
            VirtualJoystick._VJCanvasContext.lineWidth = 2;
            document.body.appendChild(VirtualJoystick.Canvas);
        }
        VirtualJoystick._HalfWidth = VirtualJoystick.Canvas.width / 2;
        this.pressed = false;
        this.limitToContainer = options.limitToContainer;

        // default joystick color
        this._joystickColor = options.color;

        // default joystick size
        this.containerSize = options.containerSize;
        this.puckSize = options.puckSize;

        if (options.position) {
            this.setPosition(options.position.x, options.position.y);
        }
        if (options.puckImage) {
            this.setPuckImage(options.puckImage);
        }
        if (options.containerImage) {
            this.setContainerImage(options.containerImage);
        }
        if (options.alwaysVisible) {
            VirtualJoystick._AlwaysVisibleSticks += 1;
        }

        // This must come after the position is potentially set.
        this.alwaysVisible = options.alwaysVisible;

        this._joystickTouchId = "-1";
        // Current joystick position.
        this._joystickTouchPosition = new Vector2(0, 0);
        this._joystickPreviousTouchPosition = new Vector2(0, 0);
        // Origin joystick position.
        this._joystickPointerStartPos = new Vector2(0, 0);
        this._deltaJoystickVector = new Vector2(0, 0);

        this._onTouchStartHandlerRef = (event) => {
            this._onTouchStart(event);
        };
        this._onTouchMoveHandlerRef = (event) => {
            this._onTouchMove(event);
        };
        this._onTouchEndHandlerRef = () => {
            this._onTouchEnd();
        };
        this._onContextHandlerRef = (event) => {
            event.preventDefault(); // Disables the context menu.
        };

        const element = Renderer.engine?.getInputElement();
        element?.addEventListener("touchstart", this._onTouchStartHandlerRef, false);
        element?.addEventListener("touchmove", this._onTouchMoveHandlerRef, false);
        element?.addEventListener("touchend", this._onTouchEndHandlerRef, false);
        element?.addEventListener("touchcancel", this._onTouchEndHandlerRef, false);
        element?.addEventListener("contextmenu", this._onContextHandlerRef, true);
        requestAnimationFrame(() => {
            this._drawVirtualJoystick();
        });
    }

    /**
     * Defines joystick sensibility (ie. the ratio between a physical move and virtual joystick position change).
     * @param newJoystickSensibility The new sensibility.
     */
    public setJoystickSensibility(newJoystickSensibility: number): void {
        this._joystickSensibility = newJoystickSensibility;
        this._inverseSensibility = 1 / (this._joystickSensibility / this._joystickSensibilityFactor);
    }

    private _onTouchStart(event: TouchEvent) {
        event.preventDefault();
        let positionOnScreenCondition = false;
        const touch = event.touches[0];

        if (this._leftJoystick === true) {
            positionOnScreenCondition = touch.clientX < VirtualJoystick._HalfWidth;
        } else {
            positionOnScreenCondition = touch.clientX > VirtualJoystick._HalfWidth;
        }

        if (positionOnScreenCondition && this._joystickTouchId !== "1") {
            // First contact will be dedicated to the virtual joystick
            this._joystickTouchId = "1";

            if (this._joystickPosition) {
                this._joystickPointerStartPos = this._joystickPosition.clone();
                this._joystickTouchPosition = this._joystickPosition.clone();
                this._joystickPreviousTouchPosition = this._joystickPosition.clone();

                // in case the user only clicks down && doesn't move:
                // this ensures the delta is properly set
                this._onTouchMove(event);
            } else {
                this._joystickPointerStartPos.x = touch.clientX;
                this._joystickPointerStartPos.y = touch.clientY;
                this._joystickTouchPosition = this._joystickPointerStartPos.clone();
                this._joystickPreviousTouchPosition = this._joystickPointerStartPos.clone();
            }

            this._deltaJoystickVector.x = 0;
            this._deltaJoystickVector.y = 0;
            this.pressed = true;
            this._touches.add("1", event);
        } else if (VirtualJoystick._GlobalJoystickIndex < 2 && this._action) { // You can only trigger the action buttons with a joystick declared
            this._action();
            this._touches.add("1", new BasicPointerPosition(touch.clientX, touch.clientY, touch.clientX, touch.clientY));
        }
    }

    private _onTouchMove(e: TouchEvent) {
        const touch = e.touches[0];
        // If the current touch is the one associated with the joystick (first touch contact).
        if (this._joystickTouchId === "1") {
            if (this.limitToContainer) {
                const vector = new Vector2(touch.clientX - this._joystickPointerStartPos.x, touch.clientY - this._joystickPointerStartPos.y);
                const distance = vector.length();
                if (distance > this.containerSize) {
                    vector.scaleInPlace(this.containerSize / distance);
                }
                this._joystickTouchPosition.x = this._joystickPointerStartPos.x + vector.x;
                this._joystickTouchPosition.y = this._joystickPointerStartPos.y + vector.y;
            } else {
                this._joystickTouchPosition.x = touch.clientX;
                this._joystickTouchPosition.y = touch.clientY;
            }

            // Create the delta vector.
            this._deltaJoystickVector = this._joystickTouchPosition.clone();
            this._deltaJoystickVector = this._deltaJoystickVector.subtract(this._joystickPointerStartPos);

            // When a joystick is always visible, there will be clipping issues if
            // you drag the puck from one over the container of the other.
            if (VirtualJoystick._AlwaysVisibleSticks > 0) {
                if (this._leftJoystick) {
                    this._joystickTouchPosition.x = Math.min(VirtualJoystick._HalfWidth, this._joystickTouchPosition.x);
                } else {
                    this._joystickTouchPosition.x = Math.max(VirtualJoystick._HalfWidth, this._joystickTouchPosition.x);
                }
            }

            const directionLeftRight = this.reverseLeftRight ? -1 : 1;
            const deltaJoystickX = directionLeftRight * this._deltaJoystickVector.x / this._inverseSensibility;
            switch (this._axisTargetedByLeftAndRight) {
                case JoystickAxis.X:
                    this.deltaPosition.x = Math.min(1, Math.max(-1, deltaJoystickX));
                    break;
                case JoystickAxis.Y:
                    this.deltaPosition.y = Math.min(1, Math.max(-1, deltaJoystickX));
                    break;
                case JoystickAxis.Z:
                    this.deltaPosition.z = Math.min(1, Math.max(-1, deltaJoystickX));
                    break;
                default:
                    break;
            }
            const directionUpDown = this.reverseUpDown ? 1 : -1;
            const deltaJoystickY = directionUpDown * this._deltaJoystickVector.y / this._inverseSensibility;
            switch (this._axisTargetedByUpAndDown) {
                case JoystickAxis.X:
                    this.deltaPosition.x = Math.min(1, Math.max(-1, deltaJoystickY));
                    break;
                case JoystickAxis.Y:
                    this.deltaPosition.y = Math.min(1, Math.max(-1, deltaJoystickY));
                    break;
                case JoystickAxis.Z:
                    this.deltaPosition.z = Math.min(1, Math.max(-1, deltaJoystickY));
                    break;
                default:
                    break;
            }
        } else {
            const data = this._touches.get("1");
            if (data instanceof BasicPointerPosition) {
                data.x = touch.clientX;
                data.y = touch.clientY;
            }
        }
    }

    private _onTouchEnd() {
        if (this._joystickTouchId === "1") {
            this._clearPreviousDraw();

            this._joystickTouchId = "-1";
            this.pressed = false;
        } else {
            const touch = this._touches.get("1");
            if (touch instanceof BasicPointerPosition) {
                VirtualJoystick._VJCanvasContext.clearRect(touch.prevX - 44, touch.prevY - 44, 88, 88);
            }
        }
        this._deltaJoystickVector.x = 0;
        this._deltaJoystickVector.y = 0;

        this._touches.remove("1");
    }

    /**
     * Change the color of the virtual joystick.
     * @param newColor A string that must be a CSS color value (like "red") or a hex value (like "#FF0000").
     */
    public setJoystickColor(newColor: string) {
        this._joystickColor = newColor;
    }

    /**
     * Size of the joystick's container.
     */
    public set containerSize(newSize: number) {
        this._joystickContainerSize = newSize;
        this._clearContainerSize = ~~(this._joystickContainerSize * 2.1);
        this._clearContainerSizeOffset = ~~(this._clearContainerSize / 2);
    }

    public get containerSize() {
        return this._joystickContainerSize;
    }

    /**
     * Size of the joystick's puck.
     */
    public set puckSize(newSize: number) {
        this._joystickPuckSize = newSize;
        this._clearPuckSize = ~~(this._joystickPuckSize * 2.1);
        this._clearPuckSizeOffset = ~~(this._clearPuckSize / 2);
    }

    public get puckSize() {
        return this._joystickPuckSize;
    }

    /**
     * Clears the set position of the joystick.
     */
    public clearPosition() {
        this.alwaysVisible = false;

        this._joystickPosition = null;
    }

    /**
     * Whether or not the joystick container is always visible.
     */
    public set alwaysVisible(value: boolean) {
        if (this._alwaysVisible === value) {
            return;
        }

        if (value && this._joystickPosition) {
            VirtualJoystick._AlwaysVisibleSticks += 1;

            this._alwaysVisible = true;
        } else {
            VirtualJoystick._AlwaysVisibleSticks -= 1;

            this._alwaysVisible = false;
        }
    }

    public get alwaysVisible() {
        return this._alwaysVisible;
    }

    /**
     * Sets the constant position of the Joystick container.
     * @param x X axis coordinate.
     * @param y Y axis coordinate.
     */
    public setPosition(x: number, y: number) {
        // In case position is moved while the container is visible, clear any previous position.
        if (this._joystickPointerStartPos) {
            this._clearPreviousDraw();
        }
        this._joystickPosition = new Vector2(x, y);
    }

    /**
     * Defines a callback to call when the joystick is touched.
     * @param action The callback.
     */
    public setActionOnTouch(action: () => void) {
        this._action = action;
    }

    /**
     * Defines which axis you'd like to control left & right.
     * @param axis The axis to use.
     */
    public setAxisForLeftRight(axis: JoystickAxis) {
        switch (axis) {
            case JoystickAxis.X:
            case JoystickAxis.Y:
            case JoystickAxis.Z:
                this._axisTargetedByLeftAndRight = axis;
                break;
            default:
                this._axisTargetedByLeftAndRight = JoystickAxis.X;
                break;
        }
    }

    /**
     * Defines which axis you'd like to control up & down.
     * @param axis The axis to use.
     */
    public setAxisForUpDown(axis: JoystickAxis) {
        switch (axis) {
            case JoystickAxis.X:
            case JoystickAxis.Y:
            case JoystickAxis.Z:
                this._axisTargetedByUpAndDown = axis;
                break;
            default:
                this._axisTargetedByUpAndDown = JoystickAxis.Y;
                break;
        }
    }

    /**
     * Clears the canvas from the previous puck / container draw.
     */
    private _clearPreviousDraw() {
        const jp = this._joystickPosition || this._joystickPointerStartPos;

        // clear container pixels
        VirtualJoystick._VJCanvasContext.clearRect(
            jp.x - this._clearContainerSizeOffset,
            jp.y - this._clearContainerSizeOffset,
            this._clearContainerSize,
            this._clearContainerSize
        );

        // clear puck pixels + 1 pixel for the change made before it moved
        VirtualJoystick._VJCanvasContext.clearRect(
            this._joystickPreviousTouchPosition.x - this._clearPuckSizeOffset - 1,
            this._joystickPreviousTouchPosition.y - this._clearPuckSizeOffset - 1,
            this._clearPuckSize + 2,
            this._clearPuckSize + 2
        );
    }

    /**
     * Loads the URL to be used for the container's image.
     * @param url The URL of the image to use.
     */
    public setContainerImage(url: string) {
        const image = new Image();
        image.src = url;

        image.onload = () => {
            this._containerImage = image;
        };
    }

    /**
     * Loads the URL to be used for the puck's image.
     * @param url The URL of the image to use.
     */
    public setPuckImage(url: string) {
        const image = new Image();
        image.src = url;

        image.onload = () => {
            this._puckImage = image;
        };
    }

    /**
     * Draws the Virtual Joystick's container.
     */
    private _drawContainer() {
        const jp = this._joystickPosition || this._joystickPointerStartPos;

        this._clearPreviousDraw();

        if (this._containerImage) {
            VirtualJoystick._VJCanvasContext.drawImage(
                this._containerImage,
                jp.x - this.containerSize,
                jp.y - this.containerSize,
                this.containerSize * 2,
                this.containerSize * 2
            );
        } else {
            // Outer container.
            VirtualJoystick._VJCanvasContext.beginPath();
            VirtualJoystick._VJCanvasContext.strokeStyle = this._joystickColor;
            VirtualJoystick._VJCanvasContext.lineWidth = 2;
            VirtualJoystick._VJCanvasContext.arc(jp.x, jp.y, this.containerSize, 0, Math.PI * 2, true);
            VirtualJoystick._VJCanvasContext.stroke();
            VirtualJoystick._VJCanvasContext.closePath();

            // Inner container.
            VirtualJoystick._VJCanvasContext.beginPath();
            VirtualJoystick._VJCanvasContext.lineWidth = 6;
            VirtualJoystick._VJCanvasContext.strokeStyle = this._joystickColor;
            VirtualJoystick._VJCanvasContext.arc(jp.x, jp.y, this.puckSize, 0, Math.PI * 2, true);
            VirtualJoystick._VJCanvasContext.stroke();
            VirtualJoystick._VJCanvasContext.closePath();
        }
    }

    /**
     * Draws the Virtual Joystick's puck.
     */
    private _drawPuck() {
        if (this._puckImage) {
            VirtualJoystick._VJCanvasContext.drawImage(
                this._puckImage,
                this._joystickTouchPosition.x - this.puckSize,
                this._joystickTouchPosition.y - this.puckSize,
                this.puckSize * 2,
                this.puckSize * 2
            );
        } else {
            VirtualJoystick._VJCanvasContext.beginPath();
            VirtualJoystick._VJCanvasContext.strokeStyle = this._joystickColor;
            VirtualJoystick._VJCanvasContext.lineWidth = 2;
            VirtualJoystick._VJCanvasContext.arc(this._joystickTouchPosition.x, this._joystickTouchPosition.y, this.puckSize, 0, Math.PI * 2, true);
            VirtualJoystick._VJCanvasContext.stroke();
            VirtualJoystick._VJCanvasContext.closePath();
        }
    }

    private _drawVirtualJoystick() {
        // Don't continue iterating if the canvas has been released.
        if (this._released) {
            return;
        }
        if (this.alwaysVisible) {
            this._drawContainer();
        }

        if (this.pressed) {
            this._touches.forEach((key, touch) => {
                if (touch instanceof TouchEvent && this._joystickTouchId === "1") {
                    if (!this.alwaysVisible) {
                        this._drawContainer();
                    }

                    this._drawPuck();

                    // Store the current touch position for the next clear.
                    this._joystickPreviousTouchPosition = this._joystickTouchPosition.clone();
                } else if (touch instanceof BasicPointerPosition) {
                    VirtualJoystick._VJCanvasContext.clearRect(touch.prevX - 44, touch.prevY - 44, 88, 88);
                    VirtualJoystick._VJCanvasContext.beginPath();
                    VirtualJoystick._VJCanvasContext.fillStyle = "white";
                    VirtualJoystick._VJCanvasContext.beginPath();
                    VirtualJoystick._VJCanvasContext.strokeStyle = "red";
                    VirtualJoystick._VJCanvasContext.lineWidth = 6;
                    VirtualJoystick._VJCanvasContext.arc(touch.x, touch.y, 40, 0, Math.PI * 2, true);
                    VirtualJoystick._VJCanvasContext.stroke();
                    VirtualJoystick._VJCanvasContext.closePath();
                    touch.prevX = touch.x;
                    touch.prevY = touch.y;
                }
            });
        }
        requestAnimationFrame(() => {
            this._drawVirtualJoystick();
        });
    }

    /**
     * Release the internal HTML canvas.
     */
    public releaseCanvas() {
        if (VirtualJoystick.Canvas) {
            VirtualJoystick.Canvas.removeEventListener("touchstart", this._onTouchStartHandlerRef, false);
            VirtualJoystick.Canvas.removeEventListener("touchmove", this._onTouchMoveHandlerRef, false);
            VirtualJoystick.Canvas.removeEventListener("touchend", this._onTouchEndHandlerRef, false);
            VirtualJoystick.Canvas.removeEventListener("touchcancel", this._onTouchEndHandlerRef, false);
            VirtualJoystick.Canvas.removeEventListener("contextmenu", this._onContextHandlerRef, true);
            window.removeEventListener("resize", this._onResize);
            document.body.removeChild(VirtualJoystick.Canvas);
            VirtualJoystick.Canvas = null;
        }
        this._released = true;
    }
}
