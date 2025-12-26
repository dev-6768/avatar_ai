import { useEffect } from "react";
import * as THREE from "three";

export default function DefaultTest() {
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black");

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(300, 300);
    document.body.appendChild(renderer.domElement);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ color: "red" })
    );
    scene.add(cube);

    renderer.render(scene, camera);
  }, []);

  return <div>Check top-left corner</div>;
}
