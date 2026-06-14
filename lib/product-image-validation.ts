export const PRODUCT_IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const PRODUCT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const PRODUCT_IMAGE_SIZE_ERROR = "A imagem deve ter no máximo 10 MB.";
export const PRODUCT_IMAGE_TYPE_ERROR = "Envie uma imagem em JPG, PNG ou WEBP.";

const allowedProductImageTypes = PRODUCT_IMAGE_ACCEPT.split(",");

export function validateProductImageFile(file: File) {
  if (!allowedProductImageTypes.includes(file.type)) {
    return PRODUCT_IMAGE_TYPE_ERROR;
  }

  if (file.size > PRODUCT_IMAGE_MAX_SIZE_BYTES) {
    return PRODUCT_IMAGE_SIZE_ERROR;
  }

  return null;
}
