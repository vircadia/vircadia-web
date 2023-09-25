/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// TEMPORARY definitions for the interface to vircadia-web-sdk
// This will be replaced with an official definition.
declare module "@vircadia/web-sdk" {

    export const Vircadia: {
        version: string;
        verboseVersion: string;
    };

    // Vec3 and Quant ==========================
    export type vec2 = {
        x: number,
        y: number,
    };

    export type vec3 = {
        x: number;
        y: number;
        z: number;
    };

    export const Vec3: {
        readonly ZERO: vec3;
        equal(v1: vec3, v2: vec3): boolean;
    };
    export type quat = {
        x: number;
        y: number;
        z: number;
        w: number;
    };

    export const Quat: {
        readonly IDENTITY: quat;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        valid(value: any): boolean;
        equal(q1: quat, q2: quat): boolean;
    };

    export type SkeletonJoint = {
        jointName: string;
        jointIndex: number;
        parentIndex: number;
        boneType: number;
        defaultTranslation: vec3;
        defaultRotation: quat;
        defaultScale: number;
    };
    // Uuid ============================
    export class Uuid {
        static readonly NUM_BYTES_RFC4122_UUID = 16;
        static readonly NULL: bigint;
        static readonly AVATAR_SELF_ID: bigint;
        // constructor(value?: bigint);
        value(): bigint;
        stringify(): string;
    }
    // Signal ============================
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type Slot = (...args: any[]) => void;
    export type Signal = {
        connect: (slot: Slot) => void;
        disconnect: (slot: Slot) => void;
    };
    export class SignalEmitter implements Signal {
        connect(slot: Slot): void;
        disconnect(slot: Slot): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        emit(...params: any[]): void;
        signal(): Signal;
    }
    // ============================
    export enum ConnectionState {
        DISCONNECTED = 0,
        CONNECTING = 1,
        CONNECTED = 2,
        REFUSED = 3,
        ERROR = 4
    }
    // ============================
    export type OAuthJSON = {
        access_token?: string;
        token_type?: string;
        expires_in?: number;
        refresh_token?: string;
        error?: unknown;
        error_description?: string;
    };
    // ============================
    export class AccountInterface {
        login(username: string, oAuthJSON: OAuthJSON): void;
        logout(): void;
        isLoggedIn(): boolean;
        get authRequired(): Signal;
    }
    // ============================
    // ============================
    export class ModerationFlags {
        static readonly BanFlags: {
            NO_BAN: number;
            BAN_BY_USERNAME: number;
            BAN_BY_FINGERPRINT: number;
            BAN_BY_IP: number;
        };
        static getDefaultBanFlags(): number;
    }
    // ============================
    export class UsersInterface {
        readonly canKick: boolean;
        canKickChanged: Signal;
        wantIgnored: boolean;
        getAvatarGain(id: Uuid): number;
        getPersonalIgnore(id: Uuid): boolean;
        getPersonalMute(id: Uuid): boolean;
        kick(sessionID: Uuid, banFlags?: BanFlags): void;
        mute(sessionID: Uuid): void;
        setAvatarGain(id: Uuid, gain: number): void;
        setPersonalIgnore(id: Uuid, mute: boolean): void;
        setPersonalMute(id: Uuid, mute: boolean): void;
    }
    // ============================
    export type OnDomainStateChanged = (state: ConnectionState, info: string) => void;
    export class DomainServer {
        static get DISCONNECTED(): ConnectionState;
        static get CONNECTING(): ConnectionState;
        static get CONNECTED(): ConnectionState;
        static get REFUSED(): ConnectionState;
        static get ERROR(): ConnectionState;
        static stateToString(state: ConnectionState): string;
        constructor();
        get account(): AccountInterface;
        get users(): UsersInterface;
        get location(): string;
        get state(): ConnectionState;
        get refusalInfo(): string;
        get errorInfo(): string;
        set onStateChanged(callback: OnDomainStateChanged);
        get contextID(): number;
        get sessionUUID(): Uuid;
        get SessionUUIDChanged(): Signal;
        connect(location: string): void;
        disconnect(): void;
    }

    // ============================
    export enum AssignmentClientState {
        UNAVAILABLE = 0,
        DISCONNECTED = 1,
        CONNECTED = 2
    }
    export type OnAssignmentClientStateChanged = Nullable<(state: AssignmentClientState) => void>;
    export class AssignmentClient {
        static get UNAVAILABLE(): AssignmentClientState;
        static get DISCONNECTED(): AssignmentClientState;
        static get CONNECTED(): AssignmentClientState;
        static stateToString(state: AssignmentClientState): string;
        constructor(contextID: number, nodeType: NodeTypeValue);
        get state(): AssignmentClientState;
        set onStateChanged(callback: OnAssignmentClientStateChanged);
    }

    // ====================================================
    export const enum NodeTypeValue {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        DomainServer = "D",
        EntityServer = "o",
        Agent = "I",
        AudioMixer = "M",
        AvatarMixer = "W",
        AssetServer = "A",
        MessagesMixer = "m",
        EntityScriptServer = "S",
        UpstreamAudioMixer = "B",
        UpstreamAvatarMixer = "C",
        DownstreamAudioMixer = "a",
        DownstreamAvatarMixer = "w",
        Unassigned = "\u0001"
    }
    export const NodeType: {
        readonly DomainServer: NodeTypeValue.DomainServer;
        readonly EntityServer: NodeTypeValue.EntityServer;
        readonly Agent: NodeTypeValue.Agent;
        readonly AudioMixer: NodeTypeValue.AudioMixer;
        readonly AvatarMixer: NodeTypeValue.AvatarMixer;
        readonly AssetServer: NodeTypeValue.AssetServer;
        readonly MessagesMixer: NodeTypeValue.MessagesMixer;
        readonly EntityScriptServer: NodeTypeValue.EntityScriptServer;
        readonly UpstreamAudioMixer: NodeTypeValue.UpstreamAudioMixer;
        readonly UpstreamAvatarMixer: NodeTypeValue.UpstreamAvatarMixer;
        readonly DownstreamAudioMixer: NodeTypeValue.DownstreamAudioMixer;
        readonly DownstreamAvatarMixer: NodeTypeValue.DownstreamAvatarMixer;
        readonly Unassigned: NodeTypeValue.Unassigned;
        readonly "__#39@#NODE_TYPE_NAMES": {
            D: string;
            o: string;
            I: string;
            M: string;
            W: string;
            m: string;
            A: string;
            S: string;
            B: string;
            C: string;
            a: string;
            w: string;
            "\u0001": string;
        };
        getNodeTypeName(nodeType: NodeTypeValue): string;
        isUpstream(nodeType: NodeTypeValue): boolean;
    };

    // AudioMixer ============================
    type AudioPositionGetter = () => vec3;
    type AudioOrientationGetter = () => quat;
    export class AudioMixer extends AssignmentClient {
        constructor(contextID: number);
        get audioOutput(): MediaStream;  // out from domain server to go to user
        set audioInput(audioInput: MediaStream | null); // sound from user to go to domain
        get inputMuted(): boolean;
        set inputMuted(inputMuted: boolean);
        set positionGetter(positionGetter: AudioPositionGetter);
        set orientationGetter(orientationGetter: AudioOrientationGetter);
        get audioWorkletRelativePath(): string;
        set audioWorkletRelativePath(pPath: string);
        play(): Promise<void>;
        pause(): Promise<void>;
        mutedByMixer: Signal;
    }

    // MessageMixer ============================
    type MessageReceivedSlot = (pChannel: string, pMsg: string, pSenderId: Uuid, pLocalOnly: boolean) => void;
    type DataReceivedSlot = (pChannel: string, pMsg: ArrayBuffer, pSenderId: Uuid, pLocalOnly: boolean) => void;
    export class MessageMixer extends AssignmentClient {
        constructor(contextID: number);
        subscribe(channel: string): void;
        unsubscribe(channel: string): void;
        sendMessage(channel: string, message: string, localOnly?: boolean): void;
        sendData(channel: string, data: ArrayBuffer, localOnly?: boolean): void;
        get messageReceived(): Signal;
        get dataReceived(): Signal;
    }

    // MyAvatarInterface ============================
    type DisplayNameChangedSlot = () => void;
    type SessionDisplayNameChangedSlot = () => void;
    export class MyAvatarInterface {
        constructor(contextID: number);
        get displayName(): string;
        set displayName(displayName: string);
        get displayNameChanged(): Signal;
        get sessionDisplayName(): string;
        get sessionDisplayNameChanged(): Signal;
        get skeletonModelURL(): string;
        set skeletonModelURL(skeletonModelURL: string);
        get skeletonModelURLChanged(): Signal;
        get skeleton(): SkeletonJoint[];
        set skeleton(skeleton: SkeletonJoint[]);
        get skeletonChanged(): Signal;
        get scale(): number;
        set scale(scale: number);
        get scaleChanged(): Signal;
        get targetScale(): number;
        set targetScale(targetScale: number);
        get targetScaleChanged(): Signal;
        get position(): vec3;
        set position(position: vec3);
        get orientation(): quat;
        set orientation(orientation: quat);
        get locationChangeRequired(): Signal;
        get jointRotations(): (quat | null)[];
        set jointRotations(jointRotations: (quat | null)[]);
        get jointTranslations(): (vec3 | null)[];
        set jointTranslations(jointTranslations: (vec3 | null)[]);
    }

    export class AvatarData {
        constructor(contextID: number);
        get displayNameChanged(): Signal;
        get sessionDisplayNameChanged(): Signal;
        get skeletonModelURLChanged(): Signal;
        get skeletonChanged(): Signal;
        get targetScaleChanged(): Signal;
        getSessionUUID(): Uuid;
        setSessionUUID(sessionUUID: Uuid): void;
        getDisplayName(): string | null;
        setDisplayName(displayName: string | null): void;
        getSessionDisplayName(): string | null;
        setSessionDisplayName(sessionDisplayName: string | null): void;
        maybeUpdateSessionDisplayNameFromTransport(sessionDisplayName: string | null): void;
        getSkeletonModelURL(): string | null;
        setSkeletonModelURL(skeletonModelURL: string | null): void;
        getSkeletonData(): SkeletonJoint[];
        setSkeletonData(skeletonData: SkeletonJoint[]): void;
        setTargetScale(targetScale: number): void;
        getTargetScale(): number;
        getDomainLimitedScale(): number;
        getJointRotations(): (quat | null)[];
        setJointRotations(jointRotations: (quat | null)[]): void;
        getJointTranslations(): (vec3 | null)[];
        setJointTranslations(jointTranslations: (vec3 | null)[]): void;
        markIdentityDataChanged(): void;
        getIdentityDataChanged(): boolean;
        sendIdentityPacket(): number;
        resetLastSent(): void;
        sendAvatarDataPacket(sendAll?: boolean): number;

    }

    // ScriptAvatar ==================================
    export class ScriptAvatar {
        #private;
        constructor(avatar: AvatarData | null);
        get isValid(): boolean;
        get displayName(): string;
        get displayNameChanged(): Signal;
        get sessionDisplayName(): string;
        get sessionDisplayNameChanged(): Signal;
        get skeletonModelURL(): string;
        get skeletonModelURLChanged(): Signal;
        get skeleton(): SkeletonJoint[];
        get skeletonChanged(): Signal;
        get scale(): number;
        get scaleChanged(): Signal;
        get position(): vec3;
        get orientation(): quat;
        get jointRotations(): (quat | null)[];
        get jointTranslations(): (vec3 | null)[];
    }

    // AvatarListInterface ============================
    export enum KillAvatarReason {
        NoReason = 0,
        AvatarDisconnected,
        AvatarIgnored,
        TheirAvatarEnteredYourBubble,
        YourAvatarEnteredTheirBubble
    }
    type AvatarAddedSlot = (pSessionUUID: Uuid) => void;
    type AvatarRemovedSlot = (pSessionUUID: Uuid, pRemovalReason: KillAvatarReason) => void;
    export class AvatarListInterface {
        get count(): number;
        getAvatarIDs(): Array<Uuid>;
        getAvatar(id: Uuid): ScriptAvatar;
        get avatarAdded(): Signal;
        get avatarRemoved(): Signal;
    }

    // AvatarMixer ============================
    export class AvatarMixer extends AssignmentClient {
        constructor(contextID: number);
        get myAvatar(): MyAvatarInterface;
        get avatarList(): AvatarListInterface;
        update(): void;
    }

    export class Camera {
        constructor(contextID: number);
        get position(): vec3;
        set position(position: vec3);
        get orientation(): quat;
        set orientation(orientation: quat);
        get fieldOfView(): number;
        set fieldOfView(fieldOfView: number);
        get aspectRatio(): number;
        set aspectRatio(aspectRatio: number);
        get farClip(): number;
        set farClip(farClip: number);
        get centerRadius(): number;
        set centerRadius(centerRadius: number);
        update(): void;
    }

    // Entity
    // =============================================================================================

    export class EntityServer extends AssignmentClient {
        constructor(contextID: number);
        get maxOctreePacketsPerSecond(): number;
        get entityData(): Signal;
        update(): void;
    }

    export enum EntityType {
        Unknown = 0,
        Box = 1,
        Sphere = 2,
        Shape = 3,
        Model = 4,
        Text = 5,
        Image = 6,
        Web = 7,
        ParticleEffect = 8,
        Line = 9,
        PolyLine = 10,
        PolyVox = 11,
        Grid = 12,
        Gizmo = 13,
        Light = 14,
        Zone = 15,
        Material = 16,
        NUM_TYPES = 17
    }

    export enum ShapeType {
        // C++  enum ShapeType
        NONE,
        BOX,
        SPHERE,
        CAPSULE_X,
        CAPSULE_Y,
        CAPSULE_Z,
        CYLINDER_X,
        CYLINDER_Y,
        CYLINDER_Z,
        HULL,
        PLANE,
        COMPOUND,
        SIMPLE_HULL,
        SIMPLE_COMPOUND,
        STATIC_MESH,
        ELLIPSOID,
        CIRCLE,
        MULTISPHERE
    }

    export enum ComponentMode {
        // C++  enum ComponentMode
        INHERIT,
        DISABLED,
        ENABLED,

        ITEM_COUNT
    }

    export type color = {
        red: number;
        green: number;
        blue: number;
    };

    export class AACube {
        constructor(corner: vec3, scale: number);
        get corner(): vec3;
        get scale(): number;
    }

    export type CommonEntityProperties = {
        entityItemID: Uuid;
        entityType: EntityType;
        createdFromBuffer: bigint;
        lastEdited: bigint;
        updateDelta: number;
        simulatedDelta: number;
        simOwnerData: ArrayBuffer | undefined;
        parentID: Uuid | null | undefined;
        parentJointIndex: number | undefined;
        visible: boolean | undefined;
        name: string | undefined;
        locked: boolean | undefined;
        userData: string | undefined;
        privateUserData: string | undefined;
        href: string | undefined;
        description: string | undefined;
        position: vec3 | undefined;
        dimensions: vec3 | undefined;
        rotation: quat | undefined;
        registrationPoint: vec3 | undefined;
        created: bigint | undefined;
        lastEditedBy: Uuid | undefined;
        queryAACube: AACube | undefined;
        canCastShadow: boolean | undefined;
        renderLayer: number | undefined;
        primitiveMode: number | undefined;
        ignorePickIntersection: boolean | undefined;
        renderWithZones: Uuid[] | undefined;
        billboardMode: number | undefined;
        grabbable: boolean | undefined;
        grabKinematic: boolean | undefined;
        grabFollowsController: boolean | undefined;
        triggerable: boolean | undefined;
        grabEquippable: boolean | undefined;
        delegateToParent: boolean | undefined;
        equippableLeftPositionOffset: vec3 | undefined;
        equippableLeftRotationOffset: quat | undefined;
        equippableRightPositionOffset: vec3 | undefined;
        equippableRightRotationOffset: quat | undefined;
        equippableIndicatorURL: string | undefined;
        equippableIndicatorScale: vec3 | undefined;
        equippableIndicatorOffset: vec3 | undefined;
        density: number | undefined;
        velocity: vec3 | undefined;
        angularVelocity: vec3 | undefined;
        gravity: vec3 | undefined;
        acceleration: vec3 | undefined;
        damping: number | undefined;
        angularDampling: number | undefined;
        restitution: number | undefined;
        friction: number | undefined;
        lifetime: number | undefined;
        collisionless: boolean | undefined;
        collisionMask: number | undefined;
        dynamic: boolean | undefined;
        collisionSoundURL: string | undefined;
        actionData: ArrayBuffer | undefined;
        cloneable: boolean | undefined;
        cloneLifetime: number | undefined;
        cloneLimit: number | undefined;
        cloneDynamic: boolean | undefined;
        cloneAvatarIdentity: boolean | undefined;
        cloneOriginID: Uuid | undefined;
        script: string | undefined;
        scriptTimestamp: bigint | undefined;
        serverScripts: string | undefined;
        itemName: string | undefined;
        itemDescription: string | undefined;
        itemCategories: string | undefined;
        itemArtist: string | undefined;
        itemLicense: string | undefined;
        limitedRun: number | undefined;
        marketplaceID: string | undefined;
        editionNumber: number | undefined;
        entityInstanceNumber: number | undefined;
        certificateID: string | undefined;
        certificateType: string | undefined;
        staticCertificateVersion: number | undefined;
    };

    export type AnimationProperties = {
        animationURL: string | undefined;
        animationAllowTranslation: boolean | undefined;
        animationFPS: number | undefined;
        animationFrameIndex: number | undefined;
        animationPlaying: boolean | undefined;
        animationLoop: boolean | undefined;
        animationFirstFrame: number | undefined;
        animationLastFrame: number | undefined;
        animationHold: boolean | undefined;
    };

    export type ModelEntitySubclassProperties = {
        shapeType: number | undefined;
        compoundShapeURL: string | undefined;
        color: color | undefined;
        textures: string | undefined;
        modelURL: string | undefined;
        modelScale: vec3 | undefined;
        jointRotationsSet: boolean[] | undefined;
        jointRotations: quat[] | undefined;
        jointTranslationsSet: boolean[] | undefined;
        jointTranslations: vec3[] | undefined;
        groupCulled: boolean | undefined;
        relayParentJoints: boolean | undefined;
        blendShapeCoefficients: string | undefined;
        useOriginalPivot: boolean | undefined;
        animation: AnimationProperties | undefined;
    };

    export type ModelEntityProperties = CommonEntityProperties & ModelEntitySubclassProperties;

    export enum Shape {
        CIRCLE = "Circle",
        CONE = "Cone",
        CUBE = "Cube",
        CYLINDER = "Cylinder",
        DODECAHEDRON = "Dodecahedron",
        HEXAGON = "Hexagon",
        ICOSAHEDRON = "Icosahedron",
        OCTAGON = "Octagon",
        OCTAHEDRON = "Octahedron",
        QUAD = "Quad",
        SPHERE = "Sphere",
        TETRAHEDRON = "Tetrahedron",
        TORUS = "Torus",
        TRIANGLE = "Triangle"
    }
    export type ShapeEntitySubclassProperties = {
        shape: Shape | undefined;
        color: color | undefined;
        alpha: number | undefined;
    };
    export type ShapeEntityProperties = CommonEntityProperties & ShapeEntitySubclassProperties;

    export type TextEntityProperties = CommonEntityProperties;

    export type rect = {
        x: number;
        y: number;
        width: number;
        height: number;
    };

    export type ImageEntitySubclassProperties = {
        imageURL: string | undefined;
        emissive: boolean | undefined;
        keepAspectRatio: boolean | undefined;
        subImage: rect | undefined;
        color: color | undefined;
        alpha: number | undefined;
    };

    export enum WebInputMode {
        // C++  enum class WebInputMode
        TOUCH = 0,
        MOUSE
    }

    export type WebEntitySubclassProperties = {
        sourceURL: string | undefined,  // Renamed from native client's "sourceUrl".
        color: color | undefined,
        alpha: number | undefined,
        dpi: number | undefined,
        scriptURL: string | undefined,
        maxFPS: number | undefined,
        inputMode: WebInputMode | undefined,
        showKeyboardFocusHighlight: boolean | undefined,
        useBackground: boolean | undefined,
        userAgent: string | undefined
    };

    export type ImageEntityProperties = CommonEntityProperties & ImageEntitySubclassProperties;

    export type WebEntityProperties = CommonEntityProperties & WebEntitySubclassProperties;

    export type ParticleEffectEntityProperties = CommonEntityProperties;

    export type LineEntityProperties = CommonEntityProperties;

    export type PolyLineEntityProperties = CommonEntityProperties;

    export type PolyVoxEntityProperties = CommonEntityProperties;

    export type GridEntityProperties = CommonEntityProperties;

    export type GizmoEntityProperties = CommonEntityProperties;

    export type LightEntitySubclassProperties = {
        color: color | undefined,
        isSpotlight: boolean | undefined,
        intensity: number | undefined,
        exponent: number | undefined,
        cutoff: number | undefined,
        falloffRadius: number | undefined
    };

    export type LightEntityProperties = CommonEntityProperties & LightEntitySubclassProperties;

    export type KeyLightProperties = {
        color: color | undefined,
        intensity: number | undefined,
        direction: vec3 | undefined,
        castShadows: boolean | undefined,
        shadowBias: number | undefined,
        shadowMaxDistance: number | undefined
    };

    export type AmbientLightProperties = {
        intensity: number | undefined,
        url: string | undefined
    };

    export type SkyboxProperties = {
        color: color | undefined,
        url: string | undefined
    };

    export type HazeProperties = {
        range: number | undefined,
        color: color | undefined,
        enableGlare: boolean | undefined,
        glareColor: color | undefined,
        glareAngle: number | undefined,
        altitudeEffect: boolean | undefined,
        base: number | undefined,
        ceiling: number | undefined,
        backgroundBlend: number | undefined,
        attenuateKeyLight: boolean | undefined,
        keyLightRange: number | undefined,
        keyLightAltitude: number | undefined
    };

    export type BloomProperties = {
        intensity: number | undefined,
        threshold: number | undefined,
        size: number | undefined
    };

    export enum AvatarPriorityMode {
        // C++  enum AvatarPriorityMode
        INHERIT,
        CROWD,
        HERO,
        ITEM_COUNT
    }

    export type ZoneEntitySubclassProperties = {
        shapeType: ShapeType | undefined,
        compoundShapeURL: string | undefined,
        keyLightMode: ComponentMode | undefined,
        keyLight: KeyLightProperties | undefined,
        ambientLightMode: ComponentMode | undefined,
        ambientLight: AmbientLightProperties | undefined,
        skyboxMode: ComponentMode | undefined,
        skybox: SkyboxProperties | undefined,
        hazeMode: ComponentMode | undefined,
        haze: HazeProperties | undefined,
        bloomMode: ComponentMode | undefined,
        bloom: BloomProperties | undefined,
        flyingAllowed: boolean | undefined,
        ghostingAllowed: boolean | undefined,
        filterURL: string | undefined,
        avatarPriority: AvatarPriorityMode | undefined,
        screenshare: ComponentMode | undefined
    };

    export type ZoneEntityProperties = CommonEntityProperties & ZoneEntitySubclassProperties;

    export enum MaterialMappingMode {
        // C++  enum MaterialMappingMode
        UV = 0,
        PROJECTED,
        // Put new mapping-modes before this line.
        UNSET_MATERIAL_MAPPING_MODE
    }

    export type MaterialEntitySubclassProperties = {
        materialURL: string | undefined,
        materialData: string | undefined,
        priority: number | undefined,
        parentMaterialName: string | undefined,
        materialMappingMode: MaterialMappingMode | undefined,
        materialMappingPos: vec2 | undefined,
        materialMappingScale: vec2 | undefined,
        materialMappingRot: number | undefined,
        materialRepeat: boolean | undefined
    };

    export type MaterialEntityProperties = CommonEntityProperties & MaterialEntitySubclassProperties;

    export type EntityProperties = ModelEntityProperties | ShapeEntityProperties | TextEntityProperties |
    ImageEntityProperties | WebEntityProperties | ParticleEffectEntityProperties | LineEntityProperties |
    PolyLineEntityProperties | PolyVoxEntityProperties | GridEntityProperties | GizmoEntityProperties |
    LightEntityProperties | ZoneEntityProperties | MaterialEntityProperties;

}
