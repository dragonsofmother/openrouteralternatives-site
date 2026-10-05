import { SOCIAL_IMAGE_ALT, SOCIAL_IMAGE_SIZE, renderSocialImage } from "@/lib/social-image";

export const alt = SOCIAL_IMAGE_ALT;
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

/** Open Graph card for every route; see lib/social-image.tsx. */
export default function Image() {
  return renderSocialImage();
}
