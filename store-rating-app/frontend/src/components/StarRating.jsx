// StarRating.jsx
// Simple clickable 1-5 rating buttons (kept as plain numbered buttons,
// not fancy star icons, to match the "keep it simple" requirement).

function StarRating({ value, onSelect }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          className={value === num ? "rating-btn selected" : "rating-btn"}
          onClick={() => onSelect(num)}
        >
          {num}
        </button>
      ))}
    </div>
  );
}

export default StarRating;
