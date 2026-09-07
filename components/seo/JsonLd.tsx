interface JsonLdProps {
  /** A schema.org graph. Serialised into a `application/ld+json` script tag. */
  data: unknown;
}

/**
 * Emits JSON-LD structured data.
 *
 * A Server Component with no client cost: the JSON is serialised at build time and ships as
 * inert text in the HTML, which is exactly how crawlers want to find it — no JavaScript
 * execution required to read it.
 *
 * `<` is escaped so a string inside the data can never terminate the surrounding `</script>`
 * tag early. Without that, content containing `</script>` would break out of the block — an
 * XSS vector, and the reason `dangerouslySetInnerHTML` needs care even for data you control.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
