import bg from "@/assets/images/bg.png";
import highlight from "@/assets/images/highlight.png";
import rankingGradient from "@/assets/images/rankingGradient.png";

export const images_old = {
  bg,
  highlight,
  rankingGradient,
};

export const ImageHostType = {
  local: "LOCAL",
  cloud: "CLOUD",
} as const;
export type ImageHostType = typeof ImageHostType[keyof typeof ImageHostType];
