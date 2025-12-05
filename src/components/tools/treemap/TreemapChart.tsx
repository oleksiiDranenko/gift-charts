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
  watermarkFontSize: number = 15,
  textScale: number = 1,
  imageScale: number = 1,
  borderWidth: number = 0,
  type: HeatmapType
) => ({
  id: "treemapImages",
  afterDatasetDraw(chart: any) {
    const { ctx, data } = chart;
    const dataset = data.datasets[0] as any;
    const imageMap = dataset.imageMap as Map<string, HTMLImageElement>;
    const scale = chart.getZoomLevel ? chart.getZoomLevel() : 0.9;

    // ensure toncoin & usdt images
    let toncoinImg = imageMap.get("toncoin");
    if (!toncoinImg) {
      toncoinImg = new Image();
      toncoinImg.src = "/images/toncoin.webp";
      imageMap.set("toncoin", toncoinImg);
    }
    let usdtImg = imageMap.get("usdt");
    if (!usdtImg) {
      usdtImg = new Image();
      usdtImg.src = "/images/usdt.svg";
      imageMap.set("usdt", usdtImg);
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
      const cornerRadius = type === "round" ? Math.min(width, height) * 0.3 : 0;
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
      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 0;

      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 0;

      // Draw name (always first)
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(
        item.name,
        centerX,
        startY + drawHeight + fontSize + lineSpacing
      );

      // ——— MIDDLE LINE: PRICE (with TON or USDT icon) ———
      ctx.font = `${fontSize}px sans-serif`;
      const priceText = `${item.price.toFixed(2)}`;
      const priceTextWidth = ctx.measureText(priceText).width;
      const iconSize = fontSize * 1.0;
      const iconSpacing = fontSize * -0.1;

      if (
        currency === "ton" &&
        toncoinImg?.complete &&
        toncoinImg.naturalWidth > 0
      ) {
        try {
          ctx.drawImage(
            toncoinImg,
            centerX - priceTextWidth / 2 - iconSize - iconSpacing,
            startY +
              drawHeight +
              fontSize * 2 +
              lineSpacing * 2 -
              iconSize * 0.8,
            iconSize,
            iconSize
          );
          ctx.fillText(
            priceText,
            centerX + iconSize / 2 + iconSpacing,
            startY + drawHeight + fontSize * 2 + lineSpacing * 2
          );
        } catch (e) {
          console.error("Error drawing toncoin image for price:", e);
          ctx.fillText(
            `TON ${priceText}`,
            centerX,
            startY + drawHeight + fontSize * 2 + lineSpacing * 2
          );
        }
      } else if (
        currency === "usd" &&
        usdtImg?.complete &&
        usdtImg.naturalWidth > 0
      ) {
        try {
          ctx.drawImage(
            usdtImg,
            centerX - priceTextWidth / 2 - iconSize - iconSpacing,
            startY +
              drawHeight +
              fontSize * 2 +
              lineSpacing * 2 -
              iconSize * 0.8,
            iconSize,
            iconSize
          );
          ctx.fillText(
            priceText,
            centerX + iconSize / 2 + iconSpacing,
            startY + drawHeight + fontSize * 2 + lineSpacing * 2
          );
        } catch (e) {
          console.error("Error drawing USDT image:", e);
          ctx.fillText(
            `USDT ${priceText}`,
            centerX,
            startY + drawHeight + fontSize * 2 + lineSpacing * 2
          );
        }
      } else {
        ctx.fillText(
          priceText,
          centerX,
          startY + drawHeight + fontSize * 2 + lineSpacing * 2
        );
      }

      // ——— BOTTOM LINE: % CHANGE ———
      ctx.font = `${priceFontSize}px sans-serif`;
      const changeText = `${item.percentChange >= 0 ? "+" : ""}${
        item.percentChange
      }%`;
      ctx.fillText(
        changeText,
        centerX,
        startY + drawHeight + fontSize * 2 + priceFontSize + lineSpacing * 3
      );

      // Watermark on first item
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
      <div className='w-full lg:w-[98%] min-h-[600px] px-3'>
        <div className=' min-h-[600px]'>
          <canvas ref={canvasRef} />
        </div>
      </div>
    );
  }
);

TreemapChart.displayName = "TreemapChart";

export default TreemapChart;
