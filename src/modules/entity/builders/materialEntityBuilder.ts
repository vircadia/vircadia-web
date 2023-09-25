//
//  materialEntityBuilder.ts
//
//  Created by Nolan Huang on 9 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IEntity, IMaterialEntity } from "../EntityInterfaces";
import { AbstractEntityBuilder } from "./AbstractEntityBuilder";
import { GameObject } from "@Base/modules/object";
import { MaterialEntityController } from "../components";

export class MaterialEntityBuilder extends AbstractEntityBuilder {
    // eslint-disable-next-line class-methods-use-this
    public build(gameObject: GameObject, entity: IEntity): void {
        gameObject.addComponent(new MaterialEntityController(entity as IMaterialEntity));
    }
}
