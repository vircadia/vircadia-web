//
//  css3DRenderer.ts
//
//  Created by Nolan Huang on 3 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Matrix, Camera, Vector3, Quaternion, AbstractMesh, Scene, Observable } from "@babylonjs/core";
import { Renderer } from "./renderer";

export type Size = {
    width: number,
    height: number
};

export class CSS3DObject {
    private _renderer: CSS3DRenderer;
    private _mesh: AbstractMesh;
    private _element: HTMLElement;
    private _canGetFocus = true;
    private _isFocused = false;
    private _onPickedObservale: Observable<CSS3DObject> = new Observable<CSS3DObject>();
    private _onFocusChangedObservale: Observable<boolean> = new Observable<boolean>();

    constructor(element: HTMLElement, mesh: AbstractMesh) {
        this._element = element;
        this._element.style.position = "absolute";
        this._element.style.pointerEvents = "auto";

        this._mesh = mesh;
        this._mesh.onDisposeObservable.add(() => {
            this._renderer.removeCSS3DObject(this);
        });

        this._renderer = Renderer.getScene().css3DRenderer as CSS3DRenderer;
        this._renderer.addCSS3DObject(this);

        this._element.addEventListener("mouseout", () => {
            this._renderer.detachControl();
        });
    }

    public get mesh(): AbstractMesh {
        return this._mesh;
    }

    public get element(): HTMLElement {
        return this._element;
    }

    public get onFocusChangedObservale(): Observable<boolean> {
        return this._onFocusChangedObservale;
    }

    public get onPickedObservale(): Observable<CSS3DObject> {
        return this._onPickedObservale;
    }

    public setFocus(focus: boolean): void {
        if (this._isFocused !== focus) {
            this._isFocused = focus;
            this._onFocusChangedObservale.notifyObservers(focus);
        }
    }

    public setPicked(): void {
        this._onPickedObservale.notifyObservers(this);
    }

    public get canGetFocus(): boolean {
        return this._canGetFocus;
    }

    public set canGetFocus(value: boolean) {
        this._canGetFocus = value;
    }
}

export class CSS3DRenderer {
    private _canvas: HTMLCanvasElement;
    private _scene: Nullable<Scene> = null;
    private _isAttachControl = false;

    _css3DObjects: Map<string, CSS3DObject> = new Map<string, CSS3DObject>();
    _pickedOjbect: Nullable<CSS3DObject> = null;

    _cache = {
        camera: { fov: 0, style: "" },
        objects: new WeakMap()
    };

    _domElement: HTMLElement;
    _cameraElement: HTMLElement;

    _width = 0;
    _height = 0;
    _widthHalf = 0;
    _heightHalf = 0;
    _isIE = false;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        const existingRenderer = document.getElementById("web-entity-container");
        if (existingRenderer) {
            existingRenderer.remove();
        }
        const container = document.createElement("div");
        container.id = "web-entity-container";
        container.style.position = "absolute";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.zIndex = "0";
        container.style.overflow = "hidden";

        const canvasZone = canvas.parentElement as HTMLElement;
        canvasZone.insertBefore(container, canvasZone.firstChild);

        const domElement = document.createElement("div");
        domElement.style.overflow = "hidden";

        this._domElement = domElement;
        this._cameraElement = document.createElement("div");
        this._cameraElement.style.transformStyle = "preserve-3d";
        this._cameraElement.style.pointerEvents = "none";

        domElement.appendChild(this._cameraElement);

        container.appendChild(domElement);

        this.setSize(canvasZone.offsetWidth, canvasZone.offsetHeight);

        window.addEventListener("resize", () => {
            this.setSize(canvasZone.offsetWidth, canvasZone.offsetHeight);
        });

        window.addEventListener("pointerdown", this._handlePointDown.bind(this));
    }

    public get scene(): Nullable<Scene> {
        return this._scene;
    }

    public set scene(value: Nullable<Scene>) {
        this._scene = value;
    }

    getSize(): Size {
        return {
            width: this._width,
            height: this._height
        };
    }

    setSize(width: number, height: number): void {
        this._width = width;
        this._height = height;
        this._widthHalf = this._width / 2;
        this._heightHalf = this._height / 2;

        // Double the size of the _domElement so that it can contain WEs with double pixel-density.
        // TODO: Make this a setting that can be adjusted when the web entity is created/modified in the world editor.
        this._domElement.style.width = `${width * 2}px`;
        this._domElement.style.height = `${height * 2}px`;
        this._domElement.style.transform = `translate(-25%, -25%)`;
        this._domElement.style.transformOrigin = `0% 0%`;

        this._cameraElement.style.width = `${width}px`;
        this._cameraElement.style.height = `${height}px`;
    }

    // eslint-disable-next-line class-methods-use-this
    epsilon(value: number): number {
        return Math.abs(value) < 1e-10 ? 0 : value;
    }

    getCameraCSSMatrix(matrix: Matrix): string {
        const elements = matrix.m;

        return "matrix3d("
            + this.epsilon(elements[0]).toString() + ","
            + this.epsilon(-elements[1]).toString() + ","
            + this.epsilon(elements[2]).toString() + ","
            + this.epsilon(elements[3]).toString() + ","
            + this.epsilon(elements[4]).toString() + ","
            + this.epsilon(-elements[5]).toString() + ","
            + this.epsilon(elements[6]).toString() + ","
            + this.epsilon(elements[7]).toString() + ","
            + this.epsilon(elements[8]).toString() + ","
            + this.epsilon(-elements[9]).toString() + ","
            + this.epsilon(elements[10]).toString() + ","
            + this.epsilon(elements[11]).toString() + ","
            + this.epsilon(elements[12]).toString() + ","
            + this.epsilon(-elements[13]).toString() + ","
            + this.epsilon(elements[14]).toString() + ","
            + this.epsilon(elements[15]).toString()
            + ")";
    }

    getObjectCSSMatrix(matrix: Matrix, cameraCSSMatrix: string): string {
        const elements = matrix.m;
        const matrix3d = "matrix3d("
            + this.epsilon(elements[0]).toString() + ","
            + this.epsilon(elements[1]).toString() + ","
            + this.epsilon(elements[2]).toString() + ","
            + this.epsilon(elements[3]).toString() + ","
            + this.epsilon(-elements[4]).toString() + ","
            + this.epsilon(-elements[5]).toString() + ","
            + this.epsilon(-elements[6]).toString() + ","
            + this.epsilon(-elements[7]).toString() + ","
            + this.epsilon(elements[8]).toString() + ","
            + this.epsilon(elements[9]).toString() + ","
            + this.epsilon(elements[10]).toString() + ","
            + this.epsilon(elements[11]).toString() + ","
            + this.epsilon(elements[12]).toString() + ","
            + this.epsilon(elements[13]).toString() + ","
            + this.epsilon(elements[14]).toString() + ","
            + this.epsilon(elements[15]).toString()
            + ")";
        if (this._isIE) {
            return "translate(-50%,-50%)"
                + "translate(" + this._widthHalf.toString() + "px," + this._heightHalf.toString() + "px)"
                + cameraCSSMatrix
                + matrix3d;
        }
        return "translate(-50%,-50%)" + matrix3d;
    }

    renderObject(object: CSS3DObject, camera: Camera, cameraCSSMatrix: string): void {
        const position = new Vector3();
        const rotation = new Quaternion();
        const scale = new Vector3();

        object.mesh.getWorldMatrix().decompose(scale, rotation, position);
        rotation.x = -rotation.x;
        rotation.y = -rotation.y;

        let objectWorldMatrix = Matrix.Compose(scale, rotation, position);
        const innerMatrix = new Array<number>(16);
        objectWorldMatrix.copyToArray(innerMatrix);

        const camMatrix = camera.getWorldMatrix();

        // Set scaling.
        const width = Math.abs(object.mesh.scaling.x) * 2;
        const height = Math.abs(object.mesh.scaling.y) * 2;

        innerMatrix[0] *= 0.01 / width;
        innerMatrix[2] *= 0.01 / width;
        innerMatrix[5] *= 0.01 / height;
        innerMatrix[1] *= 0.01 / width;
        innerMatrix[6] *= 0.01 / height;
        innerMatrix[4] *= 0.01 / height;

        // Set position from camera.
        innerMatrix[12] = -camMatrix.m[12] + position.x;
        innerMatrix[13] = -camMatrix.m[13] + position.y;
        innerMatrix[14] = camMatrix.m[14] - position.z;
        innerMatrix[15] = camMatrix.m[15] * 0.00001;

        objectWorldMatrix = Matrix.FromArray(innerMatrix);
        objectWorldMatrix = objectWorldMatrix.scale(100);
        const style = this.getObjectCSSMatrix(objectWorldMatrix, cameraCSSMatrix);
        const element = object.element;
        if (element.style.transform !== style) {
            element.style.transform = style;
        }
    }

    render(camera: Camera): void {
        const projectionMatrix = camera.getProjectionMatrix();
        const fov = projectionMatrix.m[5] * this._heightHalf;

        if (this._cache.camera.fov !== fov) {
            if (camera.mode === Camera.PERSPECTIVE_CAMERA) {
                this._domElement.style.perspective = fov.toString() + "px";
            } else {
                this._domElement.style.perspective = "";
            }
            this._cache.camera.fov = fov;
        }

        if (camera.parent === null) {
            camera.computeWorldMatrix();
        }

        let matrixWorld = camera.getWorldMatrix().clone();
        const rotation = matrixWorld.clone().getRotationMatrix()
            .transpose();

        const innerMatrix = new Array<number>(16);
        matrixWorld.copyToArray(innerMatrix);

        innerMatrix[1] = rotation.m[1];
        innerMatrix[2] = -rotation.m[2];
        innerMatrix[4] = -rotation.m[4];
        innerMatrix[6] = -rotation.m[6];
        innerMatrix[8] = -rotation.m[8];
        innerMatrix[9] = -rotation.m[9];

        matrixWorld = Matrix.FromArray(innerMatrix);
        // Toggle the CSS3D matrix to the right-handed system.
        matrixWorld.toggleModelMatrixHandInPlace();
        matrixWorld.toggleProjectionMatrixHandInPlace();

        const cameraCSSMatrix = "translateZ(" + fov.toString() + "px)" + this.getCameraCSSMatrix(matrixWorld);

        const style = cameraCSSMatrix + "translate(" + this._widthHalf.toString() + "px," + this._heightHalf.toString() + "px)";

        if (this._cache.camera.style !== style && !this._isIE) {
            this._cameraElement.style.transform = style;
            this._cache.camera.style = style;
        }

        this._css3DObjects.forEach((css3DObject) => {
            this.renderObject(css3DObject, camera, cameraCSSMatrix);
        });
    }

    public addCSS3DObject(object: CSS3DObject): void {
        if (object.element.parentNode !== this._cameraElement) {
            this._cameraElement.appendChild(object.element);
        }

        this._css3DObjects.set(object.mesh.id, object);
    }

    public removeCSS3DObject(object: CSS3DObject): void {
        this._css3DObjects.delete(object.mesh.id);
    }

    public removeAllCSS3DObjects(): void {
        this._css3DObjects.clear();
    }

    private _pickObject(evt: PointerEvent): CSS3DObject | undefined {
        if (this._scene) {
            const pick = this._scene.pick(Math.round(evt.offsetX), Math.round(evt.offsetY));
            if (pick && pick.hit && pick.pickedMesh) {
                return this._css3DObjects.get(pick.pickedMesh.id);
            }
        }
        return undefined;
    }

    private _handlePointDown(evt: PointerEvent): void {
        const object = this._pickObject(evt);
        if (object) {
            object.setPicked();
            if (object.canGetFocus) {
                this.attachControl();
            }
            this._pickedOjbect = object;
        } else {
            this.detachControl();
        }
    }

    public attachControl(): void {
        // make CSS3DObject receive events
        if (!this._isAttachControl) {
            document.body.style.pointerEvents = "none";
            this._canvas.style.pointerEvents = "none";
            this._isAttachControl = true;
        }
    }

    public detachControl(): void {
        if (this._isAttachControl) {
            // make babylon.js canvas and document body receive events
            document.body.style.pointerEvents = "auto";
            this._canvas.style.pointerEvents = "all";
            this._isAttachControl = false;
        }
    }
}
