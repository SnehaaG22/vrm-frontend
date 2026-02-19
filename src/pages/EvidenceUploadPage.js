import React, { useState, useEffect } from "react";
import { evidenceService } from "../services";
import { useAuth } from "../context/AuthContext";
import "../styles/pages.css";

/**
 * EVIDENCE UPLOAD PAGE
 *
 * API Flow:
 * 1. User selects assessment and question
 * 2. User uploads file (to MinIO, get presigned URL)
 * 3. POST /evidence/upload/ with:
 *    {
 *      assessment_id: 10,
 *      question_id: 42,
 *      file_url: "https://minio.../file.pdf",
 *      expiry_date: "2026-12-31",
 *      file_type: "pdf",
 *      org_id: 101,
 *      uploaded_by: 5
 *    }
 * 4. Show success message and add to list
 *
 * Headers:
 * - Authorization: Bearer <token>
 * - org-id: <org_id>
 */
const EvidenceUploadPage = () => {
  const { user, orgId } = useAuth();
  const [assessmentId, setAssessmentId] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [evidenceList, setEvidenceList] = useState([]);
  const [showList, setShowList] = useState(false);

  // Load evidence list for current assessment
  useEffect(() => {
    if (assessmentId && showList) {
      fetchEvidenceList();
    }
  }, [assessmentId, showList]);

  const fetchEvidenceList = async () => {
    try {
      const response =
        await evidenceService.getEvidenceByAssessment(assessmentId);
      setEvidenceList(response.data.results);
    } catch (err) {
      console.error("Failed to load evidence list:", err);
    }
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // In a real app, you would:
    // 1. Upload file to MinIO manually
    // 2. Get presigned URL back
    // For this demo, we'll simulate it
    const simulatedUrl = `https://minio.example.com/org_${orgId}/assessment_${assessmentId}/question_${questionId}/${selectedFile.name}`;
    setFileUrl(simulatedUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!assessmentId) {
      setError("Assessment ID is required");
      return;
    }
    if (!questionId) {
      setError("Question ID is required");
      return;
    }
    if (!expiryDate) {
      setError("Expiry date is required");
      return;
    }
    if (!fileUrl) {
      setError("File URL is required (upload file first)");
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError("Expiry date cannot be in the past");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        assessment_id: parseInt(assessmentId),
        question_id: parseInt(questionId),
        file_url: fileUrl,
        expiry_date: expiryDate,
        file_type: file?.name?.split(".")?.pop()?.toLowerCase() || "pdf",
        org_id: parseInt(orgId || 101),
        uploaded_by: user?.id || 5,
      };

      await evidenceService.uploadEvidence(payload);

      setSuccess("Evidence uploaded successfully! Notification sent to team.");

      // Reset form
      setAssessmentId("");
      setQuestionId("");
      setExpiryDate("");
      setFile(null);
      setFileUrl("");

      // Refresh list
      if (showList) {
        fetchEvidenceList();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Upload failed";
      setError(errorMsg);
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryWarning = (expiresInDays) => {
    const warning = evidenceService.getExpiryWarning(expiresInDays);
    return warning;
  };

  return (
    <div className="evidence-container">
      <h1>Upload Evidence</h1>

      <div className="evidence-content">
        {/* Upload Form */}
        <div className="evidence-form-section">
          <h2>New Evidence Upload</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="evidence-form">
            <div className="form-group">
              <label htmlFor="assessment">Assessment ID: *</label>
              <input
                id="assessment"
                type="number"
                value={assessmentId}
                onChange={(e) => setAssessmentId(e.target.value)}
                placeholder="e.g., 10"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="question">Question ID: *</label>
              <input
                id="question"
                type="number"
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
                placeholder="e.g., 42"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="expiry">Expiry Date: *</label>
              <input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                disabled={loading}
              />
              <small>Must be a future date (YYYY-MM-DD)</small>
            </div>

            <div className="form-group">
              <label htmlFor="file">Upload File: *</label>
              <input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.xlsx,.jpg,.png,.docx,.doc"
                disabled={loading}
              />
              <small>Accepted: PDF, Excel, Images, Word docs</small>
              {file && <p className="file-selected">✓ {file.name}</p>}
            </div>

            {fileUrl && (
              <div className="form-group">
                <label>File URL:</label>
                <input
                  type="text"
                  value={fileUrl}
                  readOnly
                  className="readonly"
                />
                <small>This will be sent to backend</small>
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Uploading..." : "Upload Evidence"}
            </button>
          </form>
        </div>

        {/* Evidence List */}
        <div className="evidence-list-section">
          <div className="list-header">
            <h2>Evidence History</h2>
            <button
              className="toggle-btn"
              onClick={() => setShowList(!showList)}
            >
              {showList ? "Hide" : "Show"} List
            </button>
          </div>

          {showList && (
            <>
              {evidenceList.length === 0 ? (
                <p className="empty">
                  {assessmentId
                    ? "No evidence uploaded yet for this assessment"
                    : "Enter assessment ID to view evidence"}
                </p>
              ) : (
                <div className="evidence-items">
                  {evidenceList.map((item) => {
                    const warning = getExpiryWarning(item.expires_in_days);
                    return (
                      <div
                        key={item.id}
                        className={`evidence-item ${warning.level}`}
                      >
                        <div className="evidence-info">
                          <p>
                            <strong>Question {item.question_id}</strong>
                          </p>
                          <p className="file-name">
                            {item.file_url?.split("/").pop()}
                          </p>
                          <p className={`expiry-status ${warning.level}`}>
                            {warning.message}
                          </p>
                          <small>
                            Uploaded:{" "}
                            {new Date(item.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploadPage;
