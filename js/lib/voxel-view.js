import { THREE } from 'expo-three';

let temporaryPosition = new THREE.Vector3();
let temporaryVector = new THREE.Vector3();

class VoxelView {
  constructor({
    fov,
    width,
    height,
    aspectRatio,
    nearPlane,
    farPlane,
    skyColor,
    ortho,
    context,
    ...props
  }) {
    this.fov = fov || 60;
    this.width = width || 512;
    this.height = height || 512;
    this.aspectRatio = aspectRatio || this.width / this.height;
    this.nearPlane = nearPlane || 1;
    this.farPlane = farPlane || 10000;
    this.skyColor = skyColor || 0xbfd1e5;
    this.ortho = ortho;
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
    this.context = context;
    this.createRenderer({
      fov,
      width,
      height,
      aspectRatio,
      nearPlane,
      farPlane,
      skyColor,
      ortho,
      context,
      ...props,
    });
  }

  createRenderer = opts => {
    opts.antialias = opts.antialias || true;
    this.renderer = new THREE.WebGLRenderer(opts);
    this.renderer.setClearColorHex = () => {};
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(this.skyColor, 1.0);
    this.renderer.clear();
  };

  bindToScene = scene => scene.add(this.camera);

  getCamera = () => this.camera;

  cameraPosition = () => {
    temporaryPosition.multiplyScalar(0);
    temporaryPosition.applyMatrix4(this.camera.matrixWorld);
    return [temporaryPosition.x, temporaryPosition.y, temporaryPosition.z];
  };

  cameraVector = () => {
    temporaryVector.multiplyScalar(0);
    temporaryVector.z = -1;
    temporaryVector.transformDirection(this.camera.matrixWorld);
    return [temporaryVector.x, temporaryVector.y, temporaryVector.z];
  };

  resizeWindow = (width, height) => {
    this.camera.aspect = this.aspectRatio = width / height;
    this.width = width;
    this.height = height;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  render = scene => {
    this.renderer.render(scene, this.camera);
  };
}

export default VoxelView;
