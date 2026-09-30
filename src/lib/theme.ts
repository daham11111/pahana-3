export const THEME_KEY = "pahana_theme";

export type Theme = "light" | "dark";

export const THEME_BOOTSTRAP = `try{var t=localStorage.getItem('${THEME_KEY}')==='dark'?'dark':'light';document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name=theme-color]');if(m&&t==='dark')m.content='#0c1020'}catch(e){document.documentElement.dataset.theme='light'}`;

export function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset["theme"] === "dark" ? "dark" : "light";
}

export function setTheme(t: Theme) {
  const d = document.documentElement;
  d.classList.add("ta");
  d.dataset["theme"] = t;
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "dark" ? "#0c1020" : "#f6f7fb");
  setTimeout(() => d.classList.remove("ta"), 350);
}

export function toggleTheme() {
  setTheme(currentTheme() === "dark" ? "light" : "dark");
}
