/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Converts screen coordinates (normalized 0 to 1, or pixel coords)
 * to 3D world coordinates on a specified target plane or camera distance.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: THREE.PerspectiveCamera | THREE.Camera,
  targetZ = 0,
  isMirrored = false
): THREE.Vector3 {
  // Convert 0..1 to NDC [-1, 1]
  const ndcX = isMirrored ? (1.0 - screenX) * 2 - 1 : screenX * 2 - 1;
  const ndcY = -(screenY * 2) + 1;

  const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
  vector.unproject(camera);
  vector.sub(camera.position).normalize();

  // If perspective camera, calculate intersection with Z plane
  if (Math.abs(vector.z) > 0.001) {
    const distance = (targetZ - camera.position.z) / vector.z;
    if (distance > 0 && distance < 40) {
      return camera.position.clone().add(vector.multiplyScalar(distance));
    }
  }

  // Fallback distance along the unprojected ray
  const fallbackDist = camera.position.length() > 0 ? camera.position.length() * 0.9 : 6.0;
  return camera.position.clone().add(vector.multiplyScalar(fallbackDist));
}
