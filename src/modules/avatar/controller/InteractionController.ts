//
//  InteractionController.ts
//
//  This controller handles the interactions between the local avatar
//  and interaction targets (previously referred to as animatables or sit-objects).
//
//  Created by Giga on 27 Oct 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    type AbstractMesh,
    Color3,
    type InstancedMesh,
    type Mesh,
    type Node,
    type TransformNode,
    Vector3
} from "@babylonjs/core";
import { ScriptComponent } from "@Modules/script";
import { Renderer, VScene } from "@Modules/scene";
import { applicationStore } from "@Stores/index";
import { LabelEntity } from "@Modules/entity/entities";

export const InteractiveModelTypes = [
    { name: "chair", condition: /^(?:animate_sitting|animate_seat)/iu },
    { name: "emoji_people", condition: /^animate_/iu }
] as const;

export class InteractionTarget {
    animation = "";
    private _color = Color3.Black();
    private _exitPosition = Vector3.Zero();
    private _icon = "";
    private _label: Nullable<Mesh>;
    private _parent: AbstractMesh | Mesh | TransformNode;
    private _popDistance = 0;
    private _position = Vector3.Zero();
    private _rotation = Vector3.Zero();
    private _text = "";

    constructor(parent: AbstractMesh | Mesh | TransformNode) {
        this._parent = parent;
        this._remakeLabel();
    }

    /**
     * The color of the interaction target's label.
     */
    get color(): Color3 {
        return this._color;
    }

    set color(value: string | Color3) {
        if (typeof value === "string") {
            this._color = Color3.FromHexString(value);
        } else {
            this._color = value;
        }
        this._remakeLabel();
    }

    /**
     * The position the avatar should snap to when the interaction has finished.
     * (Relative to the interaction target).
     */
    get exitPosition(): Vector3 {
        return this._exitPosition;
    }

    set exitPosition(value: string | Vector3) {
        this._exitPosition = InteractionTarget._parseVector3(value);
    }

    /**
     * The absolute position of the interaction target in the world.
     */
    get absolutePosition(): Vector3 {
        return this._parent.getAbsolutePosition().add(this._position);
    }

    /**
     * The icon to show on the interaction target's label.
     */
    get icon(): string {
        return this._icon;
    }

    set icon(value: string) {
        this._icon = value;
        this._remakeLabel();
    }

    /**
     * This distance from the interaction target at which its label should fade out.
     */
    get popDistance(): number {
        return this._popDistance;
    }

    set popDistance(value: number) {
        this._popDistance = value;
        this._remakeLabel();
    }

    /**
     * The position of the interaction target relative to its parent object.
     * (The avatar will be snapped to this position while interacting).
     */
    get position(): Vector3 {
        return this._position;
    }

    set position(value: string | Vector3) {
        this._position = InteractionTarget._parseVector3(value);
        this._remakeLabel();
    }

    /**
     * The rotation of the interaction target relative to its parent object.
     * (The avatar will be snapped to this rotation while interacting).
     */
    get rotation(): Vector3 {
        return this._rotation;
    }

    set rotation(value: string | Vector3) {
        const rotation = InteractionTarget._parseVector3(value);
        // Convert from degrees to radians.
        rotation.x = rotation.x * Math.PI / 180;
        rotation.y = rotation.y * Math.PI / 180;
        rotation.z = rotation.z * Math.PI / 180;
        this._rotation = rotation;
    }

    /**
     * The text to show on the interaction target's label.
     */
    get text(): string {
        return this._text;
    }

    set text(value: string) {
        this._text = value;
        this._remakeLabel();
    }

    private _remakeLabel(): void {
        LabelEntity.remove(this._label);
        this._label = LabelEntity.create(
            this._parent,
            0,
            this._icon || this._text,
            Boolean(this._icon),
            this._color,
            this._popDistance
        );
        if (this._label) {
            this._label.position = this._position;
        }
    }

    private static _parseVector3(vector: string | Vector3): Vector3 {
        if (typeof vector === "string") {
            const output = Vector3.Zero();
            if (!vector || typeof vector !== "string") {
                return output;
            }
            const parsedString = (/^(?<x>[\d.-]+)[,\s]+(?<y>[\d.-]+)[,\s]+(?<z>[\d.-]+)/iu).exec(vector);
            if (!parsedString?.groups?.x || !parsedString?.groups?.y || !parsedString?.groups?.z) {
                return output;
            }
            output.x = parseFloat(parsedString.groups.x);
            output.y = parseFloat(parsedString.groups.y);
            output.z = parseFloat(parsedString.groups.z);
            return output;
        }
        return vector.clone();
    }

    /**
     * Create a new set of interaction targets based on the metadata properties of a given mesh.
     * @param mesh The mesh to read the metadata from.
     * @returns An array of interaction targets.
     */
    public static fromMesh(mesh: AbstractMesh | Mesh | InstancedMesh | TransformNode): Array<InteractionTarget> {
        const meshExtras = mesh.metadata?.gltf?.extras as Nullable<Record<string, boolean | number | string>>;
        const targets = new Array<InteractionTarget>();
        if (!meshExtras || typeof meshExtras !== "object") {
            return targets;
        }
        for (const [property, value] of Object.entries(meshExtras)) {
            const parsedProperty = (/^vircadia_sit_(?<index>[\d]+)_(?<type>[\w]+)/iu).exec(property);
            if (!parsedProperty?.groups?.index || !parsedProperty?.groups?.type) {
                continue;
            }
            const index = parseInt(parsedProperty.groups.index, 10);
            const type = parsedProperty.groups.type.toLowerCase();
            if (!targets[index]) {
                targets[index] = new InteractionTarget(mesh);
            }
            switch (type) {
                case "position":
                    targets[index].position = this._parseVector3(String(value));
                    break;
                case "rotation":
                    targets[index].rotation = this._parseVector3(String(value));
                    break;
                case "exit_position":
                    targets[index].exitPosition = this._parseVector3(String(value));
                    break;
                case "icon":
                    targets[index].icon = String(value);
                    break;
                case "text":
                    targets[index].text = String(value);
                    break;
                case "color":
                    targets[index].color = String(value);
                    break;
                case "label_distance":
                    targets[index].popDistance = typeof value === "string" ? parseFloat(value) : Number(value);
                    break;
                case "animation":
                    targets[index].animation = String(value);
                    break;
                default:
                    break;
            }
        }
        return targets;
    }
}

export class InteractionController extends ScriptComponent {
    private _vscene: VScene;

    constructor(vscene: VScene) {
        super(InteractionController.typeName);
        this._vscene = vscene;
    }

    /**
     * A string identifying the type of this component.
     * @returns "InteractionController"
     */
    public get componentType(): string {
        return InteractionController.typeName;
    }

    static get typeName(): string {
        return "InteractionController";
    }

    /**
     * Register an interaction target with the scene.
     * The scene keeps a reference to the target, so any changes to the original target will be reflected in the scene.
     * @param target The target to register.
     */
    public addTarget(target: InteractionTarget): void {
        applicationStore.interactions.targets.push(target);
    }

    /**
     * Register multiple interaction targets with the scene.
     * The scene keeps references to the targets, so any changes to the original targets will be reflected in the scene.
     * @param targets The targets to register.
     */
    public addTargets(targets: Array<InteractionTarget>): void {
        for (const target of targets) {
            applicationStore.interactions.targets.push(target);
        }
    }

    /**
     * Remove an interaction target from the scene.
     * @param target The target to remove.
     */
    public removeTarget(target: InteractionTarget): void {
        const index = applicationStore.interactions.targets.indexOf(target);
        applicationStore.interactions.targets.splice(index, 1);
    }

    /**
     * Remove multiple interaction targets from the scene.
     * @param target The targets to remove.
     */
    public removeTargets(targets: Array<InteractionTarget>): void {
        for (const target of targets) {
            const index = applicationStore.interactions.targets.indexOf(target);
            applicationStore.interactions.targets.splice(index, 1);
        }
    }

    /**
     * Retrieve the interaction target that is currently closest to the local avatar.
     * @returns The closest interaction target, or `undefined` if none was found or was within the max interaction distance.
     */
    public getNearestTarget(): Nullable<InteractionTarget> {
        const avatar = Renderer.getScene().getMyAvatar();
        const avatarAbsolutePosition = avatar?.getAbsolutePosition();
        if (!avatarAbsolutePosition) {
            return undefined;
        }

        // Filter out any targets that are too far away, or don't have an absolute position.
        const distances = new Array<[InteractionTarget | TransformNode | AbstractMesh, number]>();
        // Search through the registered targets.
        for (const target of applicationStore.interactions.targets) {
            if (!target) {
                continue;
            }
            if (!(target instanceof InteractionTarget) && !("getAbsolutePosition" in target)) {
                continue;
            }
            const distance = target.absolutePosition
                .subtract(avatarAbsolutePosition)
                .length();
            if (distance <= applicationStore.interactions.interactionDistance) {
                distances.push([target as InteractionTarget, distance]);
            }
        }
        // Search through the scene.
        const sceneNodes = this._scene.getNodes() as (Node | TransformNode | AbstractMesh)[];
        const targetNodes = sceneNodes.filter((node) => (/^animate_/iu).test(node.name));
        for (const node of targetNodes) {
            if (!("getAbsolutePosition" in node)) {
                continue;
            }
            const distance = node.getAbsolutePosition()
                .subtract(avatarAbsolutePosition)
                .length();
            if (distance <= applicationStore.interactions.interactionDistance) {
                distances.push([node, distance]);
            }
        }

        // If there are multiple interactive targets in range, use the closest one.
        if (distances.length > 0) {
            const closestTarget = distances.reduce((a, b) => (a[1] <= b[1] ? a : b));
            if (closestTarget[0] instanceof InteractionTarget) {
                return closestTarget[0];
            }
            return InteractionTarget.fromMesh(closestTarget[0])[0];
        }

        return undefined;
    }
}
