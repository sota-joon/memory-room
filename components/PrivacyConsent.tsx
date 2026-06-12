"use client";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  body: string;
  checkbox: string;
};

export function PrivacyConsent({ body, checkbox, checked, onChange }: Props) {
  return (
    <section className="privacy-consent">
      <p>{body}</p>
      <label className="consent-check">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{checkbox}</span>
      </label>
    </section>
  );
}
