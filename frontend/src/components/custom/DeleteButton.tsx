"use client";

import { useFormStatus } from "react-dom";
import { Loader2, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Loader() {
  return (
    <div className="flex items-center">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );
}

interface DeleteButtonProps {
  className?: string;
}

/**
 * Este componente recibe clases, y muestra un botón tipo submit,
 * que se usa para eliminar
 * @param param0 
 * @returns 
 */
export function DeleteButton({ className }: Readonly<DeleteButtonProps>) {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={status.pending}
      disabled={status.pending}
      className={cn(className)}
    >
      {status.pending ? <Loader /> : <TrashIcon className="w-4 h-4" />}
    </Button>
  );
}
