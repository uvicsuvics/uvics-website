import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, writeFileSync } from "node:fs";
import { CloudinaryImage } from "../components/ui/CloudinaryImage";
const asset = JSON.parse(
  readFileSync(".runtime/public-media-sample.json", "utf8"),
);
const markup = renderToStaticMarkup(
  createElement(CloudinaryImage, {
    asset,
    alt: "Synthetic blue poster",
    sizes: "(max-width: 600px) 100vw, 600px",
    width: 1200,
    height: 800,
    priority: true,
  }),
);
const lazy = renderToStaticMarkup(
  createElement(CloudinaryImage, {
    asset,
    alt: "Synthetic lazy poster",
    sizes: "100vw",
    width: 1200,
    height: 800,
  }),
);
writeFileSync(
  ".runtime/public-media-sample.html",
  `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}img{width:100%;height:auto}</style></head><body><main>${markup}<div style="height:2000px"></div>${lazy}</main></body></html>`,
);
