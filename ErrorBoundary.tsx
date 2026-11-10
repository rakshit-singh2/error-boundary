import React, { Component, ReactNode } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("===== ERROR BOUNDARY =====");
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
        console.error(
            "Component Stack:",
            errorInfo.componentStack
        );

        /**
         * Send error to monitoring service
         *
         * Example:
         * Sentry.captureException(error, {
         *     extra: errorInfo,
         * });
         */

        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <Text style={styles.title}>
                        Something went wrong
                    </Text>

                    <Text style={styles.subtitle}>
                        The application encountered an unexpected error.
                    </Text>


                    {__DEV__ && this.state.error && (
                        <ScrollView
                            style={styles.errorBox}
                        >
                            <Text style={styles.errorText}>
                                {this.state.error.message}
                            </Text>

                            <Text style={styles.stackText}>
                                {this.state.error.stack}
                            </Text>
                        </ScrollView>
                    )}


                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.handleRetry}
                    >
                        <Text style={styles.buttonText}>
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 10,
    },

    subtitle: {
        fontSize: 15,
        textAlign: "center",
        marginBottom: 20,
    },

    errorBox: {
        maxHeight: 200,
        width: "100%",
        padding: 10,
        marginBottom: 20,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
    },

    errorText: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
    },

    stackText: {
        fontSize: 12,
    },

    button: {
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#222",
    },

    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
});

export default ErrorBoundary;