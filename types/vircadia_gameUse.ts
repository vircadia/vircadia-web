export namespace Mesh {
    export interface Metadata {
        vircadia_lod_mode?: LOD.Modes;
        vircadia_lod_auto?: boolean;
        vircadia_lod_distance?: number;
        vircadia_lod_size?: number;
        vircadia_lod_hide?: number;
        vircadia_billboard_mode?: string;
        // Lightmap
        vircadia_lightmap_default?: string,
        vircadia_lightmap_texcoord?: number
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
        export const LightmapDataMesh = "vircadia_lightmapData_"; // + lightmap name
    }
}
