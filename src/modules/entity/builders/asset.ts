//
//  asset.ts
//
//  Created by Nolan Huang on 28 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

export class AssetUrl {
    _url: string;
    _rootUrl: string;
    _filename: string;

    constructor(url: string) {
        this._url = url;
        const index = url.lastIndexOf("/") + 1;
        if (index > 0) {
            this._rootUrl = url.substring(0, index);
            this._filename = url.substring(index);
        } else {
            this._rootUrl = url;
            this._filename = "";
        }
    }

    public get rootUrl(): string {
        return this._rootUrl;
    }

    public get filename(): string {
        return this._filename;
    }

    public get fileExtension(): string {
        const index = this._filename.lastIndexOf(".");
        return index > 0 ? this._filename.substring(index + 1) : "";
    }

    public isFile(): boolean {
        return this._filename.length > 0;
    }
}
