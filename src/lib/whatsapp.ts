/**
 * Crochet Corner WhatsApp deep-link helpers.
 * Replace WHATSAPP_NUMBER with the live business number (country code, no +).
 */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919461637281";

export const formatINR = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const link = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export function createProductOrderUrl(
  productTitle: string,
  price: number,
  url?: string,
): string {
  const message = `Hi Crochet Corner 👋\n\nI would like to order:\n• Product: ${productTitle}\n• Price: ₹${price}${
    url ? `\n• Link: ${url}` : ""
  }\n\nPlease let me know about availability and dispatch details!`;
  return link(message);
}

export function createCustomOrderUrl(data: {
  idea: string;
  name?: string;
  phone?: string;
  address?: string;
  pincode?: string;
  colors?: string;
  size?: string;
  date?: string;
  notes?: string;
}): string {
  const deliveryInfo = data.address || data.pincode
    ? `\n• Delivery Address: ${data.address || "—"}${data.pincode ? ` (Pin: ${data.pincode})` : ""}`
    : "";

  const message = [
    "Hi Crochet Corner 👋",
    "",
    "I'd like to place a custom crochet order:",
    `• Name: ${data.name || "—"}`,
    data.phone ? `• Phone: ${data.phone}` : null,
    deliveryInfo ? deliveryInfo.trim() : null,
    `• Idea: ${data.idea}`,
    `• Colors: ${data.colors || "Standard"}`,
    `• Size/Qty: ${data.size || "Regular"}`,
    `• Needed by: ${data.date || "Flexible"}`,
    data.notes ? `• Notes: ${data.notes}` : null,
    "",
    "Let's discuss feasibility and quotation!",
  ]
    .filter(Boolean)
    .join("\n");

  return link(message);
}

export function createGeneralEnquiryUrl(): string {
  return link(
    "Hi Crochet Corner 👋\n\nI found your website and would love to know more about your handmade crochet pieces!",
  );
}

function formatImageUrl(image?: string): string {
  if (!image) return "N/A";
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    const path = image.startsWith("/") ? image : `/${image}`;
    return encodeURI(`${origin}${path}`);
  }
  return image;
}

export type CheckoutLine = {
  title: string;
  quantity: number;
  price: number;
  selectedColor?: string;
  image?: string;
};

export type ShippingDetails = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

export function createCartCheckoutUrl(
  lines: CheckoutLine[],
  subtotal: number,
  giftUnlocked: boolean,
  settings: { free_gift_title: string; free_gift_value_label: string },
  shipping?: ShippingDetails
): string {
  const details = lines
    .map((item, index) => {
      const colour = item.selectedColor ? ` (${item.selectedColor})` : "";
      const imgUrl = formatImageUrl(item.image);
      const itemPrice = item.price * item.quantity;
      return `${index + 1}. *${item.title}${colour}*\n   • Qty: ${item.quantity} | Price: ₹${itemPrice}\n   • Photo/Ref: ${imgUrl}`;
    })
    .join("\n\n");

  const promoGift = giftUnlocked
    ? `${settings.free_gift_title} (${settings.free_gift_value_label})`
    : "None";

  let message: string;

  if (shipping) {
    message = [
      "Hello Crochet Corner!",
      "",
      "I would like to place an order. Here are my delivery details and order summary:",
      "",
      "SHIPPING DETAILS:",
      `• Name: ${shipping.name}`,
      `• Phone: ${shipping.phone}`,
      `• Address: ${shipping.address}, ${shipping.city} - ${shipping.pincode}`,
      "",
      "ORDER SUMMARY:",
      "----------------------------------------",
      details,
      "----------------------------------------",
      `🎁 Promotional Gift: ${promoGift}`,
      `💰 Total Estimated Amount: ₹${subtotal}`,
      "",
      "Please confirm availability and shipping timeline!",
    ].join("\n");
  } else {
    message = [
      "Hello Crochet Corner!",
      "",
      "I would like to place an order for the following items:",
      "",
      "ORDER SUMMARY:",
      "----------------------------------------",
      details,
      "----------------------------------------",
      `🎁 Promotional Gift: ${promoGift}`,
      `💰 Total Estimated Amount: ₹${subtotal}`,
      "",
      "Please confirm product availability, crafting timeline, and shipping details!",
    ].join("\n");
  }

  return link(message);
}

export function openWhatsApp(url: string) {
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener");
}
