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

import { IEntity, IZoneEntity } from "../EntityInterfaces";
import { GameObject } from "@Base/modules/object";
import { ZoneEntityController } from "../components/controllers/ZoneEntityController";

export class ZoneEntityBuilder {
    public build(gameObject: GameObject, entity: IEntity): void {
        const zoneEntity = entity as IZoneEntity;
        const controller = new ZoneEntityController(zoneEntity);
        gameObject.addComponent(controller);

        // Log the zone entity properties before creating the mesh
        console.log(`Building zone entity ${zoneEntity.id}`);
        console.log(`Shape type: ${zoneEntity.shapeType}`);
        console.log(`Compound shape URL: ${zoneEntity.compoundShapeURL}`);

        // Delay the mesh creation to ensure all properties are set
        setTimeout(() => {
            controller.createZoneMesh();
        }, 0);

        console.log(`Zone entity built for zone ${zoneEntity.id}`);
        console.log(`GameObject name: ${gameObject.name}`);
        console.log(`Zone position: ${gameObject.position.toString()}`);
    }
}
