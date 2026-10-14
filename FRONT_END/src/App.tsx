import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./App.css";
import { Button, Checkbox, showToast, TextInput } from "./components/common";

function App() {
  return (
    <div
      style={{
        gap: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FontAwesomeIcon icon={"cloud-rain"} />
      <Checkbox label="Checkbox" />
      <TextInput label="Text Input" value={"test"} />
      <Button variant="outline" size="md" fullWidth={true}>
        <span>Button</span>
      </Button>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Button variant="primary">Primary</Button>
        <Button variant="success">Success</Button>
        <Button variant="error">Error</Button>
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Button onClick={() => showToast("Đã lưu thành công.", "success")}>
          Toast success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            showToast("Vui lòng kiểm tra lại thông tin.", "warning")
          }
        >
          Toast warning
        </Button>
        <Button
          variant="ghost"
          onClick={() => showToast("Không thể hoàn tất thao tác.", "error")}
        >
          Toast error
        </Button>
      </div>
    </div>
  );
}

export default App;
