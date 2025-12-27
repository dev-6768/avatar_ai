import * as THREE from "three";

export const AnimationStates = {
  idle: {
    name: "idle",
    label: "Idle",
    file: "/remy_animations/remy_idle.fbx",
    loop: THREE.LoopRepeat,
    isDefault: true,
  },

  hipHop: {
    name: "hipHop",
    label: "Hip Hop 💃",
    file: "/remy_animations/remy_hip_hop_dancing.fbx",
    loop: THREE.LoopOnce,
  },

  cheer: {
    name: "cheer",
    label: "Cheer 🎉",
    file: "/remy_animations/remy_cheering.fbx",
    loop: THREE.LoopOnce,
  },

  sad: {
    name: "sad",
    label: "Sad 😔",
    file: "/remy_animations/remy_sad.fbx",
    loop: THREE.LoopOnce,
  },

  happy: {
    name: "happy",
    label: "Happy 🙂",
    file: "/remy_animations/remy_happy.fbx",
    loop: THREE.LoopOnce,
  },

  jump: {
    name: "jump",
    label: "Jump 🦘",
    file: "/remy_animations/remy_jump.fbx",
    loop: THREE.LoopOnce,
  },

  talk: {
    name: "talk",
    label: "Talk 🗣️",
    file: "/remy_animations/remy_talk.fbx",
    loop: THREE.LoopOnce,
  },

  disappointed: {
    name: "disappointed",
    label: "Disappointed 😞",
    file: "/remy_animations/remy_disappointed.fbx",
    loop: THREE.LoopOnce,
  },

  wave: {
    name: "wave",
    label: "Wave 👋",
    file: "/remy_animations/remy_wave.fbx",
    loop: THREE.LoopOnce,
  },

  think: {
    name: "think",
    label: "Think 👋",
    file: "/remy_animations/remy_thinking.fbx",
    loop: THREE.LoopRepeat,
  },
  // 👉 Add new animations here only
};
