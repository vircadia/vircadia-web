//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/**
 * 'Config' provides the interface for user/session configuration parameters.
 * Parameters are currently kept in a browser local "localStorage" but could
 * eventually be kept on in the cloud (some per-user storage). This interface
 * hides this detail from the application code.
 *
 * UPDATE: The majority of this functionality has been moved to the store.
 * TODO: Rename this file to something-CONSTS, as it no longer pertains to user configuration, the Vue store handles that.
 */

/**
 * Default configuration values.
 */
// TrueValue or FalseValue on whether to do reconnect when the browser is opened
export const RECONNECT_ON_STARTUP = "Reconnect_On_Startup";
// If no metaverse is remembered, use this one
export const DEFAULT_METAVERSE_URL = "Default_Metaverse_Url";
// The URL of the last domain-server connected to
export const LAST_DOMAIN_SERVER = "Last_Domain_Server";
// The default protocol string for connecting to domain
export const DEFAULT_DOMAIN_PROTOCOL = "Default_Domain_Protocol";
export const DEFAULT_DOMAIN_PORT = "Default_Domain_Port";
// The user's saved audio input and output devices
export const USER_AUDIO_INPUT = "User_Audio_Input_Device";
export const USER_AUDIO_OUTPUT = "User_Audio_Output_Device";
// Log level to begin with
export const LOG_LEVEL = "Log_Level";

export const TrueValue = "true";
export const FalseValue = "false";

// Frequency in milliseconds to update the current location in the browser's URL bar.
// Set to 0 to disable rate limiting, or -1 to disable updates completely.
export const URL_UPDATE_FREQUENCY = 1000;

export const Config = {
    // Entries can be prefixed with a qualifier.
    // This is often the account name to allow multiple accounts on one computer
    _qualify: "",

    /**
     * Initialize the configuration system.
     *
     * While there is not much to be done today, someday the configuration information
     * might be stored in the cloud so some setup will be needed.
     */
    initialize(): void {
        //
    },

    /** Fetch a configuration value from configuration storage.
     *
     * @param Name of the configuration parameter to fetch
     * @param Default optional default value to return if parameter is not in config storage
     * @param {boolean} pGlobal if 'true', parameter name is not qualified (considered global)
     * @throws Error if parameter does not exist and a default was not given
     */
    getItem(pParamName: string, pDefault?: string, pGlobal = false): string {
        const val = localStorage.getItem(pGlobal ? "" : Config._qualify + pParamName);
        if (typeof val !== "string") {
            if (pDefault) {
                return pDefault;
            }
            throw new Error("Config.getItem: fetch of non-existent parameter: " + pParamName);
        }
        return val;
    },

    /** Set the value of a configuration parameter
     *
     * @param Name parameter to set
     * @param Value string value to set
     * @param {boolean} pGlobal if 'true', parameter name is not qualified (considered global)
     */
    setItem(pParamName: string, pParamValue: string, pGlobal = false): void {
        localStorage.setItem(pGlobal ? "" : Config._qualify + pParamName, pParamValue);
    },

    /**
     * Set a qualifier to be added to each configuration name entry. This is often
     * the account name so multiple accounts can be on the same computer.
     *
     * Note that a separator "." is added to the qualifier string to make
     * the construction of the qualified configuration name easier.
     *
     * @param pQualifier string to be added to beginning of config entries
     */
    setQualifier(pQualifier: string): void {
        if (pQualifier.endsWith(".")) {
            Config._qualify = pQualifier;
        } else {
            Config._qualify = pQualifier + ".";
        }
    }
};
