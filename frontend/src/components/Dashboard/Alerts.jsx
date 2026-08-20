import "../../styles/listpanel.css";

export default function Alerts({ alerts }) {
  return (
    <div className="panel">
      <h3>Low Attendance Alerts</h3>

      {alerts.length === 0 ? (
        <p style={{ color: "#64748B" }}>No low-attendance alerts. 🎉</p>
      ) : (
        alerts.map((intern) => (
          <div className="panel-item alert" key={intern.Employee_ID}>
            <div>
              <h4>{intern.Full_Name}</h4>
              <p>Attendance Below 75%</p>
            </div>

            <strong>{intern.Attendance_Percentage}%</strong>
          </div>
        ))
      )}
    </div>
  );
}