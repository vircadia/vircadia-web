/* eslint-disable */
import { Mesh, ArcRotateCamera, Vector3, Viewport } from "@babylonjs/core";

var IglooCamera = function ( canvas, scene ) {

    // 6 perspective cameras for cubemap faces
    var cameraLeft;
    var cameraFront;
    var cameraRight;
    var cameraBack;
    var cameraBottom;
    var cameraTop;

    const igloomode = globalThis.useIgloo;

    // objects from main scene
    this.canvas = canvas;
    this.scene = scene;

    // object for igloo camera to follow, default is camera object
    var follow_object;

    // calculate size of cubemap faces
	var view_width = ( 1 / 6 ); // / pixel_ratio;

    var fov = 1.5708;
    //var near = this.camera.near;
    //var far = this.camera.far;

    // create invisible mesh for follow_object
    var follow_object = Mesh.CreateBox("iglooCam", 0.1, null);
    follow_object.position = new Vector3(0, 0, 0);

    cameraLeft = new ArcRotateCamera("CameraLeft", 0, 0, 0, new Vector3(1, 0, 0), scene);
    cameraLeft.fov = fov;
    cameraLeft.viewport = new Viewport(0, 0, view_width, 1.0);

    cameraFront = new ArcRotateCamera("CameraFront", 0, 0, 0, new Vector3(0, 0, -1), scene);
    cameraFront.fov = fov;
    cameraFront.viewport = new Viewport(view_width, 0, view_width, 1.0);

    cameraRight = new ArcRotateCamera("CameraRight", 0, 0, 0, new Vector3(-1, 0, 0), scene);
    cameraRight.fov = fov;
    cameraRight.viewport = new Viewport(view_width * 2, 0, view_width, 1.0);

    cameraBack = new ArcRotateCamera("CameraBack", 0, 0, 0, new Vector3(0, 0, 1), scene);
    cameraBack.fov = fov;
    cameraBack.viewport = new Viewport(view_width * 3, 0, view_width, 1.0);

    cameraBottom = new ArcRotateCamera("CameraBottom", 0, 0, 0, new Vector3(0, -1, 0), scene);
    cameraBottom.fov = fov;
    cameraBottom.viewport = new Viewport(view_width * 4, 0, view_width, 1.0);

    //cameraTop = new THREE.PerspectiveCamera( fov, aspect, near, far );
    cameraTop = new ArcRotateCamera("CameraFront", 0, 0, 0, new Vector3(0, 1, 0), scene);
    cameraTop.fov = fov;
    cameraTop.viewport = new Viewport(view_width * 5, 0, view_width, 1.0);

    if ((igloomode == 1) && (follow_object != null)) {
        cameraLeft.setPosition(follow_object.position);
        cameraLeft.setTarget(follow_object.position.add(new Vector3(1, 0, 0)));

        cameraFront.setPosition(follow_object.position);
        cameraFront.setTarget(follow_object.position.add(new Vector3(0, 0, -1)));

        cameraRight.setPosition(follow_object.position);
        cameraRight.setTarget(follow_object.position.add(new Vector3(-1, 0, 0)));

        cameraBack.setPosition(follow_object.position);
        cameraBack.setTarget(follow_object.position.add(new Vector3(0, 0, 1)));

        cameraBottom.setPosition(follow_object.position);
        cameraBottom.setTarget(follow_object.position.add(new Vector3(0, -1, 0)));

        cameraTop.setPosition(follow_object.position);
        cameraTop.setTarget(follow_object.position.add(new Vector3(0, 1, 0)));

        scene.activeCameras.push(cameraLeft);
        scene.activeCameras.push(cameraFront);
        scene.activeCameras.push(cameraRight);
        scene.activeCameras.push(cameraBack);
        scene.activeCameras.push(cameraBottom);
        scene.activeCameras.push(cameraTop);
    }

    this.follow = function(object) {
        follow_object = object;
        this.update();
    }

    this.setPosition = function(pos) {
        follow_object.position = pos;
        this.update();
    }

    this.update = function() {

        if (igloomode == 1) {

            cameraLeft.setPosition(follow_object.position);
            cameraLeft.setTarget(follow_object.position.add(new Vector3(1, 0, 0)));

            cameraFront.setPosition(follow_object.position);
            cameraFront.setTarget(follow_object.position.add(new Vector3(0, 0, -1)));

            cameraRight.setPosition(follow_object.position);
            cameraRight.setTarget(follow_object.position.add(new Vector3(-1, 0, 0)));

            cameraBack.setPosition(follow_object.position);
            cameraBack.setTarget(follow_object.position.add(new Vector3(0, 0, 1)));

            cameraBottom.setPosition(follow_object.position);
            cameraBottom.setTarget(follow_object.position.add(new Vector3(0, -1, 0)));

            cameraTop.setPosition(follow_object.position);
            cameraTop.setTarget(follow_object.position.add(new Vector3(0, 1, 0)));

            return true;
        }
        else {
            return false;
        }
    }
}

export { IglooCamera };
