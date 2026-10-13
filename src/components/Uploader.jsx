import { useRef, useState } from "react";

/** The upload panel: dropzone, file picker, status line.
 *
 *  All the drag-and-drop plumbing lives here and nowhere else. The parent
 *  only ever hears about it through `onFile(file)`. */
export default function Uploader({ onFile, status, statusKind, file, onReset, busy }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const openPicker = () => inputRef.current?.click();

  const handleDrop = (event) => {
    // preventDefault on drop is required, or the browser navigates away
    // to the PDF instead of letting us read it.
    event.preventDefault();
    setDragging(false);
    onFile(event.dataTransfer.files?.[0]);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  return (
    <div className="panel" id="uploader">
      <div className="panel-head">
        <h2>Upload your resume</h2>
        <span className="badge">PDF · max 5 MB</span>
      </div>

      <div
        className={`dropzone${dragging ? " is-dragging" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Choose a PDF resume to analyse"
        aria-busy={busy}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
      >
        <svg
          className="dz-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        <p className="dz-title">Drag your resume here</p>
        <p className="dz-sub">
          or <span className="dz-link">browse files</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf,.txt"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      {file && (
        <p className="file-row">
          <span className="file-name">
            {file.name} · {Math.round(file.size / 1024)} KB
          </span>
          <button className="link-btn" type="button" onClick={onReset}>
            Remove
          </button>
        </p>
      )}

      <p className={`status ${statusKind}`.trim()} role="status" aria-live="polite">
        {status}
      </p>

      <p className="privacy">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        Client-side only — your file never leaves this page.
      </p>
    </div>
  );
}
