// Social-media preview image (Open Graph): a JPEG of the portrait.
import Image from "@11ty/eleventy-img";

export default async function () {
  const stats = await Image("src/assets/images/portrait.jpg", {
    widths: [600],
    formats: ["jpeg"],
    urlPath: "/img/",
    outputDir: "_site/img/",
  });
  const { url, width, height } = stats.jpeg[0];
  return { url, width, height };
}
