export default function buildImageUrl(image: string) {
  const { DOMAIN_NAME, API_PREFIX } = process.env;
  const domain = `${DOMAIN_NAME}/${API_PREFIX}`;

  return `${domain}/${image}`;
}
