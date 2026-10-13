/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

export type ExportFormat = 'glb' | 'gltf' | 'fbx' | 'obj';

/**
 * Prepares a clone of the scene or object where ShaderMaterials are replaced with
 * high-fidelity MeshStandardMaterials / MeshPhysicalMaterials so GLTF and FBX exporters
 * can accurately retain all geometries, PBR colors, metallics, and emissive properties.
 */
function prepareExportableHierarchy(source: THREE.Object3D): THREE.Object3D {
  const root = source.clone(true);

  root.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      const mat = mesh.material;

      if (mat instanceof THREE.ShaderMaterial) {
        // Synthesize equivalent PBR material for the ferrofluid / shader surface
        const uGlow = mat.uniforms?.uGlowColor?.value;
        const glowColor = uGlow instanceof THREE.Vector3
          ? new THREE.Color(uGlow.x, uGlow.y, uGlow.z)
          : new THREE.Color(0x00f0ff);

        const standardMat = new THREE.MeshStandardMaterial({
          name: 'Ferrofluid_Arcane_PBR',
          color: new THREE.Color(0x0a0c12),
          emissive: glowColor,
          emissiveIntensity: 0.35,
          metalness: 0.95,
          roughness: 0.08,
          wireframe: mat.wireframe || false,
        });

        mesh.material = standardMat;
      }
    }
  });

  return root;
}

/**
 * Generates an industry-compliant Autodesk FBX ASCII 7.4 format file
 * containing all models, geometries, vertex normals, UVs, materials, and hierarchy.
 */
function generateFBXASCII(target: THREE.Object3D, modelName = 'FerrofluidArcanaEntity'): string {
  let idCounter = 10000000;
  const getNextId = () => ++idCounter;

  interface ExportMeshInfo {
    modelId: number;
    geomId: number;
    matId: number;
    name: string;
    parentModelId: number;
    translation: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    vertices: number[];
    indices: number[];
    normals: number[];
    uvs: number[];
    color: { r: number; g: number; b: number };
    emissive: { r: number; g: number; b: number };
    metalness: number;
    roughness: number;
  }

  const meshes: ExportMeshInfo[] = [];
  const nodeMap = new Map<THREE.Object3D, number>();
  nodeMap.set(target, 0); // Root

  target.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      const geo = mesh.geometry;
      if (!geo) return;

      const modelId = getNextId();
      const geomId = getNextId();
      const matId = getNextId();
      nodeMap.set(mesh, modelId);

      const parentModelId = (mesh.parent && nodeMap.get(mesh.parent)) || 0;

      // Extract geometry data
      const posAttr = geo.getAttribute('position');
      const normAttr = geo.getAttribute('normal');
      const uvAttr = geo.getAttribute('uv');

      if (!posAttr) return;

      const vertices: number[] = [];
      const indices: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];

      for (let i = 0; i < posAttr.count; i++) {
        vertices.push(
          Math.round(posAttr.getX(i) * 10000) / 10000,
          Math.round(posAttr.getY(i) * 10000) / 10000,
          Math.round(posAttr.getZ(i) * 10000) / 10000
        );

        if (normAttr) {
          normals.push(
            Math.round(normAttr.getX(i) * 10000) / 10000,
            Math.round(normAttr.getY(i) * 10000) / 10000,
            Math.round(normAttr.getZ(i) * 10000) / 10000
          );
        } else {
          normals.push(0, 1, 0);
        }

        if (uvAttr) {
          uvs.push(
            Math.round(uvAttr.getX(i) * 10000) / 10000,
            Math.round(uvAttr.getY(i) * 10000) / 10000
          );
        } else {
          uvs.push(0, 0);
        }
      }

      // Extract polygon indices (FBX uses XOR bitwise complement for last index of each polygon)
      if (geo.index) {
        const indexAttr = geo.index;
        for (let i = 0; i < indexAttr.count; i += 3) {
          const a = indexAttr.getX(i);
          const b = indexAttr.getX(i + 1);
          const c = indexAttr.getX(i + 2);
          indices.push(a, b, -c - 1);
        }
      } else {
        for (let i = 0; i < posAttr.count; i += 3) {
          indices.push(i, i + 1, -(i + 2) - 1);
        }
      }

      // Material parameters
      let col = { r: 0.05, g: 0.08, b: 0.12 };
      let emissive = { r: 0.0, g: 0.94, b: 1.0 };
      let metal = 0.95;
      let rough = 0.15;

      const mat = mesh.material as any;
      if (mat) {
        if (mat.color) col = { r: mat.color.r, g: mat.color.g, b: mat.color.b };
        if (mat.emissive) emissive = { r: mat.emissive.r, g: mat.emissive.g, b: mat.emissive.b };
        if (typeof mat.metalness === 'number') metal = mat.metalness;
        if (typeof mat.roughness === 'number') rough = mat.roughness;
      }

      meshes.push({
        modelId,
        geomId,
        matId,
        name: mesh.name || `MeshNode_${modelId}`,
        parentModelId,
        translation: mesh.position,
        rotation: mesh.rotation,
        scale: mesh.scale,
        vertices,
        indices,
        normals,
        uvs,
        color: col,
        emissive,
        metalness: metal,
        roughness: rough,
      });
    }
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();

  let out = `; FBX 7.4.0 project file
; Produced by Arcane Ferrofluid 3D Embodied AI Engine
; ----------------------------------------------------

FBXHeaderExtension:  {
\tFBXHeaderVersion: 1003
\tFBXVersion: 7400
\tCreationTimeStamp:  {
\t\tVersion: 1000
\t\tYear: ${year}
\t\tMonth: ${month}
\t\tDay: ${day}
\t\tHour: ${hour}
\t\tMinute: ${minute}
\t\tSecond: ${second}
\t\tMillisecond: 0
\t}
\tCreator: "Arcane Ferrofluid 3D Engine"
}

GlobalSettings:  {
\tVersion: 1000
\tProperties70:  {
\t\tP: "UpAxis", "int", "Integer", "", 1
\t\tP: "UpAxisSign", "int", "Integer", "", 1
\t\tP: "FrontAxis", "int", "Integer", "", 2
\t\tP: "FrontAxisSign", "int", "Integer", "", 1
\t\tP: "CoordAxis", "int", "Integer", "", 0
\t\tP: "CoordAxisSign", "int", "Integer", "", 1
\t\tP: "OriginalUpAxis", "int", "Integer", "", 1
\t\tP: "OriginalUpAxisSign", "int", "Integer", "", 1
\t\tP: "UnitScaleFactor", "double", "Number", "", 100.0
\t\tP: "OriginalUnitScaleFactor", "double", "Number", "", 100.0
\t}
}

Documents:  {
\tCount: 1
\tDocument: 1000000, "${modelName}", "Scene" {
\t\tProperties70:  {
\t\t}
\t\tRootNode: 0
\t}
}

References:  {
}

Definitions:  {
\tVersion: 100
\tCount: ${meshes.length * 3 + 1}
\tObjectType: "GlobalSettings" {
\t\tCount: 1
\t}
\tObjectType: "Model" {
\t\tCount: ${meshes.length}
\t}
\tObjectType: "Geometry" {
\t\tCount: ${meshes.length}
\t}
\tObjectType: "Material" {
\t\tCount: ${meshes.length}
\t}
}

Objects:  {
`;

  // Write Models, Geometries, and Materials
  meshes.forEach((m) => {
    // Model node
    out += `\tModel: ${m.modelId}, "Model::${m.name}", "Mesh" {
\t\tVersion: 232
\t\tProperties70:  {
\t\t\tP: "InheritType", "enum", "", "", 1
\t\t\tP: "Lcl Translation", "Lcl Translation", "", "A", ${m.translation.x * 100}, ${m.translation.y * 100}, ${m.translation.z * 100}
\t\t\tP: "Lcl Rotation", "Lcl Rotation", "", "A", ${THREE.MathUtils.radToDeg(m.rotation.x)}, ${THREE.MathUtils.radToDeg(m.rotation.y)}, ${THREE.MathUtils.radToDeg(m.rotation.z)}
\t\t\tP: "Lcl Scaling", "Lcl Scaling", "", "A", ${m.scale.x}, ${m.scale.y}, ${m.scale.z}
\t\t}
\t\tShading: T
\t\tCulling: "CullingOff"
\t}
`;

    // Geometry node
    out += `\tGeometry: ${m.geomId}, "Geometry::${m.name}_Geo", "Mesh" {
\t\tVertices: *${m.vertices.length} {
\t\t\ta: ${m.vertices.join(',')}
\t\t}
\t\tPolygonVertexIndex: *${m.indices.length} {
\t\t\ta: ${m.indices.join(',')}
\t\t}
\t\tGeometryVersion: 124
\t\tLayerElementNormal: 0 {
\t\t\tVersion: 101
\t\t\tName: ""
\t\t\tMappingInformationType: "ByControlPoint"
\t\t\tReferenceInformationType: "Direct"
\t\t\tNormals: *${m.normals.length} {
\t\t\t\ta: ${m.normals.join(',')}
\t\t\t}
\t\t}
\t\tLayerElementUV: 0 {
\t\t\tVersion: 101
\t\t\tName: "map1"
\t\t\tMappingInformationType: "ByControlPoint"
\t\t\tReferenceInformationType: "Direct"
\t\t\tUV: *${m.uvs.length} {
\t\t\t\ta: ${m.uvs.join(',')}
\t\t\t}
\t\t}
\t\tLayer: 0 {
\t\t\tVersion: 100
\t\t\tLayerElement:  {
\t\t\t\tType: "LayerElementNormal"
\t\t\t\tTypedIndex: 0
\t\t\t}
\t\t\tLayerElement:  {
\t\t\t\tType: "LayerElementUV"
\t\t\t\tTypedIndex: 0
\t\t\t}
\t\t}
\t}
`;

    // Material node
    out += `\tMaterial: ${m.matId}, "Material::${m.name}_Mat", "" {
\t\tVersion: 102
\t\tShadingModel: "phong"
\t\tMultiLayer: 0
\t\tProperties70:  {
\t\t\tP: "DiffuseColor", "ColorRGB", "Color", "", ${m.color.r}, ${m.color.g}, ${m.color.b}
\t\t\tP: "EmissiveColor", "ColorRGB", "Color", "", ${m.emissive.r}, ${m.emissive.g}, ${m.emissive.b}
\t\t\tP: "SpecularColor", "ColorRGB", "Color", "", 0.9, 0.9, 0.9
\t\t\tP: "Shininess", "double", "Number", "", ${(1 - m.roughness) * 100}
\t\t\tP: "Reflectivity", "double", "Number", "", ${m.metalness}
\t\t}
\t}
`;
  });

  out += `}

Connections:  {
`;

  meshes.forEach((m) => {
    // Connect Geometry to Model
    out += `\tC: "OO", ${m.geomId}, ${m.modelId}\n`;
    // Connect Material to Model
    out += `\tC: "OO", ${m.matId}, ${m.modelId}\n`;
    // Connect Model to parent or root (0)
    out += `\tC: "OO", ${m.modelId}, ${m.parentModelId}\n`;
  });

  out += `}
`;

  return out;
}

export function export3DModel(
  target: THREE.Object3D,
  format: ExportFormat,
  baseFilename = 'ferrofluid-embodied-ai-model'
): Promise<void> {
  return new Promise((resolve, reject) => {
    const exportTarget = prepareExportableHierarchy(target);

    // 1. FBX Export
    if (format === 'fbx') {
      try {
        const fbxContent = generateFBXASCII(exportTarget, baseFilename);
        const blob = new Blob([fbxContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${baseFilename}-${Date.now()}.fbx`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      } catch (err) {
        console.error('FBX Export error:', err);
        reject(err);
      }
      return;
    }

    // 2. OBJ Export
    if (format === 'obj') {
      try {
        const exporter = new OBJExporter();
        const result = exporter.parse(exportTarget);
        const blob = new Blob([result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${baseFilename}-${Date.now()}.obj`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      } catch (err) {
        reject(err);
      }
      return;
    }

    // 3. GLB / GLTF Export
    const binary = format === 'glb';
    const exporter = new GLTFExporter();
    exporter.parse(
      exportTarget,
      (result) => {
        try {
          let blob: Blob;
          if (result instanceof ArrayBuffer) {
            blob = new Blob([result], { type: 'model/gltf-binary' });
          } else {
            const output = JSON.stringify(result, null, 2);
            blob = new Blob([output], { type: 'application/json' });
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${baseFilename}-${Date.now()}.${binary ? 'glb' : 'gltf'}`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        console.error('GLTF Export error:', error);
        reject(error);
      },
      { binary, onlyVisible: false }
    );
  });
}
