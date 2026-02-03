export function highlightActiveNav() {
  const currentPage = location.pathname.split("/").pop();

  document.querySelectorAll(".sidebar nav li").forEach(li => {
    const link = li.querySelector("a");
    li.classList.toggle(
      "active",
      link?.getAttribute("href") === currentPage
    );
  });
}
