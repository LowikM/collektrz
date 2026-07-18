import { isCardLanguage } from "@/lib/languages";
import {
  isSealedCondition,
  isSealedProductType,
  isValidCollectionImageUrl,
} from "@/lib/sealed-products";

const ITEM_KINDS = ["card", "sealed"] as const;

export type CollectionItemKind = (typeof ITEM_KINDS)[number];

function isItemKind(value: string): value is CollectionItemKind {
  return ITEM_KINDS.includes(value as CollectionItemKind);
}

function getOptionalText(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isValidTcgApiCardId(value: string) {
  return /^[a-zA-Z0-9-]+$/.test(value) && value.length <= 64;
}

function parseOptionalApiFields(formData: FormData, itemKind: CollectionItemKind):
  | { error: string }
  | {
      tcg_api_card_id: string | null;
      card_number: string | null;
      set_id: string | null;
    } {
  if (itemKind === "sealed") {
    return {
      tcg_api_card_id: null,
      card_number: null,
      set_id: null,
    };
  }

  const tcgApiCardId = getOptionalText(formData, "tcg_api_card_id");
  const cardNumber = getOptionalText(formData, "card_number");
  const setId = getOptionalText(formData, "set_id");

  const hasAnyApiField = Boolean(tcgApiCardId || cardNumber || setId);

  if (!hasAnyApiField) {
    return {
      tcg_api_card_id: null,
      card_number: null,
      set_id: null,
    };
  }

  if (!tcgApiCardId || !isValidTcgApiCardId(tcgApiCardId)) {
    return { error: "Please select a valid official card." };
  }

  return {
    tcg_api_card_id: tcgApiCardId,
    card_number: cardNumber,
    set_id: setId,
  };
}

function parseSealedFields(formData: FormData):
  | { error: string }
  | {
      sealed_product_type: string;
      image_url: string | null;
      condition: string | null;
    } {
  const productName = formData.get("card_name");
  const sealedProductType = formData.get("sealed_product_type");
  const condition = getOptionalText(formData, "condition");
  const imageUrl = getOptionalText(formData, "image_url");

  if (typeof productName !== "string" || !productName.trim()) {
    return { error: "Product name is required." };
  }

  if (
    typeof sealedProductType !== "string" ||
    !isSealedProductType(sealedProductType)
  ) {
    return { error: "Please select a valid product type." };
  }

  if (condition && !isSealedCondition(condition)) {
    return { error: "Please select a valid sealed condition." };
  }

  if (imageUrl && !isValidCollectionImageUrl(imageUrl)) {
    return {
      error: "Image URL must be a valid http or https link.",
    };
  }

  return {
    sealed_product_type: sealedProductType,
    image_url: imageUrl,
    condition,
  };
}

function parseCardFields(formData: FormData):
  | { error: string }
  | {
      card_name: string;
      card_ref: string;
      condition: string | null;
      sealed_product_type: null;
      image_url: null;
    } {
  const cardName = formData.get("card_name");

  if (typeof cardName !== "string" || !cardName.trim()) {
    return { error: "Card name is required." };
  }

  const normalizedCardName = cardName.trim();

  return {
    card_name: normalizedCardName,
    card_ref: normalizedCardName.toLowerCase(),
    condition: getOptionalText(formData, "condition"),
    sealed_product_type: null,
    image_url: null,
  };
}

export function parseCollectionFields(formData: FormData):
  | { error: string }
  | {
      data: {
        item_kind: CollectionItemKind;
        card_name: string;
        card_ref: string;
        set_name: string | null;
        condition: string | null;
        notes: string | null;
        language: string | null;
        quantity: number;
        tcg_api_card_id: string | null;
        card_number: string | null;
        set_id: string | null;
        sealed_product_type: string | null;
        image_url: string | null;
      };
    } {
  const itemKind = formData.get("item_kind");
  const quantityValue = formData.get("quantity");

  if (typeof itemKind !== "string" || !isItemKind(itemKind)) {
    return { error: "Please select a valid item kind." };
  }

  const quantity =
    typeof quantityValue === "string" ? Number.parseInt(quantityValue, 10) : NaN;

  if (!Number.isInteger(quantity) || quantity < 1) {
    return { error: "Quantity must be at least 1." };
  }

  const languageValue = getOptionalText(formData, "language");

  if (languageValue && !isCardLanguage(languageValue)) {
    return { error: "Please select a valid language." };
  }

  const apiFields = parseOptionalApiFields(formData, itemKind);

  if ("error" in apiFields) {
    return apiFields;
  }

  if (itemKind === "sealed") {
    const sealedFields = parseSealedFields(formData);

    if ("error" in sealedFields) {
      return sealedFields;
    }

    const productName = (formData.get("card_name") as string).trim();

    return {
      data: {
        item_kind: itemKind,
        card_name: productName,
        card_ref: productName.toLowerCase(),
        set_name: getOptionalText(formData, "set_name"),
        condition: sealedFields.condition,
        notes: getOptionalText(formData, "notes"),
        language: languageValue,
        quantity,
        sealed_product_type: sealedFields.sealed_product_type,
        image_url: sealedFields.image_url,
        ...apiFields,
      },
    };
  }

  const cardFields = parseCardFields(formData);

  if ("error" in cardFields) {
    return cardFields;
  }

  return {
    data: {
      item_kind: itemKind,
      card_name: cardFields.card_name,
      card_ref: cardFields.card_ref,
      set_name: getOptionalText(formData, "set_name"),
      condition: cardFields.condition,
      notes: getOptionalText(formData, "notes"),
      language: languageValue,
      quantity,
      sealed_product_type: cardFields.sealed_product_type,
      image_url: cardFields.image_url,
      ...apiFields,
    },
  };
}
