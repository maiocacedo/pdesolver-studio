/**
 * Shared PNG export for visualizations. Previously duplicated between
 * `DesktopShell.exportPng` and `VizPanel.exportPanelImage` (review A2).
 *
 * A canvas is exported directly; an SVG is rasterized onto a canvas (with a dark
 * backdrop) first. Downloads go through the desktop bridge dialog when available,
 * otherwise via a browser anchor.
 */
import { bridge } from "../api/pywebview";

async function downloadUri(uri: string, name: string): Promise<void> {
  if (bridge.isDesktop()) {
    try {
      const path = await bridge.saveDialog(name);
      if (!path) return;
      const ok = await bridge.savePng(path, uri);
      if (ok) alert("Imagem do gráfico salva com sucesso!");
    } catch (err) {
      alert("Erro ao salvar imagem: " + err);
    }
    return;
  }
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Export a canvas or SVG element to a PNG download. */
export async function exportImage(
  source: HTMLCanvasElement | SVGGraphicsElement | null,
  filename: string,
): Promise<void> {
  if (source instanceof HTMLCanvasElement) {
    try {
      await downloadUri(source.toDataURL("image/png"), filename);
    } catch (err) {
      console.error("Failed to export canvas image", err);
      alert("Erro ao exportar imagem: " + err);
    }
    return;
  }

  if (source) {
    try {
      const svgString = new XMLSerializer().serializeToString(source);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = source.clientWidth || 800;
        canvas.height = source.clientHeight || 500;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "rgba(20, 20, 20, 1)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0);
        }
        await downloadUri(canvas.toDataURL("image/png"), filename);
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Failed to export SVG image", err);
      alert("Erro ao exportar imagem: " + err);
    }
    return;
  }

  alert("Nenhuma visualização ativa encontrada para exportar.");
}

/** Find a canvas or SVG inside `container` and export it to PNG. */
export async function exportContainerImage(container: ParentNode, filename: string): Promise<void> {
  const canvas = container.querySelector("canvas") as HTMLCanvasElement | null;
  const svg = container.querySelector("svg") as SVGGraphicsElement | null;
  await exportImage(canvas ?? svg, filename);
}
