import { logoutAction } from "@/data/actions/auth-actions";
import { LogOut } from "lucide-react";

/**
 * Este componente contiene un botón con el type submit
 * el cuál ejecuta la acción "logoutAction" para desloguearse.
 * @returns 
 */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit">
        <LogOut className="w-6 h-6 hover:text-primary" />
      </button>
    </form>
  );
}