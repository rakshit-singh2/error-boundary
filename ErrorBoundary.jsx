import { isRouteErrorResponse, useRouteError } from "react-router";
import { useState } from "react";

export default function ErrorBoundary() {
    const error = useRouteError();
    const [copied, setCopied] = useState(false);

    let title = "Application Error";
    let message = "";
    let stack = "";

    if (isRouteErrorResponse(error)) {
        title = `${error.status} ${error.statusText}`;

        if (typeof error.data === "string") {
            message = error.data;
        } else {
            message = JSON.stringify(error.data, null, 2);
        }
    } else if (error instanceof Error) {
        title = error.name || "Error";
        message = error.message;
        stack = error.stack || "";
    } else {
        message = String(error);
    }

    const fullError = `${title}

${message}

${stack}`;

    async function copy() {
        await navigator.clipboard.writeText(fullError);
        setCopied(true);

        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="min-h-screen bg-[#111827] text-gray-100 p-10 font-mono">
            <div className="max-w-6xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-red-400">
                        {title}
                    </h1>

                    <p className="mt-3 text-gray-400">
                        An uncaught exception interrupted rendering.
                    </p>
                </div>

                <div className="rounded-lg border border-red-700 bg-[#1F2937] p-5">
                    <div className="text-sm uppercase text-red-300 mb-2">
                        Message
                    </div>

                    <pre className="whitespace-pre-wrap break-words text-red-200">
                        {message}
                    </pre>
                </div>

                {stack && (
                    <div className="mt-6 rounded-lg border border-gray-700 bg-black overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
                            <span className="font-semibold">
                                Stack Trace
                            </span>

                            <button
                                onClick={copy}
                                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700"
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>

                        <pre className="overflow-auto p-4 text-sm text-green-300">
                            {stack}
                        </pre>
                    </div>
                )}

                <div className="mt-8 flex gap-3">

                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2 rounded bg-red-600 hover:bg-red-700"
                    >
                        Reload
                    </button>

                    <button
                        onClick={() => history.back()}
                        className="px-5 py-2 rounded bg-gray-700 hover:bg-gray-600"
                    >
                        Go Back
                    </button>
                </div>

            </div>
        </div>
    );
}