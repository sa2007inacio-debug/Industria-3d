import * as THREE from 'three';
import { Machine, Sector, MachineStatus, FactoryRoute } from '../../types/industrial';

export interface SceneObjectsMap {
  machineMeshes: Map<string, THREE.Group>;
  machineAndons: Map<string, { green: THREE.Mesh; amber: THREE.Mesh; red: THREE.Mesh; pointLight: THREE.PointLight }>;
  animatedParts: Map<string, { type: string; object: THREE.Object3D; basePos: THREE.Vector3; speed: number }>;
  routeLineGroup: THREE.Group;
  sectorGroup: THREE.Group;
  labelsGroup: THREE.Group;
  robotGroup: THREE.Group | null;
  robotLeftLeg: THREE.Group | null;
  robotRightLeg: THREE.Group | null;
  robotLeftArm: THREE.Group | null;
  robotRightArm: THREE.Group | null;
  robotTorso: THREE.Group | null;
  robotHead: THREE.Group | null;
  robotLidar: THREE.Mesh | null;
  robotTablet: THREE.Mesh | null;
  headlight: THREE.SpotLight | null;
  scanPulseMesh: THREE.Mesh | null;
}

export class FactorySceneBuilder {
  private scene: THREE.Scene;
  private objectsMap: SceneObjectsMap = {
    machineMeshes: new Map(),
    machineAndons: new Map(),
    animatedParts: new Map(),
    routeLineGroup: new THREE.Group(),
    sectorGroup: new THREE.Group(),
    labelsGroup: new THREE.Group(),
    robotGroup: null,
    robotLeftLeg: null,
    robotRightLeg: null,
    robotLeftArm: null,
    robotRightArm: null,
    robotTorso: null,
    robotHead: null,
    robotLidar: null,
    robotTablet: null,
    headlight: null,
    scanPulseMesh: null
  };

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.objectsMap.routeLineGroup);
    this.scene.add(this.objectsMap.sectorGroup);
    this.scene.add(this.objectsMap.labelsGroup);
  }

  // Build the floor, walkways, pillars, and factory ambient geometry
  public buildEnvironment(sectors: Sector[]): void {
    // 1. Factory Floor (Epoxy gray industrial concrete)
    const floorGeo = new THREE.PlaneGeometry(80, 70);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x222a36, // Professional slate industrial floor
      roughness: 0.65,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Fine industrial grid
    const gridHelper = new THREE.GridHelper(80, 40, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // 3. Main Circulation Walkways (Pedestrian green safety corridor & yellow hazard borders)
    this.buildSafetyWalkways();

    // 4. Sector zones painted on the floor
    this.buildSectorFloors(sectors);

    // 5. Factory structural pillars
    this.buildPillars();

    // 6. Perimeter low guard walls & entrance sign
    this.buildPerimeterBounds();
  }

  private buildSafetyWalkways(): void {
    const walkwayMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a2b, // Dark green safety walkway epoxy
      roughness: 0.8
    });

    const walkwayBorderMat = new THREE.MeshBasicMaterial({
      color: 0xeab308 // OSHA safety yellow line
    });

    // Central aisle (North-South)
    const centralAisle = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 64), walkwayMat);
    centralAisle.rotation.x = -Math.PI / 2;
    centralAisle.position.set(0, 0.02, 0);
    centralAisle.receiveShadow = true;
    this.scene.add(centralAisle);

    // Lateral cross walkway (East-West)
    const crossAisle = new THREE.Mesh(new THREE.PlaneGeometry(76, 3.6), walkwayMat);
    crossAisle.rotation.x = -Math.PI / 2;
    crossAisle.position.set(0, 0.02, 10);
    crossAisle.receiveShadow = true;
    this.scene.add(crossAisle);

    // Yellow boundary lines for central aisle
    const leftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 64), walkwayBorderMat);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-2.0, 0.025, 0);
    this.scene.add(leftLine);

    const rightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 64), walkwayBorderMat);
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(2.0, 0.025, 0);
    this.scene.add(rightLine);
  }

  private buildSectorFloors(sectors: Sector[]): void {
    sectors.forEach((sec) => {
      const width = sec.floorArea.maxX - sec.floorArea.minX;
      const depth = sec.floorArea.maxZ - sec.floorArea.minZ;
      const centerX = (sec.floorArea.minX + sec.floorArea.maxX) / 2;
      const centerZ = (sec.floorArea.minZ + sec.floorArea.maxZ) / 2;

      // Sector colored border line
      const borderGeo = new THREE.RingGeometry(0.5, 0.6, 4);
      // Floor tint
      const sectorFloorGeo = new THREE.PlaneGeometry(width, depth);
      const sectorMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(sec.color),
        roughness: 0.9,
        transparent: true,
        opacity: 0.08
      });
      const sectorMesh = new THREE.Mesh(sectorFloorGeo, sectorMat);
      sectorMesh.rotation.x = -Math.PI / 2;
      sectorMesh.position.set(centerX, 0.015, centerZ);
      sectorMesh.receiveShadow = true;
      this.objectsMap.sectorGroup.add(sectorMesh);

      // Floor border outline
      const edges = new THREE.EdgesGeometry(sectorFloorGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: new THREE.Color(sec.color), linewidth: 2 })
      );
      line.rotation.x = -Math.PI / 2;
      line.position.set(centerX, 0.02, centerZ);
      this.objectsMap.sectorGroup.add(line);

      // 3D Sector Marker on floor
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 512;
      textCanvas.height = 128;
      const ctx = textCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.roundRect(10, 10, 492, 108, 16);
        ctx.fill();
        ctx.strokeStyle = sec.color;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`${sec.code} · ${sec.name.toUpperCase()}`, 30, 72);
      }
      const labelTex = new THREE.CanvasTexture(textCanvas);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
      const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), labelMat);
      labelMesh.rotation.x = -Math.PI / 2;
      labelMesh.position.set(centerX, 0.03, sec.floorArea.minZ + 1.2);
      this.objectsMap.labelsGroup.add(labelMesh);
    });
  }

  private buildPillars(): void {
    const pillarGeo = new THREE.BoxGeometry(0.8, 12, 0.8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7
    });

    const positions = [
      { x: -18, z: -8 },
      { x: -18, z: 8 },
      { x: 18, z: -8 },
      { x: 18, z: 8 },
      { x: -32, z: -8 },
      { x: -32, z: 8 },
      { x: 32, z: -8 },
      { x: 32, z: 8 }
    ];

    positions.forEach((p) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(p.x, 6, p.z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);

      // Yellow hazard stripes base
      const baseGeo = new THREE.BoxGeometry(1.0, 1.2, 1.0);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.6 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(p.x, 0.6, p.z);
      this.scene.add(baseMesh);
    });
  }

  private buildPerimeterBounds(): void {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8
    });

    // Low architectural boundaries (height 1.8m)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(80, 2.4, 0.6), wallMat);
    backWall.position.set(0, 1.2, -28);
    this.scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 60), wallMat);
    leftWall.position.set(-36, 1.2, 0);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 60), wallMat);
    rightWall.position.set(36, 1.2, 0);
    this.scene.add(rightWall);
  }

  // Build high-fidelity procedural 3D model for each machine
  public buildMachines(machines: Machine[]): SceneObjectsMap {
    machines.forEach((machine) => {
      const machineGroup = new THREE.Group();
      machineGroup.position.set(machine.position.x, machine.position.y, machine.position.z);
      machineGroup.userData = { machineId: machine.id, isMachine: true };

      // Base machine chassis (dark charcoal industrial casting)
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.4,
        roughness: 0.5
      });

      // Accent panels (industrial blue or light gray)
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb, // SFioT industrial blue
        metalness: 0.2,
        roughness: 0.4
      });

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.8,
        roughness: 0.25
      });

      // Build model based on category
      switch (machine.category) {
        case 'bihler-combinada':
          this.buildBihlerModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'cnc-usinagem':
          this.buildCncModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'prensa-mola':
          this.buildStampingPressModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'linha-zincagem':
          this.buildZincLineModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'laminadora-rosca':
          this.buildThreadRollerModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'ferramentaria-retifica':
          this.buildToolroomModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        default:
          this.buildGenericIndustrialMachine(machineGroup, chassisMat, panelMat, metalMat, machine);
      }

      // Add Andon Beacon Tower on top
      const andonData = this.buildAndonTower(machineGroup, machine);
      this.objectsMap.machineAndons.set(machine.id, andonData);

      // Add Nameplate & Status Badge
      this.buildMachineNameplate(machineGroup, machine);

      this.scene.add(machineGroup);
      this.objectsMap.machineMeshes.set(machine.id, machineGroup);
    });

    return this.objectsMap;
  }

  // --- MODEL: BIHLER COMBINADA (MULTI-SLIDE RADIAL) ---
  private buildBihlerModel(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    // 1. Heavy base casting
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 3.2), chassisMat);
    base.position.y = 0.45;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // 2. Central vertical tooling faceplate (Circular mounting disc)
    const faceplateGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.4, 32);
    const faceplate = new THREE.Mesh(faceplateGeo, metalMat);
    faceplate.rotation.x = Math.PI / 2;
    faceplate.position.set(0, 2.0, 0.8);
    faceplate.castShadow = true;
    group.add(faceplate);

    // 3. Radial slides (4 eccentric slide units at 0, 90, 180, 270 deg)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), panelMat);
      slide.position.set(Math.cos(angle) * 1.0, 2.0 + Math.sin(angle) * 1.0, 0.9);
      slide.rotation.z = angle;
      group.add(slide);
    }

    // 4. Decoiler wire feed coil reel on left side
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.3, 24), metalMat);
    reel.rotation.z = Math.PI / 2;
    reel.position.set(-2.4, 1.8, 0);
    group.add(reel);

    // Animated feed reel rotation
    this.objectsMap.animatedParts.set(`${machine.id}-reel`, {
      type: 'rotation-x',
      object: reel,
      basePos: reel.position.clone(),
      speed: 1.5
    });

    // 5. Operator Console / Touchscreen Stand
    const consoleStand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5), metalMat);
    consoleStand.position.set(1.8, 0.75, 1.6);
    group.add(consoleStand);

    const consoleScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.45, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    );
    consoleScreen.position.set(1.8, 1.5, 1.6);
    consoleScreen.rotation.y = -Math.PI / 6;
    group.add(consoleScreen);

    // Screen emissive glow (running simulation)
    const screenGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.35),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    screenGlow.position.set(1.8, 1.5, 1.65);
    screenGlow.rotation.y = -Math.PI / 6;
    group.add(screenGlow);
  }

  // --- MODEL: CNC MACHINING CENTER (DMG MORI / MAZAK / HAAS) ---
  private buildCncModel(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    // 1. Lower chassis
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 3.2), chassisMat);
    base.position.y = 0.4;
    group.add(base);

    // 2. Main Enclosure Cabin (Modern white/slate industrial styling)
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Light industrial off-white
      metalness: 0.3,
      roughness: 0.4
    });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 3.0), cabinMat);
    cabin.position.y = 1.9;
    cabin.castShadow = true;
    group.add(cabin);

    // 3. Safety Glass Front Window
    const windowMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.1
    });
    const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), windowMat);
    frontWindow.position.set(0, 2.0, 1.52);
    group.add(frontWindow);

    // 4. Internal CNC Spindle Head (Animates when running)
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.15, 0.8, 16), metalMat);
    spindle.position.set(0, 2.1, 0.5);
    group.add(spindle);

    this.objectsMap.animatedParts.set(`${machine.id}-spindle`, {
      type: 'vibrate-y',
      object: spindle,
      basePos: spindle.position.clone(),
      speed: 3.0
    });

    // 5. Operator Swivel Control Arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8), metalMat);
    arm.position.set(1.9, 1.8, 1.2);
    arm.rotation.z = Math.PI / 12;
    group.add(arm);

    const screenBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.55, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    screenBox.position.set(2.1, 2.0, 1.2);
    screenBox.rotation.y = -Math.PI / 4;
    group.add(screenBox);

    // Chip Conveyor Chute at the rear/side
    const chute = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.6), metalMat);
    chute.position.set(-1.8, 0.6, -0.6);
    chute.rotation.z = -Math.PI / 8;
    group.add(chute);
  }

  // --- MODEL: PRENSA ESTAMPADORA DE MOLAS & CONFORMAÇÃO ---
  private buildStampingPressModel(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    // 1. Robust Cast Iron C-Frame Body
    const lowerBed = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 2.8), chassisMat);
    lowerBed.position.y = 0.45;
    group.add(lowerBed);

    // Vertical Columns
    const leftCol = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 1.6), panelMat);
    leftCol.position.set(-1.2, 2.1, 0);
    group.add(leftCol);

    const rightCol = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 1.6), panelMat);
    rightCol.position.set(1.2, 2.1, 0);
    group.add(rightCol);

    // Crown / Top Head
    const crown = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 2.2), chassisMat);
    crown.position.y = 3.6;
    group.add(crown);

    // Overhead Flywheel
    const flywheel = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.35, 24), metalMat);
    flywheel.rotation.z = Math.PI / 2;
    flywheel.position.set(-1.7, 3.6, 0);
    group.add(flywheel);

    // Animated Press Ram (Stamping Stroke)
    const ram = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 1.2), metalMat);
    ram.position.set(0, 2.4, 0);
    group.add(ram);

    this.objectsMap.animatedParts.set(`${machine.id}-ram`, {
      type: 'stroke-y',
      object: ram,
      basePos: ram.position.clone(),
      speed: 2.5
    });

    // Wire decoiler drum
    const wireDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 24), metalMat);
    wireDrum.position.set(1.9, 1.4, -1.0);
    group.add(wireDrum);
  }

  // --- MODEL: LINHA DE ZINCAGEM ELETROLÍTICA ---
  private buildZincLineModel(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    // 1. Long tank battery (4 chemical immersion baths)
    const tankGeo = new THREE.BoxGeometry(1.1, 1.6, 5.8);
    const tankColors = [0x0284c7, 0x0d9488, 0xd97706, 0x4f46e5];

    for (let i = 0; i < 4; i++) {
      const tankMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.6
      });
      const tank = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 1.4), tankMat);
      tank.position.set(0, 0.75, (i - 1.5) * 1.6);
      group.add(tank);

      // Liquid Surface in tank
      const liquidMat = new THREE.MeshStandardMaterial({
        color: tankColors[i],
        roughness: 0.1,
        transparent: true,
        opacity: 0.85
      });
      const liquid = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), liquidMat);
      liquid.rotation.x = -Math.PI / 2;
      liquid.position.set(0, 1.45, (i - 1.5) * 1.6);
      group.add(liquid);
    }

    // Overhead gantry crane bridge rail
    const railMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.5 }); // Yellow crane
    const leftRail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.2), railMat);
    leftRail.rotation.x = Math.PI / 2;
    leftRail.position.set(-1.2, 3.6, 0);
    group.add(leftRail);

    const rightRail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.2), railMat);
    rightRail.rotation.x = Math.PI / 2;
    rightRail.position.set(1.2, 3.6, 0);
    group.add(rightRail);

    // Crane Hoist Carrier
    const hoist = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 0.6), railMat);
    hoist.position.set(0, 3.6, 0);
    group.add(hoist);

    this.objectsMap.animatedParts.set(`${machine.id}-hoist`, {
      type: 'hoist-z',
      object: hoist,
      basePos: hoist.position.clone(),
      speed: 0.8
    });
  }

  // --- MODEL: LAMINADORA DE ROSCA HIDRÁULICA ---
  private buildThreadRollerModel(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 2.6), chassisMat);
    base.position.y = 0.4;
    group.add(base);

    // Work head
    const head = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 2.2), panelMat);
    head.position.set(0, 1.5, 0);
    group.add(head);

    // Dual thread rolling dies
    const die1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.35, 24), metalMat);
    die1.rotation.x = Math.PI / 2;
    die1.position.set(-0.45, 1.6, 1.0);
    group.add(die1);

    const die2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.35, 24), metalMat);
    die2.rotation.x = Math.PI / 2;
    die2.position.set(0.45, 1.6, 1.0);
    group.add(die2);

    this.objectsMap.animatedParts.set(`${machine.id}-roller1`, {
      type: 'rotate-z',
      object: die1,
      basePos: die1.position.clone(),
      speed: 4.0
    });
    this.objectsMap.animatedParts.set(`${machine.id}-roller2`, {
      type: 'rotate-z-inv',
      object: die2,
      basePos: die2.position.clone(),
      speed: 4.0
    });
  }

  // --- MODEL: FERRAMENTARIA E ELETROEROSÃO / RETÍFICA ---
  private buildToolroomModel(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.85, 2.8), chassisMat);
    base.position.y = 0.42;
    group.add(base);

    // Dielectric fluid basin / Magnetic chuck bed
    const chuck = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.8), metalMat);
    chuck.position.set(0, 1.05, 0.2);
    group.add(chuck);

    // Rear precision column
    const column = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.4), panelMat);
    column.position.set(0, 1.95, -0.8);
    group.add(column);

    // Grinding spindle arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.0), metalMat);
    arm.position.set(0, 2.3, 0.1);
    group.add(arm);
  }

  private buildGenericIndustrialMachine(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    _machine: Machine
  ): void {
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.8, 2.6), panelMat);
    base.position.y = 0.9;
    group.add(base);
  }

  // Build Andon Light Tower (Green, Amber, Red stack with prominent high-power lenses)
  private buildAndonTower(
    group: THREE.Group,
    machine: Machine
  ): { green: THREE.Mesh; amber: THREE.Mesh; red: THREE.Mesh; pointLight: THREE.PointLight } {
    // 1. Tall industrial steel mast (elevated above machine roof for maximum visibility)
    const andonStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.85 })
    );
    andonStem.position.set(1.4, machine.dimensions.height + 0.8, 0.8);
    group.add(andonStem);

    // Large, high-visibility cylindrical lenses for all 3 colors (radius 0.20, height 0.34)
    const segGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.34, 24);

    // Red segment (top) - prominent industrial red lens
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: machine.status === 'stopped' ? 6.0 : 0.4,
      roughness: 0.15,
      metalness: 0.1
    });
    const redMesh = new THREE.Mesh(segGeo, redMat);
    redMesh.position.set(1.4, machine.dimensions.height + 2.05, 0.8);
    group.add(redMesh);

    // Amber / Yellow segment (middle) - prominent industrial amber lens
    const amberMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: machine.status === 'attention' ? 6.0 : 0.4,
      roughness: 0.15,
      metalness: 0.1
    });
    const amberMesh = new THREE.Mesh(segGeo, amberMat);
    amberMesh.position.set(1.4, machine.dimensions.height + 1.68, 0.8);
    group.add(amberMesh);

    // Green segment (bottom) - prominent industrial emerald green lens
    const greenMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: machine.status === 'running' ? 6.0 : 0.4,
      roughness: 0.15,
      metalness: 0.1
    });
    const greenMesh = new THREE.Mesh(segGeo, greenMat);
    greenMesh.position.set(1.4, machine.dimensions.height + 1.31, 0.8);
    group.add(greenMesh);

    // Heavy duty separator rings between lenses
    const ringGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.2 });

    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.set(1.4, machine.dimensions.height + 1.49, 0.8);
    group.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.position.set(1.4, machine.dimensions.height + 1.86, 0.8);
    group.add(ring2);

    // Top cap beacon
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.16, 24), ringMat);
    cap.position.set(1.4, machine.dimensions.height + 2.30, 0.8);
    group.add(cap);

    // High-power omnidirectional PointLight with wide reach (illuminating machine roof and surroundings)
    let lightColor = 0x10b981;
    let lightIntensity = 4.0;
    if (machine.status === 'attention') {
      lightColor = 0xf59e0b;
      lightIntensity = 4.5;
    } else if (machine.status === 'stopped') {
      lightColor = 0xef4444;
      lightIntensity = 6.0;
    } else if (machine.status === 'offline') {
      lightIntensity = 0;
    }

    const pointLight = new THREE.PointLight(lightColor, lightIntensity, 18, 1.1);
    pointLight.position.set(1.4, machine.dimensions.height + 1.7, 0.8);
    group.add(pointLight);

    return { green: greenMesh, amber: amberMesh, red: redMesh, pointLight };
  }

  // Floating identification badge plate atop machine
  private buildMachineNameplate(group: THREE.Group, machine: Machine): void {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background card
      ctx.fillStyle = '#0f172a';
      ctx.roundRect(8, 8, 240, 112, 16);
      ctx.fill();

      // Border colored by status
      let statusColor = '#10b981';
      if (machine.status === 'attention') statusColor = '#f59e0b';
      if (machine.status === 'stopped') statusColor = '#ef4444';
      if (machine.status === 'offline') statusColor = '#64748b';

      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 6;
      ctx.stroke();

      // Machine Code
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(machine.code, 128, 62);

      // Subtitle
      ctx.fillStyle = statusColor;
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        machine.status === 'running'
          ? 'OPERANDO'
          : machine.status === 'attention'
          ? 'ATENÇÃO'
          : machine.status === 'stopped'
          ? 'PARADA'
          : 'OFFLINE',
        128,
        96
      );
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 1.2, 1);
    sprite.position.set(0, machine.dimensions.height + 1.2, 0);
    group.add(sprite);
  }

  // Update Andon and dynamic lights when machine state changes in real-time
  public updateMachineVisualState(machineId: string, status: MachineStatus): void {
    const andon = this.objectsMap.machineAndons.get(machineId);
    if (!andon) return;

    const redMat = andon.red.material as THREE.MeshStandardMaterial;
    const amberMat = andon.amber.material as THREE.MeshStandardMaterial;
    const greenMat = andon.green.material as THREE.MeshStandardMaterial;

    redMat.emissive.setHex(status === 'stopped' ? 0xef4444 : 0x000000);
    redMat.emissiveIntensity = status === 'stopped' ? 2.8 : 0;

    amberMat.emissive.setHex(status === 'attention' ? 0xf59e0b : 0x000000);
    amberMat.emissiveIntensity = status === 'attention' ? 2.8 : 0;

    greenMat.emissive.setHex(status === 'running' ? 0x10b981 : 0x000000);
    greenMat.emissiveIntensity = status === 'running' ? 2.8 : 0;

    if (status === 'running') {
      andon.pointLight.color.setHex(0x10b981);
      andon.pointLight.intensity = 1.2;
    } else if (status === 'attention') {
      andon.pointLight.color.setHex(0xf59e0b);
      andon.pointLight.intensity = 1.5;
    } else if (status === 'stopped') {
      andon.pointLight.color.setHex(0xef4444);
      andon.pointLight.intensity = 1.8;
    } else {
      andon.pointLight.intensity = 0;
    }
  }

  // Draw the animated navigation route on the floor (GPS Interno)
  public renderNavigationRoute(route: FactoryRoute | null): void {
    // Clear existing route line
    while (this.objectsMap.routeLineGroup.children.length > 0) {
      const obj = this.objectsMap.routeLineGroup.children[0];
      this.objectsMap.routeLineGroup.remove(obj);
    }

    if (!route || route.waypoints.length < 2) return;

    const points: THREE.Vector3[] = [];
    route.waypoints.forEach((wp) => {
      points.push(new THREE.Vector3(wp.x, 0.06, wp.z));
    });

    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.14, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8 // Glowing cyan path
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.objectsMap.routeLineGroup.add(tubeMesh);

    // Waypoint pulsating markers
    route.waypoints.forEach((wp, idx) => {
      const markerGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: idx === route.waypoints.length - 1 ? 0xef4444 : 0x0284c7
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(wp.x, 0.07, wp.z);
      this.objectsMap.routeLineGroup.add(marker);
    });
  }

  // Animate moving parts per frame
  public updateAnimations(time: number, machineStatuses: Map<string, MachineStatus>): void {
    // High-Intensity Dynamic Pulsing of all Andons (Verde, Amarelo, Vermelho pulsando bem forte)
    const pulseNorm = Math.sin(time * 5.5) * 0.5 + 0.5; // Smooth 0 to 1 wave (cadência forte)
    const pulseFast = Math.sin(time * 11.0) * 0.5 + 0.5; // Alarme rápido para máquina parada

    this.objectsMap.machineAndons.forEach((andon, machineId) => {
      const status = machineStatuses.get(machineId) || 'running';
      const redMat = andon.red.material as THREE.MeshStandardMaterial;
      const amberMat = andon.amber.material as THREE.MeshStandardMaterial;
      const greenMat = andon.green.material as THREE.MeshStandardMaterial;

      if (status === 'running') {
        // Verde pulsando muito forte (4.5 a 11.0 emissive)
        greenMat.emissive.setHex(0x10b981);
        greenMat.emissiveIntensity = 4.5 + pulseNorm * 6.5;
        amberMat.emissive.setHex(0xf59e0b);
        amberMat.emissiveIntensity = 0.4; // Lente amarela visível acesa
        redMat.emissive.setHex(0xef4444);
        redMat.emissiveIntensity = 0.4; // Lente vermelha visível acesa

        andon.pointLight.color.setHex(0x10b981);
        andon.pointLight.intensity = 3.5 + pulseNorm * 5.5;
      } else if (status === 'attention') {
        // Amarelo pulsando forte (5.0 a 12.0 emissive)
        amberMat.emissive.setHex(0xf59e0b);
        amberMat.emissiveIntensity = 5.0 + pulseNorm * 7.0;
        greenMat.emissive.setHex(0x10b981);
        greenMat.emissiveIntensity = 0.4;
        redMat.emissive.setHex(0xef4444);
        redMat.emissiveIntensity = 0.4;

        andon.pointLight.color.setHex(0xf59e0b);
        andon.pointLight.intensity = 3.8 + pulseNorm * 6.0;
      } else if (status === 'stopped') {
        // Vermelho pulsando alarme bem forte (6.0 a 15.0 emissive strobe)
        redMat.emissive.setHex(0xef4444);
        redMat.emissiveIntensity = 6.0 + pulseFast * 9.0;
        amberMat.emissive.setHex(0xf59e0b);
        amberMat.emissiveIntensity = 0.4;
        greenMat.emissive.setHex(0x10b981);
        greenMat.emissiveIntensity = 0.4;

        andon.pointLight.color.setHex(0xef4444);
        andon.pointLight.intensity = 4.5 + pulseFast * 7.5;
      } else {
        // Offline: lentes translúcidas visíveis, halo apagado
        greenMat.emissive.setHex(0x10b981);
        greenMat.emissiveIntensity = 0.15;
        amberMat.emissive.setHex(0xf59e0b);
        amberMat.emissiveIntensity = 0.15;
        redMat.emissive.setHex(0xef4444);
        redMat.emissiveIntensity = 0.15;
        andon.pointLight.intensity = 0;
      }
    });

    this.objectsMap.animatedParts.forEach((part, key) => {
      const machineId = key.split('-')[0];
      const status = machineStatuses.get(machineId);

      // Only animate if machine is operating
      if (status !== 'running') return;

      if (part.type === 'stroke-y') {
        const offset = Math.sin(time * part.speed * 4) * 0.22;
        part.object.position.y = part.basePos.y + offset;
      } else if (part.type === 'vibrate-y') {
        const offset = Math.sin(time * 25) * 0.015;
        part.object.position.y = part.basePos.y + offset;
      } else if (part.type === 'rotation-x') {
        part.object.rotation.x += 0.05 * part.speed;
      } else if (part.type === 'rotate-z') {
        part.object.rotation.z += 0.08 * part.speed;
      } else if (part.type === 'rotate-z-inv') {
        part.object.rotation.z -= 0.08 * part.speed;
      } else if (part.type === 'hoist-z') {
        const offset = Math.sin(time * 0.8) * 1.8;
        part.object.position.z = part.basePos.z + offset;
      }
    });
  }

  // --- ROBÔ INSPETOR HUMANOIDE (AVATAR DO OPERADOR) ---
  public buildRobotAvatar(initialPos = new THREE.Vector3(0, 0, 20)): THREE.Group {
    const robotGroup = new THREE.Group();
    robotGroup.position.copy(initialPos);
    robotGroup.userData = { isRobot: true };

    const slateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.5
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.2
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7
    });

    const safetyVestMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // High-vis Safety Orange
      roughness: 0.6
    });

    const reflectiveStripeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 2.5
    });

    // 1. Pelvis & Hips Base (Y = 0.85m)
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.20, 0.28), slateMat);
    pelvis.position.y = 0.85;
    pelvis.castShadow = true;
    robotGroup.add(pelvis);

    // 2. Left Leg Group (articulated pivot at hip)
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.16, 0.82, 0);

    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.40, 16), whiteMat);
    leftThigh.position.y = -0.20;
    leftThigh.castShadow = true;
    leftLegGroup.add(leftThigh);

    const leftKnee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), slateMat);
    leftKnee.position.y = -0.40;
    leftLegGroup.add(leftKnee);

    const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.38, 16), slateMat);
    leftCalf.position.y = -0.59;
    leftCalf.castShadow = true;
    leftLegGroup.add(leftCalf);

    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.30), bootMat);
    leftBoot.position.set(0, -0.78, -0.05);
    leftBoot.castShadow = true;
    leftLegGroup.add(leftBoot);

    // Safety yellow toe cap on boot
    const leftToeCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.162, 0.08, 0.10),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 })
    );
    leftToeCap.position.set(0, -0.78, -0.16);
    leftLegGroup.add(leftToeCap);

    robotGroup.add(leftLegGroup);
    this.objectsMap.robotLeftLeg = leftLegGroup;

    // 3. Right Leg Group (articulated pivot at hip)
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.16, 0.82, 0);

    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.40, 16), whiteMat);
    rightThigh.position.y = -0.20;
    rightThigh.castShadow = true;
    rightLegGroup.add(rightThigh);

    const rightKnee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), slateMat);
    rightKnee.position.y = -0.40;
    rightLegGroup.add(rightKnee);

    const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.38, 16), slateMat);
    rightCalf.position.y = -0.59;
    rightCalf.castShadow = true;
    rightLegGroup.add(rightCalf);

    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.30), bootMat);
    rightBoot.position.set(0, -0.78, -0.05);
    rightBoot.castShadow = true;
    rightLegGroup.add(rightBoot);

    const rightToeCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.162, 0.08, 0.10),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 })
    );
    rightToeCap.position.set(0, -0.78, -0.16);
    rightLegGroup.add(rightToeCap);

    robotGroup.add(rightLegGroup);
    this.objectsMap.robotRightLeg = rightLegGroup;

    // 4. Torso Group (articulated upper body with safety vest)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.95, 0);

    // Main chest & abdomen
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.58, 0.32), safetyVestMat);
    chest.position.y = 0.29;
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Safety high-vis reflective bands (horizontal stripes)
    const vestStripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.07, 0.33), reflectiveStripeMat);
    vestStripe1.position.y = 0.22;
    torsoGroup.add(vestStripe1);

    const vestStripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.07, 0.33), reflectiveStripeMat);
    vestStripe2.position.y = 0.38;
    torsoGroup.add(vestStripe2);

    // SFioT Industrial ID Badge on Chest
    const idBadge = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.10, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    idBadge.position.set(-0.16, 0.45, -0.17);
    torsoGroup.add(idBadge);

    // 5. Left Arm (Holds Rugged Industrial Telemetry Tablet)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 0.52, 0);

    const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.32, 16), whiteMat);
    leftBicep.position.y = -0.16;
    leftBicep.castShadow = true;
    leftArmGroup.add(leftBicep);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.30, 16), slateMat);
    leftForearm.position.set(0, -0.32, -0.12);
    leftForearm.rotation.x = -Math.PI / 4;
    leftArmGroup.add(leftForearm);

    // Tablet PC enclosure held in left hand
    const tabletGeo = new THREE.BoxGeometry(0.36, 0.26, 0.04);
    const tabletMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.3 });
    const tabletMesh = new THREE.Mesh(tabletGeo, tabletMat);
    tabletMesh.position.set(0.12, -0.42, -0.28);
    tabletMesh.rotation.x = -Math.PI / 3;
    leftArmGroup.add(tabletMesh);

    // Glowing cyan telemetry screen on tablet
    const screenGeo = new THREE.PlaneGeometry(0.32, 0.22);
    const screenMesh = new THREE.Mesh(screenGeo, cyanGlowMat);
    screenMesh.position.set(0.12, -0.41, -0.26);
    screenMesh.rotation.x = -Math.PI / 3;
    leftArmGroup.add(screenMesh);
    this.objectsMap.robotTablet = screenMesh;

    torsoGroup.add(leftArmGroup);
    this.objectsMap.robotLeftArm = leftArmGroup;

    // 6. Right Arm (Swings freely during walk)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 0.52, 0);

    const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.32, 16), whiteMat);
    rightBicep.position.y = -0.16;
    rightBicep.castShadow = true;
    rightArmGroup.add(rightBicep);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 16), slateMat);
    rightForearm.position.y = -0.40;
    rightForearm.castShadow = true;
    rightArmGroup.add(rightForearm);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), bootMat);
    rightHand.position.y = -0.58;
    rightArmGroup.add(rightHand);

    torsoGroup.add(rightArmGroup);
    this.objectsMap.robotRightArm = rightArmGroup;

    // 7. Head Group (Inspector helmet with curved visor, glowing eyes, LiDAR)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.65, 0);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16), slateMat);
    neck.position.y = 0.05;
    headGroup.add(neck);

    // Helmet Chassis
    const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.38), whiteMat);
    helmet.position.set(0, 0.24, 0);
    helmet.castShadow = true;
    headGroup.add(helmet);

    // Curved Dark Visor Faceplate
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      roughness: 0.1,
      metalness: 0.9
    });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.10), visorMat);
    visor.position.set(0, 0.24, -0.16);
    headGroup.add(visor);

    // Glowing Cyan Digital Eyes / HUD Bar (faces -Z forward)
    const eyes = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.06),
      cyanGlowMat
    );
    eyes.position.set(0, 0.25, -0.215);
    eyes.rotation.y = Math.PI;
    headGroup.add(eyes);

    // Top Spinning 360° LiDAR Puck
    const lidarPuck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.10, 20),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 })
    );
    lidarPuck.position.set(0, 0.46, 0);
    headGroup.add(lidarPuck);
    this.objectsMap.robotLidar = lidarPuck;

    // Laser cyan optical ring on LiDAR
    const laserRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.122, 0.012, 8, 20),
      cyanGlowMat
    );
    laserRing.rotation.x = Math.PI / 2;
    laserRing.position.set(0, 0.46, 0);
    headGroup.add(laserRing);

    // Safety beacon atop helmet
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.09, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 2.2 })
    );
    beacon.position.set(0, 0.54, 0);
    headGroup.add(beacon);

    // Comms Antenna on side
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8),
      slateMat
    );
    antenna.position.set(0.18, 0.40, 0.08);
    antenna.rotation.z = -Math.PI / 16;
    headGroup.add(antenna);

    torsoGroup.add(headGroup);
    this.objectsMap.robotHead = headGroup;

    // 8. Forward-Facing High Power Inspection Headlight (illuminates machines in front)
    const headlight = new THREE.SpotLight(0xffffff, 4.0, 32, Math.PI / 4, 0.35, 1.2);
    headlight.position.set(0, 0.45, -0.25);
    const targetObj = new THREE.Object3D();
    targetObj.position.set(0, 0, -12);
    torsoGroup.add(targetObj);
    headlight.target = targetObj;
    headlight.castShadow = true;
    torsoGroup.add(headlight);
    this.objectsMap.headlight = headlight;

    robotGroup.add(torsoGroup);
    this.objectsMap.robotTorso = torsoGroup;

    // 9. Floating Identification Sprite Above Avatar
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.roundRect(6, 6, 244, 68, 16);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🤖 INSPETOR (VOCÊ)', 128, 48);
    }
    const spriteTex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: spriteTex, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.2, 0.70, 1);
    sprite.position.set(0, 2.35, 0);
    robotGroup.add(sprite);

    // 10. Pulse Ring for Spacebar Scan / Horn
    const pulseGeo = new THREE.RingGeometry(0.4, 0.60, 32);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.rotation.x = -Math.PI / 2;
    pulseMesh.position.y = 0.04;
    robotGroup.add(pulseMesh);
    this.objectsMap.scanPulseMesh = pulseMesh;

    this.scene.add(robotGroup);
    this.objectsMap.robotGroup = robotGroup;
    return robotGroup;
  }

  // Update humanoid avatar kinematics, articulated walking stride, and parts per frame
  public updateRobotTransform(
    position: THREE.Vector3,
    rotationY: number,
    isMoving: boolean,
    walkCycle: number,
    time: number
  ): void {
    if (!this.objectsMap.robotGroup) return;

    this.objectsMap.robotGroup.position.copy(position);
    this.objectsMap.robotGroup.rotation.y = rotationY;

    // Spin LiDAR continuously
    if (this.objectsMap.robotLidar) {
      this.objectsMap.robotLidar.rotation.y += 0.14;
    }

    // Articulated Biped Walking Animation
    if (isMoving) {
      // Natural leg swinging motion
      if (this.objectsMap.robotLeftLeg) {
        this.objectsMap.robotLeftLeg.rotation.x = Math.sin(walkCycle) * 0.65;
      }
      if (this.objectsMap.robotRightLeg) {
        this.objectsMap.robotRightLeg.rotation.x = -Math.sin(walkCycle) * 0.65;
      }

      // Arms swing in counter-phase to legs (like a real person walking)
      if (this.objectsMap.robotRightArm) {
        this.objectsMap.robotRightArm.rotation.x = Math.sin(walkCycle) * 0.50;
      }
      if (this.objectsMap.robotLeftArm) {
        // Holding tablet: subtle rhythm
        this.objectsMap.robotLeftArm.rotation.x = -0.25 + Math.sin(walkCycle) * 0.15;
      }

      // Natural vertical torso bobbing while walking
      if (this.objectsMap.robotTorso) {
        this.objectsMap.robotTorso.position.y = 0.95 + Math.abs(Math.sin(walkCycle)) * 0.04;
      }
    } else {
      // Return smoothly to idle stance
      if (this.objectsMap.robotLeftLeg) {
        this.objectsMap.robotLeftLeg.rotation.x = THREE.MathUtils.lerp(
          this.objectsMap.robotLeftLeg.rotation.x,
          0,
          0.15
        );
      }
      if (this.objectsMap.robotRightLeg) {
        this.objectsMap.robotRightLeg.rotation.x = THREE.MathUtils.lerp(
          this.objectsMap.robotRightLeg.rotation.x,
          0,
          0.15
        );
      }
      if (this.objectsMap.robotRightArm) {
        this.objectsMap.robotRightArm.rotation.x = THREE.MathUtils.lerp(
          this.objectsMap.robotRightArm.rotation.x,
          0,
          0.15
        );
      }
      if (this.objectsMap.robotLeftArm) {
        this.objectsMap.robotLeftArm.rotation.x = THREE.MathUtils.lerp(
          this.objectsMap.robotLeftArm.rotation.x,
          -0.25,
          0.15
        );
      }

      // Gentle idle breathing
      if (this.objectsMap.robotTorso) {
        this.objectsMap.robotTorso.position.y = 0.95 + Math.sin(time * 2.5) * 0.01;
      }
    }
  }

  // Trigger pulse radar ring on the floor (Spacebar or Scan button)
  public triggerRobotScanPulse(progress: number): void {
    if (!this.objectsMap.scanPulseMesh) return;
    const scale = 1 + progress * 16;
    this.objectsMap.scanPulseMesh.scale.set(scale, scale, 1);
    const mat = this.objectsMap.scanPulseMesh.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 1 - progress);
  }
}
