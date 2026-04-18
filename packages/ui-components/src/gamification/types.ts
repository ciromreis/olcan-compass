export type PresenceSpecies =
  | "avian"
  | "construct"
  | "feline"
  | "moth"
  | "serpentine"
  | "cephalopod";

export type PresenceAttachment =
  | "antlers"
  | "antennae"
  | "fins"
  | "horns"
  | "orbitals"
  | "wings";

export type PresenceLocomotion = "hover" | "limbs" | "thrusters" | "tendrils";
export type PresenceEyeStyle = "mono" | "paired" | "triad" | "visor";
export type PresenceMood = "atenta" | "densa" | "exausta" | "expansiva" | "radiante" | "tensa";

export interface PresenceFigureSpec {
  seed: string;
  species: PresenceSpecies;
  attachment: PresenceAttachment;
  locomotion: PresenceLocomotion;
  eyeStyle: PresenceEyeStyle;
  bodyScale: number;
  detailLevel: number;
  metallic: number;
  symmetry: number;
  primaryHue: number;
  secondaryHue: number;
  orbitCount: number;
  haloIntensity: number;
}
