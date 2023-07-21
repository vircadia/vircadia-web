/*
//  log.js
//
//  Created by Kalila L. on May 10th, 2021.
//  Refactored by Giga on June 28th, 2023.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

type UnknownError = { error?: string; message?: string; };

enum LogType {
    ACCOUNT = "[ACCOUNT]",
    AUDIO = "[AUDIO]",
    AVATAR = "[AVATAR]",
    ENTITIES = "[ENTITIES]",
    METAVERSE = "[METAVERSE]",
    MESSAGES = "[MESSAGES]",
    NETWORK = "[NETWORK]",
    OTHER = "[OTHER]",
    PEOPLE = "[PEOPLE]",
    PLACES = "[PLACES]",
    UI = "[UI]"
}

enum LogLevel {
    ERROR = "[ERROR]",
    DEBUG = "[DEBUG]",
    WARN = "[WARN]",
    INFO = "[INFO]"
}

/**
 * Extract the error string from a thrown error.
 *
 * A `catch` statement can receive anything that is thrown. This function will search through that thrown thing for a valid error message.
 *
 * @param error An error object caught by a `catch`.
 * @returns The extracted error message.
 */
export function findErrorMessage(error: unknown): string {
    if (!error) {
        return "";
    }
    if (typeof error === "string") {
        return error;
    }
    const narrowedError = error as UnknownError;
    if ("message" in narrowedError && narrowedError.message) {
        return narrowedError.message;
    }
    if ("error" in narrowedError && narrowedError.error) {
        return narrowedError.error;
    }
    return `Error: ${JSON.stringify(error)}`;
}

export default class Log {
    /**
     * The threshold log level.
     * Log requests that don't meet this threshold will be ignored.
     */
    private static _logLevel = LogLevel.DEBUG;

    /**
     * The history of all printed log messages.
     */
    private static _logHistory: Array<string> = [];

    /**
     * Available logging levels.
     */
    public static levels = LogLevel;

    /**
     * Available logging types.
     */
    public static types = LogType;

    /**
     * Print a message to the log.
     * @param type
     * @param level
     * @param message
     */
    public static print(type: LogType, level: LogLevel, message: string, ...optionalMessages: string[]): void {
        console.info(type, level, message, ...optionalMessages);
        const time = new Date().toISOString();
        this._logHistory.push([time, type, level, message, ...optionalMessages].join(" "));
    }

    /**
     * Print a debug message to the log.
     * (Ignored if the log level is not set to `DEBUG`.)
     * @param type
     * @param message
     */
    public static debug(type: LogType, message: string, ...optionalMessages: string[]): void {
        if (this._logLevel === LogLevel.DEBUG) {
            this.print(type, LogLevel.DEBUG, message, ...optionalMessages);
        }
    }

    /**
     * Print an error message to the log.
     * @param type
     * @param message
     */
    public static error(type: LogType, message: string, ...optionalMessages: string[]): void {
        this.print(type, LogLevel.ERROR, message, ...optionalMessages);
    }

    /**
     * Print a warning message to the log.
     * (Ignored if the log level is not set to `WARN`, `DEBUG`, or `ERROR`.)
     * @param type
     * @param message
     */
    public static warn(type: LogType, message: string, ...optionalMessages: string[]): void {
        if (this._logLevel in [LogLevel.WARN, LogLevel.DEBUG, LogLevel.ERROR]) {
            this.print(type, LogLevel.WARN, message, ...optionalMessages);
        }
    }

    /**
     * Print a message to the log.
     * @param type
     * @param message
     */
    public static info(type: LogType, message: string, ...optionalMessages: string[]): void {
        this.print(type, LogLevel.INFO, message, ...optionalMessages);
    }

    /**
     * Set the log level.
     * @param level
     */
    public static setLogLevel(level: LogLevel | string): void {
        switch (level.toLowerCase()) {
            case "none": this._logLevel = LogLevel.INFO; break;
            case "info": this._logLevel = LogLevel.INFO; break;
            case "[info]": this._logLevel = LogLevel.INFO; break;
            case "warn": this._logLevel = LogLevel.WARN; break;
            case "[warn]": this._logLevel = LogLevel.WARN; break;
            case "debug": this._logLevel = LogLevel.DEBUG; break;
            case "[debug]": this._logLevel = LogLevel.DEBUG; break;
            case "error": this._logLevel = LogLevel.DEBUG; break;
            case "[error]": this._logLevel = LogLevel.DEBUG; break;
            default: this._logLevel = LogLevel.DEBUG;
        }
        this.info(LogType.OTHER, `Logging level set to ${this._logLevel}`);
    }

    /**
     * Dump the history of all printed log messages to a string.
     */
    public static dump(): string {
        return this._logHistory.join("\n");
    }
}
