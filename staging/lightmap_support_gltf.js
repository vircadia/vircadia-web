/* eslint-disable */

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera(
        "camera1",
        Math.PI / 2,
        Math.PI / 4,
        10,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    light.intensity = 0.7;

    BABYLON.SceneLoader.ImportMesh(
        "",
        "https://digisomni-singapore-1.ap-south-1.linodeobjects.com/falah-tech/virtual-collaboration/Testing/Vircadia/Lightmaps/Test2/",
        "LightmapTest_jpg.gltf",
        scene,
        function (newMeshes) {
            newMeshes.forEach((mesh) => {
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
                    const baseLightmapUrl =
                        "https://digisomni-singapore-1.ap-south-1.linodeobjects.com/falah-tech/virtual-collaboration/Testing/Vircadia/Lightmaps/Test2/" +
                        mesh.metadata.gltf.extras.vircadia_lightmap_default;
                    const extensions = [
                        ".png",
                        ".webp",
                        ".exr",
                        ".jpg",
                        ".jpeg",
                    ];
                    let lightmapTextureLoaded = false;

                    extensions.forEach((ext) => {
                        const lightmapTextureUrl = baseLightmapUrl + ext;
                        console.info(
                            "Trying to load lightmap texture:",
                            lightmapTextureUrl
                        );
                        var lightmapTexture = new BABYLON.Texture(
                            lightmapTextureUrl,
                            scene,
                            true,
                            false,
                            BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
                            () => {
                                mesh.material.lightmapTexture = lightmapTexture;
                                mesh.material.useLightmapAsShadowmap = true;
                                mesh.material.lightmapTexture.coordinatesIndex =
                                    mesh.metadata.gltf.extras.vircadia_lightmap_texcoord;
                                console.info(
                                    "Successfully loaded lightmap texture:",
                                    lightmapTextureUrl
                                );
                                lightmapTextureLoaded = true;
                            },
                            (message, exception) => {
                                console.error(
                                    "Failed to load lightmap texture:",
                                    lightmapTextureUrl,
                                    message,
                                    exception
                                );
                            },
                            null,
                            true
                        );
                    });

                    if (!lightmapTextureLoaded) {
                        console.error(
                            "Failed to load lightmap texture for:",
                            mesh.name
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
