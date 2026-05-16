import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    window.location.href = "https://replit.com/login";
  }, []);
  return null;
}
