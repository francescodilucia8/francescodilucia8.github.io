export const path = (value = "") =>
  `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${value.replace(/^\//, "")}`;
