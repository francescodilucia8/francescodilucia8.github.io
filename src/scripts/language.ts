const switcher = document.querySelector<HTMLAnchorElement>(
  "[data-language-switch]",
);
if (switcher) {
  const destination = new URL(switcher.href);
  // Keep the visitor at the equivalent page and section, including on modified clicks.
  destination.search = location.search;
  destination.searchParams.set("lang", switcher.dataset.languageSwitch!);
  destination.hash = location.hash;
  switcher.href = destination.href;
  switcher.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    try {
      localStorage.setItem(
        "portfolio-language",
        switcher.dataset.languageSwitch!,
      );
    } catch {}
  });
}
const requested = new URLSearchParams(location.search).get("lang");
if (requested === "en" || requested === "it") {
  try {
    localStorage.setItem("portfolio-language", requested);
  } catch {}
}
