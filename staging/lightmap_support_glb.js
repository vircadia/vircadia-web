/* eslint-disable */

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera(
        "camera2",
        Math.PI / 2,
        Math.PI / 4,
        10,
        new BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight(
        "light2",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    light.intensity = 0.7;

    BABYLON.SceneLoader.ImportMesh(
        "",
        "https://digisomni-singapore-1.ap-south-1.linodeobjects.com/falah-tech/virtual-collaboration/Testing/Vircadia/Lightmaps/Test3/",
        "LightmapTest_jpg.glb",
        scene,
        function (newMeshes) {
            newMeshes.forEach((mesh) => {
                console.info(
                    "Mesh:",
                    mesh.name,
                    "has metadata:",
                    mesh.metadata
                );

                if (
                    mesh.metadata &&
                    mesh.metadata.gltf &&
                    mesh.metadata.gltf.extras &&
                    mesh.metadata.gltf.extras.vircadia_lightmap_default
                ) {
                    console.info(
                        "Found lightmap in metadata:",
                        mesh.metadata.gltf.extras.vircadia_lightmap_default
                    );
                    // Attempt to find the embedded lightmap texture by name
                    const lightmapName =
                        mesh.metadata.gltf.extras.vircadia_lightmap_default;

                    console.info(
                        "Before checking, here are the lightmaps:",
                        scene.textures
                    );
                    const embeddedLightmap = lightmaps.find(
                        (texture) => texture.name === lightmapName
                    );

                    console.info(
                        "Found embedded lightmap texture:",
                        embeddedLightmap
                    );
                    if (embeddedLightmap) {
                        mesh.material.lightmapTexture = embeddedLightmap;
                        mesh.material.useLightmapAsShadowmap = true;
                        mesh.material.lightmapTexture.coordinatesIndex =
                            mesh.metadata.gltf.extras.vircadia_lightmap_texcoord;
                        console.info(
                            "Successfully applied embedded lightmap texture:",
                            lightmapName
                        );
                    } else {
                        console.error(
                            "Failed to find embedded lightmap texture for:",
                            mesh.name,
                            "with lightmap name:",
                            lightmapName
                        );
                    }
                }
                // Check if the mesh name matches 'vircadia_lightmapData' and hide it
                if (mesh.name === "vircadia_lightmapData") {
                    mesh.isVisible = false; // This hides the mesh
                    console.info("Mesh vircadia_lightmapData is now hidden");
                }
            });
        }
    );

    return scene;
};
