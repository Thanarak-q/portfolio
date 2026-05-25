import { useEffect } from "react";
import { initScroll } from "../lib/scroll";

export default function ScrollInit() {
  useEffect(() => {
    initScroll();
  }, []);

  return null;
}
