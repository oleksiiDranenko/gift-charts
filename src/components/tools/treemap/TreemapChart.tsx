"use client";

import React, { useEffect, useRef, useState } from "react";
import type GiftInterface from "@/interfaces/GiftInterface";
import type {
  TreemapDataPoint,
  TreemapScriptableContext,
} from "chartjs-chart-treemap";
import { Download, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { ChartDataset } from "chart.js";
import useVibrate from "@/hooks/useVibrate";
import axios from "axios";
import DownloadHeatmapModal from "./DownloadHeatmapModal";

interface GiftData {
  name: string;
  percentChange: number;
  size: number;
  imageName: string;
  price: number;
  marketCap?: number;
  [key: string]: any;
}

interface CustomTreemapDataset {
  data: TreemapDataPoint[];
  tree: GiftData[];
  key: string;
  imageMap?: Map<string, HTMLImageElement>;
  backgroundColor: (ctx: TreemapScriptableContext) => string;
  spacing?: number;
  borderWidth?: number;
  borderColor?: string;
  hoverBackgroundColor?: (ctx: TreemapScriptableContext) => string;
  hoverBorderColor?: string;
}

const preloadImagesAsync = (
  data: GiftData[]
): Promise<Map<string, HTMLImageElement>> => {
  const map = new Map<string, HTMLImageElement>();

  return Promise.all(
    data.map(({ imageName }) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // still resolve even if load fails
        img.src = `/gifts/${imageName}.webp`;
        map.set(imageName, img);
      });
    })
  ).then(() => map);
};

const updateInteractivity = (chart: any) => {
  const zoomLevel = chart.getZoomLevel?.() ?? 1;
  chart.options.plugins.zoom.pan.enabled = zoomLevel > 1;
  chart.options.events =
    zoomLevel > 1
      ? ["mousemove", "click", "touchstart", "touchmove", "touchend"]
      : [];

  const canvas = chart.canvas as HTMLCanvasElement;
  if (canvas) {
    canvas.style.cursor = zoomLevel > 1 ? "pointer" : "default";
  }

  chart.update("none");
};

const transformGiftData = (
  gifts: GiftInterface[],
  chartType: "change" | "marketCap",
  timeGap: "24h" | "1w" | "1m",
  currency: "ton" | "usd"
): GiftData[] => {
  return gifts.map((gift) => {
    const now = currency === "ton" ? gift.priceTon ?? 0 : gift.priceUsd ?? 0;
    let then: number;
    switch (timeGap) {
      case "24h":
        then =
          currency === "ton"
            ? gift.tonPrice24hAgo ?? now
            : gift.usdPrice24hAgo ?? now;
        break;
      case "1w":
        then =
          currency === "ton"
            ? gift.tonPriceWeekAgo ?? now
            : gift.usdPriceWeekAgo ?? now;
        break;
      case "1m":
        then =
          currency === "ton"
            ? gift.tonPriceMonthAgo ?? now
            : gift.usdPriceMonthAgo ?? now;
        break;
      default:
        then = now;
    }
    const percentChange = then === 0 ? 0 : ((now - then) / then) * 100;
    let size: number;
    let marketCap: number | undefined;

    if (chartType === "change") {
      size = Math.pow(Math.abs(percentChange) + 1, 1.5) * 2;
    } else {
      marketCap = now * (gift.upgradedSupply ?? 0);
      size = Math.max(marketCap / 1000, 1);
    }

    return {
      name: gift.name,
      percentChange: Number(percentChange.toFixed(2)),
      size,
      imageName: gift.image,
      price: now,
      marketCap,
    };
  });
};

const preloadImages = (data: GiftData[]): Map<string, HTMLImageElement> => {
  const map = new Map();
  data.forEach(({ imageName }) => {
    const img = new Image();
    img.src = `/gifts/${imageName}.webp`;
    map.set(imageName, img);
  });
  return map;
};

const imagePlugin = (
  chartType: "change" | "marketCap",
  currency: "ton" | "usd",
  watermarkFontSize: number = 15, // Default watermark font size
  textScale: number = 1,          // Default text scale
  imageScale: number = 1,         // Default image scale
  borderWidth: number = 0         // Absolute pixel border width
) => ({
  id: "treemapImages",
  afterDatasetDraw(chart: any) {
    const { ctx, data } = chart;
    const dataset = data.datasets[0] as any;
    const imageMap = dataset.imageMap as Map<string, HTMLImageElement>;
    const scale = chart.getZoomLevel ? chart.getZoomLevel() : 1;

    // ensure toncoin image
    let toncoinImg = imageMap.get("toncoin");
    if (!toncoinImg) {
      toncoinImg = new Image();
      toncoinImg.src = "/images/toncoin.webp";
      imageMap.set("toncoin", toncoinImg);
    }

    ctx.save();
    ctx.scale(scale, scale);

    dataset.tree.forEach((item: GiftData, index: number) => {
      const meta = chart.getDatasetMeta(0).data[index] as any;
      if (!meta) return;

      const x = meta.x / scale,
        y = meta.y / scale;
      const width = meta.width / scale,
        height = meta.height / scale;
      if (width <= 0 || height <= 0) return;

      const baseColor =
        item.percentChange > 0
          ? "#018f35"
          : item.percentChange < 0
          ? "#dc2626"
          : "#8F9779";

      ctx.fillStyle = baseColor;
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = borderWidth / scale;

      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 0);
      ctx.fill();
      if (borderWidth > 0) ctx.stroke();
      ctx.closePath();

      const img = imageMap.get(item.imageName);
      if (!img?.complete || img.naturalWidth === 0) return;

      const minSize = Math.min(width, height);
      const baseSize = Math.min(Math.max(minSize / 4, 5), 1000) * imageScale;
      const imgAspect = img.width / img.height;
      let drawWidth = baseSize,
        drawHeight = baseSize / imgAspect;
      if (drawHeight > baseSize) {
        drawHeight = baseSize;
        drawWidth = baseSize * imgAspect;
      }

      const fontSize = Math.min(Math.max(minSize / 10, 1), 18) * textScale;
      const priceFontSize = fontSize * 0.8;
      const lineSpacing = Math.min(Math.max(minSize / 40, 0), 8) * textScale;
      const totalContentHeight =
        drawHeight + (fontSize * 2 + priceFontSize) + lineSpacing * 3;
      const startY = y + (height - totalContentHeight) / 2;
      const centerX = x + width / 2;

      ctx.drawImage(
        img,
        x + (width - drawWidth) / 2,
        startY,
        drawWidth,
        drawHeight
      );
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      // Explicitly disable stroke for text
      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 0;

      // Draw name
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(
        item.name,
        centerX,
        startY + drawHeight + fontSize + lineSpacing
      );

      // Draw % change or market cap with toncoin image or fallback emoji to the left
      ctx.font = `${fontSize}px sans-serif`;
      const valueText =
        chartType === "change"
          ? `${item.percentChange >= 0 ? "+" : ""}${item.percentChange}%`
          : (item.marketCap ?? 0) / 1000 >= 1000
          ? `${((item.marketCap ?? 0) / 1e6).toFixed(1)}M`
          : `${((item.marketCap ?? 0) / 1000).toFixed(1)}K`;
      const valueTextWidth = ctx.measureText(valueText).width;
      const iconSize = fontSize * 1.0; // Smaller toncoin image for valueText
      const iconSpacing = fontSize * -0.1; // Tighter spacing between image and market cap text
      const usdSpacing = fontSize * -0.05; // Small space between $ and text

      if (
        chartType === "marketCap" &&
        currency === "ton" &&
        toncoinImg?.complete &&
        toncoinImg !== null &&
        toncoinImg.naturalWidth > 0
      ) {
        try {
          ctx.drawImage(
            toncoinImg,
            centerX - valueTextWidth / 2 - iconSize - iconSpacing,
            startY +
              drawHeight +
              fontSize * 2 +
              lineSpacing * 2 -
              iconSize * 0.8,
            iconSize,
            iconSize
          );
          ctx.fillText(
            valueText,
            centerX + iconSize / 2 + iconSpacing,
            startY + drawHeight + fontSize * 2 + lineSpacing * 2
          );
        } catch (e) {
          console.error("Error drawing toncoin image for valueText:", e);
          ctx.fillText(
            `💎 ${valueText}`,
            centerX,
            startY + drawHeight + fontSize * 2 + lineSpacing * 2
          );
        }
      } else if (chartType === "marketCap" && currency === "ton") {
        ctx.fillText(
          `💎 ${valueText}`,
          centerX,
          startY + drawHeight + fontSize * 2 + lineSpacing * 2
        );
      } else if (currency === "usd") {
        const dollarWidth = ctx.measureText("$").width;
        ctx.fillText(
          "$",
          centerX - valueTextWidth / 2 - usdSpacing - dollarWidth / 2,
          startY + drawHeight + fontSize * 2 + lineSpacing * 2
        );
        ctx.fillText(
          valueText,
          centerX + dollarWidth / 2 + usdSpacing,
          startY + drawHeight + fontSize * 2 + lineSpacing * 2
        );
      } else {
        ctx.fillText(
          valueText,
          centerX,
          startY + drawHeight + fontSize * 2 + lineSpacing * 2
        );
      }

      // Draw price with toncoin image or fallback emoji to the left (only for chartType === "change")
      ctx.font = `${priceFontSize}px sans-serif`;
      const bottomText =
        chartType === "change"
          ? `${item.price.toFixed(2)}`
          : `${item.percentChange >= 0 ? "+" : ""}${item.percentChange}%`;
      const bottomTextWidth = ctx.measureText(bottomText).width;
      const priceIconSize = priceFontSize * 1; // Larger toncoin image for bottomText
      const priceIconSpacing = priceFontSize * -0.1; // Tight spacing for price
      const priceUsdSpacing = priceFontSize * -0.05; // Small space for USD

      if (
        chartType === "change" &&
        currency === "ton" &&
        toncoinImg?.complete &&
        toncoinImg !== null &&
        toncoinImg.naturalWidth > 0
      ) {
        try {
          ctx.drawImage(
            toncoinImg,
            centerX - bottomTextWidth / 2 - priceIconSize - priceIconSpacing,
            startY +
              drawHeight +
              fontSize * 2 +
              priceFontSize +
              lineSpacing * 3 -
              priceIconSize * 0.8,
            priceIconSize,
            priceIconSize
          );
          ctx.fillText(
            bottomText,
            centerX + priceIconSize / 2 + priceIconSpacing,
            startY + drawHeight + fontSize * 2 + priceFontSize + lineSpacing * 3
          );
        } catch (e) {
          console.error("Error drawing toncoin image for bottomText:", e);
          ctx.fillText(
            `💎 ${bottomText}`,
            centerX,
            startY + drawHeight + fontSize * 2 + priceFontSize + lineSpacing * 3
          );
        }
      } else if (chartType === "change" && currency === "ton") {
        ctx.fillText(
          `💎 ${bottomText}`,
          centerX,
          startY + drawHeight + fontSize * 2 + priceFontSize + lineSpacing * 3
        );
      } else if (chartType === "change" && currency === "usd") {
        const dollarWidth = ctx.measureText("$").width;
        ctx.fillText(
          "$",
          centerX - bottomTextWidth / 2 - priceUsdSpacing - dollarWidth / 2,
          startY + drawHeight + fontSize * 2 + priceFontSize + lineSpacing * 3
        );
        ctx.fillText(
          bottomText,
          centerX + dollarWidth / 2 + priceUsdSpacing,
          startY + drawHeight + fontSize * 2 + priceFontSize + lineSpacing * 3
        );
      } else {
        // chartType === "marketCap": just draw bottomText (percent change) without symbol
        ctx.fillText(
          bottomText,
          centerX,
          startY + drawHeight + fontSize * 2 + priceFontSize + lineSpacing * 3
        );
      }

      if (index === 0) {
        ctx.font = `${watermarkFontSize}px sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.textAlign = "right";
        ctx.fillText("@gift_charts", x + width - 5, y + height - 5);
      }
    });

    ctx.restore();
  },
});

interface TreemapChartProps {
  data: GiftInterface[];
  chartType: "change" | "marketCap";
  timeGap: "24h" | "1w" | "1m";
  currency: "ton" | "usd";
}

const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  chartType,
  timeGap,
  currency,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const vibrate = useVibrate();
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const downloadImage = async () => {
    vibrate();
    if (!chartRef.current) return;

    const telegram = window.Telegram?.WebApp;
    const isTelegramWebApp = !!telegram?.initDataUnsafe?.user?.id;

    const exportWidth = 1920;
    const exportHeight = 1080;

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = exportWidth;
    offscreenCanvas.height = exportHeight;

    const ctx = offscreenCanvas.getContext("2d");
    if (!ctx) return;

    // Dynamic imports
    const chartModule = await import("chart.js/auto");
    const treemapModule = await import("chartjs-chart-treemap");
    const zoomModule = await import("chartjs-plugin-zoom");

    const Chart = chartModule.default;
    Chart.register(
      treemapModule.TreemapController,
      treemapModule.TreemapElement,
      zoomModule.default
    );

    const transformed = transformGiftData(data, chartType, timeGap, currency);
    const imageMap = await preloadImagesAsync(transformed);

    const tempChart = new Chart(ctx, {
      type: "treemap",
      data: {
        datasets: [
          {
            data: [],
            tree: transformed,
            key: "size",
            imageMap,
            backgroundColor: "transparent",
          } as unknown as ChartDataset<"treemap", TreemapDataPoint[]>,
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
      plugins: [imagePlugin(chartType, currency, 35, 1, 1.2, 1)],
    });

    setTimeout(async () => {
      try {
        const imageDataUrl = offscreenCanvas.toDataURL("image/jpeg", 1.0);

        // ✅ Non-Telegram → download directly
        if (!isTelegramWebApp) {
          const link = document.createElement("a");
          link.download = `heatmap-${Date.now()}.jpeg`;
          link.href = imageDataUrl;
          link.click();
          tempChart.destroy();
          return;
        }

        const chatId = telegram?.initDataUnsafe?.user?.id;
        if (!chatId) {
          console.error("No chat ID found");
          tempChart.destroy();
          return;
        }

        const blob = await (await fetch(imageDataUrl)).blob();
        const formData = new FormData();
        formData.append("file", blob, `heatmap-${Date.now()}.jpeg`);
        formData.append("chatId", chatId.toString());
        formData.append(
          "content",
          "Here is a 1920x1080 image of a Heatmap chart!"
        );

        // Send to backend
        await axios.post(
          `${process.env.NEXT_PUBLIC_API}/telegram/send-image`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        // ✅ Do nothing after send — modal stays open until user closes it
        tempChart.destroy();
      } catch (error) {
        console.error("Error sending image:", error);
        tempChart.destroy();
      }
    }, 0);
  };
  useEffect(() => {
    let Chart: any,
      TreemapController: any,
      TreemapElement: any,
      chartjsPluginZoom: any;

    const initializeChart = async () => {
      if (!window) return;
      try {
        const chartModule = await import("chart.js/auto");
        const treemapModule = await import("chartjs-chart-treemap");
        const zoomModule = await import("chartjs-plugin-zoom");

        Chart = chartModule.default;
        TreemapController = treemapModule.TreemapController;
        TreemapElement = treemapModule.TreemapElement;
        chartjsPluginZoom = zoomModule.default;

        Chart.register(TreemapController, TreemapElement, chartjsPluginZoom);

        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !data?.length) return;

        chartRef.current?.destroy();

        const transformed = transformGiftData(
          data,
          chartType,
          timeGap,
          currency
        );
        const imageMap = preloadImages(transformed);

        const config: any = {
          type: "treemap",
          data: {
            datasets: [
              {
                data: [],
                tree: transformed,
                key: "size",
                imageMap,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
              zoom: {
                zoom: {
                  wheel: { enabled: false },
                  pinch: { enabled: false },
                  mode: "xy",
                },
                pan: {
                  enabled: false,
                  mode: "xy",
                  onPan: ({ chart }: any) => updateInteractivity(chart),
                  beforePan: ({ chart }: any) =>
                    (chart.getZoomLevel?.() ?? 1) > 1,
                },
              },
            },
            events: [],
          },
          plugins: [imagePlugin(chartType, currency)],
        };

        chartRef.current = new Chart(ctx, config);
        updateInteractivity(chartRef.current);
      } catch (err) {
        console.error(err);
      }
    };

    initializeChart();
    return () => {
      chartRef.current?.destroy();
    };
  }, [data, chartType, timeGap, currency]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full lg:w-1/2 mb-3 px-3 flex gap-2">
        <button
          className="w-full flex flex-row items-center justify-center gap-x-1 text-sm h-8 rounded-xl bg-secondaryTransparent"
          onClick={() => {
            chartRef.current?.resetZoom();
            chartRef.current?.update("none");
            updateInteractivity(chartRef.current);
          }}
        >
          <RotateCcw size={16} />
          Reset Zoom
        </button>
        <div className="w-full flex flex-row gap-x-2">
          <button
            className="w-full flex items-center justify-center h-8 rounded-xl bg-secondaryTransparent"
            onClick={() => {
              const zoom = chartRef.current.getZoomLevel?.() ?? 1;
              const newZoom = Math.max(1, zoom - 0.5);
              if (newZoom === 1) {
                chartRef.current?.resetZoom();
              } else {
                chartRef.current.zoom(newZoom / zoom);
              }
              chartRef.current?.update("none");
              updateInteractivity(chartRef.current);
            }}
          >
            <ZoomOut size={16} />
          </button>
          <button
            className="w-full flex items-center justify-center h-8 rounded-xl bg-secondaryTransparent"
            onClick={() => {
              const zoom = chartRef.current.getZoomLevel?.() ?? 1;
              const newZoom = Math.min(10, zoom + 0.3);
              chartRef.current.zoom(newZoom / zoom);
              chartRef.current?.update("none");
              updateInteractivity(chartRef.current);
            }}
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      <DownloadHeatmapModal
        trigger={
          <button
            className="w-full flex flex-row items-center justify-center gap-x-1 text-sm h-8 rounded-t-lg bg-secondaryTransparent"
            onClick={downloadImage}
          >
            <Download size={16} />
            Download Heatmap as Image
          </button>
        }
      />

      <div style={{ width: "100%", minHeight: "600px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default TreemapChart;
