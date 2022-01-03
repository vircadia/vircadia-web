/*
//  log.js
//
//  Created by Kalila L. on May 10th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

const Log = (function() {

    enum types {
        ACCOUNT = "[ACCOUNT]",
        AUDIO = "[AUDIO]",
        AVATAR = "[AVATAR]",
        COMM = "[COMM]",
        ENTITIES = "[ENTITIES]",
        METAVERSE = "[METAVERSE]",
        MESSAGES = "[MESSAGES]",
        OTHER = "[OTHER]",
        PEOPLE = "[PEOPLE]",
        PLACES = "[PLACES]",
        UI = "[UI]"
    }

    enum levels {
        ERROR = "[ERROR]",
        DEBUG = "[DEBUG]",
        WARN = "[WARN]",
        INFO = "[INFO]"
    }

    let logLevel = levels.DEBUG;

    function print(pType: types, pLevel: levels, pMsg: string): void {
        console.info(pType, pLevel, pMsg);
    }

    // debug log message. Output if level is set to DEBUG
    function debug(pType: types, pMsg: string) {
        if (logLevel === levels.DEBUG) {
            print(pType, levels.DEBUG, pMsg);
        }
    }

    // error log message. Always output
    function error(pType: types, pMsg: string) {
        print(pType, levels.ERROR, pMsg);
    }

    // warn log message. output if level is warn or above
    function warn(pType: types, pMsg: string) {
        if (logLevel in [levels.WARN, levels.DEBUG, levels.ERROR]) {
            print(pType, levels.WARN, pMsg);
        }
    }

    // Info log messages -- always output
    function info(pType: types, pMsg: string) {
        print(pType, levels.INFO, pMsg);
    }

    // Set the log level to the passed string
    function setLogLevel(pLevel: string): void {
        switch (pLevel) {
            case "none": logLevel = levels.INFO; break;
            case "info": logLevel = levels.INFO; break;
            case "[INFO]": logLevel = levels.INFO; break;
            case "warn": logLevel = levels.WARN; break;
            case "[WARN]": logLevel = levels.WARN; break;
            case "debug": logLevel = levels.DEBUG; break;
            case "[DEBUG]": logLevel = levels.DEBUG; break;
            default: logLevel = levels.DEBUG;
        }
        info(types.OTHER, `Logging level set to ${logLevel}`);
    }

    return {
        // Tables
        types,
        levels,
        logLevel,
        // Functions
        print,
        setLogLevel,
        debug,
        error,
        warn,
        info
    };
}());

export default Log;
