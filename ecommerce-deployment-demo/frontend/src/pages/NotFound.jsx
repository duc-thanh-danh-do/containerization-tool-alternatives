import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaHome, FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-6xl">🔍</div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        Page Not Found
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/" className="inline-flex items-center gap-2">
            <FaHome className="h-4 w-4" />
            Go to Home
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          <FaArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
