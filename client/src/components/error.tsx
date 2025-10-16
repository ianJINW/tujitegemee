import React from "react";

interface ErrorMessageProps {
  title?: string;
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title = "Error", message }) => (
  <div role="alert" aria-live="assertive" className="p-6 text-red-600">
    <h3 className="text-xl font-semibold">{title}</h3>
    <p>{message}</p>
  </div>
);

export default ErrorMessage;
 