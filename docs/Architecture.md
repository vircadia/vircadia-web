# Vircadia Web Architecture

**Vircadia Web** is a browser based user interface to [Vircadia] virtual worlds.
Vircadia Web connects to a [Vircadia Server] and presents a view into a 
virtual world ("domain") as well as providing user control over the features
of the virtual world (audio, chat, object manipulation, account control, etc.).

**Vircadia Web** has three layers:

1. **Vircadia Web**: a [Quasar]/[Vue] based user interface to a Vircadia
    virtual world. This provides a person a complete user interface
    to all the view and creation features necessary for viewing, interacting,
    and manipulation of the Vircadia virtual world through a browser
    based interface.
2. **Vircadia View Component**: a component that can be embedded in a browser
    page for viewer and optionally interacting with a Vircadia virtual world.
    This can be used for:

    * embedding a fixed view into a virtual world scene into a text web page
    * embedding a limited but interactive view into a virtual world scene
      as an addition to a web page
    * as the basis for a complete, interactive view into a virtual world scene

3. [Vircadia Web SDK]: the library that implements communiation with and
    programmatic control of all of a Vircadia Server's features.

## Vircadia Web

**Vircadia Web** is a full featured user interface for connecting to,
viewing, and interactive with a virtual world hosted by a [Vircadia Server].

**Vircadia Web** uses the [Quasar Framework] to implement the user interface
and application packaging. This means it presents [Material] based menus and
dialogs for controlling avatars and assets in the virtual world. Additionally,
[Quasar] enables **Vircadia Web** to be packaged as a desktop application, a
mobile application, or other web-centric build moded (SSR, ...).

## Vircadia View Component

The **Vircadia View Component** ("VVC") is an API based [TypeScript] component that 
presents an API for connecting to a [Vircadia Server], logging into a
[Vircadia Metaverse Server] account, displaying the virtual world scene
in a DOM canvas element, and programmatic control of all of the features
of the virtual world (audio, chat, scripts).

**Vircadia View Component** does not have world asset creation ability
(refer to tools like [Blender], etc for that) but it does have in-world
image manipultion operations for movement and placement of assets.

**VVC** displays the virtual world scene in a DOM canvas element that is
passed to **VVC**. This gives the web page that is embedding a virtual world
scene control over the placement and sizing of the view.
This allows embedding of simple views into a virtual world embedded
in a web page and allows the embedding page to control what, if any interaction
is allowed on that view. Thus there can be static views, views with automated
camera panning, views with audio, etc.

## Vircadia Web SDK

The Vircadia Web SDK is a JavaScript SDK for developing web-based clients for
virtual worlds powered by [Vircadia].
[Vircadia Server]s provide the worlds (a.k.a. "domains") to visit,
and the [Vircadia Metaverse Server] provides global services that connect the users and domains. 

[Vircadia]: https://vircadia.com
[Vircadia Web SDK]: https://github.com/vircadia/vircadia-web-sdk
[Vircadia Server]: https://github.com/vircadia/vircadia
[Vircadia Metaverse Server]: https://github.com/vircadia/Iamus
[TypeScript]: https://www.typescriptlang.org/
[Quasar]: https://quasar.dev/
[Quasar Framework]: https://quasar.dev/
[Material]: https://material.io/
[Vue]: https://vuejs.org/
[NodeJS]: https://nodejs.org/en/
[Blender]: https://www.blender.org/