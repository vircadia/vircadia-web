export namespace glTF {
    export interface MetadataInterface {
        vircadia_lod_mode: LOD.Modes | null;
        vircadia_lod_auto: boolean | null;
        vircadia_lod_distance: number | null;
        vircadia_lod_size: number | null;
        vircadia_lod_hide: number | null;
        vircadia_billboard_mode: string | null;
        // Lightmap
        vircadia_lightmap: string | null;
        vircadia_lightmap_texcoord: number | null;
        vircadia_lightmap_use_as_shadowmap: boolean | null;
        // Lightmap -> Lights
        vircadia_lightmap_mode: Lightmap.Modes | null;
    }

    export class Metadata implements MetadataInterface {
        [key: string]: LOD.Modes | Lightmap.Modes | boolean | number | string | null;

        public vircadia_lod_mode = null;
        public vircadia_lod_auto = null;
        public vircadia_lod_distance = null;
        public vircadia_lod_size = null;
        public vircadia_lod_hide = null;
        public vircadia_billboard_mode = null;
        // Lightmap
        public vircadia_lightmap = null;
        public vircadia_lightmap_texcoord = null;
        public vircadia_lightmap_use_as_shadowmap = null;
        // Lightmap -> Lights
        public vircadia_lightmap_mode = null;

        constructor(metadata?: Partial<NonNullable<MetadataInterface>>) {
            if (metadata) {
                Object.assign(this, metadata);
            }
        }
    }

    export namespace LOD {
        export enum Modes {
            DISTANCE = "distance",
            SIZE = "size",
        }

        export enum Levels {
            LOD0 = "LOD0",
            LOD1 = "LOD1",
            LOD2 = "LOD2",
            LOD3 = "LOD3",
            LOD4 = "LOD4",
        }
    }

    export enum BillboardModes {
        BILLBOARDMODE_NONE = 0,
        BILLBOARDMODE_X = 1,
        BILLBOARDMODE_Y = 2,
        BILLBOARDMODE_Z = 4,
        BILLBOARDMODE_ALL = 7,
    }

    export namespace Lightmap {
        export const DATA_MESH_NAME = "vircadia_lightmapData";

        export enum Modes {
            DEFAULT = "default",
            SHADOWSONLY = "shadowsOnly",
            SPECULAR = "specular",
        }
    }
}
