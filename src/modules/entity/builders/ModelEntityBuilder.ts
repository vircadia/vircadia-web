//
//  ModelEntityBuilder.ts
//
//  Created by Nolan Huang on 26 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-unused-vars */
import { IEntity, IModelEntity } from "../Entities";
import { AbstractEntityBuilder } from "./AbstractEntityBuilder";


import { GameObject } from "@Base/modules/object";
import { ModelEntityController } from "../components";

export class ModelEntityBuilder extends AbstractEntityBuilder {

    // eslint-disable-next-line class-methods-use-this
    public build(gameObject: GameObject, entity: IEntity) : void {
        const modelEntity = entity as IModelEntity;

        if (!gameObject.getComponent("ModelEntityController")) {
            gameObject.addComponent(new ModelEntityController(modelEntity));
        }
    }

}
