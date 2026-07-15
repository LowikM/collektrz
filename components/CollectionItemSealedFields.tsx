"use client";

import { useState } from "react";

import {
  SEALED_CONDITIONS,
  SEALED_PRODUCT_TYPES,
} from "@/lib/sealed-products";

type CollectionItemImageFieldProps = {
  id: string;
  name?: string;
  defaultValue?: string;
  inputClassName: string;
};

export function CollectionItemImageField({
  id,
  name = "image_url",
  defaultValue = "",
  inputClassName,
}: CollectionItemImageFieldProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium">
          Image URL
        </label>
        <input
          id={id}
          name={name}
          type="url"
          inputMode="url"
          placeholder="https://example.com/product.jpg"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className={inputClassName}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Paste a direct link to a product photo. File uploads are not supported
          yet.
        </p>
      </div>

      <div className="flex items-start gap-3">
        {imageUrl.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-provided external product URLs
          <img
            src={imageUrl.trim()}
            alt="Product preview"
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 rounded-lg border border-zinc-200 object-contain dark:border-zinc-800"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <CollectionItemImagePlaceholder size="md" />
        )}
        <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-500">
          {imageUrl.trim()
            ? "Preview updates as you type. Broken links may not display."
            : "No image yet. A placeholder will be shown in your collection."}
        </p>
      </div>
    </div>
  );
}

type CollectionItemImagePlaceholderProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const PLACEHOLDER_SIZES = {
  sm: "h-14 w-14 text-[10px]",
  md: "h-24 w-24 text-xs",
  lg: "h-32 w-32 text-sm",
} as const;

export function CollectionItemImagePlaceholder({
  size = "md",
  className = "",
}: CollectionItemImagePlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 ${PLACEHOLDER_SIZES[size]} ${className}`}
    >
      Sealed
    </div>
  );
}

type SealedProductTypeSelectProps = {
  id: string;
  name?: string;
  required?: boolean;
  defaultValue?: string;
  className: string;
};

export function SealedProductTypeSelect({
  id,
  name = "sealed_product_type",
  required = false,
  defaultValue = "",
  className,
}: SealedProductTypeSelectProps) {
  return (
    <select
      id={id}
      name={name}
      required={required}
      defaultValue={defaultValue}
      className={className}
    >
      <option value="" disabled={required}>
        Select product type
      </option>
      {SEALED_PRODUCT_TYPES.map((productType) => (
        <option key={productType} value={productType}>
          {productType}
        </option>
      ))}
    </select>
  );
}

type SealedConditionSelectProps = {
  id: string;
  name?: string;
  defaultValue?: string;
  className: string;
};

export function SealedConditionSelect({
  id,
  name = "condition",
  defaultValue = "",
  className,
}: SealedConditionSelectProps) {
  return (
    <select id={id} name={name} defaultValue={defaultValue} className={className}>
      <option value="">Select condition</option>
      {SEALED_CONDITIONS.map((condition) => (
        <option key={condition} value={condition}>
          {condition}
        </option>
      ))}
    </select>
  );
}
