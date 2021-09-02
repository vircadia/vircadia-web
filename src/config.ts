//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/**
 * 'Config' provides the interface for user/session configuration parameters.
 * Parameters are currently kept in a browser local "localStorage" but could
 * eventually be kept on in the cloud (some per-user storage). This interface
 * hides this detail from the application code.
 */
export const Config = {
    /** Fetch a configuration value from configuration storage.
     *
     * @param Name of the configuration parameter to fetch
     * @param Default optional default value to return if parameter is not in config storage
     * @throws Error if parameter does not exist and a default was not given
     */
    getItem(pParamName: string, pDefault?: string): string {
        const val = localStorage.getItem(pParamName);
        if (typeof val !== "string") {
            if (pDefault) {
                return pDefault;
            }
            throw new Error("Config.getItem: fetch of non-existant parameter: " + pParamName);
        }
        return val;
    },
    /** Set the value of a configuration parameter
     *
     * @param Name parameter to set
     * @param Value string value to set
     */
    setItem(pParamName: string, pParamValue: string): void {
        localStorage.setItem(pParamName, pParamValue);
    }
};
