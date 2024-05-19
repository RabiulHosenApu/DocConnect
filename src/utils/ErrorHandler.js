import { showMessage } from "react-native-flash-message";

export default function (errorCode) {
    switch (errorCode) {
        case "auth/invalid-email":
            return "Invalid e-mail address";

        case "auth/email-already-in-use":
            return "User is already registered";

        case "auth/user-not-found":
            return "User not found";

        case "auth/wrong-password":
            return "Password is invalid";

        case "auth/weak-password":
            return "Password too weak";

        case "auth/admin-restricted-operation":
            return "The form cannot be left blank";

        case "auth/missing-password":
            return "Password cannot be left blank";
        case "auth/missing-email":
            return "Email cannot be left blank";
        default:
            return errorCode;
    }
}

export function showTopMessage(messageText, messageType) {
    showMessage({
        message: messageText,
        type: messageType,
    });
}
