// Clickable star rating. If "readOnly" is true, it just displays the value.
export default function StarRating({ value, onChange, readOnly = false, size = 24 }) {
  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onChange?.(star)}
          style={{
            cursor: readOnly ? "default" : "pointer",
            fontSize: size,
            color: star <= value ? "#f59e0b" : "#d1d5db",
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
