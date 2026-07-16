import { Component } from "react";

/**
 * A last line of defense. Without this, any error thrown during render (a bad
 * env var, a malformed API response, a null deref) unmounts the whole tree and
 * the user sees a blank white page with nothing but a console message. Here we
 * catch it and show the actual error, so "the site won't load" becomes a
 * readable, reportable message.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[app] uncaught error:", error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="grid min-h-[100dvh] place-items-center bg-bg p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-line bg-card p-7 shadow-soft">
          <h1 className="font-serif text-2xl text-ink">Something broke on load</h1>
          <p className="mt-2 text-sm text-muted">
            The app hit an error before it could start. The details are below and in the
            browser console.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-card-2 p-4 text-xs leading-relaxed text-danger">
            {String(error?.message || error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 w-full rounded-full bg-primary py-3 font-semibold text-white transition-transform active:scale-[0.98]"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
