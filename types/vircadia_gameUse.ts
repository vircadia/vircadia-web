export namespace glTF {
    export interface MetadataInterface {
        vircadia_lod_mode: LOD.Modes | null;
        vircadia_lod_auto: boolean | null;
        vircadia_lod_distance: number | null;
        vircadia_lod_size: number | null;
        vircadia_lod_hide: number | null;
        vircadia_billboard_mode: string | null;
        // Lightmap
        vircadia_lightmap_default: string | null;
        vircadia_lightmap_texcoord: number | null;
    }

    export class Metadata implements MetadataInterface {
        public vircadia_lod_mode: LOD.Modes | null = null;
        public vircadia_lod_auto: boolean | null = null;
        public vircadia_lod_distance: number | null = null;
        public vircadia_lod_size: number | null = null;
        public vircadia_lod_hide: number | null = null;
        public vircadia_billboard_mode: string | null = null;
        public vircadia_lightmap_default: string | null = null;
        public vircadia_lightmap_texcoord: number | null = null;
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
    }
}
