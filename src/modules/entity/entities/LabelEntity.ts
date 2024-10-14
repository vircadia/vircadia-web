//
//  LabelEntity.ts
//
//  Created by Giga on 16 Feb 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import {
    type AbstractMesh,
    Color3,
    DynamicTexture,
    Matrix,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    TransformNode,
    Vector3,
    Engine,
} from "@babylonjs/core";
import { DEFAULT_MESH_RENDER_GROUP_ID } from "@Modules/object";
import { Renderer } from "@Modules/scene";
import { userStore } from "@Stores/index";
import { Hysteresis } from "@Modules/utility/hysteresis";

/**
 * Contains all of the memoized label meshes within the scene.
 */
let labelMemoNode: TransformNode | undefined = undefined;

const meshMemo = new Map<string, Mesh>();
const foregroundTextureMemo = new Map<string, DynamicTexture>();
const backgroundTextureMemo = new Map<string, DynamicTexture>();
const foregroundMaterialMemo = new Map<string, StandardMaterial>();
const backgroundMaterialMemo = new Map<string, StandardMaterial>();

/**
 * Create a sector mesh.
 * @param name The name of the mesh.
 * @param vector1 The vector at the leading edge of the sector.
 * @param vector2 The vector at the trailing edge of the sector.
 * @param radius The radius of the sector.
 * @param scene The hosting scene.
 * @returns The new sector mesh.
 */
function createSector(
    name: string,
    vector1: Vector3,
    vector2: Vector3,
    radius = 1,
    scene?: Scene
): Mesh {
    // Get the angle between the two vectors.
    const sectorAngle = Math.acos(
        Vector3.Dot(vector1, vector2) / (vector1.length() * vector2.length())
    );
    const minNumberOfSegments = 3;
    const diameter = radius * 2;
    const origin = Vector3.Zero();
    const firstPoint = Vector3.Normalize(vector1).scale(radius);
    const lastPoint = Vector3.Normalize(vector2).scale(radius);

    // Divide the sector angle into a number of segments angles.
    const segments = Math.max(
        Math.floor(diameter * sectorAngle),
        minNumberOfSegments
    );
    const segmentAngle = sectorAngle / segments;

    // Create points to connect each segment.
    const points = new Array<Vector3>();
    for (let i = 0; i < segments; i++) {
        const matrix = Matrix.RotationAxis(
            Vector3.Cross(vector1, vector2),
            segmentAngle * i
        );
        const rotated = Vector3.TransformCoordinates(firstPoint, matrix);
        points.push(rotated.add(origin));
    }
    points.push(lastPoint.add(origin));

    // Connect each segment point back to the origin.
    const originPoints = new Array<Vector3>();
    points.forEach(() => originPoints.push(origin));

    // Create a ribbon mesh from the points.
    const sector = MeshBuilder.CreateRibbon(
        name,
        {
            pathArray: [points, originPoints],
            offset: 0,
            sideOrientation: Mesh.BACKSIDE,
            updatable: false
        },
        scene
    );

    return sector;
}

export class LabelEntity {
    private static _textFont = {
        name: "monospace",
        size: 70,
        characterWidth: 38.5,
        characterRatio: 1.43,
        contentRatio: 0.1,
    };

    private static _iconFont = {
        name: "Material Icons",
        size: 100,
        characterWidth: 100,
        characterRatio: 1,
        contentRatio: 0.16,
    };

    /**
     * Create a new label entity and attach it to an object.
     * @param object The mesh/transform node to attach the label to.
     * @param height The height of the object (the label will be positioned above this point).
     * @param name The name to be displayed on the label.
     * @param icon Display the name as an icon instead of text.
     * @param color The color of the label's background.
     * @param popDistance The distance from the player's avatar at which the label will stop being visible.
     * @param popOverride A function overriding the visibility of the label.
     * This function receives the distance from the player's avatar to the label,
     * and should return a boolean indicating whether the label should be visible (`true`) or not (`false`).
     * @returns A reference to the new label mesh.
     */
    public static create(
        object: Mesh | AbstractMesh | TransformNode,
        height: number | (() => number),
        name: string,
        icon = false,
        color?: Color3,
        popDistance = 20,
        popOverride?: (distance: number) => boolean
    ): Mesh | undefined {
        const scene = object.getScene();
        const font = icon ? this._iconFont : this._textFont;
        const tagTextureWidth = icon
            ? font.characterWidth * 1.2
            : (name.length + 1) * font.characterWidth;
        const tagTextureHeight = font.size * font.characterRatio;
        const tagWidth =
            (font.contentRatio * tagTextureWidth) / tagTextureHeight;
        const tagHeight = font.contentRatio;
        const tagCornerRadius = tagHeight / 6;
        const tagArrowSize = 0.02;
        const tagBackgroundColor = color ?? new Color3(0.07, 0.07, 0.07);
        const tagBackgroundColorString = tagBackgroundColor.toHexString();
        const memoName = `${name}${icon ? "-i" : ""}-${tagBackgroundColorString}`;

        // Add these lines at the beginning of the method:
        const enableBevels = false; // Set to false to disable bevels (large fps gain when false)
        const enableAlpha = false; // Set to false to disable alpha transparency (minimal fps gain when false)

        // Declare corners and edges outside the conditional block
        const corners: Mesh[] = []
        const edges: Mesh[] = []

        // Attempt to reuse a memoized mesh, if one exists.
        let mesh = meshMemo.get(memoName)?.clone("Label", object, false, false);

        // If a matching mesh doesn't already exist, create a new one.
        if (!mesh) {
            // Textures.
            let foregroundTexture = foregroundTextureMemo.get(memoName);
            // If a matching texture doesn't already exist, create a new one.
            if (!foregroundTexture) {
                // Create the texture.
                const newForegroundTexture = new DynamicTexture(
                    `LabelTexture-${memoName}`,
                    { width: tagTextureWidth, height: tagTextureHeight },
                    scene
                );
                // Center the name on the tag.
                const textPosition = icon
                    ? tagTextureWidth / 2 - font.characterWidth / 2
                    : tagTextureWidth / 2 -
                    (name.length / 2) * font.characterWidth;
                newForegroundTexture.drawText(
                    name,
                    textPosition,
                    font.size,
                    `${font.size}px ${font.name}`,
                    "white",
                    tagBackgroundColorString,
                    true,
                    true
                );
                if (enableAlpha) {
                    newForegroundTexture.getAlphaFromRGB = true;
                }
                // Memoize the texture.
                foregroundTextureMemo.set(memoName, newForegroundTexture);
                foregroundTexture = newForegroundTexture;
            }

            let backgroundTexture = backgroundTextureMemo.get(tagBackgroundColorString);
            // If a matching texture doesn't already exist, create a new one.
            if (!backgroundTexture) {
                // Create the texture.
                const newBackgroundTexture = new DynamicTexture(
                    `LabelBackgroundTexture-${tagBackgroundColorString}`,
                    { width: tagTextureWidth, height: tagTextureHeight },
                    scene
                );
                newBackgroundTexture.drawText(
                    "",
                    0,
                    0,
                    `${font.size}px ${font.name}`,
                    "white",
                    tagBackgroundColorString,
                    true,
                    true
                );
                if (enableAlpha) {
                    newBackgroundTexture.getAlphaFromRGB = true;
                }
                // Memoize the texture.
                backgroundTextureMemo.set(tagBackgroundColorString, newBackgroundTexture);
                backgroundTexture = newBackgroundTexture;
            }

            // Materials.
            let foregroundMaterial = foregroundMaterialMemo.get(memoName);
            // If a matching material doesn't already exist, create a new one.
            if (!foregroundMaterial) {
                // Create the material.
                const newForegroundMaterial = new StandardMaterial(
                    `LabelMaterial-${memoName}`,
                    scene
                );
                newForegroundMaterial.diffuseTexture = foregroundTexture;
                newForegroundMaterial.specularTexture = foregroundTexture;
                newForegroundMaterial.emissiveTexture = foregroundTexture;
                newForegroundMaterial.disableLighting = true;
                if (enableAlpha) {
                    newForegroundMaterial.useAlphaFromDiffuseTexture = true;
                } else {
                    newForegroundMaterial.alphaMode = Engine.ALPHA_DISABLE;
                }
                // Memoize the material.
                foregroundMaterialMemo.set(memoName, newForegroundMaterial);
                foregroundMaterial = newForegroundMaterial;
            }

            let backgroundMaterial = backgroundMaterialMemo.get(tagBackgroundColorString);
            // If a matching material doesn't already exist, create a new one.
            if (!backgroundMaterial) {
                // Create the material.
                const newBackgroundMaterial = new StandardMaterial(
                    `LabelBackgroundMaterial-${tagBackgroundColorString}`,
                    scene
                );
                newBackgroundMaterial.diffuseTexture = backgroundTexture;
                newBackgroundMaterial.specularTexture = backgroundTexture;
                newBackgroundMaterial.emissiveTexture = backgroundTexture;
                newBackgroundMaterial.disableLighting = true;
                if (enableAlpha) {
                    newBackgroundMaterial.useAlphaFromDiffuseTexture = true;
                } else {
                    newBackgroundMaterial.alphaMode = Engine.ALPHA_DISABLE;
                }
                // Memoize the material.
                backgroundMaterialMemo.set(tagBackgroundColorString, newBackgroundMaterial);
                backgroundMaterial = newBackgroundMaterial;
            }

            // Meshes.
            const plane = MeshBuilder.CreatePlane(
                "Label",
                {
                    width: tagWidth,
                    height: tagHeight,
                    sideOrientation: Mesh.FRONTSIDE,
                    updatable: false,
                },
                scene
            );
            plane.material = foregroundMaterial;

            if (enableBevels) {
                // Rounded corners.
                const cornerPositions = [
                    new Vector3(-tagWidth / 2, tagHeight / 2 - tagCornerRadius, 0),
                    new Vector3(tagWidth / 2, tagHeight / 2 - tagCornerRadius, 0),
                    new Vector3(tagWidth / 2, -tagHeight / 2 + tagCornerRadius, 0),
                    new Vector3(-tagWidth / 2, -tagHeight / 2 + tagCornerRadius, 0),
                ];
                const sector = createSector(
                    "LabelCorner",
                    Vector3.Up(),
                    Vector3.Left(),
                    tagCornerRadius,
                    scene
                );
                corners.push(sector);
                corners.push(sector.clone("LabelCorner"));
                corners.push(sector.clone("LabelCorner"));
                corners.push(sector.clone("LabelCorner"));
                let index = 0;
                for (const cornerMesh of corners) {
                    cornerMesh.material = backgroundMaterial;
                    cornerMesh.position = cornerPositions[index];
                    cornerMesh.rotate(new Vector3(0, 0, 1), -index * (Math.PI / 2));
                    index += 1;
                }

                // Left and right edges.
                const edgeOptions = {
                    width: tagCornerRadius,
                    height: tagHeight - tagCornerRadius * 2,
                    sideOrientation: Mesh.FRONTSIDE,
                    updatable: false,
                };
                const edgePositions = [
                    new Vector3(-tagWidth / 2 - tagCornerRadius / 2, 0, 0),
                    new Vector3(tagWidth / 2 + tagCornerRadius / 2, 0, 0),
                ];
                edges.push(MeshBuilder.CreatePlane("LabelLeftEdge", edgeOptions, scene));
                edges.push(MeshBuilder.CreatePlane("LabelRightEdge", edgeOptions, scene));
                index = 0;
                for (const edgeMesh of edges) {
                    edgeMesh.material = backgroundMaterial;
                    edgeMesh.position = edgePositions[index];
                    index += 1;
                }
            }

            // Arrow mesh.
            const arrow = MeshBuilder.CreateDisc(
                "LabelArrow",
                {
                    radius: tagArrowSize,
                    tessellation: 3,
                    sideOrientation: Mesh.FRONTSIDE,
                    updatable: false,
                },
                scene
            );
            arrow.material = backgroundMaterial;
            arrow.position = new Vector3(0, -(tagHeight / 2 + tagArrowSize / 4), 0);
            arrow.rotation.z = -Math.PI / 2;
            arrow.scaling.x = 0.5;

            // Modify the mesh merging section:
            const meshesToMerge = [plane];
            if (enableBevels) {
                meshesToMerge.push(...corners, ...edges);
            }
            meshesToMerge.push(arrow);

            // Merge the label meshes.
            const mergedMesh = Mesh.MergeMeshes(
                meshesToMerge,
                true,
                true,
                undefined,
                false,
                true
            );

            if (!mergedMesh) {
                return undefined;
            }

            // Disable the merged-mesh so it isn't rendered.
            mergedMesh.setEnabled(false);
            // Parent it to the memo node.
            if (!labelMemoNode) {
                labelMemoNode = new TransformNode("LabelDuplicates", scene);
            }
            mergedMesh.parent = labelMemoNode;

            // Memoize the mesh.
            meshMemo.set(memoName, mergedMesh);
            mesh = mergedMesh.clone("Label", object, false, false);
        }

        // Position the label above the center of the object.
        const positionOffset = new Vector3(0, 0.15, 0);
        let h = 0;
        let heightHysteresis: Nullable<Hysteresis> = null;
        if (typeof height === "number") {
            h = height + positionOffset.y;
        } else {
            h = height() + positionOffset.y;
            heightHysteresis = new Hysteresis(
                () => height() + positionOffset.y,
                100,
                positionOffset.y
            );
        }
        mesh.position = new Vector3(positionOffset.x, h, positionOffset.z);

        const scaleAdjustmentFactorX = object.scaling.x > 0 ? 1 / object.scaling.x : 1;
        const scaleAdjustmentFactorY = object.scaling.y > 0 ? 1 / object.scaling.y : 1;
        const scaleAdjustmentFactorZ = object.scaling.z > 0 ? 1 / object.scaling.z : 1;
        mesh.scaling.x = scaleAdjustmentFactorX;
        mesh.scaling.y = scaleAdjustmentFactorY;
        mesh.scaling.z = scaleAdjustmentFactorZ;

        mesh.scaling.x *= -1;
        mesh.billboardMode = Mesh.BILLBOARDMODE_Y;
        mesh.parent = object;
        mesh.isPickable = false;
        mesh.renderingGroupId = DEFAULT_MESH_RENDER_GROUP_ID;
        mesh.setEnabled(true);

        // Modify the scene.registerBeforeRender section:
        const updateFunction = () => {
            if (!mesh) {
                return;
            }
            if (heightHysteresis) {
                mesh.position.y = heightHysteresis.get();
            }
            const avatar = Renderer.getScene()?.getMyAvatar();
            if (avatar) {
                const avatarPosition = avatar.getAbsolutePosition().clone();
                const labelPosition = mesh.getAbsolutePosition();
                const distance = Vector3.Distance(avatarPosition, labelPosition);
                const isVisible = distance <= popDistance &&
                    userStore.avatar.showLabels &&
                    (popOverride?.(distance) ?? true);

                if (enableAlpha) {
                    const opacity = Math.min(Math.max(popDistance + 1 - distance, 0), 0.94);
                    mesh.visibility = opacity * Number(isVisible);
                } else {
                    mesh.isVisible = isVisible;
                }
            }
        };

        // Always use onBeforeRenderObservable to ensure the update function is called
        scene.onBeforeRenderObservable.add(updateFunction);

        return mesh;
    }

    /**
     * Remove a label entity from an object.
     * @param labelMesh The label mesh to remove.
     */
    public static remove(labelMesh: Mesh | AbstractMesh | TransformNode | undefined | null): void {
        if (!labelMesh || !(/^Label/iu).test(labelMesh.name)) {
            return;
        }
        labelMesh.dispose(false, false);
    }

    /**
     * Remove all label entities from an object.
     * @param object The object to remove all labels from.
     */
    public static removeAll(object: Mesh | AbstractMesh | TransformNode | undefined | null): void {
        if (!object) {
            return;
        }
        const labelMeshes = object.getChildMeshes(false, (node) => (/^Label/iu).test(node.name));
        labelMeshes.forEach((labelMesh) => labelMesh.dispose(false, false));
    }
}