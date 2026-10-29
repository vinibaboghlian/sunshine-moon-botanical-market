export const STORE_CONFIG = {
  name: "Sunshine Moon Botanical Market",
  tagline: "Autocuidado botânico artesanal",
  whatsapp: {
    phoneNumber: "5511999999999",
    defaultMessage: "Olá! Estava navegando na Sunshine Moon e gostaria de tirar uma dúvida sobre os produtos.",
  },
  shipping: {
    originPostalCode: "01001-000",
  },
} as const;

export function getWhatsAppSupportUrl(message?: string): string {
  const text = encodeURIComponent(message || STORE_CONFIG.whatsapp.defaultMessage);
  return `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${text}`;
}

