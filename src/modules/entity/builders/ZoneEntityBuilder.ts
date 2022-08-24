//
//  EnvironmentEntityBuilder.ts
//
//  Created by Nolan Huang on 9 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/* eslint-disable @typescript-eslint/no-unused-vars */
import { IEntity, IZoneEntity } from "../EntityInterfaces";
import { GameObject } from "@Base/modules/object";
import { ZoneEntityController } from "../components";

const DefaultSkyBoxSize = 2000;
const DefaultCubeMapSize = 1024;

export class ZoneEntityBuilder {
    // eslint-disable-next-line class-methods-use-this
    public build(gameObject: GameObject, entity: IEntity) : void {
        const zoneEnitiy = entity as IZoneEntity;

        if (!gameObject.getComponent(ZoneEntityController.typeName)) {
            gameObject.addComponent(new ZoneEntityController(zoneEnitiy));
        }
    }
}
