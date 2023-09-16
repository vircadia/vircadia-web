import type { Vector3, Scene, TransformNode } from "@babylonjs/core";

export class IglooCamera {
    canvas: Nullable<HTMLCanvasElement>;
    scene: Scene;
    constructor(canvas: Nullable<HTMLCanvasElement>, scene: Scene);
    follow: (object: TransformNode) => void;
    setPosition: (pos: Vector3) => void;
    update: () => boolean;
}
