//
//  index.ts
//
//  Created by Giga on 26 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { ThemeConfig } from "./config";

interface ConfigChangeCallbackFunction {
    (configKey: string, value: boolean | string | number, timestamp?: number): void
}

interface ConfigChangeCallbackFunctionMap {
    [key: string]: ConfigChangeCallbackFunction[]
}

interface ConfigCallbackOptions {
    configKey?: string,
    callback: ConfigChangeCallbackFunction
}

export interface ThemeMgr {
    config: ThemeConfig,
    configHasChanged: boolean,
    configChangeCallbacks: {
        general: ConfigChangeCallbackFunction[],
        specific: ConfigChangeCallbackFunctionMap
    }
}

export class ThemeMgr {
    constructor(config: ThemeConfig) {
        this.config = config;
    }

    configChangeCallbacks = {
        general: [] as ConfigChangeCallbackFunction[],
        specific: {} as ConfigChangeCallbackFunctionMap
    };

    get(string: keyof ThemeConfig): void {
        console.log(this.config[string]);
    }

    set(string: keyof ThemeConfig): void {
        console.log(this.config[string]);
    }

    onChange(options: ConfigCallbackOptions): void {
        // Ignore call if no callback was passed.
        if ("callback" in options) {
            // Append the callback the callback list specified by the passed configKey.
            if ("settingKey" in options) {
                const configKey = options.configKey as string;
                if (!(configKey in this.configChangeCallbacks.specific)) {
                    this.configChangeCallbacks.specific[configKey] = [] as ConfigChangeCallbackFunction[];
                }
                this.configChangeCallbacks.specific[configKey]?.push(options.callback);
            // Append the callback to the general callback list.
            } else {
                this.configChangeCallbacks.general.push(options.callback);
            }
        }
    }
}
