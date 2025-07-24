import { useState, useEffect, useCallback } from "react";

interface BaseDataPoint {
  timestamp: number;
}

interface TimelineSliderProps<T extends BaseDataPoint> {
  allData: T[];
  dateRange: [number, number];
  handleSliderChange: (range: [number, number]) => void;
}



const TimelineSlider = <T extends BaseDataPoint>({
  allData,
  dateRange,
  handleSliderChange,
}: TimelineSliderProps<T>) => {

  if (!allData?.length || dateRange[0] === dateRange[1] || !dateRange[0] || !dateRange[1]) {

    return null;
  }

  const minTimestamp = allData[0].timestamp;
  const maxTimestamp = allData[allData.length - 1].timestamp;
  

  if (!minTimestamp || !maxTimestamp || minTimestamp >= maxTimestamp) {
   
    return null;
  }



  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );


  const calculateOptimalSteps = useCallback(() => {
    const totalTimeSpan = maxTimestamp - minTimestamp;
    const totalYears = totalTimeSpan / (365 * 24 * 60 * 60 * 1000);
    

    const desiredSteps = isMobile ? 3 : 6;
    

    const stepSizeYears = totalYears / desiredSteps;
    

    const stepMs = stepSizeYears * 365 * 24 * 60 * 60 * 1000;
    

    const minStepMs = 7 * 24 * 60 * 60 * 1000; // 1 week
    const finalStepMs = Math.max(stepMs, minStepMs);
    
    return finalStepMs;
  }, [minTimestamp, maxTimestamp, isMobile]);

  const stepMs = calculateOptimalSteps();

  const roundToStep = useCallback((timestamp: number) => {
    const steps = Math.round((timestamp - minTimestamp) / stepMs);
    return steps * stepMs + minTimestamp;
  }, [minTimestamp, stepMs]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (type: "start" | "end", e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = x / rect.width;
    let timestamp = minTimestamp + percentage * (maxTimestamp - minTimestamp);
    timestamp = roundToStep(timestamp);

    const minGap = stepMs;

    if (isDragging === "start") {
      const newRange: [number, number] = [
        Math.min(timestamp, dateRange[1] - minGap),
        dateRange[1],
      ];
      handleSliderChange(newRange);
    } else {
      const newRange: [number, number] = [
        dateRange[0],
        Math.max(timestamp, dateRange[0] + minGap),
      ];
      handleSliderChange(newRange);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(null);
    (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const sliderElement = document.querySelector(".timeline-slider-container");
      if (!sliderElement) return;

      const rect = sliderElement.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const percentage = x / rect.width;
      let timestamp = minTimestamp + percentage * (maxTimestamp - minTimestamp);
      timestamp = roundToStep(timestamp);

      const minGap = stepMs;

      if (isDragging === "start") {
        const newRange: [number, number] = [
          Math.min(timestamp, dateRange[1] - minGap),
          dateRange[1],
        ];
        handleSliderChange(newRange);
      } else {
        const newRange: [number, number] = [
          dateRange[0],
          Math.max(timestamp, dateRange[0] + minGap),
        ];
        handleSliderChange(newRange);
      }
    };

    const handleGlobalPointerUp = () => {
      setIsDragging(null);
    };

    document.addEventListener("pointermove", handleGlobalPointerMove);
    document.addEventListener("pointerup", handleGlobalPointerUp);

    return () => {
      document.removeEventListener("pointermove", handleGlobalPointerMove);
      document.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [isDragging, minTimestamp, maxTimestamp, dateRange, handleSliderChange, stepMs, roundToStep]);

  const generateTimelineMarkers = () => {
    const markers = [];
    

    const totalSteps = Math.floor((maxTimestamp - minTimestamp) / stepMs);
    const desiredSteps = isMobile ? 3 : 6;
    

    for (let i = 0; i <= Math.min(totalSteps, desiredSteps); i++) {
      const timestamp = minTimestamp + (i * stepMs);
      
      if (timestamp <= maxTimestamp) {
        const position = ((timestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * 100;
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth();
        

        const totalYears = (maxTimestamp - minTimestamp) / (365 * 24 * 60 * 60 * 1000);
        let label: string;
        
        if (totalYears > 2) {
          label = year.toString();
        } else if (totalYears > 0.5) {
          label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        } else {

          label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        markers.push({ 
          year, 
          position, 
          timestamp, 
          label,
          month 
        });
      }
    }
    
    return markers;
  };

  const timelineMarkers = generateTimelineMarkers();

  const startPosition =
    ((dateRange[0] - minTimestamp) / (maxTimestamp - minTimestamp)) * 100;
  const endPosition =
    ((dateRange[1] - minTimestamp) / (maxTimestamp - minTimestamp)) * 100;

  return (
    <div className="w-full px-2 sm:px-4 pb-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <div
          className="timeline-slider-container relative h-8 cursor-pointer select-none touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div className="absolute w-full h-1 bg-gray-200 dark:bg-gray-700 top-6 rounded-full"></div>

          <div
            className="absolute h-1 bg-gradient-to-r from-orange-400 to-orange-500 top-6 rounded-full"
            style={{
              left: `${startPosition}%`,
              width: `${endPosition - startPosition}%`,
            }}
          ></div>

          {timelineMarkers.map((marker) => (
            <div
              key={marker.year}
              className="absolute flex flex-col items-center transform -translate-x-1/2"
              style={{ left: `${marker.position}%` }}
            >
              <div className="w-px h-3 bg-gray-400 dark:bg-gray-500 top-4 absolute"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
                {marker.label}
              </span>
            </div>
          ))}

          <div
            className="absolute w-4 h-4 bg-white dark:bg-gray-800 border-2 border-orange-500 rounded-full cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 top-6 shadow-lg hover:scale-110 transition-transform touch-none"
            style={{ left: `${startPosition}%`, zIndex: 10 }}
            onPointerDown={(e) => handlePointerDown("start", e)}
            role="slider"
            aria-label="Start date slider"
            tabIndex={0}
          >
            <div className="absolute inset-0.5 bg-orange-500 rounded-full"></div>
          </div>

          <div
            className="absolute w-4 h-4 bg-white dark:bg-gray-800 border-2 border-orange-600 rounded-full cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 top-6 shadow-lg hover:scale-110 transition-transform touch-none"
            style={{ left: `${endPosition}%`, zIndex: 10 }}
            onPointerDown={(e) => handlePointerDown("end", e)}
            role="slider"
            aria-label="End date slider"
            tabIndex={0}
          >
            <div className="absolute inset-0.5 bg-orange-600 rounded-full"></div>
          </div>

          <div
            className="absolute h-5 bg-orange-100 dark:bg-orange-900 bg-opacity-20 rounded cursor-move touch-none"
            style={{
              left: `${startPosition}%`,
              width: `${endPosition - startPosition}%`,
              zIndex: 5,
            }}
            aria-label="Drag to move date range"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const rangeDiff = dateRange[1] - dateRange[0];
              const startX = event.clientX;
              const initialStartTime = dateRange[0];
              (event.target as HTMLElement)?.setPointerCapture?.(event.pointerId);

              const move = (e: PointerEvent) => {
                const element = document.querySelector(".timeline-slider-container");
                if (!element) return;

                const rect = element.getBoundingClientRect();
                const deltaX = e.clientX - startX;
                const deltaPercentage = deltaX / rect.width;
                const deltaTime = deltaPercentage * (maxTimestamp - minTimestamp);

                let newStart = initialStartTime + deltaTime;
                newStart = Math.max(minTimestamp, Math.min(newStart, maxTimestamp - rangeDiff));
                newStart = roundToStep(newStart);

                const newEnd = newStart + rangeDiff;
                handleSliderChange([newStart, newEnd]);
              };

              const stop = (e: PointerEvent) => {
                (event.target as HTMLElement)?.releasePointerCapture?.(event.pointerId);
                document.removeEventListener("pointermove", move);
                document.removeEventListener("pointerup", stop);
              };

              document.addEventListener("pointermove", move);
              document.addEventListener("pointerup", stop);
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSlider;
