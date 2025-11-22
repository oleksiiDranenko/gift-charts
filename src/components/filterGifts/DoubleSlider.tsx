import * as Slider from "@radix-ui/react-slider";
import React from "react";

export default function DoubleSlider() {
  const minGap = 10;
  const [values, setValues] = React.useState([0, 100]);

  // choose how many marks you want
  const marks = Array.from({ length: 11 }, (_, i) => i * 10); // 0,10,20,...100

  const handleChange = (newValues: number[]) => {
    let [a, b] = newValues;

    if (b - a < minGap) {
      if (a !== values[0]) {
        a = Math.min(a, b - minGap);
      } else {
        b = Math.max(b, a + minGap);
      }
    }

    setValues([a, b]);
  };

  return (
    <div className='w-full p-4'>
      <div className='relative w-full'>
        {/* Marks */}
        <div className='absolute w-full h-4 -top-2 flex justify-between pointer-events-none'>
          {marks.map((mark) => (
            <div key={mark} className='w-px h-3 bg-muted-foreground/60' />
          ))}
        </div>

        <Slider.Root
          value={values}
          onValueChange={handleChange}
          min={0}
          max={100}
          step={1}
          className='relative flex items-center select-none touch-none'>
          <Slider.Track className='bg-secondary relative grow h-[2px] rounded'>
            <Slider.Range className='absolute h-full bg-primary rounded' />
          </Slider.Track>

          <Slider.Thumb className='block w-5 h-5 bg-primary rounded-full' />
          <Slider.Thumb className='block w-5 h-5 bg-primary rounded-full' />
        </Slider.Root>
      </div>

      <div className='mt-2 text-sm'>
        {values[0]} – {values[1]}
      </div>
    </div>
  );
}
