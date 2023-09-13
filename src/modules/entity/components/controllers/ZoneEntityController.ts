//
//  ZoneEntityController.ts
//
//  Created by Nolan Huang on 18 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable new-cap */

import { watch } from "vue";
import { EntityController } from "./EntityController";
import { IZoneEntity } from "../../EntityInterfaces";
import { SkyboxComponent, KeyLightComponent, HazeComponent } from "../components";
import { AmbientLightComponent } from "@Modules/object";
import { AssetUrl } from "../../builders";
import {
    HemisphericLight, Vector3, DefaultRenderingPipeline, CubeTexture, HDRCubeTexture,
    VolumetricLightScatteringPostProcess, Nullable,
    Camera, Texture, StandardMaterial
} from "@babylonjs/core";
import { IVector3Property } from "../../EntityProperties";
import { EntityMapper } from "../../package";
import { userStore } from "@Stores/index";

type EnvironmentSettings = {
    environmentTexture?: string | undefined,
};

type GlowLayerSettings = {
    blurKernelSize?: number | undefined,
    intensity?: number | undefined
};

type VolumetricLightSettings = {
    textureURL: string | undefined,
    position: IVector3Property | undefined,
    dimensions: IVector3Property | undefined,
    samples: number | undefined
};

type RenderingPipelineSettings = {
    fxaaEnabled?: boolean | undefined,
    glowLayerEnabled?: boolean | undefined,
    glowLayer?: GlowLayerSettings | undefined
};

type PostProcessingSettings = {
    volumetricLightEnabled?: boolean | undefined,
    volumetricLight?: VolumetricLightSettings | undefined
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SkyBoxSettings = {
    fxaaEnabled?: boolean | undefined,
    glowLayerEnabled?: boolean | undefined,
    glowLayer?: GlowLayerSettings | undefined
};

type ZoneExtensions = {
    environment?: EnvironmentSettings | undefined,
    renderingPipeline?: RenderingPipelineSettings | undefined,
    postProcessing?: PostProcessingSettings | undefined,
};

export class ZoneEntityController extends EntityController {
    private _zoneEntity: IZoneEntity;
    private _skybox: Nullable<SkyboxComponent> = null;
    private _ambientLight: Nullable<AmbientLightComponent> = null;
    private _keyLight: Nullable<KeyLightComponent> = null;
    private _haze: Nullable<HazeComponent> = null;
    private _vls: Nullable<VolumetricLightScatteringPostProcess> = null;
    private _watchingGraphicsSettings = false;

    constructor(entity: IZoneEntity) {
        super(entity, ZoneEntityController.typeName);
        this._zoneEntity = entity;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return ZoneEntityController.typeName;
    }

    static get typeName(): string {
        return "ZoneEntityController";
    }

    public onInitialize(): void {
        super.onInitialize();

        this._zoneEntity.onShapeTypeChanged?.add(this._handleShapeTypeChanged.bind(this));
        this._zoneEntity.onSkyboxPropertiesChanged?.add(this._updateSkybox.bind(this));
        this._zoneEntity.onAmbientLightPropertiesChanged?.add(this.updateAmbientLight.bind(this));
        this._zoneEntity.onKeyLightPropertiesChanged?.add(this.updateKeyLight.bind(this));
        this._zoneEntity.onHazePropertiesChanged?.add(this.updateHaze.bind(this));
        this._zoneEntity.onUserDataChanged?.add(this._updateUserData.bind(this));

        this._zoneEntity.onDimensionChanged?.add(this._updateDimensions.bind(this));
    }

    public onStart(): void {
        this._updateSkybox();
        this.updateAmbientLight();
        this.updateKeyLight();
        this.updateHaze();
        this._updateUserData();

        super.onStart();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate(): void {
    }

    public dispose(): void {
        if (this._scene.activeCamera && this._vls) {
            this._vls.dispose(this._scene.activeCamera);
        }
        super.dispose();
    }

    protected _handleShapeTypeChanged(): void {
        // eslint-disable-next-line no-empty
        if (this._gameObject) {

        }
    }

    protected _updateDimensions(): void {
        if (!this._zoneEntity.skybox) {
            return;
        }

        // reload sky box mesh
        if (this._skybox) {
            this._skybox.load(this._zoneEntity.skybox, this._zoneEntity.dimensions, this._zoneEntity.id);
        }

        this._updateSkybox();
    }

    protected _updateSkybox(): void {
        if (this._zoneEntity.skyboxMode === "enabled" && this._zoneEntity.skybox && this._gameObject) {
            if (!this._skybox) {
                this._skybox = new SkyboxComponent();
                this._gameObject.addComponent(this._skybox);
                this._skybox.load(this._zoneEntity.skybox, this._zoneEntity.dimensions, this._zoneEntity.id);
            }
            this._skybox.update(this._zoneEntity.skybox);
            this._skybox.enable = true;
        } else if (this._skybox) {
            this._skybox.enable = false;
        }
    }

    protected updateAmbientLight(): void {
        if (this._zoneEntity.ambientLightMode === "enabled" && this._zoneEntity.ambientLight && this._gameObject) {
            if (!this._ambientLight) {
                this._ambientLight = new AmbientLightComponent();
                this._ambientLight.light = new HemisphericLight("AmbientLight", Vector3.Up(), this._gameObject.getScene());
                this._gameObject.addComponent(this._ambientLight);
            }

            if (this._ambientLight.light) {
                this._ambientLight.light.setEnabled(true);
                if (typeof this._zoneEntity.ambientLight.ambientIntensity === "number") {
                    this._ambientLight.light.intensity = this._zoneEntity.ambientLight.ambientIntensity;
                    this._scene.environmentIntensity = this._zoneEntity.ambientLight.ambientIntensity;
                }
            }

        } else if (this._ambientLight) {
            this._ambientLight.light?.setEnabled(false);
        }
    }

    protected updateKeyLight(): void {
        if (this._zoneEntity.keyLightMode === "enabled" && this._zoneEntity.keyLight && this._gameObject) {
            if (!this._keyLight) {
                this._keyLight = new KeyLightComponent(this._zoneEntity.keyLight, this._gameObject.getScene());
                this._gameObject.addComponent(this._keyLight);
            }
            this._keyLight.update(this._zoneEntity.keyLight);
            this._keyLight.enable = true;
        } else if (this._keyLight) {
            this._keyLight.enable = false;
        }
    }

    protected updateHaze(): void {
        if (this._zoneEntity.hazeMode === "enabled" && this._zoneEntity.haze && this._gameObject) {
            if (!this._haze) {
                this._haze = new HazeComponent(this._zoneEntity.haze, this._gameObject.getScene());
                this._gameObject.addComponent(this._haze);
            }
            this._haze.update(this._zoneEntity.haze);
            this._haze.enable = true;
        } else if (this._haze) {
            this._haze.enable = false;
        }
    }

    protected _updateUserData(): void {
        const userData = this._zoneEntity.userData
            ? JSON.parse(this._zoneEntity.userData) as ZoneExtensions
            : undefined;
        this._updateEnvironment(userData);
        this._updateDefaultRenderingPipeline(userData);
        this._updateVolumetricLight(userData);
    }

    protected _updateEnvironment(userData: ZoneExtensions | undefined): void {
        if (userData && userData.environment && userData.environment.environmentTexture) {
            if (this._scene.environmentTexture
                && this._scene.environmentTexture.name !== userData.environment.environmentTexture) {
                this._scene.environmentTexture.dispose();
            }

            const url = new AssetUrl(userData.environment.environmentTexture);

            if (url.fileExtension === "hdr") {
                this._scene.environmentTexture = new HDRCubeTexture(userData.environment.environmentTexture,
                    this._scene, 512, false, true, false, true);

            } else if (url.fileExtension === "env") {
                this._scene.environmentTexture = new CubeTexture(userData.environment.environmentTexture, this._scene);
            }
        }
    }

    protected _updateDefaultRenderingPipeline(userData: ZoneExtensions | undefined): void {
        if (!userData || !userData.renderingPipeline) {
            return;
        }
        let defaultPipeline = this._scene.postProcessRenderPipelineManager.supportedPipelines
            .find((value) => value.name === "default") as DefaultRenderingPipeline;
        if (!defaultPipeline) {
            defaultPipeline = new DefaultRenderingPipeline("default", true, this._scene, this._scene.cameras);
        }

        const glowLayer = userData.renderingPipeline.glowLayer;
        if (glowLayer && defaultPipeline.glowLayer) {
            if (typeof glowLayer.blurKernelSize === "number") {
                defaultPipeline.glowLayer.blurKernelSize = glowLayer.blurKernelSize;
            }
            if (typeof glowLayer.intensity === "number") {
                defaultPipeline.glowLayer.intensity = glowLayer.intensity;
            }
        }

        const updatePipelineSettings = (): void => {
            const enableBloomAndGlow = userStore.graphics.bloom && (userData?.renderingPipeline?.glowLayerEnabled ?? true);
            defaultPipeline.bloomEnabled = enableBloomAndGlow;
            defaultPipeline.fxaaEnabled = userStore.graphics.fxaaEnabled && (userData?.renderingPipeline?.fxaaEnabled ?? true);
            defaultPipeline.glowLayerEnabled = enableBloomAndGlow;
            defaultPipeline.samples = Number(userStore.graphics.msaa);
            defaultPipeline.sharpenEnabled = Boolean(userStore.graphics.sharpen);
        };

        // Update the rendering pipeline when the user changes their graphics settings.
        const watchGraphicsSettings = (): void => {
            // Ensure only one watcher is created.
            if (!this._watchingGraphicsSettings) {
                watch(() => userStore.graphics, updatePipelineSettings.bind(this), { deep: true });
                this._watchingGraphicsSettings = true;
            }
        };

        updatePipelineSettings();
        watchGraphicsSettings();
    }

    protected _updateVolumetricLight(userData: ZoneExtensions | undefined): void {
        const volumetricLightEnabled = userData?.postProcessing?.volumetricLightEnabled;
        const volumetricLightSettings = userData?.postProcessing?.volumetricLight;
        if (volumetricLightEnabled && volumetricLightSettings) {
            if (!this._vls) {
                this._vls = new VolumetricLightScatteringPostProcess(
                    "vls", 1.0, this._scene._activeCamera as Camera,
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    undefined, volumetricLightSettings.samples && 100,
                    Texture.BILINEAR_SAMPLINGMODE,
                    this._scene.getEngine(), false);
                this._vls.mesh.parent = this._gameObject;
            }

            const material = this._vls.mesh.material as StandardMaterial;
            if (material) {
                if (volumetricLightSettings.textureURL) {
                    material.diffuseTexture = new Texture(
                        volumetricLightSettings.textureURL,
                        this._scene, true, false, Texture.BILINEAR_SAMPLINGMODE);
                    material.diffuseTexture.hasAlpha = true;
                } else {
                    this._vls.useDiffuseColor = true;
                }
            }

            if (volumetricLightSettings.position) {
                this._vls.mesh.position = EntityMapper.mapToVector3(volumetricLightSettings.position);
            }

            if (volumetricLightSettings.dimensions) {
                this._vls.mesh.scaling = EntityMapper.mapToScale(volumetricLightSettings.dimensions);
            }

        } else if (this._vls) {
            this._vls.mesh.isVisible = false;
        }
    }
}
