import {AlertSeverity} from "@/src/types/alertComponent";

export interface AlertData {
    message: string;
    severity: AlertSeverity;
}

export interface AlertContextType {
    alert: AlertData | null;
    showAlert: (message: string, severity?: AlertSeverity) => void;
}