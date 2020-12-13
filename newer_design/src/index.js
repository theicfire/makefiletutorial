function get_header_order() {
  const headers = document.querySelectorAll(".content h1, .content h2");
  const ret = {};
  let count = 0;
  for (const el of headers) {
    ret[el.id] = count;
    count += 1;
  }
  return ret;
}

function get_lowest_header(header_order, in_view_headers) {
  let ret = "";
  let min = 99999;
  for (header of in_view_headers) {
    if (header_order[header] < min) {
      min = header_order[header];
      ret = header;
    }
  }
  return ret;
}

window.addEventListener("DOMContentLoaded", () => {
  //   console.log("loaded");
  const in_view = {};
  const header_order = get_header_order();
  let current_header_id = "";

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        if (entry.intersectionRatio > 0) {
          in_view[id] = true;
        } else {
          delete in_view[id];
        }
        const lowest_header_id = get_lowest_header(
          header_order,
          Object.keys(in_view)
        );
        if (current_header_id != lowest_header_id) {
          const current_header = document.querySelector(
            `#left li a[href="#${current_header_id}"]`
          );
          if (current_header) {
            current_header.parentElement.classList.remove("active");
          }

          const new_header = document.querySelector(
            `#left li a[href="#${lowest_header_id}"]`
          );
          if (new_header) {
            new_header.parentElement.classList.add("active");
          }
          current_header_id = lowest_header_id;
        }
      });
    },
    { rootMargin: `0px 0px 0px 0px` }
  );

  // Track all sections that have an `id` applied
  document.querySelectorAll(".content h1, .content h2").forEach((section) => {
    observer.observe(section);
  });
});
