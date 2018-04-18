var temporaryPosition, temporaryVector;
import { THREE } from 'expo-three';
module.exports = function(three, opts) {
  temporaryPosition = new three.Vector3();
  temporaryVector = new three.Vector3();

  return new View(three, opts);
};

function View(three, opts) {
  this.fov = opts.fov || 60;
  this.width = opts.width || 512;
  this.height = opts.height || 512;
  this.aspectRatio = opts.aspectRatio || this.width / this.height;
  this.nearPlane = opts.nearPlane || 1;
  this.farPlane = opts.farPlane || 10000;
  this.skyColor = opts.skyColor || 0xbfd1e5;
  this.ortho = opts.ortho;
  this.camera = this.ortho
    ? new THREE.OrthographicCamera(
        this.width / -2,
        this.width / 2,
        this.height / 2,
        this.height / -2,
        this.nearPlane,
        this.farPlane,
      )
    : new THREE.PerspectiveCamera(
        this.fov,
        this.aspectRatio,
        this.nearPlane,
        this.farPlane,
      );
  this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  this.context = opts.context;
  this.createRenderer(opts);
}

View.prototype.createRenderer = function(opts) {
  opts = opts || {};
  opts.antialias = opts.antialias || true;
  this.renderer = new THREE.WebGLRenderer(opts);
  this.renderer.setClearColorHex = () => {};
  this.renderer.setSize(this.width, this.height);
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setClearColor(this.skyColor, 1.0);
  this.renderer.clear();
};

View.prototype.bindToScene = function(scene) {
  scene.add(this.camera);
};

View.prototype.getCamera = function() {
  return this.camera;
};

View.prototype.cameraPosition = function() {
  temporaryPosition.multiplyScalar(0);
  temporaryPosition.applyMatrix4(this.camera.matrixWorld);
  return [temporaryPosition.x, temporaryPosition.y, temporaryPosition.z];
};

View.prototype.cameraVector = function() {
  temporaryVector.multiplyScalar(0);
  temporaryVector.z = -1;
  temporaryVector.transformDirection(this.camera.matrixWorld);
  return [temporaryVector.x, temporaryVector.y, temporaryVector.z];
};

View.prototype.resizeWindow = function(width, height) {
  this.camera.aspect = this.aspectRatio = width / height;
  this.width = width;
  this.height = height;

  this.camera.updateProjectionMatrix();

  this.renderer.setSize(width, height);
};

View.prototype.render = function(scene) {
  this.renderer.render(scene, this.camera);
};

View.prototype.endRender = function() {
  this.context.endFrameEXP();
};
