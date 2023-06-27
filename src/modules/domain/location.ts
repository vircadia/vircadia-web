//
//  location.ts
//
//  Created by Nolan Huang on 28 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/* eslint-disable @typescript-eslint/no-magic-numbers */

export class Location {
    _href: string;
    _protocol = "";
    _host = "";
    _hostname = "";
    _port = "";
    _pathname = "";
    _position = "";
    _orientation = "";

    constructor(url: string) {
        this._href = url.toLocaleLowerCase();

        if (this._href.startsWith("/")) {
            this._parsePath(0, url.length);
        } else {
            this._parseLocation();
        }

        this._updateHref();
    }

    public get href(): string {
        return this._href;
    }

    public get pathname(): string {
        return this._pathname;
    }

    public get protocol(): string {
        return this._protocol;
    }

    public set protocol(value: string) {
        this._protocol = value;
        this._updateHref();
    }

    public get host(): string {
        return this.port.length > 0 ? this._hostname + ":" + this._port : this._hostname;
    }

    public get port(): string {
        return this._port;
    }

    public set port(value: string) {
        this._port = value;
        this._updateHost();
        this._updateHref();
    }

    public get position(): string {
        return this._position;
    }

    public get orientation(): string {
        return this._orientation;
    }

    private _parseLocation(): void {
        let start = 0;
        // parse protocol
        let end = this._href.indexOf("://", start);
        if (end > 0) {
            this._protocol = this._href.substring(start, end + 1);
            start = end + 3;
        }

        // parse host and path
        end = this._href.indexOf("/", start);
        if (end >= 0) {
            this._parseHost(start, end);
            this._parsePath(end, this._href.length);
        } else {
            this._parseHost(start, this._href.length);
        }
    }

    private _parseHost(start: number, end: number): void {
        this._host = this._href.substring(start, end);

        // parse port
        const index = this._host.indexOf(":");
        if (index > 0) {
            this._hostname = this._host.substring(0, index);
            this._port = this._host.substring(index + 1);
        } else {
            this._hostname = this._host;
        }

    }

    private _parsePath(start: number, end: number): void {
        this._pathname = this._href.substring(start, end);
        const orientStart = this.pathname.indexOf("/", 1);
        if (orientStart > 0) {
            this._position = this._pathname.substring(1, orientStart);

            let orientEnd = this.pathname.indexOf("/", orientStart + 1);
            if (orientEnd < 0) {
                orientEnd = this.pathname.length;
            } else {
                // trim extra path
                this._pathname = this._pathname.substring(0, orientEnd);
            }
            this._orientation = this._pathname.substring(orientStart + 1, orientEnd);
        } else {
            // position only
            this._position = this._pathname.substring(1);
        }
    }

    private _updateHref(): void {
        this._href = this._protocol.length > 0
            ? this._protocol + "//" + this.host + this.pathname
            : this.host + this.pathname;
    }

    private _updateHost(): void {
        this._host = this.port.length > 0
            ? this._hostname + ":" + this._port
            : this._hostname;
    }
}
