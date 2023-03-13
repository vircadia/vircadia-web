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

import { AbstractMesh,
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
import { Store } from "@Store/index";

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
    const points = [] as Vector3[];
    for (let i = 0; i < segments; i++) {
        const matrix = Matrix.RotationAxis(Vector3.Cross(vector1, vector2), segmentAngle * i);
        const rotated = Vector3.TransformCoordinates(firstPoint, matrix);
        points.push(rotated.add(origin));
    }
    points.push(lastPoint.add(origin));

    // Connect each segment point back to the origin.
    const originPoints = [] as Vector3[];
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
    private static textFont = {
        name: "monospace",
        size: 70,
        characterWidth: 38.5,
        characterRatio: 1.43,
        contentRatio: 0.1
    };

    private static iconFont = {
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
     * @returns A reference to the new nametag mesh.
     */
    public static create(
        object: Mesh | AbstractMesh | TransformNode,
        height: number,
        name: string,
        icon = false,
        color?: Color3,
        popDistance = 20
    ): Mesh | undefined {
        const scene = object.getScene();
        const font = icon ? this.iconFont : this.textFont;
        const tagTextureWidth = icon ? font.characterWidth * 1.2 : (name.length + 1) * font.characterWidth;
        const tagTextureHeight = font.size * font.characterRatio;
        const tagWidth = font.contentRatio * tagTextureWidth / tagTextureHeight;
        const tagHeight = font.contentRatio;
        const tagCornerRadius = tagHeight / 6;
        const nametagArrowSize = 0.02;
        const tagBackgroundColor = color ?? new Color3(0.07, 0.07, 0.07);

        // Textures.
        const nametagTexture = new DynamicTexture("NametagTexture", {
            width: tagTextureWidth,
            height: tagTextureHeight
        }, scene);
        // Center the name on the tag.
        const textPosition = icon
            ? tagTextureWidth / 2 - font.characterWidth / 2
            : tagTextureWidth / 2 - name.length / 2 * font.characterWidth;
        nametagTexture.drawText(
            name,
            textPosition,
            font.size,
            `${font.size}px ${font.name}`,
            "white",
            tagBackgroundColor.toHexString(),
            true,
            true
        );
        nametagTexture.getAlphaFromRGB = true;

        const nametagBackgroundTexture = new DynamicTexture("NametagTexture2", {
            width: tagTextureWidth,
            height: tagTextureHeight
        }, scene);
        nametagBackgroundTexture.drawText(
            "",
            0,
            0,
            `${font.size}px ${font.name}`,
            "white",
            tagBackgroundColor.toHexString(),
            true,
            true
        );
        nametagBackgroundTexture.getAlphaFromRGB = true;

        // Materials.
        const nametagMaterial = new StandardMaterial("NametagMaterial", scene);
        nametagMaterial.diffuseTexture = nametagTexture;
        nametagMaterial.specularTexture = nametagTexture;
        nametagMaterial.emissiveTexture = nametagTexture;
        nametagMaterial.disableLighting = true;

        const nametagBackgroundMaterial = new StandardMaterial("NametagBackgroundMaterial", scene);
        nametagBackgroundMaterial.diffuseTexture = nametagBackgroundTexture;
        nametagBackgroundMaterial.specularTexture = nametagBackgroundTexture;
        nametagBackgroundMaterial.emissiveTexture = nametagBackgroundTexture;
        nametagBackgroundMaterial.disableLighting = true;

        // Meshes.
        const nametagPlane = MeshBuilder.CreatePlane("Nametag", {
            width: tagWidth,
            height: tagHeight,
            sideOrientation: Mesh.DOUBLESIDE,
            updatable: true
        }, scene);
        nametagPlane.material = nametagMaterial;

        // Rounded corners.
        const nametagCorners = [] as Mesh[];
        const nametagCornerPositions = [
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
        nametagCorners.push(sector);
        nametagCorners.push(sector.clone());
        nametagCorners.push(sector.clone());
        nametagCorners.push(sector.clone());
        nametagCorners.forEach((cornerMesh, index) => {
            cornerMesh.material = nametagBackgroundMaterial;
            cornerMesh.position = nametagCornerPositions[index];
            cornerMesh.rotate(new Vector3(0, 0, 1), -index * (Math.PI / 2));
        });

        // Left and right edges.
        const nametagEdges = [] as Mesh[];
        const nametagEdgeOptions = {
            width: tagCornerRadius,
            height: tagHeight - tagCornerRadius * 2,
            sideOrientation: Mesh.DOUBLESIDE,
            updatable: true
        };
        const nametagEdgePositions = [
            new Vector3(-tagWidth / 2 - tagCornerRadius / 2, 0, 0),
            new Vector3(tagWidth / 2 + tagCornerRadius / 2, 0, 0)
        ];
        nametagEdges.push(MeshBuilder.CreatePlane("NametagLeftEdge", nametagEdgeOptions, scene));
        nametagEdges.push(MeshBuilder.CreatePlane("NametagRightEdge", nametagEdgeOptions, scene));
        nametagEdges.forEach((cornerMesh, index) => {
            cornerMesh.material = nametagBackgroundMaterial;
            cornerMesh.position = nametagEdgePositions[index];
        });

        // Arrow mesh.
        const nametagArrow = MeshBuilder.CreateDisc("NametagArrow", {
            radius: nametagArrowSize,
            tessellation: 3,
            sideOrientation: Mesh.DOUBLESIDE,
            updatable: true
        }, scene);
        nametagArrow.material = nametagBackgroundMaterial;
        nametagArrow.position = new Vector3(0, -(tagHeight / 2 + nametagArrowSize / 4), 0);
        nametagArrow.rotation.z = -Math.PI / 2;
        nametagArrow.scaling.x = 0.5;

        // Merge the nametag meshes.
        const nametagMergedMesh = Mesh.MergeMeshes([
            nametagPlane,
            ...nametagCorners,
            ...nametagEdges,
            nametagArrow
        ], true, true, undefined, false, true);

        if (!nametagMergedMesh) {
            return undefined;
        }

        // Position the nametag above the center of the object.
        const positionOffset = new Vector3(0, 0.15, 0);
        nametagMergedMesh.position = new Vector3(
            positionOffset.x,
            height + positionOffset.y,
            positionOffset.z
        );

        nametagMergedMesh.billboardMode = Mesh.BILLBOARDMODE_Y;
        nametagMergedMesh.parent = object;
        nametagMergedMesh.isPickable = false;
        nametagMergedMesh.renderingGroupId = DEFAULT_MESH_RENDER_GROUP_ID;

        // Hide the nametag if it is too far from the camera,
        // or if `showNametags` has been turned off in the Store.
        scene.registerBeforeRender(() => {
            if (!nametagMergedMesh || !scene.activeCamera) {
                return;
            }
            const avatar = scene.meshes.find((mesh) => mesh.name === "MyAvatar");
            if (avatar) {
                const avatarPosition = avatar.getAbsolutePosition().clone();
                const nametagPosition = nametagMergedMesh.getAbsolutePosition();
                const distance = avatarPosition.subtract(nametagPosition).length();
                // Clamp the opacity between 0 and 0.94.
                // Max opacity of 0.94 reduces the chance that the nametag will be affected by bloom.
                const opacity = Math.min(Math.max(popDistance + 1 - distance, 0), 0.94);
                nametagMergedMesh.visibility = opacity * Number(Store.state.avatar.showNametags);
            }
        });

        return nametagMergedMesh;
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
