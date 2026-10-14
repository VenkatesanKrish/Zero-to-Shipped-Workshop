import { useRef, useState } from "react";

/** The upload panel: dropzone, job description, analyse button.
 *
 *  Two inputs feed one action, so the button is disabled until both are
 *  present. That is clearer than letting someone submit and bouncing them
 *  with an error afterwards. */
export default function Uploader({
  onSelectFile,
  onAnalyze,
  jobDescription,
  onJobDescriptionChange,
  status,
  statusKind,
  file,
  onReset,
  busy,
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const openPicker = () => inputRef.current?.click();

  const handleDrop = (event) => {
    // preventDefault on drop is required, or the browser navigates away
    // to the PDF instead of letting us read it.
    event.preventDefault();
    setDragging(false);
    onSelectFile(event.dataTransfer.files?.[0]);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const ready = Boolean(file) && jobDescription.trim().length >= 30;

  return (
    <div className="panel" id="uploader">
      <div className="panel-head">
        <h2>Match your resume to a job</h2>
        <span className="badge">PDF · max 5 MB</span>
      </div>

      <div
        className={`dropzone${dragging ? " is-dragging" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Choose a PDF resume to analyse"
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
          accept="application/pdf,.pdf"
          hidden
          onChange={(e) => onSelectFile(e.target.files?.[0])}
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

      <label className="jd-field">
        <span className="jd-label">
          Job description
          <span className="jd-hint">paste the posting you are targeting</span>
        </span>
        <textarea
          className="jd-input"
          rows={6}
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the full job description here — responsibilities, requirements, the lot."
        />
      </label>

      <button
        className="analyse-btn"
        type="button"
        onClick={onAnalyze}
        disabled={!ready || busy}
      >
        {busy ? "Analysing…" : "Analyse match"}
      </button>

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
        Your resume is parsed on the server and never shared with third parties.
      </p>
    </div>
  );
}
