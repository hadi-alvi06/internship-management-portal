import "../../styles/modal.css";
import { getInitials, attendanceClass } from "../../utils/attendanceCalculator";
import API from "../../services/api";

export default function InternDetailsModal({
    intern,
    isOpen,
    onClose,
}) {
    if (!isOpen || !intern) return null;

    const initials = getInitials(intern.name);
    const today = new Date();
    const startDate = new Date(intern.start);
    const endDate = new Date(intern.end);

    const totalDays = Math.max(
        1,
        Math.ceil(
            (endDate - startDate) /
            (1000 * 60 * 60 * 24)
        )
    );

    const completedDays = Math.max(
        0,
        Math.ceil(
            (today - startDate) /
            (1000 * 60 * 60 * 24)
        )
    );

    const progress = Math.min(
        100,
        Math.round(
            (completedDays / totalDays) * 100
        )
    );

    const daysRemaining = Math.max(
        0,
        Math.ceil(
            (endDate - today) /
            (1000 * 60 * 60 * 24)
        )
    );

    const attendanceLevel = attendanceClass(intern.attendance);

    async function handleDownloadReport() {
        try {
            const response = await API.get(`/api/interns/${intern.id}/report`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${intern.id}_Report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download report:", err);
            alert("Failed to download report.");
        }
    }

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
        >
            <div
                className="intern-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="modal-avatar">
                        {initials}
                    </div>
                    <div>
                        <h2>
                            {intern.name}
                        </h2>
                        <p>
                            {intern.id}
                        </p>
                    </div>
                </div>

                <div className="modal-section">
                    <h3>
                        Personal Information
                    </h3>
                    <div className="modal-grid">
                        <div>
                            <label>
                                Full Name
                            </label>
                            <span>
                                {intern.name}
                            </span>
                        </div>
                        <div>
                            <label>
                                Employee ID
                            </label>
                            <span>
                                {intern.id}
                            </span>
                        </div>
                        <div>
                            <label>
                                Gender
                            </label>
                            <span>
                                {intern.gender}
                            </span>
                        </div>
                        <div>
                            <label>
                                Semester
                            </label>
                            <span>
                                Semester {intern.semester}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="modal-section">
                    <h3>
                        Internship Information
                    </h3>
                    <div className="modal-grid">
                        <div>
                            <label>
                                Department
                            </label>
                            <span>
                                {intern.department}
                            </span>
                        </div>
                        <div>
                            <label>
                                Floor
                            </label>
                            <span>
                                {intern.floor}
                            </span>
                        </div>
                        <div>
                            <label>
                                Supervisor
                            </label>
                            <span>
                                {intern.supervisor}
                            </span>
                        </div>
                        <div>
                            <label>
                                Start Date
                            </label>
                            <span>
                                {intern.start}
                            </span>
                        </div>
                        <div>
                            <label>
                                End Date
                            </label>
                            <span>
                                {intern.end}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="modal-section">
                    <h3>
                        Performance
                    </h3>
                    <div className="modal-grid">
                        <div>
                            <label>
                                Attendance
                            </label>
                            <span
                                className={`attendance-badge ${attendanceLevel}`}
                            >
                                {intern.attendance}%
                            </span>
                        </div>

                        <div>
                            <label>
                                Internship Progress
                            </label>
                            <span>
                                {progress}%
                            </span>
                        </div>

                        <div>
                            <label>
                                Days Remaining
                            </label>
                            <span>
                                {daysRemaining}
                            </span>
                        </div>
                    </div>

                    <div className="progress-area">
                        <h4>
                            Internship Completion
                        </h4>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${progress}%`,
                                }}
                            ></div>
                        </div>
                        <span className="percentage">
                            {progress}% Completed
                        </span>
                    </div>
                </div>

                <div className="modal-section">
                    <h3>
                        Tasks Assigned
                    </h3>
                    <div className="task-area">
                        {(!intern.tasks || intern.tasks.length === 0) ? (
                            <p style={{ color: "#64748B" }}>No tasks assigned yet.</p>
                        ) : (
                            <ul>
                                {intern.tasks.map((task, index) => (
                                    <li key={index}>
                                        {task}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="close-btn"
                        style={{ background: "var(--amber)", marginRight: "12px" }}
                        onClick={handleDownloadReport}
                    >
                        Download Report (PDF)
                    </button>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}