//
//  NametagEntity.ts
//
//  Created by Giga on 16 Feb 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable new-cap */

import { type AbstractMesh,
    Color3,
    DynamicTexture,
    Matrix,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    TransformNode,
    Vector3 } from "@babylonjs/core";
import { DEFAULT_MESH_RENDER_GROUP_ID } from "@Modules/object";
import { Renderer } from "@Modules/scene";
import { userStore } from "@Stores/index";
import { Hysteresis } from "@Modules/utility/hysteresis";

/**
 * Contains all of the memoized nametag meshes within the scene.
 */
let nametagMemoNode: TransformNode | undefined = undefined;

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
function createSector(name: string, vector1: Vector3, vector2: Vector3, radius = 1, scene?: Scene): Mesh {
    // Get the angle between the two vectors.
    const sectorAngle = Math.acos(Vector3.Dot(vector1, vector2) / (vector1.length() * vector2.length()));
    const minNumberOfSegments = 5;
    const diameter = radius * 2;
    const origin = Vector3.Zero();
    const firstPoint = Vector3.Normalize(vector1).scale(radius);
    const lastPoint = Vector3.Normalize(vector2).scale(radius);

    // Divide the sector angle into a number of segments angles.
    const segments = Math.max(Math.floor(diameter * sectorAngle), minNumberOfSegments);
    const segmentAngle = sectorAngle / segments;

    // Create points to connect each segment.
    const points = new Array<Vector3>();
    for (let i = 0; i < segments; i++) {
        const matrix = Matrix.RotationAxis(Vector3.Cross(vector1, vector2), segmentAngle * i);
        const rotated = Vector3.TransformCoordinates(firstPoint, matrix);
        points.push(rotated.add(origin));
    }
    points.push(lastPoint.add(origin));

    // Connect each segment point back to the origin.
    const originPoints = new Array<Vector3>();
    points.forEach(() => {
        originPoints.push(origin);
    });

    // Create a ribbon mesh from the points.
    const sector = MeshBuilder.CreateRibbon(
        name,
        {
            pathArray: [points, originPoints],
            offset: 0
        },
        scene
    );

    return sector;
}

export class NametagEntity {
    private static _textFont = {
        name: "monospace",
        size: 70,
        characterWidth: 38.5,
        characterRatio: 1.43,
        contentRatio: 0.1
    };

    private static _iconFont = {
        name: "Material Icons",
        size: 100,
        characterWidth: 100,
        characterRatio: 1,
        contentRatio: 0.16
    };

    /**
     * Create a new nametag entity and attach it to an object.
     * @param object The mesh/transform node to attach the nametag to.
     * @param height The height of the object (the nametag will be positioned above this point).
     * @param name The name to be displayed on the nametag.
     * @param icon Display the name as an icon instead of text.
     * @param color The color of the nametag's background.
     * @param popDistance The distance from the player's avatar at which the nametag will stop being visible.
     * @param popOverride A function overriding the visibility of the nametag.
     * This function receives the distance from the player's avatar to the nametag,
     * and should return a boolean indicating whether the nametag should be visible (`true`) or not (`false`).
     * @returns A reference to the new nametag mesh.
     */
    public static create(
        object: Mesh | AbstractMesh | TransformNode,
        height: number | (() => number),
        name: string,
        icon = false,
        color?: Color3,
        popDistance = 20,
        popOverride?: ((distance: number) => boolean)
    ): Mesh | undefined {
        const scene = object.getScene();
        const font = icon ? this._iconFont : this._textFont;
        const tagTextureWidth = icon ? font.characterWidth * 1.2 : (name.length + 1) * font.characterWidth;
        const tagTextureHeight = font.size * font.characterRatio;
        const tagWidth = font.contentRatio * tagTextureWidth / tagTextureHeight;
        const tagHeight = font.contentRatio;
        const tagCornerRadius = tagHeight / 6;
        const nametagArrowSize = 0.02;
        const tagBackgroundColor = color ?? new Color3(0.07, 0.07, 0.07);
        const tagBackgroundColorString = tagBackgroundColor.toHexString();
        const memoName = `${name}${icon ? "-i" : ""}-${tagBackgroundColorString}`;

        // Attempt to reuse a memoized mesh, if one exists.
        let mesh = meshMemo.get(memoName)?.clone("Nametag", object, false, false);

        // If a matching mesh doesn't already exist, create a new one.
        if (!mesh) {
            // Textures.
            let foregroundTexture = foregroundTextureMemo.get(memoName);
            // If a matching texture doesn't already exist, create a new one.
            if (!foregroundTexture) {
                // Create the texture.
                const newForegroundTexture = new DynamicTexture(`NametagTexture-${memoName}`, { width: tagTextureWidth, height: tagTextureHeight }, scene);
                // Center the name on the tag.
                const textPosition = icon
                    ? tagTextureWidth / 2 - font.characterWidth / 2
                    : tagTextureWidth / 2 - name.length / 2 * font.characterWidth;
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
                newForegroundTexture.getAlphaFromRGB = true;
                // Memoize the texture.
                foregroundTextureMemo.set(memoName, newForegroundTexture);
                foregroundTexture = newForegroundTexture;
            }

            let backgroundTexture = backgroundTextureMemo.get(tagBackgroundColorString);
            // If a matching texture doesn't already exist, create a new one.
            if (!backgroundTexture) {
                // Create the texture.
                const newBackgroundTexture = new DynamicTexture(
                    `NametagBackgroundTexture-${tagBackgroundColorString}`,
                    { width: tagTextureWidth, height: tagTextureHeight },
                    scene
                );
                newBackgroundTexture.drawText("", 0, 0, `${font.size}px ${font.name}`, "white", tagBackgroundColorString, true, true);
                newBackgroundTexture.getAlphaFromRGB = true;
                // Memoize the texture.
                backgroundTextureMemo.set(tagBackgroundColorString, newBackgroundTexture);
                backgroundTexture = newBackgroundTexture;
            }

            // Materials.
            let foregroundMaterial = foregroundMaterialMemo.get(memoName);
            // If a matching material doesn't already exist, create a new one.
            if (!foregroundMaterial) {
                // Create the material.
                const newForegroundMaterial = new StandardMaterial(`NametagMaterial-${memoName}`, scene);
                newForegroundMaterial.diffuseTexture = foregroundTexture;
                newForegroundMaterial.specularTexture = foregroundTexture;
                newForegroundMaterial.emissiveTexture = foregroundTexture;
                newForegroundMaterial.disableLighting = true;
                // Memoize the material.
                foregroundMaterialMemo.set(memoName, newForegroundMaterial);
                foregroundMaterial = newForegroundMaterial;
            }

            let backgroundMaterial = backgroundMaterialMemo.get(tagBackgroundColorString);
            // If a matching material doesn't already exist, create a new one.
            if (!backgroundMaterial) {
                // Create the material.
                const newBackgroundMaterial = new StandardMaterial(`NametagBackgroundMaterial-${tagBackgroundColorString}`, scene);
                newBackgroundMaterial.diffuseTexture = backgroundTexture;
                newBackgroundMaterial.specularTexture = backgroundTexture;
                newBackgroundMaterial.emissiveTexture = backgroundTexture;
                newBackgroundMaterial.disableLighting = true;
                // Memoize the material.
                backgroundMaterialMemo.set(tagBackgroundColorString, newBackgroundMaterial);
                backgroundMaterial = newBackgroundMaterial;
            }

            // Meshes.
            const plane = MeshBuilder.CreatePlane("Nametag", {
                width: tagWidth,
                height: tagHeight,
                sideOrientation: Mesh.DOUBLESIDE,
                updatable: true
            }, scene);
            plane.material = foregroundMaterial;

            // Rounded corners.
            const corners = new Array<Mesh>();
            const cornerPositions = [
                new Vector3(-tagWidth / 2, tagHeight / 2 - tagCornerRadius, 0),
                new Vector3(tagWidth / 2, tagHeight / 2 - tagCornerRadius, 0),
                new Vector3(tagWidth / 2, -tagHeight / 2 + tagCornerRadius, 0),
                new Vector3(-tagWidth / 2, -tagHeight / 2 + tagCornerRadius, 0)
            ];
            const sector = createSector(
                "NametagCorner",
                Vector3.Up(),
                Vector3.Left(),
                tagCornerRadius,
                scene
            );
            corners.push(sector);
            corners.push(sector.clone());
            corners.push(sector.clone());
            corners.push(sector.clone());
            let index = 0;
            for (const cornerMesh of corners) {
                cornerMesh.material = backgroundMaterial;
                cornerMesh.position = cornerPositions[index];
                cornerMesh.rotate(new Vector3(0, 0, 1), -index * (Math.PI / 2));
                index += 1;
            }

            // Left and right edges.
            const edges = new Array<Mesh>();
            const edgeOptions = {
                width: tagCornerRadius,
                height: tagHeight - tagCornerRadius * 2,
                sideOrientation: Mesh.DOUBLESIDE,
                updatable: true
            };
            const edgePositions = [
                new Vector3(-tagWidth / 2 - tagCornerRadius / 2, 0, 0),
                new Vector3(tagWidth / 2 + tagCornerRadius / 2, 0, 0)
            ];
            edges.push(MeshBuilder.CreatePlane("NametagLeftEdge", edgeOptions, scene));
            edges.push(MeshBuilder.CreatePlane("NametagRightEdge", edgeOptions, scene));
            index = 0;
            for (const edgeMesh of edges) {
                edgeMesh.material = backgroundMaterial;
                edgeMesh.position = edgePositions[index];
                index += 1;
            }

            // Arrow mesh.
            const arrow = MeshBuilder.CreateDisc("NametagArrow", {
                radius: nametagArrowSize,
                tessellation: 3,
                sideOrientation: Mesh.DOUBLESIDE,
                updatable: true
            }, scene);
            arrow.material = backgroundMaterial;
            arrow.position = new Vector3(0, -(tagHeight / 2 + nametagArrowSize / 4), 0);
            arrow.rotation.z = -Math.PI / 2;
            arrow.scaling.x = 0.5;

            // Merge the nametag meshes.
            const mergedMesh = Mesh.MergeMeshes([
                plane,
                ...corners,
                ...edges,
                arrow
            ], true, true, undefined, false, true);

            if (!mergedMesh) {
                return undefined;
            }

            // Disable the merged-mesh so it isn't rendered.
            mergedMesh.setEnabled(false);
            // Parent it to the memo node.
            if (!nametagMemoNode) {
                nametagMemoNode = new TransformNode("NametagDuplicates", scene);
            }
            mergedMesh.parent = nametagMemoNode;

            // Memoize the mesh.
            meshMemo.set(memoName, mergedMesh);
            mesh = mergedMesh.clone("Nametag", object, false, false);
        }

        // Position the nametag above the center of the object.
        const positionOffset = new Vector3(0, 0.15, 0);
        let h = 0;
        let heightHysteresis: Nullable<Hysteresis> = null;
        if (typeof height === "number") {
            h = height + positionOffset.y;
        } else {
            h = height() + positionOffset.y;
            heightHysteresis = new Hysteresis(() => height() + positionOffset.y, 100, positionOffset.y);
        }
        mesh.position = new Vector3(positionOffset.x, h, positionOffset.z);

        const scaleAdjustmentFactorX = object.scaling.x > 0 ? 1 / object.scaling.x : 1;
        const scaleAdjustmentFactorY = object.scaling.y > 0 ? 1 / object.scaling.y : 1;
        const scaleAdjustmentFactorZ = object.scaling.z > 0 ? 1 / object.scaling.z : 1;
        mesh.scaling.x = scaleAdjustmentFactorX;
        mesh.scaling.y = scaleAdjustmentFactorY;
        mesh.scaling.z = scaleAdjustmentFactorZ;

        mesh.billboardMode = Mesh.BILLBOARDMODE_Y;
        mesh.parent = object;
        mesh.isPickable = false;
        mesh.renderingGroupId = DEFAULT_MESH_RENDER_GROUP_ID;
        mesh.setEnabled(true);

        // Hide the nametag if it is too far from the avatar,
        // or if `showNametags` has been turned off in the Store.
        scene.registerBeforeRender(() => {
            if (!mesh) {
                return;
            }
            // Update the nametag's position.
            if (heightHysteresis) {
                mesh.position.y = heightHysteresis.get();
            }
            // Update the nametag's opacity.
            const avatar = Renderer.getScene()?.getMyAvatar();
            if (avatar) {
                const avatarPosition = avatar.getAbsolutePosition().clone();
                const nametagPosition = mesh.getAbsolutePosition();
                const distance = avatarPosition.subtract(nametagPosition).length();
                // Clamp the opacity between 0 and 0.94.
                // Max opacity of 0.94 reduces the chance that the nametag will be affected by bloom.
                const opacity = Math.min(Math.max(popDistance + 1 - distance, 0), 0.94);
                mesh.visibility = opacity * Number(userStore.avatar.showNametags && (popOverride?.(distance) ?? true));
                mesh.isVisible = true;
            }
        });

        return mesh;
    }

    /**
     * Remove a nametag entity from an object.
     * @param nametagMesh The nametag mesh to remove.
     */
    public static remove(nametagMesh: Mesh | AbstractMesh | TransformNode | undefined | null): void {
        if (!nametagMesh || !(/^Nametag/ui).test(nametagMesh.name)) {
            return;
        }
        nametagMesh.dispose(false, true);
    }

    /**
     * Remove all nametag entities from an object.
     * @param object The object to remove all nametags from.
     */
    public static removeAll(object: Mesh | AbstractMesh | TransformNode | undefined | null): void {
        if (!object) {
            return;
        }
        const nametagMeshes = object.getChildMeshes(false, (node) => (/^Nametag/ui).test(node.name));
        nametagMeshes.forEach((nametagMesh) => nametagMesh.dispose(false, true));
    }
}
