//
//  index.ts
//
//  Created by Nolan Huang on 4 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

export { GameObject } from "./GameObject";
export type { IComponent } from "./component";
export { AbstractComponent, GenericNodeComponent } from "./component";
export { MeshComponent, MeshColliderComponent, BoxColliderComponent, CapsuleColliderComponent,
    LightComponent, AmbientLightComponent } from "./components";

export const MASK_MESH_RENDER_GROUP_ID = 0;
export const DEFAULT_MESH_RENDER_GROUP_ID = 1;
