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

import { Color3, DynamicTexture, Mesh, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import { MASK_MESH_RENDER_GROUP_ID } from "@Modules/object";

export class NametagEntity {
    /**
     * Create a new nametag entity and attach it to a mesh object.
     * @param mesh The mesh to attach the nametag to.
     * @param meshHeight The height of the mesh object (the nametag will be positioned above this point).
     * @param name The name to be displayed on the nametag.
     * @param color The color of the nametag's background.
     * @returns A reference to the new nametag mesh.
     */
    public static create(mesh: Mesh, meshHeight: number, name: string, color?: Color3): Mesh | undefined {
        const scene = mesh.getScene();
        const font = {
            name: "monospace",
            size: 70,
            characterWidth: 38.5,
            characterRatio: 1.43
        };
        const tagTextureWidth = (name.length + 1) * font.characterWidth;
        const tagTextureHeight = font.size * font.characterRatio;
        const tagWidth = 0.1 * tagTextureWidth / tagTextureHeight;
        const tagHeight = 0.1;
        const tagCornerRadius = tagHeight / 6;
        const tagCornerSegments = 16;
        const nametagArrowSize = 0.02;
        const tagBackgroundColor = color ?? new Color3(0.07, 0.07, 0.07);

        // Textures.
        const nametagTexture = new DynamicTexture("NametagTexture", {
            width: tagTextureWidth,
            height: tagTextureHeight
        }, scene);
        nametagTexture.drawText(
            name,
            tagTextureWidth / 2 - name.length / 2 * font.characterWidth, // Center the name on the tag.
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
        const nametagCornerOptions = {
            radius: tagCornerRadius,
            tessellation: tagCornerSegments,
            sideOrientation: Mesh.DOUBLESIDE,
            updatable: true
        };
        const nametagCornerPositions = [
            new Vector3(-tagWidth / 2, tagHeight / 2 - tagCornerRadius, 0),
            new Vector3(tagWidth / 2, tagHeight / 2 - tagCornerRadius, 0),
            new Vector3(tagWidth / 2, -tagHeight / 2 + tagCornerRadius, 0),
            new Vector3(-tagWidth / 2, -tagHeight / 2 + tagCornerRadius, 0)
        ];
        nametagCorners.push(MeshBuilder.CreateDisc("NametagTopLeftCorner", nametagCornerOptions, scene));
        nametagCorners.push(MeshBuilder.CreateDisc("NametagTopRightCorner", nametagCornerOptions, scene));
        nametagCorners.push(MeshBuilder.CreateDisc("NametagBottomRightCorner", nametagCornerOptions, scene));
        nametagCorners.push(MeshBuilder.CreateDisc("NametagBottomLeftCorner", nametagCornerOptions, scene));
        nametagCorners.forEach((cornerMesh, index) => {
            cornerMesh.material = nametagBackgroundMaterial;
            cornerMesh.position = nametagCornerPositions[index];
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

        // Position the nametag above the center of the mesh.
        const positionOffset = new Vector3(0, 0.15, 0);
        nametagMergedMesh.position = new Vector3(
            positionOffset.x,
            meshHeight + positionOffset.y,
            positionOffset.z
        );

        nametagMergedMesh.billboardMode = Mesh.BILLBOARDMODE_Y;
        nametagMergedMesh.parent = mesh;
        nametagMergedMesh.isPickable = false;
        nametagMergedMesh.renderingGroupId = MASK_MESH_RENDER_GROUP_ID;

        return nametagMergedMesh;
    }

    /**
     * Remove a nametag entity from a mesh object.
     * @param nametagMesh The nametag mesh to remove.
     */
    public static remove(nametagMesh: Mesh | undefined | null): void {
        if (!nametagMesh || !(/^Nametag/ui).test(nametagMesh.name)) {
            return;
        }
        nametagMesh.dispose(false, true);
    }

    /**
     * Remove all nametag entities from a mesh object.
     * @param mesh The mesh to remove all nametags from.
     */
    public static removeAll(mesh: Mesh | undefined | null): void {
        if (!mesh) {
            return;
        }
        const nametagMeshes = mesh.getChildMeshes(false, (node) => (/^Nametag/ui).test(node.name));
        nametagMeshes.forEach((nametagMesh) => nametagMesh.dispose(false, true));
    }
}
