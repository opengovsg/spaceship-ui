import { cn } from "#/components/ds/lib/classnames";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  /** The current progress value */
  value?: number;
  /** The maximum value that the progress bar can reach */
  max?: number;
  /** Whether to simulate automatic progress */
  simulate?: boolean;
  /**
   * The average interval (in milliseconds) between simulated increments. We add some jitter to make the increments seem more natural,
   * so the increments may actually happen slightly faster or slower than this.
   */
  simulationSpeed?: number;
  /** Unique identifier for the progress bar element */
  id?: string;

  className?: string;
}

export const ProgressBar = ({
  value = 0,
  max = 100,
  simulate = false,
  simulationSpeed = 2500,
  id,
  className,
}: ProgressBarProps) => {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value ?? 0);
  }, [id]);

  useEffect(() => {
    if (!simulate) {
      setCurrentValue(value);
      return;
    }

    // Simulate progress with irregular intervals
    const incrementProgress = () => {
      setCurrentValue((prev) => {
        if (prev >= max) return max;

        // Calculate progress percentage
        const progressPercentage = prev / max;

        // Reduce increment size as we approach max
        let baseIncrement: number;
        if (progressPercentage < 0.5) {
          baseIncrement = Math.random() * 2 + 2;
        } else if (progressPercentage < 0.8) {
          baseIncrement = Math.random() * 1 + 1;
        } else if (progressPercentage < 0.95) {
          baseIncrement = Math.random() * 0.5 + 0.2;
        } else {
          baseIncrement = Math.random() * 0.1 + 0.1;
        }

        return Math.min(prev + baseIncrement, max);
      });
    };

    const scheduleNext = () => {
      const delay = Math.random() * simulationSpeed + 100;
      return setTimeout(() => {
        incrementProgress();
        if (currentValue < max) {
          timeoutId = scheduleNext();
        }
      }, delay);
    };

    let timeoutId = scheduleNext();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [simulate, max, currentValue, value, simulationSpeed]);

  useEffect(() => {
    if (!simulate) {
      setCurrentValue(value);
    }
  }, [value, simulate]);

  const percentage = Math.min((currentValue / max) * 100, 100);

  return (
    <div
      className={cn(
        "shadow-border rounded-full w-full h-6 overflow-hidden bg-surface-secondary",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-controls-success-500 transition-all duration-300 ease-out"
        style={{
          width: `${percentage}%`,
        }}
      />
    </div>
  );
};
