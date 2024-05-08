"use client";

import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { generateSummaryService } from "@/data/services/summary-service";

interface StrapiErrorsProps {
    message: string | null;
    name: string;
}

const INITIAL_STATE = {
    message: null,
    name: "",
};

export function SummaryForm() {
    // * Controla si está cargando o no
    const [loading, setLoading] = useState(false);
    // * Controla los erreos de strapi
    const [error, setError] = useState<StrapiErrorsProps>(INITIAL_STATE);
    // * establece el valor del input
    const [value, setValue] = useState<string>("");

    /**
     * Recibe el evento del form y controla el envío del formulario
     * @param event 
     */
    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        // * Crea una instancia de formData y le envía el currentTarget del evento
        const formData = new FormData(event.currentTarget);
        // * Extrae el videoId como string
        const videoId = formData.get("videoId") as string;

        // * consume el servicio generateSummaryService y le manda el videoId
        const summaryReponseData = await generateSummaryService(videoId);
        console.log("🚀 ~ handleFormSubmit ~ summaryReponseData:", summaryReponseData)

        toast.success("Summary Created");
        setLoading(false);
    }

    function clearError() {
        setError(INITIAL_STATE);
        if (error.message) setValue("");
    }

    const errorStyles = error.message
        ? "outline-1 outline outline-red-500 placeholder:text-red-700"
        : "";

    return (
        <div className="w-full max-w-[960px]">
            <form
                onSubmit={handleFormSubmit}
                className="flex gap-2 items-center justify-center"
            >
                <Input
                    name="videoId"
                    placeholder={
                        error.message ? error.message : "Youtube Video ID or URL"
                    }
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onMouseDown={clearError}
                    className={cn(
                        "w-full focus:text-black focus-visible:ring-pink-500",
                        errorStyles
                    )}
                    required
                />

                <SubmitButton
                    text="Create Summary"
                    loadingText="Creating Summary"
                    loading={loading}
                />
            </form>
        </div>
    );
}