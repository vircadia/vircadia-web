//
//  LightBuilder.ts
//
//  Created by Nolan Huang on 8 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IEntity, ILightEntity } from "../EntityInterfaces";
import { AbstractEntityBuilder } from "./AbstractEntityBuilder";
import { GameObject } from "@Base/modules/object";
import { LightEntityController } from "../components";

export class LightEntityBuilder extends AbstractEntityBuilder {
    // eslint-disable-next-line class-methods-use-this
    public build(gameObject: GameObject, entity: IEntity): void {
        gameObject.addComponent(new LightEntityController(entity as ILightEntity));
    }
}
