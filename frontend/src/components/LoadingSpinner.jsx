export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-page">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
}
