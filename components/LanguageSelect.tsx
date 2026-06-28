"use client";

import { CARD_LANGUAGES } from "@/lib/languages";

type LanguageSelectProps = {
  id: string;
  name?: string;
  className?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function LanguageSelect({
  id,
  name = "language",
  className,
  value,
  defaultValue,
  onChange,
}: LanguageSelectProps) {
  const selectProps =
    value !== undefined
      ? { value }
      : { defaultValue: defaultValue ?? "" };

  return (
    <select
      id={id}
      name={name}
      className={className}
      onChange={onChange}
      {...selectProps}
    >
      <option value="">No language specified</option>
      {CARD_LANGUAGES.map((language) => (
        <option key={language} value={language}>
          {language}
        </option>
      ))}
    </select>
  );
}
