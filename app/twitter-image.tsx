import { SOCIAL_IMAGE_ALT, SOCIAL_IMAGE_SIZE, renderSocialImage } from "@/lib/social-image";

export const alt = SOCIAL_IMAGE_ALT;
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

/** Same card for X and other networks that read twitter:image; see lib/social-image.tsx. */
export default function Image() {
  return renderSocialImage();
}
