import useCountdown from "../hooks/useCountdown";

function CountdownTimer({ targetDate }) {
  const timeLeft = useCountdown(targetDate);

  if (!timeLeft) {
    return (
      <span className="text-xs text-red-400 font-semibold">
        Deal Expired
      </span>
    );
  }

  const format = (num) => String(num).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 text-xs font-semibold text-yellow-400">

      <span>{format(timeLeft.hours)}</span>:
      <span>{format(timeLeft.minutes)}</span>:
      <span>{format(timeLeft.seconds)}</span>

    </div>
  );
}

export default CountdownTimer;