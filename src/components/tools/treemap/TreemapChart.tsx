// components/tools/treemap/TreemapChart.tsx
"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type GiftInterface from "@/interfaces/GiftInterface";
import useVibrate from "@/hooks/useVibrate";
import axios from "axios";

interface GiftData {
  name: string;
  percentChange: number;
  size: number;
  imageName: string;
  price: number;
  marketCap?: number;
}

type HeatmapType = "default" | "round";

export interface TreemapChartRef {
  downloadImage: () => Promise<void>;
}

interface TreemapChartProps {
  data: GiftInterface[];
  chartType: "change" | "marketCap";
  timeGap: "24h" | "1w" | "1m";
  currency: "ton" | "usd";
  type: HeatmapType;
}

const preloadImages = (data: GiftData[]) => {
  const map = new Map<string, HTMLImageElement>();
  data.forEach((item) => {
    const img = new Image();
    img.src = `/gifts/${item.imageName}.webp`;
    map.set(item.imageName, img);
  });
  return map;
};

const preloadImagesAsync = async (data: GiftData[]) => {
  const map = new Map<string, HTMLImageElement>();
  await Promise.all(
    data.map(
      (item) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = img.onerror = () => {
            map.set(item.imageName, img);
            resolve();
          };
          img.src = `/gifts/${item.imageName}.webp`;
        })
    )
  );
  return map;
};

const transformGiftData = (
  gifts: GiftInterface[],
  chartType: "change" | "marketCap",
  timeGap: "24h" | "1w" | "1m",
  currency: "ton" | "usd"
): GiftData[] => {
  return gifts.map((gift) => {
    const now = currency === "ton" ? gift.priceTon ?? 0 : gift.priceUsd ?? 0;
    let then = now;

    if (timeGap === "24h")
      then =
        currency === "ton"
          ? gift.tonPrice24hAgo ?? now
          : gift.usdPrice24hAgo ?? now;
    else if (timeGap === "1w")
      then =
        currency === "ton"
          ? gift.tonPriceWeekAgo ?? now
          : gift.usdPriceWeekAgo ?? now;
    else if (timeGap === "1m")
      then =
        currency === "ton"
          ? gift.tonPriceMonthAgo ?? now
          : gift.usdPriceMonthAgo ?? now;

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

const imagePlugin = (
  chartType: "change" | "marketCap",
  currency: "ton" | "usd",
  watermarkFontSize: number = 15, // Default watermark font size
  textScale: number = 1, // Default text scale
  imageScale: number = 1, // Default image scale
  borderWidth: number = 0, // Absolute pixel border width
  type: HeatmapType
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
      const cornerRadius =
        type === "round" ? Math.min(width, height) * 0.15 : 0;
      ctx.roundRect(x, y, width, height, cornerRadius);
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

const TreemapChart = forwardRef<TreemapChartRef, TreemapChartProps>(
  ({ data, chartType, timeGap, currency, type }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);
    const vibrate = useVibrate();

    const downloadImage = async () => {
      vibrate();
      if (data.length === 0) return;

      const isTelegram = !!window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      const width = 1920;
      const height = 1080;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { default: ChartJS } = await import("chart.js/auto");
      const { TreemapController, TreemapElement } = await import(
        "chartjs-chart-treemap"
      );
      ChartJS.register(TreemapController, TreemapElement);

      const transformed = transformGiftData(data, chartType, timeGap, currency);
      const imageMap = await preloadImagesAsync(transformed);

      const tempChart = new ChartJS(canvas, {
        type: "treemap",
        data: {
          datasets: [
            {
              tree: transformed,
              key: "size",
              imageMap,
              backgroundColor: "transparent",
            } as any,
          ],
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          animation: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
        },
        plugins: [imagePlugin(chartType, currency, 35, 1, 1.2, 1, type)],
      });

      const url = canvas.toDataURL("image/jpeg", 1.0);
      tempChart.destroy();

      if (!isTelegram) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `treemap-${Date.now()}.jpeg`;
        a.click();
        return;
      }

      const blob = await (await fetch(url)).blob();
      const form = new FormData();
      form.append("file", blob, `treemap-${Date.now()}.jpeg`);
      form.append(
        "chatId",
        window.Telegram!.WebApp!.initDataUnsafe!.user!.id.toString()
      );
      form.append("content", "Here is your treemap!");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/telegram/send-image`,
        form
      );
    };

    useImperativeHandle(ref, () => ({
      downloadImage,
    }));

    useEffect(() => {
      if (!canvasRef.current || data.length === 0) return;

      (async () => {
        const { default: ChartJS } = await import("chart.js/auto");
        const { TreemapController, TreemapElement } = await import(
          "chartjs-chart-treemap"
        );
        ChartJS.register(TreemapController, TreemapElement);

        chartRef.current?.destroy();

        const transformed = transformGiftData(
          data,
          chartType,
          timeGap,
          currency
        );
        const imageMap = preloadImages(transformed);

        const canvas = canvasRef.current;
        if (!canvas) return;

        chartRef.current = new ChartJS(canvas, {
          type: "treemap",
          data: {
            datasets: [
              {
                tree: transformed,
                key: "size",
                imageMap,
                backgroundColor: "transparent",
                spacing: type === "default" ? 0.05 : 2,
              } as any,
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
          },
          plugins: [imagePlugin(chartType, currency, 15, 1, 1.2, 1, type)],
        });
      })();

      return () => chartRef.current?.destroy();
    }, [data, chartType, timeGap, currency, type]);

    return (
      <div className='w-full lg:w-11/12 min-h-[600px] px-3'>
        <div className=' min-h-[600px] bg-secondaryTransparent rounded-3xl'>
          <canvas ref={canvasRef} />
        </div>
      </div>
    );
  }
);

TreemapChart.displayName = "TreemapChart";

export default TreemapChart;
